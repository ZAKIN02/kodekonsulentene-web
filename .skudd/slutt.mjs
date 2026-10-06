import { chromium } from "@playwright/test";
const b = await chromium.launch();
// 404 uten JS, siste kontroll etter dedupliseringen
const u = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
const pu = await u.newPage();
await pu.goto("http://127.0.0.1:4813/finnes-ikke", { waitUntil: "domcontentloaded" });
const lenker = await pu.locator(".fire-null__ut a").allInnerTexts();
console.log("404 uten JS – lenker:", lenker.join(", "));
console.log("  duplikater:", lenker.length !== new Set(lenker).size ? "JA" : "nei");
await pu.screenshot({ path: ".skudd/404-utenjs.png" });
await u.close();
// Redusert bevegelse
const r = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
const pr = await r.newPage();
await pr.goto("http://127.0.0.1:4813/", { waitUntil: "networkidle" });
await pr.keyboard.press("~"); await pr.waitForTimeout(300);
const t0 = Date.now();
await pr.fill(".kkterm__in", "dmarc nkom.no"); await pr.press(".kkterm__in", "Enter");
await pr.waitForTimeout(6000);
console.log("\nredusert bevegelse – rapport kom:", /dmarc/.test(await pr.locator(".kkterm__out").innerText()));
await r.close();
await b.close();
