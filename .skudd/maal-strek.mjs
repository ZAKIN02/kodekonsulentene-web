/** Scenestreken er nå et ekte element, så computed transform er pålitelig. */
import { chromium } from "playwright";
const b = await chromium.launch();
const [url, ...flagg] = process.argv.slice(2);
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: flagg.includes("--rolig") ? "reduce" : "no-preference",
  javaScriptEnabled: !flagg.includes("--ujs"),
});
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle" });
const n = await p.evaluate(() => document.querySelectorAll(".scene__strek").length);
const topp = await p.evaluate(() => {
  const s = [...document.querySelectorAll(".scene__strek")].filter((e) => getComputedStyle(e).display !== "none")[0];
  return s ? s.getBoundingClientRect().top + scrollY : -1;
});
if (topp < 0) { console.log(`  ingen synlig strek (${n} i DOM)`); await b.close(); process.exit(0); }
const sett = [];
for (let d = -1000; d <= 100; d += 50) {
  await p.evaluate((y) => scrollTo(0, y), topp + d);
  await p.waitForTimeout(90);
  const t = await p.evaluate(() => {
    const s = [...document.querySelectorAll(".scene__strek")].filter((e) => getComputedStyle(e).display !== "none")[0];
    const f = getComputedStyle(s).transform;
    return f === "none" ? 1 : +f.split("(")[1].split(",")[0];
  });
  sett.push(`${d}:${t.toFixed(2)}`);
}
console.log(`  ${n} streker i DOM`);
console.log(`  ${sett.join("  ")}`);
await b.close();
