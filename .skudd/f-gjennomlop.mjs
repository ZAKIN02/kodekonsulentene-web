/** Ekte visningsbilder gjennom et scroll-gjennomloep. IKKE fullPage – den
 *  evaluerer scroll-drevne animasjoner ved scroll 0 og fotograferer alt under
 *  foerste skjermhoeyde med opacity 0. */
import { chromium } from "playwright";
const [url, ut, n = "6", bredde = "1440"] = process.argv.slice(2);
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: +bredde, height: 900 }, colorScheme: process.env.TEMA || "dark" });
const p = await c.newPage();
await p.goto(url, { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
const skudd = [];
for (let i = 0; i < +n; i++) {
  const y = Math.round((h - 900) * (i / (+n - 1)));
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(700);
  const f = `/tmp/gl-${i}.png`;
  await p.screenshot({ path: f });
  skudd.push(f);
}
console.log(skudd.join(" "));
await b.close();
