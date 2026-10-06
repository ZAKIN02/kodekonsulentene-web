/** Sluttilstand: redusert bevegelse, så all avdekking står ferdig. */
import { chromium } from "playwright";
const [url, ut, bredde = "1440", tema = "dark"] = process.argv.slice(2);
const b = await chromium.launch();
const s = await b.newContext({
  viewport: { width: +bredde, height: 900 }, deviceScaleFactor: 1,
  reducedMotion: "reduce", colorScheme: tema,
});
const p = await s.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
p.on("requestfailed", (r) => feil.push(`FEILET ${r.url()}`));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(500);
// Finn elementer som fortsatt er usynlige – da er avdekkingen ekte ødelagt.
const usynlige = await p.evaluate(() =>
  [...document.querySelectorAll(".avslor, .mega .ord, .scene")]
    .filter((e) => +getComputedStyle(e).opacity < 0.9).length);
await p.screenshot({ path: ut, fullPage: true });
console.log("usynlige elementer ved redusert bevegelse:", usynlige);
console.log("konsollfeil:", feil.length ? feil : "ingen");
await b.close();
