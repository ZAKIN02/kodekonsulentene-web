export interface Case {
  slug: string; tittel: string; kunde: string; type: "App" | "System" | "Nettside" | "Konsept";
  problem: string; losning: string; resultat: { verdi: string; tekst: string }[];
  stack: string[]; href?: string; bilde?: string; bildeAlt?: string;
}

/**
 * TODO: erstatt med ekte caser. Reglene fra brandboken:
 * problem → løsning → resultat med tall, og tallene skal være sanne.
 * Konseptredesign skal alltid merkes «Konsept, ikke oppdrag».
 * Egne apper teller som caser – det er det sterkeste beviset når du er ny.
 */
export const caser: Case[] = [
  {
    slug: "ios-app-1",
    tittel: "TODO: navn på app nummer én",
    kunde: "Eget produkt",
    type: "App",
    problem: "TODO: hvilket problem løste appen, og for hvem.",
    losning: "TODO: hva du bygde, i én setning uten teknologinavn.",
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
    kunde: "Demo",
    type: "System",
    problem: "Timebestilling over telefon i åpningstiden betyr tapte timer og avbrutte behandlinger.",
    losning: "Booking med Vipps-betaling ved bestilling, automatisk SMS-påminnelse og timer rett inn i Fiken som ordre.",
    resultat: [
      { verdi: "TODO", tekst: "færre telefoner per uke" },
      { verdi: "TODO", tekst: "spart tid per måned" },
    ],
    stack: ["Astro", "Supabase", "Vipps"],
    href: "/bransjer/klinikker",
  },
];
