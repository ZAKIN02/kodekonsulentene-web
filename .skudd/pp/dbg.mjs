import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto("http://127.0.0.1:4491/", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => {
  const els = [...document.querySelectorAll("[data-scenefilm]")];
  return els.map((e, i) => ({ i, maske: getComputedStyle(e).getPropertyValue("--maske").trim(),
    vend: e.hasAttribute("data-vend"),
    src: (e.querySelector("video")?.currentSrc || "").split("/").pop(),
    kilder: [...e.querySelectorAll("source")].map(s => (s.dataset.bred||"").split("/").pop()) }));
}));
await b.close();
