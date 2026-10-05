export interface Case {
  slug: string;
  tittel: string;
  kunde: string;
  type: "App" | "System" | "Nettside" | "Konsept" | "Demo";
  problem: string;
  losning: string;
  /** Utelates helt når vi ennå ikke har målte tall. Aldri anslag presentert som målinger. */
  resultat?: { verdi: string; tekst: string }[];
  stack: string[];
  href?: string;
  bilde?: string;
  bildeAlt?: string;
}

/**
 * Casene. Reglene fra brandboken: problem → løsning → resultat med tall, og
 * tallene skal være sanne. En case uten målte tall skal ikke ha en resultatliste
 * med anslag – da står den uten, og det er synlig at den står uten.
 *
 * TODO: de to app-casene trenger ekte navn, tall og vurderinger før de kan vises.
 * Så lenge de inneholder TODO holdes de utenfor sidene av `synligeCaser`.
 */
export const caser: Case[] = [
  {
    slug: "ios-app-1",
    tittel: "TODO: navn på app nummer én",
    kunde: "Eget produkt",
    type: "App",
    problem: "TODO: hvilket problem løste appen, og for hvem.",
    losning: "TODO: hva som ble bygget, i én setning uten teknologinavn.",
    resultat: [
      { verdi: "TODO", tekst: "nedlastinger" },
      { verdi: "TODO", tekst: "vurdering i App Store" },
    ],
    stack: ["Swift", "SwiftUI"],
  },
  {
    slug: "ios-app-2",
    tittel: "TODO: navn på app nummer to",
    kunde: "Eget produkt",
    type: "App",
    problem: "TODO.",
    losning: "TODO.",
    resultat: [{ verdi: "TODO", tekst: "brukere" }],
    stack: ["Swift"],
  },
  {
    slug: "booking-demo",
    tittel: "Bookingsystem for klinikk",
    kunde: "Demo – ikke et levert oppdrag",
    type: "Demo",
    problem:
      "Timebestilling over telefon i åpningstiden betyr tapte timer, avbrutte behandlinger og en halv dag i måneden på å avstemme Vipps mot regnskapet.",
    losning:
      "Booking med Vipps-betaling ved bestilling, automatisk SMS-påminnelse, og timen rett inn i behandlerens kalender og som ordre i regnskapet.",
    stack: ["Astro", "Supabase", "Vipps"],
    href: "/bransjer/klinikker",
  },
];

/**
 * Casene som faktisk kan vises. Alt som fortsatt inneholder TODO holdes utenfor
 * sidene – en tom seksjon er ærligere enn plassholdertekst i Google.
 * Fjern TODO-ene i listen over, så dukker casene opp av seg selv.
 */
export const synligeCaser: Case[] = caser.filter(
  (c) => !JSON.stringify(c).includes("TODO"),
);
