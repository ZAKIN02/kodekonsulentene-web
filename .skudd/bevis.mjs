import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4399/historie", { waitUntil:"networkidle" });
await p.waitForTimeout(1500);
const t = p.locator(".hist__kort .body-lg").first();
await t.scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
const boks = await t.boundingBox();
console.log("boundingBox:", JSON.stringify(boks));
await p.evaluate(() => {
  const bEl = document.querySelector(".hist");
  for (const el of bEl.querySelectorAll("h1,h2,h3,h4,p,a,span,li,button,label,strong,em,small,code"))
    { el.dataset.qaSkjult="1"; el.style.visibility="hidden"; }
});
await p.waitForTimeout(250);
const png = await p.screenshot();
const im = PNG.sync.read(png);
// Tegn boksen i magenta
const x0=Math.round(boks.x), y0=Math.round(boks.y), x1=Math.round(boks.x+boks.width), y1=Math.round(boks.y+boks.height);
for (let x=x0;x<x1;x++) for (const y of [y0,y1-1]) { const i=(im.width*y+x)<<2; im.data[i]=255;im.data[i+1]=0;im.data[i+2]=255; }
for (let y=y0;y<y1;y++) for (const x of [x0,x1-1]) { const i=(im.width*y+x)<<2; im.data[i]=255;im.data[i+1]=0;im.data[i+2]=255; }
writeFileSync(".skudd/bevis-historie.png", PNG.sync.write(im));
console.log("lagret .skudd/bevis-historie.png  boks:", x0,y0,x1,y1);
await ctx.close(); await b.close();
