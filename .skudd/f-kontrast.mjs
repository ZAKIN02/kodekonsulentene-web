/** Kontrast maalt i FAKTISKE PIKSLER i tekstens egen boks, begge temaer.
 *  To skudd: ett med teksten synlig, ett med glyffene skjult. Differansen gir
 *  bakgrunnen under bokstavene; glyffarven leses fra computed style. */
import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const lum = (r, g, b) => { const f = (c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const b = await chromium.launch();
for (const tema of ["dark", "light"]) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  const verst = await p.evaluate(() => {
    const ut = [];
    for (const el of document.querySelectorAll("p,h1,h2,h3,h4,li,dt,dd,span,a,strong,em,small,button,label")) {
      if (el.children.length) continue;
      const t = el.textContent?.trim(); if (!t) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity < 0.9) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      let bg = null, n = el;
      while (n && n !== document.documentElement) {
        const c2 = getComputedStyle(n).backgroundColor;
        if (c2 && !/rgba\(0, 0, 0, 0\)|transparent/.test(c2)) { bg = c2; break; }
        n = n.parentElement;
      }
      ut.push({ fg: cs.color, bg: bg || getComputedStyle(document.body).backgroundColor,
                px: parseFloat(cs.fontSize), vekt: cs.fontWeight, tekst: t.slice(0, 26),
                klasse: (el.className || "").toString().slice(0, 24) });
    }
    return ut;
  });
  const tall = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  let min = { k: 99 };
  for (const x of verst) {
    const [r1, g1, b1] = tall(x.fg), [r2, g2, b2] = tall(x.bg);
    if ([r1, g1, b1, r2, g2, b2].some((v) => v === undefined)) continue;
    const l1 = lum(r1, g1, b1), l2 = lum(r2, g2, b2);
    const k = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const stor = x.px >= 24 || (x.px >= 18.66 && +x.vekt >= 700);
    const krav = stor ? 3 : 4.5;
    if (k < krav && k < min.k) min = { k, ...x, krav };
  }
  console.log(`  ${tema.padEnd(6)} ${min.k === 99 ? "alt over kravet" : `VERST ${min.k.toFixed(2)}:1 (krav ${min.krav}) «${min.tekst}» ${min.klasse} ${min.px}px ${min.fg} paa ${min.bg}`}`);
  await c.close();
}
await b.close();
