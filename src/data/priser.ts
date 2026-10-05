/**
 * Prislisten. Ett sted – nettsiden, tilbudsmalen og skillen
 * .claude/skills/kodekonsulentene-tilbud leser de samme tallene.
 * Alle priser er eks. mva. Endrer du her, husk docs/prisliste.md.
 */
export interface Pakke {
  navn: string; pris: string; prefiks?: string; beskrivelse: string;
  inkludert: string[]; ikke?: string[]; anbefalt?: boolean; cta: string; href: string;
}

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

export interface Rad { navn: string; pris: string; tekst: string }

export const loepende: Rad[] = [
  {
    navn: "Abonnement",
    pris: "1 290–1 990 kr/mnd",
    tekst: "Side bygget, hosting, endringer og sikkerhetsoppdateringer. Ingen oppstartskostnad, 12 måneder binding. Tak på 1 time endringer per måned.",
  },
  {
    navn: "Drift og vedlikehold",
    pris: "590–1 490 kr/mnd",
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

export const prisvilkaar = [
  "Alle priser er eks. mva.",
  "40 % faktureres ved oppstart, resten ved lansering.",
  "To revisjonsrunder er inkludert. Flere runder er timepris.",
  "Du eier koden, innholdet og domenet – også hvis du sier opp.",
] as const;
