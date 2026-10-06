import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("" + (process.argv[2] || "https://www.epic.net/en/") + "", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  let bakgrunnsbilder = 0, canvas = 0, svg = 0, video = 0, img = 0;
  const skrifter = new Set();
  for (const el of document.querySelectorAll("*")) {
    const c = getComputedStyle(el); const q = el.getBoundingClientRect();
    if (q.width * q.height > 50000 && c.backgroundImage && c.backgroundImage !== "none") bakgrunnsbilder++;
    if (el.tagName === "CANVAS") canvas++;
    if (el.tagName.toLowerCase() === "svg" && q.width > 100) svg++;
    if (el.tagName === "VIDEO") video++;
    if (el.tagName === "IMG") img++;
    if (q.height > 10) skrifter.add(c.fontFamily.split(",")[0].replace(/["']/g, ""));
  }
  return { bakgrunnsbilder, canvas, svg, video, img, skrifter: [...skrifter].slice(0, 6) };
});
console.log(JSON.stringify(r));
await b.close();
