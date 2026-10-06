import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 140)));
p.on("pageerror", (e) => feil.push("PAGEERROR: " + e.message));

const les = () => p.evaluate(() => document.querySelector(".kkterm__out")?.innerText?.trim() ?? "");
const skriv = async (cmd, vent = 1200) => {
  await p.fill(".kkterm__in", cmd);
  await p.press(".kkterm__in", "Enter");
  await p.waitForTimeout(vent);
};

await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(600);

// 1. Åpne med ~
await p.keyboard.press("~");
await p.waitForTimeout(300);
console.log("MODAL ÅPEN:", await p.isVisible(".kkterm"));
console.log("ROLLE:", await p.getAttribute(".kkterm", "role"), "| aria-modal:", await p.getAttribute(".kkterm", "aria-modal"));
console.log("FOKUS I FELT:", await p.evaluate(() => document.activeElement?.className));

// 2. help
await skriv("help", 500);
console.log("\n--- help ---\n" + (await les()).split("\n").slice(-12).join("\n"));

// 3. pris (henter fra /priser)
await skriv("clear", 200); await skriv("pris", 2500);
console.log("\n--- pris ---\n" + await les());

// 4. sjekk mot ekte side
await skriv("clear", 200); await skriv("sjekk nkom.no", 14000);
console.log("\n--- sjekk nkom.no ---\n" + await les());

// 5. dmarc
await skriv("clear", 200); await skriv("dmarc nkom.no", 9000);
console.log("\n--- dmarc nkom.no ---\n" + await les());

// 6. headere
await skriv("clear", 200); await skriv("headere vg.no", 14000);
console.log("\n--- headere vg.no ---\n" + await les());

// 7. sudo + ukjent
await skriv("clear", 200); await skriv("sudo rm -rf /", 400); await skriv("blah", 300);
console.log("\n--- sudo/ukjent ---\n" + await les());

// 8. nordlys skal være skjult før den er låst opp
await skriv("clear", 200); await skriv("nordlys", 400);
console.log("\n--- nordlys før opplåsing ---\n" + await les());

await p.screenshot({ path: ".skudd/term-modal.png" });

// 9. Esc lukker og gir fokus tilbake
await p.keyboard.press("Escape");
await p.waitForTimeout(300);
console.log("\nMODAL LUKKET:", !(await p.isVisible(".kkterm").catch(() => false)));
console.log("FEIL:", feil.length ? feil : "ingen");
await b.close();
