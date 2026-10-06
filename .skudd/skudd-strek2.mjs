import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
for (const y of [0, 60, 120, 200]) {
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const s = [...document.querySelectorAll(".scene__strek")].filter((e) => getComputedStyle(e).display !== "none")[0];
    const bb = s.getBoundingClientRect();
    const t = getComputedStyle(s).transform;
    return { top: Math.round(bb.top), sx: t === "none" ? 1 : +t.split("(")[1].split(",")[0] };
  });
  if (r.top < 0 || r.top > 880) continue;
  await p.screenshot({ path: `.skudd/ordforraad/strek-${y}.png`, clip: { x: 100, y: r.top - 12, width: 1240, height: 26 } });
  console.log(`  scrollY ${String(y).padStart(3)}: scaleX ${r.sx.toFixed(2)}  →  .skudd/ordforraad/strek-${y}.png`);
}
await b.close();
