/** Skjermbilder av viewporten nedover siden – slik en besøkende faktisk ser den. */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(process.argv[2] ?? "http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(900);
const hoyde = await p.evaluate(() => document.documentElement.scrollHeight);
const N = Number(process.argv[4] ?? 8);
const skudd = [];
for (let i = 0; i < N; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), Math.round((hoyde - 800) * (i / (N - 1))));
  await p.waitForTimeout(650);
  skudd.push(PNG.sync.read(await p.screenshot()));
}
await b.close();
const k = 4, w = Math.floor(1280 / k), h = Math.floor(800 / k);
const ut = new PNG({ width: w * N, height: h });
skudd.forEach((im, n) => {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (im.width * (y * k) + x * k) << 2, d = (ut.width * y + (n * w + x)) << 2;
    ut.data[d] = im.data[s]; ut.data[d+1] = im.data[s+1]; ut.data[d+2] = im.data[s+2]; ut.data[d+3] = 255;
  }
});
writeFileSync(process.argv[3] ?? ".skudd/side.png", PNG.sync.write(ut));
console.log("konsollfeil:", feil.length ? feil : "ingen", "| sidehøyde:", hoyde);
