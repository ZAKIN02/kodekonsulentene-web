import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 950 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/lab/interaksjon", { waitUntil: "networkidle" });
await p.waitForTimeout(600);

// Stabel ved full separasjon, via knappen
await p.locator("[data-stabel-knapp]").first().click();
await p.waitForTimeout(800);
const stEl = p.locator("[data-stabel] [data-stabel-scene]").first();
await stEl.scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
const s = await stEl.boundingBox();
await p.screenshot({ path: ".skudd/j1-stabel-apen.png", clip: s });

// Slep i balanse
const slepEl = p.locator("[data-slep] [data-slep-flate]").first();
await slepEl.scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
const f = await slepEl.boundingBox();
await p.locator("[data-slep] .spak").first().evaluate((e) => { e.value = "50"; e.dispatchEvent(new Event("input", { bubbles: true })); });
await p.waitForTimeout(300);
await p.screenshot({ path: ".skudd/j2-slep-balanse.png", clip: f });
await b.close();
