import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const b = await chromium.launch();
for (const [navn, w, h] of [["desktop", 1440, 900], ["mobil", 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: "dark" });
  await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const rel = await p.evaluate(() => {
    const t = document.querySelector(".scenefilm-ramme .section__head p, .scenefilm-ramme p");
    t.scrollIntoView({ block: "center" });
    return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
      const r = t.getBoundingClientRect();
      const farge = getComputedStyle(t).color;
      t.style.color = "transparent";
      res({ farge, x: r.x, y: r.y, w: r.width, h: r.height });
    })));
  });
  await p.waitForTimeout(400);
  const png = await p.screenshot();
  const tid = await p.evaluate(() => {
    const v = document.querySelector(".scenefilm video");
    return v ? { klar: v.readyState, varighet: +(v.duration||0).toFixed(1), naa: +v.currentTime.toFixed(2) } : null;
  });
  await p.close();
  const im = PNG.sync.read(png);
  const k=(c)=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;};
  const L=(r,g,bb)=>0.2126*k(r)+0.7152*k(g)+0.0722*k(bb);
  const m=rel.farge.match(/\d+/g).map(Number); const lt=L(m[0],m[1],m[2]);
  let verst=Infinity,rgb=null;
  for (let y=Math.max(0,Math.round(rel.y)); y<Math.min(im.height,Math.round(rel.y+rel.h)); y++)
   for (let x=Math.max(0,Math.round(rel.x)); x<Math.min(im.width,Math.round(rel.x+rel.w)); x++) {
     const i=(im.width*y+x)<<2; const lb=L(im.data[i],im.data[i+1],im.data[i+2]);
     const c=(Math.max(lt,lb)+0.05)/(Math.min(lt,lb)+0.05);
     if (c<verst){verst=c;rgb=[im.data[i],im.data[i+1],im.data[i+2]];}
   }
  console.log(`${navn}: ${verst.toFixed(2)}:1 ${verst>=4.5?"BESTÅTT":"STRYKER"} (bakgrunn rgb(${rgb}))  video: ${JSON.stringify(tid)}`);
}
await b.close();
