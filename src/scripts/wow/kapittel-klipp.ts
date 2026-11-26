/**
 * Kapittelklippene på undersidene (Kapittel.astro). Eies av bevegelse. Ren data, ingen DOM: brukes
 * både av komponenten ved bygging og av sidene (forhåndslasting i MalWow).
 *
 * Bevisst skilt fra src/data/historie.ts: eier skriver om fortellingen i filmen, og teksten på
 * kapittelplaten kommer fra sidens egne props. Det som står her, er bare om KLIPPENE: hvor i
 * dykket utdraget starter og slutter, og hvor det grønne lyset er.
 *
 *   klipp      dykket i public/media/wow/scroll-world/ utdraget er laget av
 *   start      0–1 av dykket: første bilde i utdraget. Valgt så bedriften fyller bildet (ikke en
 *              øy i svart, revisor r4 avvik 2); se .design/arbeid/bevegelse/a2/start-valg-*.png.
 *   gronnVed   0–1 av dykket: rammen der kameraet når det grønne lyset. Samme rammer som
 *              gronnVed i historie.ts for de samme dykkene (kontrollert mot
 *              .design/arbeid/bevegelse/r3/ark-dive-*.png). Byttes klippene, kontroller begge.
 *   slutt      0–1 av dykket: siste bilde i utdraget.
 *
 * Filene lages av .design/arbeid/bevegelse/a2/lag-kapitler.sh med de samme tallene. Endres et tall
 * her, kjør skriptet på nytt.
 */

export type KapittelNummer = 1 | 2 | 3 | 4;
export type KapittelModus = "skrubb" | "still";

export interface KapittelKlipp {
  /** Hva klippet viser (til skjermlesertekst og dokumentasjon, ikke vist på siden). */
  sted: string;
  klipp: string;
  start: number;
  gronnVed: number;
  slutt: number;
}

export const kapittelKlipp: Record<KapittelNummer, KapittelKlipp> = {
  1: { sted: "Bakeriet", klipp: "dive-1", start: 0.44, gronnVed: 0.72, slutt: 0.8 },
  2: { sted: "Kontoret", klipp: "dive-2", start: 0.48, gronnVed: 0.75, slutt: 0.83 },
  3: { sted: "Rørleggeren", klipp: "dive-3", start: 0.46, gronnVed: 0.68, slutt: 0.76 },
  4: { sted: "Verkstedet", klipp: "dive-4", start: 0.48, gronnVed: 0.78, slutt: 0.86 },
};

/** Mappa under public/ der kapittelklippene og stillbildene ligger. */
export const kapittelMappe = "/media/wow/scroll-world/kapitler";

/** Samme spørring som MOBIL_KLIPP i scroll-world.ts: stående skjerm får 9:16-filene. */
export const kapittelMobil = "(max-aspect-ratio: 4/5)";

/** Liggende skjerm (alt som ikke er kapittelMobil), skrevet så media-attributter forstår den. */
export const kapittelStor = "(min-aspect-ratio: 801/1000)";

/**
 * Kapittelet som hører til en side, for sidene planen gir klipp (wow-undersider.md del 2.1).
 *   kapittelFor("/nettsider") → { nummer: 1, modus: "skrubb" }
 *   kapittelFor("/bransjer/klinikker") → { nummer: 2, modus: "still" }
 *   kapittelFor("/priser") → null
 */
export function kapittelFor(sti: string): { nummer: KapittelNummer; modus: KapittelModus } | null {
  const s = sti.replace(/\/+$/, "") || "/";
  const tabell: Record<string, { nummer: KapittelNummer; modus: KapittelModus }> = {
    "/nettsider": { nummer: 1, modus: "skrubb" },
    "/systemer": { nummer: 2, modus: "skrubb" },
    "/apper-og-ai": { nummer: 3, modus: "skrubb" },
    "/om": { nummer: 4, modus: "skrubb" },
    "/bransjer/handverkere": { nummer: 3, modus: "still" },
    "/bransjer/klinikker": { nummer: 2, modus: "still" },
  };
  return tabell[s] ?? null;
}

/** Hvor i utdraget (0–1) lampa blir grønn: gronnVed regnet om fra dykket til utdraget. */
export function kapittelGronn(nummer: KapittelNummer): number {
  const k = kapittelKlipp[nummer];
  return Math.min(0.98, Math.max(0.02, (k.gronnVed - k.start) / (k.slutt - k.start)));
}

/** Filene for et kapittel. `-m` er 9:16. */
export function kapittelFiler(nummer: KapittelNummer, mappe = kapittelMappe) {
  const b = `${mappe}/kapittel-${nummer}`;
  return {
    klipp: `${b}.mp4`,
    klippMobil: `${b}-m.mp4`,
    start: { avif: `${b}-start.avif`, webp: `${b}-start.webp`, avifMobil: `${b}-start-m.avif`, webpMobil: `${b}-start-m.webp` },
    gronn: { avif: `${b}-gronn.avif`, webp: `${b}-gronn.webp`, avifMobil: `${b}-gronn-m.avif`, webpMobil: `${b}-gronn-m.webp` },
  };
}

/**
 * Forhåndslasting av kapittelets første bilde, til `forhandslast` i MalWow. Bare avif, med `media`,
 * så telefonen bare henter 9:16 og ingen henter startbildet ved redusert bevegelse (da står det
 * grønne bildet i farge).
 *   skrubb: startbildet ved full bevegelse, det grønne ved redusert bevegelse.
 *   still:  det grønne bildet (det står i begge tilfeller).
 */
export function kapittelForhandslast(
  nummer: KapittelNummer,
  modus: KapittelModus = "skrubb",
  mappe = kapittelMappe,
): { href: string; type: string; media: string }[] {
  const f = kapittelFiler(nummer, mappe);
  const full = "(prefers-reduced-motion: no-preference)";
  const redusert = "(prefers-reduced-motion: reduce)";
  const avif = "image/avif";
  if (modus === "still") {
    return [
      { href: f.gronn.avifMobil, type: avif, media: kapittelMobil },
      { href: f.gronn.avif, type: avif, media: kapittelStor },
    ];
  }
  return [
    { href: f.start.avifMobil, type: avif, media: `${full} and ${kapittelMobil}` },
    { href: f.start.avif, type: avif, media: `${full} and ${kapittelStor}` },
    { href: f.gronn.avifMobil, type: avif, media: `${redusert} and ${kapittelMobil}` },
    { href: f.gronn.avif, type: avif, media: `${redusert} and ${kapittelStor}` },
  ];
}
