#!/usr/bin/env node
/**
 * Laster de FERDIGE stillbildene opp til Higgsfield og skriver URL-ene inn i
 * scene.mjs sitt mellomlager som «startbilde».
 *
 * Hvorfor dette og ikke en ny redigering: bildene på /om, /caser, /handbok og
 * /status er allerede publisert, og kunden har sett dem. Genererer vi et nytt
 * startbilde fra basis med samme prompt, kommer vi nær – men ikke likt. Da ville
 * klippet starte på en annen komposisjon enn den siden viser, og første ramme
 * ville «hoppe» i forhold til plakaten. Ved å laste opp nøyaktig den fila som
 * ligger ute, er startrammen per definisjon identisk med bildet som er der nå.
 *
 * scene.mjs leser .skudd/scene-tmp/<id>-startbilde.url hvis den finnes, og
 * hopper da over redigeringen. Vi bruker det mellomlageret med vilje.
 */
import { HiggsfieldClient } from "@higgsfield/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const NOKKEL = process.env.HF_CREDENTIALS
  ?? (process.env.HIGGSFIELD_API_KEY && process.env.HIGGSFIELD_API_SECRET
      ? `${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}`
      : null);
if (!NOKKEL) { console.error("Mangler HF_CREDENTIALS."); process.exit(1); }
const [apiKey, apiSecret] = NOKKEL.split(":");

// Kildefilene er råbildene fra stillbilde.mjs, etter nøytralisering der den
// trengtes. Det er de samme pikslene som ble skalert ned til AVIF-ene i
// public/bilder/, bare uten tapet fra komprimeringen.
const KILDER = {
  "lev-om": ".skudd/bilde-tmp/nart-raa.png",
  "lev-caser": ".skudd/bilde-tmp/rekke-raa-nøytral.png",
  "lev-handbok": ".skudd/bilde-tmp/side-handbok-raa-noytral.png",
  "lev-status": ".skudd/bilde-tmp/side-status-raa.png",
};

const klient = new HiggsfieldClient({ apiKey, apiSecret, maxPollTime: 15 * 60 * 1000 });
mkdirSync(".skudd/scene-tmp", { recursive: true });

for (const [id, fil] of Object.entries(KILDER)) {
  const ut = `.skudd/scene-tmp/${id}-startbilde.url`;
  if (existsSync(ut)) { console.log(`  ${id.padEnd(12)} … allerede lastet opp`); continue; }
  if (!existsSync(fil)) { console.error(`  ${id.padEnd(12)} MANGLER ${fil}`); process.exit(1); }
  process.stdout.write(`  ${id.padEnd(12)} … `);
  const url = await klient.uploadImage(readFileSync(fil), "png");
  writeFileSync(ut, url);
  console.log(url);
}
klient.close?.();
console.log("\nFerdig. scene.mjs gjenbruker disse som startbilde.");
