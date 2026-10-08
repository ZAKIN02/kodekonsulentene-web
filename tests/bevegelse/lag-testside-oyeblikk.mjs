#!/usr/bin/env node
// Lager en statisk testside for øyeblikk 2 (Loft), 3 (CaseVideo) og 6 (Reel)
// uten å bygge hele Astro-prosjektet. Skript og stiler trekkes ORDRETT ut av
// komponentene i src/components/bevegelse/, slik at testene kjører mot den
// faktiske koden. HTML-malen under speiler komponentenes markup.
// Endres markupen i en komponent, må malen her endres tilsvarende.
//
// Ut: .design/arbeid/bevegelse/side/oyeblikk.html
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const rot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const mappe = path.join(rot, 'src', 'components', 'bevegelse');
const utmappe = path.join(rot, '.design', 'arbeid', 'bevegelse', 'side');

const taUt = (fil, startTag, sluttTag) => {
  const a = fil.indexOf(startTag);
  if (a === -1) throw new Error(`Fant ikke ${startTag}`);
  const start = fil.indexOf('>', a) + 1;
  const b = fil.indexOf(sluttTag, start);
  if (b === -1) throw new Error(`Fant ikke ${sluttTag}`);
  return fil.slice(start, b);
};

const les = async (navn) => {
  const astro = await readFile(path.join(mappe, `${navn}.astro`), 'utf8');
  // Skriptene står som TypeScript i komponentene (astro check er streng).
  // esbuild fjerner bare typene – samme transpilering som Astro selv bruker.
  const skript = transformSync(taUt(astro, '<script>', '</script>'), { loader: 'ts' }).code;
  return { skript, stil: taUt(astro, '<style', '</style>') };
};

const loft = await les('Loft');
const casevideo = await les('CaseVideo');
const reel = await les('Reel');

// Speiler frontmatter-logikken i CaseVideo/Reel: finnes filene på disk?
const iPublic = (sti) => path.join(rot, 'public', sti);
const caseOpptak = '/scener/test/test-1080';
const casePoster = '/scener/test/poster.avif';
const caseFinnes =
  (existsSync(iPublic(`${caseOpptak}.mp4`)) || existsSync(iPublic(`${caseOpptak}.webm`))) &&
  existsSync(iPublic(casePoster));
const reelFilm = '/scener/test/test-1080';
const reelHarMp4 = existsSync(iPublic(`${reelFilm}.mp4`));

// Speiler CaseVideo.astro (finnes-grenen) – og mangler-grenen for en sti uten filer.
const caseHtml = caseFinnes
  ? `<div class="casevideo" data-casevideo style="aspect-ratio: 1920 / 1080">
        <video muted playsinline loop preload="none" poster="${casePoster}" width="1920" height="1080" aria-hidden="true" tabindex="-1" data-mp4="${caseOpptak}.mp4" data-webm="${caseOpptak}.webm"></video>
      </div>`
  : `<div class="casevideo casevideo--mangler" style="aspect-ratio: 1920 / 1080"><p>MANGLER: skjermopptak</p></div>`;

const manglerHtml = `<div class="casevideo casevideo--mangler" style="aspect-ratio: 1920 / 1080">
        <p>MANGLER: skjermopptak</p>
      </div>`;

// Speiler Reel.astro (finnes-grenen).
const reelHtml = `<div class="reel" data-reel>
        <a class="reel__knapp" href="${reelFilm}.${reelHarMp4 ? 'mp4' : 'webm'}" data-reel-apne>Spill av</a>
        <dialog class="reel__dialog" aria-label="Film: slik jobber vi">
          <button class="reel__lukk" type="button" data-reel-lukk>Lukk</button>
          <video controls playsinline preload="none" poster="${casePoster}" data-mp4="${reelFilm}.mp4" data-webm="${reelFilm}.webm"></video>
        </dialog>
      </div>`;

const side = `<!doctype html>
<html lang="nb">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Testside for øyeblikk 2, 3 og 6</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #fbfbf9; color: #111315; }
      main { padding: 1.5rem; }
      .plass { height: 150vh; }
      h1.loft, h2.loft { max-width: 18ch; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; }
${loft.stil}
${casevideo.stil}
${reel.stil}
    </style>
  </head>
  <body>
    <main>
      <h1 class="loft" id="h1-topp" data-loft>Gratis befaring av nettsiden din</h1>
      <div class="plass" aria-hidden="true"></div>
      <h2 class="loft" id="h2-under" data-loft>Vi tar siden fra hverandre lag for lag</h2>
      <div class="plass" aria-hidden="true"></div>
      <a href="#h1-topp" data-case id="case" style="display: block; max-width: 48rem">
        ${caseHtml}
        <span>Booking for frisører</span>
      </a>
      <div style="max-width: 48rem; margin-top: 2rem" id="case-mangler">
        ${manglerHtml}
      </div>
      <div class="plass" aria-hidden="true"></div>
      ${reelHtml}
      <div class="plass" aria-hidden="true"></div>
    </main>
    <script type="module">
${loft.skript}
    </script>
    <script type="module">
${casevideo.skript}
    </script>
    <script type="module">
${reel.skript}
    </script>
  </body>
</html>
`;

await mkdir(utmappe, { recursive: true });
await writeFile(path.join(utmappe, 'oyeblikk.html'), side);
console.log(`Testside skrevet til ${path.join(utmappe, 'oyeblikk.html')}`);
