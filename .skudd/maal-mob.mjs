import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
await p.goto(process.argv[2] ?? "http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
const rel = await p.evaluate(() => {
  const t = document.querySelector(".teaser"), tx = document.querySelector(".teaser__tekst");
  const a = t.getBoundingClientRect(), c = tx.getBoundingClientRect();
  tx.style.visibility = "hidden";
  return { x: c.x - a.x, y: c.y - a.y, w: c.width, h: c.height };
});
await p.waitForTimeout(200);
const png = await p.locator(".teaser").screenshot();
await b.close();
const im = PNG.sync.read(png);
const lum = (r,g,bb)=>{const f=(c)=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bb);};
let maks=-1, v=null;
for (let y=Math.max(0,Math.round(rel.y)); y<Math.min(im.height,Math.round(rel.y+rel.h)); y++)
 for (let x=Math.max(0,Math.round(rel.x)); x<Math.min(im.width,Math.round(rel.x+rel.w)); x++) {
   const i=(im.width*y+x)<<2, L=lum(im.data[i],im.data[i+1],im.data[i+2]);
   if (L>maks){maks=L;v=[im.data[i],im.data[i+1],im.data[i+2],x,y];}
 }
const k=1.05/(maks+0.05);
console.log("mobil – lysest bak tekst rgb(%s) i %d,%d", v.slice(0,3).join(","), v[3], v[4]);
console.log("kontrast: %s:1 -> %s", k.toFixed(2), k>=4.5?"BESTÅTT":"STRYKER");
