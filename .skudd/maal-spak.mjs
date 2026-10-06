import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
console.log(await p.evaluate(() => [...document.querySelectorAll('input[type="range"]')].map((e) => {
  const s = getComputedStyle(e); return { accent: s.accentColor, h: Math.round(e.getBoundingClientRect().height) };
})));
await b.close();
