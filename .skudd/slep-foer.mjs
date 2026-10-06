/** Hvordan ser komponenten ut i dag? Mobil (ekte berøringskontekst) og skrivebord. */
import { chromium, devices } from "playwright";
const UT = process.argv[3];
const b = await chromium.launch();
for (const [navn, opt] of [
  ["mobil390", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ["skrivebord", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
]) {
  const c = await b.newContext(opt);
  const p = await c.newPage();
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  const el = p.locator("[data-slep]").first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  await el.screenshot({ path: `${UT}/foer-${navn}.png` });
  const m = await p.evaluate(() => {
    const r = document.querySelector("[data-slep]");
    const f = r.querySelector("[data-slep-flate]");
    const k = r.querySelector(".slep__kontroll");
    const q = r.getBoundingClientRect();
    return {
      klar: r.dataset.klar, p: getComputedStyle(f).getPropertyValue("--p").trim(),
      kolonner: getComputedStyle(f).gridTemplateColumns,
      kontrollSynlig: getComputedStyle(k).display !== "none",
      linjeSynlig: getComputedStyle(r.querySelector(".slep__linje")).display !== "none",
      hoyde: Math.round(q.height), bredde: Math.round(q.width),
      drag: document.documentElement.scrollWidth - innerWidth,
    };
  });
  console.log(navn, JSON.stringify(m));
  await c.close();
}
await b.close();
