import { firefox } from "@playwright/test";
const b = await firefox.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const lastet = []; const feil = [];
p.on("request", (r) => { if (/scroll-timeline/.test(r.url())) lastet.push(r.url().split("/").pop()); });
p.on("console", (m) => { if (m.type() === "error") feil.push(m.text().slice(0,140)); });
await p.goto("http://127.0.0.1:4399/lab/bibliotek", { waitUntil: "networkidle" });
console.log("Firefox støtter animation-timeline nativt:",
  await p.evaluate(() => CSS.supports("animation-timeline: view()")));
await p.waitForTimeout(2500);
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
await p.screenshot({ path: ".skudd/lib-firefox.png" });
await b.close();
console.log("polyfill lastet:", lastet.length ? lastet : "NEI");
console.log("opacity gjennom scroll:", serie.join(" → "));
console.log("ulike verdier:", new Set(serie.filter(v=>v!==null)).size, "(1 = ingen spoling)");
console.log("konsollfeil:", feil.length ? feil : "ingen");
