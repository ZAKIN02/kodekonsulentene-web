# f1-produsent-utkast: DELVIS. Klipp A i begge formater og hero-scenen er levert. C og klipp B mangler.

Dato: 8. oktober 2026. Estimert forbruk: 67,4 av 100 kreditter (sum av POST /estimate i loggen, feilede kall trukket fra). Saldo kan ikke leses via API. Eier må lese den i console.higgsfield.ai.

## Gjort

- `scripts/produksjon.mjs`: `bilde`, `video`, `sum`, `--kun-estimat`, `--modell qwen|grok|ideogram`. Estimat før, ramme-sjekk, nedlasting, ffprobe og logg.
- Prompter: del 9 ordrett i `assets/higgsfield/prompter/`, pluss versjonsfiler (bilde-A-v2/v3, bilde-B-v2..v5, bilde-C-v2, bilde-A-mobil, klipp-A-v2 m.fl.). Hvert forsøk og hver endring står i `assets/higgsfield/logg.md`.
- Lisenslogg ført i `assets/LICENSES.md`.

## Modellvalg for B (oppfølgingen)

Qwen holdt ikke antallet i 12 redigeringer av A (se forrige versjon: 5 plater, 6 til 7 porter og kabler). Testkall med lik prompt (v4), alle mot A.png:

| Modell | Resultat |
|---|---|
| Ideogram 4.0 | Rearrangerte ikke: ga i praksis A tilbake. Forkastet. |
| Grok Imagine Image 2.0 | 4 plater, 5 porter, 5 kabler, samme lys og utsnitt. Valgt. |

Fem Grok-forsøk på B (grok-1 til -5): grok-1 er beste. Grok-2 til -5 hadde seks kabler eller to bunnplater. B.png = B-grok-1. Avvik fra prompten: kablene ligger på bunnplatens overside og ikke under forkanten. Bunnplaten lå 55 px lavere enn i A i overlegget. Jeg flyttet B 55 px opp med ffmpeg (`B-justert.png`, crop og smear-fylling nederst, ingen oppskalering). Overlegget etterpå viser bunnplate og porter sammenfallende.

Mobil (9:16): A-mobil-2 er recomposert fra A med Grok (4 plater, 5 porter). B-mobil-3 er redigert fra den: 4 plater, 5 porter, 5 kabler hengende under forkanten, bunnplaten sammenfaller i overlegg uten justering.

## Klipp A (Kling 3.0)

| Fil | Oppløsning | Rammer | Poeng (0 til 3 per kriterium) |
|---|---|---|---|
| `raa/hero-A.mp4` (16:9) | 1920 × 1080 | 145 | ca. 16/18: objekt 3, start/slutt 3, jevnhet 2, lys 3, renhet 3, helhet 2 |
| `raa/hero-mobil-A.mp4` (9:16) | 1080 × 1920 | 145 | ca. 14/18: objekt 3, start/slutt 3, jevnhet 2, lys 3, renhet 2, helhet 1. Toppplaten stiger litt over sluttposisjonen midtveis og setter seg. |

- `pro` gir 1080p. 4k-endepunktet ble ikke brukt.
- Draft 1 (std, klipp-A ordrett) var bra, men bevegelsen var ferdig etter 3,5 s. Draft 2 (klipp-A-v2: hold 0 til 1,5 s, bevegelse 1,5 til 5,5 s) fikk jevnere fordeling. Samme prompt i pro for begge formater.
- Poengene er mine og ikke uavhengig vurdert. Rammer sett: hver tolvte ramme, første og siste.
- Kjente feil: i 16:9 holder klippet stille de siste ca. 1,7 s. Kablene krysser kort bak keramikkplaten midtveis.

## Hero-scenen

`scripts/lag-scene.sh hero` kjørte uten feil:

| Fil | Størrelse | Mål i del 9 |
|---|---|---|
| hero-1080.mp4 (1920×1080) | 1 885 kB | under 2,5 MB, ok |
| hero-mobil.mp4 (1080×1920) | 1 669 kB | under 2,5 MB, ok |
| hero-1080.webm / hero-mobil.webm | 1 315 / 1 161 kB | ingen mål |
| poster.avif / poster-mobil.avif | 18 / 17 kB | under 120 kB, ok |

Bakgrunnsfarge i hjørnet av første ramme er målt til `#080809`, ikke `#0b0d10`. Scenens CSS-bakgrunn bør settes til målt verdi (del 9).

## Ikke levert

- Bilde C (16:9): fire Grok-forsøk (ordrett x2, v2 x2) flyttet ikke platene ned. Grok beholdt plater som svever og la bare til lime-lys. Ikke prøvd med Qwen.
- Klipp B (B til C) og sløyfe: ingen C, derfor ikke laget. Heroen har bare klipp A (6 s, kaos til oppstilt). Mangler: sammenføyd system.
- Bilde A er ikke strammet opp: A-3 er godtatt som den står, kabelknuten kan ikke telles. Dirigenten godtok dette.
- Mobil C ikke forespurt.

## Åpne punkter

1. C mangler. Neste steg: be Grok om C fra B-justert i flere små trinn, eller bygg C med ffmpeg (plater flyttet ned, akt.md 8c).
2. Heroen har bare klipp A. Avgjør om A→B holder for første skjerm, eller bestill C og klipp B.
3. Restramme: ca. 32 kreditter.
