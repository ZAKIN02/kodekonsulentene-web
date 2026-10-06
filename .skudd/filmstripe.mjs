/**
 * Kontinuerlig visuell sjekk. Scroller gjennom en seksjon i headless Chrome,
 * tar N skudd, og limer dem sammen til én stripe jeg kan vurdere i ett blikk.
 * Rapporterer også om bevegelsen faktisk er jevn: ser vi samme ramme to ganger,
 * står videoen stille.
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";

const url = process.argv[2] ?? "http://127.0.0.1:4399/";
const velger = process.argv[3] ?? ".teaser";
const ut = process.argv[4] ?? ".skudd/stripe.png";
const N = Number(process.argv[5] ?? 6);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(800);

const skudd = [];
const tider = [];
for (let i = 0; i < N; i++) {
  const a = i / (N - 1);
  await p.evaluate(({ velger, a }) => {
    const el = document.querySelector(velger);
    const topp = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, topp - window.innerHeight + (window.innerHeight + el.offsetHeight) * a);
  }, { velger, a });
  await p.waitForTimeout(600);
  tider.push(await p.evaluate((v) => {
    const vid = document.querySelector(v + " video");
    return vid ? +vid.currentTime.toFixed(2) : null;
  }, velger));
  skudd.push(PNG.sync.read(await p.locator(velger).screenshot()));
}
await b.close();

// Lim sammen vannrett, skalert ned.
const skala = 3;
const w = Math.floor(skudd[0].width / skala), h = Math.floor(skudd[0].height / skala);
const stripe = new PNG({ width: w * N, height: h });
skudd.forEach((im, k) => {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (im.width * (y * skala) + x * skala) << 2;
    const d = (stripe.width * y + (k * w + x)) << 2;
    stripe.data[d] = im.data[s]; stripe.data[d+1] = im.data[s+1];
    stripe.data[d+2] = im.data[s+2]; stripe.data[d+3] = 255;
  }
});
writeFileSync(ut, PNG.sync.write(stripe));

const unike = new Set(tider.filter((t) => t !== null));
console.log("currentTime:", tider.join(" → "));
console.log(unike.size <= 1 && tider[0] !== null ? "ADVARSEL: videoen står stille" : "bevegelse: ok");
console.log("konsollfeil:", feil.length ? feil : "ingen");
console.log("stripe:", ut);
