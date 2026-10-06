import { chromium } from "@playwright/test";
const b = await chromium.launch();
const c1 = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark", javaScriptEnabled:false });
const p1 = await c1.newPage();
await p1.goto("http://127.0.0.1:4399/", { waitUntil:"domcontentloaded" });
const s = p1.locator("[data-slep]").first();
console.log("UTEN JS – sammenligning:", await p1.locator("[data-slep]").count(), "stk");
console.log("  innhold:", (await s.textContent())?.replace(/\s+/g," ").trim().slice(0,230));
await c1.close();

const c2 = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark", reducedMotion:"reduce" });
const p2 = await c2.newPage();
await p2.goto("http://127.0.0.1:4399/", { waitUntil:"networkidle" });
await p2.waitForTimeout(1600);
const lav = await p2.evaluate(() => {
  const ut = [];
  for (const e of document.querySelectorAll(".scene__inner *")) {
    const cs = getComputedStyle(e);
    if (parseFloat(cs.opacity) < 0.9 && e.offsetHeight > 0 && (e.textContent||"").trim())
      ut.push({ klasse: (e.className||"").toString().slice(0,42), opasitet: cs.opacity, tekst: e.textContent.trim().slice(0,38) });
  }
  return ut;
});
console.log("REDUSERT BEVEGELSE – under 0,9 opasitet:", lav.length);
for (const r of lav) console.log("   ", JSON.stringify(r));
await c2.close();
await b.close();
