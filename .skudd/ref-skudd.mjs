import { chromium } from "playwright";
const [url, ut, tema] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema || "light" });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
await p.waitForTimeout(2500);
// Tre skjermbilder gjennom siden, satt sammen.
const h = await p.evaluate(() => document.documentElement.scrollHeight);
const stopp = [0, Math.round(h * 0.35), Math.round(h * 0.7)];
const filer = [];
for (let i = 0; i < stopp.length; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), stopp[i]);
  await p.waitForTimeout(900);
  const f = `/tmp/ref-${i}.png`;
  await p.screenshot({ path: f });
  filer.push(f);
}
console.log(filer.join(" "));
await b.close();
