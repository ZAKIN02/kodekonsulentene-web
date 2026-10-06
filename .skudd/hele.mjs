import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const H = await p.evaluate(() => document.body.scrollHeight);
const N = 8, skudd = [];
for (let i = 0; i < N; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), Math.round((H - 900) * i / (N - 1)));
  await p.waitForTimeout(800);
  skudd.push(PNG.sync.read(await p.screenshot()));
}
await b.close();
const sk = 4, w = Math.floor(1440/sk), h = Math.floor(900/sk);
const ut = new PNG({ width: w*N, height: h });
skudd.forEach((im,k)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=(im.width*(y*sk)+x*sk)<<2,d=(ut.width*y+(k*w+x))<<2;ut.data[d]=im.data[s];ut.data[d+1]=im.data[s+1];ut.data[d+2]=im.data[s+2];ut.data[d+3]=255;}});
writeFileSync(".skudd/hele-siden.png", PNG.sync.write(ut));
console.log("ok, sidehøyde", H);
