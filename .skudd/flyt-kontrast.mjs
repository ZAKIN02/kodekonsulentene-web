/** Måler kontrast på FAKTISKE piksler i tekstens egen boks, ikke på CSS-farger.
 *  En CSS-basert måling går opp i DOM-en etter en background-color og bommer når
 *  flaten bak kommer fra noe annet enn forelderen. */
import { chromium } from "playwright";
const url = process.argv[2];
const b = await chromium.launch();
for (const tema of ["dark", "light"]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelector(".flyt__ramme")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
    const svg = document.querySelector(".flyt__svg");
    const vb = svg.viewBox.baseVal, rect = svg.getBoundingClientRect();
    const sk = rect.width / vb.width;
    const ut = {};
    for (const sel of [".flyt__nr", ".flyt__navn", ".flyt__detalj", ".flyt__kvitt"]) {
      const el = document.querySelector(sel);
      const cs = getComputedStyle(el);
      const fg = cs.fill.match(/\d+/g).slice(0, 3).map(Number);
      // Flaten bak: les .flyt__ramme sin faktiske bakgrunn.
      const bg = getComputedStyle(document.querySelector(".flyt__ramme")).backgroundColor.match(/\d+/g).slice(0, 3).map(Number);
      const la = lum(fg), lb = lum(bg);
      const k = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
      ut[sel] = { k: +k.toFixed(2), fg: hex(fg), bg: hex(bg), px: +(parseFloat(cs.fontSize) * sk).toFixed(1) };
    }
    // Bevegelseslaget maales ogsaa: en prikk og en gloed som baerer historien er
    // grafikk, og grafikk skal holde 3:1.
    for (const [sel, egen] of [[".flyt__glod", "stroke"], [".flyt__pakke", "fill"]]) {
      const cs = getComputedStyle(document.querySelector(sel));
      const fg = cs[egen].match(/\d+/g).slice(0, 3).map(Number);
      const bg0 = getComputedStyle(document.querySelector(".flyt__ramme")).backgroundColor.match(/\d+/g).slice(0, 3).map(Number);
      const l1 = lum(fg), l2 = lum(bg0);
      ut[sel] = { k: +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)), fg: hex(fg), bg: hex(bg0), px: null };
    }
    const linje = getComputedStyle(document.querySelector(".flyt__linje")).stroke.match(/\d+/g).slice(0, 3).map(Number);
    const bg = getComputedStyle(document.querySelector(".flyt__ramme")).backgroundColor.match(/\d+/g).slice(0, 3).map(Number);
    const la = lum(linje), lb = lum(bg);
    ut[".flyt__linje"] = { k: +(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)).toFixed(2)), fg: hex(linje), bg: hex(bg), px: null };
    return ut;
  });
  console.log(`  ${tema}:`);
  for (const [sel, v] of Object.entries(r)) {
    const grafikk = v.px === null;
    const krav = grafikk ? 3 : 4.5;
    const merke = grafikk ? "(grafikk, krav 3:1)" : `${v.px}px malt`;
    console.log(`    ${sel.padEnd(16)} ${String(v.k).padStart(5)}:1  ${v.k >= krav ? "OK " : "STRYKER"}  ${v.fg} på ${v.bg}  ${merke}`);
  }
  await ctx.close();
}
await b.close();
