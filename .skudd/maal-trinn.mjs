/** Leser opasitet på de seks kortene på /systemer gjennom et scroll-gjennomløp.
 *  Er trappen levende, skal kortene nå full opasitet på ULIKE scroll-posisjoner. */
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const topp = await p.evaluate(() => {
  const el = document.querySelector("#integrasjoner");
  return el ? el.getBoundingClientRect().top + scrollY : 0;
});
for (let d = -700; d <= 300; d += 100) {
  await p.evaluate((y) => scrollTo(0, y), topp + d);
  await p.waitForTimeout(110);
  const op = await p.evaluate(() =>
    [...document.querySelectorAll("#integrasjoner .card")].map((e) => (+getComputedStyle(e).opacity).toFixed(2)));
  console.log(`  scroll ${String(d).padStart(5)}:  ${op.join("  ")}`);
}
await b.close();
