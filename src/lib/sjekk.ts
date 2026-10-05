/**
 * Analysemotoren bak «Sjekk nettsiden din».
 *
 * Alt her er rene funksjoner uten nettverk, slik at de kan testes (`npm run test`).
 * Henting og sammenstilling ligger i src/pages/api/sjekk.ts.
 *
 * Æresregelen: verktøyet skal aldri påstå mer enn det har målt. Det som ikke er
 * sjekket, får status «neutral» og en note som sier hvorfor. En falsk «Bestått»
 * er verre enn ingen sjekk – det er hele poenget med å selge dette.
 */

export type Status = "ok" | "warn" | "fail" | "neutral";

export interface Rad {
  name: string;
  status: Status;
  value: string;
  /** Hva det betyr for bedriften, ikke for utvikleren. Én setning. */
  note: string;
}

export interface Funn {
  /** Teknisk detalj til den lange rapporten og til kald e-post. */
  detaljer: string[];
}

/* ------------------------------------------------------------------ URL ---- */

const BLOKKERTE_VERTER = new Set([
  "localhost", "127.0.0.1", "0.0.0.0", "::1",
  "metadata.google.internal", "169.254.169.254",
]);

/** Normaliserer det brukeren skrev til en URL. Kaster ved ugyldig inndata. */
export function normaliserUrl(input: string): URL {
  const raa = input.trim().replace(/^\/+/, "");
  if (!raa) throw new Error("Skriv inn en nettadresse.");

  // Skrev brukeren en annen protokoll enn http/https, skal de få vite nettopp det.
  // Uten denne sjekken ville «ftp://dinbedrift.no» blitt til «https://ftp://dinbedrift.no»
  // og gitt feilmeldingen «mangler toppdomene», som er både feil og forvirrende.
  const skjema = /^([a-z][a-z0-9+.-]*):/i.exec(raa)?.[1]?.toLowerCase();
  if (skjema && skjema !== "http" && skjema !== "https") {
    throw new Error("Bare http og https kan sjekkes.");
  }

  const medProtokoll = /^https?:\/\//i.test(raa) ? raa : `https://${raa}`;
  let url: URL;
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
 * SSRF-vern: verktøyet kjører på vår server, så en bruker skal ikke kunne få den til
 * å hente interne adresser. Sjekkes på nytt for hver omdirigering.
 */
export function erTillattVert(url: URL): boolean {
  const h = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOKKERTE_VERTER.has(h)) return false;
  if (h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return false;
  if (h.endsWith(".onion")) return false;

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
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

/* -------------------------------------------------- Sikkerhetsheadere ---- */

export interface HeaderFunn extends Funn {
  tilstede: string[];
  mangler: string[];
  status: Status;
}

const PAAKREVDE_HEADERE = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
] as const;

const HEADER_NAVN: Record<string, string> = {
  "content-security-policy": "CSP",
  "strict-transport-security": "HSTS",
  "x-content-type-options": "X-Content-Type-Options",
  "referrer-policy": "Referrer-Policy",
  "permissions-policy": "Permissions-Policy",
  "x-frame-options": "X-Frame-Options",
};

export function analyserHeadere(h: Headers): HeaderFunn {
  const tilstede: string[] = [];
  const mangler: string[] = [];
  const detaljer: string[] = [];

  for (const navn of PAAKREVDE_HEADERE) {
    const verdi = h.get(navn);
    if (verdi) {
      tilstede.push(HEADER_NAVN[navn]!);
      if (navn === "x-content-type-options" && !/nosniff/i.test(verdi)) {
        detaljer.push("X-Content-Type-Options er satt, men ikke til «nosniff».");
      }
      if (navn === "strict-transport-security") {
        const maxAge = /max-age=(\d+)/i.exec(verdi);
        if (!maxAge || Number(maxAge[1]) < 15_552_000) {
          detaljer.push("HSTS har kortere max-age enn seks måneder.");
        }
      }
    } else {
      mangler.push(HEADER_NAVN[navn]!);
      detaljer.push(`Mangler ${HEADER_NAVN[navn]}.`);
    }
  }

  // Klikkjacking kan dekkes av X-Frame-Options eller CSP frame-ancestors.
  const csp = h.get("content-security-policy") ?? "";
  const rammevern = Boolean(h.get("x-frame-options")) || /frame-ancestors/i.test(csp);
  if (rammevern) tilstede.push("Rammevern");
  else {
    mangler.push("X-Frame-Options");
    detaljer.push("Ingenting hindrer at siden legges i en ramme på et annet domene.");
  }

  const antall = tilstede.length;
  const status: Status = antall >= 6 ? "ok" : antall >= 3 ? "warn" : "fail";
  return { tilstede, mangler, status, detaljer };
}

/* ------------------------------------------- Cookies før samtykke ---- */

export interface CookieFunn extends Funn {
  egne: number;
  sporere: string[];
  status: Status;
}

const SPORERE: Array<[RegExp, string]> = [
  [/googletagmanager\.com\/(gtm|gtag)/i, "Google Tag Manager"],
  [/google-analytics\.com|\/analytics\.js|gtag\/js/i, "Google Analytics"],
  [/connect\.facebook\.net|fbevents\.js/i, "Meta Pixel"],
  [/static\.hotjar\.com/i, "Hotjar"],
  [/clarity\.ms/i, "Microsoft Clarity"],
  [/doubleclick\.net|googlesyndication\.com/i, "Google Ads"],
  [/snap\.licdn\.com/i, "LinkedIn Insight"],
  [/analytics\.tiktok\.com/i, "TikTok Pixel"],
  [/cdn\.matomo\.cloud|matomo\.js|piwik\.js/i, "Matomo"],
  [/hs-scripts\.com|js\.hs-analytics\.net/i, "HubSpot"],
];

/**
 * Teller hva som settes *før* samtykke. Vi laster bare HTML-en, så dette er et
 * nedre anslag: skript som settes inn av et samtykkeverktøy etter klikk, teller ikke.
 * Det er riktig vei å ta feil – vi overdriver aldri funnene.
 */
export function analyserCookies(h: Headers, html: string): CookieFunn {
  const satt = typeof h.getSetCookie === "function" ? h.getSetCookie() : [];
  const fraHeader = satt.length > 0 ? satt : (h.get("set-cookie") ? [h.get("set-cookie")!] : []);
  const egne = fraHeader.length;

  const rent = fjernKommentarer(html);
  const sporere = [...new Set(SPORERE.filter(([re]) => re.test(rent)).map(([, navn]) => navn))];

  const detaljer: string[] = [];
  for (const c of fraHeader) {
    const navn = c.split("=")[0]?.trim();
    if (navn) detaljer.push(`Cookie «${navn}» settes ved første besøk.`);
  }
  for (const s of sporere) detaljer.push(`${s} lastes uten at samtykke er innhentet.`);

  const status: Status = sporere.length > 0 ? "fail" : egne > 0 ? "warn" : "ok";
  return { egne, sporere, status, detaljer };
}

/* ----------------------------------------- Universell utforming ---- */

export interface UuFunn extends Funn {
  feil: number;
  status: Status;
}

/**
 * Maskinelt testbare WCAG-brudd som kan leses ut av HTML alene. Dette er rundt en
 * tredjedel av de 35 kravene for private virksomheter; kontrast, tastaturnavigasjon
 * og skjermleserflyt må testes manuelt. Rapporten sier det eksplisitt.
 */
export function analyserUu(html: string): UuFunn {
  const detaljer: string[] = [];
  const rent = fjernKommentarer(html);

  const htmlTag = /<html\b[^>]*>/i.exec(rent)?.[0] ?? "";
  if (!/\blang\s*=\s*["']?[a-z]{2}/i.test(htmlTag)) {
    detaljer.push("Siden sier ikke hvilket språk den er på (WCAG 3.1.1). Skjermlesere leser norsk med engelsk uttale.");
  }

  const tittel = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(rent)?.[1]?.trim() ?? "";
  if (!tittel) detaljer.push("Siden mangler tittel (WCAG 2.4.2).");

  const bilder = rent.match(/<img\b[^>]*>/gi) ?? [];
  const utenAlt = bilder.filter((t) => !/\balt\s*=/i.test(t)).length;
  if (utenAlt > 0) {
    detaljer.push(`${utenAlt} ${utenAlt === 1 ? "bilde" : "bilder"} mangler alt-tekst (WCAG 1.1.1).`);
  }

  const felt = (rent.match(/<(input|select|textarea)\b[^>]*>/gi) ?? []).filter(
    (t) => !/type\s*=\s*["']?(hidden|submit|button|image|reset)/i.test(t),
  );
  const feltMedNavn = felt.filter((t) => /\b(aria-label|aria-labelledby|title)\s*=/i.test(t)).length;
  const etiketter = (rent.match(/<label\b[^>]*\bfor\s*=/gi) ?? []).length;
  const pakket = (rent.match(/<label\b[^>]*>[\s\S]*?<(input|select|textarea)\b/gi) ?? []).length;
  const utenEtikett = Math.max(0, felt.length - feltMedNavn - etiketter - pakket);
  if (utenEtikett > 0) {
    detaljer.push(`${utenEtikett} skjemafelt mangler ledetekst (WCAG 3.3.2). Brukere med skjermleser vet ikke hva de skal skrive.`);
  }

  const h1 = (rent.match(/<h1\b/gi) ?? []).length;
  if (h1 === 0) detaljer.push("Siden har ingen hovedoverskrift (h1).");
  else if (h1 > 1) detaljer.push(`Siden har ${h1} hovedoverskrifter (h1). Det skal være én.`);

  const tommeLenker = (rent.match(/<a\b[^>]*>\s*<\/a>/gi) ?? []).length;
  if (tommeLenker > 0) detaljer.push(`${tommeLenker} lenker har ingen tekst (WCAG 2.4.4).`);

  const viewport = /<meta\b[^>]*name\s*=\s*["']?viewport["']?[^>]*>/i.exec(rent)?.[0] ?? "";
  if (/user-scalable\s*=\s*["']?no/i.test(viewport) || /maximum-scale\s*=\s*["']?1/i.test(viewport)) {
    detaljer.push("Siden hindrer at man kan zoome (WCAG 1.4.4).");
  }

  const feil = detaljer.length;
  const status: Status = feil === 0 ? "ok" : feil <= 2 ? "warn" : "fail";
  return { feil, status, detaljer };
}

/* ------------------------------------------ Lovpålagt informasjon ---- */

export interface LovFunn extends Funn {
  orgnr: string | null;
  epost: boolean;
  telefon: boolean;
  adresse: boolean;
  personvern: boolean;
  status: Status;
}

/** Mod 11-kontroll av organisasjonsnummer. Luker ut telefonnumre og tilfeldige 9-sifre. */
export function erGyldigOrgnr(nr: string): boolean {
  const s = nr.replace(/\D/g, "");
  if (s.length !== 9) return false;
  const vekter = [3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(s[i]) * vekter[i]!;
  const rest = sum % 11;
  const kontroll = rest === 0 ? 0 : 11 - rest;
  if (kontroll === 10) return false;
  return kontroll === Number(s[8]);
}

export function analyserLovpaalagt(html: string): LovFunn {
  const rent = fjernKommentarer(html);
  const tekst = rent.replace(/<[^>]+>/g, " ");
  const detaljer: string[] = [];

  let orgnr: string | null = null;
  for (const m of tekst.matchAll(/\b(\d{3}[\s.]?\d{3}[\s.]?\d{3})\b/g)) {
    if (erGyldigOrgnr(m[1]!)) { orgnr = m[1]!.replace(/\D/g, ""); break; }
  }
  if (!orgnr) {
    detaljer.push("Fant ikke organisasjonsnummer. Foretaksnavn og org.nr. skal stå på nettsiden (Altinn / foretaksregisterloven).");
  }

  const epost = /mailto:/i.test(rent) || /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(tekst);
  if (!epost) detaljer.push("Fant ingen e-postadresse. Ehandelsloven § 8 krever at kunder kan nå deg direkte.");

  const telefon = /tel:/i.test(rent) || /(\+47[\s]?)?(\d{2}[\s]?\d{2}[\s]?\d{2}[\s]?\d{2}|\d{3}[\s]?\d{2}[\s]?\d{3})\b/.test(tekst);
  if (!telefon) detaljer.push("Fant ingen telefonnummer.");

  const adresse = /<address\b/i.test(rent) || /\b\d{4}\s+[A-ZÆØÅ][a-zæøå]+/.test(tekst);
  if (!adresse) detaljer.push("Fant ingen geografisk adresse (ehandelsloven § 8).");

  const personvern = /href\s*=\s*["'][^"']*(personvern|privacy|gdpr|cookie)/i.test(rent);
  if (!personvern) detaljer.push("Fant ingen lenke til personvernerklæring.");

  const status: Status = !orgnr ? "fail" : detaljer.length === 0 ? "ok" : "warn";
  return { orgnr, epost, telefon, adresse, personvern, status, detaljer };
}

/* ------------------------------------------------------- Ytelse ---- */

export interface YtelseFunn extends Funn {
  score: number | null;
  lcp: number | null;
  ttfb: number | null;
  bytes: number;
  blokkerende: number;
  status: Status;
}

/** Teller det som utsetter første maling når vi ikke har PageSpeed-data. */
export function analyserYtelseLokalt(html: string, bytes: number, ttfb: number): YtelseFunn {
  const hode = /<head[\s\S]*?<\/head>/i.exec(html)?.[0] ?? html.slice(0, 20_000);
  const skript = (hode.match(/<script\b(?![^>]*\b(async|defer|type\s*=\s*["']application\/ld\+json)["']?)[^>]*\bsrc=/gi) ?? []).length;
  const stiler = (hode.match(/<link\b[^>]*rel\s*=\s*["']?stylesheet/gi) ?? []).length;
  const blokkerende = skript + stiler;
  const detaljer = [
    `${(bytes / 1024).toFixed(0)} kB HTML, ${blokkerende} blokkerende ${blokkerende === 1 ? "ressurs" : "ressurser"} i <head>, ${ttfb} ms til første byte.`,
  ];
  if (blokkerende > 4) detaljer.push("Mer enn fire blokkerende ressurser i <head> utsetter første maling merkbart på mobil.");
  if (bytes > 250_000) detaljer.push("HTML-en alene er over 250 kB. Det er mye å laste ned på 4G.");
  return { score: null, lcp: null, ttfb, bytes, blokkerende, status: "neutral", detaljer };
}

/* ------------------------------------------------------- Rapport ---- */

export interface Rapport {
  url: string;
  dato: string;
  rader: Rad[];
  /** 0–100, vektet. Vises ikke som Lighthouse-score – det er vår egen oppsummering. */
  totalt: number;
  detaljer: string[];
  /** Det verktøyet ikke kan se. Står alltid i rapporten. */
  forbehold: string[];
}

const VEKT: Record<Status, number> = { ok: 1, warn: 0.5, fail: 0, neutral: 0.5 };

/** Setter sammen de fem radene i den faste rekkefølgen fra docs/sidemonstre.md. */
export function byggRapport(args: {
  url: string;
  dato: string;
  ytelse: YtelseFunn;
  headere: HeaderFunn;
  cookies: CookieFunn;
  uu: UuFunn;
  lov: LovFunn;
}): Rapport {
  const { url, dato, ytelse, headere, cookies, uu, lov } = args;

  const ytelseRad: Rad =
    ytelse.score !== null
      ? {
          name: "Ytelse",
          status: ytelse.score >= 90 ? "ok" : ytelse.score >= 50 ? "warn" : "fail",
          value: `${ytelse.score}/100`,
          note:
            ytelse.score >= 90
              ? "Siden er rask nok på mobil. Det er bra for både besøkende og Google."
              : `Lighthouse gir ${ytelse.score} av 100 på mobil${ytelse.lcp ? `, største innhold vises etter ${(ytelse.lcp / 1000).toFixed(1)} s` : ""}. Under 90 betyr at besøkende på mobil venter, og Google ser det.`,
        }
      : {
          name: "Ytelse",
          status: "neutral",
          value: `${ytelse.ttfb} ms TTFB`,
          note: `Lighthouse-score er ikke hentet. Målt direkte: ${(ytelse.bytes / 1024).toFixed(0)} kB HTML og ${ytelse.blokkerende} blokkerende ${ytelse.blokkerende === 1 ? "ressurs" : "ressurser"} i toppen av siden.`,
        };

  const headerRad: Rad = {
    name: "Sikkerhetsheadere",
    status: headere.status,
    value: `${headere.tilstede.length}/6`,
    note:
      headere.mangler.length === 0
        ? "Alle headerne vi sjekker er på plass."
        : `Mangler ${headere.mangler.slice(0, 3).join(", ")}${headere.mangler.length > 3 ? " m.fl." : ""}. Uten dem er siden lettere å misbruke til å lure dine egne kunder.`,
  };

  const cookieAntall = cookies.egne + cookies.sporere.length;
  const cookieRad: Rad = {
    name: "Cookies før samtykke",
    status: cookies.status,
    value: String(cookieAntall),
    note:
      cookies.sporere.length > 0
        ? `${cookies.sporere.join(", ")} laster før noen har sagt ja. Det bryter ekomloven § 3-15, som siden 1. januar 2025 krever GDPR-gyldig samtykke.`
        : cookies.egne > 0
          ? `${cookies.egne} ${cookies.egne === 1 ? "cookie" : "cookies"} settes ved første besøk. Er de strengt nødvendige for driften, er det lov – ellers må de vente på samtykke.`
          : "Ingenting settes før samtykke. Da trenger siden strengt tatt ikke banner.",
  };

  const uuRad: Rad = {
    name: "Universell utforming",
    status: uu.status,
    value: `${uu.feil} ${uu.feil === 1 ? "feil" : "feil"}`,
    note:
      uu.feil === 0
        ? "Ingen av de maskinelt testbare feilene vi ser etter. Kontrast og tastaturbruk må testes manuelt."
        : `${uu.feil} brudd mot WCAG funnet i koden. Private virksomheter skal oppfylle 35 krav i WCAG 2.0 A og AA.`,
  };

  const lovRad: Rad = {
    name: "Lovpålagt informasjon",
    status: lov.status,
    value: lov.orgnr ? "Org.nr. funnet" : "Org.nr. mangler",
    note: lov.orgnr
      ? lov.detaljer.length === 0
        ? "Org.nr., kontaktinfo og personvernerklæring er på plass."
        : `Org.nr. er på plass, men ${lov.detaljer.length} ${lov.detaljer.length === 1 ? "opplysning" : "opplysninger"} mangler. Ehandelsloven § 8 krever adresse, e-post og telefon.`
      : "Foretaksnavn og organisasjonsnummer skal stå på nettsiden. Det er det første en kunde ser etter når de skal sjekke om du er et ekte foretak.",
  };

  const rader = [ytelseRad, headerRad, cookieRad, uuRad, lovRad];
  const totalt = Math.round((rader.reduce((s, r) => s + VEKT[r.status], 0) / rader.length) * 100);

  return {
    url,
    dato,
    rader,
    totalt,
    detaljer: [...ytelse.detaljer, ...headere.detaljer, ...cookies.detaljer, ...uu.detaljer, ...lov.detaljer],
    forbehold: [
      "Sjekken leser forsiden slik en besøkende får den første gang, uten å kjøre JavaScript.",
      "Kontrast, tastaturnavigasjon og skjermleserflyt kan ikke måles maskinelt og er ikke vurdert her.",
      "Cookies som settes av JavaScript etter innlasting, vises ikke. Tallet er et minimum.",
      "Dette er ikke juridisk rådgivning.",
    ],
  };
}

/* -------------------------------------------------------- Hjelpere ---- */

/** Fjerner HTML-kommentarer så kommentert bort kode ikke teller som funn. */
export function fjernKommentarer(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, " ");
}

export function formaterDato(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}
