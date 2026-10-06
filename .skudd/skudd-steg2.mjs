import { chromium } from "playwright";
const b = await chromium.launch();
const [url, ut, ...flagg] = process.argv.slice(2);
const ctx = await b.newContext({
  viewport: { width: 1440, height: 760 },
  reducedMotion: flagg.includes("--rolig") ? "reduce" : "no-preference",
  javaScriptEnabled: !flagg.includes("--ujs"),
});
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle" });
const topp = await p.evaluate(() => document.querySelector(".kk-steps li").getBoundingClientRect().top + scrollY);
const off = +(flagg.find((f) => /^-?\d+$/.test(f)) ?? -620);
await p.evaluate((y) => scrollTo(0, y), topp + off);
await p.waitForTimeout(250);
await p.screenshot({ path: ut });
console.log("  " + ut + "  (offset " + off + ")");
await b.close();
