import { firefox } from "@playwright/test";
import { readFileSync } from "node:fs";
const b = await firefox.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.addInitScript({ content: readFileSync("node_modules/scroll-timeline-polyfill/dist/scroll-timeline.js","utf8") });
await p.goto("http://127.0.0.1:4399/lab/bibliotek", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => {
  const e = document.querySelectorAll(".maalekort")[2];
  const cs = getComputedStyle(e);
  return {
    animationName: cs.animationName,
    animationTimeline: cs.animationTimeline || "(ikke eksponert)",
    animationRange: cs.animationRange || "(ikke eksponert)",
    antallAnimasjoner: e.getAnimations ? e.getAnimations().length : "getAnimations mangler",
    polyfillGlobaler: ["ScrollTimeline","ViewTimeline"].filter(k => k in window),
  };
}), null, 1));
await b.close();
