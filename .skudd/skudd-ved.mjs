import { chromium } from "playwright";
const [url, y, ut, w] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +(w || 1512), height: 900 }, colorScheme: "dark" });
await p.goto(url, { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let s = 0; s < h; s += 700) { await p.evaluate(v => scrollTo(0, v), s); await p.waitForTimeout(80); }
await p.evaluate(v => scrollTo(0, +v), +y); await p.waitForTimeout(700);
await p.screenshot({ path: ut });
await b.close();
console.log("lagret", ut);
