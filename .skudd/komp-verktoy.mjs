import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:950}, colorScheme:"dark" });
await p.goto("http://127.0.0.1:4401/", { waitUntil:"networkidle" });
await p.waitForTimeout(1300);
await p.evaluate(() => document.querySelector("#sjekk")?.scrollIntoView({ block:"start" }));
await p.waitForTimeout(800);
await p.screenshot({ path:".skudd/komp-verktoy.png" });
// dra håndtaket
const f = p.locator("[data-slep-flate]").first();
const bb = await f.boundingBox();
await p.mouse.move(bb.x + bb.width*0.5, bb.y + bb.height*0.5);
await p.mouse.down();
await p.mouse.move(bb.x + bb.width*0.78, bb.y + bb.height*0.5, { steps: 12 });
await p.mouse.up();
await p.waitForTimeout(400);
await p.screenshot({ path:".skudd/komp-verktoy-dratt.png" });
console.log("status:", await p.locator("[data-slep-status]").textContent());
await b.close();
