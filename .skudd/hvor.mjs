import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".teaser")?.scrollIntoView({ block: "center" }));
await p.waitForTimeout(900);
const boks = await p.locator(".teaser__tekst").boundingBox();
await p.evaluate(() => { document.querySelector(".teaser__tekst").style.visibility = "hidden"; });
await p.waitForTimeout(200);
const png = await p.screenshot({ clip: boks });
await b.close();
const { PNG } = await import("pngjs");
const im = PNG.sync.read(png);
const lum = (r,g,bb) => { const f=(c)=>{c/=255; return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bb); };
let best = { L: -1 };
for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) {
  const i = (im.width * y + x) << 2;
  const L = lum(im.data[i], im.data[i+1], im.data[i+2]);
  if (L > best.L) best = { L, x, y, rgb: [im.data[i], im.data[i+1], im.data[i+2]] };
}
console.log("boks:", JSON.stringify(boks));
console.log("lysest punkt i boksen: x=%d/%d y=%d/%d rgb=%s kontrast=%s",
  best.x, im.width, best.y, im.height, best.rgb.join(","), (1.05/(best.L+0.05)).toFixed(2));
