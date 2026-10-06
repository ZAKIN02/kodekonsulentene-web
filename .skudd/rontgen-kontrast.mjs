/**
 * Kontrast i røntgenflaten, målt mot faktisk malte piksler.
 *
 * Fallgruvene vi har gått i før, og som er unngått her:
 *  - `boundingBox()` er viewport-relativ, `screenshot({clip})` bruker sidekoordinater
 *    → vi bruker ELEMENTskudd og regner koordinater relativt til elementet.
 *  - `visibility: hidden` på tekst fjerner også flaten den står på
 *    → vi setter `color: transparent` i stedet, så layout og bakgrunn står urørt.
 *  - devicePixelRatio er ikke 1 på mobilprofiler (Pixel 7: 2,625)
 *    → vi skalerer koordinatene med det faktiske forholdet.
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";

const k = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (r, g, b) => 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);

const b = await chromium.launch();
for (const [navn, w, h, dpr] of [["desktop", 1280, 860, 1], ["mobil", 412, 915, 2.625]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/lab/rontgen", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  // Slå på hele innsiden, så begge lag kan måles i ro.
  // Scroll knappen i syne først; ellers kan flaten ligge over klikkpunktet.
  await p.locator("[data-rontgen-bryter]").scrollIntoViewIfNeeded();
  await p.waitForTimeout(200);
  await p.locator("[data-rontgen-bryter]").click();
  await p.waitForTimeout(350);

  const maal = await p.evaluate(() => {
    const flate = document.querySelector("[data-rontgen-flate]");
    const a = flate.getBoundingClientRect();
    const ut = [];
    for (const [merke, sel] of [
      ["nøkkel (header-navn)", ".rontgen__nokkel"],
      ["verdi (headerverdi)", ".rontgen__verdi"],
      ["merke (// Innsiden)", ".rontgen__merk span"],
    ]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      ut.push({ merke, farge: getComputedStyle(el).color, x: r.x - a.x, y: r.y - a.y, w: r.width, h: r.height });
      el.style.color = "transparent";
    }
    return ut;
  });
  await p.waitForTimeout(250);
  const png = await p.locator("[data-rontgen-flate]").screenshot();
  await ctx.close();
  const im = PNG.sync.read(png);
  // Elementskuddet er i enhetspiksler; koordinatene er CSS-piksler.
  const f = im.width / (await Promise.resolve(maal.length ? null : null), im.width) || 1;
  const skala = dpr;

  for (const m of maal) {
    const [tr, tg, tb] = m.farge.match(/\d+/g).map(Number);
    const lt = L(tr, tg, tb);
    let verst = Infinity, rgb = null;
    const x0 = Math.max(0, Math.round(m.x * skala)), y0 = Math.max(0, Math.round(m.y * skala));
    const x1 = Math.min(im.width, Math.round((m.x + m.w) * skala));
    const y1 = Math.min(im.height, Math.round((m.y + m.h) * skala));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (im.width * y + x) << 2;
      const lb = L(im.data[i], im.data[i + 1], im.data[i + 2]);
      const c = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
      if (c < verst) { verst = c; rgb = [im.data[i], im.data[i + 1], im.data[i + 2]]; }
    }
    console.log(`${navn.padEnd(8)} ${m.merke.padEnd(22)} ${m.farge.padEnd(20)} mot rgb(${String(rgb)}) = ${verst.toFixed(2)}:1 ${verst >= 4.5 ? "BESTÅTT" : "STRYKER"}`);
  }
}
await b.close();
