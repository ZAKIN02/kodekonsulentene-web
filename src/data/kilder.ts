/**
 * Kilderegisteret: hvert eksterne tall og hver lovhjemmel vi bruker, med
 * henvisningen slik den skal stå på siden.
 *
 * ── HVORFOR FILA FINNES ─────────────────────────────────────────────────────
 *
 * En markedsresearch 7. oktober 2026 skrev først at de to SSB-tallene på
 * /bransjer/handverkere – 72 % og 86 % – ikke fantes hos SSB. Det var feil, men
 * feilen var forståelig: SSB flyttet 2026-tallene fra tabell 10975 («Formål med
 * eiga heimeside», etter SN2007) til tabell 14933 (ny næringsstandard SN2025),
 * og de to tabellene gir ULIKE tall. I den gamle tabellen finnes 72 ikke.
 *
 * Siden vår sa bare «Kilde: SSB, bruk av IKT i næringslivet». Hvem som helst som
 * etterprøver oss og havner i tabell 10975 vil tro vi lyver. Vi selger
 * etterrettelighet; da er en kildehenvisning uten tabellnummer ikke god nok.
 *
 * REGELEN: et eksternt tall skal siteres med registeret OG nummeret OG datoen.
 * «SSB, tabell 14933, 2026-tall etter SN2025» – ikke «SSB».
 *
 * ── HVORDAN DEN BRUKES ──────────────────────────────────────────────────────
 *
 * Sider henter `henvisning` herfra i stedet for å skrive kilden som fri tekst,
 * slik at samme kilde blir sitert likt overalt og bare må rettes ett sted.
 * test/kilder.test.ts krever at hver `url` svarer, at hver `hentet` er en
 * fortidig ISO-dato, og at ingen oppføring står uten begge.
 *
 * `hentet` er datoen VI åpnet kilden og leste tallet. `kildeOppdatert` er datoen
 * KILDEN selv oppgir. De er ikke det samme, og det er den første som forteller
 * om vi har kontrollert noe i det siste.
 */

export interface Kilde {
  /** Nøkkelen sider slår opp på. */
  id: string;
  /**
   * Kildehenvisningen ordrett, slik den skal stå i teksten. Skal inneholde det
   * som gjør den etterprøvbar: registernavn, tabell- eller paragrafnummer, år.
   */
  henvisning: string;
  url: string;
  /** ISO-dato. Datoen vi selv hentet kilden og leste tallet i den. */
  hentet: string;
  /** ISO-dato, der kilden selv oppgir når den sist ble oppdatert. */
  kildeOppdatert?: string;
  /** Tallene eller ordlyden vi faktisk leste. Ingen tall som ikke sto der. */
  lest?: string[];
  /** Forbehold som MÅ følge tallet når det brukes. */
  forbehold?: string[];
  /**
   * Verten svarer 403, 406, 429 eller 503 på automatiske oppslag uten at
   * dokumentet er borte. Lenkesjekken skal da ikke dømme den død – men den skal
   * kontrolleres i en ekte nettleser før noen endrer URL-en.
   */
  robotsperre?: boolean;
}

export const kilder: Kilde[] = [
  /* ------------------------------------------------------------ statistikk ---- */
  {
    id: "ssb-14933",
    henvisning:
      "SSB, tabell 14933 «Bruk av sosiale medium og heimeside (prosent), etter næring (SN2025), sysselsette», 2026-tall, oppdatert 25. september 2026",
    url: "https://www.ssb.no/statbank/table/14933",
    hentet: "2026-10-07",
    kildeOppdatert: "2026-09-25",
    lest: [
      "Byggje- og anleggsverksemd, 10–19 sysselsette, har heimeside 2026: 72 %",
      "I alt, alle sysselsette, har heimeside 2026: 86 %",
      "I alt, 10–19 sysselsette, har heimeside 2026: 80 %",
      "Byggje- og anleggsverksemd, alle sysselsette, har heimeside 2026: 83 %",
    ],
    forbehold: [
      "Undersøkelsen dekker bare foretak med minst ti sysselsatte. Enkeltpersonforetak og de minste bedriftene er ikke med, og det er flertallet av markedet vårt.",
      "2026-tallene bruker ny næringsstandard (SN2025) og kan ikke sammenlignes direkte med tidligere år.",
      "Den gamle serien ligger i tabell 10975 etter SN2007 og gir andre tall for samme næring. Oppgi derfor alltid tabellnummeret, ellers ser et riktig tall galt ut.",
    ],
  },
  {
    id: "ssb-10975",
    henvisning:
      "SSB, tabell 10975 «Formål med eiga heimeside», etter næringsstandarden SN2007",
    url: "https://www.ssb.no/statbank/table/10975",
    hentet: "2026-10-07",
    forbehold: [
      "Står her bare for å kunne pekes på: dette er den gamle tabellen, og den skal IKKE brukes som kilde for 2026-tall. Bruk ssb-14933.",
    ],
  },
  {
    id: "uuregisteret",
    henvisning:
      "Tilsynet for universell utforming av ikt, åpne data fra tilgjengelighetserklæringene",
    url: "https://data.uutilsynet.no/dataset/alle-erklaeringer",
    hentet: "2026-10-07",
    lest: [
      "Tallene aggregeres av scripts/uuregister.mjs til src/data/uu-register.json, som bærer sin egen hentet-dato.",
    ],
    forbehold: [
      "Erklæringene er virksomhetenes EGEN rapportering, ikke tilsynets måling. «Brudd» betyr at virksomheten selv har oppgitt avvik.",
    ],
  },
  {
    id: "uuregisteret-dokumentasjon",
    henvisning:
      "Tilsynet for universell utforming av ikt, «Opne data frå tilgjengelegheitserklæringane» – dokumentasjon av datasettet",
    url: "https://www.uutilsynet.no/innsikt-og-analyse/opne-data-fra-tilgjengelegheitserklaeringane/3076",
    hentet: "2026-10-07",
    lest: [
      "Beskriver feltene og lisensen i datasettet uuregisteret bygger på. Står som `dokumentasjon` i src/data/uu-register.json.",
    ],
  },
  {
    id: "brreg-oss",
    henvisning: "Enhetsregisteret, organisasjonsnummer 936374336",
    url: "https://data.brreg.no/enhetsregisteret/api/enheter/936374336",
    hentet: "2026-10-07",
    lest: [
      "navn: KODEKONSULENTENE ELKASSMI",
      "organisasjonsform: ENK (enkeltpersonforetak)",
      "registreringsdatoEnhetsregisteret: 2025-10-14",
      "registrertIMvaregisteret: false – foretaket kan ikke fakturere mva",
      "registrertIForetaksregisteret: false",
      "harRegistrertAntallAnsatte: false",
    ],
    forbehold: [
      "Forretningsadressen i registeret er en privatadresse og skal ikke publiseres. Siden oppgir poststed, og den åpne mangelen på gateadresse etter ehandelsloven § 8 er dokumentert i firma.ts.",
    ],
  },

  /* --------------------------------------------------------------- regelverk ---- */
  {
    id: "ekomloven-3-15",
    henvisning:
      "Ekomloven (LOV-2024-12-13-76) § 3-15 «Bruk av informasjonskapsler mv.», i kraft 1. januar 2025",
    url: "https://lovdata.no/lov/2024-12-13-76/%C2%A73-15",
    hentet: "2026-10-07",
    robotsperre: true,
    lest: [
      "Lagring av eller tilgang til informasjon i brukerens kommunikasjonsutstyr krever at brukeren er informert om hvilke opplysninger som behandles, formålet og hvem som behandler dem, og at det innhentes samtykke som oppfyller GDPR-kravene.",
      "Unntak for lagring som er teknisk nødvendig for å overføre signalet eller for å levere en tjeneste brukeren har bedt om.",
    ],
    forbehold: [
      "Den gamle hjemmelen var ekomloven 2003 § 2-7b, og den er opphevet. Siter aldri § 2-7b.",
      "Ingen overgangsperiode. Datatilsynet opplyste at reglene gjelder fra 1. januar 2025.",
    ],
  },
  {
    id: "ekomloven-kap15",
    henvisning: "Ekomloven (LOV-2024-12-13-76) kapittel 15, §§ 15-11 og 15-12",
    url: "https://lovdata.no/dokument/NL/lov/2024-12-13-76/kap15",
    hentet: "2026-10-07",
    robotsperre: true,
    lest: [
      "§ 15-11 tvangsmulkt, § 15-12 overtredelsesgebyr. Gebyret kan ikke overstige 10 prosent av tilbyderens årlige omsetning i Norge.",
    ],
  },
  {
    id: "datatilsynet-cookies-2025",
    henvisning: "Datatilsynet, «Nye cookie-regler fra 1. januar»",
    url: "https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2024/nye-cookie-regler-fra-1.-januar/",
    hentet: "2026-10-07",
    lest: [
      "«Kravene til samtykke for bruk av informasjonskapsler (cookies) og lignende teknologier ble skjerpet 1. januar.»",
      "Samtykket må oppfylle GDPR-kravene for å være gyldig.",
    ],
  },
  {
    id: "uu-forskriften-4",
    henvisning:
      "Forskrift om universell utforming av ikt-løsninger (FOR-2013-06-21-732) § 4",
    url: "https://lovdata.no/dokument/SF/forskrift/2013-06-21-732",
    hentet: "2026-10-07",
    robotsperre: true,
    lest: [
      "«Private virksomheters nettløsninger skal minst utformes i samsvar med standard Web Content Accessibility Guidelines 2.0 (WCAG 2.0)/NS/ISO/IEC 40500:2012, på nivå A og AA med unntak for suksesskriteriene 1.2.3, 1.2.4 og 1.2.5, eller tilsvarende denne standard.»",
      "Forskriften trådte i kraft 1. juli 2013.",
    ],
    forbehold: [
      "WCAG 2.0 har 61 suksesskriterier. A og AA er 38, minus de tre unntakene = 35. Det er derfor tallet 35 er riktig, og hvorfor det ikke er 35 av WCAG 2.1 eller 2.2.",
    ],
  },
  {
    id: "uutilsynet-35-krav",
    henvisning: "Tilsynet for universell utforming av ikt, «Kva seier forskrifta»",
    url: "https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153",
    hentet: "2026-10-07",
    lest: [
      "«Private verksemders nettløysingar skal minimum utformast i samsvar med 35 suksesskriterium i WCAG 2.0, eller tilsvarande.»",
      "Tilgjengelighetserklæring er bare pliktig for offentlige virksomheter.",
      "Offentlig sektor: «ytterlegare 12 suksesskriterium som berre gjeld for offentleg sektor», og «løysingane må vere i samsvar med dei nye krava frå 1. februar 2023».",
    ],
    forbehold: [
      "Private har ikke plikt til tilgjengelighetserklæring. Ikke antyd at de har det.",
      "Tilgjengelighetsdirektivet (EAA) er ikke gjennomført i norsk rett. Ikke bruk 28. juni 2025 som frist. Den gjeldende fristen er 1. januar 2021, som gjelder også eksisterende nettløsninger.",
      // Denne står her fordi en kontroll 7. oktober 2026 nesten rettet 48 til 47.
      "TALLET FOR OFFENTLIG SEKTOR ER 48, IKKE 47. Uutilsynet skriver «12 nye suksesskriterium», og 35 + 12 = 47 – men regnestykket er feil, ikke tallet. WCAG 2.1 har 50 suksesskriterier på nivå A og AA; offentlig sektor er unntatt 1.2.3 og 1.2.4, altså 48. Forskjellen fra privat er de 12 kriteriene WCAG 2.1 la til PLUSS 1.2.5, som går fra unntatt til påkrevd: 35 + 12 + 1 = 48. Kontrollerbart i vårt eget datasett: `kravRader` i src/data/uu-register.json har nøyaktig 48 rader, og 1.2.5 er med mens 1.2.3 og 1.2.4 ikke er.",
    ],
  },
  {
    id: "uutilsynet-tilsynsdata",
    henvisning:
      "Tilsynet for universell utforming av ikt, «Data frå tilsyn og kontroll», 2015–2026",
    url: "https://www.uutilsynet.no/innsikt-og-analyse/data-fra-tilsyn-og-kontroll/2052",
    hentet: "2026-10-07",
    lest: [
      "92 ikt-løsninger kontrollert, 90 med brudd på minstekravene, 22 vedtak om tvangsmulkt, 2 tvangsmulkter faktisk iverksatt.",
    ],
    forbehold: [
      "Det finnes ingen fast sats og ingen maksbeløp for tvangsmulkt ved brudd på de tekniske kravene. Satsen på 5 000 kr per virkedag gjelder manglende tilgjengelighetserklæring, og bare for offentlig sektor.",
      "Påstanden om at tvangsmulkt «ligger mellom 2 000 og 5 000 kr per dag» for tekniske brudd finnes ikke i forskriften, loven eller hos tilsynet. Den skal ikke brukes.",
    ],
  },
  {
    id: "foretaksregisterloven-10-2",
    henvisning: "Foretaksregisterloven (LOV-1985-06-21-78) § 10-2 første ledd",
    url: "https://lovdata.no/lov/1985-06-21-78/%C2%A710-2",
    hentet: "2026-10-07",
    robotsperre: true,
    lest: [
      "«Et foretaks hjemmesider på Internett, brev og forretningsdokumenter, uavhengig av hvilket medium de forefinnes på, skal inneholde foretakets organisasjonsnummer og foretaksnavn.»",
    ],
    forbehold: [
      "Plikten følger av foretaksregisterloven og retter seg mot foretak som er registrert i Foretaksregisteret. Et enkeltpersonforetak som bare står i Enhetsregisteret – som vårt eget – treffes ikke av § 10-2. For dem er hjemmelen ehandelsloven § 8, som gjelder uansett for den som tilbyr en informasjonssamfunnstjeneste. Skriv aldri at § 10-2 gjelder «alle foretak».",
    ],
  },
  {
    id: "ehandelsloven-8",
    henvisning:
      "Ehandelsloven (LOV-2003-05-23-35) § 8 «Tjenesteyterens opplysningsplikt om virksomheten»",
    url: "https://lovdata.no/lov/2003-05-23-35/%C2%A78",
    hentet: "2026-10-07",
    robotsperre: true,
    lest: [
      "Krever navn, adresse, elektronisk postadresse og øvrige opplysninger som gjør det mulig å komme i direkte forbindelse.",
      "Krever registeret tjenesteyteren er registrert i, organisasjonsnummer, og om virksomheten er merverdiavgiftspliktig.",
    ],
    forbehold: [
      "At vi oppgir at foretaket IKKE er mva-registrert er ikke en forklaring vi velger å gi – § 8 krever at mva-statusen opplyses.",
    ],
  },
  {
    id: "foretaksnavneloven-2-2",
    henvisning: "Foretaksnavneloven (LOV-1985-06-21-79) § 2-2 første ledd",
    url: "https://lovdata.no/lov/1985-06-21-79/%C2%A72-2",
    hentet: "2026-10-07",
    robotsperre: true,
    lest: [
      "«Foretaksnavn for enkeltpersonforetak skal inneholde innehaverens etternavn.»",
    ],
  },
  {
    id: "mval-3-2",
    henvisning:
      "Skatteetatens Merverdiavgiftshåndbok, merverdiavgiftsloven § 3-2 om helsetjenester",
    url: "https://www.skatteetaten.no/rettskilder/type/handboker/merverdiavgiftshandboken/2023/M-3/M-3-2/M-3-2.2/",
    hentet: "2026-10-07",
    lest: [
      "Helsetjenester er unntatt fra merverdiavgift, og unntaket gir ingen fradragsrett for inngående avgift.",
    ],
    forbehold: [
      "Konsekvensen for /bransjer/klinikker: en klinikk kan ikke trekke fra mva. Et «eks. mva» leses derfor som 25 % reell merkostnad.",
    ],
  },
  {
    id: "markedsforingsloven-15",
    henvisning:
      "Forbrukertilsynets veiledning om markedsføring via e-post, SMS o.l. (markedsføringsloven § 15)",
    url: "https://www.forbrukertilsynet.no/lov-og-rett/veiledninger-og-retningslinjer/forbrukertilsynets-veiledning-markedsforing-via-e-post-sms-o-l",
    hentet: "2026-10-07",
    robotsperre: true,
    lest: [
      "Forbudet gjelder alle fysiske personer, også en fysisk persons individuelle jobbadresse.",
      "Det gjelder også når adressen er registrert som kontaktadresse til et foretak i Brønnøysundregistrene.",
    ],
    forbehold: [
      "Et enkeltpersonforetak ER en fysisk person. Kald markedsførings-e-post til ENK-adresser hentet fra Enhetsregisteret er derfor ikke lovlig, uansett hvor åpent registeret er.",
      "Gratis-skanningen er bare lovlig så lenge brukeren selv ber om den og selv oppgir adressen sin. Bygg aldri en versjon som sender rapporter til skrapede adresser.",
      "Verten svarer 406 på enkelte lange nettleser-user-agents. Det er en bot-sperre, ikke en død lenke – kontrollert i nettleser 7. oktober 2026.",
    ],
  },
];

/** Slår opp en kilde, og feiler høyt hvis id-en ikke finnes. */
export function kilde(id: string): Kilde {
  const k = kilder.find((x) => x.id === id);
  if (!k) throw new Error(`Ukjent kilde: ${id}. Legg den til i src/data/kilder.ts.`);
  return k;
}
