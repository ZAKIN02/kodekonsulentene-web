/** Beviser at strekene FAKTISK tegner seg, ikke bare at CSS-en finnes.
 *  Leser stroke-dashoffset fra computed style gjennom et ekte gjennomloep.
 *  Flere animasjoner i dette repoet har staatt i koden uten aa kjoere. */
import { chromium } from "playwright";
const [url, velger] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const boks = await p.evaluate((v) => {
  const e = document.querySelector(v);
  return { top: e.getBoundingClientRect().top + scrollY, h: e.getBoundingClientRect().height };
}, velger);
console.log(`  figur paa y=${Math.round(boks.top)}, hoeyde ${Math.round(boks.h)}\n`);
console.log("  scrollY | stolpe 1 | stolpe 2 | stolpe 3 | stolpe 4");
let sett = new Set();
for (let i = 0; i <= 8; i++) {
  const y = Math.round(boks.top - 900 + (i / 8) * (900 + boks.h));
  await p.evaluate((v) => scrollTo(0, v), Math.max(0, y));
  await p.waitForTimeout(140);
  const v = await p.evaluate((vv) => {
    const f = document.querySelector(vv);
    return [...f.querySelectorAll(".snitt__stolpe")].slice(0, 4)
      .map((e) => parseFloat(getComputedStyle(e).strokeDashoffset).toFixed(3));
  }, velger);
  v.forEach((x) => sett.add(x));
  console.log(`  ${String(Math.max(0, y)).padStart(7)} | ${v.map((x) => String(x).padStart(8)).join(" | ")}`);
}
console.log(`\n  ulike verdier sett: ${sett.size} -> ${sett.size > 2 ? "ANIMASJONEN KJOERER" : "STAAR STILLE"}`);
await b.close();
