/** Sjekker at tekst i figuren ikke renner ut av sin egen boks. SVG-tekst bryter
 *  ikke, så en for lang detaljlinje sklir stille inn under naboen. */
import { chromium } from "playwright";
const b = await chromium.launch();
for (const bredde of [1440, 1200, 1000, 901]) {
  const ctx = await b.newContext({ viewport: { width: bredde, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const svg = document.querySelector(".flyt__svg");
    if (!svg || getComputedStyle(svg).display === "none") return { skjult: true };
    const bokser = [...document.querySelectorAll(".flyt__boks")].map((e) => e.getBBox());
    const verst = [];
    for (const sel of [".flyt__navn", ".flyt__detalj"]) {
      [...document.querySelectorAll(sel)].forEach((t, i) => {
        const tb = t.getBBox(), bb = bokser[i];
        const over = Math.max(bb.x - tb.x, (tb.x + tb.width) - (bb.x + bb.width));
        if (over > 0) verst.push(`${sel.replace(".flyt__", "")}[${i}] +${over.toFixed(0)}`);
      });
    }
    const svgR = svg.getBoundingClientRect();
    return { skjult: false, verst, maltNavn: (parseFloat(getComputedStyle(document.querySelector(".flyt__navn")).fontSize) * (svgR.width / svg.viewBox.baseVal.width)).toFixed(1) };
  });
  console.log(`  ${String(bredde).padStart(4)}px  ${r.skjult ? "figur skjult, lista overtar" : `navn malt ${r.maltNavn}px  overflyt: ${r.verst.length ? r.verst.join(", ") : "ingen"}`}`);
  await ctx.close();
}
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const m = await p.evaluate(() => {
  const svg = document.querySelector(".flyt__svg"), li = document.querySelector(".flyt__liste");
  return { svgSkjult: getComputedStyle(svg).display === "none", listeSynlig: getComputedStyle(li).position === "static", punkter: li.children.length, drag: document.documentElement.scrollWidth - document.documentElement.clientWidth };
});
console.log(`   390px  figur skjult: ${m.svgSkjult}  liste synlig: ${m.listeSynlig}  ${m.punkter} punkter  sidelengs drag: ${m.drag}px`);
await b.close();
