/**
 * Teller bevegelsesøyeblikk per side, og hvor MANGE FORSKJELLIGE de er.
 *
 * `getComputedStyle().animationTimeline` leser «auto» selv når view() er satt,
 * så den er ubrukelig som detektor. Vi leser animationName.
 *
 * Måler i tre tilstander: normalt, uten JS, og med redusert bevegelse.
 */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();

async function maal(side, opts = {}) {
  const ctx = await b.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled: opts.js !== false,
    reducedMotion: opts.rolig ? "reduce" : "no-preference",
  });
  const p = await ctx.newPage();
  await p.goto(base + side, { waitUntil: "networkidle" });
  // Gå gjennom hele siden så scroll-drevne elementer faktisk evalueres.
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
  const r = await p.evaluate(() => {
    const navn = new Map();
    let usynlig = 0;
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.animationName !== "none") {
        for (const n of cs.animationName.split(",").map((s) => s.trim())) navn.set(n, (navn.get(n) ?? 0) + 1);
      }
      if (cs.transitionProperty !== "all" && cs.transitionProperty !== "none" && cs.transitionDuration !== "0s") {
        navn.set("→" + cs.transitionProperty.split(",")[0].trim(), (navn.get("→" + cs.transitionProperty.split(",")[0].trim()) ?? 0) + 1);
      }
      if (+cs.opacity < 0.05 && el.textContent?.trim()) {
        const bb = el.getBoundingClientRect();
        if (bb.width > 2 && bb.height > 2) usynlig++;
      }
    }
    return { navn: [...navn.entries()].sort((a, c) => c[1] - a[1]), usynlig };
  });
  await ctx.close();
  return r;
}

for (const s of sider) {
  const n = await maal(s);
  const animasjoner = n.navn.filter(([k]) => !k.startsWith("→"));
  const sum = animasjoner.reduce((a, [, v]) => a + v, 0);
  console.log(`\n  ${s}`);
  console.log(`    bevegelser: ${sum}   ulike gester: ${animasjoner.length}`);
  console.log(`    ${animasjoner.map(([k, v]) => `${k}×${v}`).join("  ") || "(ingen)"}`);
  if (process.env.FULL) {
    const uJs = await maal(s, { js: false });
    const rolig = await maal(s, { rolig: true });
    console.log(`    uten JS: ${uJs.usynlig} usynlige   redusert: ${rolig.navn.filter(([k])=>!k.startsWith("→")).reduce((a,[,v])=>a+v,0)} bevegelser, ${rolig.usynlig} usynlige`);
  }
}
await b.close();
