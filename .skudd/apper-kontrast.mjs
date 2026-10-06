/**
 * Kontrast for tekst som ligger OVER filmen på /apper-og-ai.
 *
 * .skudd/herokontrast.mjs er hardkodet til forsidens .hero/.hero__lead og kan
 * ikke brukes her. Metoden er den samme: les tekstfargen FØR noe skjules, skjul
 * så bare tekstlaget, fotografer flaten under, og finn den LYSESTE pikselen
 * innenfor tekstens egen boks – ikke et snitt, for det er det lyseste punktet
 * som avgjør om en bokstav forsvinner.
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const url = process.argv[2];
const b = await chromium.launch();
for (const [merke, w, h] of [["skrivebord", 1440, 860], ["mobil", 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: "dark" });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.evaluate(() => document.querySelector(".scenefilm-ramme").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(900);
  const info = await p.evaluate(() => {
    const ramme = document.querySelector(".scenefilm-ramme");
    const seksjon = ramme.querySelector("section");
    const tekst = ramme.querySelector(".body-lg");
    const a = ramme.getBoundingClientRect(), c = tekst.getBoundingClientRect();
    const farge = getComputedStyle(tekst).color;
    seksjon.style.visibility = "hidden";
    return { x: c.x - a.x, y: c.y - a.y, w: c.width, h: c.height, farge };
  });
  await p.waitForTimeout(250);
  const png = await p.locator(".scenefilm-ramme").screenshot();
  await p.close();
  const im = PNG.sync.read(png);
  const lum = (r, g, bb) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb); };
  const [tr, tg, tb] = info.farge.match(/\d+/g).map(Number);
  const lt = lum(tr, tg, tb);
  let maks = -1, verst = null;
  for (let y = Math.max(0, Math.round(info.y)); y < Math.min(im.height, Math.round(info.y + info.h)); y++)
    for (let x = Math.max(0, Math.round(info.x)); x < Math.min(im.width, Math.round(info.x + info.w)); x++) {
      const i = (im.width * y + x) << 2;
      const l = lum(im.data[i], im.data[i + 1], im.data[i + 2]);
      if (l > maks) { maks = l; verst = [im.data[i], im.data[i + 1], im.data[i + 2]]; }
    }
  const kontrast = (Math.max(lt, maks) + 0.05) / (Math.min(lt, maks) + 0.05);
  console.log(`  ${merke.padEnd(11)} ${kontrast.toFixed(2)}:1   tekst ${info.farge}  lyseste flate rgb(${verst})  ${kontrast >= 4.5 ? "ok" : "UNDER 4,5"}`);
}
await b.close();
