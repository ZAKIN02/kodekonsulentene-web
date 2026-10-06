import { chromium } from "playwright";
const [base, side] = process.argv.slice(2);
const b = await chromium.launch();
const funn = [];
for (const w of [900,1000,1100,1200,1280,1366,1440,1512,1600,1680,1728,1800,1920,2000,2200,2560,2880,3000]) {
  for (const h of [700, 900]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(base + side, { waitUntil: "networkidle" });
    const r = await p.evaluate(() => {
      let m = 0, tekst = "";
      for (const el of document.querySelectorAll(".mega")) {
        const rg = document.createRange(); rg.selectNodeContents(el);
        for (const l of rg.getClientRects()) {
          const over = Math.max(l.right - innerWidth, -l.left);
          if (over > m) { m = over; tekst = el.textContent.trim().slice(0, 40); }
        }
      }
      return { over: Math.round(m), tekst, mega: getComputedStyle(document.querySelector(".mega")).fontSize };
    });
    if (r.over > 0) funn.push(`  ${w}x${h}: +${r.over}px  (${r.mega})  «${r.tekst}»`);
    await p.close();
  }
}
console.log(funn.length ? funn.join("\n") : "  ingen klipping på noen bredde");
await b.close();
