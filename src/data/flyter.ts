/**
 * Flytene vi faktisk selger, som data.
 *
 * Hvorfor dette finnes: nettstedet hadde 81 genererte bilder av aluminiumsplater
 * og null figurer som forklarer hva en kunde får kjøpt. En rørlegger som ser
 * plater henge i snorer, lærer ingenting om at tilbudet hans blir til en faktura
 * uten at noen taster tallene inn på nytt. En flyt med ekte navn på boksene –
 * «Vipps», «Fiken», «SMS 24 t før» – gjør det på to sekunder.
 *
 * Navnene MÅ være systemer vi faktisk kobler. Står det «Tripletex» i en figur,
 * skal det stå «Tripletex» i prislisten og i integrasjonslisten på /systemer.
 * En figur som finner på et systemnavn er samme feil som en oppdiktet case.
 */

export interface FlytNode {
  /** Navnet som males inne i boksen. Ekte system eller ekte ledd i flyten. */
  navn: string;
  /** Én linje under figuren som sier hva leddet gjør. Ingen påstander om tall. */
  detalj: string;
  /**
   * Valgfri tidsangivelse over boksen, i stedet for løpenummeret.
   *
   * Brukes av prosessflyten, der tiden ER poenget – seksjonen heter «Fire steg,
   * kjente tider». Står den tom, males løpenummeret som før.
   */
  tid?: string;
}

export interface Flyt {
  /** Overskrift over figuren. */
  tittel: string;
  /** Hele meningen i én setning, for skjermlesere og for folk uten SVG. */
  beskrivelse: string;
  noder: FlytNode[];
}

/**
 * Fire til fem ledd. Færre forklarer ingenting, flere blir uleselig på én linje –
 * boksbredden er fast, så viewBox vokser med antallet og skalerer ned i stedet.
 */
export const flyter = {
  /** /systemer – samme flyt som terminalutsnittet på siden viser i tekst. */
  systemer: {
    tittel: "Fra booking til regnskap",
    beskrivelse:
      "Kunden booker selv, betaler med Vipps ved bestilling, ordren havner i Fiken, og påminnelsen går på SMS 24 timer før timen. Ingen taster noe underveis.",
    noder: [
      { navn: "Kunde", detalj: "booker selv, døgnet rundt" },
      { navn: "Booking", detalj: "timen inn i kalenderen" },
      { navn: "Vipps", detalj: "betalt ved bestilling" },
      { navn: "Fiken", detalj: "ordren føres automatisk" },
      { navn: "SMS", detalj: "påminnelse 24 t før" },
    ],
  },

  /** /bransjer/klinikker – timebestilling som går hele veien inn i timeboken. */
  klinikker: {
    tittel: "Fra ledig time til oppgjort",
    beskrivelse:
      "Pasienten finner en ledig time utenom åpningstid, timen legges rett i behandlerens timebok, betalingen skjer med Vipps ved bestilling, og SMS-påminnelsen går ut automatisk.",
    noder: [
      { navn: "Pasient", detalj: "finner ledig time selv" },
      { navn: "Timebestilling", detalj: "rett i behandlerens timebok" },
      { navn: "Vipps", detalj: "betalt ved bestilling" },
      { navn: "SMS", detalj: "påminnelse 24 t før" },
    ],
  },

  /** /bransjer/handverkere – forespørsel som blir faktura uten dobbeltføring. */
  handverkere: {
    tittel: "Fra forespørsel til faktura",
    beskrivelse:
      "Forespørselen kommer inn i ett skjema, blir til et tilbud, blir til en ordre når kunden sier ja, og blir til faktura i Tripletex eller Fiken uten at noen skriver tallene inn på nytt.",
    noder: [
      { navn: "Forespørsel", detalj: "ett skjema, ingen innboks" },
      { navn: "Tilbud", detalj: "sendt samme dag" },
      { navn: "Ordre", detalj: "opprettes når kunden sier ja" },
      { navn: "Faktura", detalj: "i Tripletex eller Fiken" },
    ],
  },

  /**
   * /apper-og-ai – poenget er at appen ikke er et eget sted med egne tall.
   *
   * Tittelen het først «Én kundeliste, tre flater», men figuren tegner en KJEDE
   * med piler én vei, ikke et nav med flere flater rundt. En tittel som lover noe
   * annet enn streken viser, er samme feil som en figur med oppdiktede systemnavn.
   * Nå beskriver begge deler den samme veien ett tall tar.
   */
  apper: {
    tittel: "Samme tall, hele veien",
    beskrivelse:
      "Registrerer kunden noe i appen, er det det samme tallet som vises på nettsiden – fordi begge leser fra den samme databasen, ikke fra hver sin kopi som må holdes i synk.",
    noder: [
      { navn: "App", detalj: "det kunden har i lomma" },
      { navn: "Database", detalj: "ett sted tallene kommer fra" },
      { navn: "Nettside", detalj: "samme data, samme status" },
    ],
  },

  /**
   * Forsiden – de fire stegene, med tiden over boksen i stedet for løpenummer.
   *
   * Tidene er de samme som i src/data/prosess.ts. Står det «72 timer» her og
   * noe annet der, er figuren en løgn om vårt eget tilbud – derfor skal begge
   * endres samtidig.
   */
  prosess: {
    tittel: "Fire steg, kjente tider",
    beskrivelse:
      "Samtale på 20 minutter, klikkbar prototype innen 72 timer, bygging på to til tre uker til fast pris, og deretter løpende drift med overvåkning og månedsrapport.",
    noder: [
      { navn: "Samtale", tid: "20 min", detalj: "prisspenn på telefonen" },
      { navn: "Prototype", tid: "72 timer", detalj: "før du har betalt noe" },
      { navn: "Bygging", tid: "2–3 uker", detalj: "fast pris, to runder" },
      { navn: "Drift", tid: "Løpende", detalj: "overvåkning og rapport" },
    ],
  },
} as const satisfies Record<string, Flyt>;

export type FlytNokkel = keyof typeof flyter;

/* ------------------------------------------------------------------ snitt --- */

/**
 * Snitt: lag stablet oppå hverandre, sett fra siden.
 *
 * Forskjellen fra en flyt er retningen på meningen. En flyt er en VEI – noe
 * beveger seg fra venstre til høyre og blir til noe annet. Et snitt er en
 * OPPBYGNING – lagene finnes samtidig, og det nederste bærer det øverste.
 *
 * Å tegne en oppbygning som en kjede ville vært feil på samme måte som
 * «Én kundeliste, tre flater» var feil tittel på en kjede: figuren og påstanden
 * må beskrive den samme formen.
 */
export interface SnittLag {
  /** Navnet inne i stolpen. Ekte lag, ekte post eller ekte målepunkt. */
  navn: string;
  /** Én kort linje til høyre for stolpen. */
  detalj: string;
}

export interface Snitt {
  tittel: string;
  /** Hele meningen i én setning, for skjermlesere og for folk uten SVG. */
  beskrivelse: string;
  lag: SnittLag[];
  /**
   * Hvilket lag som får aksentfargen, som indeks. Brandboken tillater én
   * detalj per skjerm, så det er alltid nøyaktig ett – eller ingen, hvis ingen
   * av lagene er poenget framfor de andre.
   */
  aksent?: number;
}

export const snitt = {
  /**
   * /nettsider – det samme fire lagene som Lagstabel viser, men navngitt presist.
   *
   * Opptaket av lagstabelen står sterkere som bevis, fordi det er vår egen side
   * i drift. Denne figuren står ved siden av og setter navn på lagene, som et
   * opptak av en dragbar flate ikke rekker å gjøre leselig.
   */
  nettside: {
    tittel: "Hva som ligger inne i en nettside",
    beskrivelse:
      "En nettside er fire lag: designet kunden ser, koden som gjør at det virker, sikkerheten ingen spør om før det er for sent, og integrasjonene mot booking, Vipps og regnskap.",
    lag: [
      { navn: "Design", detalj: "det kunden ser" },
      { navn: "Kode", detalj: "det som gjør at det virker" },
      { navn: "Sikkerhet", detalj: "det ingen spør om før det er for sent" },
      { navn: "Integrasjoner", detalj: "booking, Vipps, regnskap" },
    ],
    aksent: 2,
  },

  /**
   * /sjekk – de fem punktene, i den rekkefølgen siden allerede oppgir.
   *
   * Navn og detaljer er ordrett de samme som i definisjonslista på /sjekk og i
   * radene byggRapport() returnerer. En figur som kalte dem noe annet enn
   * rapporten gjør, ville vært en tredje versjon av samme sannhet.
   */
  sjekk: {
    tittel: "Fem punkter, i denne rekkefølgen",
    beskrivelse:
      "Sjekken måler ytelse med Lighthouse, teller sikkerhetsheadere, ser etter cookies satt før samtykke, kjører en WCAG-test og sjekker om org.nr. står på siden.",
    lag: [
      { navn: "Ytelse", detalj: "Lighthouse, mobil" },
      { navn: "Sikkerhetsheadere", detalj: "CSP, HSTS, +4" },
      { navn: "Cookies før samtykke", detalj: "ekomloven § 3-15" },
      { navn: "Universell utforming", detalj: "WCAG 2.0 A/AA" },
      { navn: "Lovpålagt informasjon", detalj: "org.nr., ehandelsloven § 8" },
    ],
  },

  /**
   * /verktoy/dmarc – de tre postene, som faktisk ER en oppbygning.
   *
   * DMARC er ikke neste ledd etter DKIM i en kjede. Den LESER resultatet av
   * SPF og DKIM og bestemmer hva mottakeren skal gjøre. Derfor ligger den
   * øverst og hviler på de to andre, og derfor er den aksenten.
   */
  epost: {
    tittel: "Tre poster som bygger på hverandre",
    beskrivelse:
      "SPF sier hvilke servere som får sende for domenet. DKIM signerer hver e-post så mottakeren ser at innholdet ikke er endret. DMARC leser begge og sier hva mottakeren skal gjøre når noe ikke stemmer.",
    lag: [
      { navn: "DMARC", detalj: "hva mottaker skal gjøre" },
      { navn: "DKIM", detalj: "signatur på e-posten" },
      { navn: "SPF", detalj: "hvem får sende" },
    ],
    aksent: 0,
  },
} as const satisfies Record<string, Snitt>;

export type SnittNokkel = keyof typeof snitt;
