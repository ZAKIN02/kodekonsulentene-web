import { chromium } from "playwright";
const [url, ut] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const boks = await p.evaluate(() => {
  const m = document.querySelector(".mega");
  const r = m.getBoundingClientRect();
  return { x: 0, y: Math.max(0, r.top + window.scrollY - 20), width: 1440, height: r.height + 220 };
});
await p.screenshot({ path: ut, clip: boks });
await b.close();
