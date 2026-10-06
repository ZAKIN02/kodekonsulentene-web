/**
 * Kontrast for tekst som ligger over scenefilmen, seksjon for seksjon.
 *
 * Teksten skjules med color/text-shadow: transparent, IKKE visibility: hidden.
 * visibility fjerner ogsaa kortflaten under teksten, og da maaler man filmen bak
 * kortet i stedet for flaten teksten faktisk ligger paa - det ga 1,00:1 og 1,03:1
 * paa sider som var fullt lesbare.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
const [url, bredde] = process.argv.slice(2);
const W = +(bredde || 1512);
const lum = (r, g, b) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: 900 }, colorScheme: "dark" });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(800);

const mål = await p.evaluate(() => {
  const ut = [];
  const ramme = document.querySelector(".scenefilm-ramme");
  if (!ramme) return ut;
  ramme.querySelectorAll(":scope > section").forEach((sek, si) => {
    const navn = (sek.querySelector("h2,.mega")?.textContent || `seksjon ${si}`).trim().slice(0, 26);
    const kand = sek.querySelectorAll("h2, .scene__ingress, p.muted, p.small, .card p, .kk-hint, label, .heading");
    kand.forEach((el, i) => {
      const t = (el.textContent || "").trim();
      if (t.length < 12) return;
      el.setAttribute("data-maal", `${si}-${i}`);
      ut.push({ id: `${si}-${i}`, seksjon: navn, tekst: t.slice(0, 22), farge: getComputedStyle(el).color });
    });
  });
  return ut;
});

const verst = new Map();
for (const m of mål) {
  await p.evaluate((id) => {
    document.querySelector(`[data-maal="${id}"]`).scrollIntoView({ block: "center" });
  }, m.id);
  await p.waitForTimeout(280);
  const boks = await p.evaluate((id) => {
    const el = document.querySelector(`[data-maal="${id}"]`);
    const r = el.getBoundingClientRect();
    el.style.setProperty("color", "transparent", "important");
    el.style.setProperty("text-shadow", "none", "important");
    // Playwright vil ha width/height, ikke w/h. Og uten fullPage tolkes clip i
    // VISNINGSVINDU-koordinater, som er nøyaktig det getBoundingClientRect gir.
    return { x: Math.max(0, Math.round(r.x)), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
  }, m.id);
  if (boks.width < 4 || boks.height < 4 || boks.y < 0 || boks.y + boks.height > 900) {
    await p.evaluate((id) => { const el = document.querySelector(`[data-maal="${id}"]`); el.style.removeProperty("color"); el.style.removeProperty("text-shadow"); }, m.id);
    continue;
  }
  const png = await p.screenshot({ clip: boks });
  await p.evaluate((id) => { const el = document.querySelector(`[data-maal="${id}"]`); el.style.removeProperty("color"); el.style.removeProperty("text-shadow"); }, m.id);
  const im = PNG.sync.read(png);
  let maks = -1;
  for (let i = 0; i < im.data.length; i += 4) maks = Math.max(maks, lum(im.data[i], im.data[i + 1], im.data[i + 2]));
  const c = m.farge.match(/\d+/g).map(Number);
  const Lt = lum(c[0], c[1], c[2]);
  const k = (Math.max(Lt, maks) + 0.05) / (Math.min(Lt, maks) + 0.05);
  const f = verst.get(m.seksjon);
  if (!f || k < f.k) verst.set(m.seksjon, { k, tekst: m.tekst });
}
console.log(`bredde ${W}px — verste kontrast per seksjon:`);
let ok = true;
for (const [sek, v] of verst) {
  const bestatt = v.k >= 4.5;
  if (!bestatt) ok = false;
  console.log(`  ${sek.padEnd(28)} ${v.k.toFixed(2)}:1  ${bestatt ? "bestått" : "STRYKER"}   «${v.tekst}»`);
}
console.log(ok ? "  alle over 4,5:1" : "  MINST EN STRYKER");
await b.close();
