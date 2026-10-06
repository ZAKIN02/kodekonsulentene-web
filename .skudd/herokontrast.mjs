import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const b = await chromium.launch();
for (const [merke, w, h] of [["desktop",1440,860], ["mobil",390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: "dark" });
  // URL-en kom fra en hardkodet port, så verktøyet målte ALLTID forsiden på 4777
  // uansett hvilken adresse det ble gitt. Parallelle agenter kunne ikke bruke det,
  // og en måling kunne se riktig ut mens den gjaldt en helt annen side.
  const url = process.argv[2] ?? "http://127.0.0.1:4777/";
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const rel = await p.evaluate(() => {
    const hero = document.querySelector(".hero"), t = document.querySelector(".hero__lead");
    const a = hero.getBoundingClientRect(), c = t.getBoundingClientRect();
    document.querySelector(".hero > .wrap").style.visibility = "hidden";
    return { x: c.x - a.x, y: c.y - a.y, w: c.width, h: c.height };
  });
  await p.waitForTimeout(200);
  const png = await p.locator(".hero").screenshot();
  await p.close();
  const im = PNG.sync.read(png);
  const lum=(r,g,bb)=>{const f=(c)=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bb);};
  let maks=-1;
  for (let y=Math.max(0,Math.round(rel.y)); y<Math.min(im.height,Math.round(rel.y+rel.h)); y++)
   for (let x=Math.max(0,Math.round(rel.x)); x<Math.min(im.width,Math.round(rel.x+rel.w)); x++) {
     const i=(im.width*y+x)<<2; maks=Math.max(maks,lum(im.data[i],im.data[i+1],im.data[i+2]));
   }
  // Ingressen er ink-muted (#9aa4ae) på mørk grunn
  const Lt = lum(0x9a,0xa4,0xae);
  const k = (Math.max(Lt,maks)+0.05)/(Math.min(Lt,maks)+0.05);
  console.log("%s: ingress mot lysest bakgrunn = %s:1 -> %s", merke, k.toFixed(2), k>=4.5?"BESTÅTT":"STRYKER");
}
await b.close();
