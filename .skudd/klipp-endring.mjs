/** Måler hvor mye et klipp faktisk endrer seg. Et scroll-spolt klipp der
 *  ingenting skjer gir ingenting tilbake for scrollingen. Og slutt lik start
 *  betyr ping-pong: bevegelsen tar tilbake sin egen avsløring. */
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
for (const [side, ...rest] of [["/"], ["/bransjer/handverkere"], ["/verktoy/uu-sjekk"], ["/verktoy/cookie-sjekk"], ["/verktoy"]]) {
  await p.goto("http://127.0.0.1:4525" + side, { waitUntil: "networkidle" });
  const vids = await p.$$("video");
  for (const v of vids) {
    await v.scrollIntoViewIfNeeded().catch(() => {});
    await p.waitForTimeout(1500);
    const r = await v.evaluate(async (el) => {
      if (!el.duration || !isFinite(el.duration)) return null;
      const c = document.createElement("canvas"); c.width = 160; c.height = 90;
      const g = c.getContext("2d", { willReadFrequently: true });
      const ta = async (t) => { el.currentTime = t; await new Promise((ok) => el.addEventListener("seeked", ok, { once: true }));
        g.drawImage(el, 0, 0, 160, 90); return g.getImageData(0, 0, 160, 90).data.slice(); };
      const d = el.duration;
      const f = []; for (const q of [0, .25, .5, .75, 1]) f.push(await ta(Math.min(d - 0.05, q * d)));
      const diff = (a, c2) => { let s = 0; for (let i = 0; i < a.length; i += 4) s += Math.abs(a[i] - c2[i]); return +(s / (a.length / 4)).toFixed(1); };
      return { fil: (el.currentSrc || "").split("/").pop(), varighet: +d.toFixed(1),
        trinn: [diff(f[0], f[1]), diff(f[1], f[2]), diff(f[2], f[3]), diff(f[3], f[4])],
        sluttMotStart: diff(f[0], f[4]) };
    });
    if (r) console.log(`  ${side.padEnd(22)} ${r.fil.padEnd(26)} ${r.varighet}s  trinn ${r.trinn.join(" ")}  slutt-mot-start ${r.sluttMotStart}`);
  }
}
await b.close();
