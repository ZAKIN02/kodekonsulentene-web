/**
 * Kontrast på scene-kortene i /historie.
 *
 * MERK: mål mot et VIEWPORT-skudd, ikke mot et elementskudd av .hist.
 * .hist er rundt 4700 px høy og har et `position: sticky` medie inni. Et
 * elementskudd setter sammen hele seksjonen, og da havner det sticky mediet et
 * helt annet sted enn der det faktisk står på skjermen. Den feilen ga 1,00:1 på
 * et kort som i virkeligheten er ugjennomsiktig.
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const b = await chromium.launch();
for (const [navn, w, h] of [["desktop", 1440, 900], ["mobil", 412, 915]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/historie", { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const rel = await p.evaluate(() => {
    const t = document.querySelector(".hist__kort .body-lg");
    t.scrollIntoView({ block: "center" });
    return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
      const r = t.getBoundingClientRect();
      const farge = getComputedStyle(t).color;
      const e2 = t;
      // Gjør teksten gjennomsiktig i stedet for å skjule den. `visibility: hidden`
      // på barna fikk HELE kortet til å forsvinne – bakgrunn og kantlinje med – og
      // da målte vi videoen bak i stedet for kortet. Med transparent farge står
      // layout og kort urørt, og vi fotograferer nøyaktig det som males bak glyfene.
      e2.style.color = "transparent";
      res({ farge, x: r.x, y: r.y, w: r.width, h: r.height });
    })));
  });
  await p.waitForTimeout(400);
  const png = await p.screenshot();            // viewport, ikke element
  await ctx.close();
  const im = PNG.sync.read(png);
  const k = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const L = (r, g, bb) => 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(bb);
  const m = rel.farge.match(/\d+/g).map(Number);
  const lt = L(m[0], m[1], m[2]);
  let verst = Infinity, rgb = null;
  for (let y = Math.max(0, Math.round(rel.y)); y < Math.min(im.height, Math.round(rel.y + rel.h)); y++)
    for (let x = Math.max(0, Math.round(rel.x)); x < Math.min(im.width, Math.round(rel.x + rel.w)); x++) {
      const i = (im.width * y + x) << 2;
      const lb = L(im.data[i], im.data[i + 1], im.data[i + 2]);
      const c = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
      if (c < verst) { verst = c; rgb = [im.data[i], im.data[i + 1], im.data[i + 2]]; }
    }
  console.log(`${navn}: tekst ${rel.farge} mot verste bakgrunn rgb(${rgb}) = ${verst.toFixed(2)}:1 ${verst >= 4.5 ? "BESTÅTT" : "STRYKER"}`);
}
await b.close();
