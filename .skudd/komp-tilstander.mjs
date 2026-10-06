import { chromium } from "@playwright/test";
const b = await chromium.launch();

// --- uten JavaScript ---
const c1 = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark", javaScriptEnabled:false });
const p1 = await c1.newPage();
await p1.goto("http://127.0.0.1:4399/", { waitUntil:"domcontentloaded" });
console.log("UTEN JS:");
console.log("  h1:", await p1.locator("h1").count());
console.log("  scener:", await p1.locator("section.scene").count());
console.log("  nøkkeltall:", await p1.locator(".nokkeltall__verdi").count(), "verdier:",
  (await p1.locator(".nokkeltall__verdi").allTextContents()).join(" · "));
console.log("  lagstabel-lag:", await p1.locator("[data-stabel] .stabel__plate").count());
console.log("  sammenligning-rader:", await p1.locator("[data-sammenlign] [class*=rad], [data-sammenlign] li, [data-sammenlign] tr").count());
console.log("  prisekort:", await p1.locator(".kk-price").count());
console.log("  Mega-tekst:", (await p1.locator(".mega").first().textContent())?.trim());
console.log("  hero live-linje:", (await p1.locator(".hero__live").textContent())?.trim().slice(0,60));
await p1.screenshot({ path:".skudd/komp-utenjs.png", fullPage:false });
await c1.close();

// --- redusert bevegelse ---
const c2 = await b.newContext({ viewport:{width:1440,height:900}, colorScheme:"dark", reducedMotion:"reduce" });
const p2 = await c2.newPage();
await p2.goto("http://127.0.0.1:4399/", { waitUntil:"networkidle" });
await p2.waitForTimeout(1500);
const skjult = await p2.evaluate(() => {
  let n = 0;
  for (const e of document.querySelectorAll(".scene__inner *")) {
    const cs = getComputedStyle(e);
    if (parseFloat(cs.opacity) < 0.9 && e.offsetHeight > 0 && (e.textContent||"").trim()) n++;
  }
  return n;
});
console.log("REDUSERT BEVEGELSE:");
console.log("  elementer under 0,9 opasitet med tekst:", skjult);
console.log("  videoer som spiller:", await p2.evaluate(() =>
  [...document.querySelectorAll("video")].filter(v => !v.paused).length));
await c2.close();
await b.close();
