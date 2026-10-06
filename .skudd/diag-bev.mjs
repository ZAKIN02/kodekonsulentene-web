import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:4860/lab/bevegelse", { waitUntil: "networkidle" });
const r = await p.evaluate(() => {
  const ut = { stotter: CSS.supports("animation-timeline: view()") };
  for (const v of ["avslor--opp", "avslor--skjev", "avslor--dybde", "pekerkort"]) {
    const el = document.querySelector("." + v);
    if (!el) { ut[v] = "MANGLER I DOM"; continue; }
    const c = getComputedStyle(el);
    ut[v] = { navn: c.animationName, range: c.animationRange, tidslinje: c.animationTimeline, fyll: c.animationFillMode };
  }
  ut.interaksjonLastet = [...document.styleSheets].some((s) => {
    try { return [...s.cssRules].some((r2) => r2.cssText.includes("avslor-skjev")); } catch { return false; }
  });
  return ut;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
