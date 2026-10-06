import { chromium } from "@playwright/test";
const ut = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const p = await ctx.newPage();
await p.goto("https://kodekonsulentene.no/", { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(1000);
await p.screenshot({ path: `${ut}/forside-morkt-folden.png` });
await p.goto("https://kodekonsulentene.no/historie", { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(2500);
await p.screenshot({ path: `${ut}/historie-morkt-topp.png` });
// midt i historien
await p.evaluate(() => { const e = document.querySelector("[data-story]"); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + e.offsetHeight * 0.45); });
await p.waitForTimeout(1800);
await p.screenshot({ path: `${ut}/historie-morkt-midt.png` });
await b.close();
console.log("ok");
