import { chromium } from "playwright";
const b = await chromium.launch();
// Slik ekte Cmd+ virker: CSS-visningsvinduet KRYMPER, pikseltettheten øker.
for (const [w, dsf, navn] of [[1512,1,"100%"],[1210,1.25,"125%"],[1008,1.5,"150%"],[864,1.75,"175%"],[756,2,"200%"],[605,2.5,"250%"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: dsf });
  await p.goto("http://127.0.0.1:4701/systemer", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    let m = 0; for (const el of document.querySelectorAll(".mega")) {
      const rg = document.createRange(); rg.selectNodeContents(el);
      for (const l of rg.getClientRects()) m = Math.max(m, l.right - innerWidth, -l.left);
    } return Math.round(m);
  });
  console.log(`  ${navn.padEnd(5)} (${w} CSS-px): ${r > 0 ? "+" + r + "px" : "ok"}`);
  await p.close();
}
await b.close();
