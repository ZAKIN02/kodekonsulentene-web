/**
 * Hva koster det å rendre de lange lesesidene i dag?
 *
 * content-visibility: auto lønner seg bare hvis nettleseren faktisk bruker tid
 * på layout og maling av innhold utenfor skjermen. Er den tiden ~0, er teknikken
 * ren risiko uten gevinst. Målt med CDP Performance.getMetrics, ikke anslått.
 */
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:4425";
const SIDER = ["/handbok", "/vilkar", "/personvern"];

const nettleser = await chromium.launch();
for (const sti of SIDER) {
  const side = await nettleser.newPage({ viewport: { width: 1440, height: 900 } });
  const cdp = await side.context().newCDPSession(side);
  await cdp.send("Performance.enable");

  await side.goto(BASE + sti, { waitUntil: "networkidle" });
  const m = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((x) => [x.name, x.value]));

  const antall = await side.evaluate(() => ({
    elementer: document.querySelectorAll("*").length,
    proseBarn: document.querySelectorAll(".prose > *").length,
    seksjoner: document.querySelectorAll(".section").length,
  }));

  console.log(
    `${sti.padEnd(12)} elementer ${String(antall.elementer).padStart(4)}` +
      `  .prose-barn ${String(antall.proseBarn).padStart(3)}` +
      `  seksjoner ${antall.seksjoner}` +
      `  | layout ${(m.LayoutDuration * 1000).toFixed(1)} ms` +
      `  stil ${(m.RecalcStyleDuration * 1000).toFixed(1)} ms` +
      `  layoutkall ${m.LayoutCount}`,
  );
  await side.close();
}
await nettleser.close();
