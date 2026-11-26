#!/usr/bin/env node
/**
 * Filmstripe av wow-bevegelsen. Mønster fra .skudd/sammenligning/opptak.mjs.
 *
 * Bruk:  node tests/wow/opptak.mjs <url> <utmappe>
 * Eks.:  node tests/wow/opptak.mjs http://127.0.0.1:4436/lab/wow-bevegelse .design/arbeid/bevegelse/wow
 *
 * For desktop (1440 × 900) og mobil (390 × 844):
 *   intro-NN.png   bilder på tid fra første kjøring av skriptet (introen)
 *   rull-NN.png    bilder mens siden rulles med musehjulet (desktop) eller i rykk (mobil)
 * pluss en video av hele turen med VIDEO=1. Bevegelse er på; installert Chrome brukes.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, readdirSync, renameSync } from "node:fs";
import path from "node:path";

const [url, ut] = process.argv.slice(2);
if (!url || !ut) {
  console.error("Bruk: node tests/wow/opptak.mjs <url> <utmappe>");
  process.exit(1);
}
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: "chrome" });

for (const [navn, vp, mobil] of [
  ["desktop", { width: 1440, height: 900 }, false],
  ["mobil", { width: 390, height: 844 }, true],
]) {
  const mappe = path.resolve(ut, navn);
  rmSync(mappe, { recursive: true, force: true });
  mkdirSync(mappe, { recursive: true });
  const ctx = await b.newContext({
    viewport: vp,
    isMobile: mobil,
    hasTouch: mobil,
    deviceScaleFactor: 1,
    locale: "nb-NO",
    reducedMotion: "no-preference",
    // Video krever Playwrights ffmpeg (npx playwright install ffmpeg). Slå på med VIDEO=1.
    ...(process.env.VIDEO ? { recordVideo: { dir: mappe, size: vp } } : {}),
  });
  const p = await ctx.newPage();
  const feil = [];
  p.on("pageerror", (e) => feil.push(e.message));
  p.on("console", (m) => m.type() === "error" && feil.push(m.text()));

  await p.goto(url, { waitUntil: "commit" });
  await p.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
  const t0 = Date.now();
  let i = 0;
  for (const t of [0, 250, 500, 750, 1000, 1200, 1350, 1500, 1700, 2000, 2400, 3000]) {
    const vent = t - (Date.now() - t0);
    if (vent > 0) await sov(vent);
    await p.screenshot({ path: `${mappe}/intro-${String(i++).padStart(2, "0")}-${t}ms.png` });
  }

  const hoyde = await p.evaluate(() => document.documentElement.scrollHeight);
  const steg = Math.round(vp.height * 0.6);
  let n = 0;
  for (let y = 0; y < hoyde && n < 40; n++) {
    await p.screenshot({ path: `${mappe}/rull-${String(n).padStart(2, "0")}.png` });
    if (mobil) {
      await p.evaluate((d) => window.scrollBy(0, d), steg);
    } else {
      for (let d = 0; d < 6; d++) {
        await p.mouse.wheel(0, steg / 6);
        await sov(40);
      }
    }
    await sov(700);
    const ny = await p.evaluate(() => Math.round(scrollY));
    if (ny === y) break;
    y = ny;
  }
  await ctx.close();
  const video = readdirSync(mappe).find((f) => f.endsWith(".webm"));
  if (video) renameSync(path.join(mappe, video), path.join(mappe, "tur.webm"));
  console.log(`${navn}: ${n} rullebilder, feil: ${feil.length ? feil.join(" | ") : "ingen"}`);
}
await b.close();
