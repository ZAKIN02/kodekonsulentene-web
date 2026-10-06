/** Hvor hardt object-fit: cover beskjærer klippet, gitt rammens hoyde.
 *  Filmen er absolute inset 0 i .scenefilm-ramme, saa en ramme over flere
 *  seksjoner gir en hoy, smal boks og dermed et smalt utsnitt av en 16:9-ramme. */
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const r = await p.evaluate(() => {
  const ut = [];
  for (const el of document.querySelectorAll("[data-scenefilm]")) {
    const b = el.getBoundingClientRect();
    const v = el.querySelector("video");
    const vb = (v?.videoWidth || 1920) / (v?.videoHeight || 1080);
    const bb = b.width / b.height;
    // cover: skalerer slik at begge dekkes; synlig andel av videobredden
    const synligBredde = bb >= vb ? 1 : bb / vb;
    const synligHoyde = bb >= vb ? vb / bb : 1;
    ut.push({ w: Math.round(b.width), h: Math.round(b.height),
              boksForhold: +bb.toFixed(2), videoForhold: +vb.toFixed(2),
              synligBreddePst: Math.round(synligBredde * 100),
              synligHoydePst: Math.round(synligHoyde * 100) });
  }
  return ut;
});
for (const x of r) console.log(`  boks ${x.w}x${x.h} (${x.boksForhold}) mot video ${x.videoForhold}  ->  synlig ${x.synligBreddePst}% av bredden, ${x.synligHoydePst}% av hoyden`);
await b.close();
