#!/usr/bin/env node
// Tar opp bevegelse: ruller sakte nedover med musehjulet, lagrer ett bilde per steg og en video av hele turen.
// Brukes til å studere referansesider og til å vurdere egne animasjoner. Bevegelse er PÅ her.
//
// Bruk:   node scripts/filmstripe.mjs <utmappe> <url> [antall bilder]
// Eks.:   node scripts/filmstripe.mjs .design/film/lusion https://lusion.co/ 16
// Miljø:  VISNING=mobil   (standard: desktop)
//         STEG=600        (piksler rullet mellom hvert bilde, standard: 75 % av vindushøyden)
//         KANAL=chrome    (bruk installert Chrome, som spiller H.264. Standard: Playwrights Chromium)
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const [, , utmappe, url, antallArg] = process.argv;
if (!utmappe || !url) {
  console.error('Bruk: node scripts/filmstripe.mjs <utmappe> <url> [antall bilder]');
  process.exit(1);
}

const antall = Number(antallArg ?? 12);
const mobil = process.env.VISNING === 'mobil';
const viewport = mobil ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const steg = Number(process.env.STEG ?? Math.round(viewport.height * 0.75));

await mkdir(utmappe, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.KANAL || undefined,
  // Programvare-GL, slik at sider med WebGL også tegnes i en nettleser uten skjermkort.
  args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: 1,
  isMobile: mobil,
  hasTouch: mobil,
  locale: 'nb-NO',
  reducedMotion: 'no-preference',
  recordVideo: { dir: utmappe, size: viewport },
});
const page = await context.newPage();

try {
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
} catch (e) {
  console.error(`Siden lastet ikke ferdig: ${String(e.message).split('\n')[0]}`);
}
// Vent ut innlastingsskjermer og åpningsanimasjoner.
await page.waitForTimeout(4000);
await page.mouse.move(viewport.width / 2, viewport.height / 2);

for (let i = 0; i < antall; i += 1) {
  const fil = path.join(utmappe, `bilde-${String(i).padStart(2, '0')}.png`);
  await page.screenshot({ path: fil });
  const y = await page.evaluate(() => Math.round(window.scrollY));
  console.log(`bilde ${String(i).padStart(2, '0')}  scrollY=${y}`);
  // Rull i små rykk, slik et musehjul gjør. Sider med egen rullemotor lytter på hjulet, ikke på scrollTo.
  for (let d = 0; d < 6; d += 1) {
    await page.mouse.wheel(0, steg / 6);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(700);
}

const video = page.video();
await context.close();
if (video) {
  await video.saveAs(path.join(utmappe, 'opptak.webm'));
  await video.delete();
}
await browser.close();
console.log(`\n${antall} bilder og opptak.webm lagret i ${utmappe}`);
