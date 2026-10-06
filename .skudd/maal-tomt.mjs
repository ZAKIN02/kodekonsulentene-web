/**
 * Diagnose av tomme bånd: HVA rammer dem inn, og hvorfor.
 *
 * `.skudd/syn3.mjs tomrom` finner HVOR hullene er. Dette verktøyet svarer på
 * hvorfor: det finner elementet over og under hullet, går opp til nærmeste
 * `.scene`, og skriver ut scenens faktiske geometri mot innholdets.
 *
 * Måler blekk, ikke beholdere – en <section> på 900 px med 200 px innhold er
 * ikke full. Og måler i ekte visningsvindu ved hver scrollposisjon, fordi et
 * fullsideskudd evaluerer view()-animasjoner ved scroll 0 og fotograferer alt
 * under første skjermhøyde med opacity 0.
 */
import { chromium } from "playwright";

const [base, bredde = "1512", ...sider] = process.argv.slice(2);
const B = Number(bredde);

const DIAG = `(() => {
  const H = innerHeight;
  // Blekkrader i vinduet, 4 px oppløsning.
  const rader = new Uint8Array(Math.ceil(H / 4));
  const synlig = (el) => {
    let n = el, o = 1;
    for (let i = 0; n && i < 6; i++, n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      o *= parseFloat(cs.opacity) || 0;
    }
    return o > 0.06;
  };
  const merk = (top, bottom, el) => {
    const a = Math.max(0, Math.floor(top / 4)), z = Math.min(rader.length, Math.ceil(bottom / 4));
    for (let i = a; i < z; i++) if (!rader[i]) rader[i] = 1, (kilde[i] = el);
  };
  const kilde = [];
  const gaa = (node) => {
    for (const el of node.querySelectorAll("*")) {
      if (!synlig(el)) continue;
      const tag = el.tagName;
      if (["IMG","VIDEO","CANVAS","SVG","INPUT","BUTTON","HR","SELECT","TEXTAREA"].includes(tag)) {
        const r = el.getBoundingClientRect();
        if (r.height > 1 && r.bottom > 0 && r.top < H) merk(r.top, r.bottom, el);
        continue;
      }
      // Hårlinjer og kanter teller som blekk.
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.height <= 3 && r.width > 40 && cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
        if (r.bottom > 0 && r.top < H) merk(r.top, r.bottom, el);
      }
      // Tekstnoder måles som faktisk blekk.
      for (const barn of el.childNodes) {
        if (barn.nodeType !== 3 || !barn.textContent.trim()) continue;
        const rg = document.createRange(); rg.selectNodeContents(barn);
        for (const lr of rg.getClientRects()) {
          if (lr.height > 0 && lr.bottom > 0 && lr.top < H) merk(lr.top, lr.bottom, el);
        }
      }
    }
  };
  gaa(document.body);

  // Største sammenhengende tomme bånd, med 6 px toleranse (en hårlinje deler ikke
  // et hull for øyet).
  let best = null, start = null, hull = 0;
  for (let i = 0; i <= rader.length; i++) {
    const tomt = i < rader.length && !rader[i];
    if (tomt) { if (start === null) start = i; hull = 0; }
    else if (start !== null) {
      hull++;
      if (hull > 2 || i === rader.length) {
        const px = (i - hull - start) * 4;
        if (!best || px > best.px) best = { px, fra: start * 4, til: (i - hull) * 4 };
        start = null; hull = 0;
      }
    }
  }
  if (!best || best.px < 200) return null;

  const beskriv = (el) => {
    if (!el) return null;
    const scene = el.closest(".scene");
    const ut = { tekst: (el.textContent || "").trim().slice(0, 36), klasse: el.className?.toString?.().slice(0, 40) };
    if (scene) {
      const sr = scene.getBoundingClientRect();
      const cs = getComputedStyle(scene);
      const inner = scene.querySelector(".scene__inner");
      ut.scene = {
        hoyde: Math.round(sr.height),
        innhold: inner ? Math.round(inner.getBoundingClientRect().height) : null,
        minHoyde: cs.minHeight,
        padding: cs.paddingBlockStart + " / " + cs.paddingBlockEnd,
        align: cs.alignItems,
        lav: scene.classList.contains("scene--lav"),
      };
    }
    return ut;
  };
  // Element rett over og rett under hullet.
  let over = null, under = null;
  for (let i = Math.floor(best.fra / 4) - 1; i >= 0; i--) if (kilde[i]) { over = kilde[i]; break; }
  for (let i = Math.ceil(best.til / 4); i < rader.length; i++) if (kilde[i]) { under = kilde[i]; break; }
  return { ...best, over: beskriv(over), under: beskriv(under) };
})()`;

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: B, height: 900 }, colorScheme: "dark" });
const p = await ctx.newPage();
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  let verst = null;
  for (let y = 0; y < h; y += 450) {
    await p.evaluate((v) => scrollTo(0, v), y);
    await p.waitForTimeout(170);
    const r = await p.evaluate(DIAG);
    if (r && (!verst || r.px > verst.px)) verst = { ...r, scroll: y };
  }
  console.log(`\n${s}`);
  if (!verst) { console.log("  ingen bånd over 200 px"); continue; }
  console.log(`  ${verst.px}px tomt ved scroll ${verst.scroll} (i vindu ${verst.fra}–${verst.til})`);
  for (const [navn, d] of [["over", verst.over], ["under", verst.under]]) {
    if (!d) { console.log(`  ${navn}: –`); continue; }
    const sc = d.scene;
    console.log(`  ${navn}: «${d.tekst}»`);
    if (sc) console.log(`      scene ${sc.hoyde}px, innhold ${sc.innhold}px, min ${sc.minHoyde}, pad ${sc.padding}, align ${sc.align}${sc.lav ? ", lav" : ""}`);
  }
}
await b.close();
