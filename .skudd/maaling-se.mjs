import { chromium } from "playwright";
const [url, ut, bredde, tema] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +bredde, height: 1000 }, colorScheme: tema ?? "dark" });
const p = await ctx.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(url, { waitUntil: "networkidle" });
const el = await p.$(".foreroget");
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(1400);
const r = await el.boundingBox();
await p.screenshot({ path: ut, clip: { x: 0, y: r.y - 24, width: +bredde, height: r.height + 48 } });
// Bekreft at stolpene faktisk er malt, ikke bare erklaert.
const bredder = await p.evaluate(() =>
  [...document.querySelectorAll(".foreroget__fyll")].map((e) => Math.round(e.getBoundingClientRect().width)));
console.log("stolpebredder:", JSON.stringify(bredder), "| konsollfeil:", feil.length || "ingen");
await b.close();
