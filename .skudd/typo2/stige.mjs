/** stige.mjs – samme overskrift, fem linjeavstander, samme bredde.
 *  Injisert med en <style> som BARE rører line-height, slik at alt annet er likt. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [side, valg, idx, bredde, tema, navn] = process.argv.slice(2);
const TRINN = (process.env.TRINN || "0.92,1.00,1.04,1.06,1.08,1.10,1.14").split(",");
const dir = `.skudd/typo2/stige/${navn}`;
mkdirSync(dir, { recursive: true });
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: +bredde, height: 900 }, colorScheme: tema === "light" ? "light" : "dark", reducedMotion: "reduce", deviceScaleFactor: 2 });
const p = await c.newPage();
await p.goto("http://127.0.0.1:4330" + side, { waitUntil: "load" });
if (tema === "light") await p.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
await p.evaluate(() => document.fonts.ready);
for (const t of TRINN) {
  await p.evaluate(([valg, t]) => {
    let s = document.getElementById("stige"); if (!s) { s = document.createElement("style"); s.id = "stige"; document.head.append(s); }
    s.textContent = `${valg}{line-height:${t} !important}`;
  }, [valg, t]);
  await p.evaluate(([valg, idx]) => { const el = document.querySelectorAll(valg)[+idx]; window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - 150), behavior: "instant" }); }, [valg, idx]);
  let a = -1, b2 = -2, n = 0; while (a !== b2 && n++ < 20) { b2 = a; a = await p.evaluate(() => scrollY); await p.waitForTimeout(50); }
  await p.waitForTimeout(200);
  const boks = await p.evaluate(([valg, idx]) => { const r = document.querySelectorAll(valg)[+idx].getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: Math.max(0, r.top - 8), width: Math.min(innerWidth - Math.max(0, r.left - 8), r.width + 16), height: Math.min(900 - Math.max(0, r.top - 8), r.height + 56) }; }, [valg, idx]);
  await p.screenshot({ path: `${dir}/lh-${t}.png`, clip: boks });
  const m = await p.evaluate(([valg, idx]) => {
    const ctx = document.createElement("canvas").getContext("2d"); const el = document.querySelectorAll(valg)[+idx];
    const f = e => { const cs = getComputedStyle(e); return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; };
    const g = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const T = []; let n;
    while ((n = g.nextNode())) { const t = n.nodeValue, fo = f(n.parentElement); ctx.font = fo; for (let i = 0; i < t.length; i++) { if (/\s/.test(t[i])) continue; const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); const x = r.getBoundingClientRect(); if (!x.width && !x.height) continue; const mm = ctx.measureText(t[i]); const gr = x.top + mm.fontBoundingBoxAscent; T.push({ ch: t[i], v: x.left, h: x.right, top: x.top, bt: gr - mm.actualBoundingBoxAscent, bb: gr + mm.actualBoundingBoxDescent }); } }
    const L = []; for (const t of T) { let q = L.find(q => Math.abs(q.top - t.top) <= 2); if (!q) { q = { top: t.top, tegn: [] }; L.push(q); } q.tegn.push(t); }
    L.sort((a, b) => a.top - b.top);
    const out = []; for (let i = 1; i < L.length; i++) { let min = Infinity, hv = null; for (const a of L[i - 1].tegn) for (const b of L[i].tegn) { if (Math.min(a.h, b.h) - Math.max(a.v, b.v) <= 0.5) continue; const d = b.bt - a.bb; if (d < min) { min = d; hv = a.ch + "|" + b.ch; } } out.push(Math.round(min * 10) / 10 + "[" + hv + "]"); }
    return { h: Math.round(el.getBoundingClientRect().height), klaring: out.join(" ") };
  }, [valg, idx]);
  console.log(`  lh ${t}  høyde ${m.h}px  kolonneklaring ${m.klaring}`);
}
await b.close();
