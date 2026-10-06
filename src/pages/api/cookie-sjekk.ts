/**
 * POST /api/cookie-sjekk  { url: string }
 * GET  /api/cookie-sjekk?url=…
 *
 * Laster siden i en ekte nettleser med ren profil og rapporterer alt som ble
 * satt uten at noen klikket. Selve skanningen skjer i services/skanner, som er
 * en egen Fly-app – se docs/skanner.md.
 *
 * Svarer alltid med JSON. Feil kommer som { feil: "<setning til brukeren>" }.
 */
import type { APIRoute } from "astro";
import { normaliserUrl, erTillattVert, formaterDato } from "../../lib/sjekk";
import { skannCookies, cookieStatus, forklarFeil } from "../../lib/skanner";

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

  const { resultat, feil, melding } = await skannCookies(url.href);
  if (!resultat) {
    // 503 og ikke 500: dette er en tjeneste som ikke svarte, ikke en feil i koden.
    return svar({ feil: forklarFeil(feil!, melding) }, feil === "avvist" ? 400 : 503);
  }

  const tredjepart = resultat.cookies.filter((c) => !c.forstepart);
  const status = cookieStatus(resultat);

  return svar({
    url: resultat.url,
    dato: formaterDato(new Date()),
    status,
    antallCookies: resultat.cookies.length,
    antallTredjepart: tredjepart.length,
    cookies: resultat.cookies,
    lagring: resultat.lagring,
    sporere: resultat.sporere,
    ukjenteTredjeparter: resultat.ukjenteTredjeparter,
    sekunder: Math.round(resultat.millisekunder / 100) / 10,
    oppsummering: oppsummer(status, resultat.sporere.length, resultat.cookies.length, tredjepart.length),
    forbehold: [
      "Skanningen laster forsiden én gang med tom nettleserprofil, og klikker ikke på noe. Alt som er satt i det øyeblikket, er satt uten samtykke.",
      "Ekomloven § 3-15 unntar informasjonskapsler som er strengt nødvendige for tjenesten. Hva som er strengt nødvendig kan ingen maskin avgjøre – det må vurderes for hver enkelt cookie.",
      "Dette er en teknisk observasjon, ikke en juridisk vurdering, og ikke juridisk rådgivning.",
      "Cookies som settes først etter at brukeren har klikket seg videre på siden, fanges ikke opp.",
    ],
  });
}

function oppsummer(
  status: string,
  sporere: number,
  cookies: number,
  tredjepart: number,
): string {
  if (status === "ok") {
    return "Ingenting ble satt før samtykke. Da trenger siden strengt tatt ikke banner.";
  }
  if (sporere > 0) {
    return `${sporere} ${sporere === 1 ? "sporingstjeneste" : "sporingstjenester"} lastet før noen hadde sagt ja. Sporing krever samtykke etter ekomloven § 3-15.`;
  }
  if (tredjepart > 0) {
    return `${tredjepart} ${tredjepart === 1 ? "cookie" : "cookies"} fra andre domener ble satt før samtykke. De er sjelden strengt nødvendige.`;
  }
  return `${cookies} ${cookies === 1 ? "cookie" : "cookies"} fra siden selv ble satt ved første besøk. Er de strengt nødvendige for driften, er det lov – ellers må de vente på samtykke.`;
}

export const POST: APIRoute = async ({ request }) => {
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
