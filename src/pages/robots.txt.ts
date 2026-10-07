import type { APIRoute } from "astro";
import { firma, erUferdig } from "../data/firma";

/**
 * ANDELEN LAB-SIDER – TELT, IKKE ANSLÅTT.
 *
 * Her sto «det er elleve prosent av sidene våre». Det stemte ikke: /lab/ er 14
 * av de 43 .astro-sidene i src/pages, altså omtrent en tredel. Elleve prosent
 * ville betydd rundt fem sider.
 *
 * Feilen er av den typen som ikke blir oppdaget, fordi ingen leser robots.txt
 * og fordi tallet var riktig den dagen det ble skrevet. Derfor er det ikke
 * rettet til et nytt fast tall – det telles ved bygg. `import.meta.glob` med
 * `eager: false` henter bare filnavnene; ingen sidemodul lastes, og tallet kan
 * ikke komme i utakt med mappen igjen.
 *
 * 404-siden holdes utenfor begge tellingene: den er ingen adresse en crawler
 * bruker budsjett på.
 */
const SIDER = Object.keys(import.meta.glob("./**/*.astro")).filter(
  (p) => !p.endsWith("/404.astro"),
);
const LABSIDER = SIDER.filter((p) => p.startsWith("./lab/"));
const ANDEL = Math.round((LABSIDER.length / SIDER.length) * 100);

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
        `# kravlebudsjett – det er ${LABSIDER.length} av ${SIDER.length} sider, rundt ${ANDEL} prosent.`,
        "Disallow: /lab/",
        "",
        `Sitemap: ${firma.url}/sitemap-index.xml`,
      ];
  return new Response(linjer.join("\n") + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
