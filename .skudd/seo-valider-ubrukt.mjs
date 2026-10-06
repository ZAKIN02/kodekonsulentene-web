import { verktoy, tjeneste, loependeTilbud, faqSide } from "../src/data/schema.ts";
import { faq } from "../src/data/faq.ts";
console.log(JSON.stringify([
  verktoy({ navn: "DMARC-sjekk", beskrivelse: "Test", sti: "/verktoy/dmarc" }),
  tjeneste({ type: "Utvikling", navn: "Nettsider", beskrivelse: "Test", sti: "/nettsider", pakker: ["Start","System"] }),
  { "@context": "https://schema.org", "@type": "OfferCatalog", name: "Løpende", itemListElement: loependeTilbud() },
  faqSide(faq.slice(0,1)),
]));
