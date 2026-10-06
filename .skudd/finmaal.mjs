/** Fin sveip rundt en scenegrense: tegner streken seg over en strekning, eller
 *  snapper den? Et 1 px høyt pseudoelement har en entry-fase på ~1 px scroll. */
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const sel = process.argv[3];
const idx = +(process.argv[4] ?? 2);
const topp = await p.evaluate(([s, i]) => {
  const el = document.querySelectorAll(s)[i];
  return el.getBoundingClientRect().top + scrollY;
}, [sel, idx]);
let forrige = null;
for (let d = -1000; d <= 100; d += 20) {
  await p.evaluate((y) => scrollTo(0, y), topp + d);
  await p.waitForTimeout(35);
  const t = await p.evaluate(([s, i]) => {
    const el = document.querySelectorAll(s)[i];
    const f = getComputedStyle(el, "::before").transform;
    return f === "none" ? 1 : +f.split("(")[1].split(",")[0];
  }, [sel, idx]);
  if (forrige === null || Math.abs(t - forrige) > 0.01) { console.log(`  ${String(d).padStart(5)}: scaleX ${t.toFixed(3)}`); forrige = t; }
}
await b.close();
