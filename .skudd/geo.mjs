import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".teaser")?.scrollIntoView({ block: "center" }));
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => {
  const g = (sel) => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const r = e.getBoundingClientRect(), c = getComputedStyle(e);
    return { rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
             zIndex: c.zIndex, position: c.position, bg: c.backgroundImage.slice(0, 60), opacity: c.opacity };
  };
  return { teaser: g(".teaser"), img: g(".teaser img"), slor: g(".teaser__slor"), tekst: g(".teaser__tekst") };
}), null, 1));
await b.close();
