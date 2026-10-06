/** Kontrast på ALLE sider i BEGGE temaer, målt med axe på settet bevegelse.
 *  Rapporterer bare antall brudd per side/tema, så det er lesbart. */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
let total = 0;
for (const tema of ["dark", "light"]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  const rader = [];
  for (const s of sider) {
    try {
      const resp = await p.goto(base + s, { waitUntil: "networkidle", timeout: 25000 });
      await p.waitForTimeout(900);
      // Uten denne meldte verktøyet «rent» for alle 25 sider mens en enkeltside
      // korrekt fant 8 brudd: en side som ikke lastet har heller ingen brudd.
      const ok = await p.evaluate(() => document.querySelectorAll("h1,h2").length);
      if (!resp || resp.status() >= 400 || ok === 0) {
        rader.push(`    ${s.padEnd(26)} LASTET IKKE (status ${resp?.status()}, ${ok} overskrifter)`);
        continue;
      }
      const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const k = r.violations.filter((v) => v.id === "color-contrast");
      const n = k.reduce((a, v) => a + v.nodes.length, 0);
      total += n;
      if (n) {
        const verste = k.flatMap((v) => v.nodes).map((x) => x.any?.[0]?.data?.contrastRatio ?? 9).sort((a, z) => a - z)[0];
        rader.push(`    ${s.padEnd(26)} ${n} brudd, verste ${verste}:1`);
      }
    } catch (e) { rader.push(`    ${s.padEnd(26)} FEIL ${String(e.message).slice(0, 40)}`); }
  }
  console.log(`  ${tema}: ${rader.length ? "" : "rent"}`);
  rader.forEach((r) => console.log(r));
  await ctx.close();
}
console.log(`  SUM kontrastbrudd: ${total}`);
await b.close();
