import { chromium, devices } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["Pixel 7"], colorScheme: "dark", hasTouch: true });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4399/lab/rontgen", { waitUntil: "networkidle" });
await p.evaluate(() => {
  window.__logg = [];
  const f = document.querySelector("[data-rontgen-flate]");
  for (const n of ["pointerdown","pointerup","pointerleave","pointerenter","pointercancel","pointermove","touchstart","touchend"])
    f.addEventListener(n, (e) => window.__logg.push(n + ":" + (e.pointerType ?? "-")), true);
});
// Tapp-koordinater er viewport-relative. Ligger flaten under folden, treffer
// tappet et helt annet element – og da fyrer ingenting.
await p.locator("[data-rontgen-flate]").scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
const bk = await p.locator("[data-rontgen-flate]").boundingBox();
await p.touchscreen.tap(bk.x + bk.width * 0.5, bk.y + bk.height * 0.5);
await p.waitForTimeout(400);
console.log("hendelser:", JSON.stringify(await p.evaluate(() => window.__logg)));
console.log("h etter  :", await p.evaluate(() => getComputedStyle(document.querySelector(".rontgen__design")).getPropertyValue("--h").trim()));
await b.close();
