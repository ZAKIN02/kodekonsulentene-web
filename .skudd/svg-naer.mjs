import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark", deviceScaleFactor: 2 });
await p.goto("http://127.0.0.1:4455/lab/svg", { waitUntil: "networkidle" });
await p.evaluate(() => window.scrollTo(0, 330));
await p.waitForTimeout(400);
await p.locator(".flyt__ramme").screenshot({ path: ".skudd/svg-naer.png" });
console.log(await p.evaluate(() => [...document.querySelectorAll(".flyt__strek")].map(e => getComputedStyle(e).strokeDashoffset).join(" ")));
await b.close();
