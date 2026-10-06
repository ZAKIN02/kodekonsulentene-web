import { chromium, devices } from "playwright";
const b = await chromium.launch();
for (const [navn, dev] of [["pixel7", devices["Pixel 7"]], ["smal", { viewport: { width: 360, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const s = await b.newPage({ ...dev, colorScheme: "dark", reducedMotion: "reduce" });
  await s.goto("http://127.0.0.1:4411/sjekk", { waitUntil: "networkidle" });
  const p = s.locator("[data-sjekk-sekvens] .sjs__panel").first();
  await p.scrollIntoViewIfNeeded();
  await s.waitForTimeout(400);
  const r = await p.evaluate((el) => { const x = el.getBoundingClientRect(); return { w: Math.round(x.width), h: Math.round(x.height) }; });
  const overflyt = await s.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`  ${navn}: panel ${r.w}x${r.h}px, vannrett overflyt ${overflyt}px`);
  await p.screenshot({ path: `.skudd/sjs-maal/mobil-${navn}.png` });
  await s.close();
}
await b.close();
