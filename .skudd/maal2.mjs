import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(500);

// Posisjon til teksten INNE i teaseren, før vi skjuler den.
const rel = await p.evaluate(() => {
  const t = document.querySelector(".teaser"), tx = document.querySelector(".teaser__tekst");
  const a = t.getBoundingClientRect(), c = tx.getBoundingClientRect();
  tx.style.visibility = "hidden";
  return { x: c.x - a.x, y: c.y - a.y, w: c.width, h: c.height };
});
await p.waitForTimeout(200);
const png = await p.locator(".teaser").screenshot();   // elementskudd – ingen koordinatforvirring
await b.close();

const im = PNG.sync.read(png);
const lum = (r,g,bb) => { const f=(c)=>{c/=255; return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bb); };
let maks = -1, verst = null;
const x0 = Math.max(0, Math.round(rel.x)), y0 = Math.max(0, Math.round(rel.y));
const x1 = Math.min(im.width, Math.round(rel.x + rel.w)), y1 = Math.min(im.height, Math.round(rel.y + rel.h));
for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
  const i = (im.width * y + x) << 2;
  const L = lum(im.data[i], im.data[i+1], im.data[i+2]);
  if (L > maks) { maks = L; verst = [im.data[i], im.data[i+1], im.data[i+2], x, y]; }
}
const k = 1.05 / (maks + 0.05);
console.log("teaser-bilde:", im.width + "x" + im.height, "| tekstområde:", `${x0},${y0} → ${x1},${y1}`);
console.log("lysest bakgrunn bak tekst: rgb(%s) i punkt %d,%d", verst.slice(0,3).join(","), verst[3], verst[4]);
console.log("kontrast mot hvit tekst: %s:1  (AA brødtekst krever 4,5:1)  -> %s",
  k.toFixed(2), k >= 4.5 ? "BESTÅTT" : "STRYKER");
