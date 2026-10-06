/** Nærbilder av selve blokken på bestemte tidspunkt i sekvensen, limt loddrett.
 *  node .skudd/kode-naer.mjs <url> <bredde> <tema> <ut.png> <ms,ms,ms,...>
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";

const [url, breddeRaa, tema, ut, tiderRaa] = process.argv.slice(2);
const B = Number(breddeRaa || 1440);
const tider = (tiderRaa || "250,900,1800,2600,3600").split(",").map(Number);

const b = await chromium.launch();
const p = await b.newPage({
  viewport: { width: B, height: B < 500 ? 844 : 980 },
  colorScheme: tema === "light" ? "light" : "dark",
});
await p.goto(url, { waitUntil: "load", timeout: 45000 });

const skudd = [];
let forrige = 0;
await p.evaluate(() => {
  const el = document.querySelector(".kodebygg");
  scrollTo({ top: el.getBoundingClientRect().top + scrollY - 60, behavior: "instant" });
});
for (const t of tider) {
  await p.waitForTimeout(Math.max(0, t - forrige));
  forrige = t;
  skudd.push(PNG.sync.read(await p.locator(".kodebygg").screenshot()));
}
await b.close();

const w = skudd[0].width, h = Math.max(...skudd.map((s) => s.height));
const ark = new PNG({ width: w, height: h * skudd.length });
skudd.forEach((im, k) => {
  for (let y = 0; y < im.height; y++) for (let x = 0; x < w; x++) {
    const s = (im.width * y + x) << 2;
    const d = (ark.width * (k * h + y) + x) << 2;
    ark.data[d] = im.data[s]; ark.data[d + 1] = im.data[s + 1];
    ark.data[d + 2] = im.data[s + 2]; ark.data[d + 3] = 255;
  }
});
writeFileSync(ut, PNG.sync.write(ark));
console.log(`${ut}  ${w}×${h} per ramme, ved ${tider.join(" / ")} ms`);
