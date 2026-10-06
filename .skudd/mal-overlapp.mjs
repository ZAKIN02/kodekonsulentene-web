import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(400);
const r = await p.evaluate(() => {
  const ut = [];
  for (const sel of [".mega", ".scene__ingress", ".stillbilde", ".stillbilde img", ".prose > h2"]) {
    const e = document.querySelector(sel);
    if (!e) { ut.push([sel, "FINNES IKKE"]); continue; }
    const b = e.getBoundingClientRect();
    ut.push([sel, `topp ${Math.round(b.top + scrollY)}  bunn ${Math.round(b.bottom + scrollY)}  h ${Math.round(b.height)}`]);
  }
  return ut;
});
for (const [s, v] of r) console.log(`  ${s.padEnd(18)} ${v}`);
await b.close();
