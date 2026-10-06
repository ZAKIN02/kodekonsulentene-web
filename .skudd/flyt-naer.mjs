/** Nærbilde av ETT ledd mens pakken er i lufta. Kontaktarket viser historien,
 *  men er for lite til å se om glimtet og prikken faktisk tegnes – og en prikk
 *  man ikke ser er en prikk som ikke finnes.
 *  Bruk: node .skudd/flyt-naer.mjs <url> <ut.png> <tider i ms, komma> [tema] */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const [url, ut, tiderRaa, tema] = process.argv.slice(2);
const tider = (tiderRaa ?? "700,850,1000,1150").split(",").map(Number);
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 3,
  colorScheme: tema === "light" ? "light" : "dark",
});
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".flyt__ramme").scrollIntoView({ block: "center", behavior: "instant" }));
await p.waitForTimeout(1200);
await p.evaluate(() => {
  window.__mine = document.getAnimations().filter((a) => (a.animationName ?? "").startsWith("flyt-") && !(a.animationName ?? "").includes("tegnes") && !(a.animationName ?? "").includes("tones"));
  window.__mine.forEach((a) => a.pause());
});
// Utsnittet: fra midten av boks 1 til midten av boks 2, i VISNINGSkoordinater –
// clip uten fullPage leses i visningsvinduet, ikke i siden.
const boks = await p.evaluate(() => {
  const r = document.querySelectorAll(".flyt__boks");
  const a = r[0].getBoundingClientRect(), c = r[1].getBoundingClientRect();
  return { x: Math.round(a.x + a.width / 2), y: Math.round(a.y - 26), width: Math.round(c.x + c.width / 2 - (a.x + a.width / 2)), height: Math.round(a.height + 52) };
});
const deler = [];
for (const t of tider) {
  await p.evaluate((v) => window.__mine.forEach((a) => (a.currentTime = v)), t);
  const f = `${ut.replace(/\.png$/, "")}-${t}.png`;
  writeFileSync(f, await p.screenshot({ clip: boks }));
  deler.push(f);
}
console.log(deler.join("\n"));
await b.close();
