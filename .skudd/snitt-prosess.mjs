import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4711/lab/svg", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
// Prosessflyten er den femte Flyt-figuren.
const r = await p.evaluate(() => {
  const f = document.querySelectorAll(".flyt")[4];
  f.scrollIntoView({ block: "center" });
  const q = f.getBoundingClientRect();
  return { x: 0, y: Math.max(0, q.top - 10), width: 1400, height: Math.min(900 - Math.max(0, q.top - 10), q.height + 20) };
});
await p.waitForTimeout(300);
await p.screenshot({ path: ".skudd/snitt-prosess.png", clip: r });
const t = await p.evaluate(() => {
  const f = document.querySelectorAll(".flyt")[4];
  return [...f.querySelectorAll(".flyt__nr")].map((e) => ({
    tekst: e.textContent, klasse: e.getAttribute("class"),
    px: +(parseFloat(getComputedStyle(e).fontSize) *
      (e.ownerSVGElement.getBoundingClientRect().width / e.ownerSVGElement.viewBox.baseVal.width)).toFixed(1),
  }));
});
console.log("  tidsetiketter i prosessflyten:");
for (const x of t) console.log(`    «${x.tekst}» malt ${x.px}px  ${x.klasse}`);
await b.close();
