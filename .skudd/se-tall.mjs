import { chromium } from "playwright";
const [url, ut, bredde] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +bredde, height: 1000 } });
await p.goto(url, { waitUntil: "networkidle" });
const el = await p.$(".nokkeltall");
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(1600);
const r = await el.boundingBox();
await p.screenshot({ path: ut, clip: { x: 0, y: r.y - 30, width: +bredde, height: r.height + 60 } });
// Dødt gap mellom tallets blekk og etikettens venstrekant, per felt.
console.log(await p.evaluate(() => [...document.querySelectorAll(".nokkeltall__post")].map((li) => {
  const v = li.querySelector(".nokkeltall__verdi"), m = li.querySelector(".nokkeltall__merke");
  const rv = document.createRange(); rv.selectNodeContents(v);
  const a = [...rv.getClientRects()].pop(), bq = m.getBoundingClientRect();
  return { tall: v.textContent.trim(), gapPx: Math.round(bq.top - a.bottom) };
})));
await b.close();
