import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4712/", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
for (const k of ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]) {
  await p.keyboard.press(k); await p.waitForTimeout(50);
}
await p.waitForTimeout(500);
await p.fill(".kkterm__in", "nordlys");
await p.press(".kkterm__in", "Enter");
await p.waitForTimeout(1500);
console.log((await p.locator(".kkterm__out").innerText()).trim());
await p.screenshot({ path: ".skudd/term-nordlys.png" });
// help skal fortsatt ikke vise de skjulte
await p.fill(".kkterm__in", "help"); await p.press(".kkterm__in", "Enter"); await p.waitForTimeout(400);
const h = await p.locator(".kkterm__out").innerText();
console.log("\nhelp nevner nordlys:", /nordlys/.test(h.split("$ help")[1] ?? ""));
await b.close();
