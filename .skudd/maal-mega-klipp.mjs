/**
 * Måler om Mega-teksten stikker utenfor sin egen boks.
 *
 * overflow-x: clip holder scrollWidth lik clientWidth, så vanlige overflytstester
 * melder grønt mens teksten klippes stille bort. Derfor måles linjeboksene fra
 * Range, ikke elementets scrollWidth.
 */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const BREDDER = [1280, 1440, 1680, 2000];
const b = await chromium.launch();
let verst = 0;
for (const bredde of BREDDER) {
  const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
  for (const s of sider) {
    await p.goto(base + s, { waitUntil: "networkidle" });
    const over = await p.evaluate(() => {
      let m = 0;
      for (const el of document.querySelectorAll(".mega")) {
        const boks = el.getBoundingClientRect();
        const r = document.createRange();
        r.selectNodeContents(el);
        for (const linje of r.getClientRects()) {
          // Mot BÅDE elementets boks og skjermkanten. overflow-x: clip gjør at
          // scrollWidth aldri avslører noen av delene.
          m = Math.max(m, linje.right - boks.right, boks.left - linje.left,
                          linje.right - window.innerWidth, -linje.left);
        }
      }
      return Math.round(m);
    });
    if (over > 0) { console.log(`  ${bredde}px ${s}: +${over}px utenfor`); verst = Math.max(verst, over); }
  }
  await p.close();
}
console.log(verst === 0 ? "  ingen klipping" : `  verst: +${verst}px`);
await b.close();
