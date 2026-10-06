import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1512, height: 900 } });
const p = await ctx.newPage();
let feil = 0;
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(40); }
  const r = await p.evaluate(() => {
    const W = 1512; const ut = [];
    const scr = (el) => { let c = el.parentElement; while (c && c !== document.documentElement) { const cs = getComputedStyle(c); if (/(auto|scroll)/.test(cs.overflowX) && c.scrollWidth > c.clientWidth + 1) return true; c = c.parentElement; } return false; };
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || el.children.length) continue;
      const q = el.getBoundingClientRect();
      if (q.width < 1 || q.right <= W + 2 || scr(el)) continue;
      ut.push(`+${Math.round(q.right - W)}px ${el.tagName} «${(el.textContent||"").trim().slice(0,20)}»`);
    }
    return { drag: Math.max(0, document.documentElement.scrollWidth - W), ut: [...new Set(ut)].slice(0,3) };
  });
  if (r.drag || r.ut.length) { console.log(`  ${s}: drag ${r.drag}px ${r.ut.join(" | ")}`); feil++; }
}
console.log(feil ? `  ${feil} sider` : "  skrivebord rent");
await b.close();
