/** MEN-HALVSYNLIG: teller innhold som blir STÅENDE halvgjennomsiktig mens
 *  brukeren ikke rører noe. Måler både dagens avslutningspunkt og et kandidat-
 *  punkt, ved å injisere en overstyring – ingen fil endres av målingen.
 *  Bruk: node .skudd/men-halvsynlig.mjs [slutt-prosent]
 */
import { chromium } from "playwright";
const SLUTT = process.argv[2];
const SIDER = ["/", "/systemer", "/nettsider", "/priser", "/om", "/status", "/sikkerhet", "/handbok", "/caser", "/kontakt"];
const b = await chromium.launch();
let sum = 0, verst = 1;
for (const h of [800, 900, 1080]) {
  const p = await b.newPage({ viewport: { width: 1280, height: h } });
  for (const sti of SIDER) {
    await p.goto("http://localhost:4877" + sti, { waitUntil: "load", timeout: 60000 });
    if (SLUTT) await p.addStyleTag({ content:
      `@supports (animation-timeline: view()){.avslor{animation-range: entry calc(8% + min(var(--trinn,0),4) * 6%) entry calc(${SLUTT}% + min(var(--trinn,0),4) * 5%) !important}}` });
    await p.waitForTimeout(1800);
    const r = await p.evaluate(() => [...document.querySelectorAll(".avslor")]
      .map((e) => ({ o: +getComputedStyle(e).opacity, t: (e.textContent||"").trim().slice(0,30) }))
      .filter((x) => x.o > 0.001 && x.o < 0.99));
    if (r.length) {
      sum += r.length;
      for (const x of r) { verst = Math.min(verst, x.o); console.log(`  ${h}px ${sti.padEnd(12)} opasitet ${x.o.toFixed(2)}  «${x.t}»`); }
    }
  }
  await p.close();
}
console.log(`\n  slutt=${SLUTT || "dagens 80%"}  halvsynlige i ro: ${sum}  laveste opasitet: ${verst.toFixed(2)}`);
await b.close();
