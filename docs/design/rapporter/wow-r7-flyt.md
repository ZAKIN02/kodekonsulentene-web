# wow-r7-flyt: rullefilmen skal ikke hakke

Dato: 24. nov. 2026. Gren: `redesign/wow`. Ikke commitet.

## Kort

Rullefilmen søker ikke lenger i en `<video>`. Der nettleseren har WebCodecs, dekoder vi ramene selv
før de trengs og tegner dem på et lerret i samme bilde som teksten. Klippene er kodet om for dette
(16:9 i 1080p, 9:16 i 720p, GOP 8, uten B-ramer). Reserven er den gamle `<video>`-veien, med samme fil.

- **Bildet er på riktig rame 95 % av tiden mot 51 % før** (hele filmen, fire profiler). Ved rolig
  rulling 98–99 %. Ingen frys over 50 ms før eller etter på denne maskinen.
- **Når dekoderen er treg, er forskjellen stor.** Med fire ganger så mange piksler å dekode (4K som
  stand-in for en svak telefon) taper `<video>`-søking 27–28 % av bildebyttene i Chrome. Den nye
  veien taper 0,1–0,4 %.
- **Vekt:** 16:9 fra 18,7 til 20,3 MB (+8 %), 9:16 fra 16,6 til 13,7 MB (−18 %).
- **LCP på forsiden er ikke under 2500 ms med revisors metode.** Median 2599 ms (var 2744). Det som
  gjenstår, ligger utenfor filene mine, se «LCP».
- **`npm run verify` er ikke grønn:** 5 av 342 enhetstester er røde, alle i sider andre arbeider med
  (`/verktoy/dmarc`, `/om`, sjekk-sekvens, uuregister). `astro check` 0 feil, bygget går.

## Forbehold om målingene

- Alt er målt på én Mac (Apple M3) i hodeløs Chrome 158 og Playwrights WebKit 26.6. Ingen ekte telefon.
- CPU-struping 4x i Chrome bremser bare hovedtråden. Videodekodingen går i en annen prosess og
  strupes ikke. Derfor ser dagens løsning nesten like bra ut på «mobil 4x» som på desktop. For å
  belaste dekoderen har jeg kodet samme klipp i 3840 × 2160 («stress»): fire ganger pikslene.
- WebKit kan ikke CPU-strupes i Playwright. «webkit-mobil» er mobil visning uten struping.
- Minnetallene er prosessenes fotavtrykk (`top`, MEM) over en tom side, i hodeløs nettleser. De
  svinger mye mellom kjøringer og sier lite om en telefon. Bruk dem til å sammenligne, ikke som fasit.
- Én kjøring per celle. Små forskjeller (under ett prosentpoeng) er støy.

## Slik er det målt

Måleside og skript ligger i `.skudd/wow/r7-flyt/` (`bench.html`, `maal.mjs`, `maal-side.mjs`, `tabell.mjs`).

- **Alternativene** er målt på en egen måleside der alle tre motorene får samme rullebane: jevnt i
  1x, 4x og 12x klippfart frem og tilbake, vugging (snur 3 ganger i sekundet) og brå hopp. 18 sekunder.
- **Den ekte siden** (`/lab/scroll-world`) er rullet gjennom hele filmen fem ganger (1 og 3
  skjermhøyder i sekundet, begge veier) pluss vugging. Før og etter, samme skript.
- **Tapte bildebytter:** andelen ganger bildet skulle byttet rame, men ikke gjorde det.
- **Frys:** bildet står stille mens ønsket rame er minst én hel rame unna. Antall over 50 ms, og lengste.
- **Tid bak målet:** andelen av tiden bildet er minst én rame fra ønsket rame.
- **Ventetid:** tid fra en rame ønskes til den (eller en senere) vises.

## Den ekte siden, før og etter

| Profil | Måling | Motor | Tapte bildebytter | Frys > 50 ms (lengste) | Tid bak målet | Ventetid p95 (maks) | rAF > 20 ms | Lange oppgaver | Minne (filmen) | Klipp overført |
|---|---|---|---|---|---|---|---|---|---|---|
| chrome-desktop | før | video | 0,2 % | 0 (33 ms) | 49,1 % | 16,7 ms (33,4) | 0 av 2352 | 0 | 289 MB | 16,64 MB / 9 forespørsler |
| chrome-desktop | etter | webcodecs | 0,5 % | 0 (33 ms) | 4,4 % | 16,6 ms (16,8) | 0 av 2352 | 0 | 453 MB | 20,26 MB / 45 forespørsler |
| chrome-mobil-4x | før | video | 0,4 % | 0 (33 ms) | 49,2 % | 16,7 ms (33,4) | 0 av 2350 | 0 | 308 MB | 14,88 MB / 9 forespørsler |
| chrome-mobil-4x | etter | webcodecs | 0 % | 0 (33 ms) | 4,7 % | 16,6 ms (16,8) | 0 av 2352 | 0 | 312 MB | 14,54 MB / 36 forespørsler |
| webkit-desktop | før | video | 0,4 % | 0 (35 ms) | 48,8 % | 17 ms (34) | 1 av 2349 | 0 | 439 MB | 16,64 MB / 9 forespørsler |
| webkit-desktop | etter | webcodecs | 0,9 % | 0 (34 ms) | 5,0 % | 17 ms (34) | 3 av 2349 | 0 | 276 MB | 20,26 MB / 45 forespørsler |
| webkit-mobil | før | video | 0,3 % | 0 (35 ms) | 49,6 % | 17 ms (35) | 0 av 2350 | 0 | 624 MB | 14,88 MB / 9 forespørsler |
| webkit-mobil | etter | webcodecs | 0,1 % | 0 (33 ms) | 4,7 % | 17 ms (18) | 5 av 2350 | 0 | 533 MB | 14,54 MB / 36 forespørsler |

Per fase, tid bak målet og ventetid p95 (målt før den siste justeringen av rask rulling; totalen over er etter):

| Profil | Måling | Første gang frem | Rolig bak | Rolig frem | Rask bak | Rask frem | Vugging |
|---|---|---|---|---|---|---|---|
| chrome-desktop | før | 46,1 % / 16,7 | 45,2 % / 16,8 | 46,1 % / 16,8 | 44,6 % / 16,7 | 45,1 % / 16,7 | 80,1 % / 16,7 |
| chrome-desktop | etter | 1,3 % / 0 | 0,4 % / 0 | 1,8 % / 0 | 15,9 % / 16,7 | 24,1 % / 16,7 | 3,0 % / 0 |
| chrome-mobil-4x | før | 46,3 % / 16,7 | 47,0 % / 16,8 | 46,3 % / 16,7 | 44,8 % / 16,7 | 44,3 % / 16,8 | 76,7 % / 16,8 |
| chrome-mobil-4x | etter | 1,4 % / 0 | 0,5 % / 0 | 2,0 % / 0 | 18,5 % / 16,7 | 26,2 % / 16,7 | 2,1 % / 0 |
| webkit-desktop | før | 46,0 % / 17 | 45,0 % / 17 | 46,0 % / 17 | 44,2 % / 17 | 44,8 % / 18 | 78,4 % / 17 |
| webkit-desktop | etter | 2,5 % / 0 | 1,1 % / 0 | 2,0 % / 0 | 21,1 % / 19 | 26,8 % / 33 | 2,6 % / 0 |
| webkit-mobil | før | 46,9 % / 17 | 46,5 % / 17 | 46,9 % / 17 | 43,6 % / 17 | 46,2 % / 18 | 78,7 % / 17 |
| webkit-mobil | etter | 1,1 % / 0 | 0,7 % / 0 | 1,1 % / 0 | 19,0 % / 18 | 26,7 % / 17 | 2,8 % / 0 |

Lest: før var bildet ett skjermbilde bak omtrent halve tiden, og ved vugging 77–80 %. Nå er det på
riktig rame i samme bilde som rullingen, unntatt ved rask rulling (3 skjermhøyder i sekundet, 6 ramer
per skjermbilde), der det er ett skjermbilde bak 16–27 % av tiden.

## Alternativene (kort klipp, 121 ramer)

`0` er dagens løsning, `a` er `<video>` med andre kodinger, `b` rammesekvens på lerret, `c` WebCodecs,
`x` er stresstesten i 4K. `g8` = nøkkelrame hver 8. rame, `f12` = 12 bilder i sekundet, `k16` = vindu på
16 ramer (ellers 40), `bm` = ramene kopiert til ImageBitmap, `sw` = programvaredekoding.

**chrome-mobil-4x**

| Alternativ | Tapte bildebytter | Frys > 50 ms (lengste) | Tid bak målet | Ventetid p95 | rAF > 20 ms | Minne | Vekt | Første bilde |
|---|---|---|---|---|---|---|---|---|
| 0-dagens-g8-1080 | 0 % | 2 (50 ms) | 51,7 % | 16,7 ms | 0 av 1080 | 17 MB | 1,74 MB | 126 ms |
| a-g8-720 | 0 % | 0 (34 ms) | 44,5 % | 16,7 ms | 0 av 1080 | 16 MB | 1,61 MB | 109 ms |
| a-g4-720 | 0 % | 0 (34 ms) | 45,4 % | 16,7 ms | 0 av 1081 | 19 MB | 2,30 MB | 107 ms |
| a-g2-720 | 0 % | 0 (33 ms) | 44,5 % | 16,7 ms | 0 av 1080 | 25 MB | 3,72 MB | 107 ms |
| a-g1-720 | 0 % | 0 (33 ms) | 44,8 % | 16,7 ms | 0 av 1080 | 28 MB | 4,25 MB | 120 ms |
| a-g1-720-f12 | 0 % | 0 (34 ms) | 23,1 % | 16,7 ms | 0 av 1080 | 24 MB | 2,77 MB | 117 ms |
| b-seq-webp-720 | 0,3 % | 0 (33 ms) | 2,4 % | 0 ms | 0 av 1080 | 493 MB | 5,07 MB / 121 filer | 50 ms |
| c-wc-g8-720 | 0 % | 0 (0 ms) | 0 % | 0 ms | 0 av 1080 | 212 MB | 1,61 MB | 206 ms |
| c-wc-g1-720 | 0,1 % | 1 (83 ms) | 2,9 % | 0 ms | 4 av 1069 | 452 MB | 4,25 MB | 105 ms |
| x-stress-video-g8-2160 | 28,1 % | 6 (50 ms) | 60,0 % | 49,9 ms | 1 av 1079 | 43 MB | 7,60 MB | 263 ms |
| x-stress-wc-g8-2160 | 0,4 % | 0 (33 ms) | 3,6 % | 16,6 ms | 0 av 1080 | 651 MB | 7,60 MB | 133 ms |

**webkit-mobil**

| Alternativ | Tapte bildebytter | Frys > 50 ms (lengste) | Tid bak målet | Ventetid p95 | rAF > 20 ms | Minne | Vekt | Første bilde |
|---|---|---|---|---|---|---|---|---|
| 0-dagens-g8-1080 | 0 % | 6 (51 ms) | 51,8 % | 17 ms | 0 av 1081 | 54 MB | 1,74 MB | 114 ms |
| a-g1-720 | 0,9 % | 0 (50 ms) | 45,0 % | 18 ms | 0 av 1080 | 17 MB | 4,25 MB | 166 ms |
| a-g1-720-f12 | 1,6 % | 1 (51 ms) | 25,2 % | 18 ms | 1 av 1080 | 6 MB | 2,77 MB | 220 ms |
| b-seq-webp-720 | 1,6 % | 0 (41 ms) | 4,0 % | 0 ms | 108 av 1056 | 408 MB | 5,07 MB / 121 filer | 21 ms |
| c-wc-g8-1080 (dagens fil) | 0 % | 0 (0 ms) | 0,4 % | 0 ms | 0 av 1081 | 29 MB | 1,74 MB | 114 ms |
| c-wc-g8-720 | 0 % | 0 (0 ms) | 0,1 % | 0 ms | 2 av 1079 | 25 MB | 1,61 MB | 79 ms |
| c-wc-g1-720 | 0 % | 0 (0 ms) | 3,2 % | 0 ms | 1 av 1080 | 53 MB | 4,25 MB | 83 ms |
| c-wc-g8-720-k24-bm | dekoderfeil («Decoding task did not complete»), 1,6 bilder/s, minnet målt til 12 GB | | | | | | | |
| x-stress-video-g8-2160 | 7,9 % | 2 (51 ms) | 51,8 % | 34 ms | 1 av 1080 | 193 MB | 7,60 MB | 135 ms |
| x-stress-wc-g8-2160 | 9,9 % | 0 (50 ms) | 19,0 % | 61 ms | 169 av 1070 | 282 MB | 7,60 MB | 114 ms |

**chrome-desktop** (alle 22 variantene: `node .skudd/wow/r7-flyt/tabell.mjs`)

| Alternativ | Tapte bildebytter | Frys > 50 ms (lengste) | Tid bak målet | Ventetid p95 | Minne | Vekt |
|---|---|---|---|---|---|---|
| 0-dagens-g8-1080 | 0 % | 0 (33 ms) | 48,1 % | 16,7 ms | 19 MB | 1,85 MB |
| a-g2-1080 / a-g1-1080 | 0 % | 0 (34 ms) | 45,2 % / 44,8 % | 16,7 ms | 43 / 48 MB | 6,89 / 7,92 MB |
| a-g1-720-f12 | 0 % | 0 (33 ms) | 23,1 % | 16,7 ms | 28 MB | 2,96 MB |
| b-seq-webp-720 | 0,4 % | 0 (0 ms) | 2,2 % | 0 ms | 497 MB | 5,98 MB / 121 filer |
| c-wc-g8-720 | 0 % | 0 (0 ms) | 0 % | 0 ms | 230 MB | 1,77 MB |
| c-wc-g4-720 / g2 / g1 | 0 % / 0 % / 0,1 % | 0 | 0 % / 0 % / 2,4 % | 0 ms | 337 / 549 / 635 MB | 2,57 / 4,20 / 4,58 MB |
| x-stress-video-g8-2160 | 26,9 % | 9 (67 ms) | 57,4 % | 33,4 ms | 49 MB | 7,99 MB |
| x-stress-video-g1-2160 | 24,0 % | 0 (34 ms) | 48,1 % | 33,4 ms | 75 MB | 19,5 MB |
| x-stress-wc-g8-2160 | 0,1 % | 0 (33 ms) | 2,2 % | 0 ms | 658 MB | 7,99 MB |

**Syntetisk langt klipp (726 ramer, 30 s), bare mobilprofilene** (lavere prioritet etter beskjed)

| Profil | Alternativ | Tapte bildebytter | Frys > 50 ms (lengste) | Tid bak målet | rAF > 20 ms | Minne | Vekt |
|---|---|---|---|---|---|---|---|
| chrome-mobil-4x | 0-dagens-g8-1080 | 2,5 % | 4 (50 ms) | 64,0 % | 0 av 1081 | 36 MB | 9,86 MB |
| chrome-mobil-4x | a-g1-720 | 0 % | 0 (33 ms) | 52,0 % | 0 av 1081 | 65 MB | 20,83 MB |
| chrome-mobil-4x | b-seq-webp-720 | 0,1 % | 0 (0 ms) | 3,8 % | 0 av 1080 | 538 MB | 22,71 MB / 726 filer |
| chrome-mobil-4x | c-wc-g8-720 | 0 % | 0 (0 ms) | 1,6 % | 0 av 1080 | 226 MB | 8,82 MB |
| webkit-mobil | 0-dagens-g8-1080 | 2,3 % | 4 (51 ms) | 62,3 % | 0 av 1080 | 69 MB | 9,86 MB |
| webkit-mobil | a-g1-720 | 0,3 % | 0 (50 ms) | 52,2 % | 1 av 1080 | 66 MB | 20,83 MB |
| webkit-mobil | b-seq-webp-720 | 1,4 % | 0 (34 ms) | 7,9 % | 141 av 1047 | 447 MB | 22,71 MB / 726 filer |
| webkit-mobil | c-wc-g8-720 | 0,1 % | 0 (30 ms) | 1,8 % | 1 av 1080 | 68 MB | 8,82 MB |

Det lange klippet er målt på målesiden, som henter hele fila først. Den bygde motoren henter i deler
(Range), men den er ikke målt med et langt klipp på den ekte siden.

## Valget: c, WebCodecs med GOP 8, og `<video>` som reserve

- **a (kortere GOP, lavere bildefrekvens) hjelper ikke der det teller.** `<video>`-søking er alltid
  minst ett skjermbilde bak (44–52 % av tiden), uansett GOP. Bare nøkkelramer gjør fila 2,6 ganger
  større og taper fortsatt 24 % av bildebyttene i stresstesten. 12 bilder i sekundet halverer tiden
  bak målet, men bare fordi det er halvparten så mange ramer å treffe.
- **b (rammesekvens) er jevn i Chrome, men ikke i WebKit:** 108–141 av rundt 1050 skjermbilder over
  20 ms. Den veier 3,2 ganger mer (5,07 mot 1,61 MB per klipp, 121 filer), og et klipp på 30 s blir
  22,7 MB og 726 forespørsler.
- **c holder målet i alle fire profiler** med samme vekt som i dag, og tåler fire ganger tregere
  dekoding i Chrome. GOP 8 er valgt fordi GOP 4, 2 og 1 ikke målte bedre og veier 1,5 til 2,6 ganger mer.
- **Svakheten ved c:** i WebKits stresstest er den ikke bedre enn `<video>` (9,9 mot 7,9 % tapt, og
  169 skjermbilder over 20 ms). Å tegne 4K-ramer på lerret er tungt der. Ved de oppløsningene vi
  faktisk bruker, er den ren.
- **Kopiering til ImageBitmap er forkastet.** Jeg bygde det først for å skåne maskinvaredekodere med
  få utbuffere. I WebKit feilet dekoderen, og den ekte siden gikk til 362 av 1604 skjermbilder over
  20 ms. Motoren holder nå på `VideoFrame`-ene direkte.

## Hva som er bygget

- `src/scripts/wow/spole.ts` (ny): rene funksjoner. Leser MP4-tabellen, bygger GOP-er og
  Range-deler, velger hva som skal dekodes og hva som kastes.
- `src/scripts/wow/rullefilm.ts` (ny): bildekilden. Hentes først når et klipp skal lastes.
  - Første henting er 256 kB (tabellen og de første GOP-ene), resten i deler på 640 kB, nærmest først.
  - Vinduet er en ring: 24–48 ramer for det aktive klippet, 4 for naboene, uavhengig av klippets lengde.
  - Leverer ikke dekoderen innen 2,5 s, eller feiler den tre ganger, prøves programvaredekoding, så `<video>`.
- `scroll-world.ts`: bruker kilden. Antall ramer leses fra fila; ingenting antar 121.
- `scripts/kod-rullefilm.sh <inn-16x9.mp4> <navn> [<inn-9x16.mp4>]`: lager `<navn>.mp4` (1920 × 1080,
  CRF 27) og `<navn>-m.mp4` (720 × 1280, CRF 24), pluss første og siste rame som webp og avif. Det
  stopper hvis resultatet har B-ramer, feil GOP eller moov sist.
- Dagens ti klipp er kodet om med skriptet og byttet. De gamle ligger i
  `assets/higgsfield/scroll-world/forkastet-r7/` (22 filer, 36 MB).

**Kilder for omkodingen.** `web-crf20/` for dive-0 til 3 og conn-0 til 2. For conn-3, dive-4 og
pult-inn finnes ingen crf 20-kilde av gjeldende versjon (`web-crf20/dive-4-m.mp4` er en eldre
generasjon på 104 ramer), så de er kodet fra råklippene (`kjede/` og `lampa/klipp/n2-*`). Alle ti er
kontrollert mot de gamle nettfilene, rame for rame (SSIM 0,98). pult-inn hadde `unsharp` og
`tune film` i den gamle kodingen; det er ikke videreført.

**Bildekvalitet.** dive-0 i 16:9 mot crf 20-kilden: SSIM 0,9859 nå, 0,9865 før. Stående klipp er
gått fra 1080 til 720 piksler i bredden; det er ikke sammenlignet side om side på en telefon.

## LCP på forsiden (revisor r7, P1-2)

| | Før (revisor) | Etter |
|---|---|---|
| LCP, Lighthouse mobil, simulert struping | 2258 / 2745 / 2744, median 2744 ms | 2258 / 2646 / 2608 / 2599 / 2598, median 2599 ms |
| LCP, Lighthouse mobil, påført struping (`--throttling-method=devtools`) | ikke målt | 1744 / 1744 / 1732 ms |
| Ytelse / tilgjengelighet / beste praksis / SEO | 96 / 100 / 100 / 100 | 97 / 100 / 100 / 100 |
| Vekt første innlasting | 383 kB (bilder 155) | 259 kB (bilder 34) |

Gjort: `hero-m.avif` er 720 × 1280 og 25 kB (var 1080 × 1920 og 70 kB), heroens bilde dekodes
synkront, og stillbildet til nabolaget (`poster-0-m.webp`, 78 kB) hentes først etter første interaksjon.

Hvorfor det ikke holder: med simulert struping regner Lighthouse LCP ut fra alt som var ferdig hentet
før bildet ble malt i den ustrupede kjøringen. På localhost er skriptene (85 kB, hvorav gsap-bunten
45 kB) ferdige etter 28–60 ms og første maling kommer etter 56–100 ms, så de regnes med. I den ene
kjøringen der gsap-bunten kom etter malingen, ble LCP 2258 ms. Fontene (108 kB) regnes alltid med.
Heroens bilde er nå 25 kB av rundt 250; mer er ikke å hente i ScrollWorld. Skriptene og fontene
ligger i MalWow og Base, som jeg ikke skulle røre.

## Tester og selvkontroll

- `tests/wow/` mot `astro dev`: 167 bestått, 7 hoppet over, 4 røde. De 4 røde er to tester i
  `bevegelse.spec.ts` (karusell) som feilet på «504 Outdated Optimize Dep» fra Vite, fordi min
  dev-server delte hurtiglager med den som alt kjørte på 4800.
- `bevegelse`, `rullefilm` og `scroll-world` mot et eget bygg (`server.mjs`, ekte CSP): 69 bestått,
  7 hoppet over, 0 røde. `lampa`, `kapittel` og `overgang-hake` er ikke kjørt mot bygget.
- Nye tester: `spole.spec.ts` (18, uten nettleser) og `rullefilm.spec.ts` (7 per visning).
- Tre tester i `scroll-world.spec.ts` ble i praksis aldri kjørt: de krevde klipp i segment 0, som
  har vært et stillbilde siden runde 4. De bruker nå første klipp i filmen.
- `npm run test`: 337 av 342. `npm run check`: 0 feil. Bygg til egen mappe: ok. `dist/` er ikke rørt.
- Filmstripe desktop og mobil: `.skudd/wow/r7-flyt/stripe/`. Teksten er lesbar i alle ruter.
- JavaScript: `rullefilm`-bunten er 4,8 kB gzip og hentes etter første interaksjon. Første
  innlasting gikk fra 89,1 til 87,2 kB overført JS.
- Skills: `emil-animation-performance`, `emil-design-eng` og `emil-find-animation-opportunities` er
  lastet. `review-animations` kan bare startes av eier og er ikke kjørt. GSAP-skillene gjaldt ikke.
- Portene 4710, 4711 og 4712 er stoppet.

## Resultat

Rullefilmen tegnes fra forhåndsdekodede ramer i stedet for å søke i video, klippene er kodet om og
byttet, og skriptet for nye klipp finnes. LCP er bedre, men ikke under kravet med revisors metode.

## Filer endret

- Nye: `src/scripts/wow/spole.ts`, `src/scripts/wow/rullefilm.ts`, `scripts/kod-rullefilm.sh`,
  `tests/wow/spole.spec.ts`, `tests/wow/rullefilm.spec.ts`, `docs/design/rapporter/wow-r7-flyt.md`.
- Endret: `src/scripts/wow/scroll-world.ts`, `src/components/wow/ScrollWorld.astro`,
  `tests/wow/scroll-world.spec.ts`, `tests/wow/lampa.spec.ts`, `docs/design/bevegelse.md`.
- Byttet i `public/media/wow/scroll-world/`: 20 klipp, `hero-m.avif`, `hero-m.webp`.
- Flyttet til `assets/higgsfield/scroll-world/forkastet-r7/`: de 22 gamle filene.
- De to nye filene i `src/scripts/wow/` sto ikke på eierlista i kortet.

## Kilder (URL + dato)

Ingen av disse er hentet i dag; påstandene om nettleserstøtte er fra hukommelsen og bør sjekkes.

- WebCodecs, W3C: https://www.w3.org/TR/webcodecs/
- `VideoDecoder`, MDN: https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder
- Nettleserstøtte: https://caniuse.com/webcodecs (Safari 16.4 og Firefox 130 er mine tall, ikke sjekket i dag)
- Lighthouse, simulert struping: https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
- oso95/scroll-world (MIT), som motoren opprinnelig er tilpasset fra: https://github.com/oso95/scroll-world
- Egne målinger 24. nov. 2026: `.skudd/wow/r7-flyt/resultater/`, `resultater-side/` og `lh/`.

## Åpne spørsmål og antakelser

1. **iOS og Android er ikke testet.** Ukjent på ekte enheter: om maskinvaredekoderen stopper når
   vinduet holder 24–28 `VideoFrame`-er (da skal trappen til programvare og `<video>` slå inn, men
   den er bare testet med en simulert «ikke støttet»), minnepress, og 720p oppskalert på en 3x-skjerm.
2. **LCP 2599 ms mot krav 2500** med simulert struping.
3. **Minne i Chrome på desktop økte** fra 289 til 453 MB i denne målingen. Budsjettet for vinduet
   (96 MB, 30 ramer i 1080p) kan senkes; ikke prøvd.
4. **Rask rulling** er fortsatt ett skjermbilde bak 16–27 % av tiden.
5. **Lange klipp** er ikke kjørt gjennom den bygde motoren på den ekte siden, bare på målesiden.
6. Under før-målingen lå den gamle motoren og de gamle klippene i arbeidstreet i to perioder på noen
   minutter. Dev-serveren på 4800 kan ha vist dem da.
7. `assets/higgsfield/scroll-world/` er usporet i git. `forkastet-r7/` er 36 MB video.

## Neste steg

- **Eier:** rull forsiden på en ekte iPhone og en Android-telefon.
- **Bygger (MalWow/Base):** få gsap-bunten til å lastes etter første maling, eller kutt i fontene
  (108 kB), så LCP kommer under 2500 ms også med simulert struping.
- **Revisor:** mål forsiden på nytt, og kjør `lampa`, `kapittel` og `overgang-hake` mot et bygg.
- **Produsent:** kjør `scripts/kod-rullefilm.sh` på Seedance-klippene. Send både liggende og stående
  kilde; uten stående beskjæres det liggende fra midten.
- **Bevegelse, når et langt klipp finnes:** mål det på den ekte siden.
