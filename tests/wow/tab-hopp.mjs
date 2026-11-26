// Måler rulleposisjonen når fokus går fra e-postlenka til første skjemafelt (revisor r4 punkt 5).
// Bruk: node tests/wow/tab-hopp.mjs <url>
import { chromium } from "@playwright/test";
const url = process.argv[2];
const b = await chromium.launch({ channel: "chrome" });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: "load" });
await p.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
const epost = p.locator('#kontakt a[href^="mailto:"]');
await epost.scrollIntoViewIfNeeded();
await p.waitForTimeout(1200);
await epost.focus();
await p.waitForTimeout(800);
const før = await p.evaluate(() => ({ y: scrollY, felt: document.querySelector("#k-navn").getBoundingClientRect().top, epost: document.activeElement.getBoundingClientRect().top }));
await p.keyboard.press("Tab");
const spor = [];
for (let i = 0; i < 12; i++) {
  await p.waitForTimeout(100);
  spor.push(await p.evaluate(() => Math.round(scrollY)));
}
const etter = await p.evaluate(() => ({ y: scrollY, aktiv: document.activeElement.id, felt: document.querySelector("#k-navn").getBoundingClientRect().top, lenis: document.documentElement.className }));
console.log(JSON.stringify({ før, etter, spor }));
await b.close();
