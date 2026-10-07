// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
// Artikkeldatoene leses fra samme fil som sidene og markupen bruker, så sitemap
// ikke kan si en annen dato enn den som står i teksten.
import { artikler } from "./src/data/artikler.ts";

/**
 * Prioritet i sitemap er et HINT om hvilke sider som betyr mest for OSS – ikke
 * en rangeringsfaktor. Den styrer hvor ofte Google kommer tilbake, og det er
 * verdt å si fra om: salgsvilkårene våre trenger ikke samme oppmerksomhet som
 * verktøyene, som er de beste inngangsportene vi har fra søk.
 */
const prioritet = (sti) => {
  if (sti === "/") return 1.0;
  if (["/nettsider", "/systemer", "/apper-og-ai", "/sikkerhet", "/priser"].includes(sti)) return 0.9;
  // Verktøyene er gratis, krever ingen innlogging og svarer på det folk faktisk
  // søker etter. De er like viktige som tjenestesidene.
  if (sti === "/sjekk" || sti.startsWith("/verktoy")) return 0.9;
  if (sti.startsWith("/bransjer/")) return 0.8;
  // Artiklene falt gjennom til 0.3 – samme nivå som salgsvilkårene. De er det
  // eneste innholdet her som svarer på søk ingen har skrevet firmanavnet i
  // («må nettsiden ha org.nr.», «cookies uten samtykke»), og de er derfor blant
  // de beste inngangene vi har. Oversikten er knutepunktet og ligger likt.
  if (sti === "/artikler" || sti.startsWith("/artikler/")) return 0.7;
  if (sti === "/kontakt") return 0.7;
  if (["/caser", "/om", "/handbok"].includes(sti)) return 0.6;
  if (["/status", "/terminal"].includes(sti)) return 0.4;
  return 0.3; // /personvern, /vilkar
};

const frekvens = (sti) => {
  if (sti === "/status") return "weekly";
  if (["/personvern", "/vilkar"].includes(sti)) return "yearly";
  return "monthly";
};

/**
 * `lastmod`, men BARE der vi har en ekte dato.
 *
 * Artiklene har `oppdatert` i src/data/artikler.ts – datoen innholdet sist ble
 * kontrollert mot kilden. Den er sann og den er nyttig: Google bruker lastmod til
 * å avgjøre om en side er verdt å kravle på nytt.
 *
 * De andre sidene får INGEN lastmod. Alternativet hadde vært byggetidspunktet, og
 * det er en løgn i XML: hver deploy ville meldt at alle 27 sidene var endret.
 * Google ignorerer lastmod-datoer den oppdager er upålitelige, så en falsk dato
 * på alt ville også ødelagt verdien av de tre som er ekte.
 */
const artikkelDatoer = Object.fromEntries(
  artikler.map((a) => [`/artikler/${a.slug}`, a.oppdatert]),
);
const sistEndret = (sti) => artikkelDatoer[sti];

// Static av default – hele markedssiden prerendres til HTML ved bygg.
// Bare /api/sjekk og /api/kontakt kjører på serveren (de har `export const prerender = false`).
//
// Adapteren står i `middleware`-modus, ikke `standalone`, og det er et bevisst valg:
// standalone-serveren serverer de prerendrede HTML-filene direkte fra disk og hopper over
// src/middleware.ts. Da hadde forsiden kommet ut uten sikkerhetsheadere – altså 0 av 6 på
// vår egen sjekk. server.mjs serverer de statiske filene selv og setter headerne på alt.
export default defineConfig({
  site: "https://kodekonsulentene.no",
  // Astros egen checkOrigin sammenligner Origin mot forespørselens EGEN URL. Bak Fly
  // snakker Node over http internt, så den regnet origin som http:// mens nettleseren
  // sendte https:// – og hver eneste skjemainnsending ble 403. x-forwarded-proto
  // hjelper ikke; adapteren leser den ikke. Kontrollen ligger nå i src/lib/opphav.ts,
  // der vi kjenner vårt eget domene, og dekkes av en test.
  security: { checkOrigin: false },
  adapter: node({ mode: "middleware" }),
  integrations: [
    sitemap({
      // /lab/* er interne demosider. De er merket noindex, og lå LIKEVEL i
      // sitemap – åtte av 31 URL-er. Google rapporterer den kombinasjonen som
      // feilen «Innsendt URL er merket noindex», og det er en reell feil: vi
      // ber om indeksering og nekter den i samme åndedrag.
      filter: (side) => !side.includes("/lab/"),
      serialize(element) {
        const sti = new URL(element.url).pathname.replace(/\/+$/, "") || "/";
        element.priority = prioritet(sti);
        element.changefreq = frekvens(sti);
        const dato = sistEndret(sti);
        if (dato) element.lastmod = new Date(dato).toISOString();
        return element;
      },
      // INGEN i18n-blokk. Den sto her og deklarerte `xmlns:xhtml` i sitemap uten
      // å sende et eneste <xhtml:link>-element, fordi det bare finnes én locale.
      // Nettstedet er enspråklig norsk; hreflang og alternates hører til et
      // nettsted som har noe å peke på. Se docs/seo-teknisk.md.
    }),
  ],
  build: { inlineStylesheets: "always" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  devToolbar: { enabled: false },
});
