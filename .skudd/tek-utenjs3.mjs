import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
const k = await ctx.newPage();
await k.goto("http://127.0.0.1:4425/kontakt?sendt=1", { waitUntil: "load" });
for (const ms of [0, 100, 300, 600, 1200]) {
  const o = await k.evaluate(() => getComputedStyle(document.querySelector(".kvittering")).opacity);
  const h = await k.evaluate(() => Math.round(document.querySelector(".kvittering").getBoundingClientRect().height));
  console.log(`  +${String(ms).padStart(4)} ms: opasitet ${o}  høyde ${h} px`);
  await k.waitForTimeout(ms === 0 ? 100 : ms);
}
await b.close();
