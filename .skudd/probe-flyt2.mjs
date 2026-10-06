import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport:{width:1200,height:675}, colorScheme:"dark", reducedMotion:"no-preference" })).newPage();
await p.goto("http://127.0.0.1:4710/systemer", { waitUntil: "networkidle" });
const g = await p.evaluate(() => { const r=document.querySelector(".flyt__ramme").getBoundingClientRect();
  return { topp: Math.round(r.top+scrollY), vh: innerHeight }; });
for (let i=0;i<=12;i++){
  const y = Math.round(g.topp - g.vh + 20 + ((g.topp-60)-(g.topp-g.vh+20))*i/12);
  await p.evaluate(v=>scrollTo(0,v), y); await p.waitForTimeout(80);
  const m = await p.evaluate(()=>{ const o=[...document.querySelectorAll(".flyt__boks")].map(e=>+parseFloat(getComputedStyle(e).strokeDashoffset).toFixed(2));
    const r=document.querySelector(".flyt__ramme").getBoundingClientRect(); return {o, topp:Math.round(r.top)}; });
  console.log(`y=${String(y).padStart(5)} figur.topp=${String(m.topp).padStart(4)} ferdig=${m.o.filter(v=>v===0).length}/5 off=[${m.o.join(", ")}]`);
}
await b.close();
