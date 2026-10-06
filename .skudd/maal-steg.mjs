/** Leser prosesstripa gjennom et scroll-gjennomløp: linjebredde per steg og
 *  nummerets clip. Sekvensen er levende hvis stegene har ULIKE verdier. */
import { chromium } from "playwright";
const [url, ...flagg] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: flagg.includes("--rolig") ? "reduce" : "no-preference",
  javaScriptEnabled: !flagg.includes("--ujs"),
});
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle" });
const topp = await p.evaluate(() => {
  const el = document.querySelector(".kk-steps");
  return el ? el.getBoundingClientRect().top + scrollY : -1;
});
if (topp < 0) { console.log("  ingen .kk-steps"); await b.close(); process.exit(0); }
for (let d = -800; d <= 100; d += 150) {
  await p.evaluate((y) => scrollTo(0, y), topp + d);
  await p.waitForTimeout(110);
  const r = await p.evaluate(() => [...document.querySelectorAll(".kk-steps li")].map((li) => {
    const f = getComputedStyle(li, "::before");
    const n = li.querySelector(".kk-step-n");
    return {
      strek: f.transform === "none" ? "1.00" : (+f.transform.split("(")[1].split(",")[0]).toFixed(2),
      nr: getComputedStyle(n).clipPath,
    };
  }));
  console.log(`  ${String(d).padStart(5)}  strek: ${r.map((x) => x.strek).join(" ")}   nr: ${r.map((x) => x.nr.includes("inset") ? x.nr.replace(/inset\(|\)|px/g, "").split(" ")[1] : "hel").join(" ")}`);
}
await b.close();
