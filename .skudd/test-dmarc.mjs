import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(process.argv[2] + "/verktoy/dmarc", { waitUntil: "networkidle" });
const f = p.locator('input[type="text"], input[type="url"], input[type="search"]').first();
await f.fill("nkom.no"); await f.press("Enter");
await p.locator("#resultat .kk-report").first().waitFor({ state: "visible", timeout: 90000 });
console.log("  " + (await p.locator("#resultat").innerText()).split("\n").filter(Boolean).slice(0, 7).join(" | "));
await b.close();
