import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
for (const [navn, w, h] of [["desktop", 1440, 900], ["mobil", 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: "dark" });
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 140)));
  p.on("pageerror", (e) => feil.push("PAGEERROR " + e.message.slice(0, 140)));
  await p.goto("http://127.0.0.1:4399/lab/typo", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const H = await p.evaluate(() => document.body.scrollHeight);
  const N = 8, skudd = [];
  for (let i = 0; i < N; i++) {
    await p.evaluate((y) => window.scrollTo(0, y), Math.round((H - h) * i / (N - 1)));
    await p.waitForTimeout(650);
    skudd.push(PNG.sync.read(await p.screenshot()));
  }
  const sk = navn === "desktop" ? 4 : 2;
  const ww = Math.floor(skudd[0].width / sk), hh = Math.floor(skudd[0].height / sk);
  const ut = new PNG({ width: ww * N, height: hh });
  skudd.forEach((im, k) => { for (let y = 0; y < hh; y++) for (let x = 0; x < ww; x++) {
    const s = (im.width * (y*sk) + x*sk) << 2, d = (ut.width * y + (k*ww + x)) << 2;
    ut.data[d]=im.data[s]; ut.data[d+1]=im.data[s+1]; ut.data[d+2]=im.data[s+2]; ut.data[d+3]=255;
  }});
  writeFileSync(`.skudd/lab-${navn}.png`, PNG.sync.write(ut));
  console.log(`${navn}: sidehøyde ${H}, feil: ${feil.length ? feil.join(" | ") : "ingen"}`);
  await p.close();
}
await b.close();
