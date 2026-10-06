import { chromium } from "@playwright/test";
const sider = ["nettsider","systemer","sikkerhet","priser","caser","om","handbok",
               "status","verktoy","bransjer/handverkere","bransjer/klinikker","apper-og-ai"];
const b = await chromium.launch();

// Uten JavaScript: avdekkingen er ren CSS (animation-timeline: view()), så den
// virker fortsatt. Vi sjekker derfor bare at det som ER i syne, er synlig – og
// at innholdet blir synlig når man scroller gjennom hele siden.
let feil = 0;
let ctx = await b.newContext({ javaScriptEnabled: false, colorScheme: "dark" });
for (const s of sider) {
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/" + s, { waitUntil: "domcontentloaded" });
  // Scroll gjennom hele siden, så alt har vært i syne.
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= H; y += 400) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(40); }
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(200);
  const d = await p.evaluate(() => {
    const iSyne = (e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
    const kand = [...document.querySelectorAll(".avslor, .stortekst .ord, .mega .ord")].filter(iSyne);
    return {
      h1: document.querySelectorAll("h1").length,
      iSyne: kand.length,
      skjult: kand.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.95).length,
      tekst: document.body.innerText.trim().length,
    };
  });
  const ok = d.h1 === 1 && d.skjult === 0 && d.tekst > 400;
  if (!ok) { feil++; console.log(`UTEN JS  ${s}: h1=${d.h1} i syne=${d.iSyne} skjult=${d.skjult} tegn=${d.tekst}  FEIL`); }
  await p.close();
}
await ctx.close();
console.log(`uten JS: ${sider.length - feil}/${sider.length} ok`);
await b.close();

// Redusert bevegelse
{
  const b2 = await chromium.launch();
  const c = await b2.newContext({ reducedMotion: "reduce", colorScheme: "dark" });
  let f = 0;
  for (const s of sider) {
    const p = await c.newPage();
    await p.goto("http://127.0.0.1:4399/" + s, { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    const d = await p.evaluate(() => ({
      skjult: [...document.querySelectorAll(".avslor, .stortekst .ord, .mega .ord")]
        .filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.95).length,
      spiller: [...document.querySelectorAll("video")].filter((v) => !v.paused).length,
    }));
    if (d.skjult || d.spiller) { f++; console.log(`REDUSERT ${s}: skjult=${d.skjult} spiller=${d.spiller} FEIL`); }
    await p.close();
  }
  console.log(`redusert bevegelse: ${sider.length - f}/${sider.length} ok`);
  await b2.close();
}
