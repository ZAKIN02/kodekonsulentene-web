/**
 * Synet. Går gjennom alle sider på flere bredder og produserer BILDER å se på,
 * pluss tall som peker på hvor man bør se.
 *
 * Tallene er ikke konklusjonen. De er en kikkert. Denne siden ble bygget i to
 * dager der alt målte grønt mens den var visuelt død – 153 tester passerte mens
 * CSP blokkerte hvert eneste inline-skript i produksjon. Derfor skriver dette
 * verktøyet alltid ut et bilde, og rapporten er aldri ferdig før noen har sett
 * på det.
 *
 *   node .skudd/syn.mjs skann <base>            alle sider, alle bredder
 *   node .skudd/syn.mjs ark <base> <bredde>     kontaktark av alle sider
 *   node .skudd/syn.mjs side <base> <sti> <br>  én side, full høyde
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const UT = ".skudd/syn";
mkdirSync(UT, { recursive: true });

const SIDER = [
  "/", "/nettsider", "/systemer", "/sikkerhet", "/apper-og-ai", "/priser",
  "/caser", "/om", "/kontakt", "/historie", "/status", "/handbok", "/sjekk",
  "/verktoy", "/verktoy/uu-sjekk", "/verktoy/cookie-sjekk", "/verktoy/dmarc",
  "/verktoy/priskalkulator", "/bransjer/handverkere", "/bransjer/klinikker",
  "/personvern", "/vilkar", "/terminal", "/finnes-ikke-404-test",
];
const LAB = ["/lab/typo", "/lab/interaksjon", "/lab/rontgen", "/lab/ikoner",
             "/lab/teknikker", "/lab/svg", "/lab/og", "/lab/bibliotek"];

const BREDDER = [390, 1440, 2000];

/** Filnavn uten skråstreker. */
const navn = (sti) => (sti === "/" ? "forside" : sti.replace(/^\//, "").replace(/\//g, "-"));

/**
 * Blekk per rad. Finner hvor stor del av hver bildelinje som skiller seg fra
 * sidens bakgrunn. Lange strekk uten blekk er døde flater.
 *
 * Bakgrunnen samples som den hyppigste fargen, ikke som hjørnepikselen –
 * hjørnet kan ligge inne i et medieelement.
 */
function blekkprofil(png) {
  const { width: w, height: h, data } = png;
  const tell = new Map();
  for (let y = 0; y < h; y += 7) {
    for (let x = 0; x < w; x += 7) {
      const i = (w * y + x) << 2;
      const k = (data[i] >> 3) << 10 | (data[i + 1] >> 3) << 5 | (data[i + 2] >> 3);
      tell.set(k, (tell.get(k) ?? 0) + 1);
    }
  }
  let bg = 0, best = -1;
  for (const [k, n] of tell) if (n > best) { best = n; bg = k; }
  const br = ((bg >> 10) & 31) << 3, bgg = ((bg >> 5) & 31) << 3, bb = (bg & 31) << 3;

  const profil = new Float32Array(h);
  for (let y = 0; y < h; y++) {
    let n = 0;
    for (let x = 0; x < w; x += 3) {
      const i = (w * y + x) << 2;
      // 24 er over komprimeringsstøy og under enhver synlig kant.
      if (Math.abs(data[i] - br) + Math.abs(data[i + 1] - bgg) + Math.abs(data[i + 2] - bb) > 24) n++;
    }
    profil[y] = n / Math.ceil(w / 3);
  }
  return { profil, bakgrunn: [br, bgg, bb] };
}

/** Sammenhengende strekk med nesten null blekk, i piksler. */
function dodeflater(profil, minHoyde) {
  const ut = [];
  let start = -1;
  for (let y = 0; y < profil.length; y++) {
    const tomt = profil[y] < 0.004;
    if (tomt && start < 0) start = y;
    if (!tomt && start >= 0) {
      if (y - start >= minHoyde) ut.push({ fra: start, til: y, hoyde: y - start });
      start = -1;
    }
  }
  if (start >= 0 && profil.length - start >= minHoyde) {
    ut.push({ fra: start, til: profil.length, hoyde: profil.length - start });
  }
  return ut;
}

/** Skalerer et PNG ned med heltallsfaktor. */
function krymp(png, f) {
  const w = Math.floor(png.width / f), h = Math.floor(png.height / f);
  const o = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (png.width * (y * f) + x * f) << 2, d = (w * y + x) << 2;
      o.data[d] = png.data[s]; o.data[d + 1] = png.data[s + 1];
      o.data[d + 2] = png.data[s + 2]; o.data[d + 3] = 255;
    }
  }
  return o;
}

async function maal(side, bredde, base, ctx) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: bredde, height: 900 });
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 140)));
  p.on("pageerror", (e) => feil.push("pageerror: " + String(e).slice(0, 140)));

  const svar = await p.goto(base + side, { waitUntil: "networkidle", timeout: 45000 }).catch(() => null);
  const status = svar?.status() ?? 0;
  await p.waitForTimeout(900);

  // Scroll gjennom hele siden så alt som avdekkes ved scroll faktisk utløses,
  // og alle bilder/video rekker å laste før vi fotograferer.
  const H0 = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H0; y += 700) {
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(140);
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(700);

  const fakta = await p.evaluate(() => {
    const d = document.documentElement;
    const overflyt = d.scrollWidth - d.clientWidth;
    const utenfor = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // Høyre kant utenfor dokumentet, uten at elementet selv er skjult.
      if (r.right > d.clientWidth + 2 && getComputedStyle(el).visibility !== "hidden") {
        utenfor.push({
          tag: el.tagName.toLowerCase(),
          kl: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 50),
          hoyre: Math.round(r.right),
        });
      }
    }
    const video = [...document.querySelectorAll("video")].map((v) => ({
      src: (v.querySelector("source")?.getAttribute("src") || v.currentSrc || "").split("/").pop(),
      spolbar: v.seekable?.length ? Math.round(v.seekable.end(0) * 10) / 10 : 0,
      klar: v.readyState,
    }));
    const bilder = [...document.querySelectorAll("img")].map((i) => ({
      src: (i.currentSrc || i.src).split("/").pop(),
      lastet: i.naturalWidth > 0,
      maal: !!(i.getAttribute("width") && i.getAttribute("height")),
    }));
    return {
      overflyt, utenfor: utenfor.slice(0, 6), antallUtenfor: utenfor.length,
      video, bilder, hoyde: d.scrollHeight,
      h1: document.querySelectorAll("h1").length,
      animerte: [...document.querySelectorAll("body *")].filter((e) => {
        const s = getComputedStyle(e);
        return s.animationName !== "none" || s.transitionDuration !== "0s";
      }).length,
    };
  });

  /**
   * Stitching av ekte visningsbilder, IKKE fullPage.
   *
   * fullPage gjengir scroll-drevne animasjoner ved scroll 0, så alt under første
   * skjermhøyde fotograferes i sin starttilstand – som for `Avslor` er opasitet 0.
   * Første versjon av dette verktøyet meldte 7 «døde flater» på /historie og 6 på
   * forsiden. Jeg målte opasiteten før jeg rapporterte: 0 ved scroll 0, 1 når man
   * faktisk scroller dit. Alle var min egen feil. fullPage gjengir heller ikke
   * position: sticky mer enn én gang.
   *
   * Her scrolles det i skjermhøyder og fotograferes på hvert trinn, slik en
   * besøkende faktisk ser siden.
   */
  const VH = 900;
  const trinn = Math.max(1, Math.ceil(H0 / VH));
  const biter = [];
  for (let i = 0; i < trinn; i++) {
    const y = Math.min(i * VH, Math.max(0, H0 - VH));
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(520);
    biter.push({ y, png: PNG.sync.read(await p.screenshot()) });
  }
  await p.close();

  const bilde = new PNG({ width: bredde, height: Math.min(H0, trinn * VH) });
  for (const { y, png } of biter) {
    for (let r = 0; r < png.height; r++) {
      const my = y + r;
      if (my >= bilde.height) break;
      png.data.copy(bilde.data, (bilde.width * my) << 2, (png.width * r) << 2, (png.width * (r + 1)) << 2);
    }
  }

  const { profil } = blekkprofil(bilde);
  // Terskel skalert mot visningsvinduet: en halv skjermhøyde uten blekk er dødt.
  const dode = dodeflater(profil, Math.round(900 * 0.45));
  const blekkTotal = profil.reduce((a, b) => a + b, 0) / profil.length;

  const f = bredde >= 2000 ? 4 : bredde >= 1440 ? 3 : 1;
  const fil = join(UT, `${navn(side)}-${bredde}.png`);
  writeFileSync(fil, PNG.sync.write(f > 1 ? krymp(bilde, f) : bilde));

  return { side, bredde, status, fil, feil, dode, blekkTotal, ...fakta };
}

const kmd = process.argv[2] ?? "skann";
const base = process.argv[3] ?? "http://127.0.0.1:4442";

const b = await chromium.launch();
const ctx = await b.newContext({ colorScheme: "dark", deviceScaleFactor: 1 });

if (kmd === "skann") {
  const alle = process.argv[5] === "lab" ? [...SIDER, ...LAB] : SIDER;
  const bredder = process.argv[4] ? [Number(process.argv[4])] : BREDDER;
  const res = [];
  for (const s of alle) {
    for (const w of bredder) {
      const r = await maal(s, w, base, ctx);
      res.push(r);
      const flagg = [
        r.status !== 200 && r.status !== 404 ? `STATUS ${r.status}` : "",
        r.overflyt > 2 ? `OVERFLYT ${r.overflyt}px` : "",
        r.dode.length ? `DØD ${r.dode.map((d) => d.hoyde).join("+")}px` : "",
        r.feil.length ? `FEIL ${r.feil.length}` : "",
        r.h1 !== 1 ? `H1=${r.h1}` : "",
        r.bilder.some((i) => !i.lastet) ? "BILDE-FEIL" : "",
      ].filter(Boolean).join(" ");
      console.log(`${String(w).padStart(4)} ${s.padEnd(28)} h=${String(r.hoyde).padStart(5)} blekk=${(r.blekkTotal * 100).toFixed(1)}% v=${r.video.length} b=${r.bilder.length} ${flagg}`);
    }
  }
  writeFileSync(join(UT, "data.json"), JSON.stringify(res, null, 1));
  console.log(`\n${res.length} målinger -> ${UT}/data.json`);
}

if (kmd === "ark") {
  // Kontaktark: toppen av hver side ved siden av hverandre, så mange kan ses i ett blikk.
  const w = Number(process.argv[4] ?? 1440);
  const alle = SIDER;
  const kol = 6, celleB = 300, celleH = 520;
  const rader = Math.ceil(alle.length / kol);
  const ark = new PNG({ width: kol * celleB, height: rader * celleH });
  for (let i = 0; i < alle.length; i++) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: w, height: Math.round((celleH / celleB) * w) });
    await p.goto(base + alle[i], { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await p.waitForTimeout(900);
    const im = PNG.sync.read(await p.screenshot());
    await p.close();
    const fx = im.width / celleB, fy = im.height / celleH;
    const ox = (i % kol) * celleB, oy = Math.floor(i / kol) * celleH;
    for (let y = 0; y < celleH; y++) {
      for (let x = 0; x < celleB; x++) {
        const s = (im.width * Math.floor(y * fy) + Math.floor(x * fx)) << 2;
        const d = (ark.width * (oy + y) + (ox + x)) << 2;
        ark.data[d] = im.data[s]; ark.data[d + 1] = im.data[s + 1];
        ark.data[d + 2] = im.data[s + 2]; ark.data[d + 3] = 255;
      }
    }
    process.stdout.write(".");
  }
  const fil = join(UT, `ark-${w}.png`);
  writeFileSync(fil, PNG.sync.write(ark));
  console.log(`\n${fil}`);
}

if (kmd === "side") {
  const r = await maal(process.argv[4], Number(process.argv[5] ?? 1440), base, ctx);
  console.log(JSON.stringify({ ...r, dode: r.dode, feil: r.feil }, null, 1));
}

await b.close();
