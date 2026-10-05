import type { ProofItem } from "../components/ProofStrip.astro";

/**
 * Bevis-stripen. Regelen fra brandboken: tallene skal være sanne.
 *
 * Hvert tall her er målt på denne siden i produksjon, og kan etterprøves av den
 * som leser – tre av dem ved å kjøre /sjekk på kodekonsulentene.no.
 * Påstander vi ikke har målt, står ikke her. Legger du til et tall, skal du
 * kunne peke på hvor det kommer fra.
 */
export const bevis: ProofItem[] = [
  { value: "6/6", label: "Sikkerhetsheadere på denne siden", accent: true },
  { value: "0", label: "Cookies før samtykke" },
  { value: "0,1 s", label: "Svartid, målt fra Oslo" },
  { value: "24 t", label: "Svar på henvendelser" },
];
