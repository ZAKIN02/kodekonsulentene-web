/** Naar i scrollen vises klippets SLUTT, og hvor mye av filmflaten er da synlig?
 *  SceneFilm regner andel = (innerHeight - r.top) / (innerHeight + r.height).
 *  andel = 1 krever r.top = -r.height, altsaa at flaten er helt over vinduet. */
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 850 }, colorScheme: "dark" });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const g = await p.evaluate(() => { const r = document.querySelector(".scenefilm-ramme").getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
console.log(`  filmflate ${Math.round(g.h)}px hoy, vindu 850px`);
for (let i = 0; i <= 10; i++) {
  const y = g.top - 500 + (g.h + 900) * (i / 10);
  await p.evaluate(v => scrollTo(0, Math.max(0, v)), Math.round(y));
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const el = document.querySelector("[data-scenefilm]");
    const v = el.querySelector("video");
    const b = el.getBoundingClientRect();
    const synlig = Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, 0));
    return { t: +(v.currentTime || 0).toFixed(2), d: +(v.duration || 0).toFixed(2),
             synligPst: Math.round(synlig / b.height * 100), rs: v.readyState };
  });
  const pct = r.d ? Math.round(r.t / r.d * 100) : 0;
  console.log(`   klipp ${String(pct).padStart(3)}%  (t=${r.t}/${r.d})   filmflate synlig ${String(r.synligPst).padStart(3)}%   readyState ${r.rs}`);
}
await b.close();
