/** Hva faar brukeren igjen PER SCROLL, i det omraadet flaten faktisk er synlig?
 *  scene_score per kvartal av FILA maaler noe annet: en holdt hale som spilles
 *  mens seksjonen forlater skjermen koster ikke brukeren scroll han faar noe for. */
import { chromium } from "playwright";
import { PNG } from "pngjs";
const [url, idx] = process.argv.slice(2);
const N = +(idx || 0);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 850 }, colorScheme: "dark" });
await p.goto(url, { waitUntil: "networkidle" });
const g = await p.evaluate((n) => { const r = document.querySelectorAll(".scenefilm-ramme")[n].getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; }, N);
const steg = 12;
let forrige = null; const rader = [];
for (let i = 0; i <= steg; i++) {
  const y = g.top - 500 + (g.h + 900) * (i / steg);
  await p.evaluate(v => scrollTo(0, Math.max(0, Math.round(v))), y);
  await p.waitForTimeout(340);
  const m = await p.evaluate((n) => {
    const el = document.querySelectorAll("[data-scenefilm]")[n];
    const v = el.querySelector("video"); const bb = el.getBoundingClientRect();
    const syn = Math.max(0, Math.min(bb.bottom, innerHeight) - Math.max(bb.top, 0)) / bb.height;
    return { t: v.currentTime, d: v.duration, syn: Math.round(syn * 100) };
  }, N);
  const im = PNG.sync.read(await p.screenshot());
  if (forrige && m.syn >= 30) {
    let d = 0, n = 0;
    for (let k = 0; k < im.data.length; k += 16) { d += Math.abs(im.data[k] - forrige.data[k]); n++; }
    rader.push({ pst: Math.round(m.t / m.d * 100), syn: m.syn, endring: +(d / n).toFixed(2) });
  }
  forrige = im;
}
console.log("  klipp%  synlig%  endring mot forrige scrollsteg");
let dode = 0;
for (const r of rader) { const dod = r.endring < 0.6; if (dod) dode++; console.log(`   ${String(r.pst).padStart(4)}    ${String(r.syn).padStart(4)}     ${String(r.endring).padStart(6)} ${dod ? " <- ingenting skjer" : ""}`); }
console.log(`  ${dode} av ${rader.length} synlige scrollsteg uten endring`);
await b.close();
