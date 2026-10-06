/** Spoler filmen med scroll? Leser currentTime i flere scrollposisjoner.
 *  Et klipp som staar paa samme ramme er «film» som ikke gir noe tilbake. */
import { chromium } from "playwright";
const [base, side] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto(base + side, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const rammer = [];
for (const y of [0, 150, 300, 450, 600, 750, 900]) {
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(420);
  const r = await p.evaluate(() => {
    const v = document.querySelector("[data-scenefilm] video");
    return v ? { t: +v.currentTime.toFixed(2), d: +(v.duration || 0).toFixed(2), klar: v.readyState, spolbar: v.seekable.length ? +v.seekable.end(0).toFixed(2) : 0 } : null;
  });
  rammer.push(`y=${String(y).padStart(3)} t=${r?.t}`);
  if (y === 0) console.log(`  varighet ${r?.d}s  readyState ${r?.klar}  seekable.end ${r?.spolbar}s`);
}
console.log("  " + rammer.join("  "));
await b.close();
