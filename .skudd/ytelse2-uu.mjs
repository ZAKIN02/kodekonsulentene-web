/**
 * Tilgjengelighet i SATT tilstand. Lighthouse maaler gjerne midt i en inntoning
 * og rapporterer mellomfarger som kontrastbrudd – paa /verktoy sto det 1,4:1 paa
 * #2a2e34, som ikke er en tokenverdi i det hele tatt. Med redusert bevegelse
 * hopper alt til sluttverdien, og da maaler vi det brukeren faktisk ser.
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const s of sider) {
  const linjer = [];
  for (const tema of ["dark", "light"]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(base + s, { waitUntil: "networkidle" });
    await p.waitForTimeout(1200);
    const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa"]).analyze();
    for (const v of r.violations) for (const n of v.nodes) {
      const m = n.any?.[0]?.data || {};
      const tall = m.contrastRatio ? `${m.contrastRatio}:1 ${m.fgColor} paa ${m.bgColor}` : "";
      linjer.push(`    [${tema}] ${v.id}: ${tall || n.target.join(" ").slice(0, 60)}`);
    }
    await ctx.close();
  }
  console.log(`  ${s}${linjer.length ? "" : "  — rent"}`);
  for (const l of [...new Set(linjer)]) console.log(l);
}
await b.close();
