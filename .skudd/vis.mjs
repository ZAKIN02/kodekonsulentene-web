import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
await p.evaluate(() => { document.querySelector(".teaser__tekst").style.outline = "2px solid magenta"; });
await p.locator(".teaser").screenshot({ path: process.argv[2] + "/teaser-lag.png" });
await b.close();
