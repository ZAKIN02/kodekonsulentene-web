| Fil | Kilde | Oppskrift | Rettigheter | Dato | Av |
|---|---|---|---|---|---|
| `public/scener/apper-*.mp4`, `apper-poster.avif` | Higgsfield: Qwen Image 3 (redigering) → Kling 3.0 4K (bilde-til-video), betalt API | assets/prompter/scener.json, scene «apper» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | 2026-10-06 | KodeKonsulentene |
| `public/bilder/apper-par-*.avif`, `apper-par-*.webp` | Higgsfield: Qwen Image 3 (redigering), betalt API | assets/prompter/bilder.json, bilde «apper-par» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | 2026-10-06 | KodeKonsulentene |
| `public/bilder/apper-lag-*.avif`, `apper-lag-*.webp` | Higgsfield: Qwen Image 3 (redigering), betalt API | assets/prompter/bilder.json, bilde «apper-lag» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | 2026-10-06 | KodeKonsulentene |

## Merknad

Stillbildene ble bygget med `node scripts/stillbilde.mjs <id> --fil assets/prompter/apper.json`.
Rørledningen skriver lisensraden hardkodet til `assets/lisenser/bilder.md`; radene er flyttet hit
for hånd, så logg og område henger sammen. Et `--fil`-flagg bør også styre lisensfila.
