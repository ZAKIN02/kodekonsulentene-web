import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const MAL = [
  [".scenefilm-ramme .scene__ingress", "Tjenester-ingress over film"],
  [".scenefilm-ramme .kk-svc p", "Tjenestekort-tekst over film"],
  [".hero__live", "Hero live-linje"],
];
const b = await chromium.launch();
for (const [merke, w, h, dpr] of [["desktop", 1440, 900, 1], ["mobil", 412, 915, 2.625]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  for (const [sel, navn] of MAL) {
    const rel = await p.evaluate((sel) => {
      const t = document.querySelector(sel);
      if (!t) return null;
      t.scrollIntoView({ block: "center" });
      return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
        const r = t.getBoundingClientRect();
        const farge = getComputedStyle(t).color;
        // color: transparent – ikke visibility:hidden. Skjuling fjerner også flaten teksten står på.
        t.style.color = "transparent";
        res({ farge, x: r.x, y: r.y, w: r.width, h: r.height });
      })));
    }, sel);
    if (!rel) { console.log(`${merke} ${navn}: fant ikke`); continue; }
    await p.waitForTimeout(400);
    const png = await p.screenshot();            // viewport, ikke clip
    const im = PNG.sync.read(png);
    const k = (c) => { c /= 255; return c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4; };
    const L = (r,g,bb) => 0.2126*k(r) + 0.7152*k(g) + 0.0722*k(bb);
    const m = rel.farge.match(/\d+/g).map(Number);
    const lt = L(m[0], m[1], m[2]);
    let verst = Infinity, rgb = null;
    // Skaler CSS-piksler til enhetspiksler. Pixel 7 har dpr 2,625.
    const x0 = Math.max(0, Math.round(rel.x*dpr)), y0 = Math.max(0, Math.round(rel.y*dpr));
    const x1 = Math.min(im.width, Math.round((rel.x+rel.w)*dpr)), y1 = Math.min(im.height, Math.round((rel.y+rel.h)*dpr));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (im.width*y + x) << 2;
      const lb = L(im.data[i], im.data[i+1], im.data[i+2]);
      const c = (Math.max(lt,lb)+0.05)/(Math.min(lt,lb)+0.05);
      if (c < verst) { verst = c; rgb = [im.data[i], im.data[i+1], im.data[i+2]]; }
    }
    console.log(`${merke.padEnd(8)} ${navn.padEnd(30)} ${verst.toFixed(2)}:1  ${verst>=4.5?"BESTÅTT":"STRYKER"}  bakgrunn rgb(${rgb})`);
    await p.reload({ waitUntil: "networkidle" });
    await p.waitForTimeout(900);
  }
  await ctx.close();
}
await b.close();
