/** Scroller gjennom en side og tar ekte visningsbilder underveis, pluss maaler
 *  faktisk pikselendring mellom rammer. Statisk telling av CSS-animasjoner fanger
 *  ikke JS-drevet bevegelse – det var feilen i forrige maaling. */
import { chromium } from "playwright";
const [url, navn, nRaa] = process.argv.slice(2);
const N = Number(nRaa || 8);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(3000);
// Lukk eventuelle samtykkebannere
for (const t of ["Continue", "Accept", "Godta", "Allow all", "I agree", "Close"]) {
  const k = p.locator(`button:has-text("${t}"), a:has-text("${t}")`).first();
  if (await k.count().catch(() => 0)) { await k.click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(700); }
}
const h = await p.evaluate(() => document.documentElement.scrollHeight);
const filer = [];
for (let i = 0; i < N; i++) {
  const y = Math.round((h - 900) * (i / (N - 1)));
  await p.evaluate((v) => scrollTo({ top: v, behavior: "instant" }), y);
  await p.waitForTimeout(900);
  const f = `.skudd/ref/${navn}-${i}.png`;
  await p.screenshot({ path: f });
  filer.push(f);
}
// Pikselendring i ro, uten scroll – fanger loepende animasjon
await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await p.waitForTimeout(800);
const a = await p.screenshot();
await p.waitForTimeout(1400);
const c = await p.screenshot();
let ulik = 0;
for (let i = 0; i < Math.min(a.length, c.length); i += 997) if (a[i] !== c[i]) ulik++;
console.log(`  ${navn}: hoeyde ${h}px, ${N} rammer, bevegelse i ro: ${ulik > 20 ? "JA" : "nei"} (${ulik} avvik)`);
await b.close();
