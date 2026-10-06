import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const r = await p.evaluate(() => {
  const ut = [];
  document.querySelectorAll(".flyt").forEach((f) => {
    const nav = [...f.querySelectorAll(".flyt__navn")].map((t) => t.textContent);
    const bokser = [...f.querySelectorAll(".flyt__boks")].map((e) => e.getBBox().width.toFixed(0));
    const over = [];
    const bb = [...f.querySelectorAll(".flyt__boks")].map((e) => e.getBBox());
    [...f.querySelectorAll(".flyt__detalj")].forEach((t, i) => {
      const tb = t.getBBox();
      const o = Math.max(bb[i].x - tb.x, (tb.x + tb.width) - (bb[i].x + bb[i].width));
      if (o > 0) over.push(`${i}:+${o.toFixed(0)}`);
    });
    ut.push({ tittel: f.querySelector(".flyt__tittel").textContent, nav, boksB: bokser[0], over });
  });
  return ut;
});
r.forEach((f) => console.log(`  ${f.nav.length} ledd  boks ${f.boksB}px  ${f.nav.join(" → ")}  overflyt: ${f.over.length ? f.over.join(" ") : "ingen"}`));
console.log("  konsollfeil:", feil.length ? feil.join(" | ") : "ingen");
// Spacing i scene-sammenheng måles separat.
await p.evaluate(() => document.querySelectorAll(".flyt")[2]?.scrollIntoView({ block: "center" }));
await p.waitForTimeout(400);
writeFileSync(".skudd/flyt/lab.png", await p.screenshot());
await b.close();
