/**
 * SSRF-vern for skannertjenesten.
 *
 * ⚠ HOLD I SYNK MED src/lib/sjekk.ts (`normaliserUrl` og `erTillattVert`).
 *
 * Logikken er med vilje duplisert: tjenesten er en egen Fly-app med egen
 * package.json og kan ikke importere fra Astro-appen. Endrer du reglene ett
 * sted, må du endre dem begge. docs/skanner.md sier det samme, og
 * test/skanner.test.ts sammenligner de to implementasjonene på de samme
 * vertene, slik at et avvik gir rød test i stedet for et hull i produksjon.
 *
 * Dette er den mest sikkerhetskritiske filen i tjenesten. En skanner som kan
 * lures til å hente http://169.254.169.254/ er en lekkasje av skyhemmeligheter,
 * ikke en nettsidesjekk.
 */

const BLOKKERTE_VERTER = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
]);

/**
 * Normaliserer det brukeren skrev til en URL. Kaster ved ugyldig inndata.
 * @param {string} input
 * @returns {URL}
 */
export function normaliserUrl(input) {
  const raa = String(input ?? "").trim().replace(/^\/+/, "");
  if (!raa) throw new Error("Skriv inn en nettadresse.");

  const skjema = /^([a-z][a-z0-9+.-]*):/i.exec(raa)?.[1]?.toLowerCase();
  if (skjema && skjema !== "http" && skjema !== "https") {
    throw new Error("Bare http og https kan sjekkes.");
  }

  const medProtokoll = /^https?:\/\//i.test(raa) ? raa : `https://${raa}`;
  let url;
  try {
    url = new URL(medProtokoll);
  } catch {
    throw new Error("Det ser ikke ut som en nettadresse. Prøv dinbedrift.no");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Bare http og https kan sjekkes.");
  }
  if (!url.hostname.includes(".")) {
    throw new Error("Nettadressen mangler toppdomene. Prøv dinbedrift.no");
  }
  url.hash = "";
  return url;
}

/**
 * Er verten trygg å hente fra?
 *
 * Kalles ikke bare på adressen brukeren skrev, men på HVER forespørsel
 * nettleseren gjør – også etter omdirigeringer. Se skann.mjs.
 *
 * @param {URL} url
 * @returns {boolean}
 */
export function erTillattVert(url) {
  const h = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOKKERTE_VERTER.has(h)) return false;
  if (h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return false;
  if (h.endsWith(".onion")) return false;

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 10 || a === 127 || a === 0) return false;
    if (a === 192 && b === 168) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 169 && b === 254) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a >= 224) return false;
    return true;
  }
  if (h.includes(":")) {
    // IPv6-literal: bare globale unicast-adresser (2000::/3) slipper gjennom.
    if (!/^[0-9a-f:.]+$/.test(h)) return false;
    return /^[23]/.test(h);
  }
  return true;
}
