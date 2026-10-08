#!/usr/bin/env node
// Tar skjermbilder for designgjennomgang: toppen av siden pluss inntil 8 utsnitt nedover,
// i mobil og desktop, lyst og mørkt tema. Brukes både på egne sider og på referansesider.
//
// Bruk:   node scripts/skjermbilder.mjs <utmappe> <url> [<url> ...]
// Eks.:   node scripts/skjermbilder.mjs .design/runde-01 http://localhost:4321/ http://localhost:4321/priser
// Miljø:  TEMAER=light        (standard: light,dark)
//         MAKS_UTSNITT=4      (standard: 8)
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const [, , utmappe, ...urler] = process.argv;
if (!utmappe || urler.length === 0) {
  console.error('Bruk: node scripts/skjermbilder.mjs <utmappe> <url> [<url> ...]');
  process.exit(1);
}

const temaer = (process.env.TEMAER ?? 'light,dark').split(',').map((t) => t.trim()).filter(Boolean);
const maksUtsnitt = Number(process.env.MAKS_UTSNITT ?? 8);

const visninger = [
  { navn: 'mobil', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { navn: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
];

function filnavn(url) {
  const { hostname, pathname } = new URL(url);
  const ren = (hostname + pathname).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  return ren || 'side';
}

await mkdir(utmappe, { recursive: true });
const browser = await chromium.launch();
const feil = [];
let antall = 0;

for (const url of urler) {
  for (const visning of visninger) {
    for (const tema of temaer) {
      const { navn, ...innstillinger } = visning;
      const merke = `${url} [${navn}/${tema}]`;
      const context = await browser.newContext({
        ...innstillinger,
        colorScheme: tema,
        reducedMotion: 'reduce',
        locale: 'nb-NO',
      });
      const page = await context.newPage();
      page.on('console', (m) => { if (m.type() === 'error') feil.push(`${merke} konsoll: ${m.text()}`); });
      page.on('pageerror', (e) => feil.push(`${merke} sidefeil: ${e.message}`));

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
        await page.evaluate(() => document.fonts.ready);
        const base = path.join(utmappe, `${filnavn(url)}--${navn}--${tema}`);

        const { hoyde, vindu } = await page.evaluate(() => ({
          hoyde: document.documentElement.scrollHeight,
          vindu: window.innerHeight,
        }));
        const utsnitt = Math.min(maksUtsnitt, Math.max(1, Math.ceil(hoyde / vindu)));

        for (let i = 0; i < utsnitt; i += 1) {
          await page.evaluate((y) => window.scrollTo(0, y), i * vindu);
          await page.waitForTimeout(250);
          const fil = `${base}--${String(i).padStart(2, '0')}.png`;
          await page.screenshot({ path: fil });
          antall += 1;
        }
        console.log(`OK    ${merke}  ${utsnitt} utsnitt`);
      } catch (e) {
        feil.push(`${merke} ${String(e.message).split('\n')[0]}`);
        console.log(`FEIL  ${merke}`);
      }
      await context.close();
    }
  }
}

await browser.close();
console.log(`\n${antall} skjermbilder lagret i ${utmappe}`);
if (feil.length > 0) {
  console.error(`\n${feil.length} feil eller konsollmeldinger:`);
  for (const f of feil) console.error(`- ${f}`);
  process.exitCode = 1;
}
