/** Scroller gjennom flytfiguren og tar ekte VISNINGSBILDER.
 *  Ikke fullPage: det evaluerer scroll-drevne animasjoner ved scroll 0, så alt
 *  under folden fotograferes med opacity 0. Og ikke clip: den er i
 *  SIDEkoordinater, mens boundingBox() er i visningsvindu-koordinater. */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const [url, utPrefiks, nStr, motion] = process.argv.slice(2);
const N = +(nStr ?? 6);
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: motion === "reduce" ? "reduce" : "no-preference",
});
const p = await ctx.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(url, { waitUntil: "networkidle" });
const topp = await p.evaluate(() => {
  const el = document.querySelector(".flyt__ramme");
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
});
if (topp === null) { console.log("fant ingen .flyt__ramme"); await b.close(); process.exit(1); }
const start = Math.max(0, topp - 820);
const slutt = topp - 120;
for (let i = 0; i < N; i++) {
  const y = start + ((slutt - start) * i) / (N - 1);
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(260);
  const m = await p.evaluate(() => {
    const off = (s) => [...document.querySelectorAll(s)].map((e) => (+getComputedStyle(e).strokeDashoffset.replace("px", "")).toFixed(2));
    const op = (s) => [...document.querySelectorAll(s)].map((e) => (+getComputedStyle(e).opacity).toFixed(2));
    return { boks: off(".flyt__boks"), linje: off(".flyt__linje"), navn: op(".flyt__navn") };
  });
  console.log(`  steg ${i}  bokser[${m.boks.join(" ")}]  linjer[${m.linje.join(" ")}]  navn-opasitet[${m.navn.join(" ")}]`);
  writeFileSync(`${utPrefiks}-${i}.png`, await p.screenshot());
}
console.log("  konsollfeil:", feil.length ? feil.join(" | ") : "ingen");
await b.close();
