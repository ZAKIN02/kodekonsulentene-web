import { chromium } from "@playwright/test";
const ut = process.argv[2];
const b = await chromium.launch();
const sider = [["forside", "/"], ["historie", "/historie"], ["priser", "/priser"]];
for (const [navn, sti] of sider) {
  for (const [merke, w, h] of [["desktop", 1440, 900], ["mobil", 390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto("https://kodekonsulentene.no" + sti, { waitUntil: "networkidle", timeout: 45000 });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${ut}/${navn}-${merke}.png`, fullPage: merke === "desktop" && navn !== "historie" });
    await p.close();
  }
}
await b.close();
console.log("ferdig");
