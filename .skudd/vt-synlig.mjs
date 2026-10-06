/** Hvor mye av filmen er faktisk synlig? Skyter seksjonen med og uten film og teller piksler som skiller. */
import { chromium } from "playwright";
import { PNG } from "pngjs";
const [,, url, velger] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto(url, { waitUntil: "load" });
await p.evaluate(async () => { const h=document.body.scrollHeight; for(let y=0;y<=h;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));} });
const el = await p.$(velger);
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(900);
const med = PNG.sync.read(await el.screenshot());
await p.evaluate(() => { for (const v of document.querySelectorAll("[data-scenefilm]")) v.style.visibility = "hidden"; });
await p.waitForTimeout(250);
const uten = PNG.sync.read(await el.screenshot());
let ulik = 0;
const n = Math.min(med.data.length, uten.data.length);
for (let i = 0; i < n; i += 4) {
  const d = Math.abs(med.data[i]-uten.data[i]) + Math.abs(med.data[i+1]-uten.data[i+1]) + Math.abs(med.data[i+2]-uten.data[i+2]);
  if (d > 12) ulik++;
}
const tot = (n/4);
console.log(`${velger}  ${med.width}x${med.height}  synlig film: ${(ulik/tot*100).toFixed(1)} % av seksjonsflaten`);
await b.close();
