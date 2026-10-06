/** Detaljert mobilrevisjon: identifiserer NØYAKTIG hvilke elementer som stikker ut,
 *  med full kjede av foreldre, slik at årsaken kan finnes i stedet for gjettes. */
import { chromium } from "playwright";
const [base, side, breddeRaa] = process.argv.slice(2);
const bredde = Number(breddeRaa || 390);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: bredde, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto(base + side, { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
await p.waitForTimeout(400);
const r = await p.evaluate((W) => {
  const kjede = (el) => { const d = []; let c = el; for (let i = 0; i < 5 && c && c !== document.body; i++) { d.push(c.tagName + (c.className ? "." + String(c.className).split(" ").filter(Boolean).slice(0,2).join(".") : "")); c = c.parentElement; } return d.join(" < "); };
  const ut = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
    const q = el.getBoundingClientRect();
    if (q.width < 1 || q.height < 1) continue;
    if (q.right > W + 2) ut.push({ over: Math.round(q.right - W), bredde: Math.round(q.width), venstre: Math.round(q.left), kjede: kjede(el), tekst: (el.textContent || "").trim().slice(0, 34) });
  }
  // Behold bare de ytterste: de med flest piksler utenfor per kjede-rot.
  return ut.sort((a, z) => z.over - a.over).slice(0, 14);
}, bredde);
for (const x of r) console.log(`  +${String(x.over).padStart(4)}px  b=${String(x.bredde).padStart(4)} v=${String(x.venstre).padStart(4)}  ${x.kjede}\n           «${x.tekst}»`);
console.log(r.length ? "" : "  ingen utenfor");
await b.close();
