import { chromium } from "playwright";
const b = await chromium.launch();
for (const sti of ["/kontakt", "/kontakt?sendt=1", "/status", "/handbok"]) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const brudd = [];
  await p.addInitScript(() => { addEventListener("securitypolicyviolation", (e) => (window.__b ??= []).push(e.violatedDirective + " " + e.blockedURI)); });
  await p.goto("http://127.0.0.1:4441" + sti, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  console.log(sti.padEnd(20), "CSP-brudd:", (await p.evaluate(() => window.__b ?? [])).length || "ingen");
  await p.close();
}
await b.close();
