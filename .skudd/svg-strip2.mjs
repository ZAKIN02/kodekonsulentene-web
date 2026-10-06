import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4455/lab/svg", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
const ys = [53, 214, 300, 375, 460, 697];
const skudd = [];
for (const y of ys) {
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(300);
  skudd.push(PNG.sync.read(await p.locator(".flyt__ramme").screenshot()));
}
await b.close();
const sk = 2, w = Math.floor(skudd[0].width/sk), h = Math.floor(skudd[0].height/sk);
const o = new PNG({ width: w*skudd.length, height: h });
skudd.forEach((im,k)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const s=(im.width*(y*sk)+x*sk)<<2, d=(o.width*y+(k*w+x))<<2;
  o.data[d]=im.data[s];o.data[d+1]=im.data[s+1];o.data[d+2]=im.data[s+2];o.data[d+3]=255;}});
writeFileSync(".skudd/svg-tegning.png", PNG.sync.write(o));
console.log("skrevet .skudd/svg-tegning.png ved y =", ys.join(", "));
