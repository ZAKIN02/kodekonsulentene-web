/** CSP-brudd per side, med ferskt bygg bak serveren. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const s of sider) {
  const p = await b.newPage();
  const brudd = [];
  await p.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) =>
      (window.__brudd ??= []).push(e.violatedDirective + " " + (e.sourceFile||"").slice(-40)));
  });
  p.on("console", (m) => m.type() === "error" && brudd.push("konsoll: " + m.text().slice(0, 90)));
  await p.goto(base + s, { waitUntil: "networkidle" }).catch(()=>{});
  await p.waitForTimeout(600);
  const v = await p.evaluate(() => window.__brudd ?? []);
  if (v.length || brudd.length) console.log(`  ${s}: ${[...v, ...brudd].join(" | ")}`);
  await p.close();
}
console.log("  ferdig");
await b.close();
