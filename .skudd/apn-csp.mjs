import { chromium } from "playwright";
const b = await chromium.launch();
for (const [navn, opt] of [["normalt", {}], ["redusert", { reducedMotion: "reduce" }]]) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opt });
  const p = await c.newPage();
  const brudd = [], feil = [];
  await p.addInitScript(() => { addEventListener("securitypolicyviolation", e => (window.__b ||= []).push(e.violatedDirective + " " + (e.blockedURI||"inline"))); });
  p.on("pageerror", e => feil.push(e.message.slice(0,90)));
  p.on("console", m => m.type()==="error" && feil.push(m.text().slice(0,90)));
  await p.goto("http://127.0.0.1:4861/", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const v = await p.evaluate(() => window.__b || []);
  const synlig = await p.evaluate(() => {
    const e = document.querySelector("[data-apning-flate]");
    if (!e) return "finnes ikke";
    if (e.hasAttribute("hidden")) return "hidden";
    const cs = getComputedStyle(e);
    return `display:${cs.display} opacity:${cs.opacity} visibility:${cs.visibility}`;
  });
  console.log(`  ${navn.padEnd(9)} CSP-brudd:${v.length ? v.join("|") : "0"}  feil:${feil.length?feil[0]:"0"}  apning: ${synlig}`);
  await c.close();
}
await b.close();
