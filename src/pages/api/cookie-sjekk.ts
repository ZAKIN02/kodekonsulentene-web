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
import { erEgetOpphav } from "../../lib/opphav";
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
  const samtykke = resultat.samtykke;

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
    /* Samtykkedeteksjonen. Se services/skanner/samtykke.mjs. */
    samtykkelosninger: samtykke?.losninger ?? [],
    consentMode: samtykke?.consentMode ?? null,
    tcf: samtykke?.tcf ?? false,
    /** Hva vi målte. Hver linje skal kunne etterprøves. */
    grunnlag: samtykke?.grunnlag ?? [],
    /** Hva maskinen ikke kunne avgjøre. Vises alltid. */
    uavklart: samtykke?.uavklart ?? [],
    klassifisering: samtykke?.cookies ?? null,
    oppsummering: samtykke
      ? samtykke.oppsummering
      : oppsummerUtenSamtykkedata(resultat.sporere.length, resultat.cookies.length),
    forbehold: [
      "Skanningen laster forsiden én gang med tom nettleserprofil, og klikker ikke på noe. Alt som er lagret i det øyeblikket, er lagret uten samtykke.",
      // Dette forbeholdet er grunnen til at «sporingsverktøy lastet» ikke lenger
      // er nok til å melde brudd: § 3-15 gjelder lagring i kommunikasjonsutstyret, og
      // Google Consent Mode laster skriptet uten å lagre noe. Målt 7. oktober
      // 2026 på norske nettsteder som lastet Google Tag Manager og satte null
      // sporingscookies – de fikk «brudd» av den gamle logikken.
      "At et sporingsskript lastes er ikke i seg selv lagring i kommunikasjonsutstyret. Vi skiller derfor mellom hva som ble lastet og hva som faktisk ble lagret.",
      "Ekomloven § 3-15 unntar lagring som er strengt nødvendig for tjenesten. Hva som er strengt nødvendig kan ingen maskin avgjøre – det må vurderes for hver enkelt cookie.",
      "Dette er en teknisk observasjon, ikke en juridisk vurdering, og ikke juridisk rådgivning.",
      "Cookies som settes først etter at brukeren har klikket seg videre på siden, eller har svart i banneret, fanges ikke opp.",
    ],
  });
}

/**
 * Reservetekst for en skanner uten samtykkedeteksjon.
 *
 * Den sier bevisst mindre enn den gamle teksten gjorde. Den gamle skrev «Sporing
 * krever samtykke etter ekomloven § 3-15» så snart et sporingsdomene var
 * kontaktet – også for sider som sperret sporingen med Consent Mode og lagret
 * ingenting. Uten samtykkesignaler fra skanneren har vi ikke grunnlag for mer
 * enn dette.
 */
function oppsummerUtenSamtykkedata(sporere: number, cookies: number): string {
  if (sporere > 0) {
    return `${sporere} ${sporere === 1 ? "sporingsverktøy" : "sporingsverktøy"} ble lastet. Denne skanningen målte ikke om sporingen var sperret før samtykke, så funnet kan ikke avgjøres her.`;
  }
  if (cookies > 0) {
    return `${cookies} ${cookies === 1 ? "cookie" : "cookies"} ble satt ved første besøk. Er de strengt nødvendige for driften, er det lov – ellers må de vente på samtykke.`;
  }
  return "Ingenting ble lagret før samtykke. Da trenger siden strengt tatt ikke banner.";
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
