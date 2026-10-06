import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:390,height:844}, colorScheme:"dark" });
const feil = [];
p.on("console", m => m.type()==="error" && feil.push(m.text().slice(0,90)));
await p.goto("http://127.0.0.1:4399/", { waitUntil:"networkidle" });
await p.waitForTimeout(1500);
const H = await p.evaluate(() => document.body.scrollHeight);
const N = 6, sk = [];
for (let i=0;i<N;i++){
  await p.evaluate(y=>window.scrollTo(0,y), Math.round((H-844)*i/(N-1)));
  await p.waitForTimeout(700);
  sk.push(PNG.sync.read(await p.screenshot()));
}
await b.close();
const s=2, w=Math.floor(390/s), h=Math.floor(844/s);
const o=new PNG({width:w*N,height:h});
sk.forEach((im,k)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=(im.width*(y*s)+x*s)<<2,d=(o.width*y+(k*w+x))<<2;o.data[d]=im.data[a];o.data[d+1]=im.data[a+1];o.data[d+2]=im.data[a+2];o.data[d+3]=255;}});
writeFileSync(".skudd/komp-mobil.png", PNG.sync.write(o));
console.log("høyde",H,"| feil:", feil.length?feil:"ingen");
