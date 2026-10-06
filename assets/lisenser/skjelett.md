| Fil | Kilde | Oppskrift | Rettigheter | Dato | Av |
|---|---|---|---|---|---|
| `assets/mastere/skjelett-master.mp4` (raa 4K, bestilt retning) | Higgsfield: Qwen Image 3 (redigering) → Kling 3.0 4K (bilde-til-video), betalt API | assets/prompter/skjelett.json, scene «skjelett» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | 2026-10-06 | KodeKonsulentene |
| `assets/mastere/skjelett-snudd-master.mp4` (4K, snudd/kuttet/forskjøvet) | Avledet lokalt fra `skjelett-master.mp4` med ffmpeg, ingen ny generering | `ffmpeg -vf reverse` → `-t 6.0` → `scale=iw*0.78:ih*0.78,pad=3840:2160:654:414:color=0x0b0d10` | Som over | 2026-10-06 | KodeKonsulentene |
| `public/scener/skjelett-{2560,1920,1280}.mp4`, `skjelett-poster.avif` | Enkodet fra `skjelett-snudd-master.mp4` | Samme ffmpeg-innstillinger som `scripts/scene.mjs` bruker: `-preset slow -crf 20/19/19 -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -colorspace bt709` | Som over | 2026-10-06 | KodeKonsulentene |

**Merk:** klippet er bestilt BAKLENGS og snudd etterpå. Begrunnelsen står i
`assets/prompter/skjelett.json` under `_retning` og i `docs/skjelett.md`.
`scripts/scene.mjs` er ikke endret; snuingen, kuttet og forskyvningen er kjørt
som et eget ffmpeg-ledd etter at scene.mjs var ferdig, og er derfor loggført her
som egne rader.
