# wow-r3: revisjonsmåling av forsiden med ScrollWorld

Målt 2026-11-18 mot `http://127.0.0.1:4600` (`node server.mjs`, eid av dirigenten, ikke bygget på nytt, ikke stoppet). Gren `redesign/wow`. Jeg har målt og ikke rettet noe. Rådata og bilder ligger i `.skudd/wow/r3/` (gitignorert).

## Tabell: krav, målt, bestått

Alle Lighthouse-tall er median av 3 kjøringer (enkeltkjøringer i parentes). Simulert throttling, Lighthouse 13.6.0, lokal server.

| Krav | Grense | Målt | Bestått |
|---|---|---|---|
| Lighthouse mobil: ytelse | ≥ 90 | **85** (92 / 85 / 84) | **Nei** |
| Lighthouse mobil: tilgjengelighet | ≥ 95 | **92** (92 / 92 / 92) | **Nei** |
| Lighthouse mobil: beste praksis | ≥ 95 | 100 | Ja |
| Lighthouse mobil: SEO | ≥ 95 | 100 | Ja |
| Mobil LCP | ≤ 2,5 s | **4 432 ms** (3 382 / 4 432 / 4 586) | **Nei** |
| Mobil CLS | < 0,1 | 0 | Ja |
| Mobil TBT | ingen fast grense | 29 ms (64 / 29 / 25) | (ingen grense) |
| Lighthouse desktop: ytelse | ≥ 90 | 100 (100 / 99 / 100) | Ja |
| Lighthouse desktop: tilgjengelighet | ≥ 95 | **92** (92 / 92 / 92) | **Nei** |
| Lighthouse desktop: beste praksis / SEO | ≥ 95 | 100 / 100 | Ja |
| Desktop LCP / CLS / TBT | ≤ 2,5 s / < 0,1 | 707 ms (702 / 908 / 707) / 0 / 0 ms | Ja |
| Sidevekt ved første innlasting (Lighthouse `total-byte-weight`) | ≤ 700 kB | **mobil 5 506 KiB, desktop 6 305 KiB** | **Nei** |
| Sidevekt ved load uten video | ≤ 700 kB | mobil 563 KiB, desktop 615 KiB | Ja |
| Egen JavaScript (gzip -9, filene siden laster) | ≤ 70 kB med GSAP | **75,6 kB** (75 602 B) | **Nei** |
| Mobil henter `-m.mp4`, desktop henter ikke | | Mobil: 9 av 9 `-m`. Desktop: 0 `-m`, 9 av 9 16:9 | Ja |
| Video lastes ikke før den nærmer seg skjermen | | 3 av 9 klipp hentes ved load (se 2) | Se punkt 2 |
| Skrubbing: bildet endrer seg | ingen stillestående trinn | 87 av 87 trinn med forrige bilde endrer bildet (minste forskjell 1,5 av 255) | Ja |
| Skrubbing: ingen svarte rammer | | Laveste gjennomsnittslysstyrke 16,7 av 255. Ingen svart ramme. | Ja |
| Skrubbing: sømmene hopper ikke | | Fil mot fil: 0,5 til 1,6 av 255 i alle 16 sømmer | Ja |
| Redusert bevegelse: lesbar, bare postere, ingen video | | 0 videoforespørsler, 0 `<video>`, 1 H1 og 10 H2, 0 vannrett overflyt | Ja |
| Uten JavaScript: lesbar, ingen video | | 0 videoforespørsler, 1 H1 og 10 H2, tekst 5 216 / 5 144 tegn | Ja |
| Tastatur: alt kan nås | | **«Book 20 minutter» i fastprisfeltet nås ikke med Tab.** Se punkt 5. | **Nei** |
| Tastatur: synlig fokus | | 4 lenker i Arbeid-karusellen har ingen fokusmarkering (se 5) | **Nei** |
| Tastatur: hopp-lenke | treffes først | «Hopp til innhold» er første Tab-stopp, mål `#innhold` | Ja |
| CSP uten brudd i konsollen | 0 | 0 CSP-brudd, 0 konsollmeldinger (6 sidelastinger) | Ja |
| `media-src` tillater `blob:` | | `media-src 'self' blob:` | Ja |
| Tredjepartskall | 0 | Én vert: `127.0.0.1:4600` | Ja |
| Cookies | 0 | 0 cookies. `sessionStorage` har nøkkelen `wow-inngang`. | Ja |
| axe: brudd | 0 | Ved lasting: 1 critical, 1 serious, 1 moderate, 1 minor (regler). Se punkt 7. | **Nei** |
| Oppløsning på klipp og postere | korteste side ≥ 1080 | Alle 18 mp4 og 10 postere: 1920×1080 eller 1080×1920 | Ja |
| INP | < 200 ms | Ikke målt. Krever ekte brukere. | Ikke målt |
| Kontrast for tekst over video | ≥ 4,5:1 | Ikke målt i denne runden (ikke i oppdraget) | Ikke målt |

Bestått: 19 av 28 rader med krav. Ikke bestått: 9 (mobil ytelse, mobil tilgjengelighet, mobil LCP, desktop tilgjengelighet, sidevekt ved første innlasting, JS-vekt, tastatur nåbarhet, tastatur fokus, axe). Ikke vurdert: TBT (ingen grense), video før den nærmer seg skjermen (dirigentens vurdering), INP og kontrast (ikke målt).

## Sammenligning

Tall fra `docs/design/rapporter/sammenligning-konkurrenter.md` (målt tidligere i dag, før ScrollWorld; én kjøring per side, desktop-vekt der ikke annet står).

| | Redesign før ScrollWorld (lokal) | Drift | syntaxstudio.no | Redesign nå (wow-r3) |
|---|---|---|---|---|
| Lighthouse mobil (ytelse / tilg. / bp / SEO) | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 78 / 100 / 100 / 100 | 85 / 92 / 100 / 100 |
| LCP mobil | 776 ms | 1 011 ms | 3 265 ms | 4 432 ms |
| TBT mobil | 0 ms | 83 ms | 466 ms | 29 ms |
| CLS | 0,000 | 0,057 | 0,000 | 0 |
| Vekt ved load, desktop | 0,16 MB | 0,13 MB | 10,52 MB | 6,16 MiB (6 302 KiB) |
| Vekt etter full rulling, desktop | 2,01 MB | 1,94 MB | 21,4 MB | 17,4 MiB (17 855 KiB) |
| Vekt etter full rulling, mobil | 1,80 MB | 0,90 MB | 16,1 MB | 15,9 MiB (16 314 KiB) |
| Egen/samlet JS overført | 3,7 KB (1 fil) | 10,9 KB (4) | 201,8 KB (20) | 81,8 KB med headere, 75,6 kB gzip (5 filer) |

Sammenligningsdokumentet bruker «MB» = 1 048 576 B. Mine KiB-tall er regnet likt. Mobil LCP 4 432 ms er verre enn syntaxstudio (3 265 ms). Mobil ytelse 85 er bedre enn syntaxstudio (78) og dårligere enn alt annet i tabellen over 90. Vekten etter rulling er 8,7 ganger forrige runde på desktop og 8,8 ganger på mobil, og på nivå med syntaxstudio på mobil (15,9 MiB mot 16,1 MB).

## 1. Lighthouse

| | Mobil 1 | Mobil 2 | Mobil 3 | **Median** | Desktop 1 | Desktop 2 | Desktop 3 | **Median** |
|---|---|---|---|---|---|---|---|---|
| Ytelse | 92 | 85 | 84 | **85** | 100 | 99 | 100 | **100** |
| Tilgjengelighet | 92 | 92 | 92 | **92** | 92 | 92 | 92 | **92** |
| Beste praksis | 100 | 100 | 100 | **100** | 100 | 100 | 100 | **100** |
| SEO | 100 | 100 | 100 | **100** | 100 | 100 | 100 | **100** |
| LCP (ms) | 3 382 | 4 432 | 4 586 | **4 432** | 702 | 908 | 707 | **707** |
| CLS | 0 | 0 | 0 | **0** | 0 | 0 | 0 | **0** |
| TBT (ms) | 64 | 29 | 25 | **29** | 0 | 0 | 0 | **0** |
| FCP (ms) | 899 | 805 | 816 | 816 | 217 | 330 | 220 | 220 |
| Speed Index (ms) | 1 468 | 1 398 | 1 395 | 1 398 | 396 | 527 | 381 | 396 |

INP er ikke målt (krever ekte brukere).

### Ytelse mobil under 90: tre største årsaker

Spredningen 84 til 92 kommer fra LCP alene (CLS og TBT er like i alle kjøringer).

**1. LCP-elementet er H1 som er skjult til skriptet har kjørt (største årsak).**
- LCP-elementet er `h1#hero-tittel` i alle tre mobilkjøringene. Observert LCP er 976 til 1 204 ms. «Element render delay» er 1 197 ms (kjøring 1) og 974 ms (kjøring 3) av det, TTFB 6,8 og 1,7 ms. Observert FCP er 56 til 142 ms.
- Simulert LCP er 3 382 til 4 586 ms og er lik TTI (3 435 / 4 440 / 4 586). Lighthouse regner det opp til 2,8 til 4,7 ganger observert verdi.
- Mekanismen står i `src/styles/wow-bevegelse.css` linje 60: `html.wow-js [data-split]:not([data-wow-klar]) { visibility: hidden; }`. H1 har `data-split="lines"` og blir først synlig når `wow.BoP-PXx1.js` har kjørt og satt `data-wow-klar`. I tillegg spiller `html.wow-inngang .sw__inngang` en inntoning på 0,9 s ved første besøk i økta (`wow-bevegelse.css` linje 686, `Intro.astro`).
- Avhengighetskjeden: `/` (20 100 B) → `MalWow…index_0_lang.D44uF7SI.js` (2 697 B) → `wow.BoP-PXx1.js` (58 471 B brotli) → `embla-carousel.esm.i4daYn4R.js` (9 285 B) og `dist.CenjSUpt.js` (7 700 B). Lengste kjede 103 ms observert.

**2. Video er ikke årsaken til LCP, men står for 90 % av vekten ved load (4 940 av 5 503 KiB mobil, 5 687 av 6 302 KiB desktop) (3 klipp, 5,06 MB).**
- Jeg testet om videoen forsinker LCP: 3 Lighthouse-kjøringer med `--blocked-url-patterns='*.mp4'` ga LCP 4 507 / 3 344 / 4 584 ms og ytelse 84 / 92 / 84. Samme tall som uten blokkering. Videoen forklarer altså ikke LCP.
- Vekten er likevel brudd på kravet om 700 kB (se punkt 2). Lighthouse `total-byte-weight` gir 0,5 i score på dette.
- `dive-0-m.mp4` 1 826 785 B, `conn-0-m.mp4` 1 596 123 B, `dive-1-m.mp4` 1 635 264 B. Alle tre starter 107 til 118 ms inn i innlastingen (simulert), før noe er rullet.

**3. Skriptvekt og hovedtråd.**
- `wow.BoP-PXx1.js`: 169 437 B utpakket, 61 609 B gzip, 55 748 B brotli. Lighthouse `unused-javascript`: 23 984 B (43 %) ubrukt, regnet i kjøring 3.
- Hovedtråd 1,3 s totalt, bootup 0,2 s, TBT 25 til 64 ms. Det er lite, men det er det som er igjen etter LCP.
- Minor funn: `cache-insight` anslår 141 KiB spart på postere (mobil) og 162 KiB (desktop) med lengre cache. `image-delivery-insight` 27 KiB på `poster-0-m.webp`.

### Tilgjengelighet 92 (mobil og desktop)

Samme to revisjoner i alle seks kjøringer, score 0 på begge:
- `aria-hidden-focus`: 3 noder, `#sw-kapittel-1-tittel`, `-2-` og `-3-` `> span.wow-split[aria-hidden="true"]`. Fokuserbare lenker ligger inne i et aria-skjult delt overskriftselement.
- `aria-required-children`: 1 node, `ul.karusell__spor[role=list]` i `section.wow-arbeid`, barn med `role=group` er ikke tillatt.

## 2. Sidevekt og video

Chrome DevTools Protocol, ny kontekst uten cache, 1 kjøring per profil. «Ved load» = `load` + nettverksstille (maks 8 s) + 2,5 s. «Etter rulling» = rulling i steg på 400 px med 250 ms pause, deretter 3 s. Enhet KiB. Mobil 390×844 (touch, mobil-UA), desktop 1440×900.

| | Mobil ved load | Mobil etter rulling | Desktop ved load | Desktop etter rulling |
|---|---|---|---|---|
| Forespørsler | 21 | 36 | 21 | 37 |
| Totalt | 5 503 | 16 314 | 6 302 | 17 855 |
| Video | 4 940 (3 klipp) | 15 686 (9 klipp) | 5 687 (3 klipp) | 17 158 (9 klipp) |
| Bilder | 356 | 421 | 408 | 488 |
| JS | 80 | 80 | 80 | 80 |
| Fonter | 108 | 108 | 108 | 108 |
| Dokument | 20 | 20 | 20 | 20 |

Video som faktisk hentes, i byte:

| Klipp | Mobil (`-m`) | Desktop |
|---|---|---|
| dive-0 | 1 826 785 | 1 944 630 |
| conn-0 | 1 596 123 | 2 178 491 |
| dive-1 | 1 635 264 | 1 700 033 |
| conn-1 | 1 820 258 | 1 987 557 |
| dive-2 | 1 651 090 | 1 926 098 |
| conn-2 | 1 830 855 | 2 136 776 |
| dive-3 | 1 837 836 | 1 853 490 |
| conn-3 | 2 332 754 | 1 798 688 |
| dive-4 | 1 531 041 | 2 044 750 |
| **Sum** | **16 062 006** | **17 570 513** |

- **Mobil henter `-m.mp4`, desktop gjør ikke det.** Bekreftet. Mobil: 9 av 9 forespørsler er `*-m.mp4`. Desktop: 0 `-m`.
- Alle klipp hentes helt (HTTP 200 via `fetch`, så `blob:`-URL). Det er ingen delvis henting. Selve avspillingen mot `blob:` gir 206 uten overført størrelse. En direkte Range-forespørsel til `/media/wow/scroll-world/dive-0.mp4` gir `206 Partial Content`.
- Ved load hentes `dive-0`, `conn-0` og `dive-1`. Fra filmstripa starter `conn-0` ved rulleposisjon y ≈ 900 (1,07 skjermhøyder mobil, 1,0 desktop) og `dive-1` ved y ≈ 1 200. Om det teller som «nærmer seg skjermen» er en vurdering for dirigenten. Tallet er 3 av 9 klipp og 4,82 MiB (mobil) / 5,55 MiB (desktop) før første rulling.
- Uten video ved load: 563 KiB (mobil) og 615 KiB (desktop), begge under 700 kB.
- JS (gzip -9, hentet fra serveren): `page.CMFgH77u.js` 1 121, `dist.CenjSUpt.js` 5 569, `embla-carousel.esm.i4daYn4R.js` 7 257, `wow.BoP-PXx1.js` 61 609, `MalWow…index_0_lang.D44uF7SI.js` 46. Sum 75 602 B. Mot 70 kB-grensen er det 5,6 kB over.
- `dist/client/index.html` i mappa lister bare to skript, mens serveren på :4600 laster `wow.BoP-PXx1.js`, `dist` og `embla`. Jeg har målt det serveren leverer. Jeg har ikke undersøkt om `dist/` er eldre enn det som kjører.

## 3. Skrubbing (filmstripe)

Metode: rull fra `y = 0` til seksjonsslutt + 150 i steg på 150 px, 450 ms pause per trinn, skjermbilde (JPEG) og lesing av `currentTime`, `readyState`, lagenes `opacity` og tekstopasitet. Forskjell mellom påfølgende bilder er gjennomsnittlig absolutt forskjell i gråtone (0 til 255) på 64×36. Seksjonen er 6 660 px (desktop, 7,4 skjermhøyder) og 6 246 px (mobil). 46 trinn desktop, 43 trinn mobil.

**Bildet endrer seg.** Videoens `currentTime` følger rullingen i alle trinn: på desktop 0,84 s per 150 px i klippene, 2,4 s per 150 px i koblingene. Alle 87 trinn som har et forrige bilde å sammenligne med (46 + 43 trinn, minus første trinn i hver profil) har bildeforskjell. Minste forskjell: 2,28 desktop, 1,51 mobil (begge i første klipp, 300 px inn). Siste klipp står stille på siste bilde (t = 5,03 desktop, 4,32 mobil) først etter at seksjonen slutter å være klistret (fra y ≈ 5 850 desktop, y ≈ 5 400 mobil), og da er det neste seksjon som flytter bildet.

**Ingen svarte rammer.** Laveste gjennomsnittslysstyrke er 18,8 (desktop, trinn 45, der neste seksjon kommer inn) og 16,7 (mobil, trinn 7, koblingen fra gata inn til bakeriet). Begge er mørke scener, ikke svart. Kontaktarkene bekrefter det (ingen helt svart eller tomt bilde).

**Én ramme ikke klar.** Mobil trinn 29 (y = 4 350, `kobling7`, `t = 1,49`) har `readyState = 1` 450 ms etter rulling: nettleseren hadde ikke avkodet bildet for den posisjonen. Skjermbildet viser et bilde (gata i skumring), ikke et tomt. 1 av 89 trinn.

**Sømmer.** Jeg trakk første og siste bilde ut av alle 18 klipp med `ffmpeg` og målte forskjellen i hvert kutt (gjennomsnittlig absolutt gråtoneforskjell, 64×36):

| Kutt | Desktop | Mobil |
|---|---|---|
| dive-0 slutt → conn-0 start | 1,0 | 1,3 |
| conn-0 slutt → dive-1 start | 0,8 | 0,6 |
| dive-1 slutt → conn-1 start | 0,8 | 1,1 |
| conn-1 slutt → dive-2 start | 0,9 | 0,6 |
| dive-2 slutt → conn-2 start | 1,4 | 1,6 |
| conn-2 slutt → dive-3 start | 0,6 | 0,5 |
| dive-3 slutt → conn-3 start | 1,1 | 1,4 |
| conn-3 slutt → dive-4 start | 0,7 | 0,5 |

Alle under 1,7 av 255, altså samme bilde. Sømmene i filene hopper ikke.

**Der man likevel ser et hopp.** I filmstripa med 150 px steg er forskjellen mellom to trinn størst i koblingene: 38,1 og 42,6 (desktop, første kobling), 37,2 / 42,9 / 43,0 (mobil), og 24 til 39 i de andre koblingene, mot 2 til 22 inne i klippene. Årsaken er hastigheten: koblingene er ca. 0,35 skjermhøyder lange (315 px desktop) og spiller 5,04 s film, altså ca. 2,9 ganger så fort per piksel som klippene. Det er ikke et hopp i sømmen. Det er verdt å se for den som scroller raskt. På overgangene ligger to lag over hverandre med opasitet mellom 0,26 og 0,93 i ett trinn.

**Annet fra filmstripa.**
- GOP: `dive-0.mp4` og `dive-0-m.mp4` har 16 nøkkelbilder på 121 bilder (ca. hvert 8.). Det er som spesifisert (GOP 8).
- Klippvarighet: alle 5,04 s unntatt `dive-1.mp4` (4,375 s, 105 bilder) og `dive-4-m.mp4` (4,333 s, 104 bilder). Alle 24 bilder/s, H.264 High. Bitrate 2,5 til 3,7 Mbit/s.
- Hero-tittelen står fast og lesbar over de to første klippene. I overgangen (desktop trinn 7, mobil trinn 6 og 7) ligger tittelen halvt gjennomsiktig over et lyst bilde (gata i skumring) og er mindre lesbar. Det er kort (ett trinn). Jeg har ikke målt kontrast.

Kontaktark (JPEG, 12 bilder per ark, bildenavn viser rulleposisjon):
- `.skudd/wow/r3/kontaktark-desktop-1.jpg` til `-4.jpg` (y 0 til 6 750)
- `.skudd/wow/r3/kontaktark-mobil-1.jpg` til `-4.jpg` (y 0 til 6 300)
- Enkeltbilder: `.skudd/wow/r3/strip-desktop/` og `strip-mobil/`. Tall per trinn: `.skudd/wow/r3/strip.json`.

## 4. Redusert bevegelse og uten JavaScript

| | Desktop normal | Desktop redusert | Desktop uten JS | Mobil normal | Mobil redusert | Mobil uten JS |
|---|---|---|---|---|---|---|
| Videoforespørsler | 9 | **0** | **0** | 9 | **0** | **0** |
| `<video>`-elementer | 9 | 0 | 0 | 9 | 0 | 0 |
| H1 / H2 | 1 / 10 | 1 / 10 | 1 / 10 | 1 / 10 | 1 / 10 | 1 / 10 |
| Tekstlengde (tegn) | 5 252 | 5 220 | 5 216 | 5 185 | 5 148 | 5 144 |
| Sidehøyde (px) | 14 139 | 10 519 | 10 440 | 14 379 | 12 361 | 12 293 |
| Vannrett overflyt | 0 | 0 | 0 | 0 | 0 | 0 |
| Konsollmeldinger | 0 | 0 | 0 | 0 | 0 | 0 |

- Alle fem kapitler (hero + fire) er synlige som tekst under hverandre med opasitet 1 og `visibility: visible` i redusert og uten JS. Hvert kapittel er 900 px høyt på desktop, 844 til 857 px på mobil.
- Bildet bak er en egen poster per kapittel i redusert bevegelse (desktop; se arket). Uten JS står alle kapitler over første poster, så bildet er mørkt bak kapittel 1 til 3 på mobil, men teksten er lesbar.
- Tekstforskjellen mot normal er 32 til 41 tegn og kommer av animasjonsmarkup. Jeg har ikke sjekket hvilke tegn.
- Kontaktark: `.skudd/wow/r3/kontaktark-desktop-redusert.jpg`, `kontaktark-desktop-uten-js.jpg`, `kontaktark-mobil-redusert.jpg`, `kontaktark-mobil-uten-js.jpg`.

## 5. Tastatur

Tab fra topp til slutt, 120 ms mellom trykk. Desktop: 62 stopp, deretter tilbake til toppen. Mobil: 59 stopp. 70 fokuserbare elementer i DOM i begge profiler.

**Rekkefølge, desktop (kort):** Hopp til innhold (0) → logo (1) → Tjenester, Priser, Caser, Om (2–5) → Book 20 min (6) → adressefelt (7) → Start befaringen (8) → «kodekonsulentene.no» (9) → «Eller book 20 minutter» (10) → **kapittellenkene (11–17)** → Arbeid-karusellen (18–24) → prisvelger (25) → Se hele prislisten (26) → 7 spørsmål (27–33) → Book 20 minutter (34, kontaktseksjonen) → e-post (35) → skjema (36–40) → personvern (41) → footer (42–61).
Mobil: samme rekkefølge, med «Book 20 min» før «Meny» (2–3).

**Fokus synlig:** 2 px heltrukken outline `rgb(200, 242, 74)` på alle stopp unntatt de som står under.

**Avvik:**

1. **«Book 20 minutter» i befaringens fastprisfelt (`a.wow-knapp--mork`, `href="#kontakt"`) nås ikke med Tab fremover.** Årsak: `.wow-fastpris__innhold` har `visibility: hidden` til rullingen har kommet til befaringen. Det er rulleposisjonen som styrer det. Tab fra kapittellenken «Apper og AI» (y 3 915) hopper rett til Arbeid-karusellen (y 9 073), forbi fastprisfeltet. Samme resultat på mobil (stopp 14 til 15). Jeg testet også å rulle med PageDown til bunnen først: fastprisfeltet ble da synlig (`visibility: visible`), men Tab fremover fra hero flytter rullingen opp til kapittellenkene, feltet blir skjult igjen, og hoppet skjer likevel. Med Shift+Tab fra bunnen nås knappen. I redusert bevegelse er den synlig (`visible`, bredde 226 px). Handlingen finnes ellers i header (stopp 6), i heroen (stopp 10) og i kontaktseksjonen (stopp 34), så brukeren mister ikke funksjonen, men ett kontrollpunkt kan ikke nås slik det står.
2. **Kapittellenkene har for mange og feil stopp.** De tre lenkene (`/nettsider`, `/systemer`, `/apper-og-ai`) gir 7 Tab-stopp på desktop og 7 på mobil (stopp 11–17 / 8–14), ikke 3. For hver lenke er det et stopp med tomt navn og bredde 0 (`a` med 0×66 px desktop, 0×40 px mobil, utenfor skjermen), og deretter stoppene i den delte, aria-skjulte kopien (`NETTSIDER`, `SYSTEMER OG`, `INTEGRASJONER`, `APPER OG AI`). Alle kopi-stoppene ligger inne i `[aria-hidden=true]` (samme funn som axe `aria-hidden-focus`). Lenkene i filmens kapitler kan altså nås, men skjermleseren møter tomme eller skjulte stopp. Kapittel 0 (hero) og 4 (befaring) har ingen lenke. Skinnens prikker (`a[data-sw-punkt]`) har `tabindex="-1"` og nås ikke, som tilsiktet.
3. **Fire lenker i Arbeid-karusellen mangler fokusmarkering:** `SJEKK NETTSIDEN DIN` (/sjekk), `BOOKINGSYSTEM FOR KLINIKK` (/caser), `PRISKALKULATOR` (/verktoy/priskalkulator), `DRIFTSSTATUS` (/status). Computed style: `outline-style: none`, ingen `box-shadow`. Stopp 19–22 desktop (høyde 38 px) og 16–19 mobil (høyde 26 px). Karusellens scroll-region (`div`, stopp 18/15) og «Forrige» har synlig fokus. Jeg har ikke sjekket om en annen stil (for eksempel på kortet rundt, `:focus-within`) viser fokus. Målingen leser bare lenka selv.
4. Mål: alle stopp er ≥ 24 px i begge retninger unntatt de tomme 0-px-stoppene i punkt 2 og avkrysningsboksen i prisvelgeren (24×24, nøyaktig på grensen).
5. Bevegelse av rulleposisjon ved Tab: stopp 35 til 36 (desktop) hopper fra y 12 976 til y 12 423, altså 553 px oppover, mens fokus går fra e-postlenka til første skjemafelt. Det ser rart ut, men feltet er synlig i begge tilfeller.

Hopp-lenken «Hopp til innhold» er første stopp i begge profiler og peker på `#innhold`.

## 6. Sikkerhetsheadere og CSP

Fra `curl -I` mot `/` og mot `dive-0.mp4`:
- `content-security-policy`: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; media-src 'self' blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' + 29 sha256-hasher; connect-src 'self'; frame-src https://cal.com https://app.cal.com; manifest-src 'self'; upgrade-insecure-requests`
- `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `x-frame-options: DENY`, `cross-origin-opener-policy: same-origin`, `x-dns-prefetch-control: off`, `permissions-policy` (21 funksjoner satt)
- Ingen CSP-brudd (`securitypolicyviolation`) og ingen meldinger i konsollen i seks sidelastinger (desktop, mobil, desktop redusert, med full rulling). Alle 9 klipp spilte via `blob:` uten brudd.
- Cookies: 0. `document.cookie` er tom. `sessionStorage`: `wow-inngang`. `localStorage`: tom.
- Verter siden kaller: `127.0.0.1:4600` alene. CSP tillater `frame-src` til `cal.com` og `app.cal.com`, men ingen iframe ble hentet i målingene.
- Klipp svarer `206 Partial Content` på `Range: bytes=0-99`.

## 7. axe

axe-core (uten `.min`-endring, regler `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` og `best-practice`), kjørt rett etter lasting uten rulling. Samme resultat desktop og mobil.

| Alvorlighet | Regler | Noder | Hvilke |
|---|---|---|---|
| Critical | 1 | 1 | `aria-required-children` (WCAG 1.3.1): `ul.karusell__spor` har barn med `role=group` |
| Serious | 1 | 3 | `aria-hidden-focus`: `#sw-kapittel-1-tittel`, `-2-`, `-3-` `> span.wow-split[aria-hidden=true]` |
| Moderate | 1 | 1 | `landmark-unique`: `section.wow-arbeid` mangler unik etikett |
| Minor | 1 | 4 | `aria-allowed-role`: `li[aria-label="1 av 4"]` til `4 av 4` har `role=group` |

Totalt 4 regler, 9 noder. Etter full rulling er `aria-hidden-focus` borte (delt tekst er rullet tilbake til vanlig tekst, ved y = 1 500 gjenstår kapittel 2 og 3), så de 3 nodene er knyttet til tilstanden før kapittelet har vist seg. Lighthouse måler i den tilstanden, og det er derfor tilgjengelighet er 92. Jeg tolker det slik; jeg har ikke bekreftet årsaken i koden.

Etter full rulling (desktop, mobil og desktop med redusert bevegelse): 3 regler og 6 noder (critical, moderate, minor). `aria-hidden-focus` er da borte. Jeg kjørte ikke redusert bevegelse rett etter lasting.

## Ikke målt

- INP (krever ekte brukere).
- Kontrast for tekst over video i tre ruter fra filmstripa (ikke i oppdraget).
- Lange oppgaver ved rulling med 4× tregere prosessor (ikke i oppdraget).
- Lighthouse på andre sider.
- Lighthouse mot drift. Alt er målt lokalt og er ikke direkte sammenlignbart med målinger over internett.

## Begrensninger

- Lighthouse: simulert throttling, lokal server, 3 kjøringer per profil. Mobilytelse varierer 84 til 92 mellom kjøringer, så medianen 85 ligger nær grensen på 90, men den er under i 2 av 3 kjøringer.
- Vekt og video: 1 kjøring per profil. Tallene er stabile mellom Lighthouse og min egen CDP-måling (5 506 mot 5 503 KiB mobil, 6 305 mot 6 302 KiB desktop).
- Filmstripe: 450 ms pause per trinn gir videoen tid til å søke. En bruker som ruller raskt får færre ferdig avkodede bilder. Det har jeg ikke målt.
- Tastaturmåling bruker Chrome (`channel: "chrome"`) og leser stilene fra `getComputedStyle`. Den erstatter ikke en test med skjermleser.
- Skriptene ligger i `/private/tmp/claude-501/-Users-zakaria-Zakaria-02-Prosjekter-kodekonsulentene-web/a5ab2632-977c-4150-b266-bbf6bec0b290/scratchpad/` og er ikke i repoet.
