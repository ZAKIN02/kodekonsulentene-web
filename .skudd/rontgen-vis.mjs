import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/lab/rontgen", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const boks = await p.locator("[data-rontgen]").boundingBox();
const skudd = [];
for (const [fx, fy] of [[0.25, 0.3], [0.55, 0.5], [0.8, 0.72]]) {
  await p.mouse.move(boks.x + boks.width * fx, boks.y + boks.height * fy);
  await p.waitForTimeout(450);
  skudd.push(PNG.sync.read(await p.locator("[data-rontgen]").screenshot()));
}
await b.close();
const sk = 2, w = Math.floor(skudd[0].width/sk), h = Math.floor(skudd[0].height/sk);
const o = new PNG({ width: w*skudd.length, height: h });
skudd.forEach((im,k)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=(im.width*(y*sk)+x*sk)<<2,d=(o.width*y+(k*w+x))<<2;o.data[d]=im.data[s];o.data[d+1]=im.data[s+1];o.data[d+2]=im.data[s+2];o.data[d+3]=255;}});
writeFileSync(".skudd/rontgen-tre.png", PNG.sync.write(o));
console.log("ok");
