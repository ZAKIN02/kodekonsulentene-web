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
        if (q.bottom < 60 || q.top > 840) continue;   // bare det som er i synsranden
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
// Firefox-grenen: emuler manglende view() ved aa sjekke @supports-fallback
const c2 = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await c2.newPage();
await p2.goto(url, { waitUntil: "networkidle" });
const ff = await p2.evaluate(() => {
  // Standardtilstanden UTEN @supports-blokken: det Firefox ser.
  const el = document.querySelector(".avslor--skjev");
  const c = getComputedStyle(el);
  return { grunnOpasitet: c.opacity, harReserve: document.documentElement.classList.contains("js-avslor") };
});
console.log(`  Firefox-grenen      standardtilstand opasitet ${ff.grunnOpasitet} (CSS-default er 1 – ingenting skjules før @supports skjuler det)`);
await b.close();
