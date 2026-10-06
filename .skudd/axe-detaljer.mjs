import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch();
for (const [navn, w, h, side] of [["desktop",1440,900,"/"],["mobil",412,915,"/"],["mobil",412,915,"/verktoy"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399" + side, { waitUntil: "networkidle" });
  const r = await new AxeBuilder({ page: p }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]).analyze();
  console.log(`\n=== ${navn} ${side} : ${r.violations.length} brudd ===`);
  for (const v of r.violations) {
    console.log(` • ${v.id} [${v.impact}] ${v.help}`);
    for (const n of v.nodes.slice(0,2)) {
      console.log(`     ${n.target.join(" ")}`);
      console.log(`     ${(n.failureSummary||"").split("\n").slice(0,2).join(" | ").slice(0,140)}`);
    }
  }
  await ctx.close();
}
await b.close();
