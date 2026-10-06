import { chromium } from "playwright";
const [url, ut, y = "150", h = "1000"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", colorScheme: "dark" })).newPage();
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(400);
await p.screenshot({ path: ut, clip: { x: 0, y: +y, width: 1440, height: +h }, fullPage: true });
await b.close();
console.log("ok", ut);
