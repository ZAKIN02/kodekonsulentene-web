/**
 * Samtykkedeteksjon: skiller en side som sporer uten samtykke fra en side som
 * gjør det riktig.
 *
 * ## Hvorfor denne filen finnes
 *
 * Fram til nå telte skanningen cookies og sporingsdomener, og meldte brudd på
 * ekomloven § 3-15 så snart det var treff. Den visste ikke forskjell på en side
 * som setter `_ga` på første besøk og en side som laster Google Tag Manager med
 * `analytics_storage: 'denied'` som standard og ikke setter noe som helst.
 *
 * Målt 7. oktober 2026 på 24 norske nettsteder med både nettleserskanning og
 * servergjengitt HTML:
 *
 * - **16** hadde et verifisert `gtag('consent', 'default', …)`-kall i nettleseren.
 *   **3** av dem viste kallet i den servergjengitte HTML-en. **13 gjorde det ikke.**
 * - **20** hadde en gjenkjennelig samtykkeløsning i nettleseren. **9** viste
 *   løsningens skriptvert i HTML-en. **11 gjorde det ikke.**
 *
 * Konsekvensen er regelen hele filen er bygget rundt: **en sjekk som bare leser
 * servergjengitt HTML kan ikke dømme.** Den kan si «vi fant sporing» og «vi fant
 * ingen samtykkeløsning», men den kan ikke si at det ikke finnes en. Derfor er
 * `fail` fra HTML alene forbeholdt det ene tilfellet som faktisk er målt: en
 * cookie vi kjenner igjen som sporing, satt i `Set-Cookie` på første svar.
 *
 * ## Hva § 3-15 faktisk handler om
 *
 * Riktig lov er **LOV-2024-12-13-76** (ekomloven 2024), i kraft 1. januar 2025.
 * Ikke LOV-2024-06-21-41 – det er finanstilsynsloven.
 * Kilde: https://lovdata.no/lov/2024-12-13-76/§3-15
 *
 * Første ledd, ordrett:
 *
 * > «Det er ikke tillatt å lagre eller å skaffe seg tilgang til opplysninger i
 * > sluttbrukers eller brukers **kommunikasjonsutstyr** uten at den aktuelle
 * > sluttbrukeren eller brukeren er informert om blant annet hvilke opplysninger
 * > som behandles, formålet med behandlingen og hvem som behandler opplysningene,
 * > og uten at den aktuelle sluttbrukeren eller brukeren har gitt samtykke.
 * > Samtykke skal oppfylle kravene til samtykke i personvernforordningen.»
 *
 * Merk ordet: **kommunikasjonsutstyr**. «Terminalutstyr» er EU-direktivets og
 * EDPBs begrep, ikke den norske lovtekstens. Vi hadde «terminalutstyr» i et
 * tidlig utkast av denne filen, og det var feil sitat.
 *
 * Andre ledd gjør unntak for teknisk lagring eller adgang
 * a) «utelukkende for det formål å overføre kommunikasjon i et elektronisk
 *    kommunikasjonsnett», eller
 * b) «som er strengt nødvendig for å levere en informasjonssamfunnstjeneste etter
 *    den aktuelle sluttbrukerens eller brukerens **uttrykkelige forespørsel**».
 *
 * Tre ting følger av dette, og de styrer hele filen:
 *
 * 1. **Paragrafen gjelder lagring og tilgang – ikke nedlasting.** At nettleseren
 *    hentet `gtm.js` fra googletagmanager.com er ikke lagring i
 *    kommunikasjonsutstyret; det er en HTTP-forespørsel. Lagringen skjer når noe
 *    skriver en cookie eller en nøkkel i web storage. Derfor er «sporingsvert
 *    kontaktet» nedgradert fra bevis til indisium her.
 * 2. **Den er teknologinøytral.** Nkom: «bestemmelsen gjelder for lagring og
 *    tilgang til alle slags opplysninger … uavhengig av om det er snakk om
 *    personopplysninger eller ikke». Nkoms egen cookie-erklæring fører
 *    `localStorage` og `sessionStorage` under § 3-15. Derfor klassifiserer vi
 *    lagringsnøkler på samme måte som cookies.
 *    Kilde: https://nkom.no/internett/informasjonskapsler-cookies og
 *    https://nkom.no/informasjonskapsler
 * 3. **Ingen norsk myndighet har publisert en liste over hva som er «strengt
 *    nødvendig».** Datatilsynet gjengir bare lovens to unntak og viser videre til
 *    Nkom; Nkom gir ingen liste. Klassifiseringen her bygger derfor på
 *    leverandørenes egen dokumentasjon og på WP29 Opinion 04/2012 (WP194), som
 *    fortsatt er den autoritative tolkningen av samme direktivbestemmelse.
 *    Den er vår tekniske lesning, ikke en myndighetsgodkjent liste – og
 *    `vurderSamtykke` sier det i hver rapport.
 *
 * Et poeng fra WP194 som er verdt å ha i klartekst: analysecookies er **ikke**
 * unntatt. «In fact, the user can access all the functionalities provided by the
 * website when such cookies are disabled. As a consequence, these cookies do not
 * fall under the exemption defined in CRITERION A or B.» Lastbalanserings-cookies
 * for økten er derimot unntatt, under kriterium A.
 * Kilde: https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf
 *
 * Håndhevingen er delt (FOR-2024-12-20-3413 punkt 12): Nkom avgjør om løsningen
 * er omfattet og om unntakene gjelder, Datatilsynet vurderer om samtykket
 * oppfyller personvernforordningen. Datatilsynet kan først fatte vedtak etter at
 * Nkoms avgjørelse foreligger. Det er én grunn mer til at et skanneverktøy ikke
 * skal konkludere: selv tilsynene gjør det i to trinn.
 *
 * ## Alt her er rene funksjoner
 *
 * Ingen nettverk, ingen nettleser, ingen tilstand. Signalene samles inn i
 * `skann.mjs` og sendes hit som data, slik at dommen kan testes uten å laste en
 * nettside. Se `test/samtykke.test.ts`.
 */

/* ------------------------------------------------- samtykkeløsninger ---- */

/**
 * @typedef {object} Samtykkelosning
 * @property {string} id         Kort maskinnavn.
 * @property {string} navn       Vises til brukeren.
 * @property {string[]} domener  Verter løsningen laster fra. Eksakt match eller ekte underdomene.
 * @property {string[]} globaler Navn på `window`-egenskaper løsningen setter.
 * @property {string[]} cookies  Cookies løsningen bruker for å huske valget.
 * @property {string} kilde      Hvor signalene er hentet fra.
 * @property {string} sjekket    ISO-dato for sist kontroll.
 */

/**
 * Samtykkeløsninger vi kjenner igjen.
 *
 * Rekkefølgen er ikke tilfeldig: `cookieinformation` står først fordi den var
 * den klart mest brukte i vår egen måling (10 av 36 norske nettsteder, 7.
 * oktober 2026) – flere enn Cookiebot og OneTrust til sammen.
 *
 * **Det finnes ingen norsk samtykkeløsning.** Vi gikk gjennom IABs offisielle
 * CMP-register (271 registrerte leverandører per 7. oktober 2026,
 * https://cmplist.consensu.org/v2/cmp-list.json) og fant ingen norsk. De
 * nordiske er danske (Cookie Information, Cookiebot/Cybot, Conzent), finske
 * (Gravito, Alma Media) og svenske (Webbhuset). Det som markedsføres som
 * «norsk» er gjennomgående internasjonale produkter med norsk språkdrakt, eller
 * norske byråer som installerer andres løsning. Lista her har derfor ingen egen
 * «norsk» bolk – det ville vært å dikte opp en kategori.
 *
 * `globaler` er sterkere bevis enn `domener`, fordi en vert kan være proxyet bak
 * kundens eget domene. Og `CookieConsent` alene er svakt bevis: både Cookiebot,
 * Cookie Information og den åpne `vanilla-cookieconsent` bruker samme navn. Den
 * er derfor merket som delt nedenfor og gir treff på «en samtykkeløsning», ikke
 * på hvilken.
 *
 * @type {Samtykkelosning[]}
 */
export const SAMTYKKELOSNINGER = [
  {
    id: "cookie-information",
    navn: "Cookie Information",
    domener: ["cookieinformation.com", "policy.app.cookieinformation.com", "partner-integration-api.app.cookieinformation.com"],
    globaler: ["CookieInformation"],
    cookies: ["CookieInformationConsent"],
    kilde: "https://support.cookieinformation.com/en/articles/5373910-all-you-need-to-know-about-consents",
    sjekket: "2026-10-07",
  },
  {
    id: "cookiebot",
    navn: "Cookiebot",
    domener: ["cookiebot.com", "consent.cookiebot.com", "consentcdn.cookiebot.com", "cookiebot.eu", "consent.cookiebot.eu", "consentcdn.cookiebot.eu"],
    globaler: ["Cookiebot"],
    cookies: ["CookieConsent", "CookieConsentBulkTicket"],
    kilde: "https://usercentrics.com/docs/web/cookiebot/cookiebot-sdk",
    sjekket: "2026-10-07",
  },
  {
    id: "onetrust",
    navn: "OneTrust",
    domener: ["cookielaw.org", "cdn.cookielaw.org", "onetrust.com", "geolocation.onetrust.com", "onetrust.io", "cookiepro.com"],
    globaler: ["OneTrust", "Optanon", "OptanonWrapper"],
    cookies: ["OptanonConsent", "OptanonAlertBoxClosed", "eupubconsent-v2", "OTAdditionalConsentString", "OTGPPConsent"],
    kilde: "https://my.onetrust.com/articles/en_US/Knowledge/UUID-2dc719a8-4be5-8d16-1dc8-c7b4147b88e0",
    sjekket: "2026-10-07",
  },
  {
    id: "cookieyes",
    navn: "CookieYes",
    domener: ["cookieyes.com", "cdn-cookieyes.com", "app.cookieyes.com"],
    globaler: ["cookieyes", "CookieYes"],
    cookies: ["cookieyes-consent", "CookieLawInfoConsent", "viewed_cookie_policy"],
    kilde: "https://www.cookieyes.com/documentation/change-cookie-consent-using-cookieyes/",
    sjekket: "2026-10-07",
  },
  {
    id: "usercentrics",
    navn: "Usercentrics",
    // Usercentrics lagrer samtykket i localStorage, ikke i cookies. Vi hadde
    // `ucData` oppført som cookie i et tidlig utkast; det er ikke verifisert noe
    // sted. Navnene under er lagringsnøkler, og `klassifiserCookie` brukes på
    // dem fordi § 3-15 er teknologinøytral.
    domener: ["usercentrics.eu", "app.usercentrics.eu", "api.usercentrics.eu", "graphql.usercentrics.eu", "consents.usercentrics.eu", "uct.service.usercentrics.eu", "usercentrics.com"],
    globaler: ["UC_UI", "usercentrics", "__ucCmp"],
    cookies: ["uc_settings", "uc_services", "uc_tcf", "uc_user_interaction", "uc_user_country", "uc_gcm"],
    kilde: "https://usercentrics.com/docs/",
    sjekket: "2026-10-07",
  },
  {
    id: "klaro",
    navn: "Klaro",
    // Skriptverten er cdn.kiprotect.com, ikke klaro.org. klaro.org er
    // dokumentasjonssiden, og Klaro selvhostes ofte – da er globalen det eneste
    // signalet vi har.
    domener: ["kiprotect.com", "cdn.kiprotect.com", "heyklaro.com"],
    globaler: ["klaro", "klaroConfig"],
    cookies: ["klaro"],
    kilde: "https://github.com/klaro-org/klaro-js/blob/master/src/consent-manager.js",
    sjekket: "2026-10-07",
  },
  {
    id: "complianz",
    navn: "Complianz (WordPress)",
    domener: [],
    globaler: ["cmplz_", "complianz", "cmplzConsentData"],
    cookies: ["cmplz_banner-status", "cmplz_consented_services", "cmplz_id", "cmplz_policy_id", "cmplz_saved_categories", "cmplz_saved_services", "cmplz_consent_mode"],
    kilde: "https://complianz.io/cookies-set-by-complianz/",
    sjekket: "2026-10-07",
  },
  {
    id: "real-cookie-banner",
    navn: "Real Cookie Banner (WordPress)",
    domener: [],
    globaler: ["realCookieBanner"],
    cookies: ["real_cookie_banner", "real_cookie_banner-tcf", "real_cookie_banner-gcm", "real_cookie_banner-test"],
    kilde: "Egen lesning av leverandørens eget WordPress-plugin (devowl.io), nedlastet fra wordpress.org 2026-10-07.",
    sjekket: "2026-10-07",
  },
  {
    id: "moove-gdpr",
    navn: "GDPR Cookie Compliance (WordPress)",
    domener: [],
    globaler: ["MooveGDPR", "moove_frontend_gdpr_scripts"],
    cookies: ["moove_gdpr_popup", "moove_gdpr_geo_cache"],
    kilde: "Egen lesning av leverandørens eget WordPress-plugin (moove), nedlastet fra wordpress.org 2026-10-07.",
    sjekket: "2026-10-07",
  },
  {
    id: "borlabs",
    navn: "Borlabs Cookie (WordPress)",
    domener: [],
    globaler: ["BorlabsCookie", "borlabsCookieConfig"],
    cookies: ["borlabs-cookie", "borlabs-cookie-script-blocker"],
    kilde: "https://borlabs.io/kb/javascript-api/",
    sjekket: "2026-10-07",
  },
  {
    id: "iubenda",
    navn: "Iubenda",
    domener: ["iubenda.com", "cdn.iubenda.com", "cs.iubenda.com", "idb.iubenda.com"],
    globaler: ["_iub", "iubenda"],
    cookies: ["_iub_cs-s", "euconsent-v2"],
    kilde: "https://www.iubenda.com/en/help/1383-custom-projects-iubenda-integration-guide",
    sjekket: "2026-10-07",
  },
  {
    id: "termly",
    navn: "Termly",
    // TERMLY_API_CACHE er en localStorage-nøkkel, ikke en cookie. Termlys
    // samtykke-cookienavn er ikke verifisert noe sted, så vi oppgir det ikke.
    domener: ["termly.io", "app.termly.io"],
    globaler: ["Termly", "TERMLY_CUSTOM_BLOCKING_MAP"],
    cookies: ["TERMLY_API_CACHE"],
    kilde: "https://support.termly.io/en/articles/8952694-termly-cmp-embed-script-versions",
    sjekket: "2026-10-07",
  },
  {
    id: "sourcepoint",
    navn: "Sourcepoint",
    // IABs consensu.org-hosting ble avviklet 10. juli 2023, så
    // «sourcepoint.mgr.consensu.org» er foreldet og står ikke her.
    domener: ["sp-prod.net", "cmp.sp-prod.net", "privacy-mgmt.com", "cdn.privacy-mgmt.com"],
    globaler: ["_sp_", "__tcfapi"],
    cookies: ["consentUUID", "_sp_v1_data", "_sp_v1_ss", "_sp_su", "_sp_v1_consent"],
    kilde: "https://docs.sourcepoint.com/hc/en-us/articles/4405387989011-Cookies-and-local-storage",
    sjekket: "2026-10-07",
  },
  {
    id: "cookiefirst",
    navn: "CookieFirst",
    domener: ["cookiefirst.com", "consent.cookiefirst.com"],
    globaler: ["CookieFirst"],
    cookies: ["cookiefirst-consent", "cookiefirst-id"],
    kilde: "https://support.cookiefirst.com/hc/en-us/articles/360011568738-Cookie-Banner-Public-API-documentation",
    sjekket: "2026-10-07",
  },
  {
    id: "cookiehub",
    navn: "CookieHub",
    domener: ["cookiehub.net", "cookiehub.com", "dash.cookiehub.com"],
    globaler: ["cookiehub"],
    cookies: ["cookiehub"],
    kilde: "https://support.cookiehub.com/article/284-cookies-used-by-cookiehub",
    sjekket: "2026-10-07",
  },
  {
    id: "osano",
    navn: "Osano",
    domener: ["osano.com", "cmp.osano.com"],
    globaler: ["Osano"],
    cookies: ["osano_consentmanager", "osano_consentmanager_uuid"],
    kilde: "https://osano.com/cookieconsent/documentation/javascript-api",
    sjekket: "2026-10-07",
  },
  {
    id: "didomi",
    navn: "Didomi",
    domener: ["didomi.io", "sdk.privacy-center.org", "api.privacy-center.org"],
    globaler: ["Didomi", "didomiConfig"],
    cookies: ["didomi_token", "didomi_dcs", "euconsent-v2"],
    kilde: "https://docs.didomi.io/get-started/general/cookies-and-local-storage",
    sjekket: "2026-10-07",
  },
  {
    id: "axeptio",
    navn: "Axeptio",
    domener: ["axept.io", "static.axept.io", "api.axept.io", "client.axept.io"],
    globaler: ["axeptio", "_axcb", "axeptioSettings"],
    cookies: ["axeptio_authorized_vendors", "axeptio_cookies", "axeptio_all_vendors"],
    kilde: "Egen lesning av leverandørens eget WordPress-plugin (axeptio-sdk-integration), nedlastet fra wordpress.org 2026-10-07.",
    sjekket: "2026-10-07",
  },
  {
    id: "cookie-script",
    navn: "CookieScript",
    // «CookieScriptConsent» er ikke verifisert i leverandørens dokumentasjon, så
    // den står ikke som cookienavn. Globalen er det dokumenterte signalet.
    domener: ["cookie-script.com", "cdn.cookie-script.com"],
    globaler: ["CookieScript"],
    cookies: [],
    kilde: "https://help.cookie-script.com/en/articles/30246-custom-functions",
    sjekket: "2026-10-07",
  },
  {
    id: "consentmanager",
    navn: "consentmanager.net",
    domener: ["consentmanager.net", "delivery.consentmanager.net", "cdn.consentmanager.net"],
    globaler: ["__cmp", "cmp_block_ignoredomains"],
    cookies: ["__cmpconsent", "__cmpconsents", "__cmpiab", "__cmpiabli", "__cmpiuid", "__cmpcc"],
    kilde: "https://www.consentmanager.net/en/help/developer-reference/cookies-set-by-the-cmp/",
    sjekket: "2026-10-07",
  },
  {
    id: "monsido",
    navn: "Monsido / Acquia Optimize",
    // Dansk. Cookienavnene er ikke publisert, så gjenkjenningen står på globalen.
    domener: ["monsido-consent.com", "monsido.com"],
    globaler: ["monsidoConsentManager"],
    cookies: [],
    kilde: "https://help.monsido.com/en/articles/5519385-consent-manager",
    sjekket: "2026-10-07",
  },
  {
    id: "tarteaucitron",
    navn: "tarteaucitron.js",
    domener: ["tarteaucitron.io"],
    globaler: ["tarteaucitron"],
    cookies: ["tarteaucitron"],
    kilde: "https://github.com/AmauriC/tarteaucitron.js/blob/master/tarteaucitron.js",
    sjekket: "2026-10-07",
  },
  {
    id: "orejime",
    navn: "Orejime (åpen kildekode)",
    domener: [],
    globaler: ["Orejime"],
    cookies: ["orejime"],
    kilde: "https://github.com/empreinte-digitale/orejime/blob/main/README.md",
    sjekket: "2026-10-07",
  },
  {
    id: "vanilla-cookieconsent",
    navn: "vanilla-cookieconsent (åpen kildekode)",
    domener: [],
    globaler: [],
    cookies: ["cc_cookie"],
    kilde: "https://cookieconsent.orestbida.com/",
    sjekket: "2026-10-07",
  },
];

/**
 * `window`-navn som beviser at EN samtykkeløsning finnes, men ikke hvilken.
 *
 * `CookieConsent` deles av minst tre uavhengige produkter (Cookiebot, Cookie
 * Information og vanilla-cookieconsent). Vi så det selv: et nettsted med
 * `window.CookieConsent` og ingen Cookiebot-vert ble i et tidlig utkast meldt
 * som «Cookiebot». Feil navn på leverandøren er like gale som feil dom.
 */
export const DELTE_GLOBALER = ["CookieConsent"];

/** TCF-signaler (IAB Transparency & Consent Framework). Rammeverk, ikke produkt. */
export const TCF_GLOBALER = ["__tcfapi", "__gpp", "__uspapi"];

const VERT_TIL_LOSNING = new Map();
for (const l of SAMTYKKELOSNINGER) {
  for (const d of l.domener) VERT_TIL_LOSNING.set(d.toLowerCase(), l);
}

/** Eksakt domene eller ekte underdomene – aldri delstreng. Samme regel som i sporere.mjs. */
function losningForVert(vert) {
  if (typeof vert !== "string" || !vert) return null;
  const h = vert.toLowerCase().replace(/\.$/, "");
  const direkte = VERT_TIL_LOSNING.get(h);
  if (direkte) return direkte;
  for (const [domene, losning] of VERT_TIL_LOSNING) {
    if (h.endsWith(`.${domene}`)) return losning;
  }
  return null;
}

/**
 * Finner samtykkeløsninger fra signalene skanningen samlet inn.
 *
 * Hvert treff bærer sitt eget bevis, slik at rapporten kan si HVORFOR vi mener
 * en løsning er der. Et treff på bare et cookienavn er svakere enn et treff på
 * en `window`-global, og brukeren skal kunne se forskjellen.
 *
 * @param {object} signaler
 * @param {string[]} [signaler.verter]      Verter siden hentet noe fra.
 * @param {string[]} [signaler.globaler]    `window`-navn som fantes etter innlasting.
 * @param {string[]} [signaler.cookienavn]  Cookies som ble satt.
 * @param {string}   [signaler.html]        Servergjengitt HTML, for vert-treff uten nettleser.
 * @returns {{id: string, navn: string, bevis: string[]}[]}
 */
export function finnSamtykkelosninger(signaler = {}) {
  const { verter = [], globaler = [], cookienavn = [], html = "" } = signaler;
  /** @type {Map<string, {id: string, navn: string, bevis: Set<string>}>} */
  const treff = new Map();

  const legg = (losning, bevis) => {
    const f = treff.get(losning.id);
    if (f) f.bevis.add(bevis);
    else treff.set(losning.id, { id: losning.id, navn: losning.navn, bevis: new Set([bevis]) });
  };

  for (const v of verter) {
    const l = losningForVert(v);
    if (l) legg(l, `vert: ${v}`);
  }

  const globalSett = new Set(globaler);
  for (const l of SAMTYKKELOSNINGER) {
    for (const g of l.globaler) {
      if (globalSett.has(g)) legg(l, `window.${g}`);
    }
  }

  // Cookienavn er svakeste bevis og brukes bare når det er et navn løsningen
  // eier alene. `euconsent-v2` er TCF-rammeverkets eget navn og tilhører ingen
  // enkelt leverandør, så det telles ikke som treff på en navngitt løsning.
  const cookieSett = new Set(cookienavn.map((n) => String(n)));
  for (const l of SAMTYKKELOSNINGER) {
    for (const c of l.cookies) {
      if (c === "euconsent-v2") continue;
      if (cookieSett.has(c)) legg(l, `cookie: ${c}`);
      else if (c.endsWith("_") && [...cookieSett].some((n) => n.startsWith(c))) legg(l, `cookie: ${c}*`);
    }
  }

  // HTML-veien: bare vertstreff i markup. Ingen ordsøk. «samtykke» på en side
  // som SKRIVER om samtykke er ikke en samtykkeløsning, og den fella gikk vi i
  // selv under utprøvingen: datatilsynet.no fikk treff på ordet.
  if (html) {
    for (const [domene, losning] of VERT_TIL_LOSNING) {
      if (html.includes(domene)) legg(losning, `vert i HTML: ${domene}`);
    }
  }

  // Delte globaler: beviser at EN løsning finnes, ikke hvilken. Vi navngir ikke
  // en leverandør på et navn tre produkter deler – men vi later heller ikke som
  // om signalet ikke finnes, for da ville en side med vanilla-cookieconsent
  // blitt lest som «ingen samtykkeløsning». Det skjedde i vår egen utprøving:
  // et norsk nettsted med window.CookieConsent og Consent Mode «denied» var på
  // vei til å bli meldt for sporing uten samtykke.
  const delte = DELTE_GLOBALER.filter((g) => globalSett.has(g));
  if (delte.length > 0 && treff.size === 0) {
    treff.set("ukjent-losning", {
      id: "ukjent-losning",
      navn: "Samtykkeløsning (leverandør ikke identifisert)",
      bevis: new Set(delte.map((g) => `window.${g}`)),
    });
  }

  return [...treff.values()]
    .map((t) => ({ id: t.id, navn: t.navn, bevis: [...t.bevis].sort() }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/* ----------------------------------------------- Google Consent Mode ---- */

/**
 * Kategoriene i Consent Mode v2 som avgjør dommen.
 *
 * Bare de fire som styrer annonser og analyse. `functionality_storage`,
 * `personalization_storage` og `security_storage` er holdt utenfor med vilje:
 * de dekker lagring av brukerens egne valg og sikkerhetstilstand, og det er
 * nettopp den typen lagring unntaket i § 3-15 er laget for. De er dessuten
 * vanlige å sette til «granted» i helt normale oppsett – vi så det på flere av
 * nettstedene vi målte 7. oktober 2026, side om side med «denied» på alle fire
 * annonse- og analysekategorier.
 *
 * Tok vi dem med, ville et korrekt oppsett blitt nedgradert for noe som ikke er
 * sporing. Det er den feilen hele denne filen ble skrevet for å fjerne.
 */
export const SAMTYKKEKATEGORIER = [
  "ad_storage",
  "analytics_storage",
  "ad_user_data",
  "ad_personalization",
];

/** Rapporteres som opplysning, ikke som grunnlag for dom. Se over. */
export const OVRIGE_KATEGORIER = [
  "personalization_storage",
  "functionality_storage",
  "security_storage",
];

/**
 * Tolker Google Consent Mode.
 *
 * Hovedsignalet er `window.google_tag_data.ics` – Googles interne
 * samtykketilstand. Felt vi leser:
 *
 * - `usedDefault: true`  – et `gtag('consent', 'default', …)`-kall har faktisk kjørt
 * - `entries[k].default` – `false` betyr «denied» for den kategorien
 *
 * > **⚠ Dette objektet er IKKE dokumentert av Google.** Det finnes, det brukes av
 * > flere verktøy, og vi har verifisert formen selv på 36 norske nettsteder
 * > 7. oktober 2026 – men Google gir ingen API-garanti, og navnet kan forsvinne i
 * > en hvilken som helst GTM-oppdatering. Den dokumenterte veien er å lese
 * > `gcs`- og `gcd`-parameterne på utgående forespørsler til Google
 * > (https://developers.google.com/tag-platform/security/concepts/consent-mode).
 * > Derfor gir denne funksjonen `null` – ikke `false` – når `ics` mangler: at vi
 * > ikke fant signalet skal aldri leses som at samtykke ikke er håndtert. Dagen
 * > `ics` forsvinner, blir alle dommer «vet ikke», og det er den trygge retningen
 * > å svikte i.
 *
 * Reserveveien er `dataLayer`-kallet eller teksten i HTML-en. Googles eget
 * eksempel er `gtag('consent', 'default', {'ad_storage': 'denied', …})`, og
 * rekkefølgen er avgjørende: «If your consent code is called out of order,
 * consent defaults won't work.»
 * Kilde: https://developers.google.com/tag-platform/security/guides/consent
 *
 * Målt 7. oktober 2026 på 36 norske nettsteder: 16 hadde `usedDefault: true`.
 * Fire hadde `ics` med tomme `entries` og `usedDefault: false` – Consent
 * Mode-skallet var lastet, men ingen standardverdi satt. Det er nettopp
 * forskjellen denne funksjonen må kunne uttrykke, og den gir `null` for
 * «vet ikke» i stedet for å gjette.
 *
 * ## Den viktigste falske positiven i hele verktøyet
 *
 * Google har to moduser. I **basic** blokkeres taggene til brukeren har svart, og
 * ingen forespørsel går til Google før det. I **advanced** lastes taggene med
 * standard «denied», og Google mottar «consent state and measurements without
 * cookies» – altså cookieløse pings – *før* samtykke. Et riktig oppsett i advanced
 * mode skal derfor se ut som sporing for en skanner som bare teller forespørsler.
 * Det er nøyaktig feilen denne filen retter.
 * Kilde: https://developers.google.com/tag-platform/security/concepts/consent-mode
 *
 * @param {object} signaler
 * @param {object|null} [signaler.ics]        Avlest `window.google_tag_data.ics`.
 * @param {string[]}    [signaler.consentKall] Serialiserte `dataLayer`-kall med `consent`/`default`.
 * @param {string}      [signaler.html]        Servergjengitt HTML, når nettleser ikke er brukt.
 */
export function tolkConsentMode(signaler = {}) {
  const { ics = null, consentKall = [], html = "" } = signaler;

  /** @type {string[]} */ const nektet = [];
  /** @type {string[]} */ const tillatt = [];
  let standardSatt = false;
  let tilstede = false;

  if (ics && typeof ics === "object") {
    tilstede = true;
    standardSatt = ics.usedDefault === true;
    const entries = ics.entries && typeof ics.entries === "object" ? ics.entries : {};
    for (const [navn, verdi] of Object.entries(entries)) {
      if (!verdi || typeof verdi !== "object") continue;
      if (verdi.default === false) nektet.push(navn);
      else if (verdi.default === true) tillatt.push(navn);
    }
  }

  // Tekstveien er reserve: den brukes når vi ikke har `ics`, altså når sjekken
  // bare har HTML. Den beviser at kallet STÅR der, ikke at det kjørte først.
  const tekst = consentKall.length ? consentKall.join(" ") : html;
  if (tekst) {
    const harDefaultKall = /consent['"]?\s*,\s*['"]default['"]/i.test(tekst) || consentKall.length > 0;
    if (harDefaultKall) {
      tilstede = true;
      standardSatt = true;
      for (const kategori of SAMTYKKEKATEGORIER) {
        const nekt = new RegExp(`${kategori}["']?\\s*[:=]\\s*["']denied["']`, "i");
        const tillat = new RegExp(`${kategori}["']?\\s*[:=]\\s*["']granted["']`, "i");
        if (nekt.test(tekst) && !nektet.includes(kategori)) nektet.push(kategori);
        else if (tillat.test(tekst) && !tillatt.includes(kategori)) tillatt.push(kategori);
      }
    }
  }

  /**
   * Tre utfall, ikke to:
   *   true  – standard er satt, og ingen samtykkekategori er «granted»
   *   false – standard er satt, men minst én samtykkekategori er «granted»
   *   null  – vi kan ikke se standardtilstanden, og gjetter ikke
   */
  let standardNektet = null;
  if (standardSatt && nektet.length > 0) {
    standardNektet = tillatt.filter((k) => SAMTYKKEKATEGORIER.includes(k)).length === 0;
  }

  return {
    tilstede,
    standardSatt,
    standardNektet,
    nektet: nektet.sort(),
    tillattSomKreverSamtykke: tillatt.filter((k) => SAMTYKKEKATEGORIER.includes(k)).sort(),
    /** Opplysning, ikke grunnlag for dom. Se OVRIGE_KATEGORIER. */
    tillattOvrige: tillatt.filter((k) => OVRIGE_KATEGORIER.includes(k)).sort(),
  };
}

/* ------------------------------------------- klassifisering av cookies ---- */

/**
 * @typedef {object} CookieKlasse
 * @property {string} id
 * @property {RegExp} monster  Må treffe HELE navnet (`^…$`), ellers treffer vi for bredt.
 * @property {"teknisk"|"samtykkelager"|"krever-samtykke"} klasse
 * @property {string} hva      Én setning til brukeren.
 * @property {string} kilde
 * @property {string} sjekket
 */

/**
 * Cookies vi kan sette navn på.
 *
 * Tre klasser:
 *
 * - **`teknisk`** – lastbalansering, økt, CSRF, botfiltrering, språkvalg.
 *   Lagringen er der for å levere tjenesten brukeren ba om. Dette er den
 *   kategorien unntaket i § 3-15 er laget for, men unntaket er en juridisk
 *   vurdering per cookie, og klassen her er vår tekniske lesning av hva cookien
 *   er – ikke en dom om at den er lovlig.
 * - **`samtykkelager`** – samtykkeløsningens egen cookie, som husker valget.
 *   Uten den må banneret spørre på nytt hver gang. Å telle den som brudd er
 *   selvmotsigende: den finnes bare fordi siden spør om samtykke.
 * - **`krever-samtykke`** – analyse, markedsføring, adferdsopptak, A/B-testing.
 *   Her er vi strenge med oss selv: bare navn der leverandøren selv sier hva
 *   cookien gjør, eller der navnet er entydig knyttet til et sporingsprodukt.
 *
 * Alt annet er **ukjent**, og ukjent er et gyldig svar. Det er bedre enn tjue
 * gjettede klassifiseringer, fordi en gjetning i «krever-samtykke»-retningen er
 * en påstand om lovbrudd.
 *
 * @type {CookieKlasse[]}
 */
export const COOKIE_KLASSER = [
  /* --------------------------------- teknisk: økt og innlogging ---- */
  {
    id: "php-okt",
    monster: /^(PHPSESSID|PHPSESSIONID)$/i,
    klasse: "teknisk",
    hva: "PHP-øktcookie. Holder deg innlogget og husker handlekorg mellom sidevisninger.",
    kilde: "https://www.php.net/manual/en/session.configuration.php#ini.session.name",
    sjekket: "2026-10-07",
  },
  {
    id: "java-okt",
    monster: /^JSESSIONID$/i,
    klasse: "teknisk",
    hva: "Java-øktcookie (Servlet-standarden).",
    kilde: "https://jakarta.ee/specifications/servlet/",
    sjekket: "2026-10-07",
  },
  {
    id: "aspnet-okt",
    monster: /^(ASP\.NET_SessionId|\.AspNetCore\.Session|\.AspNetCore\.Antiforgery\..+)$/i,
    klasse: "teknisk",
    hva: "ASP.NET-øktcookie eller CSRF-token.",
    kilde: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/app-state",
    sjekket: "2026-10-07",
  },
  {
    id: "generisk-okt",
    monster: /^(sessionid|session_id|sess|SESS[0-9a-f]{32}|connect\.sid|laravel_session|_session_id|sid)$/i,
    klasse: "teknisk",
    // WP29 Opinion 04/2012, kriterium B: «user-input» og session-id er unntatt,
    // men bare som ØKTcookies. En vedvarende innloggingscookie er det ikke:
    // «Persistent login cookies which store an authentication token across
    // browser sessions are not exempted under CRITERION B.»
    hva: "Øktcookie. Knytter forespørslene dine til samme besøk.",
    kilde: "https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf",
    sjekket: "2026-10-07",
  },
  {
    id: "csrf",
    monster: /^(csrf_token|csrftoken|XSRF-TOKEN|_csrf|Crumb|siteUserCrumb|__Host-authjs\.csrf-token|__Secure-authjs\.callback-url|__Host-next-auth\.csrf-token|__Host-hs-membership-csrf)$/i,
    klasse: "teknisk",
    hva: "Sikkerhetstoken mot forfalskede forespørsler (CSRF).",
    kilde: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
    sjekket: "2026-10-07",
  },

  /* --------------------------------- teknisk: last og infrastruktur ---- */
  {
    id: "cloudflare",
    monster: /^(__cf_bm|cf_clearance|__cflb|__cfruid|__cfseq|_cfuvid|__cfuvid|cf_ob_info|cf_use_ob|__cfwaitingroom|cf_chl_.*)$/i,
    klasse: "teknisk",
    // Cloudflare er den tydeligste kilden i hele lista: «all the cookies listed
    // below are strictly necessary to provide the services requested by our
    // customers». Men merk at ordet «consent» ikke står noe sted på siden – de
    // sier «strictly necessary» og ber kundene OPPLYSE om cookiene. At de ikke
    // krever samtykke er altså ikke noe Cloudflare har sagt.
    hva: "Cloudflares botfiltrering, køsystem eller lastbalansering. Cloudflare fører disse som strengt nødvendige, og ber samtidig kundene opplyse om dem.",
    kilde: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/",
    sjekket: "2026-10-07",
  },
  {
    id: "azure-affinitet",
    monster: /^(ARRAffinity|ARRAffinitySameSite|ApplicationGateway.*Affinity.*)$/i,
    klasse: "teknisk",
    hva: "Azure-lastbalansering. Sørger for at du treffer samme server gjennom besøket. WP29 regner lastbalansering for økten som unntatt (kriterium A).",
    kilde: "https://learn.microsoft.com/en-us/azure/app-service/overview-arr-affinity-session",
    sjekket: "2026-10-07",
  },
  {
    id: "f5-bigip",
    monster: /^(BIGipServer.*|TS[0-9a-f]{6,}|LastMRH_Session|MRHSession|ASLBSA|ASLBSACORS|PD-S-SESSION-ID)$/i,
    klasse: "teknisk",
    hva: "Lastbalanserer eller brannmur (F5 BIG-IP / Access Policy Manager).",
    kilde: "Egen måling 2026-10-07: observert på norske nettsteder bak F5-infrastruktur, sammen med andre BIG-IP-navn.",
    sjekket: "2026-10-07",
  },
  {
    id: "aws-alb",
    monster: /^(AWSALB|AWSALBCORS|AWSELB)$/i,
    klasse: "teknisk",
    hva: "AWS-lastbalansering.",
    kilde: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html",
    sjekket: "2026-10-07",
  },
  {
    id: "recaptcha",
    monster: /^_GRECAPTCHA$/i,
    klasse: "teknisk",
    // Omstridt, og det skal stå her. Google kaller den «a necessary cookie …
    // for the purpose of providing its risk analysis», men sier ingenting om
    // samtykke, og cookien er ikke oppført i Googles egne cookie-oversikter.
    // Østerriksk forvaltningsdomstol kom til motsatt resultat i 2024, og WP194
    // sier at sikkerhetsunntaket ikke dekker «security of websites … that have
    // not been explicitly requested by the user». Vi klassifiserer den som
    // teknisk, altså i retningen som IKKE anklager noen, og sier at det er
    // omstridt.
    hva: "Googles reCAPTCHA. Google kaller den nødvendig for risikoanalysen, men om den er unntatt samtykkekravet er omstridt – en østerriksk domstol kom i 2024 til at den ikke er det.",
    kilde: "https://developers.google.com/recaptcha/docs/faq",
    sjekket: "2026-10-07",
  },

  /* --------------------------------- teknisk: plattform og CMS ---- */
  {
    id: "wordpress",
    monster: /^(wordpress_test_cookie|wordpress_[0-9a-f]{32}|wordpress_logged_in_[0-9a-f]+|wordpress_sec_[0-9a-f]+|wp-settings-\d+|wp-settings-\d+-\d+|wp-settings-time-\d+|wp_lang|comment_author_[0-9a-f]+|comment_author_email_[0-9a-f]+|comment_author_url_[0-9a-f]+)$/i,
    klasse: "teknisk",
    // WordPress bruker ALDRI ordene «strictly necessary» eller «essential» om
    // disse. Klassifiseringen er vår lesning av hva de gjør, ikke leverandørens
    // juridiske merking. Og PHPSESSID er IKKE en WordPress-cookie – den settes
    // av PHP selv, fra et plugin eller tema.
    hva: "WordPress-cookie for innlogging, språk, kommentarfelt eller admin-innstillinger.",
    kilde: "https://developer.wordpress.org/advanced-administration/wordpress/cookies/",
    sjekket: "2026-10-07",
  },
  {
    id: "woocommerce",
    monster: /^(woocommerce_cart_hash|woocommerce_items_in_cart|wp_woocommerce_session_[0-9a-f]+|woocommerce_recently_viewed|store_notice.*)$/i,
    klasse: "teknisk",
    hva: "WooCommerce-handlekorg. WooCommerce oppgir at ingen personopplysninger lagres i dem.",
    kilde: "https://woocommerce.com/document/woocommerce-cookies/",
    sjekket: "2026-10-07",
  },
  {
    id: "episerver",
    monster: /^(EPiStateMarker|EPiServer_Commerce_AnonymousId|EPi:NumberOfVisits|EPi_NumberOfVisits|\.EPiForm_BID|\.EPiForm_VisitorIdentifier|FormActivated)$/i,
    klasse: "teknisk",
    hva: "Optimizely CMS (tidl. Episerver). Holder redigerings-, skjema- og handlekorgtilstand.",
    kilde: "Egen måling 2026-10-07: observert på norske Optimizely CMS-nettsteder. Samme navn står i Datatilsynets egen cookie-erklæring, som fører dem som nødvendige.",
    sjekket: "2026-10-07",
  },
  {
    id: "liferay",
    monster: /^(LFR_SESSION_STATE_\d+|COOKIE_SUPPORT|GUEST_LANGUAGE_ID)$/i,
    klasse: "teknisk",
    hva: "Liferay-portalens økt- og språktilstand.",
    kilde: "Egen måling 2026-10-07: observert sammen med JSESSIONID på Liferay-drevne norske nettsteder.",
    sjekket: "2026-10-07",
  },
  {
    id: "shopify-noedvendig",
    monster: /^(__Host-Http-shop_binding|_shopify_essential|_shopify_test|cart|cart_currency|discount_code|localization|login_with_shop_finalize|shopify_pay|storefront_digest|_shopify_country)$/i,
    klasse: "teknisk",
    // Navnene er hentet fra Shopifys egen overskrift «Cookies Necessary for the
    // Functioning of the Store». Flere navn som før sto her finnes ikke lenger i
    // policyen (`cart_sig`, `cart_ts`, `secure_customer_sig`, `_secure_session_id`,
    // `keep_alive`), og `_tracking_consent` sluttet Shopify å sette 15. september
    // 2025. De er fjernet i stedet for å stå på gammel hukommelse.
    hva: "Shopify-handlekorg og kasse. Shopify fører disse under «nødvendige for at butikken fungerer».",
    kilde: "https://www.shopify.com/legal/cookies",
    sjekket: "2026-10-07",
  },
  {
    id: "wix-noedvendig",
    monster: /^(XSRF-TOKEN|svSession|wixSession|hs|bSession|ssr-caching|server-session-bind|client-session-bind|oAuthState|fedops\.logger\.sessionId|_wixAB3\|.*)$/i,
    klasse: "teknisk",
    hva: "Wix-plattformens økt- og sikkerhetscookies. Wix merker dem selv som «Essential».",
    kilde: "https://support.wix.com/en/article/cookies-and-your-wix-site",
    sjekket: "2026-10-07",
  },
  {
    id: "squarespace-noedvendig",
    monster: /^(SiteUserInfo|SiteUserSecureAuthToken|_ssid|CART|hasCart|CHECKOUT_WEBSITE|Locked|RecentRedirect|orderStatusSessionToken|ss_sd|Test)$/,
    klasse: "teknisk",
    hva: "Squarespace-cookie for innlogging, handlekorg eller svindelkontroll. Squarespace fører dem under «Necessary and required».",
    kilde: "https://support.squarespace.com/hc/en-us/articles/360001264507-The-cookies-Squarespace-uses",
    sjekket: "2026-10-07",
  },
  {
    id: "sprakvalg",
    monster: /^(language|lang|locale|i18n_redirected|NEXT_LOCALE|device-width|darkmode|theme|language-preference|cart_currency)$/i,
    klasse: "teknisk",
    // WP194 kriterium B dekker UI-tilpasning bare når brukeren «explicitly
    // requested» den, og bare som økt- eller korttidscookie. Navnet alene sier
    // ikke om det er oppfylt, så dette er «antatt».
    hva: "Husker et valg du har gjort selv: språk, tema eller skjermbredde. Unntaket gjelder bare hvis valget faktisk er gjort av brukeren.",
    kilde: "Egen måling 2026-10-07. Navnene er konvensjon, ikke et produkt – innholdet er ikke kontrollert.",
    sjekket: "2026-10-07",
  },

  /* --------------------------------- samtykkelager ---- */
  {
    id: "samtykkelager-onetrust",
    monster: /^(OptanonConsent|OptanonAlertBoxClosed|eupubconsent-v2|OTAdditionalConsentString|OTGPPConsent|_OT_sm)$/i,
    klasse: "samtykkelager",
    hva: "OneTrusts egen cookie. Husker hva du svarte i samtykkebanneret.",
    kilde: "https://my.onetrust.com/articles/en_US/Knowledge/UUID-2dc719a8-4be5-8d16-1dc8-c7b4147b88e0",
    sjekket: "2026-10-07",
  },
  {
    id: "samtykkelager-google",
    monster: /^(SOCS|__hs_opt_out|__hs_do_not_track|__hs_initial_opt_in|__hs_cookie_cat_pref|__hs_gpc_banner_dismiss|mtm_consent|mtm_consent_removed|mtm_cookie_consent|ss_performancecookiesAllowed|ss_marketingcookiesAllowed)$/,
    klasse: "samtykkelager",
    // SOCS er Googles egen cookie for «a user's state regarding their cookies
    // choices». HubSpots __hs_opt_out-familie er HubSpots egen «Necessary»-gruppe.
    // Begge sto feil i et tidlig utkast: de var klassifisert som sporing, altså
    // ville vi meldt noen for Å HUSKE at brukeren sa nei.
    hva: "Leverandørens egen cookie for å huske samtykkevalget – eller for å huske at du har reservert deg.",
    kilde: "https://policies.google.com/technologies/cookies?hl=en",
    sjekket: "2026-10-07",
  },
  {
    id: "samtykkelager-ovrige",
    monster: /^(CookieConsent|CookieConsentBulkTicket|CookieInformationConsent|cookieyes-consent|CookieLawInfoConsent|viewed_cookie_policy|cookielawinfo-checkbox-[a-z-]+|CookieScriptConsent|cookiefirst-consent|cookiefirst-id|cookiehub|borlabs-cookie|borlabs-cookie-script-blocker|klaro|klaro-consent|orejime|didomi_token|didomi_dcs|axeptio_cookies|axeptio_authorized_vendors|axeptio_all_vendors|osano_consentmanager|osano_consentmanager_uuid|cc_cookie|uc_settings|uc_services|uc_tcf|uc_user_interaction|uc_gcm|tarteaucitron|_iub_cs-s|TERMLY_API_CACHE|euconsent-v2|consentUUID|_sp_su|_sp_v1_consent|_sp_v1_data|_sp_v1_ss|__cmpconsents?|__cmpconsentx.*|__cmpiab.*|__cmpcc|moove_gdpr_popup|real_cookie_banner.*|cmplz_[a-z_-]+)$/,
    klasse: "samtykkelager",
    hva: "Samtykkeløsningens egen cookie eller lagringsnøkkel. Husker valget ditt, slik at banneret ikke spør på nytt.",
    kilde: "Navnene står i leverandørdokumentasjonen oppført i SAMTYKKELOSNINGER i denne filen.",
    sjekket: "2026-10-07",
  },

  /* --------------------------------- krever samtykke ---- */
  {
    id: "google-analytics-4",
    monster: /^(_ga|_ga_[A-Z0-9]+)$/,
    klasse: "krever-samtykke",
    // Google dokumenterer selv: _ga «Used to distinguish users», _ga_<id> «Used
    // to persist session state». WP194: analysecookies er ikke unntatt, fordi
    // brukeren får alle funksjonene på siden uten dem.
    hva: "Google Analytics 4. Skiller nettleseren din fra andre og holder økten på tvers av sidevisninger.",
    kilde: "https://support.google.com/analytics/answer/11397207?hl=en",
    sjekket: "2026-10-07",
  },
  {
    id: "google-analytics-gammel",
    monster: /^(_gid|_gat|_gat_.*|__utma|__utmb|__utmc|__utmt|__utmz|_gac_.*)$/,
    klasse: "krever-samtykke",
    // Google fjernet Universal Analytics-dokumentasjonen 1. juli 2024, og
    // siden gir i dag 404. _gid og _gat står ikke i GA4-tabellen. Vi kjenner
    // navnene igjen, men kan ikke lenger peke på Googles beskrivelse – derfor
    // «antatt», og derfor kan de ikke alene gi en dom.
    hva: "Eldre Google Analytics (Universal Analytics). Gjenkjenner nettleseren mellom sidevisninger.",
    kilde: "Egen måling 2026-10-07. Googles dokumentasjon av Universal Analytics ble fjernet 1. juli 2024, så formålet er ikke lenger leverandørbekreftet.",
    sjekket: "2026-10-07",
  },
  {
    id: "google-ads",
    monster: /^(_gcl_au|_gcl_aw|_gcl_dc|_gcl_gb|_gcl_gs|IDE|test_cookie|DSID|NID|__gads|__gpi|GPS|receive-cookie-deprecation)$/,
    klasse: "krever-samtykke",
    hva: "Google Ads eller DoubleClick. Brukes til annonsemåling og målretting.",
    kilde: "https://business.safety.google/adscookies/",
    sjekket: "2026-10-07",
  },
  {
    id: "meta",
    monster: /^(_fbp|_fbc|fr|fbm_.*|fbsr_.*)$/,
    klasse: "krever-samtykke",
    // Datatilsynet ila 250 000 kr i overtredelsesgebyr 10. juni 2025 for deling
    // via Meta Pixel, og beskriver mekanikken slik: «Meta-pikselen lagrer en
    // unik nettidentifikator i _fbp-informasjonskapselen.»
    hva: "Meta Pixel. Kobler besøket til en Facebook- eller Instagram-profil for annonsemåling.",
    kilde: "https://www.facebook.com/business/help/742478679120153",
    sjekket: "2026-10-07",
  },
  {
    id: "hotjar",
    monster: /^(_hjSessionUser_\d+|_hjSession_\d+|_hjid|_hjIncludedInSessionSample.*|_hjFirstSeen|_hjAbsoluteSessionInProgress|_hjTLDTest|_hjRecordingEnabled|_hjViewportId)$/,
    klasse: "krever-samtykke",
    hva: "Hotjar. Tar opp hvordan du beveger musa og klikker på siden.",
    kilde: "https://help.hotjar.com/hc/en-us/articles/6952777582999",
    sjekket: "2026-10-07",
  },
  {
    id: "clarity",
    monster: /^(_clck|_clsk|CLID|ANONCHK|MR|MUID)$/,
    klasse: "krever-samtykke",
    hva: "Microsoft Clarity. Tar opp økten og gjenkjenner nettleseren på nytt.",
    kilde: "https://learn.microsoft.com/en-us/clarity/setup-and-installation/cookie-consent",
    sjekket: "2026-10-07",
  },
  {
    id: "matomo",
    monster: /^(_pk_id\..+|_pk_ses\..+|_pk_ref\..+|_pk_cvar\..+|_pk_hsr\..+|_pk_uid|_pk_testcookie|MatomoAbTesting)$/,
    klasse: "krever-samtykke",
    // Matomo kan kjøres uten cookies (`_paq.push(['disableCookies'])`). Gjør man
    // det, settes ingen av navnene over – og vi så det selv på et norsk nettsted
    // med `_paq` i vinduet og null `_pk_`-cookies. Merk at matomo_sessid IKKE er
    // med her: den er CSRF-vern, og står under «csrf»-klassen hos oss.
    hva: "Matomo med cookies. Gjenkjenner nettleseren mellom besøk. Matomo kan også kjøres uten cookies – da settes ingen av disse.",
    kilde: "https://matomo.org/faq/general/faq_146/",
    sjekket: "2026-10-07",
  },
  {
    id: "matomo-csrf",
    monster: /^matomo_sessid$/,
    klasse: "teknisk",
    hva: "Matomos CSRF-vern for innlogging i Matomo selv.",
    kilde: "https://matomo.org/faq/general/faq_146/",
    sjekket: "2026-10-07",
  },
  {
    id: "linkedin",
    monster: /^(li_sugr|UserMatchHistory|bcookie|bscookie|lidc|li_gc|li_fat_id|AnalyticsSyncHistory)$/,
    klasse: "krever-samtykke",
    hva: "LinkedIn Insight Tag. Kobler besøket til en LinkedIn-profil.",
    kilde: "https://www.linkedin.com/legal/l/cookie-table",
    sjekket: "2026-10-07",
  },
  {
    id: "tiktok",
    monster: /^(_ttp|tt_sessionId|tt_appInfo|tt_pixel_session_index)$/,
    klasse: "krever-samtykke",
    hva: "TikTok Pixel. Annonsemåling for TikTok.",
    kilde: "https://ads.tiktok.com/help/article/tiktok-pixel",
    sjekket: "2026-10-07",
  },
  {
    id: "snap",
    monster: /^(_scid|_schn|_scid_r|sc_at|X-AB)$/,
    klasse: "krever-samtykke",
    // Også denne står i Datatilsynets gebyrvedtak 10. juni 2025, sammen med _fbp.
    hva: "Snap Pixel. Annonsemåling for Snapchat.",
    kilde: "https://values.snap.com/privacy/privacy-policy",
    sjekket: "2026-10-07",
  },
  {
    id: "hubspot-analyse",
    monster: /^(__hstc|hubspotutk|__hssc|__hssrc|__hmpl|hublytics_events_.*)$/,
    klasse: "krever-samtykke",
    // HubSpot kategoriserer disse som «Analytics» i sin egen tabell – ikke som
    // nødvendige. Det er leverandørens eget ord, og det avgjør saken.
    hva: "HubSpot-analyse. Sporer besøket på tvers av sider og knytter det til en kontakt. HubSpot fører dem selv som analysecookies, ikke som nødvendige.",
    kilde: "https://knowledge.hubspot.com/privacy-and-consent/what-cookies-does-hubspot-set-in-a-visitor-s-browser",
    sjekket: "2026-10-07",
  },
  {
    id: "microsoft-ads",
    monster: /^(_uetsid|_uetvid|_uetmsclkid)$/,
    klasse: "krever-samtykke",
    hva: "Microsoft Advertising (Bing UET). Annonsemåling.",
    kilde: "https://about.ads.microsoft.com/en/resources/policies/privacy-and-data-protection-policies",
    sjekket: "2026-10-07",
  },
  {
    id: "shopify-analyse",
    monster: /^(_shopify_s|_shopify_y|_shopify_sa_t|_shopify_sa_p|_shopify_analytics|shop_analytics|_shopify_marketing)$/i,
    klasse: "krever-samtykke",
    hva: "Shopifys egen besøksanalyse. Shopify fører dem under «Reporting and Analytics», ikke under nødvendige.",
    kilde: "https://www.shopify.com/legal/cookies",
    sjekket: "2026-10-07",
  },
  {
    id: "squarespace-analyse",
    monster: /^(ss_cid|ss_cvr|ss_cvt|ss_cvisit|ss_cpvisit)$/,
    klasse: "krever-samtykke",
    hva: "Squarespaces egen besøksanalyse. Squarespace fører dem under «Analytics and performance».",
    kilde: "https://support.squarespace.com/hc/en-us/articles/360001264507-The-cookies-Squarespace-uses",
    sjekket: "2026-10-07",
  },
  {
    id: "vimeo-analyse",
    monster: /^(vuid|lc_[0-9a-f]+)$/,
    klasse: "krever-samtykke",
    hva: "Vimeo-spilleren. Vimeo fører vuid som ikke-essensiell; den brukes til analyse for videoeieren. Med dnt=1 i innbyggings-URL-en settes den ikke. «player» og «flags» står i Vimeos liste, men er for generiske navn å dømme på og er utelatt med vilje.",
    kilde: "https://help.vimeo.com/hc/en-us/articles/26080940921361-Vimeo-Player-Cookies",
    sjekket: "2026-10-07",
  },
  {
    id: "ab-testing",
    monster: /^(_vwo_uuid|_vwo_uuid_v2|_vwo_sn|_vwo_ds|_vis_opt_s|_vis_opt_test_cookie|_vis_opt_exp_.*|optimizelyEndUserId|optimizelySession|kameleoonVisitorCode|_ab_.*)$/,
    klasse: "krever-samtykke",
    hva: "A/B-testverktøy (VWO, Optimizely eller Kameleoon). Holder deg i samme testvariant og gjenkjenner nettleseren.",
    kilde: "Egen måling 2026-10-07. Navnene er leverandørenes egne prefikser, observert på norske nettsteder.",
    sjekket: "2026-10-07",
  },
  {
    id: "produktanalyse",
    monster: /^(AMP_[0-9a-f]+|AMP_MKTG_[0-9a-f]+|amplitude_id.*|mp_[0-9a-f]+_mixpanel|ajs_anonymous_id|ajs_user_id|_mkto_trk|utag_main|utag_main_.*|nmstat|ai_user|ai_session|_dd_s|_dd_s_v\d+)$/,
    klasse: "krever-samtykke",
    // Alle disse er «antatt». Vi kjenner produktene (Amplitude, Mixpanel,
    // Segment, Tealium, Siteimprove, Application Insights, Datadog RUM), men har
    // ikke leverandørens egen beskrivelse av formålet per navn. Derfor kan de
    // IKKE alene gi en dom – se sikkerhetFor() og vurderSamtykke(). Det er
    // grunnen til at et norsk nettsted med bare ai_user og ai_session får «warn»
    // og ikke «brudd».
    hva: "Produktanalyse eller tagstyring (Amplitude, Mixpanel, Segment, Tealium, Siteimprove, Application Insights, Datadog). Gjenkjenner nettleseren mellom besøk.",
    kilde: "Egen måling 2026-10-07. Navnene er leverandørenes egne prefikser, observert på norske nettsteder.",
    sjekket: "2026-10-07",
  },
  {
    id: "youtube-innbygging",
    monster: /^(VISITOR_INFO1_LIVE|YSC|__Secure-YEC|__Secure-ROLLOUT_TOKEN|__Secure-YNID|__Secure-YENID)$/,
    klasse: "krever-samtykke",
    // youtube-nocookie.com REDUSERER, men fjerner ikke, lagringen: spilleren
    // skriver fortsatt til localStorage ved innlasting. Google lover ingen
    // steder at ingen cookies settes – de sier bare at visninger ikke påvirker
    // anbefalingene. Derfor skanner vi både cookies og web storage.
    hva: "Innbygd YouTube-video. Følger deg på tvers av nettsteder. youtube-nocookie.com reduserer lagringen, men fjerner den ikke helt.",
    kilde: "https://policies.google.com/technologies/cookies?hl=en",
    sjekket: "2026-10-07",
  },
];

/**
 * Hvor sikre vi er på klassifiseringen.
 *
 * `dokumentert` betyr at `kilde` peker på leverandørens egen dokumentasjon av
 * hva cookien gjør. `antatt` betyr at vi kjenner navnet igjen fra egen måling og
 * vet hvilket produkt det hører til, men ikke har leverandørens ord for formålet.
 *
 * Skillet er ikke pynt. Det er den eneste porten inn til `fail`: en dom om at
 * noe krever samtykke skal hvile på leverandørens egen beskrivelse, ikke på vår
 * gjenkjenning av et prefiks. Står det bare «antatt», blir dommen `warn` og
 * teksten sier at klassifiseringen er vår egen lesning.
 *
 * Invarianten testes i test/samtykke.test.ts.
 */
export function sikkerhetFor(kilde) {
  return typeof kilde === "string" && /^https?:\/\//.test(kilde) ? "dokumentert" : "antatt";
}

/**
 * Klassifiserer én cookie etter navn.
 *
 * Mønstrene ankres mot hele navnet, slik at `_gan` ikke treffer `_ga` og
 * `min_session_id_backup` ikke treffer `session_id`. Treffer ingenting,
 * returneres `ukjent` – og det er et ærlig svar, ikke en feil.
 *
 * @param {string} navn
 * @returns {{klasse: "teknisk"|"samtykkelager"|"krever-samtykke"|"ukjent", id: string|null, hva: string|null, kilde: string|null, sikkerhet: "dokumentert"|"antatt"|null}}
 */
export function klassifiserCookie(navn) {
  const n = typeof navn === "string" ? navn.trim() : "";
  if (!n) return { klasse: "ukjent", id: null, hva: null, kilde: null, sikkerhet: null };

  for (const k of COOKIE_KLASSER) {
    const kjerne = k.monster.source.replace(/^\^/, "").replace(/\$$/, "");
    const ankret = new RegExp(`^(?:${kjerne})$`, k.monster.flags.replace("g", ""));
    if (ankret.test(n)) {
      return { klasse: k.klasse, id: k.id, hva: k.hva, kilde: k.kilde, sikkerhet: sikkerhetFor(k.kilde) };
    }
  }
  return { klasse: "ukjent", id: null, hva: null, kilde: null, sikkerhet: null };
}

/** Samme klassifisering for en nøkkel i localStorage eller sessionStorage. */
export function klassifiserLagring(nokkel) {
  return klassifiserCookie(nokkel);
}

/* ------------------------------------------------------------- dommen ---- */

/**
 * @typedef {object} Samtykkedom
 * @property {"ok"|"warn"|"fail"|"neutral"} dom
 * @property {string} oppsummering   Én setning til brukeren.
 * @property {string[]} grunnlag     Hva vi faktisk målte. Hver linje skal kunne etterprøves.
 * @property {string[]} uavklart     Hva maskinen IKKE kunne avgjøre. Står alltid i rapporten.
 * @property {{kreverSamtykke: string[], tekniske: string[], samtykkelager: string[], ukjente: string[], dokumentertSporing: string[]}} cookies
 */

const flertall = (n, en, flere) => `${n} ${n === 1 ? en : flere}`;

/**
 * Setter dommen.
 *
 * Rekkefølgen er bevisst, og den er lagt opp slik at `fail` krever **målt
 * lagring av en navngitt sporingscookie**. At et sporingsskript ble lastet er
 * ikke nok, fordi § 3-15 handler om lagring i kommunikasjonsutstyret og ikke om
 * nedlasting av en fil – og fordi Consent Mode gjør nettopp dette: laster
 * skriptet, lagrer ingenting.
 *
 * `kjortJavaScript: false` (sjekken som bare leser HTML) setter et tak: den kan
 * aldri gi `fail` på grunnlag av et skript i markup. Grunnlaget er målt: av 16
 * norske nettsteder med verifisert `consent default`-kall i nettleseren viste
 * bare 3 kallet i den servergjengitte HTML-en.
 *
 * @param {object} funn
 * @param {string[]} [funn.cookienavn]            Cookies satt før samtykke.
 * @param {string[]} [funn.lagringsnokler]        Nøkler i localStorage/sessionStorage.
 * @param {string[]} [funn.sporereLastet]         Navn på sporingstjenester siden hentet noe fra.
 * @param {{id: string, navn: string, bevis: string[]}[]} [funn.samtykkelosninger]
 * @param {ReturnType<typeof tolkConsentMode>|null} [funn.consentMode]
 * @param {boolean} [funn.tcf]                    Om `__tcfapi` eller `__gpp` fantes.
 * @param {boolean} [funn.kjortJavaScript]        Om målingen kjørte siden i en nettleser.
 * @returns {Samtykkedom}
 */
export function vurderSamtykke(funn = {}) {
  const {
    cookienavn = [],
    lagringsnokler = [],
    sporereLastet = [],
    samtykkelosninger = [],
    consentMode = null,
    tcf = false,
    kjortJavaScript = true,
  } = funn;

  const kreverSamtykke = [];
  const tekniske = [];
  const samtykkelager = [];
  const ukjente = [];
  /** Delmengden av kreverSamtykke der leverandøren selv dokumenterer formålet. */
  const dokumentertSporing = [];

  const sorter = (navn, k) => {
    if (k.klasse === "krever-samtykke") {
      kreverSamtykke.push(navn);
      if (k.sikkerhet === "dokumentert") dokumentertSporing.push(navn);
    } else if (k.klasse === "teknisk") tekniske.push(navn);
    else if (k.klasse === "samtykkelager") samtykkelager.push(navn);
    else ukjente.push(navn);
  };

  for (const navn of cookienavn) sorter(navn, klassifiserCookie(navn));
  for (const nokkel of lagringsnokler) sorter(nokkel, klassifiserLagring(nokkel));

  const cookies = { kreverSamtykke, tekniske, samtykkelager, ukjente, dokumentertSporing };
  const samtykkeSpor = samtykkelosninger.length > 0 || tcf || Boolean(consentMode?.standardSatt);
  const losningsnavn = samtykkelosninger.map((l) => l.navn);

  /**
   * «Siden har en samtykkeløsning (Samtykkeløsning (leverandør ikke
   * identifisert))» er ikke en setning. Når vi bare har det delte
   * `window.CookieConsent`-signalet, sier vi det med ord i stedet.
   */
  const losningsfrase = () => {
    const navngitt = samtykkelosninger.filter((l) => l.id !== "ukjent-losning").map((l) => l.navn);
    if (navngitt.length) return ` (${navngitt.join(", ")})`;
    if (samtykkelosninger.length) return " (leverandøren klarte vi ikke å identifisere)";
    return "";
  };

  /** @type {string[]} */ const grunnlag = [];
  /** @type {string[]} */ const uavklart = [];

  if (losningsnavn.length) {
    grunnlag.push(`Samtykkeløsning funnet: ${losningsnavn.join(", ")}.`);
  }
  if (tcf && !losningsnavn.length) {
    grunnlag.push("Siden har et TCF-samtykkegrensesnitt (__tcfapi), men vi kjenner ikke igjen leverandøren.");
  }
  if (consentMode?.standardSatt) {
    grunnlag.push(
      consentMode.standardNektet
        ? `Google Consent Mode har standardtilstand «denied» for ${consentMode.nektet.join(", ")}.`
        : `Google Consent Mode er satt opp, men ${consentMode.tillattSomKreverSamtykke.join(", ")} er «granted» som standard.`,
    );
    if (consentMode.tillattOvrige?.length) {
      grunnlag.push(
        `${consentMode.tillattOvrige.join(", ")} står på «granted». Det gjelder lagring av brukerens egne valg og sikkerhetstilstand, og teller ikke som sporing her.`,
      );
    }
  } else if (consentMode?.tilstede) {
    uavklart.push("Google Consent Mode er lastet, men ingen standardtilstand ble satt før vi målte. Vi kan ikke se om sporingen er sperret.");
  }
  if (sporereLastet.length) {
    grunnlag.push(`Sporingsverktøy lastet: ${sporereLastet.join(", ")}. At skriptet lastes er ikke i seg selv lagring i kommunikasjonsutstyret.`);
  }
  if (tekniske.length) {
    grunnlag.push(`${flertall(tekniske.length, "cookie", "cookies")} vi kjenner igjen som teknisk: ${tekniske.slice(0, 6).join(", ")}${tekniske.length > 6 ? " m.fl." : ""}.`);
  }
  if (samtykkelager.length) {
    grunnlag.push(`${flertall(samtykkelager.length, "cookie", "cookies")} tilhører samtykkeløsningen selv: ${samtykkelager.join(", ")}.`);
  }

  if (!kjortJavaScript) {
    uavklart.push("JavaScript er ikke kjørt. Cookies som settes av skript etter innlasting er ikke med, og en samtykkeløsning som lastes dynamisk er usynlig her.");
  }
  uavklart.push("Målingen dekker forsiden ved første besøk, uten å klikke. Hva som skjer etter et klikk i banneret er ikke målt.");
  if (ukjente.length) {
    uavklart.push(`${flertall(ukjente.length, "cookie", "cookies")} står ikke på listen vår: ${ukjente.slice(0, 6).join(", ")}${ukjente.length > 6 ? " m.fl." : ""}. Vi kan ikke avgjøre maskinelt om de er strengt nødvendige.`);
  }
  uavklart.push("Om en konkret cookie er «strengt nødvendig» etter ekomloven § 3-15 er en juridisk vurdering. Ingen maskin kan gjøre den, og denne gjør den ikke.");

  /* ------------------------------------------------------- dommen ---- */

  // 1. Målt lagring av navngitt sporing. Det eneste som kan gi fail.
  if (kreverSamtykke.length > 0) {
    if (!samtykkeSpor) {
      // Porten inn til fail: minst én cookie der leverandøren selv dokumenterer
      // formålet. Er alt vi har vår egen gjenkjenning av et prefiks, blir det
      // warn – da sier vi hva vi tror, ikke hva vi vet.
      if (dokumentertSporing.length === 0) {
        uavklart.push(
          `Klassifiseringen av ${kreverSamtykke.join(", ")} er vår egen lesning av navnet, ikke leverandørens beskrivelse av formålet. Derfor står det ikke «brudd» her.`,
        );
        return {
          dom: "warn",
          oppsummering: `${flertall(kreverSamtykke.length, "cookie", "cookies")} ser ut som sporing og ble satt før noen hadde sagt ja: ${kreverSamtykke.join(", ")}. Vi fant ingen samtykkeløsning – men vi kjenner ${kreverSamtykke.length === 1 ? "cookien" : "cookiene"} igjen på navnet alene, og det er for tynt til en dom.`,
          grunnlag, uavklart, cookies,
        };
      }
      return {
        dom: "fail",
        oppsummering: `${flertall(dokumentertSporing.length, "cookie", "cookies")} som leverandøren selv beskriver som sporing ble satt før noen hadde sagt ja: ${dokumentertSporing.join(", ")}. Vi fant ingen samtykkeløsning på siden.`,
        grunnlag, uavklart, cookies,
      };
    }
    // Samtykkeløsning finnes, men noe som krever samtykke ble lagret likevel.
    // Et ekte funn – men hvem som slipper det gjennom kan maskinen ikke avgjøre,
    // og er klassifiseringen bare vår egen lesning av navnet, skal teksten si det.
    if (dokumentertSporing.length === 0) {
      uavklart.push(
        `Klassifiseringen av ${kreverSamtykke.join(", ")} er vår egen lesning av navnet, ikke leverandørens beskrivelse av formålet.`,
      );
      return {
        dom: "warn",
        oppsummering: `Siden har en samtykkeløsning${losningsfrase()}, men ${flertall(kreverSamtykke.length, "cookie", "cookies")} som ser ut som sporing ble satt likevel: ${kreverSamtykke.join(", ")}. Vi kjenner ${kreverSamtykke.length === 1 ? "den" : "dem"} igjen på navnet alene, så dette er noe å se nærmere på – ikke et funn vi vil kalle et brudd.`,
        grunnlag, uavklart, cookies,
      };
    }
    return {
      dom: "warn",
      oppsummering: `Siden har en samtykkeløsning${losningsfrase()}, men ${flertall(dokumentertSporing.length, "cookie", "cookies")} som leverandøren selv beskriver som sporing ble satt likevel: ${dokumentertSporing.join(", ")}. Enten står ${dokumentertSporing.length === 1 ? "den" : "de"} utenfor løsningen, eller løsningen slipper ${dokumentertSporing.length === 1 ? "den" : "dem"} gjennom. Det må et menneske se på.`,
      grunnlag, uavklart, cookies,
    };
  }

  // 2. Sporingsverktøy lastet, men ingenting lagret.
  if (sporereLastet.length > 0) {
    if (consentMode?.standardNektet === true) {
      return {
        dom: "ok",
        oppsummering: `${flertall(sporereLastet.length, "sporingsverktøy", "sporingsverktøy")} lastes, men standardtilstanden er «denied» og ingen sporingscookie ble satt. Det er slik samtykke skal håndteres.`,
        grunnlag, uavklart, cookies,
      };
    }
    if (consentMode?.standardNektet === false) {
      return {
        dom: "warn",
        oppsummering: `Google Consent Mode er satt opp, men ${consentMode.tillattSomKreverSamtykke.join(", ")} er «granted» allerede før noen har svart. Ingen sporingscookie ble satt i det øyeblikket vi målte, men standardtilstanden tillater det.`,
        grunnlag, uavklart, cookies,
      };
    }
    if (samtykkeSpor) {
      return {
        dom: "ok",
        oppsummering: `${flertall(sporereLastet.length, "sporingsverktøy", "sporingsverktøy")} lastes, men ingen sporingscookie ble satt før samtykke, og siden har en samtykkeløsning${losningsfrase()}.`,
        grunnlag, uavklart, cookies,
      };
    }
    return {
      dom: "neutral",
      oppsummering: `${flertall(sporereLastet.length, "sporingsverktøy", "sporingsverktøy")} lastes, og vi fant ingen samtykkeløsning – men ingen sporingscookie ble satt i det øyeblikket vi målte. Dette kan vi ikke avgjøre maskinelt.`,
      grunnlag, uavklart, cookies,
    };
  }

  // 3. Ingen sporing. Står det noe igjen vi ikke kan klassifisere?
  if (ukjente.length > 0) {
    return {
      dom: "warn",
      oppsummering: `${flertall(ukjente.length, "cookie", "cookies")} ble satt ved første besøk, og vi kjenner ${ukjente.length === 1 ? "den" : "dem"} ikke igjen: ${ukjente.slice(0, 5).join(", ")}${ukjente.length > 5 ? " m.fl." : ""}. Er ${ukjente.length === 1 ? "den" : "de"} strengt nødvendig${ukjente.length === 1 ? "" : "e"} for driften, er det lov – ellers må ${ukjente.length === 1 ? "den" : "de"} vente på samtykke.`,
      grunnlag, uavklart, cookies,
    };
  }
  if (tekniske.length > 0 || samtykkelager.length > 0) {
    const alle = [...tekniske, ...samtykkelager];
    return {
      dom: "warn",
      oppsummering: `${flertall(alle.length, "cookie", "cookies")} ble satt ved første besøk, og vi kjenner ${alle.length === 1 ? "den" : "alle"} igjen som teknisk${alle.length === 1 ? "" : "e"}: ${alle.slice(0, 5).join(", ")}${alle.length > 5 ? " m.fl." : ""}. Det er den typen unntaket i § 3-15 er laget for, men vurderingen er juridisk og gjøres ikke her.`,
      grunnlag, uavklart, cookies,
    };
  }

  return {
    dom: "ok",
    oppsummering: "Ingenting ble lagret i nettleseren før samtykke, og vi fant ingen sporingsverktøy. Da trenger siden strengt tatt ikke banner.",
    grunnlag, uavklart, cookies,
  };
}

/**
 * Hva som skal leses ut av `window` for å avgjøre samtykke.
 *
 * Listen ligger her og ikke i `skann.mjs`, slik at data og innsamling henger
 * sammen: legger du til en samtykkeløsning over, blir globalen plukket opp her
 * automatisk, og du kan ikke glemme halve endringen.
 */
export const GLOBALER_SOM_LESES = [
  ...new Set([
    ...SAMTYKKELOSNINGER.flatMap((l) => l.globaler),
    ...DELTE_GLOBALER,
    ...TCF_GLOBALER,
    "gtag",
    "dataLayer",
    "google_tag_manager",
    "google_tag_data",
  ]),
];
