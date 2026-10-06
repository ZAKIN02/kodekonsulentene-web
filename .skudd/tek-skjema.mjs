/**
 * Virker feltstatusen og det voksende feltet – i ekte nettleser, ikke i teorien?
 */
import { chromium, firefox } from "@playwright/test";
const BASE = "http://127.0.0.1:4425";

async function kjor(motor, navn) {
  const b = await motor.launch();
  const s = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await s.goto(`${BASE}/kontakt`, { waitUntil: "networkidle" });

  const ramme = (sel) => s.evaluate((x) => getComputedStyle(document.querySelector(x)).borderTopColor, sel);
  const merke = (sel) =>
    s.evaluate((x) => getComputedStyle(document.querySelector(x), "::after").content, sel);

  console.log(`\n== ${navn} ==`);
  console.log(` e-post ved innlasting   ramme ${await ramme("#epost")}  merke ${await merke(".field:has(#epost) > label")}`);

  // Ugyldig: skriv noe som ikke er en e-post, og forlat feltet.
  await s.fill("#epost", "ikke-en-epost");
  await s.locator("#navn").focus();
  console.log(` etter ugyldig inntasting ramme ${await ramme("#epost")}  merke ${await merke(".field:has(#epost) > label")}`);

  // Gyldig
  await s.fill("#epost", "kari@bedrift.no");
  await s.locator("#navn").focus();
  console.log(` etter gyldig inntasting  ramme ${await ramme("#epost")}  merke ${await merke(".field:has(#epost) > label")}`);

  // Valgfritt felt skal ALDRI bli grønt – det har ingen regel å bryte.
  await s.fill("#nettside", "dinbedrift.no");
  await s.locator("#navn").focus();
  console.log(` valgfritt felt utfylt    ramme ${await ramme("#nettside")}  merke ${await merke(".field:has(#nettside) > label")}`);

  // field-sizing: vokser meldingsfeltet med teksten?
  const h0 = await s.evaluate(() => document.querySelector("#melding").getBoundingClientRect().height);
  await s.fill("#melding", Array.from({ length: 12 }, (_, i) => `Linje ${i + 1} med litt tekst som fyller bredden på feltet.`).join("\n"));
  await s.waitForTimeout(120);
  const h1 = await s.evaluate(() => document.querySelector("#melding").getBoundingClientRect().height);
  const kanSendes = await s.evaluate(() => {
    const k = document.querySelector('form button[type=submit], form [type=submit]');
    return k ? Math.round(k.getBoundingClientRect().bottom) : null;
  });
  console.log(` meldingsfelt ${Math.round(h0)} px -> ${Math.round(h1)} px   send-knapp bunn ${kanSendes} px`);

  await b.close();
}

await kjor(chromium, "Chromium");
await kjor(firefox, "Firefox");
