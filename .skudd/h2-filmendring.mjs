/** Isolerer FILMEN: tegner videoens naavaerende ramme til canvas ved hvert
 *  scrollsteg og differ dem. Sidens egen bevegelse paavirker ikke maalingen. */
import { chromium } from "playwright";
const [url, idx] = process.argv.slice(2);
const N = +(idx || 0);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 850 }, colorScheme: "dark" });
await p.goto(url, { waitUntil: "networkidle" });
const g = await p.evaluate((n) => { const r = document.querySelectorAll(".scenefilm-ramme")[n].getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; }, N);
const steg = 12; let forrige = null; const rader = [];
for (let i = 0; i <= steg; i++) {
  await p.evaluate(v => scrollTo(0, Math.max(0, Math.round(v))), g.top - 500 + (g.h + 900) * (i / steg));
  await p.waitForTimeout(340);
  const m = await p.evaluate((n) => {
    const el = document.querySelectorAll("[data-scenefilm]")[n];
    const v = el.querySelector("video"); const bb = el.getBoundingClientRect();
    const syn = Math.max(0, Math.min(bb.bottom, innerHeight) - Math.max(bb.top, 0)) / bb.height;
    const c = document.createElement("canvas"); c.width = 160; c.height = 90;
    c.getContext("2d").drawImage(v, 0, 0, 160, 90);
    return { t: v.currentTime, d: v.duration, syn: Math.round(syn * 100),
             px: [...c.getContext("2d").getImageData(0, 0, 160, 90).data] };
  }, N);
  if (forrige && m.syn >= 30) {
    let d = 0; for (let k = 0; k < m.px.length; k += 4) d += Math.abs(m.px[k] - forrige[k]);
    rader.push({ pst: Math.round(m.t / m.d * 100), syn: m.syn, endring: +(d / (m.px.length / 4)).toFixed(2) });
  }
  forrige = m.px;
}
console.log("  klipp%  synlig%  filmendring mot forrige scrollsteg");
let dode = 0;
for (const r of rader) { const dod = r.endring < 0.8; if (dod) dode++; console.log(`   ${String(r.pst).padStart(4)}    ${String(r.syn).padStart(4)}     ${String(r.endring).padStart(6)} ${dod ? " <- filmen staar stille" : ""}`); }
console.log(`  ${dode} av ${rader.length} synlige scrollsteg der filmen ikke endrer seg`);
await b.close();
