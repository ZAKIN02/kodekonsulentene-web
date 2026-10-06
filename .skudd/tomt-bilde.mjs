/** Ekte visningsbilder ved de scrollposisjonene som hadde de største hullene.
 *  IKKE fullPage: det evaluerer view()-animasjoner ved scroll 0 og fotograferer
 *  alt under første skjermhøyde med opacity 0. */
import { chromium } from "playwright";
const base = "http://127.0.0.1:4601";
const mål = [["/nettsider", 3150], ["/status", 1800], ["/systemer", 2250], ["/handbok", 5400]];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1512, height: 900 }, colorScheme: "dark" });
const p = await ctx.newPage();
for (const [s, y] of mål) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  await p.evaluate(v => scrollTo(0, v), y);
  await p.waitForTimeout(1500);
  const f = `.skudd/tomt-${s.replace(/\//g, "_")}-${y}.png`;
  await p.screenshot({ path: f });
  console.log("  " + f);
}
await b.close();
