/** Rørte :has()-reglene noe de ikke skulle? .field finnes også i verktøyene. */
import { chromium } from "@playwright/test";
const BASE = "http://127.0.0.1:4425";
const b = await chromium.launch();
for (const sti of ["/sjekk", "/verktoy/priskalkulator", "/verktoy/cookie-sjekk", "/verktoy/dmarc", "/"]) {
  const s = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const feil = [];
  s.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  await s.goto(BASE + sti, { waitUntil: "networkidle" });
  const r = await s.evaluate(() => {
    const felt = [...document.querySelectorAll(".field")];
    const merker = felt.filter((f) => {
      const l = f.querySelector(":scope > label");
      return l && getComputedStyle(l, "::after").content !== "none";
    }).length;
    return {
      felt: felt.length,
      kontroller: document.querySelectorAll(".field > .control").length,
      merkerVedLast: merker,
      avkrysning: document.querySelectorAll('.field input[type=checkbox], .field input[type=radio]').length,
    };
  });
  console.log(`${sti.padEnd(26)} felt ${String(r.felt).padStart(2)}  .control ${String(r.kontroller).padStart(2)}  avkrysn. ${String(r.avkrysning).padStart(2)}  merker ved innlasting ${r.merkerVedLast}  konsollfeil ${feil.length}`);
  await s.close();
}
await b.close();
