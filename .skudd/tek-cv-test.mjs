/**
 * Eksperiment: lønner content-visibility: auto seg på lesesidene våre?
 *
 * Samme side måles to ganger – uten og med teknikken – i samme nettleser og med
 * samme scroll. CSS-en injiseres før innlasting, så den virker nøyaktig som om
 * den sto i stilarket.
 */
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:4425";
const SIDER = ["/handbok", "/vilkar", "/personvern"];

// Snittet av .prose-barna er rundt 110 px. Det er gjetningen contain-intrinsic-size
// krever, og nettopp gjetningen som kan skape forskyvning.
const CV = `.prose > * { content-visibility: auto; contain-intrinsic-size: auto 110px; }`;

async function maal(nettleser, sti, medCv) {
  const side = await nettleser.newPage({ viewport: { width: 1440, height: 900 } });
  const cdp = await side.context().newCDPSession(side);
  await cdp.send("Performance.enable");

  await side.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  if (medCv) await side.addStyleTag({ content: CV }).catch(() => {});

  await side.goto(BASE + sti, { waitUntil: "networkidle" });
  if (medCv) await side.addStyleTag({ content: CV });

  const hoyde0 = await side.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < hoyde0; y += 600) {
    await side.evaluate((y) => scrollTo(0, y), y);
    await side.waitForTimeout(60);
  }
  await side.waitForTimeout(300);

  const m = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((x) => [x.name, x.value]));
  const cls = await side.evaluate(() => window.__cls);
  const hoyde1 = await side.evaluate(() => document.documentElement.scrollHeight);
  await side.close();
  return { cls: +cls.toFixed(4), layout: +(m.LayoutDuration * 1000).toFixed(1), hoyde0, hoyde1 };
}

const nettleser = await chromium.launch();
for (const sti of SIDER) {
  const uten = await maal(nettleser, sti, false);
  const med = await maal(nettleser, sti, true);
  console.log(
    `${sti.padEnd(12)}` +
      ` CLS ${String(uten.cls).padStart(6)} -> ${String(med.cls).padStart(6)}` +
      ` | layout ${String(uten.layout).padStart(5)} -> ${String(med.layout).padStart(5)} ms` +
      ` | høyde ved last ${uten.hoyde0} -> ${med.hoyde0}` +
      ` (etter scroll ${med.hoyde1})`,
  );
}
await nettleser.close();
