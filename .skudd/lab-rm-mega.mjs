import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4399/lab/typo", { waitUntil: "networkidle" });
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(() => {
  const ord = [...document.querySelectorAll(".mega .ord")];
  return {
    antall: ord.length,
    laveste: Math.min(...ord.map(o => parseFloat(getComputedStyle(o).opacity))),
    animasjon: getComputedStyle(ord[0]).animationName,
  };
})));
await b.close();
