/** Ekte sidelengs drag: dokumentets scrollWidth mot clientWidth. Elementer som
 *  stikker utenfor er bare en feil hvis INGEN forelder kan scrolle bort til dem. */
import { chromium } from "playwright";
const b = await chromium.launch();
for (const w of [390, 768, 1440, 1920]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const d = document.documentElement;
    const utbrudd = document.querySelector(".avslor--utbrudd");
    const q = utbrudd?.getBoundingClientRect();
    return { drag: d.scrollWidth - d.clientWidth,
             utbruddBredde: q ? Math.round(q.width) : null,
             utbruddVenstre: q ? Math.round(q.left) : null };
  });
  console.log(`  ${String(w).padStart(4)}px: drag ${r.drag}px · utbruddet ${r.utbruddBredde}px fra x=${r.utbruddVenstre}`);
  await p.close();
}
await b.close();
