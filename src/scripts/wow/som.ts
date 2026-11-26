/**
 * Sømmer og hold i rullefilmen (ScrollWorld), som rene funksjoner uten DOM, så de kan testes i Node
 * (test/som.test.ts). Brukes av scroll-world.ts. Manus: docs/design/regi/film-manus-v3.md del 2 og 10.
 *
 * Alt er datadrevet per segment i `film` (src/data/historie.ts):
 *   som   sømmen UT av segmentet, mot det neste: "kutt" (standard, hardt kutt), "toning" (kort
 *         krysstoning, SOM_TONING skjermhøyder) eller et tall (bredden i skjermhøyder).
 *   hold  { ved, lengde }: klippet står på rammen ved andelen `ved` (0–1 av klippet, i
 *         avspillingsretningen) mens rullingen går `lengde` skjermhøyder (frysrammen i T6).
 *
 * Krysstoningen ligger midt over sømmen. Det nye laget ligger over det gamle og tones inn (0 → 1);
 * det gamle står under med full opasitet til det nye dekker, så bildet aldri blir mørkere i midten.
 * Før sømmen står det nye på sitt første bilde, etter sømmen står det gamle på sitt siste: mellom to
 * stille og nesten like bilder leses det som et pust. Bare opasitet endres.
 */

/** Bredden på en krysstoning i skjermhøyder når segmentet sier "toning". */
export const SOM_TONING = 0.05;
/** En toning er aldri bredere enn dette (skjermhøyder), og aldri over 40 % av det korteste nabosegmentet. */
export const SOM_MAKS = 0.3;
/** Et hold tar aldri mer enn så stor andel av segmentets rulling. */
export const HOLD_MAKS = 0.9;

export type SomValg = "kutt" | "toning" | number | undefined;

const klem = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Bredden på sømmen i skjermhøyder. 0 = hardt kutt. `for` og `etter` er lengdene til nabosegmentene. */
export function somBredde(som: SomValg, forLengde = Infinity, etterLengde = Infinity): number {
  const b = som === "toning" ? SOM_TONING : typeof som === "number" && Number.isFinite(som) ? som : 0;
  if (b <= 0) return 0;
  return Math.min(b, SOM_MAKS, 0.4 * forLengde, 0.4 * etterLengde);
}

/**
 * Opasiteten til det NYE laget i en krysstoning: 0 før sømmen åpner, 1 når den er over, lineært
 * mellom. `tid` og `somTid` i rulletid (skjermhøyder), `bredde` fra somBredde. Bredde 0 = kutt.
 */
export function toning(tid: number, somTid: number, bredde: number): number {
  if (bredde <= 0) return tid >= somTid ? 1 : 0;
  return klem((tid - (somTid - bredde / 2)) / bredde);
}

export interface Som {
  /** Segmentet FØR sømmen; det nye laget er i + 1. */
  i: number;
  /** Opasiteten til det nye laget, mellom 0 og 1 (aldri nøyaktig 0 eller 1). */
  p: number;
}

/**
 * Sømmen `tid` står i, eller null. `slutt[i]` er rulletiden der segment i slutter, `bredde[i]`
 * bredden på sømmen etter segment i (0 = kutt). Sømmene overlapper aldri (somBredde holder dem
 * under 40 % av naboene), så høyst én er åpen.
 */
export function somVed(tid: number, slutt: ArrayLike<number>, bredde: ArrayLike<number>): Som | null {
  for (let i = 0; i < slutt.length - 1; i++) {
    const b = bredde[i];
    if (!(b > 0)) continue;
    const p = toning(tid, slutt[i], b);
    if (p > 0 && p < 1) return { i, p };
  }
  return null;
}

/** Er overgangen mellom segment a og b et hardt kutt? Nabosegmenter med toning er det ikke. */
export function erKutt(a: number, b: number, bredde: ArrayLike<number>): boolean {
  if (a === b) return false;
  if (Math.abs(a - b) > 1) return true;
  return !(bredde[Math.min(a, b)] > 0);
}

/**
 * Andelen av segmentets rulling et hold tar: `lengde` skjermhøyder av et segment på `vekt`.
 * 0 når det ikke er noe hold.
 */
export function holdAndel(lengde: number | undefined, vekt: number): number {
  if (!lengde || !(lengde > 0) || !(vekt > 0)) return 0;
  return klem(lengde / vekt, 0, HOLD_MAKS);
}

/**
 * Klippkartet med hold. u er andelen av segmentets rulling (0–1), svaret andelen av klippet.
 * Klippet går jevnt til `ved`, står der mens rullingen går `andel` av segmentet, og går jevnt
 * videre. Farten utenfor holdet er den samme før og etter, så kameraet ikke skifter tempo:
 *   [0, a]          0 → ved            a = ved · (1 − andel)
 *   [a, a + andel]  ved (står)
 *   [a + andel, 1]  ved → 1
 * Monoton og kontinuerlig. andel 0 gir u uendret.
 */
export function holdKart(u: number, ved: number, andel: number): number {
  u = klem(u);
  andel = klem(andel, 0, HOLD_MAKS);
  if (andel <= 0) return u;
  ved = klem(ved);
  const fart = 1 / (1 - andel);
  const a = ved * (1 - andel);
  if (u <= a) return u * fart;
  if (u <= a + andel) return ved;
  return ved + (u - a - andel) * fart;
}
