import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
for (const url of process.argv.slice(2)) {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const m = document.querySelector(".mega"); const i = document.querySelector(".scene__ingress");
    if (!m || !i) return null;
    const cs = getComputedStyle(m.querySelector(".ord") ?? m);
    // Siste tekstlinje i Mega: bruk Range for FAKTISK tekstboks, ikke elementboksen.
    const siste = [...m.querySelectorAll(".ord")].pop() ?? m;
    const rg = document.createRange(); rg.selectNodeContents(siste);
    const tekst = rg.getBoundingClientRect();
    const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
    // Nedstrek ligger typisk ~21 % av fontstørrelsen under grunnlinjen.
    const nedstrek = tekst.bottom + (fs - lh) / 2 + fs * 0.21;
    return {
      megaBoks: Math.round(m.getBoundingClientRect().bottom),
      sisteTekstBunn: Math.round(tekst.bottom),
      anslattNedstrek: Math.round(nedstrek),
      ingressTopp: Math.round(i.getBoundingClientRect().top),
      fontSize: Math.round(fs), lineHeight: Math.round(lh),
    };
  });
  console.log(url.replace(/.*4441/, ""), r ? JSON.stringify(r) : "ingen mega/ingress");
  if (r) console.log(`   → nedstrek ${r.anslattNedstrek} vs ingress ${r.ingressTopp}  ${r.anslattNedstrek > r.ingressTopp ? "KOLLISJON " + (r.anslattNedstrek - r.ingressTopp) + " px" : "ok"}`);
}
await b.close();
