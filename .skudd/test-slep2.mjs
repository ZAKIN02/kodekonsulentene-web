import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const el = p.locator("[data-slep]").first();
await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
const les = () => p.evaluate(() => {
  const f = document.querySelector("[data-slep-flate]");
  const inp = document.querySelector('input[type="range"]');
  return { p: getComputedStyle(f).getPropertyValue("--p").trim(),
           kolonner: getComputedStyle(f).gridTemplateColumns,
           verdi: inp.value };
});
console.log("  før:    ", JSON.stringify(await les()));
await p.locator('input[type="range"]').first().focus();
for (let i = 0; i < 10; i++) await p.keyboard.press("ArrowRight");
await p.waitForTimeout(400);
console.log("  etter:  ", JSON.stringify(await les()));
await b.close();
