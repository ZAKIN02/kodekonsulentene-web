// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

// Static av default – hele markedssiden prerendres til HTML ved bygg.
// Bare /api/sjekk og /api/kontakt kjører på serveren (de har `export const prerender = false`).
//
// Adapteren står i `middleware`-modus, ikke `standalone`, og det er et bevisst valg:
// standalone-serveren serverer de prerendrede HTML-filene direkte fra disk og hopper over
// src/middleware.ts. Da hadde forsiden kommet ut uten sikkerhetsheadere – altså 0 av 6 på
// vår egen sjekk. server.mjs serverer de statiske filene selv og setter headerne på alt.
export default defineConfig({
  site: "https://kodekonsulentene.no",
  adapter: node({ mode: "middleware" }),
  integrations: [sitemap({ i18n: { defaultLocale: "nb", locales: { nb: "nb-NO" } } })],
  build: { inlineStylesheets: "always" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  devToolbar: { enabled: false },
});
