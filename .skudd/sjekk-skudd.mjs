import { chromium } from "playwright";
const [base, side, velger, ut, breddeArg, ekstra] = process.argv.slice(2);
const bredde = +(breddeArg ?? 1512);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
await p.goto(base + side, { waitUntil: "networkidle" });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(120); }
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
const boks = await p.evaluate(([vel, pluss]) => {
  const el = document.querySelector(vel);
  const r = el.getBoundingClientRect();
  return { x: 0, y: Math.max(0, r.top + scrollY - 20), width: innerWidth, height: Math.min(r.height + 40 + (+pluss || 0), 6000) };
}, [velger, ekstra ?? 0]);
await p.screenshot({ path: ut, clip: boks, fullPage: true });
console.log(`  ${ut}  ${Math.round(boks.height)}px hoeyt`);
await b.close();
