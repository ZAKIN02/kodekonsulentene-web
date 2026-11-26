# wow-r4: revisjonsmåling av forsiden (historien i filmen)

Målt 2026-11-18 mot `http://127.0.0.1:4600` (`node server.mjs`, dirigentens server, ikke bygget på nytt, ikke stoppet). Gren `redesign/wow`. Jeg har målt og ikke rettet noe. Samme krav og samme metode som `wow-r3-revisor.md`, med ett nytt avsnitt (historien, del 8). Rådata, bilder og kontaktark ligger i `.skudd/wow/r4/` (gitignorert).

Lighthouse 13.6.0, simulert throttling, lokal server, 3 kjøringer per profil, median. Mobil 390×844 (touch, mobil-UA), desktop 1440×900. Enhet KiB (1 024 B) der det ikke står kB.

## Tabell: krav, r3, r4, bestått

Grensene er fra del 12 i briefen. r3 målte ytelse mot ≥ 90; del 12 sier ≥ 95 i alle fire kategorier. Jeg bruker 95 her. Alle r4-tall for ytelse er 100, så det endrer ikke utfallet.

| # | Krav | Grense | r3 | r4 | Bestått |
|---|---|---|---|---|---|
| 1 | Lighthouse mobil: ytelse | ≥ 95 | 85 (92 / 85 / 84) | **100** (100 / 100 / 100) | Ja |
| 2 | Lighthouse mobil: tilgjengelighet | ≥ 95 | 92 | **100** (100 / 100 / 100) | Ja |
| 3 | Lighthouse mobil: beste praksis | ≥ 95 | 100 | 100 | Ja |
| 4 | Lighthouse mobil: SEO | ≥ 95 | 100 | 100 | Ja |
| 5 | Mobil LCP | ≤ 2,5 s | 4 432 ms (3 382 / 4 432 / 4 586) | **803 ms** (880 / 798 / 803) | Ja |
| 6 | Mobil CLS | < 0,1 | 0 | 0 (0 / 0 / 0) | Ja |
| 7 | Mobil TBT | ingen fast grense | 29 ms (64 / 29 / 25) | 8 ms (21 / 6 / 8) | (ingen grense) |
| 8 | Lighthouse desktop: ytelse | ≥ 95 | 100 | 100 (100 / 100 / 100) | Ja |
| 9 | Lighthouse desktop: tilgjengelighet | ≥ 95 | 92 | **100** (100 / 100 / 100) | Ja |
| 10 | Lighthouse desktop: beste praksis / SEO | ≥ 95 | 100 / 100 | 100 / 100 | Ja |
| 11 | Desktop LCP / CLS / TBT | ≤ 2,5 s / < 0,1 | 707 ms / 0 / 0 ms | 247 ms (250 / 247 / 221) / 0 / 0 ms | Ja |
| 12 | Sidevekt ved første innlasting (Lighthouse `total-byte-weight`) | ≤ 700 kB | mobil 5 506 KiB, desktop 6 305 KiB | **mobil 2 123 KiB (2 174 166 B), desktop 2 267 KiB (2 321 005 B)** | **Nei** |
| 13 | Sidevekt ved load uten video | ≤ 700 kB | mobil 563 KiB, desktop 615 KiB | mobil 336 KiB, desktop 365 KiB | Ja |
| 14 | Sidevekt etter full rulling (mobil / desktop) | ingen grense | 16 314 / 17 855 KiB | 16 261 / 17 811 KiB | (ingen grense) |
| 15 | Egen JavaScript (gzip -9, filene siden laster) | ≤ 70 kB med GSAP | 75 602 B | **68 423 B** | Ja |
| 16 | Mobil henter `-m.mp4`, desktop henter ikke | | 9 av 9 `-m` / 0 `-m` | 9 av 9 `-m` / 0 `-m`, 9 av 9 16:9 | Ja |
| 17 | Video lastes ikke før den nærmer seg skjermen | | 3 av 9 klipp ved load | **1 av 9 klipp ved load** (`dive-0`, det som står på skjermen). Se del 2. | Ja |
| 18 | Video er aldri LCP-elementet | | H1 | `h1#hero-tittel` (desktop og mobil) | Ja |
| 19 | Skrubbing: bildet endrer seg | ingen stillestående trinn | 87 av 87, minste forskjell 1,51 | 88 av 89 trinn med forskjell ≥ 1,0. Minste 0,99 (mobil y 4 800). Se del 3. | Ja (merk) |
| 20 | Skrubbing: ingen svarte rammer | | laveste lysstyrke 16,7 | laveste 21,5 (desktop, y 4 800) og 10,7 (mobil, y 1 050). Ingen helt svart. Se del 3. | Ja (merk) |
| 21 | Skrubbing: sømmene hopper ikke | | 0,5–1,6 av 255 | 0,6–1,7 av 255 i alle 16 sømmer | Ja |
| 22 | Redusert bevegelse: lesbar, ingen video | | 0 video, 1 H1 / 10 H2 | 0 videoforespørsler, 0 `<video>`, 1 H1 / 14 H2, alle 20 kontrolltekster til stede | Ja |
| 23 | Uten JavaScript: lesbar, ingen video | | 0 video, 1 H1 / 10 H2 | 0 videoforespørsler, 1 H1 / 14 H2, alle 20 kontrolltekster til stede, 0 usynlige overskrifter | Ja |
| 24 | Tastatur: alt kan nås | | «Book 20 minutter» i fastprisfeltet ikke nåbar | Nåbar (desktop stopp 15, mobil stopp 12). Kapittellenkene er 3 stopp, ikke 7. | Ja |
| 25 | Tastatur: synlig fokus | | 4 lenker uten markering | 0 stopp uten markering (2 px outline, ett stopp med `box-shadow`) | Ja |
| 26 | Tastatur: hopp-lenke | treffes først | første stopp, `#innhold` | første stopp, `#innhold`. Nytt: «Hopp til rapporten» er stopp 9 (desktop) / 6 (mobil). | Ja |
| 27 | CSP uten brudd i konsollen | 0 | 0 | 0 CSP-brudd, 0 konsollmeldinger (10 sidelastinger) | Ja |
| 28 | `media-src` | `'self'` (+ `blob:`) | `'self' blob:` | `'self' blob:` | Ja |
| 29 | Tredjepartskall | 0 | én vert: `127.0.0.1:4600` | én vert: `127.0.0.1:4600` | Ja |
| 30 | Cookies | 0 | 0 (`sessionStorage`: `wow-inngang`) | 0 (`sessionStorage`: `wow-inngang`, `localStorage` tom) | Ja |
| 31 | axe: brudd | 0 | 4 regler / 9 noder ved lasting | **0 regler / 0 noder** (desktop, mobil, begge i redusert bevegelse; også etter full rulling) | Ja |
| 32 | Oppløsning, klipp og postere i `scroll-world/` | korteste side ≥ 1080 | 18 mp4 + 10 postere ≥ 1080 | 28 filer: 14 × 1920×1080 og 14 × 1080×1920 | Ja |
| 33 | Historie: teller 0 → 1 → 2 → 3 av 3, og tilbake ved rulling opp | | ny | 0 → 1 → 2 → 3 ned og 3 → 2 → 1 → 0 opp, begge profiler, synlig siffer = skjermleserteksten i alle bilder | Ja |
| 34 | Historie: aldri to tekster synlige samtidig | maks 1 | ny | maks 1 (terskel 5 % og 30 % opasitet), 0 av 886 trinn med flere | Ja |
| 35 | Historie: skinnen viser samme kapittel som tekstplaten | | ny | 0 avvik i 886 trinn | Ja |
| 36 | Historie: verkstedets målinger = rapporten (#rapport) | | ny | navn, verdi, forbehold, dato og adresse identiske, 4 av 4 | Ja |
| – | INP | < 200 ms | ikke målt | **Ikke målt.** Krever ekte brukere. | Ikke målt |
| – | Kontrast for tekst over video | ≥ 4,5:1 | ikke målt | **Ikke målt** (ikke i oppdraget). axe ga «incomplete» på `color-contrast` (16–30 noder), altså ikke avgjort maskinelt. | Ikke målt |

**Bestått: 33 av 34 rader med krav. Ikke bestått: 1 (rad 12, sidevekt ved første innlasting).** Ikke vurdert: TBT og vekt etter rulling (ingen grense), INP og kontrast (ikke målt).

I r3 var 9 av 28 rader ikke bestått. Rad 12 er den eneste som er igjen.

## Sammenligning (desktop og mobil, rad for rad mot r3)

| | r3 | r4 |
|---|---|---|
| Lighthouse mobil (ytelse / tilg. / bp / SEO) | 85 / 92 / 100 / 100 | 100 / 100 / 100 / 100 |
| Lighthouse desktop | 100 / 92 / 100 / 100 | 100 / 100 / 100 / 100 |
| LCP mobil / desktop | 4 432 / 707 ms | 803 / 247 ms |
| TBT mobil / desktop | 29 / 0 ms | 8 / 0 ms |
| CLS | 0 | 0 |
| FCP mobil / desktop (median) | 816 / 220 ms | 803 / 247 ms |
| Vekt ved load (Lighthouse) mobil / desktop | 5 506 / 6 305 KiB | 2 123 / 2 267 KiB |
| Vekt ved load (egen CDP-måling) mobil / desktop | 5 503 / 6 302 KiB | 2 120 / 2 264 KiB |
| Vekt etter full rulling mobil / desktop | 16 314 / 17 855 KiB | 16 261 / 17 811 KiB |
| JS gzip -9 | 75 602 B (5 filer) | 68 423 B (4 filer) |
| Forespørsler ved load / etter rulling (mobil) | 21 / 36 | 12 / 33 |
| H2 / tekstlengde (desktop normal) | 10 / 5 252 | 14 / 5 605 |

## 1. Lighthouse

| | Mobil 1 | Mobil 2 | Mobil 3 | **Median** | Desktop 1 | Desktop 2 | Desktop 3 | **Median** |
|---|---|---|---|---|---|---|---|---|
| Ytelse | 100 | 100 | 100 | **100** | 100 | 100 | 100 | **100** |
| Tilgjengelighet | 100 | 100 | 100 | **100** | 100 | 100 | 100 | **100** |
| Beste praksis | 100 | 100 | 100 | **100** | 100 | 100 | 100 | **100** |
| SEO | 100 | 100 | 100 | **100** | 100 | 100 | 100 | **100** |
| LCP (ms) | 880 | 798 | 803 | **803** | 250 | 247 | 221 | **247** |
| CLS | 0 | 0 | 0 | **0** | 0 | 0 | 0 | **0** |
| TBT (ms) | 21 | 6 | 8 | **8** | 0 | 0 | 0 | **0** |
| FCP (ms) | 880 | 798 | 803 | 803 | 250 | 247 | 221 | 247 |
| Speed Index (ms) | 1 233 | 1 186 | 1 213 | 1 213 | 606 | 577 | 542 | 577 |

- Kjøring desktop 2 feilet første gang med `NO_NAVSTART` (Lighthouse klarte ikke ta opp sporet). Jeg kjørte den på nytt med samme kommando. Tallet over er den andre kjøringen.
- LCP-elementet er `h1#hero-tittel` i begge profiler (målt med `PerformanceObserver`: 60 ms mobil, 48 ms desktop observert). «Element render delay» er 43,5 ms og TTFB 1,5 ms (mobil, kjøring 2). I r3 var render delay 974 til 1 197 ms. Forskjellen er at H1 ikke lenger er skjult til skriptet har kjørt (jeg har ikke lest koden for å bekrefte årsaken; det er det målingen viser).
- Gjenstående funn under 0,9 (alle informative og utenfor kategoriscore): `unused-javascript` 25 KiB i `wow.BcUAQalB.js` (r3: 23,4 KiB), `cache-insight` 57 KiB mobil og 68 KiB desktop (postere, `kk-mark.svg`), `image-delivery-insight` 27 KiB (`poster-0-m.webp`, bare mobil).
- Lighthouse `total-byte-weight` er scoret 1, men kravet i del 12 er 700 kB. Se del 2.
- INP er ikke målt.

## 2. Sidevekt og video

CDP, ny kontekst uten cache, 1 kjøring per profil. «Ved load» = `load` + nettverksstille (maks 8 s) + 2,5 s. «Etter rulling» = steg på 400 px med 250 ms pause, deretter 3 s.

| | Mobil ved load | Mobil etter rulling | Desktop ved load | Desktop etter rulling |
|---|---|---|---|---|
| Forespørsler | 12 | 33 | 12 | 33 |
| Totalt (KiB) | 2 120 | 16 261 | 2 264 | 17 811 |
| Video | 1 784 (1 klipp) | 15 686 (9 klipp) | 1 899 (1 klipp) | 17 159 (9 klipp) |
| Bilder | 145 | 376 | 173 | 453 |
| JS | 63 | 71 | 63 | 71 |
| Fonter | 108 | 108 | 108 | 108 |
| Dokument | 20 | 20 | 20 | 20 |
| Uten video | 336 | 575 | 365 | 652 |

- **Rad 12 består ikke.** Ved load er 2 174 166 B (mobil) og 2 321 005 B (desktop) overført, 3,1 og 3,3 ganger grensen på 700 000 B. Ett klipp (`dive-0-m.mp4` 1 826 785 B, `dive-0.mp4` 1 944 630 B) er 84 % og 82 % av det. Uten videoen er vekten 336 og 365 KiB (rad 13).
- Video som hentes ved load: bare `dive-0` (mobil `dive-0-m`). I r3 var det tre klipp (`dive-0`, `conn-0`, `dive-1`).
- Klipp som hentes når man ruller (første forespørsel, målt i rulleposisjon, 150 px steg): desktop `conn-0` og `dive-1` ved y 150, `conn-1` y 750, `dive-2` y 1 050, `conn-2` y 1 950, `dive-3` y 2 250, `conn-3` y 3 150, `dive-4` y 3 450. Mobil: `conn-0-m` og `dive-1-m` y 150, `conn-1-m` y 750, `dive-2-m` y 1 050, `conn-2-m` y 1 800, `dive-3-m` y 2 100, `conn-3-m` y 3 000, `dive-4-m` y 3 300. Klippene hentes altså to klipp før de vises (for eksempel `dive-1` ved y 150, og kapittel 1 starter ved y ≈ 1 200 desktop). Om det teller som «nærmer seg skjermen» er dirigentens vurdering. Tallet er 1 av 9 ved load og 3 av 9 etter første rulletrinn.
- Alle klipp hentes helt (HTTP 200, så `blob:`), uendret fra r3. Direkte `Range: bytes=0-99` mot `dive-0.mp4` og `dive-0-m.mp4` gir `206 Partial Content`.
- Totalsummen etter rulling er uendret fra r3 (mobil 16 062 006 B video, desktop 17 570 513 B). Alle 9 klipp er fortsatt i bruk.
- JS (gzip -9, hentet fra serveren): `page.CMFgH77u.js` 1 121, `MalWow…index_0_lang.Co6ilCmu.js` 46, `wow.BcUAQalB.js` 61 687, `dist.CenjSUpt.js` 5 569 (lastes først ved rulling). Sum 68 423 B, 1 577 B under 70 kB. Ved load alene: 62 854 B. `embla-carousel` lastes ikke lenger på forsiden (r3: 7 257 B). `dist/client/_astro/` har samme filnavn som serveren leverer.
- Videoer finnes som mp4 på `public/media/wow/scroll-world/`. Webm finnes ikke for `scroll-world` (bare for de eldre `hero-*`, `apper`, `nettsider`, `systemer`). Klippene brukes via `blob:` av skriptet, så siden bruker ikke webm. Jeg har ikke vurdert om det er et krav for denne scenen.

## 3. Skrubbing (filmstripe, 150 px)

Metode som r3: fra y = 0 til seksjonsslutt + 150, 450 ms pause per trinn, skjermbilde og lesing av `currentTime`, `readyState`, lagenes opasitet. Forskjell = gjennomsnittlig absolutt gråtoneforskjell på 64×36 (0–255). Seksjonen er 6 840 px (desktop, 7,6 skjermhøyder, r3: 6 660) og 6 414 px (mobil, r3: 6 246). 47 trinn desktop, 44 trinn mobil.

**Bildet endrer seg.** `currentTime` følger rullingen i alle trinn i begge profiler. Desktop: 46 av 46 trinn med forrige bilde har forskjell ≥ 2,71 (r3 minste 2,28). Mobil: 42 av 43 har forskjell ≥ 1,0, minste 1,51 etter det ene unntaket, som er **y 4 800, forskjell 0,99** (r3 minste 1,51). Videoen står ikke stille der: `currentTime` går 0,38 → 1,03 → 1,68 s over y 4 650 / 4 800 / 4 950. Bildet er verkstedet, mørkt (gjennomsnitt 16,4), med målepanelet (statisk) over midten. Jeg regner 0,99 som mørkt bilde pluss statisk panel, ikke et stillestående klipp, men jeg har ikke målt forskjellen med panelet maskert.

**`readyState`:** 4 i alle trinn i begge profiler (r3: ett trinn med 1). Ingen ramme som ikke var avkodet.

**Ingen svarte rammer.** Laveste gjennomsnittslysstyrke: desktop 21,5 (y 4 800, r3 18,8), mobil 10,7 (y 1 050, r3 16,7). Mobilrammen y 1 050 er åpningen av kapittel 1: et lite bakeri midt i et svart felt (se `kontaktark-mobil-1.jpg`). Det er et bilde, ikke en tom ramme, men det er mørkere enn noe i r3. Desktop y 2 400 til 2 700 har samme type åpning (kontorhuset på svart bakgrunn).

**Sømmer.** Første og siste bilde av alle 18 klipp med `ffmpeg`, forskjell i hvert kutt (64×36 gråtone):

| Kutt | Desktop r3 | Desktop r4 | Mobil r3 | Mobil r4 |
|---|---|---|---|---|
| dive-0 → conn-0 | 1,0 | 1,1 | 1,3 | 1,4 |
| conn-0 → dive-1 | 0,8 | 0,8 | 0,6 | 0,6 |
| dive-1 → conn-1 | 0,8 | 0,9 | 1,1 | 1,1 |
| conn-1 → dive-2 | 0,9 | 0,9 | 0,6 | 0,6 |
| dive-2 → conn-2 | 1,4 | 1,4 | 1,6 | 1,7 |
| conn-2 → dive-3 | 0,6 | 0,7 | 0,5 | 0,6 |
| dive-3 → conn-3 | 1,1 | 1,2 | 1,4 | 1,5 |
| conn-3 → dive-4 | 0,7 | 0,7 | 0,5 | 0,6 |

Alle under 1,8. Klippfilene er uendret siden r3 (samme endringstid, samme størrelser); forskjellene på 0,1 er avrunding og at jeg regnet bildene på nytt.

**Der man likevel ser et hopp mellom to trinn:** største forskjell mellom to trinn er desktop **55,9 (y 1 200, r3 42,6)**, 48,4 (y 6 900, neste seksjon kommer inn), 47,7 (y 4 800) og 42,1 (y 3 600); mobil 43,5 (y 3 450), 41,6, 40,9, 39,3. I y 1 200 desktop er det koblingen `conn-1` som går fra t = 2,4 til 4,8 s i ett trinn (2,4 s film per 150 px, r3: 2,4 s). Det er hastigheten, ikke sømmen (fil mot fil: 0,9). Det er verdt å se for den som ruller fort.

Kontaktark (12 bilder per ark, bildenavn viser rulleposisjon):
- `.skudd/wow/r4/kontaktark-desktop-1.jpg` til `-4.jpg` (y 0 til 6 900)
- `.skudd/wow/r4/kontaktark-mobil-1.jpg` til `-4.jpg` (y 0 til 6 450)
- Enkeltbilder: `.skudd/wow/r4/strip-desktop/` og `strip-mobil/`. Tall per trinn: `.skudd/wow/r4/strip.json`.

## 4. Redusert bevegelse og uten JavaScript

| | Desktop normal | Desktop redusert | Desktop uten JS | Mobil normal | Mobil redusert | Mobil uten JS |
|---|---|---|---|---|---|---|
| Videoforespørsler | 9 | **0** | **0** | 9 | **0** | **0** |
| `<video>`-elementer | 9 | 0 | 0 | 9 | 0 | 0 |
| H1 / H2 | 1 / 14 | 1 / 14 | 1 / 14 | 1 / 14 | 1 / 14 | 1 / 14 |
| Tekstlengde (tegn) | 5 605 | 5 623 | 5 619 | 5 538 | 5 602 | 5 598 |
| Sidehøyde (px) | 13 700 | 9 966 | 9 966 | 15 504 | 12 184 | 12 184 |
| Vannrett overflyt | 0 | 0 | 0 | 0 | 0 | 0 |
| Konsollmeldinger | 0 | 0 | 0 | 0 | 0 | 0 |

- Sjekket at alle 20 tekstene finnes (fem problemlinjer, tre tittler med tre løsningslinjer, «Målt først» med løsning, de fire målenavnene, «6/6», «Org.nr.», «Lyser din side grønt?») i redusert og uten JS, begge profiler: 0 mangler, 0 usynlige overskrifter (15 av 15 synlige).
- H2 er 14 mot 10 i r3, og tekst er ca. 350 tegn lenger. Jeg har ikke undersøkt hva som er lagt til.
- Redusert og uten JS er sidehøyden 3 700 px (desktop) og 3 300 px (mobil) lavere enn normal, som i r3.
- Kontaktark: `.skudd/wow/r4/kontaktark-desktop-redusert.jpg`, `kontaktark-desktop-uten-js.jpg`, `kontaktark-mobil-redusert.jpg`, `kontaktark-mobil-uten-js.jpg`.

## 5. Tastatur

Tab fra topp til slutt. Fokus og rekkefølge målt med 120 ms mellom trykk (stopp og stilverdier), og kontrollert på nytt med 900 ms mellom trykk for stoppene der filmen må rulle (se under). Desktop: 58 stopp, deretter tilbake til toppen. Mobil: 55 stopp. 68 fokuserbare elementer i DOM i begge profiler (r3: 62 / 59 stopp, 70 elementer).

**Rekkefølge, desktop (kort):** Hopp til innhold (0) → logo (1) → Tjenester, Priser, Caser, Om (2–5) → Book 20 min (6) → adressefelt (7) → Start befaringen (8) → **Hopp til rapporten (9)** → **kapittellenkene NETTSIDER, SYSTEMER OG INTEGRASJONER, APPER OG AI (10–12)** → adressefelt og Start befaringen i rapporten (13–14) → **Book 20 minutter i fastprisfeltet (15)** → Arbeid (16–20) → prisvelger (21) → Se hele prislisten (22) → 7 spørsmål (23–29) → Book 20 minutter, kontaktseksjonen (30) → e-post (31) → skjema (32–37) → footer (38–57). Mobil: samme rekkefølge, «Book 20 min» før «Meny» (2–3).

**Mot r3-avvikene:**

1. **«Book 20 minutter» i fastprisfeltet (`a.wow-knapp--mork`, `href="#kontakt"`) nås nå med Tab** (desktop stopp 15, y 7 403; mobil stopp 12, y 7 374). Fokus ligger på knappen i skjermbildet (`.skudd/wow/r4/tastatur/desktop-stopp15-Book_20_minutter.jpg`). Fokusmarkeringen er 2 px `rgb(10, 11, 12)` med 3 px avstand, på lime bakgrunn. Den er tydelig i bildet. Jeg har ikke målt kontrastforholdet.
2. **Kapittellenkene er tre stopp, ikke sju** (desktop 10–12, mobil 7–9). Ingen tomme 0-px-stopp, ingen stopp i `aria-hidden`-kopi (`hidAnc: false` på alle). Fokus rulle filmen til riktig kapittel: etter 900 ms står lenka i bildet med opasitet 1 og fokusramme (`desktop-stopp10-NETTSIDER.jpg`, `-11-`, `-12-`, tilsvarende for mobil). Ved 120 ms mellom trykk var opasiteten 0,1 / 0 / 0 på desktop og 0 på mobil (overgangen var ikke ferdig). Det er ikke et brudd, men man ser det om man Tabber raskt.
3. **Arbeid-karusellen:** alle fire lenker har nå 2 px outline (`PRISKALKULATOR`, `Bookingsystem for klinikk`, `Sjekk nettsiden din`, `Driftsstatus`), og «Se alle caser» også. Scroll-regionen er ikke lenger eget stopp. Rekkefølgen i Tab er Priskalkulator, Booking, Sjekk, Status; jeg har ikke sammenlignet med visuell rekkefølge.
4. **Fokus synlig:** alle stopp har `outline` 2 px heltrukken `rgb(200, 242, 74)` unntatt «Book 20 minutter» (fastpris, mørk outline, over) og prisvelgerens avkrysningsboks (24×24, `box-shadow`, uendret fra r3).
5. **Mål ≥ 24 px:** alle stopp er ≥ 24 px i begge retninger unntatt den innebygde lenka «personvernerklæringen» i skjemateksten (166×21 px i begge profiler; innebygd i en setning, som WCAG 2.5.8 gir unntak for). Avkrysningsboksen er nøyaktig 24×24.
6. **Uendret fra r3:** på desktop hopper rulleposisjonen 553 px oppover (y 12 560 → 12 007) når fokus går fra e-postlenka til første skjemafelt (stopp 31 → 32). Feltet er synlig begge steder. På mobil skjer det ikke.
7. **Ikke besøkt av Tab (forventet):** menyens lukkede kopi av navigasjonen og de to skjulte radioene i prisvelgeren (én radio per gruppe nås). Mobil: den skjulte desktop-navigasjonen.

Hopp-lenken «Hopp til innhold» er første stopp i begge profiler og peker på `#innhold`.

## 6. Sikkerhetsheadere og CSP

Fra `curl -I` mot `/`, `dive-0.mp4` og `dive-0-m.mp4`:
- `content-security-policy`: uendret fra r3: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; media-src 'self' blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' + 29 sha256-hasher; connect-src 'self'; frame-src https://cal.com https://app.cal.com; manifest-src 'self'; upgrade-insecure-requests`.
- `strict-transport-security`, `x-content-type-options: nosniff`, `referrer-policy`, `x-frame-options: DENY`, `cross-origin-opener-policy: same-origin`, `x-dns-prefetch-control: off`, `permissions-policy`: alle til stede.
- 0 `securitypolicyviolation` og 0 konsollmeldinger i alle lastinger (desktop, mobil og desktop redusert med full rulling, pluss seks lastinger i modusmålingen).
- Cookies: 0. `document.cookie` tom. `sessionStorage`: `wow-inngang`. `localStorage`: tom.
- Verter siden kaller: `127.0.0.1:4600` alene. CSP tillater `frame-src` til `cal.com` og `app.cal.com`, men ingen iframe ble hentet.
- Klipp svarer `206 Partial Content` på `Range: bytes=0-99`.

## 7. axe

axe-core, regler `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` og `best-practice`, kjørt rett etter lasting uten rulling (som r3) og igjen etter full rulling.

| Tilstand | Brudd (regler / noder) | Incomplete |
|---|---|---|
| Desktop ved lasting | **0 / 0** | `color-contrast` 25 noder |
| Mobil ved lasting | **0 / 0** | `color-contrast` 30 noder |
| Desktop redusert ved lasting | **0 / 0** | `color-contrast` 16 noder |
| Mobil redusert ved lasting | **0 / 0** | `color-contrast` 16 noder |
| Desktop, mobil, desktop redusert etter full rulling | 0 / 0 | |

r3 hadde 4 regler og 9 noder (`aria-required-children`, `aria-hidden-focus`, `landmark-unique`, `aria-allowed-role`). Ingen av dem treffer nå. `aria-hidden-focus` er sjekket for seg også ved y = 1 500: 0 treff. «Incomplete» betyr at axe ikke kunne avgjøre kontrasten (tekst over video, bilder og gradienter). Det er ikke et bestått, og det er grunnen til at kontrast over video står som «ikke målt».

## 8. Historien i filmen (nytt)

Metode: rull fra y = 0 til 7 200 (desktop) og 6 750 (mobil), steg på 150 px med 450 ms pause og skjermbilde, deretter samme veg tilbake. Til dette en tettere skanning med steg på 30 px og 220 ms pause i begge retninger (229 trinn per retning desktop, 214 mobil, 886 trinn til sammen, ingen skjermbilder). Jeg leser DOM og beregnet stil: `data-sw-aktiv` på kort, `data-fase`, `data-aktiv` på skinnens punkter, opasitet gjennom alle foreldre (med `visibility` og `display`) for hver tekst på platen og for hero-teksten.

**Telleren (rad 33).** Skjermleserteksten (`data-sw-teller-sr`) og det synlige sifferet (NumberFlow, leses fra skjermbilde) er like i alle bilder.

| Rulling ned | Desktop y | Mobil y |
|---|---|---|
| 0 av 3 | 0 – 1 800 | 0 – 1 650 |
| 1 av 3 | 1 950 – 3 000 | 1 800 – 2 850 |
| 2 av 3 | 3 150 – 4 200 | 3 000 – 3 900 |
| 3 av 3 | 4 350 – ut av filmen | 4 050 – ut av filmen |

Opp: 3 → 2 ved y 4 200 / 3 900, 2 → 1 ved 3 000 / 2 850, 1 → 0 ved 1 800 / 1 650. Samme overganger som ned, og i samme kapittel. Telleren er skjult (`data-synlig` ikke satt) på heroen (y 0 og 150) og vises fra y 300. Lampen i telleren er grå ved 0 til 2 og grønn med hake ved 3 av 3 (`data-alle`), i begge retninger.

**Aldri to tekster samtidig (rad 34).** Jeg teller tekstgrupper med synlig opasitet: hero-teksten, og for hvert kort problemfasen og løsningsfasen hver for seg. Maks samtidig er 1 i alle 886 trinn, både med terskel 30 % og 5 % opasitet. Ved y 150 (hero 0,26 / 0,20 mobil) er platen ennå ikke synlig, og ved y 300 er hero 0. Bytte mellom problem og løsning i samme kort: aldri begge over 5 %. Jeg har bare lest de 220 ms som en trinn gir CSS-overgangene; en overgang som tar lengre tid enn 220 ms ville vist seg som flere synlige tekster, og det skjedde ikke.

**Skinnen mot platen (rad 35).** Aktivt kort (`data-sw-aktiv`) og aktivt punkt i skinnen (`data-aktiv`) har samme indeks i alle 886 trinn, og tekstene som er synlige tilhører alltid det aktive kortet. Rekkefølge ned: Gata (0) → Bakeriet (1) → Kontoret (2) → Rørleggeren (3) → Verkstedet (4). Bytte problem → løsning: Bakeriet desktop y 1 950 (mobil 1 800), Kontoret 3 150 (3 000), Rørleggeren 4 350 (4 050), Verkstedet 5 850 (5 400). Bytte til neste kapittel: 1 200 / 2 400 / 3 600 / 4 800 desktop og 1 050 / 2 250 / 3 300 / 4 500 mobil. Opp er overgangene speilet, med 150 px forskyvning fra stegene.

**Verkstedet mot rapporten (rad 36).** Målingene i verkstedet låses én og én (`data-maaler` → `data-last`) og låses opp igjen i samme rekkefølge ved rulling opp:

| | Fyller | Låst 1 / 2 / 3 / 4 |
|---|---|---|
| Desktop ned | y 5 100 | 5 250 / 5 400 / 5 550 / 5 850 |
| Mobil ned | y 4 800 | 4 950 / 5 100 / 5 250 / 5 400 |

Verdiene, lest fra verkstedet (`.sw__maaling`) og fra `#rapport` (`.wow-rapport__rad`), er ordrett like (desktop og mobil):

| Måling | Verksted | Rapport |
|---|---|---|
| Cookies før samtykke | 0 | 0 |
| Sikkerhetsheadere | 6/6 | 6/6 |
| Universell utforming | 0 feil (forbehold: «Maskinelt testbare feil. Kontrast og tastatur testes manuelt.») | 0 feil (samme forbehold) |
| Lovpålagt informasjon | Org.nr. bekreftet | Org.nr. bekreftet |

Dato («Målt 18. nov. 2026») og adresse («kodekonsulentene.no») er like i panelet og i rapporten. Alle fire har hake (`data-last` / `wow-hake` uten `--venter`). Begge viser `data-status="bestatt"`.

Konsollmeldinger under historiemålingen: 0.

Kontaktark (12 bilder per ark):
- Desktop ned: `.skudd/wow/r4/kontaktark-historie-desktop-ned-1.jpg` til `-5.jpg`
- Desktop opp: `.skudd/wow/r4/kontaktark-historie-desktop-opp-1.jpg` til `-5.jpg`
- Mobil ned: `.skudd/wow/r4/kontaktark-historie-mobil-ned-1.jpg` til `-4.jpg`
- Mobil opp: `.skudd/wow/r4/kontaktark-historie-mobil-opp-1.jpg` til `-4.jpg`
- Tellerutsnitt: `.skudd/wow/r4/teller-desktop-ned.png`, `teller-desktop-opp.png`, `teller-mobil-ned.png`, `teller-mobil-opp.png`
- Verkstedet og rapporten: `.skudd/wow/r4/historie/desktop/verksted.jpg`, `rapport.jpg` og tilsvarende under `historie/mobil/`
- Tall per trinn: `.skudd/wow/r4/historie/historie.json`

## Avvik og ting dirigenten bør se

1. **Rad 12, sidevekt ved første innlasting: 2 174 166 B mobil og 2 321 005 B desktop mot 700 000 B (3,1 og 3,3 ganger).** Ett klipp (1 826 785 B mobil, 1 944 630 B desktop) står for 84 % av vekten i begge profiler. Uten klippet er vekten 336 og 365 KiB. Dette er den eneste raden som ikke består.
2. **Mobil y 1 050: laveste gjennomsnittslysstyrke 10,7 av 255** (r3 16,7). Et lite hus midt i et svart felt (åpningsbildet av kapittel 1). Samme type på desktop y 2 400 til 2 700 (kontorhuset). Laveste på desktop er y 4 800 (verkstedet), 21,5. Ikke helt svart, men det er lite å se på i ett trinn.
3. **Mobil y 4 800: bildeforskjell 0,99** (r3 minste 1,51). `currentTime` går videre, så klippet står ikke stille. Mørkt bilde med statisk målepanel.
4. **Største trinnforskjell desktop 55,9 (y 1 200)** mot 42,6 i r3. Det er koblingen `conn-1` som spilles 2,4 s per 150 px. Sømmen i filene er 0,9.
5. **Desktop: 553 px oppoverhopp ved Tab fra e-post til første skjemafelt** (y 12 560 → 12 007). Uendret fra r3, ikke et krav. Skjer ikke på mobil.
6. **JS 68 423 B av 70 000 B.** 1 577 B (2,3 %) til grensen. `wow.BcUAQalB.js` alene er 61 687 B, og Lighthouse regner 25 KiB av den som ubrukt ved load.
7. Kontrast for tekst over video er ikke målt, og axe kunne ikke avgjøre `color-contrast` på 16 til 30 noder.

## Ikke målt

- INP (krever ekte brukere).
- Kontrast for tekst over video i tre ruter fra filmstripa (ikke i oppdraget). Del 12 krever 4,5:1.
- Lange oppgaver ved rulling med 4× tregere prosessor (ikke i oppdraget).
- Lighthouse på andre sider enn forsiden.
- Lighthouse mot drift. Alt er målt lokalt.
- Oppløsning på bilder og video i resten av `public/` (eldre `bilder/`, `opptak/`, `scener/`, `historie/`). Jeg målte `scroll-world/` (rad 32), som er det r3 målte. Filer med korteste side under 1 080 piksler finnes utenfor `scroll-world/`: for eksempel `media/wow/ekte/*-960` (960×600) og `-585` (585×1266) som er mindre varianter til større filer med samme navn uten suffiks, og `bilder/*-800/-1200/-1600`, `opptak/*-960/-1280`. Jeg har ikke undersøkt hvilke av dem forsiden bruker i `srcset`, og hvilke som er egne kilder.

## Begrensninger

- Lighthouse: simulert throttling, lokal server, 3 kjøringer per profil. Spredningen er liten (mobil LCP 798–880 ms, ytelse 100 i alle).
- Vekt og video: 1 kjøring per profil. Tallene stemmer mellom Lighthouse og CDP-målingen (2 123 mot 2 120 KiB mobil, 2 267 mot 2 264 KiB desktop).
- Filmstripe: 450 ms pause per trinn gir videoen tid til å søke. En bruker som ruller raskt får færre ferdig avkodede bilder. Det har jeg ikke målt.
- Tastatur: Chrome (`channel: "chrome"`) og `getComputedStyle`. Erstatter ikke en test med skjermleser. «Synlig fokus» er målt som at en outline eller skygge finnes, bortsett fra de to stoppene jeg har sett i bilde (Book 20 minutter og kapittellenkene).
- Historien: jeg har lest DOM-tilstand og skjermbilder. Sifferet i telleren (NumberFlow, lukket skygge-DOM) er lest fra skjermbilder, ikke fra DOM.
- Skriptene ligger i `/private/tmp/claude-501/-Users-zakaria-Zakaria-02-Prosjekter-kodekonsulentene-web/a5ab2632-977c-4150-b266-bbf6bec0b290/scratchpad/` og er ikke i repoet.
