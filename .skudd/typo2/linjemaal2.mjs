/** linjemaal2.mjs <url> <bredde> <tema> [utfil]
 *
 *  Som linjemaal.mjs, men klaringen måles KOLONNEVIS: for hvert tegn på linje N
 *  finner vi tegnene på linje N+1 som overlapper vannrett, og måler blekk mot
 *  blekk bare der. Ellers rapporterer man kollisjon mellom en g i venstre marg
 *  og en Å i høyre – to glyffer som aldri møtes.
 *
 *  Metodens kjerne (verifisert: boksavvik = 0 på alle elementer):
 *   inline-boksens høyde = fontBoundingBoxAscent + fontBoundingBoxDescent,
 *   altså er grunnlinja = rektangelets topp + fontBoundingBoxAscent.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const [url, breddeRaa, tema = "dark", utfil] = process.argv.slice(2);
const bredde = Number(breddeRaa) || 1440;

const VALG = [
  ".mega", ".display-xl", ".display-lg", ".heading", ".subheading",
  ".horisont__overskrift", ".horisont__tittel", ".nokkeltall__verdi", ".nokkeltall__merke",
  ".mega-blokk__merke", ".horisont__merke",
  ".prose h2", ".prose h3", ".faq summary", ".body-lg", "p",
];

const b = await chromium.launch();
const c = await b.newContext({
  viewport: { width: bredde, height: 900 },
  colorScheme: tema === "light" ? "light" : "dark",
  reducedMotion: "reduce",
  deviceScaleFactor: 1,
});
const p = await c.newPage();
await p.goto(url, { waitUntil: "load" });
if (tema === "light") await p.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(350);

const data = await p.evaluate((VALG) => {
  const ctx = document.createElement("canvas").getContext("2d");
  const r2 = (n) => Math.round(n * 100) / 100;
  const buf = new Map();
  function mal(s, font) {
    const k = font + "\u0000" + s;
    if (buf.has(k)) return buf.get(k);
    ctx.font = font;
    const m = ctx.measureText(s);
    const o = { opp: m.actualBoundingBoxAscent, ned: m.actualBoundingBoxDescent, fOpp: m.fontBoundingBoxAscent, fNed: m.fontBoundingBoxDescent };
    buf.set(k, o);
    return o;
  }
  const fontAv = (el) => {
    const cs = getComputedStyle(el);
    return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  };

  function tegnliste(el) {
    const g = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const ut = [];
    let n;
    while ((n = g.nextNode())) {
      const t = n.nodeValue;
      const f = fontAv(n.parentElement);
      for (let i = 0; i < t.length; i++) {
        if (/\s/.test(t[i])) continue;
        const r = document.createRange();
        r.setStart(n, i); r.setEnd(n, i + 1);
        const b = r.getBoundingClientRect();
        if (!b.width && !b.height) continue;
        const m = mal(t[i], f);
        const grunn = b.top + m.fOpp;
        ut.push({ ch: t[i], v: b.left, h: b.right, top: b.top, boksH: b.height, grunn, blekkTopp: grunn - m.opp, blekkBunn: grunn + m.ned, font: f });
      }
    }
    return ut;
  }

  function tilLinjer(tegn) {
    const gr = [];
    for (const t of tegn) {
      let g = gr.find((g) => Math.abs(g.top - t.top) <= 2);
      if (!g) { g = { top: t.top, tegn: [] }; gr.push(g); }
      g.top = Math.min(g.top, t.top);
      g.tegn.push(t);
    }
    gr.sort((a, b) => a.top - b.top);
    for (const g of gr) {
      g.tegn.sort((a, b) => a.v - b.v);
      g.tekst = g.tegn.map((t) => t.ch).join("");
      g.grunn = Math.min(...g.tegn.map((t) => t.grunn));
      g.blekkTopp = Math.min(...g.tegn.map((t) => t.blekkTopp));
      g.blekkBunn = Math.max(...g.tegn.map((t) => t.blekkBunn));
      g.v = Math.min(...g.tegn.map((t) => t.v));
      g.h = Math.max(...g.tegn.map((t) => t.h));
    }
    return gr;
  }

  const funn = [];
  const sett = new Set();
  for (const v of VALG) {
    for (const el of document.querySelectorAll(v)) {
      if (sett.has(el)) continue;
      const rr = el.getBoundingClientRect();
      if (!rr.height || !rr.width) continue;
      if (!(el.textContent || "").trim()) continue;
      sett.add(el);
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const lh = cs.lineHeight === "normal" ? NaN : parseFloat(cs.lineHeight);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const T = tegnliste(el);
      if (!T.length) continue;
      const L = tilLinjer(T);

      // Kolonnevis klaring
      const par = [];
      for (let i = 1; i < L.length; i++) {
        const a = L[i - 1], b = L[i];
        let min = Infinity, hvor = null;
        for (const ta of a.tegn) for (const tb of b.tegn) {
          const ov = Math.min(ta.h, tb.h) - Math.max(ta.v, tb.v);
          if (ov <= 0.5) continue;
          const d = tb.blekkTopp - ta.blekkBunn;
          if (d < min) { min = d; hvor = ta.ch + "|" + tb.ch; }
        }
        par.push({
          mellom: `${i}->${i + 1}`,
          grunnAvstand: r2(b.grunn - a.grunn),
          linjeVerst: r2(b.blekkTopp - a.blekkBunn),
          kolonneMin: min === Infinity ? null : r2(min),
          glyffpar: hvor,
        });
      }

      // Norsk hodepine ved SAMME grunnlinjeavstand
      const gA = par.length ? Math.min(...par.map((x) => x.grunnAvstand)) : (isNaN(lh) ? NaN : lh);
      const ned = Math.max(mal("g", font).ned, mal("j", font).ned, mal("p", font).ned, mal(",", font).ned);
      const oppSmaa = Math.max(mal("å", font).opp, mal("ø", font).opp, mal("æ", font).opp, mal("j", font).opp, mal("b", font).opp);
      const oppStor = Math.max(mal("Å", font).opp, mal("Ø", font).opp, mal("Æ", font).opp, mal("Ä", font).opp, mal("Ö", font).opp);
      const u = (x) => r2(x), ue = (x) => r2(x / fs);

      funn.push({
        velger: v, tag: el.tagName.toLowerCase(), klasse: String(el.className || "").slice(0, 60),
        fs: r2(fs), lh: isNaN(lh) ? "normal" : r2(lh), forhold: isNaN(lh) ? null : r2(lh / fs),
        ls: r2(parseFloat(cs.letterSpacing) || 0), lsEm: r2((parseFloat(cs.letterSpacing) || 0) / fs),
        padBunn: r2(parseFloat(cs.paddingBottom)),
        boksavvik: r2(L[0].tegn[0].boksH - (mal("H", font).fOpp + mal("H", font).fNed)),
        antLinjer: L.length,
        linjer: L.map((g) => ({ t: g.tekst.slice(0, 44), grunn: r2(g.grunn), blekkTopp: r2(g.blekkTopp), blekkBunn: r2(g.blekkBunn), v: r2(g.v), h: r2(g.h) })),
        par,
        krav: { nedMaks: u(ned), nedMaksEm: ue(ned), oppSmaaMaks: u(oppSmaa), oppSmaaEm: ue(oppSmaa), oppStorMaks: u(oppStor), oppStorEm: ue(oppStor) },
        norskSmaa: gA ? u(gA - ned - oppSmaa) : null,
        norskSmaaEm: gA ? ue(gA - ned - oppSmaa) : null,
        norskStor: gA ? u(gA - ned - oppStor) : null,
        norskStorEm: gA ? ue(gA - ned - oppStor) : null,
        blekkUnderBoks: r2(L[L.length - 1].blekkBunn - rr.bottom),
        blekkOverBoks: r2(rr.top - L[0].blekkTopp),
        hoyreMarg: (() => { let k = el.parentElement; while (k) { const s = getComputedStyle(k); if (/hidden|clip|auto|scroll/.test(s.overflowX)) return r2(k.getBoundingClientRect().right - Math.max(...L.map((g) => g.h))); k = k.parentElement; } return null; })(),
        venstreMarg: (() => { let k = el.parentElement; while (k) { const s = getComputedStyle(k); if (/hidden|clip|auto|scroll/.test(s.overflowX)) return r2(Math.min(...L.map((g) => g.v)) - k.getBoundingClientRect().left); k = k.parentElement; } return null; })(),
        utenforSkjerm: r2(Math.max(0, Math.max(...L.map((g) => g.h)) - innerWidth)),
        tilNeste: (() => {
          const n = el.nextElementSibling; if (!n) return null;
          const nr = n.getBoundingClientRect();
          const nT = tegnliste(n); const nL = nT.length ? tilLinjer(nT) : [];
          return {
            tag: n.tagName.toLowerCase() + (n.className ? "." + String(n.className).split(/\s+/)[0] : ""),
            boksGap: r2(nr.top - rr.bottom),
            blekkGap: nL.length ? r2(nL[0].blekkTopp - L[L.length - 1].blekkBunn) : null,
            blekkGapEm: nL.length ? r2((nL[0].blekkTopp - L[L.length - 1].blekkBunn) / fs) : null,
          };
        })(),
        ordhull: (() => {
          const g = L.reduce((a, b) => (b.tegn.length > a.tegn.length ? b : a), L[0]);
          const h = [];
          for (let i = 1; i < g.tegn.length; i++) h.push(g.tegn[i].v - g.tegn[i - 1].h);
          const ord = h.filter((x) => x > fs * 0.06).sort((a, b) => a - b);
          const bok = h.filter((x) => x <= fs * 0.06).sort((a, b) => a - b);
          return { ordMin: ord.length ? r2(ord[0]) : null, ordMinEm: ord.length ? r2(ord[0] / fs) : null, bokMedian: bok.length ? r2(bok[Math.floor(bok.length / 2)]) : null, bokMedianEm: bok.length ? r2(bok[Math.floor(bok.length / 2)] / fs) : null };
        })(),
      });
    }
  }
  return { url: location.pathname, funn };
}, VALG);

data.tema = tema; data.viewport = bredde;
if (utfil) writeFileSync(utfil, JSON.stringify(data, null, 1));
const AV = process.env.ALLE ? () => true : (f) => /mega|display|heading|horisont__overskrift|horisont__tittel|nokkeltall__verdi|prose h|faq/.test(f.velger);
console.log(`### ${data.url}  ${bredde}px  ${tema}  (${data.funn.length} elementer)`);
for (const f of data.funn) {
  if (!AV(f)) continue;
  const kol = f.par.map((x) => `${x.kolonneMin}${x.glyffpar ? "[" + x.glyffpar + "]" : ""}`).join(" ");
  console.log(`  ${f.velger.padEnd(21)} ${String(f.fs).padStart(6)}/${String(f.lh).padEnd(6)}=${String(f.forhold).padEnd(5)} n=${f.antLinjer} kolonneklaring={${kol}} norsk(å)=${f.norskSmaaEm}em norsk(Å)=${f.norskStorEm}em underBoks=${f.blekkUnderBoks} hMarg=${f.hoyreMarg} utenfor=${f.utenforSkjerm}${f.tilNeste ? ` ->${f.tilNeste.tag} ${f.tilNeste.blekkGap}px/${f.tilNeste.blekkGapEm}em` : ""}`);
}
await b.close();
