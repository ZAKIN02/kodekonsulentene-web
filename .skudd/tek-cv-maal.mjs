/**
 * Måler CLS og rulleglatthet på de tre lange lesesidene.
 *
 * CLS måles ved å scrolle hele siden i steg, slik en leser gjør – ikke bare ved
 * innlasting. content-visibility: auto rendrer innhold NÅR det nærmer seg
 * skjermen, så en forskyvning fra feil contain-intrinsic-size oppstår under
 * scroll, ikke før.
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://127.0.0.1:4425";
const SIDER = ["/handbok", "/vilkar", "/personvern"];

const nettleser = await chromium.launch();
const ut = [];

for (const sti of SIDER) {
  const side = await nettleser.newPage({ viewport: { width: 1440, height: 900 } });

  await side.addInitScript(() => {
    window.__cls = 0;
    window.__skift = [];
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries()) {
        if (!e.hadRecentInput) {
          window.__cls += e.value;
          if (e.value > 0.001) window.__skift.push({ verdi: +e.value.toFixed(4), y: Math.round(scrollY) });
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await side.goto(BASE + sti, { waitUntil: "networkidle" });
  const hoyde = await side.evaluate(() => document.documentElement.scrollHeight);

  // Scroll nedover i steg på 600 px, som en leser.
  const t0 = Date.now();
  for (let y = 0; y < hoyde; y += 600) {
    await side.evaluate((y) => scrollTo(0, y), y);
    await side.waitForTimeout(60);
  }
  const rulletid = Date.now() - t0;

  await side.waitForTimeout(300);
  const { cls, skift } = await side.evaluate(() => ({ cls: window.__cls, skift: window.__skift }));

  ut.push({ sti, hoyde, cls: +cls.toFixed(4), rulletid, skift: skift.slice(0, 4) });
  await side.close();
}

await nettleser.close();
console.log(JSON.stringify(ut, null, 1));
