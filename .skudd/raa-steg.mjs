import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const topp = await p.evaluate(() => document.querySelector(".kk-steps").getBoundingClientRect().top + scrollY);
for (const d of [-800, -400, -100, 200]) {
  await p.evaluate((y) => scrollTo(0, y), topp + d);
  await p.waitForTimeout(150);
  console.log(d, await p.evaluate(() => {
    const li = document.querySelector(".kk-steps li");
    const f = getComputedStyle(li, "::before");
    return { innhold: f.content, transform: f.transform, anim: f.animationName, range: f.animationRange, bg: f.backgroundColor, h: f.height };
  }));
}
await b.close();
