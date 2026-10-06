import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const url = process.argv[2], ut = process.argv[3], N = Number(process.argv[4] ?? 6);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0,100)));
await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(1200);
const H = await p.evaluate(() => document.body.scrollHeight);
const skudd = [];
for (let i = 0; i < N; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), Math.round((H - 900) * i / (N - 1)));
  await p.waitForTimeout(700);
  skudd.push(PNG.sync.read(await p.screenshot()));
}
await b.close();
const sk = 3, w = Math.floor(1440/sk), h = Math.floor(900/sk);
const o = new PNG({ width: w*N, height: h });
skudd.forEach((im,k)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=(im.width*(y*sk)+x*sk)<<2,d=(o.width*y+(k*w+x))<<2;o.data[d]=im.data[s];o.data[d+1]=im.data[s+1];o.data[d+2]=im.data[s+2];o.data[d+3]=255;}});
writeFileSync(ut, PNG.sync.write(o));
console.log("høyde", H, "| feil:", feil.length ? feil : "ingen");
