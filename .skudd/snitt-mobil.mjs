import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4711/lab/svg", { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 500) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(50); }
const r = await p.evaluate(() => {
  const svgSkjult = [...document.querySelectorAll(".snitt__svg")].every((e) => getComputedStyle(e).display === "none");
  const lister = [...document.querySelectorAll(".snitt__liste")];
  const synlig = lister.filter((l) => l.getBoundingClientRect().height > 20).length;
  const drag = document.documentElement.scrollWidth - 390;
  // Minste malte skriftstoerrelse i listene.
  let minPx = 99;
  for (const l of lister) for (const e of l.querySelectorAll("*"))
    if (e.textContent.trim()) minPx = Math.min(minPx, parseFloat(getComputedStyle(e).fontSize));
  return { svgSkjult, lister: lister.length, synlig, drag, minPx };
});
console.log(`  SVG skjult: ${r.svgSkjult}`);
console.log(`  lister som baerer innholdet: ${r.synlig} av ${r.lister}`);
console.log(`  sidelengs drag: ${r.drag}px`);
console.log(`  minste skrift i lista: ${r.minPx}px`);
await b.close();
