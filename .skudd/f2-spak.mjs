import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:4464/", { waitUntil: "networkidle" });
const r = await p.evaluate(() => {
  const ut = [];
  for (const el of document.querySelectorAll('input[type="range"]')) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    ut.push({ id: el.id || el.className || "(uten)", accentColor: cs.accentColor,
              height: Math.round(rect.height), appearance: cs.appearance });
  }
  return ut;
});
console.log(JSON.stringify(r, null, 2));
await b.close();
