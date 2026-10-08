#!/usr/bin/env node
// Lager en statisk testside for Scene.astro uten å bygge hele Astro-prosjektet.
// Skriptet og stilene trekkes ORDRETT ut av src/components/bevegelse/Scene.astro,
// slik at testene kjører mot den faktiske koden i komponenten. Selve HTML-malen
// under speiler komponentens markup for propsene i eksempelet i briefens del 8.
// Endres markupen i Scene.astro, må malen her endres tilsvarende.
//
// Ut: .design/arbeid/bevegelse/side/index.html
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const kilde = path.join(rot, 'src', 'components', 'bevegelse', 'Scene.astro');
const utmappe = path.join(rot, '.design', 'arbeid', 'bevegelse', 'side');

const astro = await readFile(kilde, 'utf8');

const taUt = (fil, start, slutt) => {
  const a = fil.indexOf(start);
  const b = fil.indexOf(slutt, a);
  if (a === -1 || b === -1) throw new Error(`Fant ikke ${start} i Scene.astro`);
  return fil.slice(a + start.length, b);
};

const inlineSkript = taUt(astro, '<script is:inline>', '</script>');
const skript = taUt(astro, '<script>', '</script>');
const stil = taUt(astro, '<style>', '</style>');

// Props som i brukseksempelet i briefens del 8, med navn="test" for testvideoene.
// SCENE_NAVN=hero gir de ekte klippene, til manuell kontroll.
const props = {
  navn: process.env.SCENE_NAVN || 'test',
  bakgrunn: '#080809',
  etikett: 'Slik befarer vi en nettside',
  hoppTil: 'etter',
  prioritet: false,
  steg: [
    { tittel: 'Fem verktøy. Null samtaler.', tekst: 'Nettside, booking, betaling og regnskap lever hvert sitt liv.' },
    { tittel: 'Vi tar siden fra hverandre', tekst: 'Lag for lag: design, kode, sikkerhet og integrasjoner.' },
    { tittel: 'Hvert lag får en jobb', tekst: 'Universell utforming, kryptert trafikk, Vipps inn, Fiken ut.' },
    { tittel: 'Ett system som henger sammen', tekst: 'Når lagene passer, slutter du å være limet.' },
  ],
};

const base = `/scener/${props.navn}`;

// Speiler template-delen av Scene.astro (prioritet=false gir loading="lazy" og fetchpriority="auto").
const sceneHtml = `<section class="scene" data-scene aria-label="${props.etikett}" style="--lengde: ${props.steg.length}; --scene-bakgrunn: ${props.bakgrunn}">
  <a class="scene__hopp" href="#${props.hoppTil}">Hopp over animasjonen</a>
  <div class="scene__flate" aria-hidden="true">
    <picture>
      <source media="(max-width: 767px)" srcset="${base}/poster-mobil.avif" type="image/avif" />
      <img src="${base}/poster.avif" alt="" width="1920" height="1080" decoding="async" loading="lazy" fetchpriority="auto" />
    </picture>
    <video muted playsinline preload="none" data-mobil="${base}/${props.navn}-mobil" data-desktop="${base}/${props.navn}-1080"></video>
  </div>
  <ol class="scene__tekst">
${props.steg
  .map(
    (s) => `    <li class="scene__steg">
      <h2>${s.tittel}</h2>
      <p>${s.tekst}</p>
    </li>`,
  )
  .join('\n')}
  </ol>
</section>`;

const side = `<!doctype html>
<html lang="nb">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Testside for Scene</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #fbfbf9; color: #111315; }
${stil}
    </style>
  </head>
  <body>
    <main>
      ${sceneHtml}
      <script>
${inlineSkript}
      </script>
      <section id="etter" style="padding: 4rem 1.5rem">
        <h2>Etter scenen</h2>
        <p>Vanlig innhold som kommer etter scenen, slik at det går an å rulle forbi.</p>
      </section>
    </main>
    <script type="module">
${skript}
    </script>
  </body>
</html>
`;

await mkdir(utmappe, { recursive: true });
await writeFile(path.join(utmappe, 'index.html'), side);
console.log(`Testside skrevet til ${path.join(utmappe, 'index.html')}`);
