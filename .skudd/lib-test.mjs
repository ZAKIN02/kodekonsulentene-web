import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
const lastet = [];
const feil = [];
p.on("request", (r) => { if (/scroll-timeline/.test(r.url())) lastet.push(r.url().split("/").pop()); });
p.on("console", (m) => { if (m.type() === "error") feil.push(m.text().slice(0, 140)); });

// Tving fram polyfill-veien: lat som nettleseren mangler støtte.
await p.addInitScript(() => {
  const ekte = CSS.supports.bind(CSS);
  CSS.supports = (...a) => (String(a[0]).includes("animation-timeline") ? false : ekte(...a));
});
await p.goto("http://127.0.0.1:4399/lab/bibliotek", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);

const maal = async () => p.evaluate(() => {
  const e = document.querySelectorAll(".maalekort")[2];
  return e ? +getComputedStyle(e).opacity : null;
});
const posisjoner = [];
for (const y of [0, 700, 1100, 1600]) {
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(600);
  posisjoner.push(await maal());
}
await p.screenshot({ path: ".skudd/lib-polyfill.png" });
await b.close();
console.log("polyfill lastet:", lastet.length ? lastet : "NEI");
console.log("opacity gjennom scroll:", posisjoner.join(" → "));
console.log("ulike verdier:", new Set(posisjoner.filter(v => v !== null)).size);
console.log("konsollfeil:", feil.length ? feil : "ingen");
