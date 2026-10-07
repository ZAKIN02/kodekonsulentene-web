| Fil | Kilde | Oppskrift | Rettigheter | Dato | Av |
|---|---|---|---|---|---|
| `.skudd/skjelett/r2c/{startbilde,mellombilde1,sluttbilde}.png` (råkilder, ikke i repo) | Higgsfield: Qwen Image 3 (text-to-image + edit), betalt API, `resolution: "2k"` → 2048×1152 | `assets/prompter/skjelett.json`, scene «skjelett», leddene `basisPrompt_ubrukt` → `start` → `slutt[0]` → `slutt[1]` | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | 2026-10-07 | KodeKonsulentene |
| `.skudd/skjelett/bygd/{startbilde,sluttbilde}.png` (nøkkelrammene) | Avledet lokalt fra rammene over med `.skudd/skjelett-bygg-rammer.py`, ingen ny generering | Armaturen er `mellombilde1` i begge rammer, piksel for piksel. De svevende platene er de samme fire platene, klippet ut og flyttet opp (avvik 0,000 av 255). De tomme feltene er et ekte tomt felt fra `sluttbilde`, innsatt 14 px. Lima er lime-pikslene fra `startbilde`, maskert og lagt på. Begge rammene skjøvet 184 px ned med `fillborders=…:mode=smear` | Som over | 2026-10-07 | KodeKonsulentene |
| `assets/mastere/skjelett-master.mp4` (rå 4K, bestilt retning) | Higgsfield: Kling 3.0 4K (bilde-til-video), betalt API. Nøkkelrammene over lastet opp via leverandørens presignerte opplasting | `assets/prompter/skjelett.json`, scene «skjelett», `bevegelse` + `_bevegelse`, `cfg_scale` 0,80, `duration` 8. Én bestilling | Som over | 2026-10-07 | KodeKonsulentene |
| `assets/mastere/skjelett-snudd-master.mp4` (4K, snudd) | Avledet lokalt fra `skjelett-master.mp4` med ffmpeg, ingen ny generering | `ffmpeg -vf reverse`. Ikke trimmet: siste ledd er 1,58, men ved 8,0 s ligger toppunktet på 62 %, og trimming ville skjøvet det ut av 35–65 % | Som over | 2026-10-07 | KodeKonsulentene |
| `public/scener/skjelett-{2560,1920,1280}.mp4`, `skjelett-poster.avif` | Enkodet fra `skjelett-snudd-master.mp4` | Samme ffmpeg-innstillinger som `scripts/scene.mjs` bruker: `-preset slow -crf 20/19/19 -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -colorspace bt709` | Som over | 2026-10-07 | KodeKonsulentene |

**Merk 1 – retningen.** Klippet er bestilt BAKLENGS (ferdig flate → plater som
løfter seg) og snudd etterpå, fordi det er retningen Qwen klarer å tegne.
Begrunnelsen står i `assets/prompter/skjelett.json` under `_retning`.

**Merk 2 – nøkkelrammene er bygget, ikke generert som ett bilde hver.** Alle
piksler er modellens egne; ingenting er tegnet for hånd. Grunnen er at Qwen
komponerer om loddrett ved hver redigering, så rammeparet aldri ble geometrisk
enig med seg selv. Hele begrunnelsen står i `.skudd/skjelett-bygg-rammer.py`,
i `docs/skjelett.md` under «Runde 2» og som regel 8 i `docs/akt.md`.

**Merk 3 – `scripts/scene.mjs` skriver denne fila på nytt ved hver kjøring** og
beholder bare den siste raden. Radene over er ført inn for hånd etterpå, fordi
lisensloggen er beviset vårt og en kjede på fem ledd ikke kan stå som ett.

**Runde 1** (levert 2026-10-06, erstattet fordi platene vippet mens de falt) er
tatt vare på i `.skudd/skjelett/runde1/` for sammenligning.
