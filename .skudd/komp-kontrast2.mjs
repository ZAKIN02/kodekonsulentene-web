import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const b = await chromium.launch();
for (const [merke, w, h, dpr] of [["desktop",1440,900,1], ["mobil",412,915,2.625]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dpr, colorScheme:"dark" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/", { waitUntil:"networkidle" });
  await p.waitForTimeout(1400);
  const rel = await p.evaluate(() => {
    const el = document.querySelector(".hero__live");
    el.scrollIntoView({ block: "center" });
    const prikk = el.querySelector(".hero__live-prikk");
    // Prikken er dekorativ (aria-hidden) og er IKKE bakgrunn for tekst.
    // Den må ut av bildet, ellers måler vi den i stedet for flaten bak teksten.
    if (prikk) prikk.style.display = "none";
    return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const farge = getComputedStyle(el).color;
      el.style.color = "transparent";
      res({ farge, x:r.x, y:r.y, w:r.width, h:r.height });
    })));
  });
  await p.waitForTimeout(350);
  const im = PNG.sync.read(await p.screenshot());
  const k=(c)=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;};
  const L=(r,g,bb)=>0.2126*k(r)+0.7152*k(g)+0.0722*k(bb);
  const m = rel.farge.match(/\d+/g).map(Number); const lt = L(m[0],m[1],m[2]);
  let verst=Infinity, rgb=null;
  for (let y=Math.max(0,Math.round(rel.y*dpr)); y<Math.min(im.height,Math.round((rel.y+rel.h)*dpr)); y++)
   for (let x=Math.max(0,Math.round(rel.x*dpr)); x<Math.min(im.width,Math.round((rel.x+rel.w)*dpr)); x++) {
     const i=(im.width*y+x)<<2; const lb=L(im.data[i],im.data[i+1],im.data[i+2]);
     const c=(Math.max(lt,lb)+0.05)/(Math.min(lt,lb)+0.05);
     if (c<verst){verst=c;rgb=[im.data[i],im.data[i+1],im.data[i+2]];}
   }
  console.log(`${merke.padEnd(8)} hero live-linje (tekst)  ${verst.toFixed(2)}:1  ${verst>=4.5?"BESTÅTT":"STRYKER"}  bakgrunn rgb(${rgb})`);
  await ctx.close();
}
await b.close();
