import { chromium } from "@playwright/test";
const BASE = "http://127.0.0.1:4425";
const b = await chromium.launch();
const s = await b.newPage({ viewport: { width: 760, height: 1100 }, colorScheme: "dark" });

await s.goto(`${BASE}/kontakt`, { waitUntil: "networkidle" });
const skjema = s.locator("form.card");
await skjema.scrollIntoViewIfNeeded();
await skjema.screenshot({ path: ".skudd/tek-skjema-ror.png" });

await s.fill("#navn", "Kari Nordmann");
await s.fill("#epost", "kari.bedrift.no");          // ugyldig
await s.fill("#melding", "Vi bruker en halv dag i måneden på å avstemme Vipps mot regnskapet.\nDet må gå an å gjøre enklere.\nVi har omtrent 200 transaksjoner i måneden.");
await s.locator("#navn").focus();
await s.waitForTimeout(200);
await skjema.screenshot({ path: ".skudd/tek-skjema-ugyldig.png" });

await s.fill("#epost", "kari@bedrift.no");
await s.locator("#navn").focus();
await s.waitForTimeout(200);
await skjema.screenshot({ path: ".skudd/tek-skjema-gyldig.png" });

await s.goto(`${BASE}/kontakt?sendt=1`, { waitUntil: "networkidle" });
await s.waitForTimeout(600);
await s.locator(".kvittering").screenshot({ path: ".skudd/tek-kvittering.png" });

await s.goto(BASE + "/", { waitUntil: "networkidle" });
const d = s.locator(".faq").first();
await d.scrollIntoViewIfNeeded();
await s.locator(".faq details").first().locator("summary").click();
await s.waitForTimeout(500);
await d.screenshot({ path: ".skudd/tek-faq.png" });
console.log("skudd tatt");
await b.close();
