import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ javaScriptEnabled: false, colorScheme: "dark" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4399/verktoy", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(() => {
  const ut = [];
  for (const e of document.querySelectorAll(".avslor, .stortekst .ord, .mega .ord")) {
    const r = e.getBoundingClientRect();
    if (!(r.bottom > 0 && r.top < innerHeight && r.width > 0)) continue;
    const op = parseFloat(getComputedStyle(e).opacity);
    if (op < 0.95) ut.push({ kl: e.className, tekst: (e.textContent||"").trim().slice(0,30),
                             top: Math.round(r.top), bottom: Math.round(r.bottom), vindu: innerHeight, op });
  }
  return ut;
}), null, 1));
await b.close();
