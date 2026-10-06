/**
 * Summerer FAKTISKE byte over nett ved foerstelast, uten scroll.
 *
 * content-length leses synkront fra svarhodet. En tidligere maaling brukte
 * `await response.body()` og fikk 18 kB paa en side med 65 kB HTML, fordi siden
 * rakk aa lukkes foer halvparten av svarene var lest.
 */
import { chromium } from "playwright";
const [base, side, breddeArg, scrollArg] = process.argv.slice(2);
const bredde = +(breddeArg ?? 390);
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: bredde, height: bredde < 700 ? 844 : 900 },
  deviceScaleFactor: bredde < 700 ? 3 : 1,
  bypassCSP: false,
});
const p = await ctx.newPage();
const sum = new Map();
p.on("response", (r) => {
  const n = +(r.headers()["content-length"] ?? 0);
  if (!n) return;
  const u = new URL(r.url()).pathname;
  const type = /\.(mp4|webm)$/.test(u) ? "video" : /\.(avif|webp|png|jpg|svg)$/.test(u) ? "bilde"
    : /\.(woff2?|ttf)$/.test(u) ? "font" : /\.js$/.test(u) ? "js" : /\.css$/.test(u) ? "css" : "annet";
  sum.set(type, (sum.get(type) ?? 0) + n);
});
await p.goto(base + side, { waitUntil: "networkidle" });
if (scrollArg === "scroll") {
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 500) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(260); }
  await p.waitForTimeout(1800);
}
const tot = [...sum.values()].reduce((a, v) => a + v, 0);
const deler = [...sum.entries()].sort((a, z) => z[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v / 1024)}`).join(", ");
console.log(`  ${side} @${bredde}px ${scrollArg === "scroll" ? "etter scroll" : "foerstelast"}: ${Math.round(tot / 1024)} kB  (${deler})`);
await b.close();
