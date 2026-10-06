/** Ekte nettleserzoom, ikke deviceScaleFactor. Zoom endrer CSS-visningsbredden,
 *  som er nettopp det som kan sprenge en vw-basert skriftstørrelse. */
import { chromium } from "playwright";
const b = await chromium.launch();
const funn = [];
for (const z of [0.5, 0.67, 0.8, 1, 1.1, 1.25, 1.5, 1.75, 2]) {
  const p = await b.newPage({ viewport: { width: 1512, height: 850 } });
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  await p.goto("http://127.0.0.1:4700/systemer", { waitUntil: "networkidle" });
  await p.evaluate((zz) => { document.documentElement.style.zoom = String(zz); }, z);
  await p.waitForTimeout(350);
  const r = await p.evaluate(() => {
    let m = 0, t = "";
    for (const el of document.querySelectorAll(".mega")) {
      const rg = document.createRange(); rg.selectNodeContents(el);
      for (const l of rg.getClientRects()) { const o = l.right - innerWidth; if (o > m) { m = o; t = el.textContent.trim().slice(0,34); } }
    }
    return { over: Math.round(m), t };
  });
  funn.push(`  zoom ${z}: ${r.over > 0 ? "+" + r.over + "px «" + r.t + "»" : "ok"}`);
  await p.close();
}
console.log(funn.join("\n"));
await b.close();
