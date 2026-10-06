/** To nabo-skjermbilder side om side, så et dødt scroll-strekk blir synlig. */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const [base, sti, n1, ut] = process.argv.slice(2);
const i1 = Number(n1);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1680, height: 900 } });
await p.goto(base + sti, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const bilder = [];
for (const i of [i1 - 1, i1]) {
  const y = Math.min(i * 900, Math.max(0, H - 900));
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(600);
  bilder.push(PNG.sync.read(await p.screenshot()));
}
await b.close();
const F = 2, w = Math.floor(1680 / F), h = Math.floor(900 / F);
const ark = new PNG({ width: w * 2 + 8, height: h });
ark.data.fill(30);
bilder.forEach((im, k) => {
  const ox = k * (w + 8);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (im.width * (y * F) + x * F) << 2, d = (ark.width * y + ox + x) << 2;
    ark.data[d] = im.data[s]; ark.data[d+1] = im.data[s+1]; ark.data[d+2] = im.data[s+2]; ark.data[d+3] = 255;
  }
});
writeFileSync(ut, PNG.sync.write(ark));
console.log(ut);
