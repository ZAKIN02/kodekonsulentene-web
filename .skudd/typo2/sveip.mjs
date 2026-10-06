/** sveip.mjs – alle sider x alle bredder x begge tema. Rapporterer bare det som
 *  er trangt: kolonneklaring under terskel, negativ norsk-margin, klipp, overflyt. */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const SIDER = process.env.SIDER ? process.env.SIDER.split(",") : [
  "/", "/apper-og-ai", "/nettsider", "/systemer", "/sikkerhet", "/priser", "/sjekk",
  "/om", "/caser", "/kontakt", "/handbok", "/status", "/historie", "/personvern", "/vilkar",
  "/verktoy", "/verktoy/dmarc", "/verktoy/uu-sjekk", "/verktoy/cookie-sjekk", "/verktoy/priskalkulator",
  "/bransjer/klinikker", "/bransjer/handverkere", "/lab/typo",
];
const BREDDER = (process.env.BREDDER || "390,412,768,1024,1440,1920").split(",").map(Number);
const TEMAER = (process.env.TEMAER || "dark,light").split(",");
const BASE = process.env.BASE || "http://127.0.0.1:4330";
const UT = process.env.UT || ".skudd/typo2/sveip.json";
const TERSKEL = Number(process.env.TERSKEL || 6);

const VALG = [".mega", ".display-xl", ".display-lg", ".heading", ".subheading",
  ".horisont__overskrift", ".horisont__tittel", ".nokkeltall__verdi", ".nokkeltall__merke",
  ".mega-blokk__merke", ".prose h2", ".prose h3", ".faq summary", ".body-lg", "p", "li", "dt", "dd"];

const b = await chromium.launch();
const rader = [];
for (const tema of TEMAER) {
  for (const bredde of BREDDER) {
    const c = await b.newContext({ viewport: { width: bredde, height: 900 }, colorScheme: tema === "light" ? "light" : "dark", reducedMotion: "reduce", deviceScaleFactor: 1 });
    const p = await c.newPage();
    for (const side of SIDER) {
      try {
        await p.goto(BASE + side, { waitUntil: "load", timeout: 25000 });
        if (tema === "light") await p.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(200);
        const r = await p.evaluate((VALG) => {
          const ctx = document.createElement("canvas").getContext("2d");
          const r2 = (n) => Math.round(n * 100) / 100;
          const buf = new Map();
          const mal = (s, f) => { const k = f + "\u0000" + s; if (buf.has(k)) return buf.get(k); ctx.font = f; const m = ctx.measureText(s); const o = { opp: m.actualBoundingBoxAscent, ned: m.actualBoundingBoxDescent, fOpp: m.fontBoundingBoxAscent, fNed: m.fontBoundingBoxDescent }; buf.set(k, o); return o; };
          const fontAv = (el) => { const cs = getComputedStyle(el); return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; };
          function tegn(el) { const g = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const ut = []; let n; while ((n = g.nextNode())) { const t = n.nodeValue; const f = fontAv(n.parentElement); for (let i = 0; i < t.length; i++) { if (/\s/.test(t[i])) continue; const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); const b = r.getBoundingClientRect(); if (!b.width && !b.height) continue; const m = mal(t[i], f); const gr = b.top + m.fOpp; ut.push({ ch: t[i], v: b.left, h: b.right, top: b.top, boksH: b.height, grunn: gr, bt: gr - m.opp, bb: gr + m.ned }); } } return ut; }
          function linj(T) { const gr = []; for (const t of T) { let g = gr.find((g) => Math.abs(g.top - t.top) <= 2); if (!g) { g = { top: t.top, tegn: [] }; gr.push(g); } g.top = Math.min(g.top, t.top); g.tegn.push(t); } gr.sort((a, b) => a.top - b.top); for (const g of gr) { g.tegn.sort((a, b) => a.v - b.v); g.tekst = g.tegn.map((t) => t.ch).join(""); g.grunn = Math.min(...g.tegn.map((t) => t.grunn)); g.bt = Math.min(...g.tegn.map((t) => t.bt)); g.bb = Math.max(...g.tegn.map((t) => t.bb)); g.v = Math.min(...g.tegn.map((t) => t.v)); g.h = Math.max(...g.tegn.map((t) => t.h)); } return gr; }
          const ut = []; const sett = new Set();
          for (const v of VALG) for (const el of document.querySelectorAll(v)) {
            if (sett.has(el)) continue; const rr = el.getBoundingClientRect();
            if (!rr.height || !rr.width || !(el.textContent || "").trim()) continue; sett.add(el);
            const cs = getComputedStyle(el); const fs = parseFloat(cs.fontSize);
            const lh = cs.lineHeight === "normal" ? NaN : parseFloat(cs.lineHeight);
            const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            const T = tegn(el); if (!T.length) continue; const L = linj(T);
            const par = [];
            for (let i = 1; i < L.length; i++) { const a = L[i - 1], bq = L[i]; let min = Infinity, hv = null; for (const ta of a.tegn) for (const tb of bq.tegn) { const ov = Math.min(ta.h, tb.h) - Math.max(ta.v, tb.v); if (ov <= 0.5) continue; const d = tb.bt - ta.bb; if (d < min) { min = d; hv = ta.ch + "|" + tb.ch; } } par.push({ ga: r2(bq.grunn - a.grunn), kol: min === Infinity ? null : r2(min), gl: hv }); }
            const ga = par.length ? Math.min(...par.map((x) => x.ga)) : (isNaN(lh) ? NaN : lh);
            const ned = Math.max(mal("g", font).ned, mal("j", font).ned, mal("p", font).ned, mal(",", font).ned);
            const oS = Math.max(mal("å", font).opp, mal("ø", font).opp, mal("æ", font).opp, mal("j", font).opp, mal("b", font).opp, mal("t", font).opp);
            const oB = Math.max(mal("Å", font).opp, mal("Ø", font).opp, mal("Æ", font).opp);
            let klippMarg = null, klippEl = null;
            for (let k = el.parentElement; k; k = k.parentElement) { const s = getComputedStyle(k); if (/hidden|clip/.test(s.overflowX) || /hidden|clip/.test(s.overflowY)) { const kr = k.getBoundingClientRect(); klippEl = k.tagName.toLowerCase() + "." + String(k.className || "").split(/\s+/)[0]; klippMarg = { under: r2(kr.bottom - L[L.length - 1].bb), hoyre: r2(kr.right - Math.max(...L.map((g) => g.h))), venstre: r2(Math.min(...L.map((g) => g.v)) - kr.left), over: r2(L[0].bt - kr.top) }; break; } }
            ut.push({ v, tag: el.tagName.toLowerCase(), kl: String(el.className || "").slice(0, 46), fs: r2(fs), lh: isNaN(lh) ? null : r2(lh), fh: isNaN(lh) ? null : r2(lh / fs), n: L.length,
              kolMin: par.length ? Math.min(...par.map((x) => x.kol ?? Infinity)) : null, gl: par.length ? (par.find((x) => x.kol === Math.min(...par.map((y) => y.kol ?? Infinity))) || {}).gl : null,
              nS: ga ? r2(ga - ned - oS) : null, nSem: ga ? r2((ga - ned - oS) / fs) : null, nB: ga ? r2(ga - ned - oB) : null, nBem: ga ? r2((ga - ned - oB) / fs) : null,
              underBoks: r2(L[L.length - 1].bb - rr.bottom), klippEl, klippMarg,
              utenfor: r2(Math.max(0, Math.max(...L.map((g) => g.h)) - innerWidth)),
              tekst: L.map((g) => g.tekst).join(" / ").slice(0, 70),
            });
          }
          return ut;
        }, VALG);
        for (const x of r) rader.push({ side, bredde, tema, ...x });
      } catch (e) { rader.push({ side, bredde, tema, feil: String(e).slice(0, 120) }); }
    }
    await p.close(); await c.close();
  }
}
await b.close();
mkdirSync(".skudd/typo2", { recursive: true });
writeFileSync(UT, JSON.stringify(rader));
// rapport
const d = (x) => x === null || x === undefined ? "–" : x;
const trange = rader.filter((r) => r.kolMin !== null && r.kolMin !== undefined && isFinite(r.kolMin) && r.kolMin < TERSKEL);
console.log(`\n== KOLONNEKOLLISJON / TRANGT (< ${TERSKEL} px faktisk blekkklaring) – ${trange.length} treff av ${rader.length} målinger`);
const grp = new Map();
for (const r of trange) { const k = `${r.v}|${r.fh}`; if (!grp.has(k)) grp.set(k, []); grp.get(k).push(r); }
for (const [k, v] of [...grp].sort((a, b) => Math.min(...a[1].map(r=>r.kolMin)) - Math.min(...b[1].map(r=>r.kolMin)))) {
  v.sort((a, b) => a.kolMin - b.kolMin);
  console.log(`\n  ${k}  (${v.length} treff, verst ${v[0].kolMin}px)`);
  for (const r of v.slice(0, 7)) console.log(`     ${String(r.kolMin).padStart(7)}px [${d(r.gl)}]  ${r.side} ${r.bredde}/${r.tema}  ${r.fs}px/${r.lh}  «${r.tekst}»`);
}
console.log(`\n== NORSK HODEROM (ved dagens linjeavstand) – unike klasser`);
const u = new Map();
for (const r of rader) { if (r.nSem === null || r.nSem === undefined) continue; const k = `${r.v} ${r.fh}`; const o = u.get(k); if (!o || r.nSem < o.nSem) u.set(k, r); }
for (const [k, r] of [...u].sort((a, b) => a[1].nSem - b[1].nSem)) console.log(`  ${k.padEnd(32)} å:${String(r.nSem).padStart(6)}em  Å:${String(r.nBem).padStart(6)}em   (${r.fs}px/${r.lh})`);
const klipp = rader.filter((r) => r.klippMarg && (r.klippMarg.under < 0 || r.klippMarg.hoyre < 0 || r.klippMarg.venstre < 0 || r.klippMarg.over < 0));
console.log(`\n== KLIPP (blekk utenfor klippende forelder) – ${klipp.length}`);
for (const r of klipp.slice(0, 25)) console.log(`  ${r.side} ${r.bredde}/${r.tema} ${r.v} ${r.klippEl} ${JSON.stringify(r.klippMarg)} «${r.tekst.slice(0,40)}»`);
const ov = rader.filter((r) => r.utenfor > 0.5);
console.log(`\n== UTENFOR SKJERM – ${ov.length}`);
for (const r of ov.slice(0, 20)) console.log(`  ${r.side} ${r.bredde}/${r.tema} ${r.v} +${r.utenfor}px «${r.tekst.slice(0,40)}»`);
const ub = rader.filter((r) => r.underBoks > 0);
console.log(`\n== BLEKK UNDER EGEN BOKS (nedstrek stikker ut) – ${ub.length}`);
const ubg = new Map(); for (const r of ub) { const k = r.v + "|" + r.fh; if (!ubg.has(k) || ubg.get(k).underBoks < r.underBoks) ubg.set(k, r); }
for (const [k, r] of ubg) console.log(`  ${k.padEnd(28)} +${r.underBoks}px  ${r.side} ${r.bredde} ${r.fs}px «${r.tekst.slice(0,34)}»`);
