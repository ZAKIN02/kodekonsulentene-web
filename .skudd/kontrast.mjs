import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".teaser")?.scrollIntoView({ block: "center" }));
await p.waitForTimeout(900);
// Måler faktisk malt farge bak teksten ved å plukke piksler fra et skjermbilde.
const boks = await p.locator(".teaser__tekst .body-lg").boundingBox();
const buf = await p.screenshot({ clip: boks });
const { createCanvas, loadImage } = await import("canvas").catch(() => ({}));
console.log(JSON.stringify({ boks }));
await p.screenshot({ path: process.argv[2] + "/teaser-tekstomraade.png", clip: { ...boks, x: boks.x - 10, width: boks.width + 20 } });
await b.close();
