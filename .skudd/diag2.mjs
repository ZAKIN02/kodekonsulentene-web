import { chromium } from "@playwright/test";
const b = await chromium.launch();
// 1) /historie: hva er faktisk bak ingressen?
let ctx = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark" });
let p = await ctx.newPage();
await p.goto("http://127.0.0.1:4399/historie", { waitUntil:"networkidle" });
await p.waitForTimeout(1800);
console.log("historie:", JSON.stringify(await p.evaluate(() => {
  const t = document.querySelector(".hist__kort .body-lg");
  t.scrollIntoView({block:"center"});
  const k = t.closest(".hist__kort");
  const cs = getComputedStyle(k);
  return { kortBg: cs.backgroundColor, kortOpacity: cs.opacity, backdrop: cs.backdropFilter,
           aktiv: document.querySelector(".hist").hasAttribute("data-aktiv"),
           animasjon: getComputedStyle(k).animationName };
}), null, 1));
await ctx.close();
// 2) hero mobil: hva ligger i h1-boksen?
ctx = await b.newContext({ viewport:{width:412,height:915}, colorScheme:"dark" });
p = await ctx.newPage();
await p.goto("http://127.0.0.1:4399/", { waitUntil:"networkidle" });
await p.waitForTimeout(1500);
console.log("hero mobil:", JSON.stringify(await p.evaluate(() => {
  const h = document.querySelector(".hero h1");
  const r = h.getBoundingClientRect();
  const traff = [];
  for (const el of document.querySelectorAll("body *")) {
    const e = el.getBoundingClientRect();
    if (e.width && e.height && e.left < r.right && e.right > r.left && e.top < r.bottom && e.bottom > r.top) {
      const c = getComputedStyle(el).color;
      if ((el.textContent||"").trim() && el.children.length === 0)
        traff.push({ tag: el.tagName, kl: el.className.toString().slice(0,30), farge: c, iHero: Boolean(el.closest(".hero")) });
    }
  }
  return { h1: [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)], overlapp: traff.slice(0,6) };
}), null, 1));
await ctx.close(); await b.close();
