import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4402/", { waitUntil: "domcontentloaded" });
const foer = await p.evaluate(() => { const i = document.querySelector(".topbar__logo img"); return [i.width, i.height]; });
await p.waitForLoadState("networkidle");
const etter = await p.evaluate(() => { const i = document.querySelector(".topbar__logo img"); const r = i.getBoundingClientRect(); return [Math.round(r.width*10)/10, Math.round(r.height*10)/10]; });
console.log("  attributt:", foer.join("x"), " malt:", etter.join("x"), " avvik:", (etter[0]-foer[0]).toFixed(1), "px");
await b.close();
