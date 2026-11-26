/**
 * Fortelleren etter filmen (runde wow-r7, behandling C «Lampa»).
 *
 * Linjene er ordrett fra docs/design/historie-manus.md del 7 (beat 23–28) og tabellen «Resten av
 * siden» i del 5. Filmens egne linjer (beat 1–22) står i src/data/historie.ts og eies av bevegelse.
 * Overskriftene er fra tabellen «Overskrifter og søk» i del 1. Spørsmålene har ingen linje
 * (stillhet), footeren heller ikke.
 *
 * Ett sted, så tekstforfatter og faktasjekker kan lese alt fortelleren sier etter filmen i én fil.
 */
export const fortelling = {
  rapport: {
    tittel: "Sjekk nettsiden din",
    linje: "Lampa ved feltet står slukket til du har målt. Det tar 30 sekunder.",
  },
  arbeid: {
    linje: "Det vi har bygget, med samme lampe. Konsept står som konsept.",
  },
  garanti: {
    linje: "Du skal ikke tro oss på ordet. Du skal trykke på det først.",
  },
  priser: {
    tittel: "Fast pris på nettside, system og app",
    linje: "Ingen anslag. Prisene er endelige, og de står her.",
  },
  prosess: {
    tittel: "Fra samtale til lansering",
    linje: "Herfra er datoene ekte. De er regnet fra i dag.",
    /** Markøren tidslinjen starter i (manus C del 5, andluca snudd). */
    start: "I dag",
  },
  kontakt: {
    linje: "Stolen i verkstedet har stått tom hele filmen. Book 20 minutter, så sitter vi der.",
  },
  /** Den levende lampa i Arbeid (manus C, «Nytt i motoren»). {n} er svartiden, målt hver gang. */
  drift: {
    maalt: "svarte på {n} ms",
    ikkeMaalt: "ikke målt nå",
  },
  /** Merket på konseptarbeid (forside.md del 4, arbeid.merkeregel). */
  konsept: "Konsept, ikke oppdrag",
} as const;

/** Henvisningen som står fast ved et svar i Spørsmål (wow-r7). Begge delene står ordrett i svaret. */
export interface Henvisning {
  /** Det store: «§ 3-15», «35 krav», «fem arbeidsdager». */
  ledd: string;
  /** Kilden under: «ekomloven», «WCAG 2.0 nivå A og AA», «Avtalen». */
  kilde: string;
}
