#!/usr/bin/env node
/**
 * UTGÅTT i runde 4 (historien C «Lampa»): bruk tests/wow/lampa-stripe.mjs. Denne leser kortene og
 * telleren fra runde 3–5, som ikke finnes lenger.
 *
 * Filmstripe av historien i ScrollWorld (runde wow-r5): ett bilde per 150 px rulling gjennom
 * hele filmen og gjennom overgangen til rapporten, på desktop (1440 × 900) og mobil (390 × 844).
 * Skriver også tilstand.json per visning: aktivt kort, fase, teller, om bildet er grått, hvilket
 * lag som vises, overgangen og hvor mange tekster på platen som er synlige (aldri over 1).
 *
 * Bruk:  node tests/wow/historie-stripe.mjs <url> <utmappe> [steg]
 * Eks.:  node tests/wow/historie-stripe.mjs http://127.0.0.1:4711/ .design/arbeid/bevegelse/r3/stripe
 * Lager <utmappe>/<visning>/NNN-yYYYY.png og ark-<visning>-N.png (kontaktark, 24 bilder per ark).
 * Bevegelse er på; installert Chrome brukes (H.264).
 */
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const [url, ut, stegArg] = process.argv.slice(2);
if (!url || !ut) {
  console.error("Bruk: node tests/wow/historie-stripe.mjs <url> <utmappe> [steg]");
  process.exit(1);
}
const STEG = Number(stegArg ?? 150);
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: "chrome" });
const bare = process.env.VISNING;

for (const [navn, vp, mobil] of [
  ["desktop", { width: 1440, height: 900 }, false],
  ["mobil", { width: 390, height: 844 }, true],
]) {
  if (bare && bare !== navn) continue;
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
  });
  await ctx.addInitScript(() => sessionStorage.setItem("wow-inngang", "1"));
  const p = await ctx.newPage();
  const feil = [];
  p.on("pageerror", (e) => feil.push(e.message));
  p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  await p.goto(url, { waitUntil: "load" });
  await p.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
  await p.mouse.move(vp.width / 2, vp.height / 2);
  // Første berøring (iOS-priming i skriptet), midt i heroen der det ikke er noen lenke.
  if (mobil) await p.touchscreen.tap(vp.width - 30, Math.round(vp.height * 0.3)).catch(() => {});
  await sov(800);

  const slutt = await p.evaluate(() => {
    const rot = document.querySelector("[data-scroll-world]");
    const rapport = document.querySelector("[data-sw-rapport] .wow-rapport");
    return Math.round((rapport ?? rot).getBoundingClientRect().bottom + scrollY - (rapport ? innerHeight * 0.6 : 0));
  });
  const tilstand = [];
  let n = 0;
  for (let y = 0; y <= slutt; y += STEG, n++) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await sov(n === 0 ? 300 : 650);
    const fil = `${String(n).padStart(3, "0")}-y${y}.png`;
    await p.screenshot({ path: path.join(mappe, fil) });
    tilstand.push({
      y,
      fil,
      ...(await p.evaluate(() => {
        const op = (el) => {
          let o = 1;
          for (let e = el; e && e !== document.body; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
          return o;
        };
        const faser = [...document.querySelectorAll(".sw__fase")].filter((f) => op(f) > 0.02);
        const kort = document.querySelector("[data-sw-kort][data-sw-aktiv]");
        const lag = [...document.querySelectorAll("[data-sw-lag]")].filter((l) => getComputedStyle(l).visibility === "visible").map((l) => l.dataset.swLag);
        const hero = document.querySelector('[data-sw-kapittel="0"] [data-sw-tekst]');
        return {
          synligeTekster: faser.length,
          tekst: faser.map((f) => f.textContent.trim().slice(0, 40)),
          kort: kort?.dataset.swKort ?? null,
          fase: kort?.dataset.fase ?? null,
          teller: document.querySelector("[data-sw-teller-sr]")?.textContent ?? null,
          gra: document.querySelector(".sw__gra[data-aktiv]") !== null,
          overgang: document.querySelector("[data-sw-rapport]")?.dataset.swOvergang ?? null,
          lag,
          hero: hero ? Number(getComputedStyle(hero).opacity).toFixed(2) : null,
          maal: [...document.querySelectorAll("[data-sw-maaling]")].map((r) => (r.hasAttribute("data-last") ? "x" : "-")).join(""),
        };
      })),
    });
  }
  writeFileSync(path.join(mappe, "tilstand.json"), JSON.stringify(tilstand, null, 1));
  await ctx.close();

  // Kontaktark: 24 bilder per ark (6 × 4), i rekkefølge (rulleposisjonen står i tilstand.json).
  const filer = tilstand.map((t) => t.fil);
  for (let a = 0; a * 24 < filer.length; a++) {
    const del = filer.slice(a * 24, a * 24 + 24);
    const liste = path.join(mappe, `liste-${a}.txt`);
    writeFileSync(liste, del.map((f) => `file '${path.join(mappe, f)}'`).join("\n"));
    const skala = mobil ? "195:422" : "360:225";
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", liste,
      "-vf", `scale=${skala},tile=6x4:padding=4:color=gray`,
      "-frames:v", "1", path.join(ut, `ark-${navn}-${a}.png`),
    ]);
  }
  const maks = Math.max(...tilstand.map((t) => t.synligeTekster));
  console.log(`${navn}: ${n} bilder, maks synlige tekster på platen: ${maks}, feil: ${feil.length ? feil.join(" | ") : "ingen"}`);
}
await b.close();
