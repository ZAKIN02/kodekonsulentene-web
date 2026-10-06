/**
 * Genererer ikonsettet for nettlesere og hjemskjerm fra kk-mark.svg.
 * Kjøres ved behov, ikke i bygget – merket endrer seg sjelden.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const merke = readFileSync("public/logo/kk-mark.svg");

// Vanlige ikoner: merket fyller hele flaten.
for (const [fil, px] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  await sharp(merke, { density: 384 }).resize(px, px).png({ compressionLevel: 9 }).toFile(`public/logo/${fil}`);
}

// Maskable: Android klipper ikonet til sirkel, hjerte eller firkant. Motivet må
// ligge innenfor en trygg sone på 80 %, ellers kuttes K-ene. Vi legger merket på
// 62 % av flaten, sentrert, på samme limegrønne bakgrunn.
const K = 512;
const indre = Math.round(K * 0.62);
const motiv = await sharp(merke, { density: 384 }).resize(indre, indre).png().toBuffer();
await sharp({ create: { width: K, height: K, channels: 4, background: "#c8f24a" } })
  .composite([{ input: motiv, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile("public/logo/icon-maskable-512.png");

// Liten PNG-fallback for nettlesere som ikke tar SVG-favicon.
await sharp(merke, { density: 256 }).resize(32, 32).png({ compressionLevel: 9 }).toFile("public/favicon-32.png");

console.log("ferdig");
