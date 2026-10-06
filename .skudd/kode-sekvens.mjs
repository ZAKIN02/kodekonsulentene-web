/** Tar opp KodeBygg-sekvensen UTEN å scrolle: ruller blokken i syne, fryser
 *  scrollposisjonen, og fotograferer utsnittet med jevne mellomrom mens tiden går.
 *  Måler samtidig pikselendring mellom nabobilder, så «beveget den seg?» er et
 *  tall og ikke en følelse.
 *
 *  Scroll settes FØR sekvensen kan starte: IntersectionObserveren fyrer når
 *  blokken er 30 % i syne, og alt etter det er tidsdrevet.
 *
 *  node .skudd/kode-sekvens.mjs <url> <bredde> <tema> <ut.png> [n] [ms]
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";

const [url, breddeRaa, tema, ut, nRaa, msRaa] = process.argv.slice(2);
const B = Number(breddeRaa || 1440);
const N = Number(nRaa || 8);
const MS = Number(msRaa || 500);
const H = B < 500 ? 844 : 900;

const b = await chromium.launch();
const p = await b.newPage({
  viewport: { width: B, height: H },
  colorScheme: tema === "light" ? "light" : "dark",
  deviceScaleFactor: 1,
});
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
p.on("pageerror", (e) => feil.push(String(e)));

// Blokker skriptet som starter sekvensen fram til vi står stille: vi laster med
// scroll allerede satt, slik at ingen ramme går tapt før første bilde.
await p.goto(url, { waitUntil: "load", timeout: 45000 });
await p.evaluate(() => {
  const el = document.querySelector(".kodebygg");
  if (!el) throw new Error("fant ikke .kodebygg");
  const r = el.getBoundingClientRect();
  scrollTo({ top: r.top + scrollY - 70, behavior: "instant" });
});

const sideScroll = await p.evaluate(() => ({
  bredde: document.documentElement.scrollWidth,
  vindu: innerWidth,
  y: Math.round(scrollY),
}));

const skudd = [];
for (let i = 0; i < N; i++) {
  skudd.push(PNG.sync.read(await p.screenshot()));
  await p.waitForTimeout(MS);
}

const etter = await p.evaluate(() => Math.round(scrollY));

// Pikselendring mellom nabobilder – bare i den øvre delen der blokken står.
const diff = [];
for (let i = 1; i < skudd.length; i++) {
  const a = skudd[i - 1].data, c = skudd[i].data;
  let ulik = 0, tot = 0;
  for (let k = 0; k < a.length; k += 4 * 7) {
    tot++;
    if (Math.abs(a[k] - c[k]) + Math.abs(a[k + 1] - c[k + 1]) + Math.abs(a[k + 2] - c[k + 2]) > 12) ulik++;
  }
  diff.push(((ulik / tot) * 100).toFixed(2));
}

// Kontaktark: rutenett, 4 per rad.
const sk = B < 500 ? 1 : 2.2;
const w = Math.floor(skudd[0].width / sk), h = Math.floor(skudd[0].height / sk);
const kol = Math.min(4, N), rad = Math.ceil(N / kol);
const ark = new PNG({ width: w * kol, height: h * rad });
skudd.forEach((im, k) => {
  const ox = (k % kol) * w, oy = Math.floor(k / kol) * h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (im.width * Math.round(y * sk) + Math.round(x * sk)) << 2;
    const d = (ark.width * (oy + y) + ox + x) << 2;
    ark.data[d] = im.data[s]; ark.data[d + 1] = im.data[s + 1];
    ark.data[d + 2] = im.data[s + 2]; ark.data[d + 3] = 255;
  }
});
writeFileSync(ut, PNG.sync.write(ark));

console.log(`${ut}  ${B}px ${tema}  ${N} rammer à ${MS} ms`);
console.log(`  scroll: ${sideScroll.y} -> ${etter} (uendret: ${sideScroll.y === etter})`);
console.log(`  sidelengs scroll: scrollWidth ${sideScroll.bredde} mot vindu ${sideScroll.vindu} -> ${sideScroll.bredde > sideScroll.vindu ? "JA, FEIL" : "nei"}`);
console.log(`  endring mellom rammer (%): ${diff.join("  ")}`);
console.log(`  bevegelse uten scroll: ${diff.some((d) => +d > 0.2) ? "JA" : "NEI"}`);
console.log(`  konsollfeil: ${feil.length ? feil.join(" | ") : "ingen"}`);
await b.close();
