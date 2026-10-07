/**
 * Selve skanningen: en ekte nettleser som laster siden slik en førstegangsbesøkende
 * får den, og rapporterer hva som skjedde uten at noen klikket på noe.
 *
 * Nettleseren startes én gang og gjenbrukes. Hver skanning får en fersk kontekst,
 * som er Playwrights svar på en ny, tom nettleserprofil: ingen cookies, ingen
 * lagring, ingenting fra forrige kjøring. Uten det ville den andre skanningen
 * arvet den første sine cookies, og hele målingen vært verdiløs.
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { erTillattVert } from "./ssrf.mjs";
import { finnSporer, erForstepart } from "./sporere.mjs";
import {
  finnSamtykkelosninger,
  tolkConsentMode,
  vurderSamtykke,
  klassifiserCookie,
  klassifiserLagring,
  GLOBALER_SOM_LESES,
  TCF_GLOBALER,
} from "./samtykke.mjs";
import { forklar } from "./wcag-navn.mjs";

const TIDSAVBRUDD_MS = 30_000;
const RO_MS = 8_000;
const UA =
  "KodeKonsulentene-Skanner/1.0 (+https://kodekonsulentene.no/verktoy/cookie-sjekk)";

let nettleser = null;

async function hentNettleser() {
  if (nettleser?.isConnected()) return nettleser;
  nettleser = await chromium.launch({
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  return nettleser;
}

export async function lukkNettleser() {
  if (nettleser) {
    await nettleser.close().catch(() => {});
    nettleser = null;
  }
}

/**
 * Lager en ren kontekst og kobler på SSRF-vernet.
 *
 * Vernet står på forespørselsnivå, ikke bare på adressen brukeren skrev. En side
 * kan omdirigere, laste et skript eller hente et bilde fra en intern adresse, og
 * da skal nettleseren nekte. Offentlige nettsider henter aldri fra 10.0.0.0/8.
 */
async function lagKontekst(nettleser) {
  const kontekst = await nettleser.newContext({
    acceptDownloads: false,
    userAgent: UA,
    locale: "nb-NO",
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: false,
  });

  const blokkert = [];

  await kontekst.route("**/*", async (rute, forespørsel) => {
    let url;
    try {
      url = new URL(forespørsel.url());
    } catch {
      return rute.abort("blockedbyclient");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return rute.abort("blockedbyclient");
    }
    if (!erTillattVert(url)) {
      blokkert.push(url.hostname);
      return rute.abort("blockedbyclient");
    }
    return rute.continue();
  });

  return { kontekst, blokkert };
}

/** Venter til nettverket roer seg, men gir opp i stedet for å henge. */
async function ventTilRo(side) {
  try {
    await side.waitForLoadState("networkidle", { timeout: RO_MS });
  } catch {
    // Sider med evig polling (chat, analyse) blir aldri «idle». Det er greit –
    // vi har allerede det vi trenger etter load.
  }
}

/**
 * Leser samtykkesignalene ut av den ferdig lastede siden.
 *
 * Alt dette avleses, ingenting tolkes her – tolkningen ligger i samtykke.mjs,
 * som er rene funksjoner og kan testes uten nettleser.
 *
 * Det viktigste signalet er `window.google_tag_data.ics`: Googles egen interne
 * samtykketilstand. Den er pålitelig på en måte tekstsøk i koden ikke er, fordi
 * den finnes uansett om `gtag('consent', 'default', …)` står i HTML-en, kommer
 * fra GTM-beholderen eller settes av en CMP etter innlasting. I vår måling av
 * 24 norske nettsteder 7. oktober 2026 hadde 16 et verifisert standardkall –
 * bare 3 av dem viste det i den servergjengitte HTML-en.
 */
async function lesSamtykkesignaler(side, globaler) {
  return side
    .evaluate((navnliste) => {
      const w = window;

      const funnet = navnliste.filter((n) => {
        try {
          return typeof w[n] !== "undefined";
        } catch {
          return false;
        }
      });

      let ics = null;
      try {
        const rå = w.google_tag_data?.ics;
        if (rå && typeof rå === "object") {
          ics = {
            usedDefault: rå.usedDefault === true,
            usedUpdate: rå.usedUpdate === true,
            entries: {},
          };
          for (const [k, v] of Object.entries(rå.entries ?? {})) {
            if (v && typeof v === "object") {
              ics.entries[k] = { default: v.default, update: v.update };
            }
          }
        }
      } catch {
        ics = null;
      }

      // Samtykkekall i dataLayer. Formen er gtag-arguments: ['consent','default',{…}].
      let consentKall = [];
      try {
        if (Array.isArray(w.dataLayer)) {
          consentKall = w.dataLayer
            .filter((a) => a && (a[0] === "consent" || a["0"] === "consent"))
            .map((a) => {
              try {
                return JSON.stringify([...a]).slice(0, 600);
              } catch {
                return "";
              }
            })
            .filter(Boolean);
        }
      } catch {
        consentKall = [];
      }

      return {
        globaler: funnet,
        ics,
        consentKall,
        tcfLocator: Boolean(document.querySelector('iframe[name="__tcfapiLocator"]')),
      };
    }, globaler)
    .catch(() => ({ globaler: [], ics: null, consentKall: [], tcfLocator: false }));
}

/**
 * Cookie-skanning: hva settes FØR noen har samtykket?
 *
 * Vi klikker aldri på noe. Et samtykkebanner som ligger der uberørt er nettopp
 * poenget – alt som er satt i det øyeblikket, er satt uten samtykke.
 *
 * Men «satt uten samtykke» er ikke det samme som «ulovlig», og det er hele
 * forskjellen denne funksjonen må kunne måle. Derfor leser den også
 * samtykkesignalene fra siden, klassifiserer hver cookie, og lar samtykke.mjs
 * sette en dom med tre grader der én av dem er «kan ikke avgjøres maskinelt».
 *
 * @param {string} urlStreng
 */
export async function skannCookies(urlStreng) {
  const url = new URL(urlStreng);
  const nettleser = await hentNettleser();
  const { kontekst, blokkert } = await lagKontekst(nettleser);

  /** @type {Map<string, {vert: string, sporer: object|null, antall: number}>} */
  const tredjepartskall = new Map();
  /** Alle verter siden hentet noe fra. Trengs for å kjenne igjen CMP-skript. */
  const alleVerter = new Set();

  try {
    const side = await kontekst.newPage();

    side.on("request", (forespørsel) => {
      let vert;
      try {
        vert = new URL(forespørsel.url()).hostname;
      } catch {
        return;
      }
      alleVerter.add(vert);
      if (erForstepart(vert, url.hostname)) return;
      const sporer = finnSporer(vert);
      const forrige = tredjepartskall.get(vert);
      if (forrige) forrige.antall += 1;
      else tredjepartskall.set(vert, { vert, sporer, antall: 1 });
    });

    const svar = await side.goto(url.href, {
      waitUntil: "domcontentloaded",
      timeout: TIDSAVBRUDD_MS,
    });
    await ventTilRo(side);

    const sluttUrl = side.url();
    const signaler = await lesSamtykkesignaler(side, GLOBALER_SOM_LESES);

    const cookies = (await kontekst.cookies()).map((c) => {
      const klasse = klassifiserCookie(c.name);
      return {
        navn: c.name,
        domene: c.domain,
        forstepart: erForstepart(c.domain, new URL(sluttUrl).hostname),
        /** -1 i Playwright betyr øktcookie (slettes når nettleseren lukkes). */
        levetidDager:
          c.expires && c.expires > 0
            ? Math.max(0, Math.round((c.expires * 1000 - Date.now()) / 86_400_000))
            : null,
        sikker: c.secure,
        httpOnly: c.httpOnly,
        sporer: finnSporer(c.domain.replace(/^\./, ""))?.navn ?? null,
        /** «ukjent» er et gyldig svar. Se samtykke.mjs. */
        klasse: klasse.klasse,
        hva: klasse.hva,
        kilde: klasse.kilde,
      };
    });

    const lagring = await side
      .evaluate(() => {
        const les = (s) => {
          try {
            return Object.keys(s);
          } catch {
            return [];
          }
        };
        return {
          local: les(window.localStorage),
          session: les(window.sessionStorage),
        };
      })
      .catch(() => ({ local: [], session: [] }));

    const sporere = [...tredjepartskall.values()]
      .filter((k) => k.sporer)
      .map((k) => ({
        id: k.sporer.id,
        navn: k.sporer.navn,
        kategori: k.sporer.kategori,
        vert: k.vert,
        antallKall: k.antall,
        typiskeCookies: k.sporer.cookies,
        kilde: k.sporer.kilde,
      }));

    const ukjenteTredjeparter = [...tredjepartskall.values()]
      .filter((k) => !k.sporer)
      .map((k) => ({ vert: k.vert, antallKall: k.antall }));

    const sporereDedup = dedupliser(sporere);

    /* ------------------------------------------------- samtykkedommen ---- */

    // Lagringsnøkler sendes inn sammen med cookienavnene, fordi flere
    // samtykkeløsninger ikke bruker cookies i det hele tatt. Usercentrics lagrer
    // alt i localStorage (`uc_settings`, `uc_tcf` …), og Termly bruker
    // `TERMLY_API_CACHE`. Leste vi bare cookies, ville vi konkludert med «ingen
    // samtykkeløsning» på sider som har en.
    const lagringsnokler = [...lagring.local, ...lagring.session];

    const samtykkelosninger = finnSamtykkelosninger({
      verter: [...alleVerter],
      globaler: signaler.globaler,
      cookienavn: [...cookies.map((c) => c.navn), ...lagringsnokler],
    });

    const consentMode = tolkConsentMode({
      ics: signaler.ics,
      consentKall: signaler.consentKall,
    });

    const tcf =
      signaler.tcfLocator || TCF_GLOBALER.some((g) => signaler.globaler.includes(g));

    const dom = vurderSamtykke({
      cookienavn: cookies.map((c) => c.navn),
      lagringsnokler,
      sporereLastet: sporereDedup.map((s) => s.navn),
      samtykkelosninger,
      consentMode,
      tcf,
      kjortJavaScript: true,
    });

    return {
      url: sluttUrl,
      status: svar?.status() ?? null,
      cookies,
      lagring,
      lagringsklasser: Object.fromEntries(
        lagringsnokler.map((n) => [n, klassifiserLagring(n).klasse]),
      ),
      sporere: sporereDedup,
      ukjenteTredjeparter,
      blokkertAvVern: [...new Set(blokkert)],
      samtykke: {
        ...dom,
        losninger: samtykkelosninger,
        consentMode,
        tcf,
      },
    };
  } finally {
    await kontekst.close().catch(() => {});
  }
}

function dedupliser(liste) {
  const sett = new Map();
  for (const s of liste) {
    const forrige = sett.get(s.id);
    if (forrige) forrige.antallKall += s.antallKall;
    else sett.set(s.id, { ...s });
  }
  return [...sett.values()];
}

/**
 * UU-skanning med axe-core, begrenset til WCAG 2.0 A og AA – de 35 kravene som
 * gjelder private virksomheter i Norge.
 *
 * axe-core finner bare en del av dem. Det står i rapporten, hver gang.
 *
 * @param {string} urlStreng
 */
export async function skannUu(urlStreng) {
  const url = new URL(urlStreng);
  const nettleser = await hentNettleser();
  const { kontekst } = await lagKontekst(nettleser);

  try {
    const side = await kontekst.newPage();
    const svar = await side.goto(url.href, {
      waitUntil: "domcontentloaded",
      timeout: TIDSAVBRUDD_MS,
    });
    await ventTilRo(side);

    const resultat = await new AxeBuilder({ page: side })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const brudd = resultat.violations.map((v) => {
      const f = forklar(v.id, v.help);
      return {
        regel: v.id,
        alvorlighet: v.impact ?? "ukjent",
        forklaring: f.tekst,
        krav: f.krav,
        oversatt: f.oversatt,
        antall: v.nodes.length,
        /** Tre eksempler holder. Hele listen gjør rapporten uleselig. */
        eksempler: v.nodes.slice(0, 3).map((n) => n.html.slice(0, 200)),
        hjelpeLenke: v.helpUrl,
      };
    });

    const rekkefølge = { critical: 0, serious: 1, moderate: 2, minor: 3, ukjent: 4 };
    brudd.sort(
      (a, b) =>
        (rekkefølge[a.alvorlighet] ?? 9) - (rekkefølge[b.alvorlighet] ?? 9) ||
        b.antall - a.antall,
    );

    return {
      url: side.url(),
      status: svar?.status() ?? null,
      brudd,
      antallBrudd: brudd.reduce((s, b) => s + b.antall, 0),
      antallRegler: brudd.length,
      bestått: resultat.passes.length,
      /** Regler axe ikke kunne avgjøre maskinelt – de må testes manuelt. */
      måSjekkesManuelt: resultat.incomplete.map((i) => ({
        regel: i.id,
        forklaring: forklar(i.id, i.help).tekst,
        antall: i.nodes.length,
      })),
    };
  } finally {
    await kontekst.close().catch(() => {});
  }
}
