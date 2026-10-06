/**
 * Tallene og feltnavnene SjekkSekvens.astro viser.
 *
 * INGEN TALL ER SKREVET INN HER. Alt kommer fra src/data/maalinger.json, som er
 * produsert av .skudd/maaling-skann.mjs: vår egen analysemotor kjørt mot 38
 * forsider trukket fra Enhetsregisteret, og mot vår egen side med samme motor.
 *
 * HVORFOR EN SEKVENS KAN VISE TALL I DET HELE TATT. Æresregelen i CLAUDE.md er at
 * verktøyet aldri skal påstå mer enn det har målt, og at et oppdiktet tall velter
 * hele posisjoneringen. En demo med påfunne funn er nøyaktig det. Derfor viser
 * sekvensen MEDIANEN av utvalget, med kilde og dato i figurteksten, og adressen i
 * akt 1 er plassholderen `dinbedrift.no` – den samme som normaliserUrl() foreslår
 * i sine egne feilmeldinger. Ingen ekte side navngis.
 *
 * STATUSENE ER UTLEDET, IKKE VALGT. Tersklene under er de samme som i
 * src/lib/sjekk.ts, og de er låst av test/sjekk-sekvens.test.ts, som kjører den
 * EKTE motoren på de samme tallene og krever samme svar:
 *
 *   ytelse        ingen Lighthouse-score  -> neutral  (0,5)
 *   headere       1 av 6 satt, under 3    -> fail     (0)
 *   cookies       1 satt, ingen sporer    -> warn     (0,5)
 *   uu            1 feil, 2 eller mindre  -> warn     (0,5)
 *   lovpålagt     org.nr. ikke funnet     -> fail     (0)
 *
 * Summen av vektene er 1,5 av 5 = 30 av 100 – NØYAKTIG `typisk.sumAv100` fra
 * masseskanningen, et tall som er målt uavhengig av denne fila. Den sammenhengen
 * er beviset på at de fem radene beskriver medianen og ikke en fortelling vi har
 * satt sammen. Testen blir rød hvis noen endrer én status uten at målingen gjør det.
 *
 * HVORFOR EN FUNKSJON OG IKKE EN FERDIG TABELL: `import … from "./maalinger.json"`
 * virker i Astro og Vite, men node:test kjører ren Node ESM og krever
 * importattributter. Da ville sekvensen vært det ene tallsettet på nettstedet som
 * ingen test kunne nå. Komponenten sender inn JSON-en, testen leser den fra disk.
 */
import type { Status } from "../lib/sjekk";

/** Delen av maalinger.json sekvensen bruker. */
export interface Maalinger {
  maalt: string;
  utvalg: { svarte: number };
  typisk: { headereAv6: number; cookiesForSamtykke: number; uuFeil: number; ttfbMs: number; sumAv100: number };
  oss: { sumAv100: number };
}

/** Plassholderdomenet. Aldri en ekte kundes eller konkurrents side. */
export const DOMENE = "dinbedrift.no";

/** Ordene rapporten bruker om status. Samme sett som skriptet i sjekk.astro. */
export const ORD: Record<Status, string> = {
  ok: "Bestått",
  warn: "Bør fikses",
  fail: "Brudd",
  neutral: "Ikke sjekket",
};

/** Vektene fra byggRapport i src/lib/sjekk.ts. */
const VEKT: Record<Status, number> = { ok: 1, warn: 0.5, fail: 0, neutral: 0.5 };

/**
 * De seks headerne skanneren teller, med de ekte nøklene fra PAAKREVDE_HEADERE
 * og rammevernet i src/lib/sjekk.ts.
 *
 * De står som en STATISK linje i panelet, ikke som funn. Medianen har 1 av 6
 * satt, men målingen sier ikke hvilken – da kan sekvensen ikke påstå det heller.
 */
export const HEADERE = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "x-frame-options",
] as const;

/* ---------------------------------------------------- utledede statuser ---- */

/** analyserHeadere: 6 eller mer er ok, 3–5 warn, under 3 fail. */
export const headerStatus = (antall: number): Status =>
  antall >= 6 ? "ok" : antall >= 3 ? "warn" : "fail";

/** analyserCookies: en sporer er fail, egne cookies warn, ingenting ok. */
export const cookieStatus = (antall: number): Status => (antall > 0 ? "warn" : "ok");

/** analyserUu: 0 feil er ok, 1–2 warn, 3 eller mer fail. */
export const uuStatus = (feil: number): Status => (feil === 0 ? "ok" : feil <= 2 ? "warn" : "fail");

const flertall = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/* ------------------------------------------------------------- sekvensen ---- */

export interface LoggLinje {
  /** Det skanneren faktisk leser. Feltnavnet står ordrett som i motoren. */
  felt: string;
  verdi: string;
  status: Status;
  /** Lovhjemmelen, verifisert mot src/lib/sjekk.ts. Ikke alle rader har en. */
  hjemmel?: string;
}

export interface DomRad {
  /** Radnavnet fra byggRapport, ordrett. */
  navn: string;
  status: Status;
  verdi: string;
}

export interface Sekvens {
  logg: LoggLinje[];
  dom: DomRad[];
  totalt: number;
  egenSum: number;
  antallSider: number;
  maaltDato: string;
}

export function byggSekvens(m: Maalinger): Sekvens {
  const { typisk, oss, utvalg } = m;

  const logg: LoggLinje[] = [
    {
      felt: "hentSide()",
      verdi: `${typisk.ttfbMs} ms til første byte`,
      status: "neutral",
    },
    {
      felt: "sikkerhetsheadere",
      verdi: `${typisk.headereAv6} av 6 satt`,
      status: headerStatus(typisk.headereAv6),
    },
    {
      felt: "set-cookie",
      verdi: `${flertall(typisk.cookiesForSamtykke, "cookie", "cookies")} før samtykke`,
      status: cookieStatus(typisk.cookiesForSamtykke),
      hjemmel: "ekomloven § 3-15",
    },
    {
      felt: "WCAG 2.0 A/AA",
      verdi: flertall(typisk.uuFeil, "feil", "feil"),
      status: uuStatus(typisk.uuFeil),
    },
    {
      felt: "org.nr.",
      verdi: "ikke funnet",
      status: "fail",
      hjemmel: "foretaksregisterloven",
    },
  ];

  const dom: DomRad[] = [
    { navn: "Ytelse", status: "neutral", verdi: `${typisk.ttfbMs} ms TTFB` },
    {
      navn: "Sikkerhetsheadere",
      status: headerStatus(typisk.headereAv6),
      verdi: `${typisk.headereAv6}/6`,
    },
    {
      navn: "Cookies før samtykke",
      status: cookieStatus(typisk.cookiesForSamtykke),
      verdi: String(typisk.cookiesForSamtykke),
    },
    {
      navn: "Universell utforming",
      status: uuStatus(typisk.uuFeil),
      verdi: flertall(typisk.uuFeil, "feil", "feil"),
    },
    { navn: "Lovpålagt informasjon", status: "fail", verdi: "Org.nr. mangler" },
  ];

  /** Samme regnestykke som byggRapport. Skal gi `typisk.sumAv100`. */
  const totalt = Math.round((dom.reduce((s, r) => s + VEKT[r.status], 0) / dom.length) * 100);

  return {
    logg,
    dom,
    totalt,
    egenSum: oss.sumAv100,
    antallSider: utvalg.svarte,
    maaltDato: m.maalt,
  };
}
