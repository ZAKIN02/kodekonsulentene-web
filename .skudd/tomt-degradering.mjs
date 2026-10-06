/** Verifiserer at scene-endringene degraderer riktig: uten JS, med redusert
 *  bevegelse, og i Firefox der animation-timeline mangler. Degradering skal alltid
 *  gå mot SYNLIG, aldri mot borte. */
import { chromium, firefox } from "playwright";
const base = "http://127.0.0.1:4601";
// Bare det som faktisk ER I SYNSRANDEN teller. Elementer under folden skal være
// nedtonet – det er hele poenget. Og settetiden må være lang nok til at en
// 420 ms overgang i Firefox-reserven er ferdig; uten det telles elementer midt
// i flukten som feil. Det har lurt en tidligere måling.
const USYNLIG = `[...document.querySelectorAll(".avslor")].filter(e => {
  const r = e.getBoundingClientRect();
  if (r.height < 5 || r.bottom < 0 || r.top > innerHeight) return false;
  return parseFloat(getComputedStyle(e).opacity) < 0.95;
}).map(e => (e.textContent||"").trim().slice(0,24))`;
const sider = ["/", "/nettsider", "/systemer", "/status"];

async function kjor(navn, nettleser, opt) {
  const b = await nettleser.launch();
  const ctx = await b.newContext({ viewport: { width: 1512, height: 900 }, colorScheme: "dark", ...opt });
  const p = await ctx.newPage();
  const ut = [];
  for (const s of sider) {
    await p.goto(base + s, { waitUntil: "networkidle" });
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    let verst = [];
    for (let y = 0; y < h; y += 700) {
      await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(1800);
      const f = await p.evaluate(USYNLIG); if (f.length > verst.length) verst = f;
    }
    ut.push(`${s}:${verst.length}${verst.length ? " («" + verst[0] + "»)" : ""}`);
  }
  console.log(`  ${navn.padEnd(26)} halvsynlige avdekkinger: ${ut.join("  ")}`);
  await b.close();
}
await kjor("Chromium, normalt", chromium, {});
await kjor("Chromium, redusert bevegelse", chromium, { reducedMotion: "reduce" });
await kjor("Chromium, uten JavaScript", chromium, { javaScriptEnabled: false });
await kjor("Firefox (mangler view())", firefox, {});
