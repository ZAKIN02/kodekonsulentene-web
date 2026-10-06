/** skudd.mjs <fase> – elementbilder av overskrifter, i begge tema, på seks bredder.
 *
 *  Feller som er omgått her:
 *   - fullPage fotograferer scroll-drevne elementer på opasitet 0. Vi bruker
 *     visningsbilde med clip, aldri fullPage.
 *   - locator.screenshot() henger på et element med løpende animasjon. Vi tar
 *     page.screenshot({clip}) fra en boundingBox – samme koordinatrom.
 *   - scroll-behavior: smooth gjør en måling rett etter scroll ugyldig. Vi
 *     scroller med behavior:"instant" og venter til scrollY står stille.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const fase = process.argv[2] || "foer";
const BASE = "http://127.0.0.1:4330";
const MAAL = [
  ["/apper-og-ai", ".mega", 0, "mega-baade"],
  ["/apper-og-ai", ".mega", 1, "mega-aipynt"],
  ["/bransjer/handverkere", ".mega", 0, "mega-slutt"],
  ["/systemer", ".mega", 0, "mega-systemer"],
  ["/verktoy/dmarc", ".mega", 0, "mega-dmarc"],
  ["/", ".display-xl", 0, "dispxl-hero"],
  ["/apper-og-ai", ".horisont__overskrift", 0, "horisont"],
  ["/historie", ".display-lg", 0, "displg-historie"],
  ["/", ".nokkeltall__verdi", 0, "nokkeltall"],
];
const BREDDER = [390, 412, 768, 1024, 1440, 1920];
const b = await chromium.launch();
for (const tema of ["dark", "light"]) {
  for (const bredde of BREDDER) {
    const c = await b.newContext({ viewport: { width: bredde, height: 900 }, colorScheme: tema === "light" ? "light" : "dark", reducedMotion: "reduce", deviceScaleFactor: 2 });
    const p = await c.newPage();
    for (const [side, valg, idx, navn] of MAAL) {
      const dir = `.skudd/typo2/${fase}/${navn}`;
      mkdirSync(dir, { recursive: true });
      try {
        await p.goto(BASE + side, { waitUntil: "load", timeout: 25000 });
        if (tema === "light") await p.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
        await p.evaluate(() => document.fonts.ready);
        const ok = await p.evaluate(([valg, idx]) => {
          const el = document.querySelectorAll(valg)[idx];
          if (!el) return false;
          const y = el.getBoundingClientRect().top + window.scrollY - (innerWidth < 600 ? 180 : 90);
          window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
          return true;
        }, [valg, idx]);
        if (!ok) continue;
        // vent til scrollen faktisk står stille
        let a = -1, b2 = -2, n = 0;
        while (a !== b2 && n++ < 20) { b2 = a; a = await p.evaluate(() => window.scrollY); await p.waitForTimeout(60); }
        await p.waitForTimeout(250);
        const boks = await p.evaluate(([valg, idx]) => {
          const el = document.querySelectorAll(valg)[idx];
          const r = el.getBoundingClientRect();
          return { x: Math.max(0, r.left - 10), y: Math.max(0, r.top - 34), width: Math.min(innerWidth - Math.max(0, r.left - 10), r.width + 20), height: Math.min(900 - Math.max(0, r.top - 34), r.height + 70) };
        }, [valg, idx]);
        if (boks.width < 4 || boks.height < 4) continue;
        await p.screenshot({ path: `${dir}/r-${tema}-${String(bredde).padStart(4, "0")}.png`, clip: boks });
      } catch (e) { console.log("  feil", side, valg, bredde, tema, String(e).slice(0, 80)); }
    }
    await p.close(); await c.close();
  }
}
await b.close();
console.log("ferdig", fase);
