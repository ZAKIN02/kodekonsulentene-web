/** Kontrast paa ALT tekstinnhold i komponenten, i begge temaer og paa begge
 *  bredder, maalt mot den naermeste faktisk ugjennomsiktige bakgrunnen. */
import { chromium } from "playwright";
const b = await chromium.launch();
const nei = [];
for (const [side, velger] of [["lab", "http://localhost:4455/lab/interaksjon"], ["forsiden", "http://localhost:4455/"]])
for (const tema of ["dark", "light"])
for (const [bn, vp] of [["bred", { width: 1440, height: 900 }], ["smal", { width: 390, height: 844 }]]) {
  const c = await b.newContext({ viewport: vp });
  const p = await c.newPage();
  await p.goto(velger, { waitUntil: "networkidle" });
  await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), tema);
  await p.locator("[data-slep-flate]").first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(2600);  // la sveipen gaa ferdig
  const funn = await p.evaluate(() => {
    // color-mix() beregnes til «color(srgb 0.98 0.53 0.50)» – kanaler i 0–1,
    // ikke 0–255. Den gamle parseren leste dem som 0–255 og blaaste opp hver
    // eneste maaling mot en lys bakgrunn. Falske bestaatt, ikke falske stryk.
    const rgb = (s) => {
      const m = s.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
      if (m) return [+m[1] * 255, +m[2] * 255, +m[3] * 255];
      return (s.match(/[\d.]+/g) || []).map(Number);
    };
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = ([r, g, bl]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
    const kr = (a, b2) => { const [x, y] = [L(a), L(b2)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    const bak = (el) => {
      for (let a = el; a; a = a.parentElement) {
        const v = rgb(getComputedStyle(a).backgroundColor);
        if (v.length >= 3 && (v[3] === undefined || v[3] > 0.95)) return v;
      }
      return [0, 0, 0];
    };
    const ut = [];
    const rot = document.querySelector("[data-slep]");
    for (const el of rot.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
      if (el.classList.contains("visually-hidden")) continue;
      // bare bladnoder med egen tekst
      if ([...el.childNodes].every((n) => n.nodeType !== 3 || !n.textContent.trim())) continue;
      const q = el.getBoundingClientRect();
      if (q.width < 1 || q.height < 1) continue;
      const px = parseFloat(cs.fontSize);
      const fet = +cs.fontWeight >= 700 || (+cs.fontWeight >= 600 && px >= 18.66);
      const krav = px >= 24 || (fet && px >= 18.66) ? 3 : 4.5;
      ut.push({ t: el.textContent.trim().slice(0, 26), px: Math.round(px),
                r: +kr(rgb(cs.color), bak(el)).toFixed(2), krav });
    }
    // Skillelinje + knott er betjeningselementer: WCAG 1.4.11, 3:1
    const linje = rot.querySelector(".slep__linje");
    const knott = rot.querySelector(".slep__knott");
    if (getComputedStyle(linje).display !== "none") {
      ut.push({ t: "skillelinje mot panel", px: 0, krav: 3,
                r: +kr(rgb(getComputedStyle(linje).backgroundColor), bak(document.querySelector("[data-slep-panel]"))).toFixed(2) });
      ut.push({ t: "knottkant mot knottens egen bakgrunn", px: 0, krav: 3,
                r: +kr(rgb(getComputedStyle(knott).borderTopColor), rgb(getComputedStyle(knott).backgroundColor)).toFixed(2) });
    }
    return ut;
  });
  const palett = await p.evaluate(() => getComputedStyle(document.querySelector("[data-slep-panel]")).backgroundColor);
  const d = funn.filter((f) => f.r < f.krav);
  console.log(`  ${side}/${tema}/${bn} (panel ${palett}): ${funn.length} maalt, laveste ${Math.min(...funn.map(f=>f.r))}:1` + (d.length ? "  <-- UNDER KRAV" : "  ok"));
  for (const f of d) { nei.push(1); console.log(`      ${f.r}:1 (krav ${f.krav}) ${f.px}px «${f.t}»`); }
  await c.close();
}
console.log(nei.length ? `\n  ${nei.length} under krav` : "\n  alt over kravet");
await b.close();
