/** Filmer autosveipen fra det oeyeblikket flaten kommer inn i synsfeltet.
 *  Skudd av ELEMENTET (locator.screenshot), ikke clip – boundingBox og
 *  screenshot({clip}) er ulike koordinatrom. */
import { chromium } from "playwright";
const [url, ut, merke, bredde, hoyde, touch] = process.argv.slice(2);
const b = await chromium.launch();
const c = await b.newContext({
  viewport: { width: +bredde, height: +hoyde },
  deviceScaleFactor: 1,
  isMobile: touch === "touch", hasTouch: touch === "touch",
});
const p = await c.newPage();
const feil = [];
p.on("pageerror", (e) => feil.push(e.message.slice(0, 120)));
p.on("console", (m) => m.type() === "error" && feil.push("konsoll: " + m.text().slice(0, 120)));
await p.goto(url, { waitUntil: "networkidle" });
const el = p.locator("[data-slep]").first();
// Rull saa flaten AKKURAT kommer inn, slik vakten utloeses mens vi filmer.
await p.evaluate(() => {
  const r = document.querySelector("[data-slep-flate]").getBoundingClientRect();
  scrollTo(0, scrollY + r.top - innerHeight * 0.3);
});
const spor = [];
const t0 = Date.now();
for (let i = 0; i < 18; i++) {
  await el.screenshot({ path: `${ut}/${merke}-${String(i).padStart(2, "0")}.png` });
  spor.push(await p.evaluate(() => {
    const r = document.querySelector("[data-slep]");
    return [getComputedStyle(r).getPropertyValue("--p").trim(),
            r.querySelector("[data-slep-forteller]").textContent];
  }));
  await p.waitForTimeout(170);
}
console.log(`${merke}: ${Date.now() - t0} ms`);
for (const [v, f] of spor) console.log(`   --p ${v.padEnd(6)} «${f}»`);
console.log("  sidefeil:", feil.length ? feil.join(" | ") : "ingen");
await b.close();
