#!/usr/bin/env node
// Lager en statisk testside for Prisvelger.astro (øyeblikk 5) uten å bygge
// Astro-prosjektet. Skript og stil trekkes ORDRETT ut av komponenten (typene
// fjernes med esbuild, som i de andre generatorene); HTML-malen speiler
// komponentens markup. Endres markupen i Prisvelger.astro, må malen her endres.
//
// Radene er testdata med «PLASSHOLDER kr» – ekte priser kommer fra bygger
// (src/data/priser.ts) og skrives aldri av her.
//
// Ut: .design/arbeid/bevegelse/side/prisvelger.html
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const rot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const kilde = path.join(rot, 'src', 'components', 'bevegelse', 'Prisvelger.astro');
const utmappe = path.join(rot, '.design', 'arbeid', 'bevegelse', 'side');

const astro = await readFile(kilde, 'utf8');
const taUt = (fil, startTag, sluttTag) => {
  const a = fil.indexOf(startTag);
  if (a === -1) throw new Error(`Fant ikke ${startTag}`);
  const start = fil.indexOf('>', a) + 1;
  const b = fil.indexOf(sluttTag, start);
  if (b === -1) throw new Error(`Fant ikke ${sluttTag}`);
  return fil.slice(start, b);
};
const skript = transformSync(taUt(astro, '<script>', '</script>'), { loader: 'ts' }).code;
const stil = taUt(astro, '<style', '</style>');

// Props som i kontrakten, med navn="test" (testvideoen er 6 s) og stoppunktene
// fra kortet: kaos 0 s (Start), midt 3 s (Bedrift), slutt 6 s (System).
const props = {
  navn: process.env.SCENE_NAVN || 'test',
  etikett: 'Velg pakke',
  statusMal: 'Valgt: {navn}. Illustrasjonen viser hva som er med.',
  bakgrunn: '#080809',
  pakker: [
    { id: 'start', navn: 'Start', pris: 'PLASSHOLDER kr', tekst: 'Testlinje for Start.', stopp: 0 },
    { id: 'bedrift', navn: 'Bedrift', pris: 'PLASSHOLDER kr', tekst: 'Testlinje for Bedrift.', stopp: 3, merke: 'Anbefalt' },
    { id: 'system', navn: 'System', pris: 'fra PLASSHOLDER kr', tekst: 'Testlinje for System.', stopp: 6 },
  ],
};
const base = `/scener/${props.navn}`;

const rader = props.pakker
  .map(
    (p, i) => `      <label class="prisvelger__rad">
        <input type="radio" name="prisvelger" value="${p.id}"${i === 0 ? ' checked' : ''} data-stopp="${p.stopp}" data-navn="${p.navn}" />
        <span class="prisvelger__navn">${p.navn}${p.merke ? ` <span class="prisvelger__merke">${p.merke}</span>` : ''}</span>
        <span class="prisvelger__pris">${p.pris}</span>
        <span class="prisvelger__linje">${p.tekst}</span>
      </label>`,
  )
  .join('\n');

const velgerHtml = `<div class="prisvelger" data-prisvelger data-statusmal="${props.statusMal}" style="--scene-bakgrunn: ${props.bakgrunn}">
    <div class="prisvelger__flate" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcset="${base}/poster-mobil.avif" type="image/avif" />
        <img src="${base}/poster.avif" alt="" width="1920" height="1080" decoding="async" loading="lazy" />
      </picture>
      <video muted playsinline preload="none" data-mobil="${base}/${props.navn}-mobil" data-desktop="${base}/${props.navn}-1080"></video>
    </div>
    <fieldset class="prisvelger__valg">
      <legend class="prisvelger__etikett">${props.etikett}</legend>
${rader}
    </fieldset>
    <p class="prisvelger__status" role="status"></p>
  </div>`;

const side = `<!doctype html>
<html lang="nb">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Testside for Prisvelger</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #fbfbf9; color: #111315; }
      main { max-width: 56rem; margin: 0 auto; padding: 1.5rem; }
${stil}
    </style>
  </head>
  <body>
    <main>
      <h2>Prisene står her</h2>
      ${velgerHtml}
    </main>
    <script type="module">
${skript}
    </script>
  </body>
</html>
`;

await mkdir(utmappe, { recursive: true });
await writeFile(path.join(utmappe, 'prisvelger.html'), side);
console.log(`Testside skrevet til ${path.join(utmappe, 'prisvelger.html')}`);
