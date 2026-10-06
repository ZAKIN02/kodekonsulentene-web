import { firefox } from "@playwright/test";
import { readFileSync } from "node:fs";
const b = await firefox.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
// Last polyfillen FØR noe annet kjører – den beste sjansen den kan få.
const kode = readFileSync("node_modules/scroll-timeline-polyfill/dist/scroll-timeline.js", "utf8");
await p.addInitScript({ content: kode });
const feil = [];
p.on("console", (m) => { if (m.type() === "error") feil.push(m.text().slice(0,160)); });
await p.goto("http://127.0.0.1:4399/lab/bibliotek", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
console.log("supports etter tidlig polyfill:", await p.evaluate(() => CSS.supports("animation-timeline: view()")));
const les = () => p.evaluate(() => {
  const e = document.querySelectorAll(".maalekort")[2];
  return e ? +(+getComputedStyle(e).opacity).toFixed(2) : null;
});
const serie = [];
for (const y of [0, 600, 900, 1200, 1500, 1900]) {
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(500);
  serie.push(await les());
}
await p.screenshot({ path: ".skudd/lib-tidlig.png" });
await b.close();
console.log("opacity gjennom scroll:", serie.join(" → "));
console.log("ulike verdier:", new Set(serie.filter(v=>v!==null)).size);
console.log("konsollfeil:", feil.length ? feil.slice(0,3) : "ingen");
