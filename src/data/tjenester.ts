export interface Tjeneste {
  n: number; tittel: string; href: string; beskrivelse: string;
  punkter: string[]; lenketekst: string;
}

export const tjenester: Tjeneste[] = [
  {
    n: 1,
    tittel: "Nettsider",
    href: "/nettsider",
    beskrivelse: "Rask side som rangerer lokalt, består lovkravene og lar deg endre teksten selv.",
    punkter: ["Lighthouse 95+ som krav, ikke mål", "Lokal SEO og Google Bedriftsprofil", "WCAG 2.2 AA og cookieløs analyse"],
    lenketekst: "Se hva en nettside koster",
  },
  {
    n: 2,
    tittel: "Systemer og integrasjoner",
    href: "/systemer",
    beskrivelse: "Booking, betaling og regnskap som snakker sammen, slik at ingen skriver samme tall to ganger.",
    punkter: ["Booking og kundeportal", "Vipps og Stripe", "Tripletex, Fiken og PowerOffice"],
    lenketekst: "Se hva som kan kobles",
  },
  {
    n: 3,
    tittel: "Apper og AI",
    href: "/apper-og-ai",
    beskrivelse: "Intern app eller iOS-app fra samme sted som bygde nettsiden – og AI som faktisk gjør en jobb.",
    punkter: ["iOS-app i App Store", "Intern app for felt og verksted", "AI-assistent med databehandleravtale"],
    lenketekst: "Se hva vi har bygget",
  },
];
