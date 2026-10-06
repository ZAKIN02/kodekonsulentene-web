import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, colorScheme: "dark" });
for (const url of ["/lab/interaksjon", "/", "/sjekk"]) {
  await p.goto("http://127.0.0.1:4581" + url, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => ({
    stabel: !!document.querySelector("[data-stabel]"),
    stabelSpak: !!document.querySelector("[data-stabel-spak]"),
    slep: !!document.querySelector("[data-slep]"),
    slepSpak: !!document.querySelector("[data-slep-spak]"),
    slepKlar: document.querySelector("[data-slep]")?.hasAttribute("data-klar") ?? null,
  }));
  console.log(url.padEnd(20), JSON.stringify(r));
}
await b.close();
