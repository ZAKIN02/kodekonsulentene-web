import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch();
for (const [navn, opt, vent] of [
  ["normalt, satt (2,5 s)", {}, 2500],
  ["redusert bevegelse", { reducedMotion: "reduce" }, 1200],
  ["lyst tema, satt", { colorScheme: "light" }, 2500],
]) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opt });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4861/", { waitUntil: "networkidle" });
  await p.waitForTimeout(vent);
  const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const kontrast = r.violations.filter(v => v.id === "color-contrast");
  console.log(`  ${navn.padEnd(22)} brudd:${r.violations.length}  kontrastnoder:${kontrast.reduce((n,v)=>n+v.nodes.length,0)}`);
  await c.close();
}
await b.close();
