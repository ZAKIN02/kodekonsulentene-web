import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
await p.goto("https://kodekonsulentene.no/", { waitUntil: "networkidle" });
await p.waitForTimeout(800);
await p.keyboard.press("~");
await p.waitForTimeout(600);
console.log(await p.evaluate(() => {
  const d = document.querySelector(".kkterm");
  if (!d) return "ingen .kkterm";
  const r = d.getBoundingClientRect();
  const inn = d.querySelector("input, [contenteditable]");
  return { boks: {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
           harInput: !!inn, innTag: inn?.tagName };
}));
await b.close();
