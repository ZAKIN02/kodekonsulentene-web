import { chromium } from "@playwright/test";
const ut = process.argv[2], base = "https://kodekonsulentene.no";
const b = await chromium.launch();
const feil = [];
for (const [merke, w, h, mork] of [["desktop", 1440, 900, true], ["mobil", 390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: mork ? "dark" : "light" });
  const p = await ctx.newPage();
  p.on("console", (m) => m.type() === "error" && feil.push(merke + ": " + m.text()));
  await p.goto(base + "/", { waitUntil: "networkidle", timeout: 45000 });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `${ut}/f-${merke}-1.png` });
  await p.evaluate(() => document.querySelector(".teaser")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${ut}/f-${merke}-2.png` });
  await ctx.close();
}
await b.close();
console.log("konsollfeil:", feil.length ? feil : "ingen");
