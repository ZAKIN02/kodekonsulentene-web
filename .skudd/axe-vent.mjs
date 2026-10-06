import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".kk-proof")?.scrollIntoView({ block: "center" }));
await p.waitForTimeout(3000);
console.log("computed etter 3 s:", await p.evaluate(() => {
  const a = document.querySelector(".kk-proof .is-accent"), l = document.querySelector(".kk-proof .kk-label");
  const g = (e) => e ? { color: getComputedStyle(e).color, opacity: getComputedStyle(e).opacity,
                         foreldreOpacity: getComputedStyle(e.closest("li") ?? e).opacity } : null;
  return { aksent: g(a), label: g(l) };
}));
const r = await new AxeBuilder({ page: p }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]).analyze();
console.log("brudd etter vent:", r.violations.map(v => `${v.id}:${v.nodes.length}`));
await ctx.close(); await b.close();
