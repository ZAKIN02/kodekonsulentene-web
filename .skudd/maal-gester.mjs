/** Leser FAKTISK beregnet transform gjennom et helt gjennomløp. At CSS-en finnes
 *  betyr ikke at den kjører – en ugyldig stenografi forkastes stille. */
import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
const velgere = ["avslor--skjev", "avslor--naer", "avslor--dybde", "pekerkort"];
const spor = Object.fromEntries(velgere.map((v) => [v, new Set()]));
for (let i = 0; i <= 24; i++) {
  await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), Math.round((h - 900) * (i / 24)));
  await p.waitForTimeout(90);
  const r = await p.evaluate((vs) => {
    const ut = {};
    for (const v of vs) {
      const el = document.querySelector("." + v);
      if (!el) { ut[v] = "mangler"; continue; }
      const c = getComputedStyle(el);
      ut[v] = `${c.transform}|${(+c.opacity).toFixed(2)}`;
    }
    return ut;
  }, velgere);
  for (const v of velgere) spor[v].add(r[v]);
}
for (const v of velgere) {
  const n = spor[v].size;
  console.log(`  ${v.padEnd(16)} ${String(n).padStart(2)} ulike tilstander  ${n > 3 ? "BEVEGER SEG" : n > 1 ? "så vidt" : "STÅR STILLE"}`);
}
await b.close();
