import { chromium } from "playwright";
const [url, ut, idx] = process.argv.slice(2);
const N = +(idx || 0);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 850 }, colorScheme: "dark" });
await p.goto(url, { waitUntil: "networkidle" });
const g = await p.evaluate((n) => {
  const r = document.querySelectorAll(".scenefilm-ramme")[n].getBoundingClientRect();
  return { top: r.top + scrollY, h: r.height };
}, N);
await p.evaluate(v => scrollTo(0, Math.round(v)), g.top - 500 + (g.h + 900) * (+(process.argv[5] || 0.3)));
await p.waitForTimeout(650);
await p.screenshot({ path: ut });
const info = await p.evaluate((n) => {
  const el = document.querySelectorAll("[data-scenefilm]")[n];
  const v = el.querySelector("video");
  return { t: +v.currentTime.toFixed(2), d: +v.duration.toFixed(2) };
}, N);
console.log(JSON.stringify(info));
await b.close();
