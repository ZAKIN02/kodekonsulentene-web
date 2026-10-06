import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 860 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(1600);
await p.evaluate(() => window.scrollTo(0, 420));
await p.waitForTimeout(900);
await p.screenshot({ path: ".skudd/hero-stor.png" });
await b.close();
