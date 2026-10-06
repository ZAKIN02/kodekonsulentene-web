/**
 * Logikken bak priskalkulatoren på /verktoy/priskalkulator.
 *
 * Rene funksjoner uten nettverk og uten DOM, slik at de kan testes.
 *
 * To regler styrer alt her:
 *
 * 1. **Én sannhet for prisene.** Pakkeprisene leses ut av src/data/priser.ts –
 *    de skrives aldri inn på nytt. Endrer prislisten seg, endrer kalkulatoren seg.
 * 2. **Forutsetningene skal være synlige.** Et estimat som ikke kan etterprøves er
 *    en påstand. Derfor returnerer kalkulatoren ikke bare et tall, men linjene den
 *    la sammen, med timeanslag og timepris. Det er hele forskjellen mot
 *    konkurrentene som bare har en tabell.
 *
 * Timeanslagene under er VÅRE ANSLAG, ikke målte størrelser. De er merket som det
 * overalt der de vises.
 */

import { pakker, loepende } from "../data/priser.ts";

/* ------------------------------------------------------- prislisten ---- */

/** «29 900 kr» → 29900. Tåler vanlig mellomrom, hardt mellomrom og «fra». */
export function tilTall(pris: string): number {
  const siffer = pris.replace(/[^\d]/g, "");
  return siffer ? Number(siffer) : 0;
}

/** Henter en pakkepris fra src/data/priser.ts. Kaster hvis pakken ikke finnes. */
export function pakkepris(navn: string): number {
  const p = pakker.find((x) => x.navn === navn);
  if (!p) throw new Error(`Fant ikke pakken «${navn}» i src/data/priser.ts`);
  return tilTall(p.pris);
}

/** Timeprisen vår, lest ut av prislisten. */
export function timepris(): number {
  const rad = loepende.find((r) => r.navn === "Timepris");
  return rad ? tilTall(rad.pris) : 0;
}

/* ----------------------------------------------------------- tillegg ---- */

export interface Tillegg {
  id: Integrasjon;
  navn: string;
  /** Timeanslag, lav og høy. VÅRT ANSLAG – ikke en målt størrelse. */
  timerLav: number;
  timerHoy: number;
  forklaring: string;
}

export type Integrasjon = "vipps" | "regnskap" | "booking" | "bankid";

/**
 * Timeanslag per integrasjon. Dette er erfaringsbaserte anslag, ikke fasit, og
 * de vises alltid sammen med estimatet. Spennet er bevisst bredt: en
 * Vipps-integrasjon mot en enkel betaling er noe annet enn mot et abonnement.
 */
export const tillegg: Tillegg[] = [
  {
    id: "vipps",
    navn: "Vipps-betaling",
    timerLav: 15,
    timerHoy: 30,
    forklaring: "Betaling ved bestilling, kvittering og avstemming mot ordre.",
  },
  {
    id: "regnskap",
    navn: "Regnskap (Tripletex, Fiken eller PowerOffice)",
    timerLav: 25,
    timerHoy: 50,
    forklaring: "Ordre og faktura inn i regnskapet uten at noen taster på nytt.",
  },
  {
    id: "booking",
    navn: "Booking",
    timerLav: 30,
    timerHoy: 60,
    forklaring: "Kalender, ledige tider, bekreftelse og påminnelse på SMS eller e-post.",
  },
  {
    id: "bankid",
    navn: "BankID-innlogging eller signering",
    timerLav: 20,
    timerHoy: 40,
    forklaring: "Innlogging eller juridisk bindende signering via en ferdig leverandør.",
  },
];

/** Timeanslag for en side utover det pakken dekker. Vårt anslag. */
export const TIMER_PER_EKSTRA_SIDE = { lav: 3, hoy: 6 } as const;

/**
 * Timeanslag for en app. Bevisst satt som «fra», fordi spennet er for stort til
 * at et øvre tall ville betydd noe. En app estimeres etter en samtale, ikke i en
 * kalkulator – det sier kalkulatoren selv.
 */
export const TIMER_APP_FRA = 150;

/* ------------------------------------------------------------- svaret ---- */

export interface Valg {
  /** Antall sider kunden trenger. */
  sider: number;
  /** Skal kunden kunne redigere innholdet selv? */
  cms: boolean;
  integrasjoner: Integrasjon[];
  app: boolean;
}

export interface Linje {
  tekst: string;
  lav: number;
  hoy: number;
  /** Satt når beløpet bygger på et timeanslag og ikke en fast pakkepris. */
  anslag?: { timerLav: number; timerHoy: number };
}

export interface Estimat {
  /** Pakken valgene lander på. */
  pakke: "Start" | "Bedrift" | "System";
  /** Hvorfor akkurat den pakken. Én setning, til bedriftseieren. */
  pakkeBegrunnelse: string;
  linjer: Linje[];
  lav: number;
  hoy: number;
  /** true når estimatet er et gulv og ikke et spenn (app valgt). */
  aapentOppe: boolean;
  /** Løpende kostnad etter lansering, rett fra prislisten. */
  loepende: { navn: string; pris: string };
  timepris: number;
  /** Alt kalkulatoren forutsetter. Vises alltid. */
  forutsetninger: string[];
}

/** Hvor mange sider hver pakke dekker før det blir tillegg. */
const SIDER_I_PAKKE = { Start: 3, Bedrift: 8, System: 8 } as const;

/**
 * Regner ut et prisspenn fra valgene.
 *
 * Pakkevalget følger prislisten: Start dekker 1–3 sider uten CMS, Bedrift dekker
 * 5–8 sider med CMS, og alt med integrasjoner eller app er System.
 */
export function beregn(valg: Valg): Estimat {
  const sider = Math.max(1, Math.min(60, Math.floor(valg.sider) || 1));
  const integrasjoner = tillegg.filter((t) => valg.integrasjoner.includes(t.id));
  const t = timepris();

  const pakke: Estimat["pakke"] =
    valg.app || integrasjoner.length > 0 ? "System" : valg.cms || sider > 3 ? "Bedrift" : "Start";

  const pakkeBegrunnelse =
    pakke === "System"
      ? valg.app
        ? "En app gjør dette til et systemoppdrag, ikke en nettside."
        : "Integrasjoner mot andre systemer gjør dette til et systemoppdrag."
      : pakke === "Bedrift"
        ? valg.cms
          ? "Du vil endre innholdet selv, og da trenger du CMS."
          : `${sider} sider er mer enn Start-pakken dekker.`
        : "Få sider, ingen integrasjoner. Start-pakken dekker behovet.";

  const grunnpris = pakkepris(pakke);
  const linjer: Linje[] = [
    {
      tekst: `${pakke}-pakken${pakke === "System" ? " (fra)" : ""}`,
      lav: grunnpris,
      hoy: grunnpris,
    },
  ];

  // Sider utover det pakken dekker, faktureres etter timeanslag.
  const inkluderte = SIDER_I_PAKKE[pakke];
  const ekstra = Math.max(0, sider - inkluderte);
  if (ekstra > 0) {
    linjer.push({
      tekst: `${ekstra} ${ekstra === 1 ? "side" : "sider"} utover pakken`,
      lav: ekstra * TIMER_PER_EKSTRA_SIDE.lav * t,
      hoy: ekstra * TIMER_PER_EKSTRA_SIDE.hoy * t,
      anslag: {
        timerLav: ekstra * TIMER_PER_EKSTRA_SIDE.lav,
        timerHoy: ekstra * TIMER_PER_EKSTRA_SIDE.hoy,
      },
    });
  }

  for (const i of integrasjoner) {
    linjer.push({
      tekst: i.navn,
      lav: i.timerLav * t,
      hoy: i.timerHoy * t,
      anslag: { timerLav: i.timerLav, timerHoy: i.timerHoy },
    });
  }

  if (valg.app) {
    linjer.push({
      tekst: "App (fra)",
      lav: TIMER_APP_FRA * t,
      hoy: TIMER_APP_FRA * t,
      anslag: { timerLav: TIMER_APP_FRA, timerHoy: TIMER_APP_FRA },
    });
  }

  const lav = linjer.reduce((s, l) => s + l.lav, 0);
  const hoy = linjer.reduce((s, l) => s + l.hoy, 0);

  const drift = loepende.find((r) => r.navn === "Drift og vedlikehold");

  const forutsetninger = [
    "Alle beløp er eks. mva.",
    `Timeanslagene er våre anslag, ikke målte tall. Timeprisen er ${t.toLocaleString("nb-NO")} kr.`,
    "Pakkeprisene er faste og hentet fra prislisten vår.",
    "40 % faktureres ved oppstart, resten ved lansering.",
    "To revisjonsrunder er inkludert i alle pakker.",
    "Estimatet erstatter ikke et tilbud. Et tilbud får du etter en samtale, og da er prisen fast.",
  ];

  return {
    pakke,
    pakkeBegrunnelse,
    linjer,
    lav,
    hoy,
    aapentOppe: valg.app || pakke === "System",
    loepende: { navn: drift?.navn ?? "Drift og vedlikehold", pris: drift?.pris ?? "" },
    timepris: t,
    forutsetninger,
  };
}

/** «29900» → «29 900 kr». Hardt mellomrom, så beløpet ikke brekker over to linjer. */
export function formaterKr(n: number): string {
  return `${Math.round(n).toLocaleString("nb-NO").replace(/ /g, " ")} kr`;
}
