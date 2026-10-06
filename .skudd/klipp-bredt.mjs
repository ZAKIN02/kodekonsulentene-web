import { chromium } from "playwright";
const [base, side] = process.argv.slice(2);
const b = await chromium.launch();
for (const w of [900, 1024, 1120, 1200, 1280, 1366, 1440, 1512, 1600, 1680, 1800, 1920, 2000, 2560]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(base + side, { waitUntil: "networkidle" });
  const over = await p.evaluate(() => {
    let m = 0;
    for (const el of document.querySelectorAll(".mega")) {
      const r = document.createRange(); r.selectNodeContents(el);
      for (const l of r.getClientRects()) m = Math.max(m, l.right - window.innerWidth, -l.left);
    }
    return Math.round(m);
  });
  if (over > 0) console.log(`  ${w}px: +${over}px utenfor`);
  await p.close();
}
await b.close();
console.log("  ferdig");
