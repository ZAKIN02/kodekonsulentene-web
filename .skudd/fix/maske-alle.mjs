/** Maaler ALLE scenefilmer paa siden, ikke bare den foerste.
 *  querySelector i entall har skjult akt 2 fra maalinger foer. */
import { chromium } from "playwright";
const [base, side] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto(base + side, { waitUntil: "networkidle" });
const r = await p.evaluate(async () => {
  const ut = [];
  for (const el of document.querySelectorAll("[data-scenefilm]")) {
    el.scrollIntoView({ block: "center" });
    const v = el.querySelector("video");
    if (!v) continue;
    await new Promise((res) => (v.readyState >= 2 ? res() : v.addEventListener("loadeddata", res, { once: true })));
    v.currentTime = v.duration * 0.5;
    await new Promise((res) => setTimeout(res, 500));
    const c = document.createElement("canvas"); c.width = 160; c.height = 90;
    c.getContext("2d").drawImage(v, 0, 0, 160, 90);
    const d = c.getContext("2d").getImageData(0, 0, 160, 90).data;
    const maske = parseFloat(getComputedStyle(el).getPropertyValue("--maske")) || 46;
    const vendt = el.hasAttribute("data-vend");
    let skjult = 0, tot = 0;
    for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) {
      const i = (y * 160 + x) * 4;
      if ((d[i] + d[i+1] + d[i+2]) / 3 < 45) continue;
      tot++;
      const pst = vendt ? 100 - (x / 160) * 100 : (x / 160) * 100;
      if (pst < maske) skjult++;
    }
    ut.push({ kilde: (v.querySelector("source")?.dataset.bred || "?").split("/").pop(),
              maske, vendt, skjult: Math.round(skjult / (tot || 1) * 100) });
  }
  return ut;
});
for (const x of r) console.log(`  ${String(x.kilde).padEnd(26)} maske ${x.maske}%  vendt:${x.vendt}  skjult ${x.skjult}%`);
await b.close();
