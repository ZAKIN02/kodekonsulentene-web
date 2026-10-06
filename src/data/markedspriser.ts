/**
 * Markedspriser fra ANDRE leverandører.
 *
 * Dette er ikke våre priser. Våre står i src/data/priser.ts og skal aldri
 * dupliseres hit. Hensikten er at priskalkulatoren kan vise hva markedet tar,
 * slik at en bedriftseier kan plassere vårt estimat i en sammenheng.
 *
 * Regelen: hvert tall skal ha kilde og «sist sjekket»-dato. Står det ikke en
 * kilde her, skal tallet ut. Tallene kommer fra leverandørenes egne nettsider,
 * og de har kommersielle interesser og ulike definisjoner av «enkel nettside».
 * Bruk dem som markedssignal, ikke som fasit.
 */

export interface Markedstall {
  /** Hvem som oppgir prisen. */
  leverandor: string;
  /** Hva slags leveranse prisen gjelder. */
  gjelder: string;
  lav: number | null;
  hoy: number | null;
  /** «engang» = kjøpspris, «mnd» = løpende abonnement. */
  enhet: "engang" | "mnd";
  kilde: string;
  sistSjekket: string;
  /** Forbehold som MÅ vises sammen med tallet. */
  merknad?: string;
}

/**
 * Hentet fra SEO- og markedsrapporten høsten 2026. Kildene er leverandørenes
 * egne sider; URL-ene står her slik at tallene kan etterprøves og oppdateres.
 *
 * TODO ved neste kvartalsgjennomgang: åpne hver kilde, bekreft tallet og sett ny
 * dato. Et markedstall uten fersk dato er verdiløst i en kalkulator.
 */
export const markedspriser: Markedstall[] = [
  {
    leverandor: "Webmestern",
    gjelder: "Startpakke til standard bedriftsside",
    lav: 19900,
    hoy: 39900,
    enhet: "engang",
    kilde: "https://webmestern.no/",
    sistSjekket: "2026-10-05",
  },
  {
    leverandor: "HjemmesideHelten",
    gjelder: "Faktisk levert pris, 50 prosjekter i 2025",
    lav: 35000,
    hoy: 42800,
    enhet: "engang",
    kilde: "https://hjemmesidehelten.no/",
    sistSjekket: "2026-10-05",
    merknad: "35 000 kr er median, 42 800 kr er snitt. Eget utvalg på 50 prosjekter.",
  },
  {
    leverandor: "Abonnementsbyråer",
    gjelder: "Nettside som abonnement, uten oppstartskostnad",
    lav: 499,
    hoy: 1740,
    enhet: "mnd",
    kilde: "https://klarosites.no/ · https://acendia.no/ · https://webagent.no/",
    sistSjekket: "2026-10-05",
    merknad: "Malbasert. Krever bindingstid, og du eier normalt ikke koden.",
  },
  {
    leverandor: "Etablerte byråer",
    gjelder: "Standard bedriftsside",
    lav: 80000,
    hoy: 200000,
    enhet: "engang",
    kilde: "https://innovena.no/",
    sistSjekket: "2026-10-05",
  },
  {
    leverandor: "Etablerte byråer",
    gjelder: "Webapplikasjon",
    lav: 250000,
    hoy: null,
    enhet: "engang",
    kilde: "https://innovena.no/",
    sistSjekket: "2026-10-05",
    merknad: "Oppgitt som «fra». Ingen øvre grense oppgitt.",
  },
];

/** Timepriser i markedet, til sammenligning med vår egen på 950 kr. */
export const markedTimepris = {
  byraaLav: 900,
  byraaHoy: 1800,
  frilansLav: 600,
  frilansHoy: 1200,
  kilde: "https://innovena.no/",
  sistSjekket: "2026-10-05",
} as const;
