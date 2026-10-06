/**
 * Kontrast mot ekte malte piksler.
 * Tre feller vi har gått i før, alle unngått her:
 *  1. boundingBox() er viewport-relativ, screenshot({clip}) er sidekoordinater
 *     -> vi bruker viewport-skudd og viewport-koordinater, aldri clip.
 *  2. visibility:hidden fjerner flaten teksten står på -> vi bruker color:transparent.
 *  3. devicePixelRatio != 1 (Pixel 7 har 2,625) -> koordinatene skaleres.
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";

const k = (c) => { c /= 255; return c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055) ** 2.4; };
const L = (r,g,b) => 0.2126*k(r) + 0.7152*k(g) + 0.0722*k(b);

const maal = [
  [".mega .ord", "Mega-tekst"],
  [".nokkeltall__verdi", "Nøkkeltall-verdi"],
  [".nokkeltall__merke", "Nøkkeltall-merke"],
  [".horisont__overskrift", "Horisont-tittel"],
  [".horisont__tekst", "Horisont-tekst"],
  [".horisont__hjelp", "Horisont-hjelp"],
  [".mega-blokk__merke span:last-child", "Mega-etikett"],
];

const b = await chromium.launch();
let feilet = 0;
for (const [navn, w, h, dsf] of [["desktop",1440,900,1], ["mobil",390,844,2.625]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/lab/typo", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);

  for (const [sel, merke] of maal) {
    const rel = await p.evaluate((sel) => {
      const t = document.querySelector(sel);
      if (!t) return null;
      t.scrollIntoView({ block: "center" });
      return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
        const r = t.getBoundingClientRect();
        const farge = getComputedStyle(t).color;
        t.style.color = "transparent";           // flaten bak blir stående
        res({ farge, x: r.x, y: r.y, w: r.width, h: r.height });
      })));
    }, sel);
    if (!rel || rel.w < 2 || rel.h < 2) { console.log(`  ${navn} ${merke}: fant ikke`); continue; }
    await p.waitForTimeout(250);
    const im = PNG.sync.read(await p.screenshot());   // viewport, ikke clip
    const m = rel.farge.match(/\d+/g).map(Number);
    const lt = L(m[0], m[1], m[2]);
    let verst = Infinity, rgb = null;
    const x0 = Math.max(0, Math.round(rel.x*dsf)), y0 = Math.max(0, Math.round(rel.y*dsf));
    const x1 = Math.min(im.width, Math.round((rel.x+rel.w)*dsf)), y1 = Math.min(im.height, Math.round((rel.y+rel.h)*dsf));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (im.width*y + x) << 2;
      const lb = L(im.data[i], im.data[i+1], im.data[i+2]);
      const c = (Math.max(lt,lb)+0.05)/(Math.min(lt,lb)+0.05);
      if (c < verst) { verst = c; rgb = [im.data[i],im.data[i+1],im.data[i+2]]; }
    }
    const ok = verst >= 4.5;
    if (!ok) feilet++;
    console.log(`  ${navn.padEnd(8)} ${merke.padEnd(20)} ${verst.toFixed(2)}:1  ${ok ? "BESTÅTT" : "STRYKER"}  (bak rgb(${rgb}))`);
    // Sett fargen tilbake i stedet for å laste siden på nytt. Omlasting mellom
    // hver måling viste seg skjørt: på desktop fant neste måling ingen elementer.
    await p.evaluate((sel) => { const t = document.querySelector(sel); if (t) t.style.color = ""; }, sel);
    await p.waitForTimeout(120);
  }
  await ctx.close();
}
await b.close();
console.log(feilet === 0 ? "\nAlle målinger over 4,5:1" : `\n${feilet} målinger under kravet`);
