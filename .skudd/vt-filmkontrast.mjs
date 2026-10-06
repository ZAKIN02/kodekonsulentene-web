/**
 * Verste tilfelle: for hvert tekstelement i seksjonen, finn den LYSESTE
 * bakgrunnspikselen under det etter at teksten er skjult, og mål tekstfargen mot den.
 * Samme metode som .skudd/herokontrast.mjs, men for en vilkårlig seksjon og port.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
const [,, url, velger] = process.argv;
const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const br = await chromium.launch();
for (const [merke, w, h] of [["desktop", 1440, 900], ["mobil", 390, 844]]) {
  const p = await br.newPage({ viewport: { width: w, height: h }, colorScheme: "dark" });
  await p.goto(url, { waitUntil: "load" });
  await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<=H;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));} });
  const el = await p.$(velger);
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  const tekster = await p.evaluate((sel) => {
    const rot = document.querySelector(sel), a = rot.getBoundingClientRect();
    const ut = [];
    for (const e of rot.querySelectorAll("p,dt,dd,h1,h2,h3,li,span")) {
      if (!e.textContent.trim() || e.children.length) continue;
      const c = e.getBoundingClientRect();
      if (c.width < 8 || c.height < 6) continue;
      ut.push({ x: c.x - a.x, y: c.y - a.y, w: c.width, h: c.height, farge: getComputedStyle(e).color, px: parseFloat(getComputedStyle(e).fontSize), txt: e.textContent.trim().slice(0,45), tag: e.tagName });
    }
    for (const e of rot.querySelectorAll("p,dt,dd,h1,h2,h3,li,span,table,pre,code")) e.style.visibility = "hidden";
    return ut;
  }, velger);
  await p.waitForTimeout(250);
  const im = PNG.sync.read(await el.screenshot());
  await p.close();
  let verst = { k: 99 };
  for (const t of tekster) {
    let maks = -1;
    for (let y = Math.max(0, t.y | 0); y < Math.min(im.height, (t.y + t.h) | 0); y++)
      for (let x = Math.max(0, t.x | 0); x < Math.min(im.width, (t.x + t.w) | 0); x++) {
        const i = (im.width * y + x) << 2; maks = Math.max(maks, lum(im.data[i], im.data[i + 1], im.data[i + 2]));
      }
    if (maks < 0) continue;
    const [r, g, b] = t.farge.match(/\d+/g).slice(0, 3).map(Number);
    const Lt = lum(r, g, b);
    const k = (Math.max(Lt, maks) + 0.05) / (Math.min(Lt, maks) + 0.05);
    if (k < verst.k) verst = { k, px: t.px, farge: t.farge, txt: t.txt, tag: t.tag, x: Math.round(t.x), y: Math.round(t.y) };
  }
  const grense = verst.px >= 24 ? 3.0 : 4.5;
  console.log(`${merke.padEnd(8)} ${verst.k.toFixed(2)}:1 (${verst.px}px) ${verst.k >= grense ? "AA ok" : "BRUDD"}  <${verst.tag}> @${verst.x},${verst.y} "${verst.txt}"`);
}
await br.close();
