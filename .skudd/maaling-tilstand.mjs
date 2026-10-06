/** Degradering: uten JS, med redusert bevegelse, og uten scroll-tidslinjer (Firefox). */
import { chromium, firefox } from "playwright";
const url = process.argv[2];
const sjekk = async (ctx, navn) => {
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const fyll = [...document.querySelectorAll(".foreroget__fyll")];
    const rader = document.querySelectorAll(".foreroget__rad").length;
    const tekst = [...document.querySelectorAll(".foreroget__tekst, .foreroget__verdi, .foreroget__navn")]
      .filter((e) => +getComputedStyle(e).opacity < 0.05).length;
    return {
      rader,
      stolper: fyll.length,
      bredder: fyll.map((e) => Math.round(e.getBoundingClientRect().width)),
      usynligTekst: tekst,
      anim: fyll[0] ? getComputedStyle(fyll[0]).animationName : "-",
    };
  });
  console.log(`  ${navn.padEnd(26)}`, JSON.stringify(r));
  await p.close();
};
const c = await chromium.launch();
await sjekk(await c.newContext({ viewport: { width: 1440, height: 900 } }), "chromium normalt");
await sjekk(await c.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }), "redusert bevegelse");
await sjekk(await c.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }), "uten JavaScript");
await sjekk(await c.newContext({ viewport: { width: 390, height: 844 } }), "mobil 390");
await c.close();
const f = await firefox.launch();
await sjekk(await f.newContext({ viewport: { width: 1440, height: 900 } }), "firefox (ingen view())");
await f.close();
