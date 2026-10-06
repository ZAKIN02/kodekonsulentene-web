import { chromium } from "@playwright/test";
const b = await chromium.launch();
const c1 = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark", javaScriptEnabled:false });
const p1 = await c1.newPage();
await p1.goto("http://127.0.0.1:4399/", { waitUntil:"domcontentloaded" });
const s = await p1.locator("[data-sammenlign]").first();
console.log("UTEN JS – sammenligning finnes:", await s.count());
console.log("  tekstinnhold:", (await s.textContent())?.replace(/\s+/g," ").trim().slice(0,200));
await c1.close();

const c2 = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark", reducedMotion:"reduce" });
const p2 = await c2.newPage();
await p2.goto("http://127.0.0.1:4399/", { waitUntil:"networkidle" });
await p2.waitForTimeout(1500);
console.log("REDUSERT – elementer under 0,9 opasitet:");
for (const r of await p2.evaluate(() => {
  const ut = [];
  for (const e of document.querySelectorAll(".scene__inner *")) {
    const cs = getComputedStyle(e);
    if (parseFloat(cs.opacity) < 0.9 && e.offsetHeight > 0 && (e.textContent||"").trim())
      ut.push({ k: e.className?.toString().slice(0,40), o: cs.opacity, t: e.textContent.trim().slice(0,40) });
  }
  return ut;
})) console.log("   ", JSON.stringify(r));
await c2.close();
await b.close();
