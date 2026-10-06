/** Bilder av figuren i de tilstandene som må holde: begge temaer, redusert
 *  bevegelse, uten JavaScript, og mobil der lista overtar.
 *  Bruk: node .skudd/flyt-tilstander.mjs <url> <utkatalog> */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const [url, utDir, velgerRaa, indeksRaa] = process.argv.slice(2);
const V = velgerRaa ?? "flyt";
const IDX = Number(indeksRaa ?? 0);
mkdirSync(utDir, { recursive: true });
const b = await chromium.launch();

const tilfeller = [
  { navn: "a-morkt", v: { width: 1440, height: 900 }, tema: "dark" },
  { navn: "b-lyst", v: { width: 1440, height: 900 }, tema: "light" },
  { navn: "c-redusert", v: { width: 1440, height: 900 }, tema: "dark", rm: true },
  { navn: "d-utenjs", v: { width: 1440, height: 900 }, tema: "dark", js: false },
  { navn: "e-1024", v: { width: 1024, height: 900 }, tema: "dark" },
  { navn: "f-mobil", v: { width: 390, height: 844 }, tema: "dark" },
  { navn: "g-mobil-lys", v: { width: 390, height: 844 }, tema: "light" },
  { navn: "h-mobil-redusert", v: { width: 390, height: 844 }, tema: "dark", rm: true },
];

for (const t of tilfeller) {
  const ctx = await b.newContext({
    viewport: t.v,
    colorScheme: t.tema,
    reducedMotion: t.rm ? "reduce" : "no-preference",
    javaScriptEnabled: t.js !== false,
  });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(([v, i]) => document.querySelectorAll(`.${v}__ramme`)[i].scrollIntoView({ block: "center", behavior: "instant" }), [V, IDX]);
  await p.waitForTimeout(1500);
  // Frys midt i historien, der flest ting er i spill samtidig.
  await p.evaluate(() => {
    document.getAnimations()
      .filter((a) => /^(flyt|snitt)-/.test(a.animationName ?? "") && !(a.animationName ?? "").includes("tegnes") && !(a.animationName ?? "").includes("tones"))
      .forEach((a) => { a.pause(); a.currentTime = 2900; });
  }).catch(() => {});
  const drag = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth).catch(() => "?");
  const el = p.locator(`.${V}`).nth(IDX);
  writeFileSync(`${utDir}/${t.navn}.png`, await el.screenshot());
  console.log(`  ${t.navn.padEnd(18)} ${t.v.width}x${t.v.height} ${t.tema}${t.rm ? " redusert" : ""}${t.js === false ? " utenJS" : ""}  sidelengs drag: ${drag}px`);
  await ctx.close();
}
await b.close();
