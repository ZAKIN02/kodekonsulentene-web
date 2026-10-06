/** Prosesstripa: background-size per steg + nummerets clip, gjennom et sveip. */
import { chromium } from "playwright";
const b = await chromium.launch();
const [url, ...flagg] = process.argv.slice(2);
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: flagg.includes("--rolig") ? "reduce" : "no-preference",
  javaScriptEnabled: !flagg.includes("--ujs"),
});
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle" });
const topp = await p.evaluate(() => {
  const el = document.querySelector(".kk-steps li");
  return el ? el.getBoundingClientRect().top + scrollY : -1;
});
if (topp < 0) { console.log("  ingen .kk-steps"); await b.close(); process.exit(0); }
for (let d = -950; d <= -300; d += 80) {
  await p.evaluate((y) => scrollTo(0, y), topp + d);
  await p.waitForTimeout(100);
  const r = await p.evaluate(() => [...document.querySelectorAll(".kk-steps li")].map((li) => {
    const bs = getComputedStyle(li).backgroundSize.split(" ")[0];
    const w = li.getBoundingClientRect().width;
    const pst = bs.endsWith("px") ? Math.round((parseFloat(bs) / w) * 100) : (bs === "auto" ? -1 : parseFloat(bs));
    const cp = getComputedStyle(li.querySelector(".kk-step-n")).clipPath;
    const m = cp.match(/inset\([^ ]+ ([0-9.]+)%/);
    return `${String(pst).padStart(3)}%/${m ? Math.round(100 - +m[1]) : 100}`;
  }));
  console.log(`  ${String(d).padStart(5)}  ${r.join("   ")}`);
}
await b.close();
