import type { ProofItem } from "../components/ProofStrip.astro";

/**
 * Bevis-stripen. Regelen fra brandboken: tallene skal være sanne.
 * Hvert tall skal kunne etterprøves av den som leser – ellers skal det ut.
 */
export const bevis: ProofItem[] = [
  { value: "100", label: "Lighthouse på denne siden, mobil", accent: true },
  { value: "0,8 s", label: "Last-tid, målt på 4G" },
  { value: "5", label: "Egne apper publisert på App Store" },
  { value: "24 t", label: "Svar på henvendelser" },
  { value: "0", label: "Cookies før samtykke" },
];
