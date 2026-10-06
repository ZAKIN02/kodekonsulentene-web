import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4721/kontakt", { waitUntil: "networkidle" });
await p.waitForTimeout(700);
console.log(JSON.stringify(await p.evaluate(() => ({
  h1: document.querySelectorAll("h1").length,
  skjult: [...document.querySelectorAll(".avslor, .mega .ord")].filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.95).length,
  tegn: document.body.innerText.trim().length,
  skjema: !!document.querySelector("form"),
}))));
await p.screenshot({ path: ".skudd/u-kontakt-full.png" });
await b.close();
