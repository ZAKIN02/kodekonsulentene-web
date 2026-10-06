import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
p.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
console.log("aktivt element før:", await p.evaluate(() => document.activeElement?.tagName));
for (const k of ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]) {
  await p.keyboard.press(k);
  await p.waitForTimeout(60);
}
await p.waitForTimeout(600);
console.log("terminal åpen:", await p.locator(".kkterm").isVisible().catch(() => false));
console.log("aktivt element etter:", await p.evaluate(() => document.activeElement?.tagName + "." + document.activeElement?.className));
await b.close();
