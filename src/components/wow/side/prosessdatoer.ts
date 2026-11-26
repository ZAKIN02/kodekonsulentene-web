/**
 * Datoene i «Slik går det», regnet ut ved bygg (tekstmanuset del 8). Én utregning for forsiden og
 * tjenestesidene (wow-undersider.md del 3, Prosess):
 *   prototypen  = dagens dato + 3 døgn, «lørdag 21. november»
 *   lanseringen = ISO-uka for dagens dato + 24 døgn (72 timer prototype + 3 uker bygging, øvre
 *                 grense av «2–3 uker»)
 *
 * Plassering: planen sier src/lib/prosessdatoer.ts. Fila ligger her fordi A1 bare eier
 * src/components/wow/side/** i denne bølgen.
 */
const DOGN = 86_400_000;

export function isoUke(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dag);
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - start.getTime()) / DOGN + 1) / 7);
}

export function prosessdatoer(naa: Date = new Date()): { prototypedato: string; lanseringsuke: number } {
  const prototypedato = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(naa.getTime() + 3 * DOGN));
  return { prototypedato, lanseringsuke: isoUke(new Date(naa.getTime() + 24 * DOGN)) };
}

/** Dato uten ukedag, «22. november». */
const kortDato = (d: Date) => new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long" }).format(d);
const ukedag = (d: Date) => new Intl.DateTimeFormat("nb-NO", { weekday: "long" }).format(d);

export type HjulSteg = "samtale" | "prototype" | "bygging" | "lansering";

/**
 * Verdiene i datohjulet på forsiden (runde wow-r7 «Lampa», manus C: tidslinjen starter i «I dag»
 * og ruller fram). Samme utregning som prosessdatoer(), så hjulet og stegene aldri er uenige:
 *   «I dag» → de tre neste dagene (den tredje er prototypen, dagens dato + 3 døgn) →
 *   ISO-uka 7, 14 og 21 døgn etter prototypen (den siste er lanseringsuka, dagens dato + 24 døgn).
 * Ingen dato er anslått: alle er dagens dato pluss et fast antall døgn.
 * `start` er markøren, «I dag» (fra fortelling.ts).
 */
export function hjulVerdier(start: string, naa: Date = new Date()): { tekst: string; steg?: HjulSteg }[] {
  const om = (dogn: number) => new Date(naa.getTime() + dogn * DOGN);
  return [
    { tekst: start, steg: "samtale" },
    { tekst: kortDato(om(1)) },
    { tekst: kortDato(om(2)) },
    { tekst: kortDato(om(3)), steg: "prototype" },
    { tekst: `uke ${isoUke(om(10))}`, steg: "bygging" },
    { tekst: `uke ${isoUke(om(17))}` },
    { tekst: `uke ${isoUke(om(24))}`, steg: "lansering" },
  ];
}

/** Prototypedatoen delt i ukedag og dato, som stegene viser den. */
export function prototypeDeler(naa: Date = new Date()): { dag: string; dato: string } {
  const d = new Date(naa.getTime() + 3 * DOGN);
  return { dag: ukedag(d), dato: kortDato(d) };
}
