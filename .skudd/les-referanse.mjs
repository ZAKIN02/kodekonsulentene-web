import { chromium } from "playwright";
const [url, ut] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(2500);
const m = await p.evaluate(() => {
  const farger = new Map(), skrift = new Set(), animer = new Set();
  let video = 0, bilder = 0, transform = 0;
  for (const el of document.querySelectorAll("*")) {
    const c = getComputedStyle(el), r = el.getBoundingClientRect();
    if (r.width * r.height > 2000) {
      for (const k of ["backgroundColor", "color"]) {
        const v = c[k];
        if (v && !/rgba\(0, 0, 0, 0\)/.test(v)) farger.set(v, (farger.get(v) || 0) + 1);
      }
    }
    skrift.add(c.fontSize);
    if (c.animationName !== "none") animer.add(c.animationName);
    if (c.transform !== "none") transform++;
    if (el.tagName === "VIDEO") video++;
    if (el.tagName === "IMG" && r.width > 150) bilder++;
  }
  return { unikeSkriftstorrelser: skrift.size,
           toppfarger: [...farger.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([f,n])=>`${f} x${n}`),
           animasjoner: animer.size, transformerte: transform, video, storeBilder: bilder,
           hoyde: document.documentElement.scrollHeight };
});
console.log(JSON.stringify(m, null, 1).replace(/^/gm, "  "));
await p.screenshot({ path: ut, fullPage: false });
await b.close();
