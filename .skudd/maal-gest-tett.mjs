/** Tett prøvetaking rundt hvert elements egen inngang. Grov prøvetaking over
 *  hele siden får ekte bevegelse til å se fraværende ut – entry-fasen er kort. */
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
for (const v of ["avslor--skjev", "avslor--naer", "avslor--dybde", "pekerkort"]) {
  const topp = await p.evaluate((s) => {
    const el = document.querySelector("." + s);
    return el ? el.getBoundingClientRect().top + scrollY : null;
  }, v);
  if (topp === null) { console.log(`  ${v}: mangler`); continue; }
  const sett = new Set(); const verdier = [];
  for (let y = Math.max(0, topp - 950); y <= topp + 120; y += 35) {
    await p.evaluate((yy) => scrollTo({ top: yy, behavior: "instant" }), y);
    await p.waitForTimeout(55);
    const t = await p.evaluate((s) => {
      const el = document.querySelector("." + s);
      const c = getComputedStyle(el);
      return `${c.transform}|${(+c.opacity).toFixed(2)}`;
    }, v);
    sett.add(t); verdier.push(t);
  }
  const op = verdier.map((t) => +t.split("|")[1]);
  console.log(`  ${v.padEnd(16)} ${String(sett.size).padStart(2)} tilstander · opasitet ${Math.min(...op).toFixed(2)} → ${Math.max(...op).toFixed(2)} · ${sett.size > 5 ? "BEVEGER SEG" : "for lite"}`);
}
await b.close();
