/** Degradering i tre tilstander. Flere animasjoner i dette repoet har etterlatt
 *  innhold usynlig i Firefox eller uten JS – maalt, ikke antatt. */
import { chromium, firefox } from "playwright";
async function kjor(motor, navn, opts = {}) {
  const b = await motor.launch();
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, ...opts });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4711/lab/svg", { waitUntil: "networkidle" });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
  await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const el = [...document.querySelectorAll(".snitt__stolpe, .snitt__navn, .snitt__detalj, .snitt__leder")];
    let usynlig = 0, utegnet = 0;
    for (const e of el) {
      const cs = getComputedStyle(e);
      const q = e.getBoundingClientRect();
      const iSyn = q.top < innerHeight && q.bottom > 0;
      if (!iSyn) continue;
      if (+cs.opacity < 0.9) usynlig++;
      const d = parseFloat(cs.strokeDashoffset);
      if (!Number.isNaN(d) && d > 0.1) utegnet++;
    }
    return { totalt: el.length, usynlig, utegnet,
      viewStottes: CSS.supports("animation-timeline", "view()") };
  });
  console.log(`  ${navn.padEnd(26)} view() ${String(r.viewStottes).padEnd(5)}  usynlige ${r.usynlig}  utegnede ${r.utegnet}  (av ${r.totalt})`);
  await b.close();
}
await kjor(chromium, "Chromium, normalt");
await kjor(chromium, "Chromium, redusert bev.", { reducedMotion: "reduce" });
await kjor(chromium, "Chromium, uten JS", { javaScriptEnabled: false });
await kjor(firefox, "Firefox (mangler view())");
