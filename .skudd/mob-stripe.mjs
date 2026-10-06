/**
 * Mobilstripe + diagnose. 390x844, deviceScaleFactor 1 slik at CSS-piksler og
 * bildepiksler er 1:1 — da slipper vi dPR-fella helt for skjermbilder.
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";
const url = process.argv[2], ut = process.argv[3], N = Number(process.argv[4] ?? 6);
const b = await chromium.launch();
const p = await b.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
  isMobile: true,
  hasTouch: true,
});
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 110)));
await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(1400);

const diag = await p.evaluate(() => {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const overflyt = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.position === "fixed") continue;
    if (r.right > vw + 1 || r.left < -1) {
      overflyt.push({
        tag: el.tagName.toLowerCase(),
        kl: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 50),
        venstre: Math.round(r.left), hoyre: Math.round(r.right),
      });
    }
  }
  // Trykkmål
  const smaa = [];
  for (const el of document.querySelectorAll('a,button,input,select,textarea,[role="button"],summary,[tabindex]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.width < 24 || r.height < 24) {
      smaa.push({
        tag: el.tagName.toLowerCase(),
        kl: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 40),
        tekst: (el.textContent || "").trim().slice(0, 28),
        w: Math.round(r.width), h: Math.round(r.height),
      });
    }
  }
  return {
    scrollW: doc.scrollWidth, clientW: vw,
    kanScrolleSidelengs: doc.scrollWidth > vw + 1,
    overflyt: overflyt.slice(0, 12),
    smaa: smaa.slice(0, 12),
    hoyde: document.body.scrollHeight,
    h1: document.querySelectorAll("h1").length,
  };
});

const H = diag.hoyde;
const skudd = [];
for (let i = 0; i < N; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), Math.round(Math.max(0, H - 844) * i / (N - 1)));
  await p.waitForTimeout(600);
  skudd.push(PNG.sync.read(await p.screenshot()));
}
await b.close();

const sk = 2, w = Math.floor(390 / sk), h = Math.floor(844 / sk);
const o = new PNG({ width: w * N, height: h });
skudd.forEach((im, k) => {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (im.width * (y * sk) + x * sk) << 2, d = (o.width * y + (k * w + x)) << 2;
    o.data[d] = im.data[s]; o.data[d + 1] = im.data[s + 1]; o.data[d + 2] = im.data[s + 2]; o.data[d + 3] = 255;
  }
});
writeFileSync(ut, PNG.sync.write(o));
console.log(JSON.stringify({ url, ...diag, konsollfeil: feil }, null, 1));
