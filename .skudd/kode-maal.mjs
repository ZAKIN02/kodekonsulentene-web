/** Måler KodeBygg: degradering, overflyt, kontrast på EKTE piksler og fokus.
 *
 *  Kontrasten leses bak hver glyf i et skjermbilde, ikke av computed style:
 *  rgba(0,0,0,0) lest som svart ga falske brudd sist. Her beholdes alfakanalen
 *  ved at vi måler mot det som FAKTISK er malt.
 *
 *  node .skudd/kode-maal.mjs <url>
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";

const url = process.argv[2];
const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
const kontrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const b = await chromium.launch();

async function side(opt) {
  const p = await b.newPage(opt);
  await p.goto(url, { waitUntil: "load", timeout: 45000 });
  return p;
}

// ---------------------------------------------------- 1. degradering --------
for (const [navn, opt] of [
  ["redusert bevegelse", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
  ["uten JavaScript", { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }],
  ["vanlig", { viewport: { width: 1440, height: 900 } }],
]) {
  const p = await side(opt);
  await p.evaluate(() => {
    const el = document.querySelector(".kodebygg");
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 60, behavior: "instant" });
  }).catch(() => {});
  await p.waitForTimeout(opt.javaScriptEnabled === false ? 500 : 5000);
  const r = await p.evaluate(() => {
    const synlig = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== "hidden" && +s.opacity > 0.9 && r.width > 0 && r.height > 0;
    };
    const linjer = [...document.querySelectorAll(".kodebygg__linje")];
    const barn = [...document.querySelectorAll(".kodebygg__ut .kodeeks > *")];
    const blokk = document.querySelector(".kodebygg");
    return {
      linjer: linjer.length,
      linjerSynlig: linjer.filter(synlig).length,
      barn: barn.length,
      barnSynlig: barn.filter(synlig).length,
      attributter: blokk ? [...blokk.attributes].map((a) => a.name).filter((n) => n.startsWith("data-")) : [],
      omKnappSynlig: !document.querySelector(".kodebygg__om")?.hidden,
    };
  });
  console.log(`  ${navn.padEnd(20)} kodelinjer synlige ${r.linjerSynlig}/${r.linjer} · resultatbarn synlige ${r.barnSynlig}/${r.barn} · ${r.attributter.join(",") || "ingen data-attributter"} · spill-om-knapp: ${r.omKnappSynlig}`);
  await p.close();
}

// ------------------------------------------------- 2. overflyt og fokus -----
for (const bredde of [390, 768, 1440]) {
  const p = await side({ viewport: { width: bredde, height: 844 } });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const pre = document.querySelector(".kodebygg__kode");
    const blokk = document.querySelector(".kodebygg");
    return {
      side: document.documentElement.scrollWidth,
      vindu: innerWidth,
      blokkOverflyt: blokk.scrollWidth - blokk.clientWidth,
      preScroll: pre.scrollWidth - pre.clientWidth,
      preBredde: Math.round(pre.clientWidth),
    };
  });
  // Tastaturfokus på den scrollbare flaten
  await p.evaluate(() => document.querySelector(".kodebygg__kode").focus());
  const fokus = await p.evaluate(() => document.activeElement?.className);
  console.log(`  ${bredde}px  side ${r.side}/${r.vindu} ${r.side > r.vindu ? "SIDELENGS SCROLL" : "ok"} · blokk-overflyt ${r.blokkOverflyt}px · kodeflate kan scrolles ${r.preScroll}px (bredde ${r.preBredde}) · fokus: ${fokus}`);
  await p.close();
}

// -------------------------------------------- 3. kontrast på ekte piksler ---
/* Målt på det som FAKTISK er malt: tekstfargen leses av computed style (den er
   ugjennomsiktig hex, alfakanalen beholdes og blir aldri lest som svart), og
   grunnen leses som en piksel i kodeflaten der det ikke står en glyf. Den
   markerte linja måles midt i sekvensen, på samme måte. */
for (const tema of ["dark", "light"]) {
  const p = await side({ viewport: { width: 1440, height: 980 }, colorScheme: tema, reducedMotion: "reduce" });
  await p.evaluate(() => {
    const el = document.querySelector(".kodebygg");
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 60, behavior: "instant" });
  });
  await p.waitForTimeout(500);
  const boks = await p.locator(".kodebygg__flate").boundingBox();
  const png = PNG.sync.read(await p.screenshot({ clip: boks }));
  const pik = (x, y) => { const i = (png.width * y + x) << 2; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
  const [br, bg2, bb2] = pik(Math.round(png.width - 30), Math.round(png.height - 20));
  const bl = lum(br, bg2, bb2);
  const farger = await p.evaluate(() => {
    const ut = {};
    const les = (sel, navn) => { const e = document.querySelector(sel); if (e) ut[navn] = getComputedStyle(e).color; };
    les(".kodebygg__kode", "ren tekst");
    les(".kodebygg__nr", "linjenummer");
    les(".kode-t", "tagg");
    les(".kode-a", "attributt");
    les(".kode-s", "streng");
    les(".kode-u", "uttrykk");

    return ut;
  });
  console.log(`  kodeflaten, ${tema}: malt grunn rgb(${br},${bg2},${bb2})`);
  for (const [navn, c] of Object.entries(farger)) {
    const [r, g, b3, a] = c.match(/[\d.]+/g).map(Number);
    const k = kontrast(bl, lum(r, g, b3));
    console.log(`     ${navn.padEnd(32)} ${c.padEnd(22)} ${k.toFixed(2)}:1 ${k >= 4.5 || navn.includes("utenfor") ? "" : "  <-- UNDER 4,5"}${a !== undefined && a < 1 ? "  (ALFA < 1)" : ""}`);
  }
  await p.close();
}

// ----------------------------------- 4. kontrast mot den MARKERTE linja -----
{
  const p = await side({ viewport: { width: 1440, height: 980 }, colorScheme: "dark" });
  await p.evaluate(() => {
    const el = document.querySelector(".kodebygg");
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 60, behavior: "instant" });
  });
  await p.waitForTimeout(900);
  const boks = await p.locator(".kodebygg__flate").boundingBox();
  const png = PNG.sync.read(await p.screenshot({ clip: boks }));
  const tell = new Map();
  for (let i = 0; i < png.data.length; i += 4) {
    const k = `${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`;
    tell.set(k, (tell.get(k) ?? 0) + 1);
  }
  const kand = [...tell].filter(([k, n]) => n > 300 && k !== "6,7,8")
    .map(([k, n]) => ({ k, n, l: lum(...k.split(",").map(Number)) }))
    .filter((x) => x.l < 0.06).sort((a, b) => b.n - a.n);
  const m = kand[0];
  if (!m) { console.log("  fant ingen markert linje – sekvensen var ferdig"); }
  else {
    console.log(`  markert linje: rgb(${m.k}) (${m.n} px)`);
    const farger2 = await p.evaluate(() => {
      const ut = {};
      const les = (sel, navn) => { const e = document.querySelector(sel); if (e) ut[navn] = getComputedStyle(e).color; };
      les(".kodebygg__kode", "ren tekst"); les(".kodebygg__nr", "linjenummer");
      les(".kode-t", "tagg"); les(".kode-a", "attributt");
      les(".kode-s", "streng"); les(".kode-u", "uttrykk");
      return ut;
    });
    for (const [navn, c] of Object.entries(farger2)) {
      const [r2, g2, b4] = c.match(/[\d.]+/g).map(Number);
      const k = kontrast(m.l, lum(r2, g2, b4));
      console.log(`     ${navn.padEnd(14)} ${c.padEnd(20)} ${k.toFixed(2)}:1 ${k >= 4.5 ? "" : "  <-- UNDER 4,5"}`);
    }
  }
  await p.close();
}

// ------------------------- 5. etiketter og resultattekst mot MALT bakgrunn --
for (const tema of ["dark", "light"]) {
  const p = await side({ viewport: { width: 1440, height: 980 }, colorScheme: tema, reducedMotion: "reduce" });
  await p.evaluate(() => {
    const el = document.querySelector(".kodebygg");
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 160, behavior: "instant" }); // klar av den klebende toppbaren
  });
  await p.waitForTimeout(500);
  const png = PNG.sync.read(await p.screenshot());
  const pik = (x, y) => { const i = (png.width * y + x) << 2; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
  const felt = await p.evaluate(() => {
    const ut = [];
    for (const [sel, navn] of [
      [".kodebygg__rolle", "panel-rolle"], [".kodebygg__kilde", "kilde-etikett"],
      [".kodebygg__under", "forklaring"], [".kodebygg__om", "spill om-knapp"],
      [".kodeeks .merke", "resultat: merke"], [".kodeeks .tittel", "resultat: tittel"],
      [".kodeeks .tekst", "resultat: tekst"], [".kodeeks figcaption", "resultat: figurtekst"],
    ]) {
      const e = document.querySelector(sel); if (!e) continue;
      const r = e.getBoundingClientRect();
      ut.push({ navn, farge: getComputedStyle(e).color, x0: Math.round(r.left), x1: Math.round(r.right), y: Math.round(r.top - 3) });
    }
    return ut;
  });
  console.log(`  etiketter og resultattekst, ${tema}:`);
  for (const f2 of felt) {
    // Grunnen leses som den vanligste pikselen i et 3 px-bånd rett OVER teksten,
    // over hele bredden. Ett enkelt punkt traff kanten av en glyf og rapporterte
    // 2,64:1 på en etikett som faktisk står på 5,92:1.
    const t2 = new Map();
    for (let y2 = f2.y - 2; y2 <= f2.y; y2++) for (let x2 = f2.x0; x2 < f2.x1; x2++) {
      const q = pik(Math.min(Math.max(x2, 0), png.width - 1), Math.min(Math.max(y2, 0), png.height - 1)).join(",");
      t2.set(q, (t2.get(q) ?? 0) + 1);
    }
    const [r, g, b5] = [...t2].sort((a, c) => c[1] - a[1])[0][0].split(",").map(Number);
    const [tr, tg, tb] = f2.farge.match(/[\d.]+/g).map(Number);
    const k = kontrast(lum(r, g, b5), lum(tr, tg, tb));
    console.log(`     ${f2.navn.padEnd(22)} ${f2.farge.padEnd(20)} mot malt rgb(${r},${g},${b5})  ${k.toFixed(2)}:1 ${k >= 4.5 ? "" : "  <-- UNDER 4,5"}`);
  }
  await p.close();
}

await b.close();
