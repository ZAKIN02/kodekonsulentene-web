import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
console.log(await p.evaluate(() => {
  const sc = document.querySelectorAll(".scene")[2];
  const cs = getComputedStyle(sc), f = getComputedStyle(sc, "::before");
  return {
    scene_vtn: cs.viewTimelineName, scene_h: sc.getBoundingClientRect().height,
    før_timeline: f.animationTimeline, før_anim: f.animationName, før_range: f.animationRange, før_transform: f.transform,
    støtte_vtn: CSS.supports("view-timeline-name: --x"),
  };
}));
await b.close();
