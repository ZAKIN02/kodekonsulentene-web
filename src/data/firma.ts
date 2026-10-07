/**
 * Ett sted for alle fakta om foretaket. Endrer du noe her, endres det overalt:
 * footer, strukturert data, vilkår, personvernerklæring og tilbudsmaler.
 *
 * Foretaksdataene er hentet fra Enhetsregisteret (data.brreg.no) 5. oktober 2026.
 * Siden snakker i vi-form og nevner ingen person ved navn. Det registrerte
 * foretaksnavnet inneholder etternavnet fordi foretaksnavnloven § 2-2 krever det
 * av et enkeltpersonforetak – det står derfor bare i den lovpålagte footeren,
 * aldri i brødtekst.
 *
 * TODO før lansering: feltene merket PLASSHOLDER. Se docs/sjekklister/lansering.md.
 */
export const PLASSHOLDER_ORGNR = "000000000";

export const firma = {
  navn: "KodeKonsulentene",
  /** Registrert foretaksnavn i Enhetsregisteret. Må stå på nettsiden sammen med org.nr. */
  foretaksnavn: "KodeKonsulentene Elkassmi",
  /** Enhetsregisteret, registrert 14. oktober 2025. Enkeltpersonforetak. */
  orgnr: "936374336",
  /** true når foretaket er registrert i Merverdiavgiftsregisteret (omsetning > 50 000 kr / 12 mnd). */
  mva: false,
  /**
   * TODO: ehandelsloven § 8 krever geografisk adresse, ikke bare poststed.
   * Står som «Oslo» inntil postboks eller kontoradresse er på plass –
   * hjemmeadressen skal ikke publiseres.
   */
  adresse: "Oslo",
  epost: "hei@kodekonsulentene.no",
  /** TODO: tomt til et ekte nummer finnes. Footeren hopper over feltet når det er tomt. */
  telefon: "",
  domene: "kodekonsulentene.no",
  url: "https://kodekonsulentene.no",
  /** Cal.com-brukernavn. PLASSHOLDER. */
  cal: "kodekonsulentene/20min",
  timepris: "950 kr",
  tagline: "Nettsider som virker. Systemer som henger sammen.",
  /**
   * Forsidens <title> etter navnet. Taglinen er for lang: «KodeKonsulentene –
   * Nettsider som virker. Systemer som henger sammen.» er 68 tegn, og Google gir
   * omtrent 60 før den kutter. Da ryker halve setningen uansett, og plassen er
   * bedre brukt på de ordene folk søker på. Taglinen står fortsatt i footeren og
   * som `slogan` i strukturerte data – den er ikke borte, bare ikke i tittelen.
   */
  titteltillegg: "nettsider og systemer i Oslo",
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
// `as string` fordi firma er `as const`: uten den kan TypeScript bevise at
// sammenligningen er usann og klager, i stedet for å la porten stå igjen.
export const erUferdig: boolean = (firma.orgnr as string) === PLASSHOLDER_ORGNR;
