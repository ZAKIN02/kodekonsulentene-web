/**
 * Kontrast for tekst som ligger over en SceneFilm.
 *
 * To målefeil er unngått med vilje, begge gjort i dette prosjektet før:
 *  1. `visibility: hidden` settes bare på TEKST-elementene, aldri på kort eller
 *     wrappere. Skjuler man wrapperen, forsvinner kortflaten under, og man måler
 *     mot filmen et sted teksten aldri ligger – det ga en gang 1,00:1 på et kort
 *     som var fullt lesbart.
 *  2. Klippet hentes i SIDEKOORDINATER. `boundingBox()` er relativt til
 *     visningsvinduet, `screenshot({clip})` er relativt til siden; blandes de,
 *     klippes feil sted.
 * Verste piksel brukes, ikke snittet: lys tekst stryker mot den lyseste flekken.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const url = process.argv[2];
const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };

const b = await chromium.launch();
for (const [merke, w, h] of [["skrivebord", 1440, 900], ["mobil", 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(url, { waitUntil: "networkidle" });
  const treff = await p.evaluate(() => {
    const sek = document.querySelector(".scenefilm-ramme > section");
    if (!sek) return null;
    const tekster = [...sek.querySelectorAll("p, h2, h3, li, dt, dd, span")]
      .filter((e) => e.textContent.trim() && e.getClientRects().length);
    const ut = tekster.map((e) => {
      const r = e.getBoundingClientRect();
      return { farge: getComputedStyle(e).color,
               x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY),
               w: Math.round(r.width), h: Math.round(r.height) };
    }).filter((t) => t.w > 30 && t.h > 8);
    // Bare selve teksten skjules. Kort og flater blir stående.
    for (const e of tekster) e.style.visibility = "hidden";
    return ut;
  });
  if (!treff?.length) { console.log(`  ${merke}: fant ingen tekst i filmseksjonen`); await p.close(); continue; }
  let verst = { r: Infinity };
  for (const t of treff) {
    await p.screenshot({ path: "/tmp/kontrast.png", clip: { x: t.x, y: t.y, width: t.w, height: t.h } });
    const png = PNG.sync.read(readFileSync("/tmp/kontrast.png"));
    let lysest = [0, 0, 0];
    for (let i = 0; i < png.data.length; i += 4) {
      const px = [png.data[i], png.data[i + 1], png.data[i + 2]];
      if (lum(px) > lum(lysest)) lysest = px;
    }
    const f = t.farge.match(/\d+/g).slice(0, 3).map(Number);
    const r = ratio(f, lysest);
    if (r < verst.r) verst = { r, t, lysest };
  }
  const ok = verst.r >= 4.5 ? "består" : "STRYKER";
  console.log(`  ${merke}: verste ${verst.r.toFixed(2)}:1  ${ok}  (${treff.length} tekstelementer målt)`);
  await p.close();
}
await b.close();
