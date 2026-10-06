import { chromium, devices } from "playwright";
const b = await chromium.launch();
for (const [navn, opt] of [["mobil 412", { ...devices["Pixel 7"] }], ["smal 640", { viewport: { width: 640, height: 900 } }], ["skrivebord", { viewport: { width: 1440, height: 900 } }]]) {
  const c = await b.newContext(opt); const p = await c.newPage();
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  const f = p.locator("[data-slep-flate]").first();
  await f.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const h = document.querySelector(".interaksjon-hint");
    const inp = document.querySelector('input[type="range"]');
    const fl = document.querySelector("[data-slep-flate]");
    return { hint: h ? getComputedStyle(h).display !== "none" && h.getBoundingClientRect().height > 0 : false,
             hintTekst: h?.textContent?.trim().slice(0, 40) ?? "",
             spak: inp ? inp.getBoundingClientRect().height > 0 : false,
             kolonner: getComputedStyle(fl).gridTemplateColumns };
  });
  console.log(`  ${navn.padEnd(11)} hint:${r.hint ? "SYNLIG" : "skjult"}  spak:${r.spak ? "synlig" : "skjult"}  kolonner:${r.kolonner}`);
  if (r.hint) console.log(`              «${r.hintTekst}»`);
  await c.close();
}
await b.close();
