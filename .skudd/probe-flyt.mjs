import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, colorScheme: "dark", reducedMotion: "no-preference" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4710/systemer", { waitUntil: "networkidle" });
const geo = await p.evaluate(() => {
  const el = document.querySelector(".flyt__ramme");
  const r = el.getBoundingClientRect();
  return { topp: Math.round(r.top + scrollY), hoyde: Math.round(r.height), bredde: Math.round(r.width), venstre: Math.round(r.left), vh: innerHeight };
});
console.log("geometri:", JSON.stringify(geo));
// Finn vinduet der tegningen faktisk gaar 0 -> 1.
const start = geo.topp - geo.vh, slutt = geo.topp + geo.hoyde + 200;
for (let i = 0; i <= 14; i++) {
  const y = Math.round(start + ((slutt - start) * i) / 14);
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(90);
  const m = await p.evaluate(() => {
    const bokser = [...document.querySelectorAll(".flyt__boks")];
    const off = bokser.map((e) => +parseFloat(getComputedStyle(e).strokeDashoffset).toFixed(2));
    const r = document.querySelector(".flyt__ramme").getBoundingClientRect();
    return { off, topp: Math.round(r.top), bunn: Math.round(r.bottom) };
  });
  console.log(`y=${String(y).padStart(5)} ramme.topp=${String(m.topp).padStart(5)} bunn=${String(m.bunn).padStart(5)} dashoffset=[${m.off.join(", ")}]`);
}
await b.close();
