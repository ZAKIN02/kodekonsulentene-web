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
  /** Samtykkeløsninger vi kjente igjen i markupen. Navn, ikke antall. */
  samtykkelosninger: string[];
  /** Google Consent Mode slik den står i koden. `null` = vi kan ikke se det. */
  consentMode: { tilstede: boolean; standardNektet: boolean | null };
  /** Cookies fra `Set-Cookie` vi kjenner igjen som drift, økt eller sikkerhet. */
  tekniske: string[];
  /** Cookies fra `Set-Cookie` vi ikke kjenner igjen. «Ukjent» er et gyldig svar. */
  ukjente: string[];
  /** Hva maskinen ikke kunne avgjøre. Skal alltid vises til brukeren. */
  uavklart: string[];
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
 * Samtykkeløsninger som kan kjennes igjen på skriptverten i markupen.
 *
 * > **⚠ Hold i synk:** dette er en forkortet utgave av `SAMTYKKELOSNINGER` i
 * > `services/skanner/samtykke.mjs`. Skanneren er en egen Fly-app med egen
 * > byggekontekst (`services/` står i `.dockerignore`), så Astro-appen kan ikke
 * > importere fra den – samme grunn som for `ssrf.mjs`. `test/samtykke.test.ts`
 * > kjører begge listene mot de samme vertene og blir rød hvis de spriker.
 *
 * Bare vertsnavn. Ingen ordsøk: «samtykke» på en side som *skriver om* samtykke
 * er ikke en samtykkeløsning, og den fella gikk vi i selv under utprøvingen –
 * datatilsynet.no fikk treff på ordet.
 */
const SAMTYKKEVERTER: Array<[string, string]> = [
  ["cookieinformation.com", "Cookie Information"],
  ["cookiebot.com", "Cookiebot"],
  ["cookielaw.org", "OneTrust"],
  ["onetrust.com", "OneTrust"],
  ["onetrust.io", "OneTrust"],
  ["cookieyes.com", "CookieYes"],
  ["cdn-cookieyes.com", "CookieYes"],
  ["usercentrics.eu", "Usercentrics"],
  ["usercentrics.com", "Usercentrics"],
  // Klaro hostes paa cdn.kiprotect.com. klaro.org er dokumentasjonssiden, og
  // sto her i et tidlig utkast – synktesten fanget det.
  ["kiprotect.com", "Klaro"],
  ["heyklaro.com", "Klaro"],
  ["iubenda.com", "Iubenda"],
  ["termly.io", "Termly"],
  ["sp-prod.net", "Sourcepoint"],
  ["privacy-mgmt.com", "Sourcepoint"],
  ["cookiefirst.com", "CookieFirst"],
  ["cookiehub.net", "CookieHub"],
  ["cookiehub.com", "CookieHub"],
  ["osano.com", "Osano"],
  ["didomi.io", "Didomi"],
  ["privacy-center.org", "Didomi"],
  ["axept.io", "Axeptio"],
  ["cookie-script.com", "CookieScript"],
  ["consentmanager.net", "consentmanager.net"],
  ["tarteaucitron.io", "tarteaucitron.js"],
  ["cookiepro.com", "OneTrust"],
  ["monsido-consent.com", "Monsido / Acquia Optimize"],
];

/**
 * Cookienavn vi kjenner igjen som drift, økt eller sikkerhet.
 *
 * Kort med vilje. Målt 7. oktober 2026 sendte **15 av 38** norske nettsteder
 * minst én `Set-Cookie` på første svar, og **ingen** av dem sendte en cookie vi
 * kan dokumentere som sporing. Alt var lastbalansering, økt, botfiltrering eller
 * et førstepartsnavn vi ikke kjente igjen. Den fullstendige klassifiseringen
 * ligger i `services/skanner/samtykke.mjs` og brukes der den hører hjemme: i
 * nettleserskanningen, som faktisk ser cookies satt av JavaScript.
 */
const TEKNISKE_COOKIES =
  /^(PHPSESSID|PHPSESSIONID|JSESSIONID|ASP\.NET_SessionId|sessionid|session_id|sess|connect\.sid|laravel_session|sid|csrf_token|csrftoken|XSRF-TOKEN|_csrf|__cf_bm|cf_clearance|__cflb|__cfruid|ARRAffinity|ARRAffinitySameSite|ApplicationGateway.*Affinity.*|BIGipServer.*|TS[0-9a-f]{6,}|AWSALB|AWSALBCORS|AWSELB|_GRECAPTCHA|wordpress_test_cookie|wp-settings-\d+|wp-settings-time-\d+|wp_lang|woocommerce_cart_hash|woocommerce_items_in_cart|EPiStateMarker|EPiServer_Commerce_AnonymousId|EPi_NumberOfVisits|LFR_SESSION_STATE_\d+|COOKIE_SUPPORT|GUEST_LANGUAGE_ID|cart|secure_customer_sig|svSession|language|lang|locale|NEXT_LOCALE)$/i;

/**
 * Hva settes, og hva finnes av samtykkehåndtering – lest ut av HTML-en alene.
 *
 * ## Hvorfor denne funksjonen ikke kan dømme
 *
 * `/sjekk` henter siden med `fetch` og kjører ikke JavaScript. Vi målte hva det
 * koster, 7. oktober 2026, på 24 norske nettsteder skannet både med nettleser og
 * som rå HTML:
 *
 * - **16** hadde et verifisert `gtag('consent', 'default', …)`-kall i nettleseren.
 *   **3** viste det i HTML-en. **13 gjorde det ikke.**
 * - **20** hadde en samtykkeløsning i nettleseren. **9** viste løsningens
 *   skriptvert i HTML-en. **11 gjorde det ikke.**
 *
 * Et `<script src="…/gtag/js">` i markupen er derfor ikke bevis for at noe
 * lagres uten samtykke. Google Consent Mode gjør nettopp dette: laster skriptet,
 * lagrer ingenting. Fram til nå satte denne funksjonen `fail` og skrev «Det
 * bryter ekomloven § 3-15» på det grunnlaget. Det var en påstand om lovbrudd
 * bygget på et skriptnavn.
 *
 * Derfor har raden tre utfall her, og **`fail` er ikke blant dem**:
 *
 * - `ok`      – ingenting satt, ingen sporing funnet
 * - `warn`    – sporing i koden og ingen samtykkeløsning å se, ELLER cookies satt
 *               ved første besøk
 * - `neutral` – sporing *og* samtykkehåndtering funnet: kan ikke avgjøres maskinelt
 *
 * Den virkelige målingen skjer i nettleseren (`services/skanner`), som ser hva
 * som faktisk ble lagret. Rapporten sier det, hver gang.
 */
export function analyserCookies(h: Headers, html: string): CookieFunn {
  const satt = typeof h.getSetCookie === "function" ? h.getSetCookie() : [];
  const fraHeader = satt.length > 0 ? satt : (h.get("set-cookie") ? [h.get("set-cookie")!] : []);
  const egne = fraHeader.length;

  const rent = fjernKommentarer(html);
  const sporere = [...new Set(SPORERE.filter(([re]) => re.test(rent)).map(([, navn]) => navn))];
  const samtykkelosninger = [
    ...new Set(SAMTYKKEVERTER.filter(([vert]) => rent.includes(vert)).map(([, navn]) => navn)),
  ];

  // Consent Mode i markupen: standardkallet må stå der, og minst én av de fire
  // annonse- og analysekategoriene må være «denied». Står kallet der med
  // «granted», er standardNektet false – da er sporingen slått på fra start.
  const harDefaultKall = /consent['"]?\s*,\s*['"]default['"]/i.test(rent);
  const nektet = /(ad_storage|analytics_storage|ad_user_data|ad_personalization)["']?\s*:\s*["']denied["']/i.test(rent);
  const consentMode = {
    tilstede: harDefaultKall || /gtag\s*\(\s*['"]consent['"]/i.test(rent),
    standardNektet: harDefaultKall ? nektet : null,
  };

  const navn = fraHeader.map((c) => c.split("=")[0]?.trim() ?? "").filter(Boolean);
  const tekniske = navn.filter((n) => TEKNISKE_COOKIES.test(n));
  const ukjente = navn.filter((n) => !TEKNISKE_COOKIES.test(n));

  const samtykkeSpor = samtykkelosninger.length > 0 || consentMode.standardNektet === true;

  const detaljer: string[] = [];
  for (const n of tekniske) detaljer.push(`Cookie «${n}» settes ved første besøk. Vi kjenner den igjen som teknisk.`);
  for (const n of ukjente) detaljer.push(`Cookie «${n}» settes ved første besøk. Vi kjenner den ikke igjen.`);
  for (const s of sporere) detaljer.push(`${s} lastes i forsidekoden.`);
  for (const l of samtykkelosninger) detaljer.push(`Samtykkeløsning funnet i koden: ${l}.`);
  if (consentMode.standardNektet === true) {
    detaljer.push("Google Consent Mode står i koden med standardtilstand «denied».");
  } else if (consentMode.standardNektet === false) {
    detaljer.push("Google Consent Mode står i koden, men standardtilstanden er «granted».");
  }

  const uavklart: string[] = [
    "JavaScript er ikke kjørt. Cookies som settes av skript er ikke med, og en samtykkeløsning som lastes dynamisk er usynlig her.",
  ];
  if (sporere.length > 0 && !samtykkeSpor) {
    uavklart.push("Vi fant ingen samtykkeløsning i koden. Det er ikke det samme som at det ikke finnes en – av 16 norske sider vi målte med verifisert samtykkeoppsett, viste bare 3 det i HTML-en.");
  }
  if (ukjente.length > 0) {
    uavklart.push(`Om ${ukjente.length === 1 ? "cookien" : "cookiene"} ${ukjente.join(", ")} er strengt nødvendig${ukjente.length === 1 ? "" : "e"} kan ingen maskin avgjøre.`);
  }

  const status: Status =
    sporere.length > 0 ? (samtykkeSpor ? "neutral" : "warn") : egne > 0 ? "warn" : "ok";

  return { egne, sporere, samtykkelosninger, consentMode, tekniske, ukjente, uavklart, status, detaljer };
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
  /**
   * Fra Enhetsregisteret, satt av API-ruten etter at analyserLovpaalagt har
   * funnet et kandidatnummer. null betyr enten «ikke slått opp» eller
   * «finnes ikke» – byggRapport skiller på det via `oppslagKjort`.
   */
  foretak?: { navn: string; form: string; slettet: boolean } | null;
  oppslagKjort?: boolean;
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
  // Bare nuller består mod 11-regnestykket (sum 0 gir kontrollsiffer 0), men er
  // ikke et tildelt nummer. Uten denne linjen meldte verktøyet vår egen
  // plassholder «000000000» som gyldig org.nr.
  if (/^0+$/.test(s)) return false;
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
    // HJEMMELEN STO FEIL, OG DET ER DEN ENE STRENGEN DER DET IKKE GÅR AN.
    //
    // Her sto «(Altinn / foretaksregisterloven)». Altinn er en portal, ikke en
    // hjemmel – ingen plikt følger av Altinn. Og foretaksregisterloven § 10-2
    // alene er for snevert: den retter seg mot foretak som er registrert i
    // FORETAKSREGISTERET. Et enkeltpersonforetak som bare står i
    // Enhetsregisteret treffes ikke, og det er flertallet av dem vi skanner.
    // For dem er hjemmelen ehandelsloven § 8, som gjelder enhver som tilbyr en
    // informasjonssamfunnstjeneste.
    //
    // Verktøyet kan ikke vite hvilket register siden står i uten å slå opp, så
    // det navngir begge i stedet for å gjette. Begge er kontrollert mot Lovdata
    // 7. oktober 2026, se `foretaksregisterloven-10-2` og `ehandelsloven-8` i
    // src/data/kilder.ts.
    detaljer.push(
      "Fant ikke organisasjonsnummer. Foretaksnavn og org.nr. skal stå på nettsiden: " +
        "foretaksregisterloven § 10-2 for foretak registrert i Foretaksregisteret, " +
        "ehandelsloven § 8 for alle som tilbyr en tjeneste på nett.",
    );
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

  // Cookie-raden sier hva vi målte, aldri at noe er ulovlig.
  //
  // Den sa det før: «Det bryter ekomloven § 3-15» så snart et sporingsskript sto
  // i markupen. Men § 3-15 gjelder lagring i brukerens kommunikasjonsutstyr, ikke at en
  // fil ble lastet ned – og Google Consent Mode laster nettopp skriptet uten å
  // lagre noe. Av 16 norske sider med verifisert samtykkeoppsett viste bare 3 det
  // i den servergjengitte HTML-en, så fra HTML alene kan vi ikke se forskjellen.
  // Raden kan derfor ikke gi «brudd» her. Den viser til nettleserskanningen.
  const cookieAntall = cookies.egne + cookies.sporere.length;
  const cookieRad: Rad = {
    name: "Cookies før samtykke",
    status: cookies.status,
    value: String(cookieAntall),
    note: (() => {
      if (cookies.sporere.length > 0 && cookies.status === "neutral") {
        const spor = cookies.samtykkelosninger.length
          ? cookies.samtykkelosninger.join(", ")
          : "Google Consent Mode med standardtilstand «denied»";
        return `${cookies.sporere.join(", ")} lastes, men siden har ${spor}. Om sporingen faktisk er sperret før samtykke kan ikke leses ut av koden – det må måles i en nettleser.`;
      }
      if (cookies.sporere.length > 0) {
        return `${cookies.sporere.join(", ")} lastes i forsidekoden, og vi fant ingen samtykkeløsning. Etter ekomloven § 3-15 krever sporing samtykke – men vi kjørte ikke JavaScript, så en samtykkeløsning som lastes dynamisk ville vi ikke sett. Cookie-sjekken laster siden i en ekte nettleser og gir svaret.`;
      }
      if (cookies.ukjente.length > 0) {
        return `${cookies.ukjente.length} ${cookies.ukjente.length === 1 ? "cookie" : "cookies"} settes ved første besøk, og vi kjenner ${cookies.ukjente.length === 1 ? "den" : "dem"} ikke igjen. Er ${cookies.ukjente.length === 1 ? "den" : "de"} strengt nødvendig${cookies.ukjente.length === 1 ? "" : "e"} for driften, er det lov – ellers må ${cookies.ukjente.length === 1 ? "den" : "de"} vente på samtykke.`;
      }
      if (cookies.egne > 0) {
        return `${cookies.egne} ${cookies.egne === 1 ? "cookie" : "cookies"} settes ved første besøk, og vi kjenner ${cookies.egne === 1 ? "den" : "alle"} igjen som teknisk${cookies.egne === 1 ? "" : "e"}: ${cookies.tekniske.join(", ")}. Det er den typen § 3-15 gjør unntak for, men vurderingen er juridisk og gjøres ikke her.`;
      }
      return "Ingenting settes før samtykke, og vi fant ingen sporingsverktøy. Da trenger siden strengt tatt ikke banner.";
    })(),
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

  // Org.nr.-raden tar hensyn til om nummeret faktisk finnes i Enhetsregisteret.
  // Et nummer som består mod 11 men ikke finnes, er verre enn ingen nummer –
  // da står det noe på siden som ser riktig ut og ikke er det.
  const lovRad: Rad = (() => {
    if (!lov.orgnr) {
      return {
        name: "Lovpålagt informasjon",
        status: "fail" as Status,
        value: "Org.nr. mangler",
        note: "Foretaksnavn og organisasjonsnummer skal stå på nettsiden. Det er det første en kunde ser etter når de skal sjekke om foretaket er ekte.",
      };
    }
    if (lov.oppslagKjort && !lov.foretak) {
      return {
        name: "Lovpålagt informasjon",
        status: "fail" as Status,
        value: "Org.nr. finnes ikke",
        note: `Nummeret på siden (${lov.orgnr}) står ikke i Enhetsregisteret. Enten er det en skrivefeil, eller så er det ikke foretakets eget nummer.`,
      };
    }
    if (lov.foretak?.slettet) {
      return {
        name: "Lovpålagt informasjon",
        status: "fail" as Status,
        value: "Foretaket er slettet",
        note: `${lov.foretak.navn} er registrert som slettet i Enhetsregisteret. Nummeret på nettsiden peker på et foretak som ikke lenger finnes.`,
      };
    }
    const bekreftet = lov.foretak ? ` Nummeret tilhører ${lov.foretak.navn}.` : "";
    return {
      name: "Lovpålagt informasjon",
      status: lov.status,
      value: lov.foretak ? "Org.nr. bekreftet" : "Org.nr. funnet",
      note:
        lov.detaljer.length === 0
          ? `Org.nr., kontaktinfo og personvernerklæring er på plass.${bekreftet}`
          : `Org.nr. er på plass, men ${lov.detaljer.length} ${lov.detaljer.length === 1 ? "opplysning" : "opplysninger"} mangler. Ehandelsloven § 8 krever adresse, e-post og telefon.${bekreftet}`,
    };
  })();

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
      // Forbeholdet står med tall, fordi tallet er grunnen til at cookie-raden
      // ikke kan si «brudd». Egen måling 7. oktober 2026, n = 24 norske nettsteder
      // skannet både i nettleser og som rå HTML.
      "Cookie-raden kan ikke avgjøre om samtykke håndteres riktig. Et sporingsskript i koden kan være sperret av Google Consent Mode eller et samtykkeverktøy, og av 16 norske sider vi målte med verifisert samtykkeoppsett viste bare 3 det i den servergjengitte HTML-en. Raden sier derfor aldri «brudd» – den sier hva som står i koden, og hva som må måles i en nettleser.",
      "Om en cookie er «strengt nødvendig» etter ekomloven § 3-15 er en juridisk vurdering. Ingen maskin kan gjøre den, og denne gjør den ikke.",
      "Organisasjonsnummeret slås opp i Enhetsregisteret. Vi sjekker at nummeret finnes, ikke at det er riktig foretak for nettsiden.",
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
