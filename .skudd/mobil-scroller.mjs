/** Skiller ekte klipping fra innhold som ligger i en vannrett scroller.
 *  Et element som stikker utenfor skjermen er bare en FEIL hvis ingen
 *  forelder kan scrolles bort til det. */
import { chromium } from "playwright";
const [base, side, breddeRaa] = process.argv.slice(2);
const bredde = Number(breddeRaa || 390);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: bredde, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto(base + side, { waitUntil: "networkidle" });
const r = await p.evaluate((W) => {
  const naabar = (el) => {
    let c = el.parentElement;
    while (c && c !== document.documentElement) {
      const cs = getComputedStyle(c);
      if (/(auto|scroll)/.test(cs.overflowX) && c.scrollWidth > c.clientWidth + 1) return c;
      c = c.parentElement;
    }
    return null;
  };
  const ekte = [], scrollbar = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
    if (el.children.length) continue;
    const q = el.getBoundingClientRect();
    if (q.width < 1 || q.height < 1 || q.right <= W + 2) continue;
    const s = naabar(el);
    const rad = { over: Math.round(q.right - W), tag: el.tagName, tekst: (el.textContent||"").trim().slice(0,26) };
    if (s) scrollbar.push({ ...rad, scroller: s.tagName + "." + String(s.className).split(" ")[0] });
    else ekte.push(rad);
  }
  return { ekte: ekte.slice(0,10), scrollbar: scrollbar.slice(0,6) };
}, bredde);
console.log("  EKTE KLIPPING (ingen scroller kan naa dem):");
if (!r.ekte.length) console.log("    ingen");
for (const x of r.ekte) console.log(`    +${x.over}px  ${x.tag} «${x.tekst}»`);
console.log("  I VANNRETT SCROLLER (naabar ved aa dra):");
if (!r.scrollbar.length) console.log("    ingen");
for (const x of r.scrollbar) console.log(`    +${x.over}px  ${x.tag} «${x.tekst}»  i ${x.scroller}`);
await b.close();
