import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0,110)));
await p.goto("http://127.0.0.1:4399/finnes-ikke", { waitUntil: "networkidle" });
await p.waitForTimeout(900);
await p.screenshot({ path: ".skudd/se-404.png" });
// Terminal på forsiden
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(800);
await p.keyboard.press("~");
await p.waitForTimeout(500);
for (const kmd of ["pris", "dmarc nkom.no"]) {
  await p.keyboard.type(kmd, { delay: 30 });
  await p.keyboard.press("Enter");
  await p.waitForTimeout(kmd.startsWith("dmarc") ? 7000 : 900);
}
await p.screenshot({ path: ".skudd/se-terminal.png" });
console.log("feil:", feil.length ? feil : "ingen");
await b.close();
