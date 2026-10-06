/** Kontrast for tekst som ligger OVER en scenefilm.
 *  Maaler bak hver glyf, ikke i tekstens avgrensningsboks: en tidligere maaling
 *  leste lyseste piksel i boksen og rapporterte 2,0:1 paa lesbar tekst. Og den
 *  maa ikke skjule hele seksjonen - da forsvinner kortflatene som skjermer teksten. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
const lum = ([r, g, b2]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b2); };
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelector("[data-scenefilm]")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(1800);
  const omr = await p.evaluate(() => {
    const f = document.querySelector("[data-scenefilm]"); if (!f) return null;
    const sek = f.closest("section") || f.parentElement;
    const ut = [];
    for (const el of sek.querySelectorAll("p, h1, h2, h3, li, a, span")) {
      const t = (el.textContent || "").trim(); if (!t || el.children.length) continue;
      const r = el.getBoundingClientRect(); if (r.width < 20 || r.height < 8) continue;
      if (r.top < 0 || r.bottom > innerHeight) continue;
      ut.push({ t: t.slice(0, 28), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
                farge: getComputedStyle(el).color });
    }
    return ut.slice(0, 14);
  });
  if (!omr || !omr.length) { console.log(`  ${s}: ingen tekst over film`); continue; }
  const bilde = await p.screenshot({ clip: { x: 0, y: 0, width: 1512, height: 900 } });
  const { createCanvas, loadImage } = await import("canvas").catch(() => ({}));
  let verst = null;
  for (const o of omr) {
    const px = await p.evaluate(({ x, y, w, h }) => {
      const c = document.createElement("canvas"); return null;
    }, o);
  }
  console.log(`  ${s}  ${omr.length} tekstelementer over filmen: ${omr.map(o => `"${o.t}"`).join(", ").slice(0, 150)}`);
}
await b.close();
