import { chromium } from "playwright";
const b = await chromium.launch();
for (const w of [700, 860, 1000, 1200, 1440, 1680, 2000]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  const f = p.locator("[data-slep-flate]").first();
  await f.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  const les = () => p.evaluate(() => getComputedStyle(document.querySelector("[data-slep-flate]")).getPropertyValue("--p").trim());
  const a = await les();
  const r = await f.boundingBox();
  await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  await p.mouse.down(); await p.mouse.move(r.x + r.width * 0.28, r.y + r.height / 2, { steps: 10 }); await p.mouse.up();
  await p.waitForTimeout(350);
  const c = await les();
  console.log(`  ${String(w).padStart(4)}px: --p ${a} -> ${c}  ${a !== c ? "virker" : "ingen effekt"}`);
  await p.close();
}
await b.close();
