import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1512, height: 850 }, reducedMotion: "reduce" });
const p = await c.newPage();
await p.goto("http://127.0.0.1:4722/", { waitUntil: "networkidle" });
await p.waitForTimeout(800);
console.log("  " + (await p.evaluate(() => [...document.querySelectorAll(".kk-steps li")].map((li) => getComputedStyle(li).backgroundSize.split(" ")[0]))).join("  "));
await b.close();
