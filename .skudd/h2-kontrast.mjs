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
    // Klasselister traff ikke ProcessSteps, som har sin egen markup - da ble
    // seksjonen rapportert som «ingen funn» i stedet for aa bli maalt. Velg
    // bladnoder med tekst i stedet, uavhengig av klassenavn.
    const kand = [...sek.querySelectorAll("p, h2, h3, h4, dt, dd, li, span, label, a")]
      .filter((e) => {
        const egen = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
        return egen.length >= 12;
      });
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
  // To skudd: ett MED tekst, ett med teksten gjort gjennomsiktig. Differansen
  // viser nøyaktig hvilke piksler som er glyffer. Uten dette måles hele
  // tekstboksen – og en kort linje i en bred boks har mye tom flate til høyre der
  // filmen skinner gjennom. Da rapporteres filmens lyshet som om det lå tekst der.
  await p.evaluate((id) => {
    const el = document.querySelector(`[data-maal="${id}"]`);
    el.style.removeProperty("color"); el.style.removeProperty("text-shadow");
  }, m.id);
  const medTekst = PNG.sync.read(await p.screenshot({ clip: boks }));
  await p.evaluate((id) => {
    const el = document.querySelector(`[data-maal="${id}"]`);
    el.style.setProperty("color", "transparent", "important");
    el.style.setProperty("text-shadow", "none", "important");
  }, m.id);
  const utenTekst = PNG.sync.read(await p.screenshot({ clip: boks }));
  await p.evaluate((id) => {
    const el = document.querySelector(`[data-maal="${id}"]`);
    el.style.removeProperty("color"); el.style.removeProperty("text-shadow");
  }, m.id);

  let maks = -1, glyffer = 0;
  const W2 = utenTekst.width, H2 = utenTekst.height;
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const i = (W2 * y + x) << 2;
    const d = Math.abs(medTekst.data[i] - utenTekst.data[i])
            + Math.abs(medTekst.data[i + 1] - utenTekst.data[i + 1])
            + Math.abs(medTekst.data[i + 2] - utenTekst.data[i + 2]);
    if (d < 24) continue;             // ingen glyff her
    glyffer++;
    // Bakgrunnen RETT BAK glyffen, lest fra skuddet uten tekst.
    maks = Math.max(maks, lum(utenTekst.data[i], utenTekst.data[i + 1], utenTekst.data[i + 2]));
  }
  if (glyffer < 20) continue;         // fant ikke nok glyffer til å stole på målingen
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
