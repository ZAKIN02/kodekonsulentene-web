import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto("http://127.0.0.1:4525/", { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 700) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(90); }
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
const pos = await p.evaluate(() => {
  const treff = [];
  for (const el of document.querySelectorAll("h2,h3,.mega")) {
    const t = (el.textContent || "").trim();
    if (/Fire steg|kjente tider|Sjekk nettsiden/i.test(t))
      treff.push({ tekst: t.slice(0, 40), y: Math.round(el.getBoundingClientRect().top + scrollY) });
  }
  return treff;
});
console.log(JSON.stringify(pos, null, 1));
await b.close();
