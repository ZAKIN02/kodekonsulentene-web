/** Maalt paa ekte visningsbilde: malt skriftstoerrelse i PIKSLER (ikke viewBox-enheter),
 *  kontrast paa glyffenes egen farge mot flaten bak, og JS-vekt paa siden. */
import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
const js = [];
p.on("response", async (r) => {
  const t = r.request().resourceType();
  if (t === "script") js.push([r.url().split("/").pop(), +(r.headers()["content-length"] || 0)]);
});
await p.goto(url, { waitUntil: "networkidle" });
// Scroll gjennom hele siden saa alt har vaert i synsranden.
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 500) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
await p.waitForTimeout(500);

const lum = (c) => { const [r,g,bb] = c.match(/\d+/g).map(Number).map(v => v/255)
  .map(v => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4); return 0.2126*r+0.7152*g+0.0722*bb; };

const r = await p.evaluate(() => {
  const ut = [];
  for (const sel of [".snitt__navn", ".snitt__detalj", ".snitt__nr", ".flyt__nr--tid"]) {
    const el = document.querySelector(sel);
    if (!el) { ut.push({ sel, mangler: true }); continue; }
    const cs = getComputedStyle(el);
    const bb = el.getBoundingClientRect();
    // Malt stoerrelse: fontSize i CSS-px ganget med SVG-ens faktiske skala.
    const svg = el.ownerSVGElement;
    const vb = svg.viewBox.baseVal.width;
    const skala = svg.getBoundingClientRect().width / vb;
    ut.push({
      sel,
      oppgitt: cs.fontSize,
      skala: +skala.toFixed(3),
      maltPx: +(parseFloat(cs.fontSize) * skala).toFixed(1),
      hoydePx: +bb.height.toFixed(1),
      farge: cs.fill,
      flate: getComputedStyle(el.closest(".snitt__ramme, .flyt__ramme")).backgroundColor,
    });
  }
  return ut;
});
for (const x of r) {
  if (x.mangler) { console.log(`  ${x.sel.padEnd(18)} MANGLER`); continue; }
  const k = (() => { const a = lum(x.farge), bq = lum(x.flate);
    const [hi, lo] = a > bq ? [a, bq] : [bq, a]; return ((hi+0.05)/(lo+0.05)).toFixed(2); })();
  console.log(`  ${x.sel.padEnd(18)} oppgitt ${x.oppgitt.padEnd(6)} skala ${x.skala}  MALT ${String(x.maltPx).padStart(5)} px  kontrast ${k}:1`);
}
const sum = js.reduce((s, [, n]) => s + n, 0);
console.log(`\n  JS paa siden: ${js.length} filer, ${sum} B ukomprimert`);
for (const [n, s] of js) console.log(`    ${n} ${s} B`);
await b.close();
