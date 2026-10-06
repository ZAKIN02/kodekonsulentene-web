/** SYN: ser paa en side slik en bruker ser den.
 *  - Scroller gjennom hele siden, tar ekte visningsbilder (ikke fullPage, som
 *    fotograferer scroll-drevne elementer paa opasitet 0).
 *  - Maaler bevegelse i ro paa HVERT stopp, med ekte raa piksler (sharp), og
 *    med samme byte-sampling som referansemaalingen (153 / 485 / 495) slik at
 *    tallene kan sammenlignes.
 *  - Maaler per seksjon: beveger denne seksjonen seg i det hele tatt?
 *  - Teller videoer, deres effektive opasitet, og om de faktisk spiller.
 *  Bruk: node .skudd/syn-side.mjs <url> <navn> [bredde] [hoyde]
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const [url, navn, bRaa = "1440", hRaa = "900"] = process.argv.slice(2);
const VB = Number(bRaa), VH = Number(hRaa);
const UT = `.skudd/syn/${navn}`;
mkdirSync(UT, { recursive: true });

const AKSENT = [[200, 242, 74], [182, 230, 42], [212, 247, 106], [61, 102, 0]];

function naerAksent(s) {
  const m = String(s).match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (!m) return false;
  const [r, g, b] = [+m[1], +m[2], +m[3]];
  return AKSENT.some(([R, G, B]) => Math.abs(r - R) < 30 && Math.abs(g - G) < 30 && Math.abs(b - B) < 30);
}

async function diff(a, b) {
  // Raa piksler: ekte gjennomsnittlig avvik + andel piksler som endret seg
  const [ra, rb] = await Promise.all([
    sharp(a).raw().toBuffer({ resolveWithObject: true }),
    sharp(b).raw().toBuffer({ resolveWithObject: true }),
  ]);
  const A = ra.data, B = rb.data;
  const n = Math.min(A.length, B.length);
  let sum = 0, endret = 0;
  for (let i = 0; i < n; i++) { const d = Math.abs(A[i] - B[i]); sum += d; if (d > 6) endret++; }
  // Samme metode som referansemaalingen, paa komprimert PNG, hver 997. byte
  let bytes = 0;
  const m = Math.min(a.length, b.length);
  for (let i = 0; i < m; i += 997) if (a[i] !== b[i]) bytes++;
  return { snitt: +(sum / n).toFixed(4), andelEndret: +((endret / n) * 100).toFixed(2), byteAvvik: bytes };
}

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: VB, height: VH }, deviceScaleFactor: 1 });
const konsollfeil = [];
p.on("pageerror", (e) => konsollfeil.push(String(e).slice(0, 180)));
p.on("console", (m) => { if (m.type() === "error") konsollfeil.push(m.text().slice(0, 180)); });
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(2500);

const hoyde = await p.evaluate(() => document.documentElement.scrollHeight);

// ---- Seksjonskart ----
const seksjoner = await p.evaluate(() => {
  const ut = [];
  for (const s of document.querySelectorAll("main > section, main > div > section, body > section, main > *")) {
    const r = s.getBoundingClientRect();
    if (r.height < 120) continue;
    const topp = r.top + scrollY;
    const t = (s.querySelector("h1,h2,h3")?.textContent || s.textContent || "").trim().replace(/\s+/g, " ").slice(0, 52);
    if (ut.some((x) => Math.abs(x.topp - topp) < 40)) continue;
    ut.push({ tag: s.tagName.toLowerCase(), klasse: (s.className || "").toString().slice(0, 60), topp: Math.round(topp), h: Math.round(r.height), tittel: t });
  }
  return ut;
});

// ---- Statiske maal ----
const maal = await p.evaluate(() => {
  const vw = innerWidth;
  let aksentBruk = 0, blodning = 0, blodningEkte = 0, objekter = 0, transform = 0;
  const animer = new Set(), skrift = new Set();
  const aksentTreff = [];
  const AKS = [[200, 242, 74], [182, 230, 42], [212, 247, 106], [61, 102, 0]];
  const naer = (s) => {
    const m = String(s).match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+([\d.]+))?/);
    if (!m) return false;
    if (m[4] !== undefined && +m[4] < 0.06) return false;
    const [r, g, bl] = [+m[1], +m[2], +m[3]];
    return AKS.some(([R, G, B]) => Math.abs(r - R) < 30 && Math.abs(g - G) < 30 && Math.abs(bl - B) < 30);
  };
  const harScroller = (el) => {
    for (let n = el.parentElement; n; n = n.parentElement) {
      const o = getComputedStyle(n);
      if (/auto|scroll/.test(o.overflowX)) return true;
      if (o.overflowX === "hidden") return "klipp";
    }
    return false;
  };
  for (const el of document.querySelectorAll("*")) {
    const c = getComputedStyle(el), r = el.getBoundingClientRect();
    if (c.display === "none" || c.visibility === "hidden") continue;
    skrift.add(c.fontSize);
    if (c.animationName !== "none") animer.add(c.animationName);
    if (c.transform !== "none" && c.transform !== "matrix(1, 0, 0, 1, 0, 0)") transform++;
    const synlig = +c.opacity > 0.05 && r.width > 2 && r.height > 2;
    if (synlig) {
      let t = false;
      for (const k of ["color", "backgroundColor", "borderTopColor", "borderLeftColor", "fill", "stroke", "outlineColor", "textDecorationColor"]) {
        if (naer(c[k])) { t = true; break; }
      }
      if (!t && /gradient/.test(c.backgroundImage) && naer(c.backgroundImage)) t = true;
      if (t) { aksentBruk++; aksentTreff.push(`${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}`); }
      // Visuelle objekter: alt som ikke er ren tekst og som baerer et motiv
      const tg = el.tagName;
      if (tg === "IMG" || tg === "VIDEO" || tg === "CANVAS" || tg === "SVG" || tg === "svg") { if (r.width > 24 && r.height > 24) objekter++; }
      else if (/url\(|gradient/.test(c.backgroundImage) && r.width > 40 && r.height > 40) objekter++;
      else if (el.children.length === 0 && !el.textContent.trim() && (c.borderTopWidth !== "0px" || c.backgroundColor !== "rgba(0, 0, 0, 0)") && r.width > 16 && r.height > 16) objekter++;
      // Blodning utenfor skjermkant
      if (r.right > vw + 1 || r.left < -1) {
        blodning++;
        const s = harScroller(el);
        if (s === false || s === "klipp") blodningEkte++;
      }
    }
  }
  const vid = [...document.querySelectorAll("video")].map((v) => {
    let op = 1;
    for (let n = v; n; n = n.parentElement) { const o = getComputedStyle(n); op *= +o.opacity; }
    const r = v.getBoundingClientRect();
    return {
      src: (v.currentSrc || v.querySelector("source")?.src || "").split("/").slice(-1)[0],
      w: Math.round(r.width), h: Math.round(r.height),
      opasitet: +op.toFixed(3), mix: getComputedStyle(v).mixBlendMode, filter: getComputedStyle(v).filter,
      autoplay: v.autoplay, loop: v.loop, paused: v.paused, readyState: v.readyState,
      varighet: v.duration ? +v.duration.toFixed(1) : null, posisjon: +v.currentTime.toFixed(1),
      preload: v.preload, poster: !!v.poster,
    };
  });
  return {
    hoyde: document.documentElement.scrollHeight, aksentBruk,
    aksentTreff: aksentTreff.slice(0, 20),
    blodning, blodningEkte, objekter, transform,
    animasjoner: [...animer], unikeSkriftstorrelser: skrift.size, videoer: vid,
  };
});

// ---- Scroll gjennom siden, maal bevegelse i ro paa hvert stopp ----
const steg = Math.max(1, Math.ceil((hoyde - VH) / (VH * 0.8)) + 1);
const stopp = [];
const filer = [];
for (let i = 0; i < steg; i++) {
  const y = Math.round(((hoyde - VH) * i) / Math.max(1, steg - 1));
  await p.evaluate((v) => scrollTo({ top: v, behavior: "instant" }), y);
  await p.waitForTimeout(1100);
  const a = await p.screenshot();
  await p.waitForTimeout(1500);
  const c = await p.screenshot();
  const d = await diff(a, c);
  const f = `${UT}/r${String(i).padStart(2, "0")}.png`;
  writeFileSync(f, c);
  filer.push(f);
  // Hva er i syne her?
  const synlig = await p.evaluate(() => {
    const ut = [];
    for (const s of document.querySelectorAll("section")) {
      const r = s.getBoundingClientRect();
      if (r.bottom > 80 && r.top < innerHeight - 80) {
        ut.push((s.querySelector("h1,h2,h3")?.textContent || s.className || s.tagName).toString().trim().replace(/\s+/g, " ").slice(0, 44));
      }
    }
    const vspiller = [...document.querySelectorAll("video")].filter((v) => {
      const r = v.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight && !v.paused;
    }).length;
    return { seksjoner: ut, videoerSpiller: vspiller };
  });
  stopp.push({ i, y, ...d, ...synlig });
}

const rapport = { navn, url, viewport: `${VB}x${VH}`, hoyde, ...maal, seksjoner, stopp, konsollfeil: [...new Set(konsollfeil)].slice(0, 6) };
writeFileSync(`${UT}/maal.json`, JSON.stringify(rapport, null, 1));
console.log(JSON.stringify({
  navn, hoyde, aksentBruk: maal.aksentBruk, objekter: maal.objekter,
  blodning: maal.blodning, blodningEkte: maal.blodningEkte, transform: maal.transform,
  animasjoner: maal.animasjoner.length, videoer: maal.videoer.length,
  videoOpasitet: maal.videoer.map((v) => v.opasitet),
  roStopp: stopp.map((s) => `${s.y}:${s.snitt}/${s.byteAvvik}`).join(" "),
  maksRo: Math.max(...stopp.map((s) => s.snitt)), maksByte: Math.max(...stopp.map((s) => s.byteAvvik)),
  dodeStopp: stopp.filter((s) => s.snitt < 0.02).length + "/" + stopp.length,
  feil: rapport.konsollfeil.length,
}));
await b.close();
