import { chromium } from "playwright";
const b = await chromium.launch();
const lum = (c) => { const [r,g,bb] = c.match(/[\d.]+/g).slice(0,3).map(Number).map(v => v/255)
  .map(v => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4); return 0.2126*r+0.7152*g+0.0722*bb; };
const k = (a, c) => { const x = lum(a), y = lum(c); const [hi, lo] = x > y ? [x, y] : [y, x];
  return ((hi+0.05)/(lo+0.05)).toFixed(2); };
for (const tema of ["dark", "light"]) {
  const ctx = await b.newContext({ viewport: { width: 1512, height: 900 }, colorScheme: tema, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4711/lab/svg", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const ramme = getComputedStyle(document.querySelector(".snitt__ramme")).backgroundColor;
    const g = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; };
    const aks = document.querySelector(".snitt__lag--aksent .snitt__navn");
    return {
      flate: ramme,
      stolpe: g(".snitt__stolpe").stroke,
      leder: g(".snitt__leder").stroke,
      aksentStolpe: g(".snitt__lag--aksent .snitt__stolpe").stroke,
      aksentNavn: aks ? getComputedStyle(aks).fill : null,
    };
  });
  console.log(`  ${tema}:`);
  console.log(`    stolpe (grafikk, krav 3:1)        ${k(r.stolpe, r.flate)}:1`);
  console.log(`    leder  (grafikk, krav 3:1)        ${k(r.leder, r.flate)}:1`);
  console.log(`    aksentstolpe (grafikk, krav 3:1)  ${k(r.aksentStolpe, r.flate)}:1`);
  console.log(`    aksentnavn (tekst, krav 4,5:1)    ${k(r.aksentNavn, r.flate)}:1`);
  await ctx.close();
}
await b.close();
