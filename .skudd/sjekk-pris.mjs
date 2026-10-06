import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const p = await c.newPage();
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const r = await p.evaluate(() => {
  const ut = [];
  for (const el of document.querySelectorAll("*")) {
    const t = el.textContent?.trim() ?? "";
    if (el.children.length || !/\d[\d\s]*kr|Sjekk gratis/.test(t)) continue;
    const q = el.getBoundingClientRect();
    ut.push({ tekst: t.slice(0, 32), hoyre: Math.round(q.right), utenfor: Math.round(Math.max(0, q.right - 390)) });
  }
  return ut.slice(0, 6);
});
for (const x of r) console.log(`  «${x.tekst}»  hoeyrekant ${x.hoyre}px  ${x.utenfor ? "KLIPPET +" + x.utenfor : "hel"}`);
await b.close();
