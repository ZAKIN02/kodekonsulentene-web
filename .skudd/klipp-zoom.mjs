import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, z] of [[1512, 1], [1210, 1.25], [1008, 1.5], [756, 2]]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: z });
  await p.goto("https://kodekonsulentene.no/systemer", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    let m = 0, tekst = "";
    for (const el of document.querySelectorAll(".mega")) {
      const rg = document.createRange(); rg.selectNodeContents(el);
      for (const l of rg.getClientRects()) if (l.right - innerWidth > m) { m = l.right - innerWidth; tekst = el.textContent.trim().slice(0,30); }
    }
    return { over: Math.round(m), tekst };
  });
  console.log(`  ${w}px zoom ${z}: +${r.over}px  «${r.tekst}»`);
  await p.close();
}
await b.close();
