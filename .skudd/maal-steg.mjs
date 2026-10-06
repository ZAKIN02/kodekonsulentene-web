import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 850 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const el = await p.$(".kk-steps");
if (!el) { console.log("  fant ingen .kk-steps"); await b.close(); process.exit(0); }
const boks = await el.boundingBox();
for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
  await p.evaluate(([y]) => scrollTo(0, y), [Math.max(0, boks.y - 850 + frac * 900)]);
  await p.waitForTimeout(220);
  const r = await p.evaluate(() => [...document.querySelectorAll(".kk-steps li")].map((li) => {
    const bs = getComputedStyle(li).backgroundSize.split(" ")[0];
    return bs.endsWith("%") ? bs : Math.round(parseFloat(bs)) + "px";
  }));
  console.log(`  scroll ${Math.round(frac*100)}%:  ${r.join("  ")}`);
}
await b.close();
