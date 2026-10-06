import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/lab/rontgen", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const el = p.locator("[data-rontgen]").first();
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
const bb = await el.boundingBox();
const skudd = [];
for (const [fx, fy] of [[0.35, 0.35], [0.7, 0.62]]) {
  await p.mouse.move(bb.x + bb.width * fx, bb.y + bb.height * fy);
  await p.waitForTimeout(450);
  skudd.push(PNG.sync.read(await el.screenshot()));
}
// Bryteren "vis hele innsiden"
const knapp = p.locator("[data-rontgen] button").first();
if (await knapp.count()) { await knapp.click(); await p.waitForTimeout(400); skudd.push(PNG.sync.read(await el.screenshot())); }
await b.close();
const h = Math.max(...skudd.map(s=>s.height)), w = skudd[0].width;
const o = new PNG({ width: w*skudd.length, height: h });
skudd.forEach((im,k)=>{for(let y=0;y<Math.min(h,im.height);y++)for(let x=0;x<w;x++){const s=(im.width*y+x)<<2,d=(o.width*y+(k*w+x))<<2;o.data[d]=im.data[s];o.data[d+1]=im.data[s+1];o.data[d+2]=im.data[s+2];o.data[d+3]=255;}});
writeFileSync(".skudd/komp-rontgen.png", PNG.sync.write(o));
console.log("ok");
