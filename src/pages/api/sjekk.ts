/**
 * POST /api/sjekk  { url: string, epost?: string }
 * GET  /api/sjekk?url=…        (samme svar – praktisk til feilsøking og curl)
 *
 * Svarer alltid med JSON. Feil kommer som { feil: "<setning til brukeren>" } og
 * en passende statuskode, aldri som en stack trace.
 */
import type { APIRoute } from "astro";
import { erEgetOpphav } from "../../lib/opphav";
import {
  normaliserUrl, analyserHeadere, analyserCookies, analyserUu, analyserLovpaalagt,
  analyserYtelseLokalt, byggRapport, formaterDato,
} from "../../lib/sjekk";
import { hentSide, hentPageSpeed, hentForetak } from "../../lib/hent";
import { hentEnv } from "../../lib/env";
import { sendRapport } from "../../lib/epost";

export const prerender = false;

const svar = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Rapporten er fersk per kall, men Cloudflare kan dele samme URL i et minutt.
      "cache-control": status === 200 ? "public, max-age=60" : "no-store",
    },
  });

async function kjor(raaUrl: string, epost: string | undefined) {
  let url: URL;
  try {
    url = normaliserUrl(raaUrl);
  } catch (e) {
    return svar({ feil: e instanceof Error ? e.message : "Ugyldig adresse." }, 400);
  }

  let hentet;
  try {
    hentet = await hentSide(url);
  } catch (e) {
    const melding = e instanceof Error ? e.message : "Klarte ikke å hente siden.";
    const tidsavbrudd = /timed? ?out|aborted/i.test(melding);
    return svar({ feil: tidsavbrudd ? "Siden svarte ikke innen 12 sekunder." : melding }, 422);
  }

  const nokkel = hentEnv("PAGESPEED_API_KEY");
  const ps = nokkel ? await hentPageSpeed(hentet.url, nokkel) : { score: null, lcp: null };

  const ytelse = analyserYtelseLokalt(hentet.html, hentet.bytes, hentet.ttfb);
  ytelse.score = ps.score;
  ytelse.lcp = ps.lcp;

  // Org.nr. verifiseres mot Enhetsregisteret. PageSpeed og oppslaget er uavhengige,
  // så de går parallelt – oppslaget skal ikke legge sekunder på sjekken.
  const lov = analyserLovpaalagt(hentet.html);
  const foretak = lov.orgnr ? await hentForetak(lov.orgnr) : null;
  lov.foretak = foretak;
  lov.oppslagKjort = Boolean(lov.orgnr);
  if (lov.orgnr && !foretak) {
    lov.detaljer.push(`Organisasjonsnummeret ${lov.orgnr} står ikke i Enhetsregisteret.`);
  }

  const rapport = byggRapport({
    url: hentet.url.host + (hentet.url.pathname === "/" ? "" : hentet.url.pathname),
    dato: formaterDato(new Date()),
    ytelse,
    headere: analyserHeadere(hentet.headers),
    cookies: analyserCookies(hentet.headers, hentet.html),
    uu: analyserUu(hentet.html),
    lov,
  });

  let sendt = false;
  const resendNokkel = hentEnv("RESEND_API_KEY");
  if (epost && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(epost) && resendNokkel) {
    sendt = await sendRapport(epost, rapport, {
      apiKey: resendNokkel,
      fra: hentEnv("RAPPORT_FRA") ?? "rapport@kodekonsulentene.no",
      kopi: hentEnv("RAPPORT_KOPI"),
    });
  }

  return svar({ ...rapport, sendt });
}

export const POST: APIRoute = async ({ request }) => {
  // CSRF: se src/lib/opphav.ts. Astros egen kontroll kan ikke virke bak proxyen.
  if (!erEgetOpphav(request)) {
    return new Response("Forespørselen kom fra et annet nettsted.", { status: 403 });
  }

  let kropp: { url?: unknown; epost?: unknown } = {};
  try {
    kropp = (await request.json()) as typeof kropp;
  } catch {
    return svar({ feil: "Forventet JSON." }, 400);
  }
  if (typeof kropp.url !== "string") return svar({ feil: "Skriv inn en nettadresse." }, 400);
  return kjor(kropp.url, typeof kropp.epost === "string" ? kropp.epost : undefined);
};

export const GET: APIRoute = async ({ url }) => {
  const u = url.searchParams.get("url");
  if (!u) return svar({ feil: "Mangler ?url=" }, 400);
  return kjor(u, url.searchParams.get("epost") ?? undefined);
};
