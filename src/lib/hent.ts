/**
 * Henting av en fremmed nettside. Egen fil fordi her ligger all risikoen:
 * omdirigeringer, tidsavbrudd, størrelse og SSRF.
 */
import { erTillattVert } from "./sjekk";

export interface Hentet {
  url: URL;
  status: number;
  headers: Headers;
  html: string;
  bytes: number;
  ttfb: number;
  hopp: number;
}

const MAKS_BYTES = 2_000_000;
const MAKS_HOPP = 4;
const TIDSAVBRUDD_MS = 12_000;
const UA = "KodeKonsulentene-Nettsidesjekk/1.0 (+https://kodekonsulentene.no/sjekk)";

export async function hentSide(start: URL): Promise<Hentet> {
  let url = start;
  let hopp = 0;
  const t0 = Date.now();

  for (;;) {
    if (!erTillattVert(url)) throw new Error("Den adressen kan ikke sjekkes.");

    const svar = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIDSAVBRUDD_MS),
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml", "accept-language": "nb,no,en" },
    });

    if ([301, 302, 303, 307, 308].includes(svar.status)) {
      const neste = svar.headers.get("location");
      if (!neste) throw new Error("Siden omdirigerer uten å si hvor.");
      if (++hopp > MAKS_HOPP) throw new Error("Siden omdirigerer for mange ganger.");
      url = new URL(neste, url);
      continue;
    }

    const ttfb = Date.now() - t0;
    const type = svar.headers.get("content-type") ?? "";
    if (svar.status >= 400) {
      throw new Error(`Siden svarte ${svar.status}. Sjekk at adressen er riktig.`);
    }
    if (type && !/text\/html|application\/xhtml/i.test(type)) {
      throw new Error("Adressen peker ikke på en nettside.");
    }

    const html = await lesBegrenset(svar);
    return { url, status: svar.status, headers: svar.headers, html, bytes: html.length, ttfb, hopp };
  }
}

async function lesBegrenset(svar: Response): Promise<string> {
  const leser = svar.body?.getReader();
  if (!leser) return "";
  const biter: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    biter.push(value);
    if (total >= MAKS_BYTES) { await leser.cancel(); break; }
  }
  const samlet = new Uint8Array(total);
  let i = 0;
  for (const b of biter) { samlet.set(b, i); i += b.byteLength; }
  return new TextDecoder("utf-8", { fatal: false }).decode(samlet);
}

export interface PageSpeed { score: number | null; lcp: number | null }

/** Lighthouse via PageSpeed Insights, mobil. Feiler stille – rapporten går uten. */
export async function hentPageSpeed(url: URL, nokkel: string): Promise<PageSpeed> {
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", url.href);
  api.searchParams.set("strategy", "mobile");
  api.searchParams.set("category", "performance");
  api.searchParams.set("key", nokkel);

  try {
    const svar = await fetch(api, { signal: AbortSignal.timeout(25_000) });
    if (!svar.ok) return { score: null, lcp: null };
    const data = (await svar.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: { "largest-contentful-paint"?: { numericValue?: number } };
      };
    };
    const rå = data.lighthouseResult?.categories?.performance?.score;
    const lcp = data.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue;
    return {
      score: typeof rå === "number" ? Math.round(rå * 100) : null,
      lcp: typeof lcp === "number" ? Math.round(lcp) : null,
    };
  } catch {
    return { score: null, lcp: null };
  }
}

export interface Foretak {
  orgnr: string;
  navn: string;
  form: string;
  slettet: boolean;
}

/**
 * Slår opp et organisasjonsnummer i Enhetsregisteret.
 *
 * Mod 11-kontrollen sier bare at sifrene henger sammen – den sier ikke at
 * foretaket finnes. (Den slapp i sin tid gjennom «000000000» på vår egen side.)
 * Dette oppslaget svarer på det mod 11 ikke kan: finnes foretaket, hva heter det,
 * og er det slettet.
 *
 * API-et er åpent og krever ingen nøkkel. Feiler stille: en sjekk skal ikke
 * stoppe fordi Brønnøysund er nede, den skal bare si mindre.
 */
export async function hentForetak(orgnr: string): Promise<Foretak | null> {
  const nr = orgnr.replace(/\D/g, "");
  if (nr.length !== 9) return null;
  try {
    const svar = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${nr}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!svar.ok) return null;
    const d = (await svar.json()) as {
      organisasjonsnummer?: string;
      navn?: string;
      organisasjonsform?: { kode?: string };
      slettedato?: string;
    };
    if (!d.organisasjonsnummer || !d.navn) return null;
    return {
      orgnr: d.organisasjonsnummer,
      navn: d.navn,
      form: d.organisasjonsform?.kode ?? "",
      slettet: Boolean(d.slettedato),
    };
  } catch {
    return null;
  }
}
