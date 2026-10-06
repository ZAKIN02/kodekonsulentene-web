import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "dark", isMobile: true, hasTouch: true });
await p.goto("http://127.0.0.1:4399/lab/interaksjon", { waitUntil: "networkidle" });
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => ({
  slepKolonner: getComputedStyle(document.querySelector("[data-slep] .slep__flate")).gridTemplateColumns,
  slepKontroll: getComputedStyle(document.querySelector("[data-slep] .slep__kontroll")).display,
  stabelTouch: getComputedStyle(document.querySelector("[data-stabel] .stabel__scene")).touchAction,
  slepTouch: getComputedStyle(document.querySelector("[data-slep] .slep__flate")).touchAction,
}))));
await p.locator("[data-stabel] [data-stabel-scene]").scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
await p.screenshot({ path: ".skudd/k4-mobil.png" });
await b.close();
