/**
 * Markedspriser fra ANDRE leverandører.
 *
 * Dette er ikke våre priser. Våre står i src/data/priser.ts og skal aldri
 * dupliseres hit. Hensikten er at priskalkulatoren kan vise hva markedet tar,
 * slik at en bedriftseier kan plassere vårt estimat i en sammenheng.
 *
 * REGELEN, og den er absolutt: hvert tall skal ha minst én kilde-URL og en
 * «sist sjekket»-dato, og tallet skal stå PÅ den siden URL-en peker på. Ikke på
 * forsiden til samme leverandør, ikke i en rapport som siterer dem – på den
 * siden. Står tallet ikke der, skal tallet ut. test/kilder.test.ts håndhever
 * begge delene: at kilden finnes, og at URL-en svarer.
 *
 * HVORFOR REGELEN ER SÅ STRENG. Fila hadde til 7. oktober 2026 to feil av
 * nøyaktig den typen vi selger oss på å ikke gjøre:
 *
 *   1. `klarosites.no` sto som kilde for det laveste abonnementstallet (499
 *      kr/mnd). Domenet finnes ikke – NXDOMAIN, ingen A-post og ingen
 *      navnetjener, kontrollert 7. oktober 2026. Tallet kunne ikke etterprøves
 *      av noen, og raden er fjernet og erstattet med et tall som står på en
 *      side som svarer.
 *   2. HjemmesideHelten sto med «35 000 kr median / 42 800 kr snitt, 50
 *      prosjekter i 2025». Ingen av de tre tallene står på hjemmesidehelten.no.
 *      Siden publiserer pakkepriser og «100+ leverte siden 2015». Påstanden er
 *      fjernet, ikke omskrevet, og erstattet med deres egne publiserte priser.
 *   3. Innovena-tallene var riktige, men URL-en pekte på forsiden, der det ikke
 *      står én pris. De står i prisartikkelen, og det er den som er kilden nå.
 *
 * Leverandørene har kommersielle interesser og ulike definisjoner av «enkel
 * nettside». Bruk tallene som markedssignal, ikke som fasit.
 *
 * Alle tall i denne fila er lest på leverandørens egen side 7. oktober 2026.
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
  /**
   * Én URL per tall som skal kunne etterprøves. Siden URL-en peker på skal
   * inneholde tallet. Flere URL-er når raden er et spenn satt sammen av flere
   * leverandører – da skal både laveste og høyeste endepunkt ha sin egen.
   */
  kilde: string[];
  sistSjekket: string;
  /** Forbehold som MÅ vises sammen med tallet. */
  merknad?: string;
}

export const markedspriser: Markedstall[] = [
  {
    leverandor: "Webmestern",
    gjelder: "Startpakke til standard bedriftsside",
    lav: 19900,
    hoy: 39900,
    enhet: "engang",
    kilde: ["https://www.webmestern.no/"],
    sistSjekket: "2026-10-07",
    merknad:
      "Startpakken 19 900 kr, Standardpakken 39 900 kr. Oppgitt eks. mva, og drift kommer i tillegg med 390 kr/mnd.",
  },
  {
    leverandor: "HjemmesideHelten",
    gjelder: "Publiserte pakkepriser, liten til stor bedriftsside",
    lav: 9990,
    hoy: 34990,
    enhet: "engang",
    kilde: ["https://www.hjemmesidehelten.no/nettside-bedrift/"],
    sistSjekket: "2026-10-07",
    merknad:
      "Tre pakker: 9 990, 24 990 og 34 990 kr. Fastpris, levering 1–4 uker. Dette er det tetteste prispunktet under vår inngang.",
  },
  {
    leverandor: "Abonnementsbyråer",
    gjelder: "Nettside som abonnement, uten oppstartskostnad",
    lav: 349,
    hoy: 1740,
    enhet: "mnd",
    kilde: [
      "https://www.webpack.no/nettside-nettbutikk-epost-pakker-priser.html",
      "https://acendia.no/",
      "https://webagent.no/blog/hva-koster-nettside-2026",
    ],
    sistSjekket: "2026-10-07",
    merknad:
      "Malbasert. Laveste er WebPack 349 kr/mnd, høyeste Webagent 1 740 kr/mnd, med Acendia 990 kr/mnd mellom. Flere krever 12 måneders binding, prisene er oppgitt eks. mva, og du eier normalt ikke koden.",
  },
  {
    leverandor: "Etablerte byråer",
    gjelder: "Standard bedriftsside med skreddersydd design",
    lav: 80000,
    hoy: 200000,
    enhet: "engang",
    kilde: ["https://www.innovena.no/artikler/nettside/hvor-mye-koster-en-nettside/"],
    sistSjekket: "2026-10-07",
    merknad:
      "Innovena oppgir selv at tallene er veiledende anslag og ikke en dokumentert markedsundersøkelse. En enkel bedriftsside setter de til 30 000–80 000 kr.",
  },
  {
    leverandor: "Etablerte byråer",
    gjelder: "Webapplikasjon",
    lav: 250000,
    hoy: null,
    enhet: "engang",
    kilde: ["https://www.innovena.no/artikler/nettside/hvor-mye-koster-en-nettside/"],
    sistSjekket: "2026-10-07",
    merknad: "Oppgitt som «fra». Ingen øvre grense oppgitt.",
  },
];

/**
 * Timepriser i markedet, til sammenligning med vår egen på 950 kr.
 *
 * Tallene står i Innovenas prisartikkel, ordrett: «Byråer: 900–1 800 kr per
 * time» og «Frilansere og konsulenter: 600–1 200 kr per time». Lest 7. oktober
 * 2026. De sto tidligere oppført med forsiden som kilde, der det ikke er priser.
 */
export const markedTimepris = {
  byraaLav: 900,
  byraaHoy: 1800,
  frilansLav: 600,
  frilansHoy: 1200,
  kilde: ["https://www.innovena.no/artikler/nettside/hvor-mye-koster-en-nettside/"],
  sistSjekket: "2026-10-07",
} as const;
