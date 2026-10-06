import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const w of [1100, 1200, 1280, 1400, 1600]) {
  const h = Math.round(w * 9 / 16);
  const p = await (await b.newContext({ viewport:{width:w,height:h}, colorScheme:"dark", reducedMotion:"no-preference" })).newPage();
  await p.goto("http://127.0.0.1:4710/systemer", { waitUntil: "networkidle" });
  const g = await p.evaluate(() => {
    const el = document.querySelector(".flyt__ramme");
    const svg = document.querySelector(".flyt__svg");
    const liste = document.querySelector(".flyt__liste");
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), topp: Math.round(r.top+scrollY),
             svgSynlig: svg ? getComputedStyle(svg).display !== "none" : null,
             listeSynlig: liste ? !liste.classList.contains("visually-hidden") : null };
  });
  console.log(`${w}x${h}: figur ${g.w}x${g.h} (${Math.round(g.w/w*100)}% av bredden) topp=${g.topp} svg=${g.svgSynlig}`);
  await p.close();
}
await b.close();
