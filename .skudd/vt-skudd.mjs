import { chromium } from "playwright";
const [,, url, ut, velger] = process.argv;
const b = await chromium.launch();
const s = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const feil = [];
s.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await s.goto(url, { waitUntil: "load" });
await s.evaluate(async () => { const h=document.body.scrollHeight; for(let y=0;y<=h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));} window.scrollTo(0,0); });
await s.waitForTimeout(1200);
const el = velger ? await s.$(velger) : null;
if (el) { await el.scrollIntoViewIfNeeded(); await s.waitForTimeout(600); await el.screenshot({ path: ut }); }
else await s.screenshot({ path: ut, fullPage: true });
console.log("konsollfeil:", feil.length ? feil.join(" | ") : "ingen");
await b.close();
