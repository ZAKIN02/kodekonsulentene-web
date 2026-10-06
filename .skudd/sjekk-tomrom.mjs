/**
 * Maaler sammenhengende tomme vannrette baand ved FAKTISK BLEKK.
 *
 * Tidligere verktoey talte beholdere: en <section> paa 900 px med 200 px innhold
 * telte som full. Her maales tekstnoder med Range.getClientRects() og bilder,
 * video, hr og kontroller med getBoundingClientRect() - beholdere teller aldri.
 *
 * Scroller gjennom hele siden foerst, fordi scroll-drevne animasjoner staar paa
 * opacity 0 ved scroll 0 og et fullPage-skudd da melder falske doede flater.
 */
import { chromium } from "playwright";
const [base, side, breddeArg] = process.argv.slice(2);
const bredde = +(breddeArg ?? 1512);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
await p.goto(base + side, { waitUntil: "networkidle" });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(120); }
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(400);

const funn = await p.evaluate(() => {
  const H = document.documentElement.scrollHeight;
  const rader = new Array(Math.ceil(H / 4)).fill(false);
  const merk = (topp, bunn) => {
    const a = Math.max(0, Math.floor(topp / 4)), z = Math.min(rader.length, Math.ceil(bunn / 4));
    for (let i = a; i < z; i++) rader[i] = true;
  };
  const synlig = (el) => {
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.03;
  };
  // 1. Tekstnoder: ekte glyffbokser, ikke elementbokser.
  const gaa = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = gaa.nextNode(); n; n = gaa.nextNode()) {
    if (!n.nodeValue?.trim()) continue;
    const far = n.parentElement;
    if (!far || !synlig(far)) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const k of r.getClientRects()) if (k.height > 1) merk(k.top + scrollY, k.bottom + scrollY);
  }
  // 2. Grafikk og kontroller: egen boks ER blekket.
  for (const el of document.querySelectorAll("img, video, svg, canvas, hr, input, button, select, textarea, [data-scenefilm]")) {
    if (!synlig(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height > 1 && r.width > 1) merk(r.top + scrollY, r.bottom + scrollY);
  }
  // 3. Haarlinjer: 1 px kanter er blekk i denne merkevaren.
  for (const el of document.querySelectorAll("body *")) {
    if (!synlig(el)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 40) continue;
    if (parseFloat(cs.borderTopWidth) > 0) merk(r.top + scrollY, r.top + scrollY + 2);
    if (parseFloat(cs.borderBottomWidth) > 0) merk(r.bottom + scrollY - 2, r.bottom + scrollY);
  }
  // Taal avbrudd paa 8 px: en enkelt haarlinje skal ikke dele et tomrom i to.
  const band = []; let start = null;
  for (let i = 0; i <= rader.length; i++) {
    const fylt = i < rader.length ? rader[i] : true;
    if (!fylt && start === null) start = i;
    if (fylt && start !== null) {
      const px = (i - start) * 4;
      if (px >= 24) band.push({ fra: start * 4, px });
      start = null;
    }
  }
  const slaatt = [];
  for (const x of band) {
    const forrige = slaatt[slaatt.length - 1];
    if (forrige && x.fra - (forrige.fra + forrige.px) <= 8) forrige.px = x.fra + x.px - forrige.fra;
    else slaatt.push({ ...x });
  }
  return { H, band: slaatt.filter((x) => x.px >= 200).sort((a, z) => z.px - a.px) };
});
console.log(`  ${side} @${bredde}px  sidehoeyde ${funn.H}px`);
for (const x of funn.band.slice(0, 6)) console.log(`    tomt baand ${String(x.px).padStart(4)}px @ y=${x.fra}`);
if (!funn.band.length) console.log("    ingen tomme baand over 200px");
await b.close();
