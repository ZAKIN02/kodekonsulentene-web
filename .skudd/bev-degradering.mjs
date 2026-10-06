/** Degraderingen skal gå mot SYNLIG, aldri mot borte. Måler laveste opasitet
 *  blant elementer som er i synsranden – ikke under folden, som alltid er 0. */
import { chromium } from "playwright";
const b = await chromium.launch();
const url = process.argv[2];
const tilstander = [
  ["normalt", {}],
  ["redusert bevegelse", { reducedMotion: "reduce" }],
  ["uten JavaScript", { javaScriptEnabled: false }],
];
for (const [navn, opt] of tilstander) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opt });
  const p = await c.newPage();
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  let verst = 1, hvor = "";
  for (let i = 0; i <= 10; i++) {
    await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), Math.round((h - 900) * (i / 10)));
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      let m = 1, t = "";
      for (const el of document.querySelectorAll(".avslor, .pekerkort")) {
        const q = el.getBoundingClientRect();
        if (q.top > 560 || q.bottom < 240) continue;   // godt inne i vinduet, ikke på vei inn nederst
        const o = +getComputedStyle(el).opacity;
        if (o < m) { m = o; t = (el.textContent || "").trim().slice(0, 22); }
      }
      return { m, t };
    });
    if (r.m < verst) { verst = r.m; hvor = r.t; }
  }
  console.log(`  ${navn.padEnd(19)} laveste opasitet i syn: ${verst.toFixed(2)}${verst < 0.9 ? "  «" + hvor + "»" : ""}`);
  await c.close();
}
await b.close();
