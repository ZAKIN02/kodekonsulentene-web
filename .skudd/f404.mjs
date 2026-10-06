import { chromium } from "@playwright/test";
const b = await chromium.launch();

// 1. Uten JavaScript
const u = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
const pu = await u.newPage();
const r = await pu.goto("http://127.0.0.1:4399/finnes-ikke", { waitUntil: "domcontentloaded" });
console.log("UTEN JS — status:", r.status());
console.log("  h1:", await pu.locator("h1").innerText());
console.log("  terminaltekst:", JSON.stringify((await pu.locator(".kkterm__out").innerText()).trim()));
console.log("  felt disabled:", await pu.locator(".kkterm__in").isDisabled());
console.log("  antall lenker:", await pu.locator(".fire-null__ut a").count());
await pu.screenshot({ path: ".skudd/404-utenjs.png" });
await u.close();

// 2. Med JavaScript
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0,140)));
p.on("pageerror", (e) => feil.push("PAGEERROR: " + e.message));
await p.goto("http://127.0.0.1:4399/finnes-ikke", { waitUntil: "networkidle" });
await p.waitForTimeout(700);
console.log("\nMED JS — felt disabled:", await p.locator(".kkterm__in").isDisabled());
console.log("  terminaltekst:\n" + (await p.locator(".kkterm__out").innerText()).trim().split("\n").map(l => "    " + l).join("\n"));

await p.fill(".kkterm__in", "sjekk nkom.no");
await p.press(".kkterm__in", "Enter");
await p.waitForTimeout(14000);
console.log("\n  etter «sjekk nkom.no»:\n" + (await p.locator(".kkterm__out").innerText()).trim().split("\n").slice(-9).map(l => "    " + l).join("\n"));
console.log("  navigerte bort?", p.url());
await p.screenshot({ path: ".skudd/404-medjs.png" });
console.log("\nFEIL:", feil.length ? feil : "ingen");
await b.close();
