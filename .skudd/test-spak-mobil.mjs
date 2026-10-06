import { chromium, devices } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ ...devices["Pixel 7"] });
const p = await c.newPage();
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const f = p.locator("[data-slep-flate]").first();
await f.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
const les = () => p.evaluate(() => {
  const el = document.querySelector("[data-slep-flate]");
  const inp = document.querySelector('input[type="range"]');
  const cs = getComputedStyle(el);
  return { p: cs.getPropertyValue("--p").trim(), kol: cs.gridTemplateColumns, verdi: inp.value,
           spakSynlig: inp.getBoundingClientRect().height > 0 };
});
console.log("  før:  ", JSON.stringify(await les()));
const inp = p.locator('input[type="range"]').first();
const r = await inp.boundingBox();
if (r) { await p.touchscreen.tap(r.x + r.width * 0.25, r.y + r.height / 2); await p.waitForTimeout(400); }
console.log("  etter spak-tapp:", JSON.stringify(await les()));
await b.close();
