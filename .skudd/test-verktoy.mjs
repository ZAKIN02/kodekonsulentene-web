import { chromium } from "@playwright/test";
const base = process.argv[2];
const b = await chromium.launch();
for (const [sti, domene] of [["/verktoy/dmarc", "nkom.no"], ["/verktoy/uu-sjekk", "digdir.no"], ["/verktoy/cookie-sjekk", "digdir.no"]]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  await p.goto(base + sti, { waitUntil: "networkidle" });
  const felt = p.locator('input[type="text"], input[type="url"], input[type="search"]').first();
  await felt.fill(domene);
  await felt.press("Enter");
  let svar = "(ingen)";
  try {
    await p.locator("#resultat .kk-report, #resultat .card").first().waitFor({ state: "visible", timeout: 60000 });
    svar = (await p.locator("#resultat").innerText()).split("\n").filter(Boolean).slice(0, 2).join(" / ").slice(0, 110);
  } catch { svar = "TIDSAVBRUDD"; }
  console.log(`  ${sti.padEnd(24)} ${svar}`);
  if (feil.length) console.log(`     konsollfeil: ${feil.slice(0, 2).join(" | ")}`);
  await p.close();
}
await b.close();
