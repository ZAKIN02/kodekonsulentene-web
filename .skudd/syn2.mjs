/**
 * Synet, runde 2. Gjør «statisk» målbart.
 *
 * Kunden sier undersidene er statiske og ikke oppsiktsvekkende. Blekktetthet
 * (runde 1) måler hvor MYE som står på siden, ikke om noe SKJER. En side kan
 * være full av tekst og likevel være død.
 *
 * Her måles bevegelse: hvor mye det synlige bildet endrer seg per skjermhøyde
 * man scroller. To nabobilder som er nesten like betyr at scrollingen ikke gir
 * noe tilbake. Lange strekk med lav endring er sidens døde partier.
 *
 *   node .skudd/syn2.mjs <base> <bredde> [sider...]
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { writeFileSync, mkdirSync } from "node:fs";

const UT = ".skudd/syn2";
mkdirSync(UT, { recursive: true });

/** Gjennomsnittlig kanalavvik mellom to like store bilder, 0-255. */
function ulikhet(a, b) {
  let d = 0, n = 0;
  for (let i = 0; i < a.data.length; i += 16) {
    d += Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i+1] - b.data[i+1]) + Math.abs(a.data[i+2] - b.data[i+2]);
    n += 3;
  }
  return d / n;
}

const base = process.argv[2];
const bredde = Number(process.argv[3] ?? 1680);
const sider = process.argv.slice(4);

const nettleser = await chromium.launch();
const ctx = await nettleser.newContext({ colorScheme: "dark", deviceScaleFactor: 1, viewport: { width: bredde, height: 900 } });

console.log(`bredde ${bredde}`);
console.log("side                          skjermer  snitt  død%  svakeste strekk");
const alt = [];
for (const s of sider) {
  const p = await ctx.newPage();
  await p.goto(base + s, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await p.waitForTimeout(700);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const trinn = Math.max(2, Math.ceil(H / 900));
  const bilder = [];
  for (let i = 0; i < trinn; i++) {
    const y = Math.min(i * 900, Math.max(0, H - 900));
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(480);
    bilder.push({ y, png: PNG.sync.read(await p.screenshot()) });
  }
  await p.close();

  const endringer = [];
  for (let i = 1; i < bilder.length; i++) endringer.push(ulikhet(bilder[i - 1].png, bilder[i].png));
  const snitt = endringer.reduce((a, b) => a + b, 0) / (endringer.length || 1);
  // Under 6 er «nesten ingenting skjedde» – en skjermhøyde scroll som ga lite igjen.
  const dode = endringer.filter((e) => e < 6).length;
  const minIdx = endringer.indexOf(Math.min(...endringer));
  const svakest = endringer.length ? `skjerm ${minIdx + 1}->${minIdx + 2}: ${endringer[minIdx].toFixed(1)}` : "-";
  console.log(`${s.padEnd(28)} ${String(trinn).padStart(6)} ${snitt.toFixed(1).padStart(6)} ${String(Math.round(100 * dode / (endringer.length || 1))).padStart(5)} ${svakest}`);
  alt.push({ side: s, trinn, snitt, dodeAndel: dode / (endringer.length || 1), endringer });
}
writeFileSync(`${UT}/bevegelse-${bredde}.json`, JSON.stringify(alt, null, 1));
await nettleser.close();
