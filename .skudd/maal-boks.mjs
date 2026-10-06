import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
for (const [url, sel] of [["/lab/interaksjon","[data-stabel]"],["/lab/interaksjon","[data-slep]"],["/","[data-stabel]"],["/","[data-slep]"]]) {
  await p.goto("http://127.0.0.1:4581" + url, { waitUntil: "networkidle" });
  await p.locator(sel).first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  const bx = await p.locator(sel).first().boundingBox();
  console.log(`${url.padEnd(18)} ${sel.padEnd(16)} ${bx ? `${Math.round(bx.width)}x${Math.round(bx.height)} @ ${Math.round(bx.x)},${Math.round(bx.y)}  forhold ${(bx.width/bx.height).toFixed(2)}` : "ikke funnet"}`);
}
await b.close();
