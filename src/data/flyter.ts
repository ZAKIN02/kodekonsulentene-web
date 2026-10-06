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
} as const satisfies Record<string, Flyt>;

export type FlytNokkel = keyof typeof flyter;
