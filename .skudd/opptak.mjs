/**
 * Tar opp det ekte verktøyet mens det kjører mot en ekte side.
 * Dette er hero-materialet: ikke en generisk render, men produktet som virker.
 */
import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  recordVideo: { dir: ".skudd/opptak", size: { width: 1600, height: 1000 } },
});
const p = await ctx.newPage();
await p.goto("https://kodekonsulentene.no/sjekk", { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(1500);
// Skriv adressen tegn for tegn – det leses som noen som faktisk bruker verktøyet.
await p.click("#url-sjekk");
for (const t of "nkom.no") { await p.type("#url-sjekk", t, { delay: 90 }); }
await p.waitForTimeout(400);
await p.keyboard.press("Enter");
// La rapporten komme inn og bli stående.
await p.waitForSelector(".kk-report", { timeout: 40000 });
await p.waitForTimeout(3500);
await ctx.close();
await b.close();
console.log("opptak ferdig");
