#!/usr/bin/env node
/**
 * Filmstripe av Kapittel (bølge A2): ett bilde per andel av kapittelets rulling, på desktop
 * (1440 × 900) og mobil (390 × 844), med tilstanden skrevet i filnavnet (fase, om bildet er grått,
 * om klippet har tegnet). Bevegelse er på; installert Chrome brukes (H.264).
 *
 * Bruk:  node tests/wow/kapittel-stripe.mjs <url> <utmappe>
 * Eks.:  node tests/wow/kapittel-stripe.mjs http://127.0.0.1:4700/lab/kapittel/nettsider .design/arbeid/bevegelse/a2/nettsider
 * Miljø: VISNING=desktop | mobil (standard: begge). REDUSERT=1 tar ett bilde med redusert bevegelse.
 * Lager <utmappe>/<visning>-NN-pPPP-<fase>.png og ark-<visning>.png (kontaktark).
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const [url, ut] = process.argv.slice(2);
if (!url || !ut) {
  console.error("Bruk: node tests/wow/kapittel-stripe.mjs <url> <utmappe>");
  process.exit(1);
}
const ANDELER = [0, 0.06, 0.15, 0.3, 0.44, 0.47, 0.6, 0.8, 1, 1.15];
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(ut, { recursive: true });
const b = await chromium.launch({ channel: "chrome" });

for (const [navn, vp, mobil] of [
  ["desktop", { width: 1440, height: 900 }, false],
  ["mobil", { width: 390, height: 844 }, true],
]) {
  if (process.env.VISNING && process.env.VISNING !== navn) continue;
  const ctx = await b.newContext({
    viewport: vp,
    isMobile: mobil,
    hasTouch: mobil,
    deviceScaleFactor: 1,
    reducedMotion: process.env.REDUSERT ? "reduce" : "no-preference",
  });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForFunction(() => document.querySelector("[data-kapittel]")?.hasAttribute("data-kapittel-klar"));
  const bilder = [];
  if (process.env.REDUSERT) {
    const fil = path.join(ut, `${navn}-redusert.png`);
    await p.screenshot({ path: fil });
    bilder.push(fil);
  } else {
    // Første interaksjon: klippet hentes.
    await p.mouse.wheel(0, 1);
    await sov(1500);
    for (const [i, a] of ANDELER.entries()) {
      const y = await p.evaluate((a) => {
        const k = document.querySelector("[data-kapittel]");
        const topp = k.getBoundingClientRect().top + scrollY;
        return Math.round(topp + a * (k.offsetHeight - innerHeight));
      }, a);
      await p.evaluate((y) => scrollTo(0, y), y);
      await sov(1100);
      const t = await p.evaluate(() => {
        const k = document.querySelector("[data-kapittel]");
        const gra = getComputedStyle(k.querySelector("[data-kapittel-gra]")).opacity;
        const v = k.querySelector("video");
        return {
          fase: k.dataset.kapittelFase,
          gra: Number(gra) > 0.5 ? "graa" : "farge",
          klipp: k.querySelector("[data-kapittel-flate]").hasAttribute("data-har-klipp") ? `v${v.currentTime.toFixed(2)}` : "bilde",
        };
      });
      const fil = path.join(ut, `${navn}-${String(i).padStart(2, "0")}-p${Math.round(a * 100)}-${t.fase}-${t.gra}-${t.klipp}.png`);
      await p.screenshot({ path: fil });
      bilder.push(fil);
    }
  }
  if (bilder.length > 1) {
    execFileSync("magick", [
      "montage", "-label", "%t", ...bilder, "-tile", mobil ? "5x2" : "4x3",
      "-geometry", mobil ? "234x506+3+3" : "480x300+3+3", "-pointsize", "11", "-fill", "white", "-background", "#222",
      path.join(ut, `ark-${navn}.png`),
    ]);
  }
  await ctx.close();
}
await b.close();
