import { chromium } from "playwright";
const [url, velger, ut, n] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 850 }, colorScheme: "dark" });
await p.goto(url, { waitUntil: "networkidle" });
const g = await p.evaluate((v) => { const e = document.querySelector(v); const r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; }, velger);
const bilder = [];
const steg = +n || 5;
for (let i = 0; i < steg; i++) {
  const y = g.top - 400 + (g.h + 600) * (i / (steg - 1));
  await p.evaluate(v => scrollTo(0, Math.max(0, v)), Math.round(y));
  await p.waitForTimeout(420);
  bilder.push(await p.screenshot());
}
await b.close();
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const ims = bilder.map(x => PNG.sync.read(x));
const W = ims[0].width, H = ims[0].height, sk = 0.33;
const w = Math.round(W * sk), h = Math.round(H * sk);
const out = new PNG({ width: w * ims.length, height: h });
ims.forEach((im, k) => {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const si = ((W * Math.round(y / sk)) + Math.round(x / sk)) << 2;
    const di = ((out.width * y) + (k * w + x)) << 2;
    out.data[di] = im.data[si]; out.data[di+1] = im.data[si+1]; out.data[di+2] = im.data[si+2]; out.data[di+3] = 255;
  }
});
writeFileSync(ut, PNG.sync.write(out));
console.log("stripe:", ut);
