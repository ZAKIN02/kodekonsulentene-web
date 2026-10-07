/**
 * Artikkelregisteret.
 *
 * Artiklene er egne .astro-sider – de har for ulik struktur til å genereres fra
 * en mal. Denne lista finnes for oversikten, for lenker mellom artikler, og for
 * at sitemap og eventuelle oversiktssider skal ha ett sted å hente fra.
 *
 * `oppdatert` er datoen innholdet sist ble kontrollert mot kilden, ikke datoen
 * en skrivefeil ble rettet. Juridisk innhold som ikke er kontrollert på et år,
 * skal kontrolleres på nytt før det får stå.
 */
export interface Artikkel {
  /** Uten skråstrek foran og uten /artikler/. */
  slug: string;
  tittel: string;
  /** Meta description. 120–160 tegn. */
  beskrivelse: string;
  /** Én setning om hva leseren sitter igjen med. */
  loefte: string;
  publisert: string;
  oppdatert: string;
  /** Verktøyet som lar leseren gjøre det artikkelen beskriver, på sin egen side. */
  verktoy?: { href: string; tekst: string };
}

export const artikler: Artikkel[] = [
  {
    /**
     * Den eneste artikkelen her som bygger på et offentlig datasett og ikke på
     * en paragraf. Tallene regnes ut av `src/data/uu-register.json` ved bygg, så
     * `oppdatert` skal følge `hentet`-datoen i den filen – ikke datoen teksten
     * ble redigert. Kjør `node scripts/uuregister.mjs` og oppdater begge.
     */
    slug: "wcag-i-registeret",
    tittel: "WCAG-kravene som brytes oftest",
    beskrivelse:
      "9 549 norske tilgjengelighetserklæringer, aggregert på nytt: tre av fire rapporterer selv minst ett WCAG-brudd, og medianen er fire. Her er kravene som topper listen.",
    loefte:
      "Du vet hvilke WCAG-krav norske virksomheter selv oppgir at de bryter, og hvor få av dem en maskin kan finne.",
    publisert: "2026-10-07",
    oppdatert: "2026-10-07",
    verktoy: { href: "/verktoy/uu-sjekk", tekst: "Kjør UU-sjekken" },
  },
  {
    slug: "cookies-for-samtykke",
    tittel: "Cookies før samtykke",
    beskrivelse:
      "Ekomloven § 3-15 krever aktivt samtykke før cookies settes. Slik sjekker du din egen nettside på to minutter, og slik retter du det du finner.",
    loefte: "Du vet om din egen side bryter loven, og hva som skal til for å rette det.",
    publisert: "2026-10-06",
    oppdatert: "2026-10-06",
    verktoy: { href: "/verktoy/cookie-sjekk", tekst: "Kjør cookie-sjekken" },
  },
  {
    slug: "35-wcag-krav",
    tittel: "De 35 WCAG-kravene",
    beskrivelse:
      "Private nettsider i Norge må oppfylle 35 av 61 suksesskriterier i WCAG 2.0. Her er hvilke som feiler oftest, og hva de koster å rette.",
    loefte: "Du vet hvilke krav som gjelder deg, og hvilke du sannsynligvis bryter.",
    publisert: "2026-10-06",
    oppdatert: "2026-10-06",
    verktoy: { href: "/verktoy/uu-sjekk", tekst: "Kjør UU-sjekken" },
  },
  {
    slug: "orgnr-pa-nettsiden",
    tittel: "Org.nr. på nettsiden",
    beskrivelse:
      "Foretaksregisterloven § 10-2 krever organisasjonsnummer og foretaksnavn på nettsiden. To av tre sider vi målte manglet det.",
    loefte: "Du vet hva som skal stå på siden din, hvor det skal stå, og hvorfor.",
    publisert: "2026-10-06",
    oppdatert: "2026-10-06",
    verktoy: { href: "/sjekk", tekst: "Sjekk nettsiden din" },
  },
];

export function finnArtikkel(slug: string): Artikkel {
  const a = artikler.find((x) => x.slug === slug);
  if (!a) throw new Error(`Ukjent artikkel: ${slug}. Legg den til i src/data/artikler.ts.`);
  return a;
}
