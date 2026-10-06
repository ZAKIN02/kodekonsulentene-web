import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch();
for (const [navn, opt, vent] of [["normalt", {}, 2500], ["redusert", { reducedMotion: "reduce" }, 1200]]) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opt });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4861/", { waitUntil: "networkidle" });
  await p.waitForTimeout(vent);
  const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa"]).analyze();
  console.log(`\n== ${navn} ==`);
  for (const v of r.violations) {
    console.log(`  ${v.id} (${v.nodes.length})`);
    for (const n of v.nodes.slice(0, 4)) {
      const d = n.any?.[0]?.data || {};
      console.log(`    ${String(d.contrastRatio ?? "").padStart(5)} ${d.fgColor ?? ""} på ${d.bgColor ?? ""}  ${n.target.join(" ").slice(0, 70)}`);
    }
  }
  await c.close();
}
await b.close();
