import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0,140)));
p.on("pageerror", (e) => feil.push("PAGEERROR: " + e.message));
const les = () => p.evaluate(() => document.querySelector(".kkterm__out")?.innerText?.trim() ?? "");
const skriv = async (c, v = 800) => { await p.fill(".kkterm__in", c); await p.press(".kkterm__in", "Enter"); await p.waitForTimeout(v); };

await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.keyboard.press("~"); await p.waitForTimeout(300);

await skriv("pris", 2500);
console.log("--- pris (rettet) ---\n" + await les());

await skriv("clear", 200); await skriv("dmarc nkom.no", 9000);
console.log("\n--- dmarc (rettet oppsummering) ---\n" + await les());

await skriv("clear", 200); await skriv("sudo rm -rf /", 400); await skriv("blah", 300); await skriv("nordlys", 300);
console.log("\n--- sudo / ukjent / låst nordlys ---\n" + await les());

// Tab-fullføring
await p.fill(".kkterm__in", "he"); await p.press(".kkterm__in", "Tab"); await p.waitForTimeout(200);
console.log("\nTAB «he» ->", JSON.stringify(await p.inputValue(".kkterm__in")));
await p.fill(".kkterm__in", "s"); await p.press(".kkterm__in", "Tab"); await p.waitForTimeout(200);
console.log("TAB «s» (flere treff) ->", (await les()).split("\n").pop());

// Historikk
await p.fill(".kkterm__in", ""); await p.press(".kkterm__in", "ArrowUp"); await p.waitForTimeout(150);
console.log("PIL OPP ->", JSON.stringify(await p.inputValue(".kkterm__in")));

await p.screenshot({ path: ".skudd/term-modal.png" });
await p.keyboard.press("Escape"); await p.waitForTimeout(300);
console.log("lukket:", !(await p.locator(".kkterm").isVisible().catch(() => false)));

// Konami
for (const k of ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]) {
  await p.keyboard.press(k); await p.waitForTimeout(40);
}
await p.waitForTimeout(400);
console.log("\nkonami åpnet terminal:", await p.locator(".kkterm").isVisible());
await skriv("nordlys", 1400);
console.log("--- nordlys etter opplåsing ---\n" + await les());
await p.screenshot({ path: ".skudd/term-nordlys.png" });
console.log("\nFEIL:", feil.length ? feil : "ingen");
await b.close();
