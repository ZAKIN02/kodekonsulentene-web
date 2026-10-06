/** MEN-RO: måler bevegelse UTEN at brukeren scroller.
 *
 *  Samme byte-sampling som referansemålingen (153 vår / 485 jeton) så tallene kan
 *  sammenlignes, pluss et ekte rå-pikselantall så vi ikke bare måler PNG-støy.
 *
 *  To faser:
 *    LAST   – 12 skudd over de første 2,4 sekundene etter at siden er lastet,
 *             uten én piksel scroll. Dette er tallet mot jeton.
 *    HVILE  – etter 4 sekunder: står noe og animerer evig? (CPU-kostnad)
 *
 *  Viewport-skudd, aldri fullPage: fullPage fotograferer scroll-drevne elementer
 *  på opasitet 0.
 *
 *  Bruk: node .skudd/men-ro.mjs <url> <navn> [y]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const [url, navn, yRaa = "0"] = process.argv.slice(2);
const Y = Number(yRaa);
const UT = ".skudd/mening";
mkdirSync(UT, { recursive: true });

const b = await chromium.launch();
const VB = Number(process.env.VB || 1440), VH = Number(process.env.VH || 900);
const p = await b.newPage({ viewport: { width: VB, height: VH } });

const rammer = [];
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
if (Y) await p.evaluate((v) => scrollTo({ top: v, behavior: "instant" }), Y);
// 12 skudd à 200 ms = 2,4 s fra tidligst mulig øyeblikk, uten scroll.
for (let i = 0; i < 12; i++) {
  rammer.push(await p.screenshot());
  await p.waitForTimeout(200);
}

// Rå piksler: hvor mange av 1440x900 endrer seg mellom nabo-rammer?
const raa = (a, c) => {
  const A = PNG.sync.read(a), C = PNG.sync.read(c);
  let n = 0;
  for (let i = 0; i < A.data.length; i += 4) {
    if (Math.abs(A.data[i] - C.data[i]) > 6 ||
        Math.abs(A.data[i + 1] - C.data[i + 1]) > 6 ||
        Math.abs(A.data[i + 2] - C.data[i + 2]) > 6) n++;
  }
  return n;
};
// Referansens sampling: hver 997. byte i PNG-strømmen.
const byte = (a, c) => {
  let n = 0;
  for (let i = 0; i < Math.min(a.length, c.length); i += 997) if (a[i] !== c[i]) n++;
  return n;
};

console.log(`\n  ${navn}  (${url}, y=${Y})`);
console.log("  LAST – uten scroll, 200 ms mellom hver ramme");
let maksByte = 0, maksRaa = 0, sumRaa = 0;
for (let i = 1; i < rammer.length; i++) {
  const bt = byte(rammer[i - 1], rammer[i]);
  const rp = raa(rammer[i - 1], rammer[i]);
  maksByte = Math.max(maksByte, bt); maksRaa = Math.max(maksRaa, rp); sumRaa += rp;
  const pst = ((rp / (VB * VH)) * 100).toFixed(2);
  console.log(`    ${String(i * 200).padStart(5)} ms   byteavvik ${String(bt).padStart(5)}   piksler ${String(rp).padStart(8)}  (${pst} %)${rp > 2000 ? "  ← bevegelse" : ""}`);
}

// HVILE: står noe og animerer i evighet?
await p.waitForTimeout(2000);
const h1 = await p.screenshot();
await p.waitForTimeout(1400);
const h2 = await p.screenshot();
const hvByte = byte(h1, h2), hvRaa = raa(h1, h2);

console.log(`\n    SUM rå piksler endret gjennom lasten: ${sumRaa}`);
console.log(`    MAKS byteavvik mellom to rammer:      ${maksByte}   (referanse: vi 153, jeton 485)`);
console.log(`    MAKS rå piksler mellom to rammer:     ${maksRaa}`);
console.log(`    HVILE etter 4,4 s:  byte ${hvByte}, piksler ${hvRaa}  ${hvRaa > 2000 ? "← animerer evig" : "← ro"}`);

writeFileSync(`${UT}/${navn}-ro.json`, JSON.stringify({ navn, url, Y, sumRaa, maksByte, maksRaa, hvByte, hvRaa }, null, 2));
for (let i = 0; i < rammer.length; i++) writeFileSync(`${UT}/${navn}-last-${String(i).padStart(2, "0")}.png`, rammer[i]);
await b.close();
