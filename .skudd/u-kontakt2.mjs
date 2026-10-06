import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4721/kontakt", { waitUntil: "networkidle" });
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= H; y += 400) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
await p.waitForTimeout(300);
console.log("etter scroll – fortsatt skjulte:", await p.evaluate(() => {
  const iSyne = (e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
  return [...document.querySelectorAll(".avslor, .mega .ord")].filter(iSyne)
    .filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.95).length;
}));
await b.close();
