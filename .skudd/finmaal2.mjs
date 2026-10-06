import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const [sel, idx, fra, til] = [process.argv[3], +process.argv[4], +process.argv[5], +process.argv[6]];
const topp = await p.evaluate(([s, i]) => document.querySelectorAll(s)[i].getBoundingClientRect().top + scrollY, [sel, idx]);
const sett = new Set();
for (let d = fra; d <= til; d += 1) {
  await p.evaluate((y) => scrollTo(0, y), topp + d);
  const t = await p.evaluate(([s, i]) => {
    const f = getComputedStyle(document.querySelectorAll(s)[i], "::before").transform;
    return f === "none" ? 1 : +f.split("(")[1].split(",")[0];
  }, [sel, idx]);
  sett.add(t.toFixed(3));
}
console.log(`  ulike scaleX-verdier i ${fra}..${til}: ${[...sett].sort().join(" ")}`);
await b.close();
