/** Maaler det tomme spennet MELLOM siste blekk i en seksjon og foerste blekk i neste. */
import { chromium } from "playwright";
const [base, side, a, bArg] = process.argv.slice(2);
const bredde = +(bArg ?? 1512);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
await p.goto(base + side, { waitUntil: "networkidle" });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(110); }
const r = await p.evaluate((vel) => {
  const sek = document.querySelector(vel);
  const neste = sek.nextElementSibling;
  const synlig = (el) => { const c = getComputedStyle(el); return c.visibility !== "hidden" && c.display !== "none" && +c.opacity > 0.03; };
  const blekk = (rot) => {
    let min = Infinity, max = -Infinity;
    const gaa = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT);
    for (let t = gaa.nextNode(); t; t = gaa.nextNode()) {
      if (!t.nodeValue?.trim()) continue;
      const far = t.parentElement; if (!far || !synlig(far)) continue;
      const rg = document.createRange(); rg.selectNodeContents(t);
      for (const k of rg.getClientRects()) if (k.height > 1) { min = Math.min(min, k.top + scrollY); max = Math.max(max, k.bottom + scrollY); }
    }
    for (const el of rot.querySelectorAll("img,video,svg,canvas,input,button,[data-scenefilm]")) {
      if (!synlig(el)) continue;
      const k = el.getBoundingClientRect();
      if (k.height > 1 && k.width > 1) { min = Math.min(min, k.top + scrollY); max = Math.max(max, k.bottom + scrollY); }
    }
    return { min, max };
  };
  const A = blekk(sek), B = neste ? blekk(neste) : null;
  return {
    seksjonSlutt: Math.round(sek.getBoundingClientRect().bottom + scrollY),
    sisteBlekk: Math.round(A.max),
    nesteTag: neste?.tagName + "." + (neste?.className || "").split(" ")[0],
    forsteBlekkNeste: B ? Math.round(B.min) : null,
    tomtSpenn: B ? Math.round(B.min - A.max) : null,
  };
}, a);
console.log(`  ${side} ${a} @${bredde}px:`, JSON.stringify(r));
await b.close();
