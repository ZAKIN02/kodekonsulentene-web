/**
 * Ett sted for alle fakta om foretaket. Endrer du noe her, endres det overalt:
 * footer, strukturert data, vilkår, personvernerklæring og tilbudsmaler.
 *
 * TODO før lansering: feltene merket PLASSHOLDER må byttes ut med ekte verdier.
 * `npm run test` feiler på plassholder-org.nr., slik at siden ikke kan deployes
 * uten at det er på plass. Se docs/sjekklister/lansering.md.
 */
export const PLASSHOLDER_ORGNR = "000000000";

export const firma = {
  navn: "KodeKonsulentene",
  /** Registrert foretaksnavn i Brønnøysundregistrene. PLASSHOLDER. */
  foretaksnavn: "KodeKonsulentene ENK",
  /** PLASSHOLDER – ni siffer fra Brønnøysundregistrene. */
  orgnr: PLASSHOLDER_ORGNR,
  /** true når foretaket er registrert i Merverdiavgiftsregisteret (omsetning > 50 000 kr / 12 mnd). */
  mva: false,
  person: "Zakaria",
  rolle: "utvikler",
  /** PLASSHOLDER – geografisk adresse er påkrevd etter ehandelsloven § 8. */
  adresse: "Oslo",
  epost: "hei@kodekonsulentene.no",
  /** PLASSHOLDER. */
  telefon: "+47 000 00 000",
  domene: "kodekonsulentene.no",
  url: "https://kodekonsulentene.no",
  /** Cal.com-brukernavn. PLASSHOLDER. */
  cal: "kodekonsulentene/20min",
  timepris: "950 kr",
  tagline: "Nettsider som virker. Systemer som henger sammen.",
  /** Posisjoneringen i én setning – brukes i meta description og i tilbud. */
  posisjonering:
    "For norske småbedrifter som har vokst ut av Wix-siden: nettsider og systemer som henger sammen med booking, Vipps og regnskap – sikkert, raskt og til fast pris.",
  svartid: "24 timer",
  /** Cookieløs analyse betyr ingen banner. Står i footeren som en påstand vi kan bevise. */
  cookieNote: "Denne siden bruker ikke cookies.",
} as const;

export const bookUrl = `https://cal.com/${firma.cal}`;

/**
 * Sann så lenge siden fortsatt bærer plassholdere i stedet for ekte foretaksdata.
 * Mens den er sann nekter siden å bli indeksert: et org.nr. som ikke finnes er
 * nettopp det /sjekk flagger som brudd hos andre, og det skal ikke stå på vår egen
 * side i Google. Den slår seg av av seg selv når firma.orgnr er ekte.
 */
export const erUferdig = firma.orgnr === PLASSHOLDER_ORGNR;
