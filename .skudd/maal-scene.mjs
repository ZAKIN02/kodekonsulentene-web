import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
await p.goto("http://127.0.0.1:4581/lab/interaksjon", { waitUntil: "networkidle" });
await p.locator("[data-stabel]").first().scrollIntoViewIfNeeded();
await p.waitForTimeout(600);
await p.evaluate(() => { const s=document.querySelector("[data-stabel-spak]"); s.value="100"; s.dispatchEvent(new Event("input",{bubbles:true})); });
await p.waitForTimeout(400);
console.log(await p.evaluate(() => {
  const r = (s) => { const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
  // Faktisk blekk: platene og etikettene, ikke beholderen.
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const e of document.querySelectorAll(".stabel__plate, .stabel__merke")) {
    const b=e.getBoundingClientRect();
    if (b.width<2||b.height<2) continue;
    x0=Math.min(x0,b.x); y0=Math.min(y0,b.y); x1=Math.max(x1,b.right); y1=Math.max(y1,b.bottom);
  }
  return { scene: r("[data-stabel-scene]"), kontroll: r(".stabel__kontroll"),
           blekk: {x:Math.round(x0),y:Math.round(y0),w:Math.round(x1-x0),h:Math.round(y1-y0)} };
}));
await b.close();
