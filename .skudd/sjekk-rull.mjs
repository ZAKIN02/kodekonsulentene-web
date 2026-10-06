/**
 * EKTE visningsbilder gjennom en seksjon - ikke fullPage.
 *
 * fullPage evaluerer scroll-drevne animasjoner ved scroll 0, saa alt under
 * foerste skjermhoeyde fotograferes med opacity 0. Og clip + fullPage sammen
 * tolker koordinater ulikt. Her scrolles det paa ekte, og hvert skudd er det
 * brukeren faktisk ser.
 */
import { chromium } from "playwright";
const [base, side, velger, utPrefiks, breddeArg, antallArg] = process.argv.slice(2);
const bredde = +(breddeArg ?? 1512), antall = +(antallArg ?? 4);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
await p.goto(base + side, { waitUntil: "networkidle" });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(100); }
const omr = await p.evaluate((vel) => {
  const el = document.querySelector(vel);
  const r = el.getBoundingClientRect();
  return { topp: r.top + scrollY, hoyde: r.height };
}, velger);
for (let i = 0; i < antall; i++) {
  const y = Math.max(0, omr.topp - 100 + (omr.hoyde + 600) * (i / Math.max(1, antall - 1)) - (i ? 0 : 0));
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${utPrefiks}-${i}.png` });
}
console.log(`  ${antall} skudd fra y=${Math.round(omr.topp - 100)} (seksjon ${Math.round(omr.hoyde)}px)`);
await b.close();
