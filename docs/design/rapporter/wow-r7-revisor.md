# wow-r7 revisor: opptak og måling av hele nettstedet

Gren `redesign/wow`, 24. nov. 2026. Bygget med `npm run build`, kjørt med `PORT=4700 node server.mjs` (serveren er stoppet). Revisor har ikke rettet noe. Alt av bilder, skript og rådata ligger i `.skudd/wow/r7/` (ikke i git, `.skudd/` er ignorert).

Skills: lastet `design:accessibility-review`, `wai-suite:wai-testing` og `break-ui`. Finnes ikke i denne sesjonen: `core-web-vitals`, `performance`, `accessibility`, `seo`.

## Kommandoer

| Kommando | Resultat |
|---|---|
| `npm run test` | 342 av 342 bestått, 0 feilet |
| `npm run check` | 0 feil, 0 advarsler, 2 hint (248 filer) |
| `npm run build` | fullført uten feil eller advarsler |

## Omfang

- 28 sider i nettstedskartet pluss 404-siden = 29 offentlige sider. Alle har bilder i 1440 og 390 bredde, mørkt, lyst (der siden har det), redusert bevegelse og uten JavaScript.
- 24 sider under `/lab/` er tatt med i 1440 og 390 (mørkt) med axe, konsoll og lenker, men uten Lighthouse.
- Filmstripe av forsiden: 21 ruter (hver 5 %) i desktop og mobil, `.skudd/wow/r7/forside/stripe/`.

Slik leses bildene: `d-`/`m-` er 1440/390. `-mork`, `-lys` og `-utenjs` er satt sammen av skjermhøyder mens siden rulles, fordi v1-sidene avslører innhold med `animation-timeline: view()` og et vanlig helsidebilde lar alt under første skjerm stå usynlig. Det faste toppfeltet gjentas derfor ved hver skjøt, og en rad som står i skjøten kan være midt i inntoningen. `-redusert` er ett ubrutt helsidebilde og er det reneste for oppsett. Forsiden er for høy for én fil og er delt i `-del01`/`-del02`.

## Sidetabell (offentlige sider)

Lighthouse mobil, median av tre kjøringer: ytelse / tilgjengelighet / beste praksis / SEO. Krav i kortet: ytelse ≥ 90, resten ≥ 95, LCP ≤ 2,5 s. Vekt er første innlasting, overført (Lighthouse, kjøring 1). axe: WCAG 2.0–2.2 A og AA, kjørt i 1440 mørkt (d), 390 mørkt (m) og 1440 lyst (lys), med redusert bevegelse for d og m.

| Side | Mal/drakt | Lighthouse | LCP | CLS | Vekt første innlasting | axe-brudd | Lenkefeil | Konsollfeil |
|---|---|---|---|---|---|---|---|---|
| / | MalWow (wow) | 96 / 100 / 100 / 100 | 2744 ms | 0 | 383 kB (JS 87, bilder 152, font 109, HTML+CSS 28, video 0) | 0 | 0 | 0 |
| /nettsider/ | Base (v1) | 100 / 97 / 100 / 100 | 792 ms | 0 | 178 kB (JS 17, bilder 46, font 82, HTML+CSS 26, video 0) | lys: color-contrast (1) | 0 | 0 |
| /systemer/ | Base (v1) | 100 / 100 / 100 / 100 | 804 ms | 0.057 | 142 kB (JS 17, bilder 14, font 82, HTML+CSS 23, video 0) | 0 | 0 | 0 |
| /apper-og-ai/ | Base (v1) | 100 / 100 / 100 / 100 | 808 ms | 0.057 | 149 kB (JS 17, bilder 14, font 82, HTML+CSS 27, video 0) | 0 | 0 | 0 |
| /priser/ | Base (v1) | 100 / 97 / 100 / 100 | 791 ms | 0.057 | 153 kB (JS 26, bilder 14, font 82, HTML+CSS 23, video 0) | 0 | 0 | 0 |
| /om/ | Base (v1) | 100 / 100 / 100 / 100 | 787 ms | 0 | 169 kB (JS 17, bilder 40, font 82, HTML+CSS 24, video 0) | 0 | 0 | 0 |
| /sjekk/ | Base (v1) | 100 / 100 / 100 / 100 | 788 ms | 0 | 184 kB (JS 21, bilder 48, font 82, HTML+CSS 25, video 0) | lys: color-contrast (1) | 0 | 0 |
| /kontakt/ | Base (v1) | 100 / 100 / 100 / 100 | 1076 ms | 0 | 211 kB (JS 17, bilder 14, font 82, HTML+CSS 91, video 0) | 0 | 0 | 0 |
| /caser/ | Base (v1) | 100 / 97 / 100 / 100 | 780 ms | 0.057 | 140 kB (JS 17, bilder 14, font 82, HTML+CSS 20, video 0) | lys: color-contrast (8) | 0 | 0 |
| /sikkerhet/ | Base (v1) | 100 / 97 / 100 / 100 | 798 ms | 0 | 208 kB (JS 17, bilder 77, font 82, HTML+CSS 26, video 0) | lys: color-contrast (2) | 0 | 0 |
| /status/ | Base (v1) | 100 / 100 / 100 / 100 | 780 ms | 0.057 | 141 kB (JS 17, bilder 14, font 82, HTML+CSS 21, video 0) | 0 | 0 | 0 |
| /handbok/ | Base (v1) | 100 / 99 / 100 / 100 | 782 ms | 0 | 143 kB (JS 17, bilder 14, font 82, HTML+CSS 23, video 0) | 0 | 0 | 0 |
| /terminal/ | Base (v1) | 100 / 100 / 100 / 100 | 778 ms | 0.057 | 138 kB (JS 17, bilder 14, font 82, HTML+CSS 18, video 0) | 0 | 0 | 0 |
| /personvern/ | Base (v1) | 100 / 100 / 100 / 100 | 778 ms | 0.057 | 140 kB (JS 17, bilder 14, font 82, HTML+CSS 20, video 0) | 0 | 0 | 0 |
| /vilkar/ | Base (v1) | 100 / 100 / 100 / 100 | 774 ms | 0 | 139 kB (JS 17, bilder 14, font 82, HTML+CSS 19, video 0) | 0 | 0 | 0 |
| /bransjer/handverkere/ | Base (v1) | 100 / 100 / 100 / 100 | 809 ms | 0.057 | 151 kB (JS 17, bilder 21, font 82, HTML+CSS 24, video 0) | 0 | 0 | 0 |
| /bransjer/klinikker/ | Base (v1) | 100 / 100 / 100 / 100 | 804 ms | 0.057 | 143 kB (JS 17, bilder 14, font 82, HTML+CSS 23, video 0) | 0 | 0 | 0 |
| /artikler/ | Base (v1) | 100 / 95 / 100 / 100 | 775 ms | 0 | 138 kB (JS 17, bilder 14, font 82, HTML+CSS 19, video 0) | lys: color-contrast (2) | 0 | 0 |
| /artikler/35-wcag-krav/ | Base (v1) | 100 / 100 / 100 / 100 | 794 ms | 0.057 | 140 kB (JS 17, bilder 14, font 82, HTML+CSS 20, video 0) | 0 | 0 | 0 |
| /artikler/cookies-for-samtykke/ | Base (v1) | 100 / 100 / 100 / 100 | 767 ms | 0 | 140 kB (JS 17, bilder 14, font 82, HTML+CSS 20, video 0) | 0 | 0 | 0 |
| /artikler/orgnr-pa-nettsiden/ | Base (v1) | 100 / 100 / 100 / 100 | 776 ms | 0.057 | 140 kB (JS 17, bilder 14, font 82, HTML+CSS 20, video 0) | 0 | 0 | 0 |
| /artikler/wcag-i-registeret/ | Base (v1) | 100 / 100 / 100 / 100 | 804 ms | 0.057 | 144 kB (JS 17, bilder 14, font 82, HTML+CSS 24, video 0) | 0 | 0 | 0 |
| /verktoy/ | Base (v1) | 100 / 96 / 100 / 100 | 805 ms | 0.057 | 188 kB (JS 17, bilder 61, font 82, HTML+CSS 21, video 0) | 0 | 0 | 0 |
| /verktoy/cookie-sjekk/ | Base (v1) | 100 / 100 / 100 / 100 | 789 ms | 0.057 | 176 kB (JS 22, bilder 43, font 82, HTML+CSS 22, video 0) | 0 | 0 | 0 |
| /verktoy/dmarc/ | Base (v1) | 100 / 97 / 100 / 100 | 793 ms | 0 | 193 kB (JS 17, bilder 63, font 82, HTML+CSS 24, video 0) | lys: color-contrast (1) | 0 | 0 |
| /verktoy/priskalkulator/ | Base (v1) | 100 / 100 / 100 / 100 | 812 ms | 0.057 | 199 kB (JS 26, bilder 61, font 82, HTML+CSS 23, video 0) | 0 | 0 | 0 |
| /verktoy/uu-sjekk/ | Base (v1) | 100 / 100 / 100 / 100 | 790 ms | 0.057 | 174 kB (JS 22, bilder 42, font 82, HTML+CSS 22, video 0) | 0 | 0 | 0 |
| /retning/a/ | egen HTML, ingen felles mal | 100 / 100 / 100 / 66 | 624 ms | 0 | 114 kB (JS 4, bilder 50, font 49, HTML+CSS 8, video 0) | lys: color-contrast (8) | 0 | 0 |
| 404-siden (`/finnes-ikke-404/`) | Base (v1) | ikke målt (Lighthouse avviser svar 404) | – | – | 198 kB (Playwright, desktop) | 0 | 0 | 0 (bare nettleserens egen melding om 404-svaret) |

Felles for alle 29: sikkerhetsheadere 6 av 6, CSP har `media-src 'self' blob:`, 0 cookies, 0 tredjepartskall, ingen horisontal rulling ved 390, 0 brutte bilder, 0 svar med 4xx/5xx på ressurser. TBT 0 ms på alle målte sider. INP er ikke målt: det krever ekte brukere.

Egen JavaScript i gzip (målt i `dist/`): forsiden 63,8 kB (grense 70 med GSAP), `/nettsider/` 8,9 kB, `/sjekk/` 10,8 kB, `/priser/` og `/verktoy/priskalkulator/` 12,9 kB, `/retning/a/` 1,1 kB (grense 20).

## Lab-sider (interne, `noindex`)

Ikke målt med Lighthouse. Vekt er første innlasting i Playwright, desktop.

| Side | Mal/drakt | Vekt | axe-brudd | Lenkefeil | Konsollfeil |
|---|---|---|---|---|---|
| /lab/bevegelse/ | Base (v1) | 135 kB | 0 | 0 | 0 |
| /lab/bibliotek/ | Base (v1) | 133 kB | 0 | 0 | 0 |
| /lab/form/ | Base (v1) | 134 kB | 0 | 0 | 0 |
| /lab/ikoner/ | Base (v1) | 135 kB | 0 | 0 | 0 |
| /lab/interaksjon/ | Base (v1) | 138 kB | 0 | 0 | 0 |
| /lab/lek/ | Base (v1) | 147 kB | 0 | 5 (404, se P3-3) | 0 |
| /lab/mening/ | Base (v1) | 136 kB | 0 | 0 | 0 |
| /lab/og/ | Base (v1) | 348 kB | 0 | 0 | 0 |
| /lab/rolig/ | MalWow (wow) | 338 kB | 0 | 1 anker | 0 |
| /lab/rontgen/ | Base (v1) | 135 kB | 0 | 0 | 0 |
| /lab/scroll-world/ | MalWow (wow) | 382 kB | 0 | 1 anker | 0 |
| /lab/storflate/ | Base (v1) | 3272 kB | 0 | 0 | 0 |
| /lab/sveip/ | Base (v1) | 133 kB | 0 | 0 | 0 |
| /lab/svg/ | Base (v1) | 138 kB | 0 | 0 | 0 |
| /lab/teknikker/ | Base (v1) | 136 kB | 0 | 0 | 0 |
| /lab/typo/ | Base (v1) | 135 kB | 0 | 0 | 0 |
| /lab/wow-bevegelse/ | MalWow (wow) | 215 kB | d: scrollable-region-focusable (1); m: list (1) | 5 ankre | 0 |
| /lab/wow-side/ | MalWow (wow) | 209 kB | 0 | 0 | 0 |
| /lab/kapittel/apper-og-ai/ | MalWow (wow) | 316 kB | 0 | 0 | 0 |
| /lab/kapittel/handverkere/ | MalWow (wow) | 328 kB | 0 | 0 | 0 |
| /lab/kapittel/klinikker/ | MalWow (wow) | 319 kB | 0 | 0 | 0 |
| /lab/kapittel/nettsider/ | MalWow (wow) | 317 kB | 0 | 0 | 0 |
| /lab/kapittel/om/ | MalWow (wow) | 317 kB | 0 | 0 | 0 |
| /lab/kapittel/systemer/ | MalWow (wow) | 334 kB | 0 | 0 | 0 |

## Funn

Alvorlighet: P0 = siden er ødelagt eller bryter lov/sikkerhet. P1 = bryter et fast krav eller målet for runden. P2 = avvik fra briefen som ikke stopper bruk. P3 = småting og interne sider. Ingen smaksvurderinger.

### P0

Ingen funn.

### P1

**P1-1. 27 av 28 sider i nettstedskartet, pluss 404-siden, har v1-drakten.** Bare forsiden bruker `MalWow` (`tokens-wow.css`, `wow.css`). Resten bruker `src/layouts/Base.astro` med `tokens.css`, `components.css` og `site.css`: v1-toppfeltet, eyebrow med `// 01`, JetBrains Mono, og lyst/mørkt tema med bryter.
Sider: `/nettsider/`, `/systemer/`, `/apper-og-ai/`, `/priser/`, `/om/`, `/sjekk/`, `/kontakt/`, `/caser/`, `/sikkerhet/`, `/status/`, `/handbok/`, `/terminal/`, `/personvern/`, `/vilkar/`, `/bransjer/handverkere/`, `/bransjer/klinikker/`, `/artikler/` og de fire artiklene, `/verktoy/` og de fire verktøyene, `404.astro`.
Bilder: `.skudd/wow/r7/<side>/d-redusert.png` og `m-redusert.png` for hver, f.eks. `.skudd/wow/r7/priser/d-redusert.png`. Forsiden til sammenligning: `.skudd/wow/r7/forside/d-mork-del01.png`.

**P1-2. Forsiden: LCP 2744 ms, kravet er 2500 ms.** Tre kjøringer: 2258, 2745, 2744. Ytelse 96 (krav 90, bestått). LCP-elementet er `img.sw__poster` (`/media/wow/scroll-world/hero-m.avif`, 72 kB overført), ikke video. Fil: `src/pages/index.astro` og scroll-world-komponenten. Rådata: `.skudd/wow/r7/lh/forside-0.json` til `-2.json`. Bilde: `.skudd/wow/r7/forside/stripe/mobil-000.png`.

**P1-3. `/retning/a/` ligger i nettstedskartet, men er en prototype med `noindex`.** Lighthouse SEO 66 (krav 95), eneste svikt er `is-crawlable`. Siden er sin egen HTML uten felles mal (`src/pages/retning/a.astro`), henter `/scener/test/test-1080.mp4` med `preload="auto"` (2,6 MB overført etter rulling), og har 8 kontrastbrudd i lyst tema på 1,01:1 (`#e9ecef` på `#e9eae6`, `.scene__steg h2` og `p`). Den står ikke i `docs/design/url-liste.txt`. Ingen offentlig side lenker til den. Bilder: `.skudd/wow/r7/retning_a/d-lys.png`, `d-mork.png`.

**P1-4. Alle 11 bildene i `public/media/wow/ekte/` viser v1-drakten.** De er skjermbilder av v1-sidene (v1-toppfelt med KK-merke, `// 01`-eyebrow, mono-tall, limegrønn knapp). Fire av dem vises på forsiden: `kalkulator-d`, `status-d`, `klinikker-flyt`, `sjekk-m` (`src/components/wow/seksjoner/Arbeid.astro`). De øvrige: `apper-kobling`, `apper-m`, `handverkere-m`, `klinikker-d`, `sjekk-rapport`, `systemer-flyt`, `systemer-m`. Oppløsningen er i orden (1920×1200 og 1170×2532). Bilder: `.skudd/wow/r7/ekte/*.png`, samlet i `.skudd/wow/r7/ekte/ark-desktop.png` og `ark-mobil.png`.

**P1-5. Kontrastbrudd i lyst tema på 6 v1-sider (axe, WCAG 1.4.3).** Kravet er 0 brudd. Mørkt tema har 0 brudd på alle sider i 1440 og 390.

| Side | Antall | Element | Målt |
|---|---|---|---|
| `/caser/` | 8 | `.kk-eyebrow span`, `.mono.faint`, `.muted` | 3,03–3,53:1 (`#8c9399`/`#81878e` på `#fcfcfd`) |
| `/sikkerhet/` | 2 | `.samtykke__rad--ok .samtykke__tid`, `.samtykke__felt` | 3,16:1 (`#646b72` på `#0c1f1c`) |
| `/artikler/` | 2 | `.pekerkort__nr`, `.pekerkort__tekst` | 3,47:1 og 4,09:1 |
| `/nettsider/` | 1 | `.snitt__bunn` | 2,8:1 (`#8e959b` på `#f5f6f7`) |
| `/verktoy/dmarc/` | 1 | `.snitt__bunn` | 2,73:1 |
| `/sjekk/` | 1 | `.sjs__verdi--neutral` | 2,32:1 (`#474c53` på `#060708`) |

Bilder: `.skudd/wow/r7/<side>/d-lys.png`. Rådata: `axeLysDesktop` i `.skudd/wow/r7/<side>/maal.json`.

### P2

**P2-1. Forsiden henter 17,0 MB video på desktop og 15,2 MB på mobil når hele siden rulles.** Ni klipp fra `/media/wow/scroll-world/` hentes med `fetch` og spilles fra blob. Ingen video hentes ved innlasting (0 videoforespørsler før rulling, bestått). Første innlasting er 383 kB (grense 700, bestått). Briefen har ingen grense for samlet video. Rådata: `.skudd/wow/r7/forside/stripe/logg.json`, `vektEtterRulling` i `.skudd/wow/r7/forside/maal.json`.

**P2-2. Video finnes bare som mp4 i tre mapper.** Briefen del 12/17 krever mp4 og webm. Bare mp4: alle 22 klipp i `public/media/wow/scroll-world/` (inkl. `kapitler/`), alle i `public/opptak/`, og `public/scener/*.mp4` utenom `hero/` og `test/`. Har begge: `media/wow/hero-*`, `media/wow/{apper,nettsider,systemer}`, `scener/hero/`, `scener/test/`. Range svarer 206 på alle fire prøvde filer.

**P2-3. Bilder og video der største variant er under 1080 px på korteste side** (full liste med mål: `.skudd/wow/r7/opplosning.txt`):
- `public/bilder/*`: største variant 1600×900 (9 motiver).
- `public/media/wow/{apper,nettsider,systemer}.avif/.webp`: 1600×900 (videoene er 1920×1080).
- Postere: `scener/floke-poster.avif` og `skjelett-poster.avif` 1600×900; `opptak/*-poster.avif` 1280×720 (cookie-sjekk 1200×676); mobilpostere 544 px brede.
- `opptak/*-mobil-816.mp4`: 816 px brede. `opptak/lagstabel-1920.mp4` er 1920×1078.
- `public/og/*.png` er 1200×630 (delingsbilder).
Alt i `media/wow/scroll-world/` og `media/wow/ekte/` holder kravet.

**P2-4. Tema er ulikt mellom forsiden og resten.** Forsiden har bare mørkt (`color-scheme: dark`). De 27 v1-sidene følger systemet og har lyst tema og temabryter. Bilder: `.skudd/wow/r7/priser/d-lys.png` mot `.skudd/wow/r7/forside/d-mork-del01.png`.

**P2-5. Tre nettfonter på tvers av nettstedet.** Forsiden laster Archivo og Schibsted Grotesk (variable, 109 kB). v1-sidene laster Schibsted Grotesk 700/800 og JetBrains Mono (82 kB), og brødteksten er `system-ui`. Hver side holder seg til to nettfonter; nettstedet samlet har tre. Kravet er maks to familier.

**P2-6. Overskriftsrekkefølge (Lighthouse `heading-order`).** `/handbok/`: `h3.flyt__tittel`. `/artikler/`: `h3.pekerkort__tittel`.

**P2-7. Lighthouse melder kontrast i mørkt tema på sju v1-sider, axe gjør det ikke.** `/nettsider/`, `/priser/`, `/caser/`, `/sikkerhet/`, `/artikler/`, `/verktoy/`, `/verktoy/dmarc/` får 95–97 i tilgjengelighet (krav 95, bestått) med 3,9–4,0:1 på bl.a. `strong.body-strong` og `.mono.faint`. axe med redusert bevegelse finner 0 på de samme sidene. Ikke avklart hvilken som stemmer; forskjellen kan komme av at Lighthouse måler mens innholdet tones inn. Ikke undersøkt videre.

**P2-8. CLS 0,057 på 16 v1-sider.** Under grensen på 0,1, men samme verdi på alle, så det er én felles kilde. Forsiden og 11 andre har 0.

**P2-9. Plassholdere og TODO.** Ingen synlig `TODO` eller `PLASSHOLDER` på noen offentlig side. Org.nr. er fylt inn (`test/lansering.test.ts` er grønn). Det som står igjen i `src/data/firma.ts`: adressen er bare «Oslo» (TODO om geografisk adresse, ehandelsloven § 8), telefon er tom, og Cal.com-brukernavnet er merket PLASSHOLDER mens sidene lenker til `cal.com`. To app-caser i `src/data/caser.ts` er TODO og holdes skjult. Merkede eksempler som synes: «Ikke et levert oppdrag» på forsiden, `/caser/` og `/systemer/`.

### P3

**P3-1.** Lab-ankre som ikke finnes: `/lab/rolig/#kontakt`, `/lab/scroll-world/#kontakt`, og fem på `/lab/wow-bevegelse/` (`#bolt`, `#floke`, `#priser`, `#skjelett`, `#akt-tetting`).
**P3-2.** axe på `/lab/wow-bevegelse/`: `scrollable-region-focusable` (1) i 1440 og `list` (1) i 390.
**P3-3.** `/lab/lek/` har fem lenker som gir 404 (`/priserr`, `/prise`, `/kontkt`, `/verktoy/priskalkulatro`, `/noe-helt-annet-som-ikke-finnes`). De ser ut til å være eksempler for 404-siden; ikke bekreftet.
**P3-4.** De seks `/lab/kapittel/*`-sidene viser teksten «Plassholder for Kontaktblokk i laben».
**P3-5.** Hvert svar bærer rundt 3 kB headere fordi CSP-en har over 30 skripthasher. En skriptfil på 47 byte gzip koster 3 kB overført; forsidens JavaScript er 63,8 kB gzip og 87 kB overført.
**P3-6.** `/lab/storflate/` laster 3,3 MB (video 3,1 MB) ved innlasting.

## Bestått

| Krav | Grense | Målt | Bestått |
|---|---|---|---|
| Lighthouse ytelse | ≥ 90 | 96–100 på 28 sider | ja |
| Lighthouse tilgjengelighet | ≥ 95 | 95–100 | ja |
| Lighthouse beste praksis | ≥ 95 | 100 på alle | ja |
| Lighthouse SEO | ≥ 95 | 100 på 27, 66 på `/retning/a/` | nei (P1-3) |
| LCP | ≤ 2,5 s | 624–1076 ms på 27, 2744 ms på forsiden | nei (P1-2) |
| CLS | < 0,1 | 0–0,057 | ja |
| Første innlasting | ≤ 700 kB | 114–383 kB | ja |
| Egen JS gzip | ≤ 70 / ≤ 20 kB | 63,8 / 1,1–12,9 kB | ja |
| axe WCAG 2.2 AA, mørkt | 0 | 0 på 29 sider, begge bredder | ja |
| axe WCAG 2.2 AA, lyst | 0 | 23 noder på 7 sider | nei (P1-5, P1-3) |
| Sikkerhetsheadere | 6/6 | 6/6 på 56 adresser | ja |
| CSP `media-src 'self'` | finnes | `media-src 'self' blob:` | ja |
| Cookies / tredjepartskall | 0 / 0 | 0 / 0 | ja |
| Interne lenker, offentlige sider | 0 døde | 0 døde, 0 manglende ankre | ja |
| `docs/design/url-liste.txt` | 200 eller 301 | 27 av 27 svarer 200 | ja |
| Konsollfeil | 0 | 0 | ja |
| Horisontal rulling ved 390 | ingen | ingen på 53 sider | ja |
| Uten JavaScript | all tekst synlig | overskrifter og tekst til stede på alle 29; se merknad | ja |
| Redusert bevegelse | all tekst synlig | ja; se merknad | ja |
| Video før rulling (forsiden) | 0 | 0 | ja |
| Video Range | 206 | 206 på 4 av 4 | ja |

Merknad uten JavaScript og redusert bevegelse: den automatiske målingen flagget demofigurene på `/sjekk/` (15 tekster) og `/sikkerhet/` (18), og lagetikettene i stabelfiguren på `/om/` (8, også med JavaScript). Kontrollert på bilder: figurene på `/sjekk/` og `/sikkerhet/` står synlige uten JavaScript (`.skudd/wow/r7/sjekk/demo-utenjs.png`, `.skudd/wow/r7/sikkerhet/demo-utenjs.png`). Etikettene på `/om/` er skjult til figuren trekkes fra hverandre, i alle moduser (`.skudd/wow/r7/om/demo-redusert.png`). På forsiden er tre `h2` i DOM med `display: none` uten JavaScript («Nettsider som laster på mobilen», «Integrasjoner for booking, betaling og regnskap», «Apper for håndverkere»); om samme tekst vises et annet sted er ikke sjekket.

## Ikke målt

- INP: krever ekte brukere.
- Lighthouse for 404-siden (verktøyet avviser 404-svar) og for lab-sidene (utenfor kortet).
- Tastaturgjennomgang, kontrast for tekst over video, lange oppgaver med fire ganger tregere prosessor og scene-testene i `tests/bevegelse/`: ikke bedt om i dette kortet.
- Eksterne lenker (13 verter, bl.a. `cal.com`, `lovdata.no`, `ssb.no`): ikke fulgt.
- Ekte iPhone og Android.

## Resultat

Hele nettstedet er tatt opp og målt: 53 sider, over 300 bilder, 42 filmstripe-ruter. Nettstedet er teknisk friskt (ingen døde lenker, konsollfeil, cookies eller tredjepartskall, 6/6 headere overalt), men bare forsiden har wow-drakten. Fem P1-funn, ni P2, seks P3, ingen P0.

## Filer endret

- Opprettet: `docs/design/rapporter/wow-r7-revisor.md`.
- Opprettet (ignorert av git): `.skudd/wow/r7/` med bilder per side, `lh/` (Lighthouse-rapportene som JSON), `forside/stripe/`, `ekte/`, `opplosning.txt`, `headere.txt`, `lenker.json`, `detaljer.json`, `tabell.md` og skriptene `sider.mjs`, `lh.mjs`, `opptak.mjs`, `fliser.mjs`, `stripe.mjs`, `lenker.mjs`, `headere.mjs`, `synlighet.mjs`, `etterkontroll.mjs`, `sammendrag.mjs`, `skjult.mjs`.
- `dist/` er bygget på nytt. Ingen kildefiler, tester eller terskler er rørt.

## Kilder

Egne målinger 24. nov. 2026 mot `http://127.0.0.1:4700`: Lighthouse 13.6.0 (mobil, simulert struping, 3 kjøringer), Playwright med Chrome og `@axe-core/playwright`, `ffprobe`, `fetch`. Krav fra `docs/design/redesign-brief.md` del 12 og 17, og oppdragskortet. Ingen eksterne kilder.

## Åpne spørsmål og antakelser

1. Skal `/retning/a/` finnes i det som lanseres? Den er i nettstedskartet i dag.
2. Skal undersidene ha lyst tema, eller bare mørkt som forsiden?
3. Antakelse: «v1-drakt» er satt for alle sider som bruker `Base.astro`. Hvor langt hver side avviker fra wow-designet er ikke vurdert; det er kritikerens.
4. Antakelse: lab-sidene er interne og er derfor ikke målt med Lighthouse.
5. `etterkontroll.mjs` hang i siste del og ble avbrutt; den delen er kjørt på nytt i `synlighet.mjs`.

## Neste steg

- Kritiker: vurder bildene i `.skudd/wow/r7/<side>/` mot forsiden.
- Bygger: undersidene over på `MalWow` (P1-1), deretter nye bilder til `public/media/wow/ekte/` (P1-4, de må tas etter at sidene har fått ny drakt).
- Bygger: LCP på forsiden (P1-2) og kontrast i lyst tema (P1-5), med mindre lyst tema fjernes.
- Dirigent/eier: avgjør `/retning/a/` (P1-3) og tema (P2-4).
- Revisor: ny måling etter ombygging, da med tastaturgjennomgang og kontrast over video.
