/**
 * Synrunde 3 – måler FAKTISK BLEKK, ikke beholdere.
 *
 * Hvorfor dette verktøyet finnes: `.skudd/maal-tomrom.mjs` meldte «ingen bånd over
 * 300 px» på sider der kunden sendte skjermbilder med en halv skjerm tomt. Den
 * regnet enhver beholder med tekst i seg som fylt – en <section> på 900 px med
 * 200 px innhold telte da som full. Her måles tekst via Range.getClientRects()
 * og medier/kanter via getBoundingClientRect(), aldri via beholderen.
 *
 * Og målingen skjer PER SCROLLPOSISJON, slik brukeren faktisk ser siden. Et
 * fullsideskudd evaluerer scroll-drevne animasjoner ved scroll 0, så alt under
 * første skjermhøyde fotograferes med opacity 0. Det ga «6–7 døde flater per side»
 * i runde 1 som ikke fantes.
 *
 *   node .skudd/syn3.mjs tomrom   <base> <bredde> [sider...]
 *   node .skudd/syn3.mjs bevegelse <base> <bredde> [sider...]
 *   node .skudd/syn3.mjs film     <base> [sider...]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { PNG } from "pngjs";

const [modus, base, ...rest] = process.argv.slice(2);
const UT = ".skudd/syn3";
mkdirSync(UT, { recursive: true });

const ALLE = [
  "/", "/systemer", "/nettsider", "/sikkerhet", "/priser", "/caser", "/om",
  "/handbok", "/status", "/sjekk", "/kontakt", "/historie", "/apper-og-ai",
  "/bransjer/handverkere", "/bransjer/klinikker",
  "/verktoy", "/verktoy/uu-sjekk", "/verktoy/cookie-sjekk", "/verktoy/dmarc",
  "/verktoy/priskalkulator", "/personvern", "/vilkar",
];

/** Samler blekkrader i NÅVÆRENDE visningsvindu. Kjøres i nettleseren. */
const BLEKK_I_VINDU = `(() => {
  const H = window.innerHeight, W = window.innerWidth;
  const rader = new Uint8Array(Math.ceil(H / 4));
  const synlig = (el) => {
    let n = el, o = 1;
    for (let i = 0; n && i < 6; i++, n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      o *= parseFloat(cs.opacity);
    }
    return o > 0.08;
  };
  const merk = (r) => {
    if (!r || r.width < 2 || r.height < 1) return;
    if (r.right < 0 || r.left > W) return;
    const a = Math.max(0, Math.floor(r.top / 4));
    const z = Math.min(rader.length, Math.ceil(r.bottom / 4));
    for (let i = a; i < z; i++) rader[i] = 1;
  };

  // 1. Tekst: faktisk maleboks per linje, ikke elementboksen.
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let t;
  while ((t = tw.nextNode())) {
    if (!t.nodeValue.trim()) continue;
    const p = t.parentElement;
    if (!p || !synlig(p)) continue;
    const rg = document.createRange();
    rg.selectNodeContents(t);
    for (const r of rg.getClientRects()) merk(r);
  }

  // 2. Medier og grafikk.
  for (const el of document.querySelectorAll("img,video,svg,canvas,picture,iframe")) {
    if (!synlig(el)) continue;
    merk(el.getBoundingClientRect());
  }

  // 3. Hårlinjer og synlige kanter – merkevarens tegneredskap teller som blekk.
  for (const el of document.querySelectorAll("hr,[class*=hairline],[class*=linje],[class*=strek]")) {
    if (!synlig(el)) continue;
    merk(el.getBoundingClientRect());
  }
  for (const el of document.querySelectorAll("body *")) {
    if (!synlig(el)) continue;
    const cs = getComputedStyle(el);
    const harKant = ["Top","Bottom","Left","Right"].some(
      (s) => parseFloat(cs["border" + s + "Width"]) > 0 &&
             !/transparent|rgba\\(0, 0, 0, 0\\)/.test(cs["border" + s + "Color"]));
    const harFlate = !/transparent|rgba\\(0, 0, 0, 0\\)/.test(cs.backgroundColor) ||
                     cs.backgroundImage !== "none";
    if (!harKant && !harFlate) continue;
    const r = el.getBoundingClientRect();
    if (r.height > H * 0.9 && r.width > W * 0.9) continue; // hele sideflater teller ikke
    merk(r);
  }

  // Finn lengste sammenhengende tomme bånd.
  let best = 0, bestFra = 0, lop = 0, fra = 0;
  for (let i = 0; i < rader.length; i++) {
    if (!rader[i]) { if (lop === 0) fra = i; lop++; if (lop > best) { best = lop; bestFra = fra; } }
    else lop = 0;
  }
  return { tomtPx: best * 4, fraPx: bestFra * 4, vinduH: H };
})()`;

/**
 * Pikselmåling: en rad er TOM når nesten alle pikslene i den ligger innenfor en
 * liten avstand fra sidens hyppigste farge. Det er det samme øyet gjør.
 * DOM-måling undervurderte, fordi en seksjon med bakgrunnsfarge teller som «blekk»
 * i DOM-en selv om flaten er helt tom å se på.
 */
function tommeRaderFraPiksel(buf, terskel = 26, andel = 0.995) {
  const png = PNG.sync.read(buf);
  const { width: W, height: H, data } = png;
  const tell = new Map();
  for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) {
    const i = (y * W + x) * 4;
    const k = (data[i] >> 3) * 1024 + (data[i + 1] >> 3) * 32 + (data[i + 2] >> 3);
    tell.set(k, (tell.get(k) || 0) + 1);
  }
  let topp = 0, best = -1;
  for (const [k, n] of tell) if (n > best) { best = n; topp = k; }
  const br = ((topp / 1024) | 0) << 3, bg = (((topp / 32) | 0) % 32) << 3, bb = (topp % 32) << 3;
  const tom = new Uint8Array(H);
  for (let y = 0; y < H; y++) {
    let like = 0, sum = 0;
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      sum++;
      if (Math.abs(data[i] - br) + Math.abs(data[i + 1] - bg) + Math.abs(data[i + 2] - bb) < terskel) like++;
    }
    tom[y] = like / sum >= andel ? 1 : 0;
  }
  // Tål tynne avbrudd. En hårlinje på 1-2 px deler ikke en tom flate for øyet,
  // men brøt båndet i to i første versjon og skjulte 435 px tomrom på forsiden.
  const TOL = 6;
  let best2 = 0, fra = 0, start = -1, sistFylt = -1;
  for (let y = 0; y <= H; y++) {
    const erTom = y < H && tom[y];
    if (erTom) { if (start < 0) start = y; sistFylt = y; }
    else {
      let fylt = 0, k = y;
      while (k < H && !tom[k] && fylt <= TOL) { fylt++; k++; }
      if (start >= 0 && fylt > TOL) {
        const len = sistFylt - start + 1;
        if (len > best2) { best2 = len; fra = start; }
        start = -1;
      }
    }
  }
  if (start >= 0 && sistFylt - start + 1 > best2) { best2 = sistFylt - start + 1; fra = start; }
  return { tomtPx: best2, fraPx: fra, vinduH: H };
}

async function tomrom(bredde, sider) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +bredde, height: 900 }, colorScheme: "dark" });
  const alle = [];
  for (const s of sider) {
    try {
      await p.goto(base + s, { waitUntil: "networkidle", timeout: 25000 });
    } catch { console.log(`  ${s.padEnd(26)} NÅDDE IKKE SIDEN`); continue; }
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    const verst = [];
    for (let y = 0; y < h - 200; y += 450) {
      await p.evaluate((v) => window.scrollTo(0, v), y);
      await p.waitForTimeout(260);
      const r = tommeRaderFraPiksel(await p.screenshot());
      if (r.tomtPx >= 240) verst.push({ y, ...r });
    }
    verst.sort((a, c) => c.tomtPx - a.tomtPx);
    const topp = verst.slice(0, 2);
    alle.push({ side: s, topp });
    console.log(`  ${s.padEnd(26)} ${topp.length
      ? topp.map((v) => `${v.tomtPx}px tomt (scroll ${v.y}, i vindu fra ${v.fraPx})`).join("  |  ")
      : "ingen tomme bånd over 240 px"}`);
  }
  await b.close();
  return alle;
}

async function bevegelse(bredde, sider) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +bredde, height: 900 } });
  for (const s of sider) {
    try { await p.goto(base + s, { waitUntil: "networkidle", timeout: 25000 }); }
    catch { console.log(`  ${s.padEnd(26)} NÅDDE IKKE SIDEN`); continue; }
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(80); }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      // animationTimeline leser «auto» selv når view() er satt – bruk animationName.
      const med = [...document.querySelectorAll("body *")]
        .filter((e) => getComputedStyle(e).animationName !== "none");
      const vid = document.querySelectorAll("video").length;
      return { animerte: med.length, video: vid, hoyde: document.documentElement.scrollHeight };
    });
    console.log(`  ${s.padEnd(26)} ${String(r.animerte).padStart(3)} animerte  ${r.video} video  ${r.hoyde}px høy`);
  }
  await b.close();
}

async function film(sider) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
  for (const s of sider) {
    try { await p.goto(base + s, { waitUntil: "networkidle", timeout: 25000 }); } catch { continue; }
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(150); }
    await p.waitForTimeout(900);
    const r = await p.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({
      kilde: (v.currentSrc || "").split("/").pop() || "(ingen)",
      readyState: v.readyState,
      seekbar: v.seekable.length ? +v.seekable.end(0).toFixed(1) : 0,
      varighet: isFinite(v.duration) ? +v.duration.toFixed(1) : 0,
    })));
    if (r.length) for (const v of r)
      console.log(`  ${s.padEnd(24)} ${v.kilde.padEnd(26)} rs${v.readyState} seek ${v.seekbar}s av ${v.varighet}s ${v.seekbar === 0 ? " ← SPOLER IKKE" : ""}`);
    else console.log(`  ${s.padEnd(24)} (ingen video)`);
  }
  await b.close();
}

const sider = rest.length ? rest.filter((x) => x.startsWith("/")) : ALLE;
if (modus === "tomrom") await tomrom(rest[0] ?? 1512, rest.length > 1 ? sider : ALLE);
else if (modus === "bevegelse") await bevegelse(rest[0] ?? 1512, rest.length > 1 ? sider : ALLE);
else if (modus === "film") await film(sider);
else console.log("modus: tomrom | bevegelse | film");
