/**
 * Kjente sporere, som data – ikke som en regex gjemt i koden.
 *
 * Hver oppføring har kilde og dato, fordi listen råtner. Et sporingsdomene
 * byttes ut, en tjeneste legges ned, en ny dukker opp. Når du legger til noe
 * her, skal du kunne peke på hvor du fant det.
 *
 * Listen er ikke uttømmende, og den er heller ikke ment å være det. Den dekker
 * det vi ser oftest på norske småbedriftssider. Finner skanningen en cookie vi
 * ikke kjenner igjen, rapporteres den fortsatt – bare uten navn på avsenderen.
 */

/**
 * @typedef {object} Sporer
 * @property {string} id            Kort maskinnavn.
 * @property {string} navn          Vises til brukeren.
 * @property {"analyse"|"markedsføring"|"taggstyring"|"adferd"|"support"} kategori
 * @property {string[]} domener     Verter sporeren laster fra. Treffer på eksakt
 *                                  match eller som underdomene.
 * @property {string[]} cookies     Cookies den typisk setter. Til forklaring i
 *                                  rapporten, ikke til gjenkjenning.
 * @property {string} kilde         Hvor domenene og cookienavnene er hentet fra.
 * @property {string} sjekket       ISO-dato for sist kontroll mot kilden.
 */

/** @type {Sporer[]} */
export const SPORERE = [
  {
    id: "google-tag-manager",
    navn: "Google Tag Manager",
    kategori: "taggstyring",
    domener: ["googletagmanager.com"],
    cookies: ["_ga", "_gcl_au"],
    kilde: "https://developers.google.com/tag-platform/tag-manager",
    sjekket: "2026-10-06",
  },
  {
    id: "google-analytics",
    navn: "Google Analytics",
    kategori: "analyse",
    domener: ["google-analytics.com", "analytics.google.com"],
    cookies: ["_ga", "_gid", "_gat", "_ga_<målings-id>"],
    kilde: "https://business.safety.google/adscookies/",
    sjekket: "2026-10-06",
  },
  {
    id: "google-ads",
    navn: "Google Ads",
    kategori: "markedsføring",
    domener: ["doubleclick.net", "googlesyndication.com", "googleadservices.com"],
    cookies: ["IDE", "test_cookie", "_gcl_au"],
    kilde: "https://business.safety.google/adscookies/",
    sjekket: "2026-10-06",
  },
  {
    id: "meta-pixel",
    navn: "Meta Pixel",
    kategori: "markedsføring",
    domener: ["connect.facebook.net", "facebook.com", "facebook.net"],
    cookies: ["_fbp", "fr"],
    kilde: "https://www.facebook.com/business/help/742478679120153",
    sjekket: "2026-10-06",
  },
  {
    id: "hotjar",
    navn: "Hotjar",
    kategori: "adferd",
    domener: ["hotjar.com", "hotjar.io"],
    cookies: ["_hjSessionUser_<id>", "_hjSession_<id>", "_hjIncludedInSessionSample"],
    kilde: "https://help.hotjar.com/hc/en-us/articles/6952777582999",
    sjekket: "2026-10-06",
  },
  {
    id: "microsoft-clarity",
    navn: "Microsoft Clarity",
    kategori: "adferd",
    domener: ["clarity.ms"],
    cookies: ["_clck", "_clsk", "CLID"],
    kilde: "https://learn.microsoft.com/en-us/clarity/setup-and-installation/cookie-consent",
    sjekket: "2026-10-06",
  },
  {
    id: "linkedin-insight",
    navn: "LinkedIn Insight Tag",
    kategori: "markedsføring",
    domener: ["snap.licdn.com", "licdn.com", "linkedin.com"],
    cookies: ["li_sugr", "UserMatchHistory", "bcookie", "lidc"],
    kilde: "https://www.linkedin.com/legal/l/cookie-table",
    sjekket: "2026-10-06",
  },
  {
    id: "tiktok-pixel",
    navn: "TikTok Pixel",
    kategori: "markedsføring",
    domener: ["analytics.tiktok.com", "tiktok.com"],
    cookies: ["_ttp", "tt_sessionId"],
    kilde: "https://ads.tiktok.com/help/article/tiktok-pixel",
    sjekket: "2026-10-06",
  },
  {
    id: "snap-pixel",
    navn: "Snap Pixel",
    kategori: "markedsføring",
    domener: ["sc-static.net", "snapchat.com", "snap.com"],
    cookies: ["_scid", "_schn"],
    kilde: "https://values.snap.com/privacy/privacy-policy",
    sjekket: "2026-10-06",
  },
  {
    id: "matomo-sky",
    navn: "Matomo (sky)",
    kategori: "analyse",
    domener: ["matomo.cloud", "matomo.org"],
    cookies: ["_pk_id", "_pk_ses"],
    kilde: "https://matomo.org/faq/general/faq_146/",
    sjekket: "2026-10-06",
  },
  {
    id: "hubspot",
    navn: "HubSpot",
    kategori: "markedsføring",
    domener: ["hs-scripts.com", "hs-analytics.net", "hsadspixel.net", "hubspot.com", "hsforms.net"],
    cookies: ["__hstc", "hubspotutk", "__hssc", "__hssrc"],
    kilde: "https://knowledge.hubspot.com/privacy-and-consent/what-cookies-does-hubspot-set-in-a-visitor-s-browser",
    sjekket: "2026-10-06",
  },
  {
    id: "intercom",
    navn: "Intercom",
    kategori: "support",
    domener: ["intercom.io", "intercomcdn.com"],
    cookies: ["intercom-id-<app>", "intercom-session-<app>"],
    kilde: "https://www.intercom.com/legal/cookie-policy",
    sjekket: "2026-10-06",
  },
];

/** Slår sammen alle domenemønstre én gang, slik at oppslaget er raskt. */
const DOMENE_TIL_SPORER = new Map();
for (const s of SPORERE) {
  for (const d of s.domener) DOMENE_TIL_SPORER.set(d.toLowerCase(), s);
}

/**
 * Finner sporeren bak en vert.
 *
 * Treffer bare på eksakt domene eller ekte underdomene, aldri på delstreng.
 * «notgoogle-analytics.com» og «google-analytics.com.eksempel.no» skal IKKE
 * gi treff – ellers rapporterer vi folk for sporing de ikke driver med.
 *
 * @param {string} vert
 * @returns {Sporer | null}
 */
export function finnSporer(vert) {
  if (typeof vert !== "string" || !vert) return null;
  const h = vert.toLowerCase().replace(/\.$/, "");

  const direkte = DOMENE_TIL_SPORER.get(h);
  if (direkte) return direkte;

  for (const [domene, sporer] of DOMENE_TIL_SPORER) {
    if (h.endsWith(`.${domene}`)) return sporer;
  }
  return null;
}

/**
 * Registrerbart domene, omtrentlig: de to siste leddene.
 *
 * Dette er en heuristikk, ikke en oppslagsliste over offentlige suffikser.
 * Den er riktig for .no, .com, .org og de aller fleste norske sider. Den tar
 * feil for suffikser med to ledd (.co.uk, .com.au) og for de få norske
 * kategoridomenene (.priv.no, .kommune.no), der den slår for bredt.
 *
 * Konsekvensen av å ta feil er at en tredjeparts-cookie kan bli kalt
 * førstepart. Det er den minst skadelige retningen å bomme i: vi overdriver
 * aldri funnene.
 *
 * @param {string} vert
 */
export function registrerbartDomene(vert) {
  const ledd = String(vert).toLowerCase().replace(/\.$/, "").split(".");
  if (ledd.length <= 2) return ledd.join(".");
  return ledd.slice(-2).join(".");
}

/**
 * Er cookien satt av siden selv, eller av noen andre?
 *
 * @param {string} cookieDomene  Domenet cookien gjelder for, med eller uten ledende punktum.
 * @param {string} sideVert      Verten vi skannet.
 */
export function erForstepart(cookieDomene, sideVert) {
  const c = String(cookieDomene).toLowerCase().replace(/^\./, "").replace(/\.$/, "");
  const s = String(sideVert).toLowerCase().replace(/\.$/, "");
  if (!c || !s) return false;
  return registrerbartDomene(c) === registrerbartDomene(s);
}
