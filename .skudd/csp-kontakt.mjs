import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const csp = [];
p.on("console", (m) => { if (/Content Security Policy/i.test(m.text())) csp.push(m.text().slice(0, 130)); });
for (const sti of ["/kontakt", "/", "/sjekk"]) {
  csp.length = 0;
  await p.goto("http://127.0.0.1:4399" + sti, { waitUntil: "networkidle" }).catch(()=>{});
  await p.waitForTimeout(900);
  console.log(sti, "→", csp.length, "CSP-brudd");
  csp.slice(0,2).forEach(c => console.log("   ", c));
}
await b.close();
