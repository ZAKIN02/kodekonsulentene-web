/**
 * Hvor mye av båndet masken slipper fram er dekket av UGJENNOMSIKTIG innhold?
 *
 * En SceneFilm ligger bak seksjonen. Ligger det et kort med egen bakgrunn i det
 * synlige båndet, er filmen borte bak det – uten at noen kontrastmåling fanger
 * det, for kontrasten blir jo god. Derfor måles dekning, ikke kontrast.
 */
import { chromium } from "playwright";
const [url, maskeArg] = process.argv.slice(2);
const maske = Number(maskeArg ?? 46) / 100;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const rader = await p.evaluate((maske) => {
  const ut = [];
  for (const sek of document.querySelectorAll("section")) {
    const r = sek.getBoundingClientRect();
    if (r.height < 200) continue;
    const x0 = window.innerWidth * maske;
    let dekket = 0;
    for (const el of sek.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor.match(/[\d.]+/g);
      const ugjennomsiktig = bg && (bg.length < 4 || +bg[3] > 0.6) && !(bg[0] === bg[1] && bg[1] === bg[2] && +bg[0] === 0 && bg.length > 3 && +bg[3] === 0);
      if (!ugjennomsiktig) continue;
      const er = el.getBoundingClientRect();
      if (er.width < 20 || er.height < 20) continue;
      const bredde = Math.max(0, Math.min(er.right, window.innerWidth) - Math.max(er.left, x0));
      dekket += bredde * Math.min(er.height, r.height);
    }
    const flate = (window.innerWidth - x0) * r.height;
    ut.push({
      tittel: (sek.querySelector("h1,h2")?.textContent ?? "").trim().slice(0, 34),
      hoyde: Math.round(r.height),
      dekket: Math.min(100, Math.round((dekket / flate) * 100)),
    });
  }
  return ut;
}, maske);
for (const r of rader) console.log(`  ${String(r.dekket).padStart(3)}% dekket  h=${String(r.hoyde).padStart(4)}  ${r.tittel}`);
await b.close();
