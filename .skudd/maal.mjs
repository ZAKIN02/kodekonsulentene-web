import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".teaser")?.scrollIntoView({ block: "center" }));
await p.waitForTimeout(900);
// Skjul teksten, mål bakgrunnen der teksten STO – det er den faktiske kontrastgrunnen.
const boks = await p.locator(".teaser__tekst").boundingBox();
await p.evaluate(() => { document.querySelector(".teaser__tekst").style.visibility = "hidden"; });
await p.waitForTimeout(200);
const png = await p.screenshot({ clip: boks });
await b.close();
// Lysest piksel i området bestemmer verste kontrast mot hvit tekst.
const { PNG } = await import("pngjs");
const bilde = PNG.sync.read(png);
let maks = 0, sum = 0, n = 0;
const lum = (r,g,bb) => { const f=(c)=>{c/=255; return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bb); };
for (let i = 0; i < bilde.data.length; i += 4) {
  const L = lum(bilde.data[i], bilde.data[i+1], bilde.data[i+2]);
  maks = Math.max(maks, L); sum += L; n++;
}
const kontrast = (L) => (1.05) / (L + 0.05);
console.log("lysest bakgrunn i tekstområdet -> kontrast mot hvit:", kontrast(maks).toFixed(2), ":1");
console.log("gjennomsnitt                   -> kontrast mot hvit:", kontrast(sum/n).toFixed(2), ":1");
console.log("krav WCAG AA for stor tekst 3:1, brødtekst 4.5:1");
