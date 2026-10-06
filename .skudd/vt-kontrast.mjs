/**
 * To spørsmål per side:
 *  1. Overlapper noe tekst bildeflaten? (Da gjelder maskeproblemet fra SceneFilm.)
 *  2. Hvilken kontrast har bildeteksten mot sin faktiske bakgrunn?
 */
import { chromium } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const lum = ([r, g, b2]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b2); };
const rgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number);
for (const rute of process.argv.slice(3)) {
  const p = await ctx.newPage();
  await p.goto(base + rute, { waitUntil: "load" });
  await p.evaluate(async () => { const h=document.body.scrollHeight; for(let y=0;y<=h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,30));} });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const fig = document.querySelector("figure.stillbilde");
    if (!fig) return null;
    const img = fig.querySelector("img").getBoundingClientRect();
    // Tekst som faktisk ligger OVER bildeflaten.
    let over = 0;
    for (const el of document.querySelectorAll("p,h1,h2,h3,li,span,a")) {
      if (fig.contains(el)) continue;
      const t = el.getBoundingClientRect();
      if (t.width && t.height && t.left < img.right && t.right > img.left && t.top < img.bottom && t.bottom > img.top) over++;
    }
    const cap = fig.querySelector("figcaption");
    const cs = cap && getComputedStyle(cap);
    // Finn faktisk malt bakgrunn ved å gå opp i treet.
    let bg = "rgb(0,0,0)";
    for (let n = cap; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !c.includes("rgba(0, 0, 0, 0)")) { bg = c; break; }
    }
    return { over, farge: cs?.color, bg, px: cs?.fontSize };
  });
  if (!r) { console.log(`${rute.padEnd(28)} ingen stillbilde`); continue; }
  const l1 = lum(rgb(r.farge)), l2 = lum(rgb(r.bg));
  const k = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  console.log(`${rute.padEnd(28)} tekst over bildet: ${r.over}   bildetekst ${k.toFixed(2)}:1 (${r.px})  ${k >= 4.5 ? "AA ok" : "BRUDD"}`);
  await p.close();
}
await b.close();
