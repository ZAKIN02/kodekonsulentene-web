/** To lag med ulik `dybde` skal DRA FRA HVERANDRE gjennom scrollet. Endrer
 *  avstanden seg ikke, er det ingen parallakse – bare to ting som flytter seg likt. */
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const topp = await p.evaluate(() => document.querySelector(".avslor--dybde").getBoundingClientRect().top + scrollY);
const avstander = [];
for (let y = topp - 900; y <= topp + 700; y += 100) {
  await p.evaluate((yy) => scrollTo({ top: yy, behavior: "instant" }), y);
  await p.waitForTimeout(80);
  const d = await p.evaluate(() => {
    const [a, c] = document.querySelectorAll(".avslor--dybde");
    if (!a || !c) return null;
    return Math.round(c.getBoundingClientRect().top - a.getBoundingClientRect().top);
  });
  if (d !== null) avstander.push(d);
}
const min = Math.min(...avstander), max = Math.max(...avstander);
console.log(`  avstand mellom lagene: ${min}px → ${max}px, utslag ${max - min}px`);
console.log(`  ${max - min > 40 ? "LAGENE DRAR FRA HVERANDRE – det leses som rom" : "lagene følger hverandre – ingen parallakse"}`);
await b.close();
