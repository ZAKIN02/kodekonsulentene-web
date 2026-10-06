/** Ekte visningsbilder gjennom et gjennomloep – ikke fullPage, som fotograferer
 *  scroll-drevne elementer med opacity 0. */
import { chromium } from "playwright";
const [base, side, ut, breddeRaa, velger] = process.argv.slice(2);
const bredde = Number(breddeRaa || 390);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: bredde, height: 844 }, deviceScaleFactor: 2, isMobile: bredde < 900, hasTouch: bredde < 900 });
const p = await ctx.newPage();
await p.goto(base + side, { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 500) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
if (velger) {
  const el = await p.$(velger);
  if (el) { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); }
}
await p.waitForTimeout(300);
await p.screenshot({ path: ut });
console.log("  " + ut);
await b.close();
