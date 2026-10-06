import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4399/historie", { waitUntil:"networkidle" });
await p.waitForTimeout(1500);
const t = p.locator(".hist__kort .body-lg").first();
await t.scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p.screenshot({ path: ".skudd/bevis-uten-skjul.png" });
console.log(JSON.stringify(await p.evaluate(() => {
  const kort = document.querySelector(".hist__kort");
  const media = document.querySelector(".hist__media");
  const scener = document.querySelector(".hist__scener");
  const g = (e,n) => { const c = getComputedStyle(e); const r = e.getBoundingClientRect();
    return { n, z: c.zIndex, pos: c.position, bg: c.backgroundColor,
             rect: [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)] }; };
  return { kort: g(kort,"kort"), media: g(media,"media"), scener: g(scener,"scener"),
           synligTekst: kort.innerText.trim().slice(0,40) };
}), null, 1));
await ctx.close(); await b.close();
