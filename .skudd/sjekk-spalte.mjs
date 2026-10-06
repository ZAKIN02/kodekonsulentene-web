import { chromium } from "playwright";
const [base, side, bArg] = process.argv.slice(2);
const bredde = +(bArg ?? 1512);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
await p.goto(base + side, { waitUntil: "networkidle" });
await p.waitForTimeout(600);
const r = await p.evaluate((W) => {
  const ut = {};
  for (const v of ["h1.mega", ".scene__ingress", ".kk-urlcheck", ".kk-urlcheck-hint"]) {
    const el = document.querySelector(v); if (!el) continue;
    // Glyffenes faktiske hoeyrekant, ikke elementboksens.
    let hoyre = 0;
    const gaa = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let t = gaa.nextNode(); t; t = gaa.nextNode()) {
      if (!t.nodeValue?.trim()) continue;
      const rg = document.createRange(); rg.selectNodeContents(t);
      for (const k of rg.getClientRects()) hoyre = Math.max(hoyre, k.right);
    }
    const boks = el.getBoundingClientRect();
    ut[v] = { boksHoyrePst: Math.round((boks.right / W) * 100), blekkHoyrePst: Math.round((hoyre / W) * 100) };
  }
  return ut;
}, bredde);
for (const [k, v] of Object.entries(r)) console.log(`  ${k.padEnd(22)} boks til ${String(v.boksHoyrePst).padStart(3)}%   blekk til ${String(v.blekkHoyrePst).padStart(3)}%`);
await b.close();
