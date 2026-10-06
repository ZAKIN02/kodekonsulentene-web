import { chromium } from "@playwright/test";
const b = await chromium.launch();

// 1) Redusert bevegelse
const c1 = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
const p1 = await c1.newPage();
await p1.goto("http://127.0.0.1:4399/lab/teknikker", { waitUntil: "networkidle" });
await p1.waitForTimeout(600);
console.log("REDUSERT BEVEGELSE");
console.log("  kort under full opasitet:", await p1.evaluate(() =>
  [...document.querySelectorAll(".avdekk-kort")].filter((e) => +getComputedStyle(e).opacity < 1).length));
console.log("  animasjonsnavn på kort  :", await p1.evaluate(() =>
  getComputedStyle(document.querySelector(".avdekk-kort")).animationName));
await c1.close();

// 2) Uten JavaScript
const c2 = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", javaScriptEnabled: false });
const p2 = await c2.newPage();
await p2.goto("http://127.0.0.1:4399/lab/teknikker", { waitUntil: "domcontentloaded" });
await p2.waitForTimeout(500);
console.log("UTEN JAVASCRIPT");
for (const [navn, sel] of [["rader i tabellen", ".rad"], ["avdekk-kort", ".avdekk-kort"], ["FAQ-poster", ".faq__post"], ["felt", ".felt"]])
  console.log("  %-18s %d", navn, await p2.locator(sel).count());
console.log("  h1-tekst          :", (await p2.locator("h1").textContent())?.slice(0, 44));
await p2.locator(".tabell").screenshot({ path: ".skudd/tek-utenjs.png" });
await c2.close();
await b.close();
