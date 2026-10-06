/** Alle sider: bare EKTE klipping, altsaa innhold ingen scroller kan naa.
 *  Og trykkmaal, skilt mellom frittstaaende lenker og lenker i broedtekst
 *  (WCAG 2.5.8 har et uttrykkelig unntak for det siste). */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
for (const s of sider) {
  const resp = await p.goto(base + s, { waitUntil: "networkidle" }).catch(() => null);
  if (!resp || resp.status() >= 400) { console.log(`  ${s}: SVARTE ${resp?.status() ?? "ikke"}`); continue; }
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(50); }
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const W = 390;
    const scroller = (el) => { let c = el.parentElement; while (c && c !== document.documentElement) { const cs = getComputedStyle(c); if (/(auto|scroll)/.test(cs.overflowX) && c.scrollWidth > c.clientWidth + 1) return true; c = c.parentElement; } return false; };
    // Er lenken inne i en setning? Da gjelder WCAG-unntaket.
    const iSetning = (a) => {
      const f = a.parentElement; if (!f) return false;
      if (!/^(P|LI|TD|DD|SPAN|STRONG|EM)$/.test(f.tagName)) return false;
      const egen = (a.textContent || "").trim().length;
      const hele = (f.textContent || "").trim().length;
      return hele > egen + 12;           // det staar reell tekst rundt lenken
    };
    const klippet = [], smaa = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
      const q = el.getBoundingClientRect();
      if (q.width < 1 || q.height < 1) continue;
      if (!el.children.length && q.right > W + 2 && !scroller(el))
        klippet.push(`+${Math.round(q.right - W)}px ${el.tagName} «${(el.textContent||"").trim().slice(0,24)}»`);
      if (/^(A|BUTTON|INPUT|SUMMARY|SELECT)$/.test(el.tagName) && (el.textContent||"").trim()
          && (q.height < 24 || q.width < 24) && !iSetning(el))
        smaa.push(`${Math.round(q.width)}x${Math.round(q.height)} ${el.tagName} «${(el.textContent||"").trim().slice(0,20)}»`);
    }
    return { klippet: [...new Set(klippet)].slice(0,6), smaa: [...new Set(smaa)].slice(0,6) };
  });
  if (r.klippet.length || r.smaa.length) {
    console.log(`  ${s}`);
    if (r.klippet.length) console.log(`      KLIPPET: ${r.klippet.join(" | ")}`);
    if (r.smaa.length) console.log(`      SMAA MAAL: ${r.smaa.join(" | ")}`);
  }
}
await b.close();
