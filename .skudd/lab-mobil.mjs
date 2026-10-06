import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/lab/typo", { waitUntil: "networkidle" });
await p.waitForTimeout(1000);
const skudd = [];
// topp, nøkkeltall, midt i horisont, siste mega
const steder = [
  () => window.scrollTo(0, 0),
  () => document.querySelector(".nokkeltall").scrollIntoView({ block: "center" }),
  () => { const h = document.querySelector("[data-horisont]"); const t = h.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, t + (h.offsetHeight - window.innerHeight) * 0.5); },
  () => document.querySelectorAll(".mega")[1].scrollIntoView({ block: "center" }),
];
for (const f of steder) { await p.evaluate(f); await p.waitForTimeout(800); skudd.push(PNG.sync.read(await p.screenshot())); }
await b.close();
const sk = 2, w = Math.floor(skudd[0].width/sk), h = Math.floor(skudd[0].height/sk);
const ut = new PNG({ width: w*skudd.length, height: h });
skudd.forEach((im,k)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=(im.width*(y*sk)+x*sk)<<2,d=(ut.width*y+(k*w+x))<<2;ut.data[d]=im.data[s];ut.data[d+1]=im.data[s+1];ut.data[d+2]=im.data[s+2];ut.data[d+3]=255;}});
writeFileSync(".skudd/lab-mobil-stripe.png", PNG.sync.write(ut));
console.log("ok");
