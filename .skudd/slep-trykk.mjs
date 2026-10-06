/** Simulert BRUKER paa 390 px med ekte beroeringskontekst: lar sveipen gaa
 *  ferdig, trykker saa oeverste panel, saa nederste, saa drar spaken. */
import { chromium } from "playwright";
const [url, ut] = process.argv.slice(2);
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await c.newPage();
await p.goto(url, { waitUntil: "networkidle" });
const el = p.locator("[data-slep]").first();
await el.scrollIntoViewIfNeeded();
// IKKE «mangler data-sveiper» – det er ogsaa sant FOER sveipen har startet, og
// da trykket skriptet midt i bevegelsen. data-puls settes bare naar den er ferdig.
await p.waitForFunction(() => document.querySelector("[data-slep]").hasAttribute("data-puls"), null, { timeout: 12000 });
await p.waitForTimeout(400);
let n = 0;
// page.screenshot({clip}) og ikke locator.screenshot: den siste venter paa at
// elementet skal staa stille, og pulsen + overgangene gjoer at det aldri gjoer
// det. clip er visningsbilde-relativt naar fullPage er av, som boundingBox –
// det er fullPage + clip som er to ulike koordinatrom.
const ta = async (merke) => {
  const q = await el.boundingBox();
  await p.screenshot({ path: `${ut}/trykk-${String(n++).padStart(2, "0")}.png`,
                       clip: { x: q.x, y: Math.max(0, q.y), width: q.width, height: Math.min(q.height, 844 - Math.max(0, q.y)) } });
  console.log(`  ${merke}: --p ${await p.evaluate(() => getComputedStyle(document.querySelector("[data-slep]")).getPropertyValue("--p").trim())}`);
};
const r = await p.locator("[data-slep-flate]").first().boundingBox();
console.log("  flate i visningsbildet:", JSON.stringify({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}));
p.on("framenavigated", (f) => f === p.mainFrame() && console.log("  !! NAVIGERTE TIL", f.url()));
await ta("hvile etter sveip");
// Trykk MIDT i panelet, ikke 30 px fra toppen: toppen av komponenten ligger
// under den faste topplinjen etter en vanlig rulling, og det foerste forsoeket
// traff navigasjonen og dro testen til /apper-og-ai.
const boks = async (n) => p.evaluate((k) => {
  const q = document.querySelector(`[data-slep-panel="${k}"]`).getBoundingClientRect();
  return { x: q.x + q.width / 2, y: q.y + q.height / 2 };
}, n);
let b1 = await boks("for");
await p.touchscreen.tap(b1.x, b1.y);                     // oeverste panel
await p.waitForTimeout(200); await ta("midt i overgangen");
await p.waitForTimeout(500); await ta("oeverste panel aapnet");
const b2 = await boks("etter");
await p.touchscreen.tap(b2.x, b2.y);                      // nederste panel
await p.waitForTimeout(700); await ta("nederste panel aapnet");
// og spaken, med fingeren
const s = await p.locator("[data-slep-spak]").boundingBox();
await p.touchscreen.tap(s.x + s.width * 0.55, s.y + s.height / 2);
await p.waitForTimeout(700); await ta("spak dratt til 55%");
await b.close();
