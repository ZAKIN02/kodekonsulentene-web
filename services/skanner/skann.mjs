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
 * Cookie-skanning: hva settes FØR noen har samtykket?
 *
 * Vi klikker aldri på noe. Et samtykkebanner som ligger der uberørt er nettopp
 * poenget – alt som er satt i det øyeblikket, er satt uten samtykke.
 *
 * @param {string} urlStreng
 */
export async function skannCookies(urlStreng) {
  const url = new URL(urlStreng);
  const nettleser = await hentNettleser();
  const { kontekst, blokkert } = await lagKontekst(nettleser);

  /** @type {Map<string, {vert: string, sporer: object|null, antall: number}>} */
  const tredjepartskall = new Map();

  try {
    const side = await kontekst.newPage();

    side.on("request", (forespørsel) => {
      let vert;
      try {
        vert = new URL(forespørsel.url()).hostname;
      } catch {
        return;
      }
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
    const cookies = (await kontekst.cookies()).map((c) => ({
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
    }));

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

    return {
      url: sluttUrl,
      status: svar?.status() ?? null,
      cookies,
      lagring,
      sporere: dedupliser(sporere),
      ukjenteTredjeparter,
      blokkertAvVern: [...new Set(blokkert)],
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
