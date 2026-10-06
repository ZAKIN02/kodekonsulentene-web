/** linjemaal.mjs <url> <bredde> <tema> [utfil]
 *
 *  Måler FAKTISK blekkavstand mellom linjene i en overskrift, ikke line-height.
 *
 *  Metode:
 *   1. Ett Range per tegn -> klientrektangler. Tegn grupperes til LINJER på
 *      rektangelets top (inline-boksens topp), ikke på visuell gjetning.
 *   2. Grunnlinja utledes av fontens egne metrikker: canvas measureText gir
 *      fontBoundingBoxAscent, som er NØYAKTIG den verdien Chrome bruker til å
 *      sette inline-boksens høyde. Vi verifiserer det ved å sammenligne
 *      ascent+descent mot rektangelets høyde, og rapporterer avviket.
 *   3. Blekkutstrekningen per linje kommer fra actualBoundingBoxAscent/Descent
 *      på linjas EGEN tekst. Da fanger vi ringen i å og prikkene i ø der de
 *      faktisk står, ikke som et gjennomsnitt.
 *   4. klaring(i) = blekkTopp(i+1) - blekkBunn(i). Negativ = kollisjon.
 *
 *  I tillegg måles «norsk verste tilfelle»: samme linjeavstand med Ågj mot Ågj,
 *  altså det som skjer så snart teksten endres til et ord med ring og nedstrek.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const [url, breddeRaa, tema = "dark", utfil] = process.argv.slice(2);
const bredde = Number(breddeRaa) || 1440;

const VALG = [
  ".mega", ".mega--stor", ".mega--mellom",
  ".display-xl", ".display-lg", ".heading", ".subheading",
  ".horisont__overskrift", ".nokkeltall__verdi",
  ".prose h2", ".prose h3", ".faq summary",
  ".body-lg", ".hero__lead", ".section__head p", "p",
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
await p.waitForTimeout(400);

const data = await p.evaluate((VALG) => {
  const lerret = document.createElement("canvas").getContext("2d");
  const r2 = (n) => Math.round(n * 100) / 100;

  function fontStreng(cs) {
    return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} / normal ${cs.fontFamily}`;
  }
  function mal(tekst, font) {
    lerret.font = font;
    const m = lerret.measureText(tekst);
    return {
      opp: m.actualBoundingBoxAscent,
      ned: m.actualBoundingBoxDescent,
      fOpp: m.fontBoundingBoxAscent,
      fNed: m.fontBoundingBoxDescent,
      bredde: m.width,
    };
  }

  // Alle tegnrektangler i elementet, gruppert til linjer.
  function linjer(el) {
    const gaar = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const treff = [];
    let n;
    while ((n = gaar.nextNode())) {
      const t = n.nodeValue;
      for (let i = 0; i < t.length; i++) {
        if (/\s/.test(t[i])) continue;
        const r = document.createRange();
        r.setStart(n, i);
        r.setEnd(n, i + 1);
        const b = r.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue;
        treff.push({ ch: t[i], top: b.top, bunn: b.bottom, venstre: b.left, hoyre: b.right, h: b.height, node: n });
      }
    }
    if (!treff.length) return [];
    // Grupper på top (toleranse 2 px for subpiksel / ulike inline-bokser).
    const grupper = [];
    for (const t of treff) {
      let g = grupper.find((g) => Math.abs(g.top - t.top) <= 2);
      if (!g) { g = { top: t.top, bunn: t.bunn, h: t.h, tegn: [] }; grupper.push(g); }
      g.top = Math.min(g.top, t.top);
      g.bunn = Math.max(g.bunn, t.bunn);
      g.h = Math.max(g.h, t.h);
      g.tegn.push(t);
    }
    grupper.sort((a, b) => a.top - b.top);
    for (const g of grupper) {
      g.tegn.sort((a, b) => a.venstre - b.venstre);
      g.tekst = g.tegn.map((t) => t.ch).join("");
      g.venstre = Math.min(...g.tegn.map((t) => t.venstre));
      g.hoyre = Math.max(...g.tegn.map((t) => t.hoyre));
    }
    return grupper;
  }

  // Ordmellomrom: avstand mellom siste tegn i ett ord og første i neste, på samme linje.
  function ordgap(g) {
    const ut = [];
    for (let i = 1; i < g.tegn.length; i++) {
      const a = g.tegn[i - 1], b = g.tegn[i];
      if (a.node === b.node) {
        // Mellomrom i samme tekstnode gir hull > bokstavavstand.
        const hull = b.venstre - a.hoyre;
        ut.push(hull);
      } else {
        ut.push(b.venstre - a.hoyre);
      }
    }
    return ut;
  }

  const funn = [];
  const sett = new Set();
  for (const v of VALG) {
    for (const el of document.querySelectorAll(v)) {
      if (sett.has(el)) continue;
      const rr = el.getBoundingClientRect();
      if (rr.height === 0 || rr.width === 0) continue;
      const txt = (el.textContent || "").trim();
      if (!txt) continue;
      sett.add(el);
      const cs = getComputedStyle(el);
      const font = fontStreng(cs);
      const fs = parseFloat(cs.fontSize);
      const lh = cs.lineHeight === "normal" ? NaN : parseFloat(cs.lineHeight);
      const ls = cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing);
      const ws = cs.wordSpacing === "normal" ? 0 : parseFloat(cs.wordSpacing);

      const L = linjer(el);
      if (!L.length) continue;

      const m0 = mal("Hxg", font);
      const boksH = m0.fOpp + m0.fNed;          // inline-boksens forventede høyde
      const avvik = r2(L[0].h - boksH);          // skal være ~0

      const linjeInfo = L.map((g) => {
        const m = mal(g.tekst, font);
        const grunn = g.top + m.fOpp;            // grunnlinje
        return {
          tekst: g.tekst.slice(0, 48),
          top: r2(g.top), bunn: r2(g.bunn), h: r2(g.h),
          grunnlinje: r2(grunn),
          blekkTopp: r2(grunn - m.opp),
          blekkBunn: r2(grunn + m.ned),
          opp: r2(m.opp), ned: r2(m.ned),
          venstre: r2(g.venstre), hoyre: r2(g.hoyre),
        };
      });

      const klaringer = [];
      for (let i = 1; i < linjeInfo.length; i++) {
        klaringer.push({
          mellom: `${i}->${i + 1}`,
          grunnAvstand: r2(linjeInfo[i].grunnlinje - linjeInfo[i - 1].grunnlinje),
          blekkKlaring: r2(linjeInfo[i].blekkTopp - linjeInfo[i - 1].blekkBunn),
          ned: linjeInfo[i - 1].ned,
          opp: linjeInfo[i].opp,
        });
      }

      // Norsk verste tilfelle ved SAMME linjeavstand.
      const mNed = mal("gjpyQ,", font);
      const mOpp = mal("ÅÄÖØÆåäöø", font);
      const grunnAvstand = klaringer.length
        ? Math.min(...klaringer.map((k) => k.grunnAvstand))
        : (isNaN(lh) ? boksH : lh);
      const verste = r2(grunnAvstand - mNed.ned - mOpp.opp);

      // Klipping: hvor nær er siste linjes blekk elementets egen underkant,
      // og klipper noen forelder?
      const sisteBlekk = linjeInfo[linjeInfo.length - 1].blekkBunn;
      const forsteBlekk = linjeInfo[0].blekkTopp;
      let klipper = null;
      for (let a = el.parentElement; a; a = a.parentElement) {
        const acs = getComputedStyle(a);
        if (/hidden|clip|auto|scroll/.test(acs.overflowY) || /hidden|clip/.test(acs.overflowX)) {
          const ar = a.getBoundingClientRect();
          klipper = {
            velger: a.tagName.toLowerCase() + (a.className ? "." + String(a.className).split(/\s+/).filter(Boolean).join(".") : ""),
            overflowX: acs.overflowX, overflowY: acs.overflowY,
            margUnder: r2(ar.bottom - sisteBlekk),
            margOver: r2(forsteBlekk - ar.top),
            margHoyre: r2(ar.right - Math.max(...linjeInfo.map((l) => l.hoyre))),
            margVenstre: r2(Math.min(...linjeInfo.map((l) => l.venstre)) - ar.left),
          };
          break;
        }
      }

      // Avstand ned til neste søsken, målt blekk-til-blekk når det er tekst.
      let tilNeste = null;
      const nes = el.nextElementSibling;
      if (nes) {
        const nr = nes.getBoundingClientRect();
        const ncs = getComputedStyle(nes);
        const nL = linjer(nes);
        let nBlekkTopp = nr.top;
        if (nL.length) {
          const nm = mal(nL[0].tekst, fontStreng(ncs));
          nBlekkTopp = nL[0].top + nm.fOpp - nm.opp;
        }
        tilNeste = {
          tag: nes.tagName.toLowerCase() + (nes.className ? "." + String(nes.className).split(/\s+/).filter(Boolean)[0] : ""),
          boksGap: r2(nr.top - el.getBoundingClientRect().bottom),
          blekkGap: r2(nBlekkTopp - sisteBlekk),
        };
      }

      funn.push({
        velger: v,
        tag: el.tagName.toLowerCase(),
        klasse: String(el.className || "").slice(0, 70),
        fontSize: r2(fs),
        lineHeight: isNaN(lh) ? "normal" : r2(lh),
        forhold: isNaN(lh) ? null : r2(lh / fs),
        letterSpacing: r2(ls), letterSpacingEm: r2(ls / fs),
        wordSpacing: r2(ws),
        padBunn: r2(parseFloat(cs.paddingBottom)),
        boksHoydeAvvik: avvik,
        antLinjer: linjeInfo.length,
        linjer: linjeInfo,
        klaringer,
        norskVerste: verste,
        norskVersteEm: r2(verste / fs),
        padRestEtterNed: r2(parseFloat(cs.paddingBottom) - (linjeInfo[linjeInfo.length - 1].blekkBunn - (L[L.length - 1].bunn - (isNaN(lh) ? 0 : 0)))),
        blekkUnderBoks: r2(sisteBlekk - el.getBoundingClientRect().bottom),
        blekkOverBoks: r2(el.getBoundingClientRect().top - forsteBlekk),
        klipper,
        tilNeste,
        // ordmellomrom-hull på bredeste linje
        ordhull: (() => {
          const g = L.reduce((a, b) => (b.tegn.length > a.tegn.length ? b : a), L[0]);
          const h = ordgap(g).filter((x) => x > 0.5).sort((a, b) => a - b);
          if (!h.length) return null;
          return { min: r2(h[0]), median: r2(h[Math.floor(h.length / 2)]), maks: r2(h[h.length - 1]), minEm: r2(h[0] / fs), maksEm: r2(h[h.length - 1] / fs) };
        })(),
      });
    }
  }
  return {
    url: location.pathname,
    bredde: innerWidth,
    funn,
  };
}, VALG);

data.tema = tema;
data.viewport = bredde;
const linje = (o) => JSON.stringify(o);
if (utfil) writeFileSync(utfil, JSON.stringify(data, null, 1));
console.log(linje({ url: data.url, bredde, tema, antall: data.funn.length }));
for (const f of data.funn) {
  const kl = f.klaringer.map((k) => k.blekkKlaring).join(", ");
  console.log(
    `  ${f.velger.padEnd(22)} ${String(f.fontSize).padStart(6)}px/${String(f.lineHeight).padStart(6)} (${String(f.forhold).padStart(5)})  linjer=${f.antLinjer}  blekkklaring=[${kl}]  norskVerste=${f.norskVerste}px (${f.norskVersteEm}em)  boksavvik=${f.boksHoydeAvvik}  blekkUnderBoks=${f.blekkUnderBoks}` +
    (f.klipper ? `  klipp(${f.klipper.overflowX}/${f.klipper.overflowY}) margUnder=${f.klipper.margUnder} margHoyre=${f.klipper.margHoyre}` : "") +
    (f.tilNeste ? `  ->${f.tilNeste.tag} blekkGap=${f.tilNeste.blekkGap}` : "")
  );
}
await b.close();
