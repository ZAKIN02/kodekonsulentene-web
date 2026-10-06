import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2, colorScheme: "dark", reducedMotion: "reduce" });
await p.goto("http://127.0.0.1:4581/lab/interaksjon", { waitUntil: "networkidle" });
await p.locator("[data-stabel]").first().scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
for (const v of [0, 45, 100]) {
  await p.evaluate((val) => {
    const s = document.querySelector("[data-stabel-spak]");
    s.value = String(val); s.dispatchEvent(new Event("input", { bubbles: true }));
  }, v);
  await p.waitForTimeout(350);
  const bx = await p.locator("[data-stabel]").first().boundingBox();
  await p.screenshot({ path: `.skudd/opptak-se/stabel-${v}.png`, clip: bx });
}
await b.close();
