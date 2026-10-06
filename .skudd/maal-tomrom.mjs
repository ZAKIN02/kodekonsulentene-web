/** Finner sammenhengende tomme vannrette bånd: rader uten blekk innenfor
 *  innholdsbredden. Måler på ekte visningsbilder gjennom et helt gjennomløp,
 *  ikke fullPage – scroll-drevne elementer er usynlige ved scroll 0. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(90); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(250);
  const funn = await p.evaluate(() => {
    const rader = new Array(Math.ceil(document.documentElement.scrollHeight / 10)).fill(false);
    for (const el of document.querySelectorAll("body *")) {
      if (!el.textContent?.trim() && !["IMG","VIDEO","SVG","CANVAS","HR","INPUT","BUTTON"].includes(el.tagName)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const a = Math.floor((r.top + scrollY) / 10), z = Math.ceil((r.bottom + scrollY) / 10);
      for (let i = Math.max(0, a); i < Math.min(rader.length, z); i++) rader[i] = true;
    }
    const band = []; let start = null;
    rader.forEach((fylt, i) => {
      if (!fylt && start === null) start = i;
      if (fylt && start !== null) { band.push([start * 10, i * 10]); start = null; }
    });
    return band.filter(([a, z]) => z - a >= 300).map(([a, z]) => ({ fra: a, px: z - a }));
  });
  const verst = funn.sort((x, y) => y.px - x.px).slice(0, 3);
  console.log(`  ${s.padEnd(12)} ${verst.length ? verst.map((v) => `${v.px}px @${v.fra}`).join("  ") : "ingen bånd over 300 px"}`);
}
await b.close();
