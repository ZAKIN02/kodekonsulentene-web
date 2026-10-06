/**
 * Kontrast mot faktisk malte piksler på undersider med film bak.
 * Fallgruvene vi har gått i, og som er unngått her:
 *  - boundingBox() er viewport-relativ, screenshot({clip}) er sidekoordinater → viewport-skudd
 *  - visibility:hidden fjerner også flaten teksten står på → color: transparent
 *  - devicePixelRatio er 2,625 på Pixel 7 → skaler koordinatene
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";

const k = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (r, g, b) => 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);

const b = await chromium.launch();
let verst = 99;
for (const [navn, w, h, dpr] of [["desktop", 1440, 900, 1], ["mobil", 412, 915, 2.625]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/systemer", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const mal = await p.evaluate(() => {
    const ut = [];
    const sel = ["#integrasjoner h2", "#integrasjoner .card h3", "#integrasjoner .card p"];
    for (const s of sel) {
      const e = document.querySelector(s);
      if (!e) continue;
      e.scrollIntoView({ block: "center" });
    }
    return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
      for (const s of sel) {
        const e = document.querySelector(s);
        if (!e) continue;
        const r = e.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        ut.push({ s, farge: getComputedStyle(e).color, x: r.x, y: r.y, w: r.width, h: r.height });
        e.style.color = "transparent";
      }
      res(ut);
    })));
  });
  await p.waitForTimeout(300);
  const png = PNG.sync.read(await p.screenshot());
  await ctx.close();
  for (const m of mal) {
    const c = m.farge.match(/\d+/g).map(Number);
    const lt = L(c[0], c[1], c[2]);
    let lav = 99;
    const x0 = Math.round(m.x * dpr), y0 = Math.round(m.y * dpr);
    const x1 = Math.min(png.width, Math.round((m.x + m.w) * dpr));
    const y1 = Math.min(png.height, Math.round((m.y + m.h) * dpr));
    for (let y = Math.max(0, y0); y < y1; y++)
      for (let x = Math.max(0, x0); x < x1; x++) {
        const i = (png.width * y + x) << 2;
        const lb = L(png.data[i], png.data[i + 1], png.data[i + 2]);
        lav = Math.min(lav, (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05));
      }
    if (lav < 99) { verst = Math.min(verst, lav); console.log(`${navn} ${m.s}: ${lav.toFixed(2)}:1 ${lav >= 4.5 ? "OK" : "STRYKER"}`); }
  }
}
await b.close();
console.log(`\nlavest: ${verst.toFixed(2)}:1 -> ${verst >= 4.5 ? "BESTÅTT" : "STRYKER"}`);
