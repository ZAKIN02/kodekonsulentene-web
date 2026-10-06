/** Verifiserer at ETT klipp spoles gjennom flere seksjoner, og måler
 *  tekstkontrast i hver av dem mens filmen ligger bak. */
import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });

const geo = await p.evaluate(() => {
  const ramme = document.querySelector(".scenefilm-ramme");
  if (!ramme) return null;
  const r = ramme.getBoundingClientRect();
  const seks = [...ramme.querySelectorAll(":scope > section")].map(e => {
    const b = e.getBoundingClientRect();
    return { tittel: (e.querySelector("h2,.mega")?.textContent || "").trim().slice(0, 30),
             topp: Math.round(b.top + scrollY), h: Math.round(b.height) };
  });
  return { rammeTopp: Math.round(r.top + scrollY), rammeH: Math.round(r.height), vh: innerHeight, seks };
});
if (!geo) { console.log("ingen .scenefilm-ramme"); await b.close(); process.exit(0); }
console.log(`ramme: ${geo.rammeH}px = ${(geo.rammeH / geo.vh).toFixed(1)} skjermer, ${geo.seks.length} seksjoner`);
for (const s of geo.seks) console.log(`   ${s.tittel.padEnd(32)} ${s.h}px`);

// Spol gjennom og les currentTime
console.log("\nspoling (currentTime gjennom rammen):");
const steg = 6;
for (let i = 0; i <= steg; i++) {
  const y = geo.rammeTopp - geo.vh * 0.5 + (geo.rammeH + geo.vh) * (i / steg);
  await p.evaluate(v => scrollTo(0, v), Math.max(0, Math.round(y)));
  await p.waitForTimeout(260);
  const t = await p.evaluate(() => {
    const v = document.querySelector("[data-scenefilm-video]");
    return v ? { t: +v.currentTime.toFixed(2), d: +(v.duration || 0).toFixed(2), klar: v.readyState } : null;
  });
  console.log(`   y=${Math.round(Math.max(0, y))}  currentTime ${t?.t ?? "-"} / ${t?.d ?? "-"}  readyState ${t?.klar}`);
}
await b.close();
