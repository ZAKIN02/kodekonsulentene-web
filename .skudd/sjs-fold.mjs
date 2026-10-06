/** Hva ser en besøkende FØR han scroller? Rene vindusbilder på scrollY = 0. */
import { chromium } from "playwright";
const b = await chromium.launch();
const s = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await s.goto("http://127.0.0.1:4411/sjekk", { waitUntil: "domcontentloaded" });
for (const t of [1200, 3600, 6400]) {
  await s.waitForTimeout(t - (await s.evaluate(() => performance.now())));
  await s.screenshot({ path: `.skudd/sjs-maal/fold-${t}.png` });
}
console.log("  scrollY =", await s.evaluate(() => scrollY));
await b.close();
