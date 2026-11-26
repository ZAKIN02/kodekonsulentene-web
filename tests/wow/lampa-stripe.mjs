#!/usr/bin/env node
/**
 * Filmstripe av filmen på forsiden, historien C «Lampa» (runde 4): ett bilde per STEG skjermhøyder
 * gjennom hele filmen og inn i rapporten, på desktop (1440 × 900) og mobil (390 × 844). Filnavnet
 * har tilstanden: hvilken linje som står, om bildet er grått, om lampa er målt, og laget.
 * Skriver også tilstand.json per visning, og kontaktark (20 bilder per ark).
 *
 * Bruk:  node tests/wow/lampa-stripe.mjs <url> <utmappe> [steg]
 * Eks.:  node tests/wow/lampa-stripe.mjs http://127.0.0.1:4700/ .design/arbeid/bevegelse/lampa/stripe 0.3
 * Miljø: VISNING=desktop | mobil. Bevegelse på; installert Chrome (H.264).
 */
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const [url, ut, stegArg] = process.argv.slice(2);
if (!url || !ut) {
  console.error("Bruk: node tests/wow/lampa-stripe.mjs <url> <utmappe> [steg]");
  process.exit(1);
}
const STEG = Number(stegArg ?? 0.3);
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: "chrome" });

for (const [navn, vp, mobil] of [
  ["desktop", { width: 1440, height: 900 }, false],
  ["mobil", { width: 390, height: 844 }, true],
]) {
  if (process.env.VISNING && process.env.VISNING !== navn) continue;
  const mappe = path.join(ut, navn);
  rmSync(mappe, { recursive: true, force: true });
  mkdirSync(mappe, { recursive: true });
  const ctx = await b.newContext({ viewport: vp, isMobile: mobil, hasTouch: mobil, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => sessionStorage.setItem("wow-inngang", "1"));
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForFunction(() => document.querySelector("[data-scroll-world]")?.dataset.swModus === "film");
  await p.keyboard.press("Shift");
  await sov(1500);
  const W = await p.evaluate(() => JSON.parse(document.querySelector("[data-scroll-world]").dataset.swTider).W);
  const tilstand = [];
  const bilder = [];
  let n = 0;
  for (let t = 0; t <= W + 1.2; t += STEG) {
    await p.evaluate((t) => {
      const r = document.querySelector("[data-scroll-world]");
      const W = JSON.parse(r.dataset.swTider).W;
      const topp = r.getBoundingClientRect().top + scrollY;
      scrollTo(0, Math.round(topp + (t / W) * (r.offsetHeight - innerHeight)));
    }, t);
    await sov(900);
    const s = await p.evaluate(() => {
      const r = document.querySelector("[data-scroll-world]");
      const aktiv = r.querySelector("[data-sw-linje][data-sw-aktiv]");
      const plate = r.querySelector("[data-sw-plate]");
      const synlige = [...r.querySelectorAll("[data-sw-linje]")].filter((l) => Number(getComputedStyle(l).opacity) > 0.05).length;
      const lag = [...r.querySelectorAll("[data-sw-lag]")].findIndex((l) => l.style.visibility === "visible");
      return {
        linje: aktiv ? Number(aktiv.dataset.swLinje) : -1,
        tekst: aktiv?.textContent?.trim().slice(0, 60) ?? "",
        plate: plate?.hasAttribute("data-synlig") ?? false,
        synlige,
        gra: Number(getComputedStyle(r.querySelector(".sw__gra")).opacity) > 0.5,
        malt: plate?.hasAttribute("data-malt") ?? false,
        lag,
        overgang: document.querySelector("[data-sw-rapport]")?.dataset.swOvergang ?? "",
      };
    });
    const fil = path.join(mappe, `${String(n).padStart(3, "0")}-t${t.toFixed(2)}-l${s.linje}-${s.gra ? "graa" : "farge"}-${s.malt ? "malt" : "hul"}.png`);
    await p.screenshot({ path: fil });
    bilder.push(fil);
    tilstand.push({ t: Number(t.toFixed(2)), ...s });
    n++;
  }
  writeFileSync(path.join(mappe, "tilstand.json"), JSON.stringify(tilstand, null, 2));
  for (let i = 0; i < bilder.length; i += 20) {
    execFileSync("magick", [
      "montage", "-label", "%t", ...bilder.slice(i, i + 20), "-tile", mobil ? "10x2" : "5x4",
      "-geometry", mobil ? "195x422+2+2" : "360x225+2+2", "-pointsize", "10", "-fill", "white", "-background", "#222",
      path.join(ut, `ark-${navn}-${i / 20 + 1}.png`),
    ]);
  }
  await ctx.close();
}
await b.close();
