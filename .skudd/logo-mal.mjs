import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const tema of ["dark", "light"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: tema });
  // Blokker SVG-en slik at vi ser reservert plass FØR last, og slipp den så gjennom.
  await p.route("**/logo/*.svg", async (r) => { await new Promise(s => setTimeout(s, 1200)); r.continue(); });
  await p.goto(process.argv[2], { waitUntil: "domcontentloaded" });
  const synlig = () => p.evaluate(() => {
    const alle = [...document.querySelectorAll(".topbar__logo img")];
    const i = alle.find(e => e.getBoundingClientRect().width > 0) ?? alle[0];
    const r = i.getBoundingClientRect();
    return { merke: i.dataset.logo, b: +r.width.toFixed(1), h: +r.height.toFixed(1), nat: [i.naturalWidth, i.naturalHeight] };
  });
  const foer = await synlig();
  await p.waitForLoadState("networkidle");
  await p.waitForTimeout(400);
  const etter = await synlig();
  console.log(`${tema.padEnd(6)} før: ${foer.b} x ${foer.h}   etter: ${etter.b} x ${etter.h}   SVG: ${etter.nat.join("x")}   endring: ${(etter.b - foer.b).toFixed(1)} px`);
  await p.close();
}
await b.close();
