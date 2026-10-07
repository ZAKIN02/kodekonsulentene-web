/**
 * Prislisten. Ett sted – nettsiden, tilbudsmalen og skillen
 * .claude/skills/kodekonsulentene-tilbud leser de samme tallene.
 * Endrer du her, husk docs/prisliste.md.
 *
 * ── MVA: HVORFOR DET IKKE STÅR «EKS. MVA» LENGER ────────────────────────────
 *
 * Det sto «eks. mva» elleve ganger på /priser mens `firma.mva` var `false`.
 * Et foretak som ikke er registrert i Merverdiavgiftsregisteret KAN ikke
 * fakturere mva, så «eks. mva» er ikke et forbehold – det er et tillegg som
 * aldri kommer. Leseren regner 29 900 × 1,25 = 37 375 og legger på 25 % vi
 * ikke har lov til å kreve inn.
 *
 * Verifisert mot primærkilden 7. oktober 2026, ikke antatt:
 *   data.brreg.no/enhetsregisteret/api/enheter/936374336
 *   -> "registrertIMvaregisteret": false
 * Det stemmer med `firma.mva`, så feltet var riktig og teksten var feil.
 *
 * Og det treffer hardest der det koster mest: merverdiavgiftsloven § 3-2
 * unntar helsetjenester fra avgift, og unntaket gir ingen fradragsrett for
 * inngående avgift. En klinikk kan ikke trekke fra mva. For nøyaktig den
 * målgruppen /bransjer/klinikker henvender seg til, leses «eks. mva» som
 * 25 % reell merkostnad – på en pris der det ikke engang påløper.
 *
 * `mvaSetning` og `prisenhet` er derfor en VAKT, ikke en tekst: de snur av seg
 * selv den dagen omsetningen passerer 50 000 kr på tolv måneder og `firma.mva`
 * settes til `true`. Ingen skal måtte huske å lete opp elleve strenger da.
 */
// Med filendelse: priser.ts lastes direkte av Node i testene (`node --test`),
// og Node ESM løser ikke opp et extensionless spesifikator. Samme grunn som i
// src/lib/priskalkyle.ts.
import { firma } from "./firma.ts";

export interface Pakke {
  navn: string; pris: string; prefiks?: string; beskrivelse: string;
  inkludert: string[]; ikke?: string[]; anbefalt?: boolean; cta: string; href: string;
}

/**
 * Enheten som står i `small` rett under prisen på hvert pakkekort – aldri i en
 * fotnote, jf. docs/sidemonstre.md. «endelig pris» er ikke en salgsfrase; det
 * er den presise beskrivelsen av et beløp det ikke kommer avgift på toppen av.
 */
export const prisenhet: string = firma.mva ? "eks. mva" : "endelig pris";

/** Hele forklaringen, til vilkårslister og ingresser. */
export const mvaSetning: string = firma.mva
  ? "Alle priser er eks. mva."
  : "Prisene er endelige. Foretaket er ikke mva-registrert, så det kommer ingen mva på toppen.";

export const pakker: Pakke[] = [
  {
    navn: "Start",
    pris: "14 900 kr",
    beskrivelse: "Én til tre sider for deg som trenger å finnes, bli ringt og bestå lovkravene.",
    inkludert: [
      "1–3 sider, skrevet ferdig",
      "Booking eller kontaktskjema",
      "Grunnleggende SEO og Google Bedriftsprofil",
      "Lovsjekk: org.nr., cookies, universell utforming",
      "Du eier koden og domenet",
    ],
    ikke: ["CMS – vi endrer teksten for deg", "Lokal SEO per bydel"],
    cta: "Book 20 minutter",
    href: "/kontakt",
  },
  {
    navn: "Bedrift",
    pris: "29 900 kr",
    beskrivelse: "Fem til åtte sider med CMS, lokal SEO og analyse. Dette er pakken de fleste trenger.",
    inkludert: [
      "5–8 sider med CMS du kan redigere selv",
      "Lokal SEO per tjeneste og bydel",
      "Cookieløs analyse – ingen banner",
      "Lovsjekk og sikkerhetsheadere",
      "To revisjonsrunder",
      "Du eier koden og domenet",
    ],
    anbefalt: true,
    cta: "Book 20 minutter",
    href: "/kontakt",
  },
  {
    navn: "System",
    prefiks: "fra",
    pris: "60 000 kr",
    beskrivelse: "Web-app, kundeportal eller integrasjon mot de systemene du allerede betaler for.",
    inkludert: [
      "Booking, kundeportal eller intern app",
      "Vipps- eller Stripe-betaling",
      "Integrasjon mot Tripletex, Fiken eller PowerOffice",
      "BankID-innlogging ved behov",
      "Sikkerhetsgjennomgang før lansering",
      "Du eier koden og databasen",
    ],
    cta: "Beskriv behovet",
    href: "/kontakt",
  },
];

export interface Rad {
  navn: string;
  pris: string;
  tekst: string;
  /**
   * Månedsbeløpet som TALL, satt bare på de løpende radene. `pris`-strengen
   * skrives av disse to – ikke ved siden av dem – slik at treårsregnestykket i
   * `treAar` ikke kan komme i utakt med det som står i prislista. Det er samme
   * regel som ellers i huset: ett tall, ett sted.
   */
  maaned?: { lav: number; hoy: number };
}

/** «1 290» – vanlig mellomrom som tusenskiller, slik brandboken krever. */
const nb = (n: number): string => n.toLocaleString("nb-NO").replace(/ | /g, " ");
const perMnd = (m: { lav: number; hoy: number }): string =>
  `${nb(m.lav)}–${nb(m.hoy)} kr/mnd`;

const ABONNEMENT = { lav: 1290, hoy: 1990 };
const DRIFT = { lav: 590, hoy: 1490 };

export const loepende: Rad[] = [
  {
    navn: "Abonnement",
    maaned: ABONNEMENT,
    pris: perMnd(ABONNEMENT),
    tekst: "Side bygget, hosting, endringer og sikkerhetsoppdateringer. Ingen oppstartskostnad, 12 måneder binding. Tak på 1 time endringer per måned.",
  },
  {
    navn: "Drift og vedlikehold",
    maaned: DRIFT,
    pris: perMnd(DRIFT),
    tekst: "For deg som kjøper siden som engangskjøp. Oppdateringer, backup, overvåkning og 1 time endringer. Ingen binding.",
  },
  {
    navn: "Lovsjekk-pakke",
    pris: "7 900 kr",
    tekst: "Fastpris på eksisterende side: cookie-samtykke etter ekomloven § 3-15, universell utforming, org.nr.-krav og personvernerklæring. Rapport og utbedring.",
  },
  {
    navn: "Timepris",
    pris: "950 kr/t",
    tekst: "Utvidelser og arbeid utenfor avtalt omfang. Faktureres per påbegynte halvtime, avtalt skriftlig på forhånd.",
  },
];

export const prisvilkaar: string[] = [
  mvaSetning,
  "40 % faktureres ved oppstart, resten ved lansering.",
  "To revisjonsrunder er inkludert. Flere runder er timepris.",
  "Du eier koden, innholdet og domenet – også hvis du sier opp.",
];

/* --------------------------------------------------- tre år, ikke én faktura ---- */

/**
 * Totalkostnad over tre år.
 *
 * Kjøperens første spørsmål – «hva er totalprisen over tre år?» – svarte vi
 * ikke på noe sted. Det er det spørsmålet som avgjør mot et abonnement: 799 kr
 * i måneden høres billigere ut enn 29 900 kr én gang, helt til noen ganger 36.
 *
 * Formelen er ikke vår oppfinnelse; den er markedets eget beste
 * innvendingsverktøy, brukt av flere norske aktører:
 *   byggepris + 36 × månedskostnad = sammenlignbar totalkostnad.
 *
 * Her regnes den bare på VÅRE egne tall, rett fra listene over. Vi regner den
 * ikke for konkurrenter – deres månedspriser er hentet fra salgsmateriell og
 * kan endres uten at vi ser det. Leseren får formelen og kan kjøre den selv.
 */
export const MAANEDER = 36;

const sum = (engang: number, m: { lav: number; hoy: number }) => ({
  lav: engang + MAANEDER * m.lav,
  hoy: engang + MAANEDER * m.hoy,
});

export interface TreAarsRad { navn: string; forklaring: string; total: string }

/** Formaterer et spenn, eller ett tall når lav og høy er like. */
const spenn = (v: { lav: number; hoy: number }): string =>
  v.lav === v.hoy ? `${nb(v.lav)} kr` : `${nb(v.lav)}–${nb(v.hoy)} kr`;

/**
 * Pakkeprisen som tall, lest ut av `pakker` over. Ikke skrevet inn på nytt:
 * et tall som finnes to steder er et tall som før eller siden står feil ett
 * av dem.
 */
const BEDRIFT = Number((pakker.find((p) => p.navn === "Bedrift")?.pris ?? "").replace(/\D/g, ""));

export const treAar: TreAarsRad[] = [
  {
    navn: "Engangskjøp + drift",
    forklaring: `Bedrift-pakken én gang, pluss ${MAANEDER} måneder drift og vedlikehold uten binding.`,
    total: spenn(sum(BEDRIFT, DRIFT)),
  },
  {
    navn: "Abonnement hos oss",
    forklaring: `Ingen oppstartskostnad, ${MAANEDER} måneder à ${perMnd(ABONNEMENT)}. 12 måneder binding.`,
    total: spenn(sum(0, ABONNEMENT)),
  },
];
