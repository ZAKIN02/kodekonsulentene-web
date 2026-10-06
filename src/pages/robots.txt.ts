import type { APIRoute } from "astro";
import { firma, erUferdig } from "../data/firma";

/**
 * Så lenge siden bærer plassholderdata stenger vi den for søkemotorer helt.
 * Når firma.orgnr er ekte, åpner den seg selv – ingen manuell bryter å glemme.
 */
export const GET: APIRoute = () => {
  const linjer = erUferdig
    ? [
        "# Siden er under oppsetting og har ennå ikke ekte foretaksdata.",
        "# Den åpnes for søk automatisk når org.nr. er på plass.",
        "User-agent: *",
        "Disallow: /",
      ]
    : [
        `# ${firma.domene}`,
        "User-agent: *",
        "Allow: /",
        "",
        "# Kvitteringssider har ingen verdi i søk og er merket noindex uansett.",
        "Disallow: /kontakt?",
        "Disallow: /sjekk?",
        "",
        "# /lab/* er interne demosider for komponenter og teknikker. De er merket",
        "# noindex, men en side som ikke skal indekseres bør heller ikke spise",
        "# kravlebudsjett – det er elleve prosent av sidene våre.",
        "Disallow: /lab/",
        "",
        `Sitemap: ${firma.url}/sitemap-index.xml`,
      ];
  return new Response(linjer.join("\n") + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
