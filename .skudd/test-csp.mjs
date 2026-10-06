import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
const feil = [];
p.on("console", (m) => { if (m.type() === "error") feil.push("konsoll: " + m.text().slice(0, 120)); });
p.on("pageerror", (e) => feil.push("pageerror: " + String(e).slice(0, 120)));
await p.addInitScript(() => {
  addEventListener("securitypolicyviolation", (e) =>
    console.error("CSP blokkerte: " + e.violatedDirective + " " + (e.blockedURI || "inline")));
});
await p.goto("http://127.0.0.1:4525/verktoy/dmarc", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
console.log(feil.length ? feil.join("\n") : "  ingen feil, ingen CSP-brudd");
await b.close();
