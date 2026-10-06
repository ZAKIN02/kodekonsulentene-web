/**
 * HVA beveger seg, HVORDAN, og HVOR MYE per scroll-steg.
 *
 * Aa telle animationName i ett oeyeblikk er ubrukelig: det fanger verken JS-drevet
 * bevegelse, scroll-drevet transform, canvas eller video. Denne leser faktiske
 * matriser per element over scroll-steg og klassifiserer endringen.
 */
import { chromium } from "playwright";
const [url, navn, nRaa] = process.argv.slice(2);
const N = Number(nRaa || 10);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(2500);
for (const t of ["Continue", "Accept", "Godta", "Allow all", "I agree"]) {
  const k = p.locator(`button:has-text("${t}")`).first();
  if (await k.count().catch(() => 0)) { await k.click({ timeout: 1200 }).catch(() => {}); await p.waitForTimeout(600); }
}

const les = () => p.evaluate(() => {
  const ut = [];
  for (const el of document.querySelectorAll("body *")) {
    const c = getComputedStyle(el);
    if (c.display === "none" || c.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > 1100 || r.width < 8 || r.height < 8) continue;
    ut.push({
      k: (el.tagName + (el.className && typeof el.className === "string" ? "." + el.className.slice(0, 20) : "")),
      t: c.transform, o: +c.opacity, w: Math.round(r.width), h: Math.round(r.height),
      x: Math.round(r.left), y: Math.round(r.top), f: c.backgroundColor, flate: r.width * r.height,
    });
  }
  return ut;
});

const h = await p.evaluate(() => document.documentElement.scrollHeight);
let forrige = null;
const tell = { flytt: 0, skala: 0, rotasjon: 0, opasitet: 0, farge: 0, steg: 0 };
let storsteFlate = 0, blodUt = 0;

for (let i = 0; i < N; i++) {
  const y = Math.round((h - 900) * (i / (N - 1)));
  await p.evaluate((v) => scrollTo({ top: v, behavior: "instant" }), y);
  await p.waitForTimeout(700);
  const naa = await les();
  for (const e of naa) {
    if (e.flate > storsteFlate) storsteFlate = e.flate;
    if (e.x < -20 || e.x + e.w > 1460) blodUt++;
  }
  if (forrige) {
    tell.steg++;
    const kart = new Map(forrige.map((e) => [e.k + e.w + e.h, e]));
    for (const e of naa) {
      const f = kart.get(e.k + e.w + e.h);
      if (!f) continue;
      if (e.t !== f.t) {
        const a = (e.t.match(/matrix\(([^)]+)\)/) || [])[1]?.split(",").map(Number);
        const bb = (f.t.match(/matrix\(([^)]+)\)/) || [])[1]?.split(",").map(Number);
        if (a && bb) {
          if (Math.abs(a[4] - bb[4]) > 1 || Math.abs(a[5] - bb[5]) > 1) tell.flytt++;
          if (Math.abs(a[0] - bb[0]) > 0.01 || Math.abs(a[3] - bb[3]) > 0.01) tell.skala++;
          if (Math.abs(a[1] - bb[1]) > 0.01) tell.rotasjon++;
        } else tell.flytt++;
      }
      if (Math.abs(e.o - f.o) > 0.03) tell.opasitet++;
      if (e.f !== f.f) tell.farge++;
    }
  }
  forrige = naa;
}
const pr = (v) => (v / Math.max(1, tell.steg)).toFixed(0);
console.log(JSON.stringify({
  navn, scrollSteg: tell.steg,
  flyttPrSteg: +pr(tell.flytt), skalaPrSteg: +pr(tell.skala), rotasjonPrSteg: +pr(tell.rotasjon),
  opasitetPrSteg: +pr(tell.opasitet), fargePrSteg: +pr(tell.farge),
  blodUtAvKant: blodUt, storsteFlateSkjermer: +(storsteFlate / (1440 * 900)).toFixed(1),
}));
await b.close();
