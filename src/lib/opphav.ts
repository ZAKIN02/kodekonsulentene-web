/**
 * CSRF-kontroll som virker bak en proxy.
 *
 * Astros egen `checkOrigin` sammenligner `Origin` mot forespørselens EGEN URL.
 * Bak Fly snakker Node over http på en intern port, så Astro regner origin som
 * `http://…` mens nettleseren sender `https://kodekonsulentene.no`. Resultatet var
 * 403 «Cross-site POST form submissions are forbidden» på hver eneste innsending –
 * kontaktskjemaet var dødt i produksjon. `x-forwarded-proto` blir ikke tatt hensyn
 * til av adapteren, så vernet måtte flyttes hit der vi kjenner vårt eget domene.
 */
// Endelsen må stå: node --test kjører denne fila direkte og løser ikke stien uten.
import { firma } from "../data/firma.ts";

const TILLATT = new Set<string>([firma.url, firma.url.replace("https://", "https://www.")]);

/** Sant hvis forespørselen kommer fra oss selv, eller fra en lokal utviklingstjener. */
export function erEgetOpphav(request: Request): boolean {
  const opphav = request.headers.get("origin") ?? hentOpphavFraReferer(request);
  // Ingen Origin: en vanlig skjema-innsending uten JavaScript fra samme side
  // sender ikke alltid headeren. Da faller vi tilbake på Referer, og mangler
  // begge, godtar vi – ellers blokkerer vi folk uten JavaScript.
  if (!opphav) return true;
  if (TILLATT.has(opphav)) return true;
  try {
    const u = new URL(opphav);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function hentOpphavFraReferer(request: Request): string | null {
  const r = request.headers.get("referer");
  if (!r) return null;
  try { return new URL(r).origin; } catch { return null; }
}
