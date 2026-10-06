import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const s of sider) {
  const p = await b.newPage();
  const brudd = [];
  await p.addInitScript(() => { addEventListener("securitypolicyviolation", (e) => (window.__b ||= []).push(e.violatedDirective + " " + e.blockedURI)); });
  await p.goto(base + s, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const v = await p.evaluate(() => window.__b || []);
  console.log(`  ${s.padEnd(14)} ${v.length ? "BRUDD: " + v.slice(0,3).join(" | ") : "0 brudd"}`);
  await p.close();
}
await b.close();
