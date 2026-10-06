import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch();
for (const tema of ["dark", "light"]) {
  // axe krever en kontekst, ikke en side opprettet rett på nettleseren.
  // reducedMotion: axe måler gjerne MIDT i en inntoning og rapporterer en
  // mellomfarge som brudd. Med redusert bevegelse hopper alt til sluttverdien,
  // og da måler vi det brukeren faktisk ser.
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const r = await new AxeBuilder({ page: p }).withTags(["wcag2a","wcag2aa"]).analyze();
  const kontrast = r.violations.filter((v) => v.id === "color-contrast");
  console.log(`  ${tema}:`);
  for (const v of kontrast) for (const n of v.nodes) {
    const m = (n.any?.[0]?.data) || {};
    console.log(`    ${String(m.contrastRatio ?? "?").padStart(5)}:1  ${m.fgColor ?? ""} på ${m.bgColor ?? ""}  ${n.target.join(" ").slice(0, 70)}`);
  }
  await ctx.close();
}
await b.close();
