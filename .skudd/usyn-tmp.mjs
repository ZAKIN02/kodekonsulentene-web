import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
console.log(await p.evaluate(() => {
  const ut = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (+cs.opacity >= 0.05 || !el.textContent?.trim()) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    ut.push({ tag: el.tagName, klasse: el.className?.toString().slice(0, 50), op: cs.opacity, anim: cs.animationName, tekst: el.textContent.trim().slice(0, 40) });
  }
  return ut;
}));
await b.close();
