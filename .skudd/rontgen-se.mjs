/** Beveger pekeren over røntgenflaten og limer skuddene til én stripe. */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 140)));
p.on("pageerror", (e) => feil.push("PAGEERROR " + e.message.slice(0, 140)));
await p.goto("http://127.0.0.1:4399/lab/rontgen", { waitUntil: "networkidle" });
await p.waitForTimeout(600);

const boks = await p.locator("[data-rontgen-flate]").boundingBox();
const punkter = [[0.18, 0.3], [0.42, 0.55], [0.68, 0.32], [0.85, 0.7]];
const skudd = [];
for (const [fx, fy] of punkter) {
  await p.mouse.move(boks.x + boks.width * fx, boks.y + boks.height * fy);
  await p.waitForTimeout(260);
  skudd.push(PNG.sync.read(await p.locator("[data-rontgen-flate]").screenshot()));
}
// Femte rute: «Vis hele innsiden»
await p.mouse.move(0, 0);
await p.click("[data-rontgen-bryter]");
await p.waitForTimeout(300);
skudd.push(PNG.sync.read(await p.locator("[data-rontgen-flate]").screenshot()));

const sk = 2;
const w = Math.floor(skudd[0].width / sk), h = Math.floor(skudd[0].height / sk);
const ut = new PNG({ width: w * skudd.length, height: h });
skudd.forEach((im, k) => {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (im.width * (y * sk) + x * sk) << 2;
    const d = (ut.width * y + (k * w + x)) << 2;
    ut.data[d] = im.data[s]; ut.data[d+1] = im.data[s+1];
    ut.data[d+2] = im.data[s+2]; ut.data[d+3] = 255;
  }
});
writeFileSync(".skudd/rontgen-stripe.png", PNG.sync.write(ut));
console.log("ruter:", skudd.length, "– fire pekerposisjoner + hele innsiden");
console.log("feil:", feil.length ? feil : "ingen");
await b.close();
