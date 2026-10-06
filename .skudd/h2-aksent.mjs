/** Lander klippets poeng - den limegroenne linjen - innenfor det baandet masken
 *  faktisk viser? Et klipp der aksenten ligger under masken forteller ingenting. */
import { chromium } from "playwright";
import { PNG } from "pngjs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 850 }, colorScheme: "dark" });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const g = await p.evaluate(() => { const e = document.querySelector(".scenefilm-ramme"); const r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
let best = 0, bestAndel = 0;
for (let i = 0; i <= 8; i++) {
  const y = g.top - 400 + (g.h + 600) * (i / 8);
  await p.evaluate(v => scrollTo(0, Math.max(0, v)), Math.round(y));
  await p.waitForTimeout(380);
  const im = PNG.sync.read(await p.screenshot());
  let lime = 0, tot = 0;
  for (let k = 0; k < im.data.length; k += 4) {
    const r = im.data[k], gg = im.data[k+1], bb = im.data[k+2];
    tot++;
    // limegroenn #c8f24a: groenn dominerer klart over blaa og roed er hoy
    if (gg > 110 && gg - bb > 45 && gg - r > 18) lime++;
  }
  const andel = lime / tot * 100;
  if (lime > best) { best = lime; bestAndel = andel; }
  console.log(`  ramme ${i}: ${lime} limepiksler (${andel.toFixed(3)} % av skjermen)`);
}
console.log(best > 400 ? `  aksenten er synlig (topp ${best} piksler)` : `  AKSENTEN NAAR ALDRI FRAM (topp ${best} piksler)`);
await b.close();
