import { chromium } from "playwright";
const [url, sel, ut] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const r = await p.evaluate((s) => {
  const e = document.querySelector(s);
  if (!e) return null;
  const b = e.getBoundingClientRect();
  return { top: b.top + scrollY, h: b.height };
}, sel);
if (!r) { console.log("fant ikke " + sel); await b.close(); process.exit(0); }
console.log(`sporet: topp ${Math.round(r.top)}, høyde ${Math.round(r.h)}px`);
// Fire posisjoner GJENNOM sporet, ikke rundt det.
for (let i = 0; i < 4; i++) {
  const y = r.top + (r.h - 900) * (i / 3);
  await p.evaluate((yy) => scrollTo(0, yy), y);
  await p.waitForTimeout(400);
  await p.screenshot({ path: ut.replace(".png", `-${i}.png`) });
}
await b.close();
