import { chromium } from "playwright";
const [url, y] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 }, colorScheme: "dark" });
await p.goto(url, { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let s = 0; s < h; s += 700) { await p.evaluate(v => scrollTo(0, v), s); await p.waitForTimeout(90); }
await p.evaluate(v => scrollTo(0, +v), +y);
await p.waitForTimeout(2500); // god tid – en overgang skal være ferdig
console.log(JSON.stringify(await p.evaluate(() => {
  const ut = [];
  for (const el of document.querySelectorAll(".avslor, .avslor *, .eyebrow, p")) {
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.top > 900 || r.height < 4) continue;
    const o = parseFloat(getComputedStyle(el).opacity);
    if (o < 0.9) ut.push({ t: (el.textContent || "").trim().slice(0, 42), o: +o.toFixed(2), y: Math.round(r.top) });
  }
  return ut.slice(0, 12);
}), null, 1));
await b.close();
