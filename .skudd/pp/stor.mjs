import { chromium } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
for (const [w, dpr, merke] of [[2560, 1, "2560x1 (px 2560)"], [1440, 1, "1440x1 (px 1440)"], [1280, 2, "1280x2 (px 2560)"], [390, 3, "mobil"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: dpr });
  await p.goto(base + "/systemer", { waitUntil: "networkidle" });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } });
  await p.waitForTimeout(2000);
  const src = await p.evaluate(() => (document.querySelector("[data-scenefilm-video]")?.currentSrc || "").split("/").pop());
  console.log(`  ${merke.padEnd(18)} → ${src}`);
  await p.close();
}
await b.close();
