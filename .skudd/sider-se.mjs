/** Skjermbilde av en side pluss konsollfeil og CLS. */
import { chromium } from "playwright";
const [url, ut, bredde = "1440"] = process.argv.slice(2);
const b = await chromium.launch();
const s = await b.newContext({ viewport: { width: +bredde, height: 900 }, deviceScaleFactor: 1 });
const p = await s.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
p.on("pageerror", (e) => feil.push(String(e)));
p.on("requestfailed", (r) => feil.push(`FEILET ${r.url()}`));
await p.goto(url, { waitUntil: "networkidle" });
await p.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  window.scrollTo(0, 0);
});
await p.waitForTimeout(600);
const bilder = await p.$$eval("img", (el) => el.map((i) => ({
  src: i.currentSrc.split("/").pop(), w: i.getAttribute("width"), h: i.getAttribute("height"),
  malt: `${Math.round(i.getBoundingClientRect().width)}x${Math.round(i.getBoundingClientRect().height)}`,
  lastet: i.naturalWidth > 0, alt: i.alt.slice(0, 60),
})));
await p.screenshot({ path: ut, fullPage: true });
console.log("bilder:", JSON.stringify(bilder, null, 1));
console.log("konsollfeil:", feil.length ? feil : "ingen");
await b.close();
