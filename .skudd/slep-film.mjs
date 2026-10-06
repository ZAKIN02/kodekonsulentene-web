/** Ruller forbi komponenten paa ekte mobil-visningsbilde og filmer visningsbildet.
 *  Visningsbilde-skudd, ikke fullPage: fullPage fotograferer rullestyrte
 *  elementer paa opasitet 0. */
import { chromium } from "playwright";
const [url, ut, merke] = process.argv.slice(2);
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await c.newPage();
await p.goto(url, { waitUntil: "networkidle" });
const topp = await p.evaluate(() => document.querySelector("[data-slep]").getBoundingClientRect().top + scrollY);
let n = 0;
for (let y = topp - 700; y < topp + 900; y += 120) {
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(260);
  await p.screenshot({ path: `${ut}/${merke}-${String(n++).padStart(2, "0")}.png` });
}
console.log("ruter:", n, "topp:", Math.round(topp));
await b.close();
