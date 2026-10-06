/**
 * POST /api/uu-sjekk  { url: string }
 * GET  /api/uu-sjekk?url=…
 *
 * Kjører axe-core mot siden i en ekte nettleser, begrenset til WCAG 2.0 nivå A
 * og AA – de 35 kravene som gjelder private virksomheter i Norge.
 *
 * axe-core finner bare en del av kravene. Det står i hvert eneste svar, fordi
 * «ingen feil funnet» ikke betyr «oppfyller kravene».
 */
import type { APIRoute } from "astro";
import { erEgetOpphav } from "../../lib/opphav";
import { normaliserUrl, erTillattVert, formaterDato } from "../../lib/sjekk";
import { skannUu, uuStatus, forklarFeil } from "../../lib/skanner";

export const prerender = false;

const svar = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? "public, max-age=60" : "no-store",
    },
  });

async function kjor(raaUrl: string) {
  let url: URL;
  try {
    url = normaliserUrl(raaUrl);
  } catch (e) {
    return svar({ feil: e instanceof Error ? e.message : "Ugyldig adresse." }, 400);
  }
  if (!erTillattVert(url)) {
    return svar({ feil: "Den adressen kan ikke sjekkes." }, 400);
  }

  const { resultat, feil, melding } = await skannUu(url.href);
  if (!resultat) {
    return svar({ feil: forklarFeil(feil!, melding) }, feil === "avvist" ? 400 : 503);
  }

  const status = uuStatus(resultat);
  const alvorlige = resultat.brudd.filter(
    (b) => b.alvorlighet === "critical" || b.alvorlighet === "serious",
  ).length;

  return svar({
    url: resultat.url,
    dato: formaterDato(new Date()),
    status,
    antallBrudd: resultat.antallBrudd,
    antallRegler: resultat.antallRegler,
    antallAlvorlige: alvorlige,
    brudd: resultat.brudd,
    måSjekkesManuelt: resultat.måSjekkesManuelt,
    sekunder: Math.round(resultat.millisekunder / 100) / 10,
    oppsummering:
      resultat.antallBrudd === 0
        ? "Ingen av bruddene axe-core kan finne maskinelt. Det er en god start, men det er ikke det samme som at kravene er oppfylt."
        : `${resultat.antallBrudd} ${resultat.antallBrudd === 1 ? "forekomst" : "forekomster"} fordelt på ${resultat.antallRegler} ${resultat.antallRegler === 1 ? "regel" : "regler"}. ${alvorlige > 0 ? `${alvorlige} av dem er alvorlige.` : "Ingen av dem er alvorlige."}`,
    forbehold: [
      "Private virksomheter skal oppfylle 35 krav i WCAG 2.0 nivå A og AA. Automatiske tester kan bare avgjøre en del av dem.",
      "Dette må testes manuelt og er ikke vurdert her: om tastaturrekkefølgen gir mening, om skjermleseren leser innholdet i riktig rekkefølge, om alt-tekster faktisk beskriver bildet, om video har teksting, og om språket i innholdet er forståelig.",
      "Kontrast måles bare på tekst mot ensfarget bakgrunn. Tekst over bilder og gradienter må måles for hånd.",
      "En side uten funn her kan fortsatt bryte kravene. Dette er ikke juridisk rådgivning.",
    ],
  });
}

export const POST: APIRoute = async ({ request }) => {
  // CSRF: se src/lib/opphav.ts. Astros egen kontroll kan ikke virke bak proxyen.
  if (!erEgetOpphav(request)) {
    return new Response("Forespørselen kom fra et annet nettsted.", { status: 403 });
  }

  let kropp: { url?: unknown } = {};
  try {
    kropp = (await request.json()) as typeof kropp;
  } catch {
    return svar({ feil: "Forventet JSON." }, 400);
  }
  if (typeof kropp.url !== "string") return svar({ feil: "Skriv inn en nettadresse." }, 400);
  return kjor(kropp.url);
};

export const GET: APIRoute = async ({ url }) => {
  const u = url.searchParams.get("url");
  if (!u) return svar({ feil: "Mangler ?url=" }, 400);
  return kjor(u);
};
