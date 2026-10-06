import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".teaser").scrollIntoView({ block: "center" }));
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => {
  const el = document.querySelector(".teaser");
  const v = el.querySelector("video");
  const s = v.querySelector("source");
  const r = el.getBoundingClientRect();
  return {
    filmAttr: el.dataset.film ?? null,
    srcSatt: s.getAttribute("src"),
    readyState: v.readyState,
    duration: v.duration,
    currentTime: v.currentTime,
    rectTop: Math.round(r.top), rectH: Math.round(r.height), vindu: window.innerHeight,
    beregnetAndel: Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height))),
  };
}), null, 1));
await b.close();
