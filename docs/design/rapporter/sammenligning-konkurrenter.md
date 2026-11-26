# Sammenligningsopptak: kodekonsulentene.no mot syntaxstudio.no og fire andre

Målt 2026-11-18. Bare fakta fra måling og bilder. Ingen smaksdom. Alt ligger i `.skudd/sammenligning/<side>/` (gitignorert, 192 MB). Skriptene er `opptak.mjs`, `lighthouse.sh`, `samlet.sh` og `video-sjekk.mjs` i samme mappe.

## 0. Begrensninger (les først)

- **Lighthouse: 1 kjøring per side**, mobil, simulert throttling. Én kjøring varierer. Ikke bruk forskjeller på noen få poeng som bevis.
- **Redesign er målt lokalt** (`node server.mjs`, port 4410, 127.0.0.1), ikke i drift. Lighthouse simulerer nett, men det er ingen reell latenstid. Tallene er ikke direkte sammenlignbare med de andre sidene, som er målt over internett. `npm start` kjører `entry.mjs`, ikke `server.mjs`. Jeg brukte `server.mjs` fordi det er det som kjører i drift.
- **Bygget feilet ikke.** `npm run build` ga exit 0 kl. 10:26. Det overskrev `dist/` (gitignorert).
- **Endringer jeg ikke har gjort:** `package.json` og `package-lock.json` ble endret kl. 10:44, etter bygget. De legger til `gsap`, `lenis`, `embla-carousel`, `number-flow` og `@lucide/astro`. Det var ikke meg. Redesign-bygget som er målt, ble laget før det. Det inneholder ikke disse bibliotekene (se stack-funn).
- **Opptaket av de første 3 sekundene er en løkke med skjermbilder, ikke video.** Playwrights ffmpeg er ikke installert, og jeg installerte det ikke. Faktisk tidspunkt står i filnavnet (`f-05-1251ms.png`). Intervallet er 250 ms. Skjermbildene tar tid, så tidspunktene glir (for eksempel 0, 657, 1009 ms på kodestudio).
- Playwrights egen Chromium er ikke installert. Jeg brukte Google Chrome fra `/Applications` (`channel: "chrome"`).
- **Samtykkebannere er ikke klikket bort.** Opptakene viser det en førstegangsbesøkende ser. Banneret dekker nedre del av første skjerm hos nettsidebyra.no, kodestudio.no og nettsmed.no.
- **Animasjonstallene** kommer fra `document.getAnimations()` hvert 100 ms (CSS-animasjoner og -transisjoner), fra en MutationObserver på `style` og `class`, og fra bildene. JS-drevne animasjoner som ikke setter `style` på elementer (canvas, for eksempel), fanges ikke. Rullepåvirkede animasjoner er bare bekreftet visuelt der det står «sett».
- **Vektmåling:** Chrome DevTools Protocol, desktop 1440×900, nytt nettleservindu uten cache. «Ved load» er `load` pluss nettverksstille (maks 8 s) pluss 2,5 s. «Etter rulling» er etter rulling gjennom hele siden i steg på 400 px. Overført inkluderer HTTP-headere (derfor kan overført JS være større enn utpakket for veldig små filer).
- **kodestudio.no:** Lighthouse ble omdirigert til `https://www.kodestudio.no/en` (Lighthouse-advarsel). Poengene gjelder engelsk versjon. Skjermbildene er norske (`locale nb-NO`).
- **nettsidebyra.no:** Lighthouse advarte «The page loaded too slowly to finish within the time limit. Results may be incomplete.»
- **appfabrikken.no er ikke en aktiv konkurrent.** Første skjerm sier «Vi påtar oss ikke lenger oppdrag for skreddersydd apputvikling». Jeg har likevel målt den (se `appfabrikken/`) og la til **nettbyra.no** som erstatning.
- INP er ikke målt. Det krever ekte brukere.

## 1. Valg av sider

| Side | Hvorfor |
|---|---|
| kodekonsulentene.no (drift) | Oppdraget |
| kodekonsulentene (redesign, lokal) | Oppdraget, gren `redesign/befaring`, commit fa2c806 |
| syntaxstudio.no | Hovedreferanse, Oslo, film/foto/nettsider/sosiale medier |
| nettsidebyra.no | Tittel: «Nettsidebyrå, Profesjonell Nettside for Bedrifter», fast månedspris på 1 490 kr/mnd, retter seg mot småbedrifter |
| kodestudio.no | Tittel: «nettsider for bedrifter i Norge», enkeltperson som selger til små og mellomstore bedrifter, samme størrelse som oss |
| nettsmed.no | Tittel: «Webbyrå i Hamar, Oslo og Kristiansand», nettsider, integrasjoner og KI-chatbot til norske bedrifter |
| nettbyra.no | Tittel: «Profesjonell webutvikling for norske bedrifter», ærlige priser inkl. mva |
| appfabrikken.no | Apputvikling for norske bedrifter, men sluttet å ta oppdrag (se over). Med for fullstendighetens skyld. |

Jeg fant dem ved å teste kandidatdomener og lese `<title>` og `meta description`. Søkemotorer lot seg ikke bruke fra kommandolinjen. Utvalget er ikke uttømmende.

## 2. Hovedtabell

Lighthouse mobil (ytelse / tilgjengelighet / beste praksis / SEO), 1 kjøring. Vekt er desktop, overført, 1 MB = 1 048 576 B. JS er overført (gzip/brotli) KB for alle skriptfiler ved første lasting pluss rulling. Animasjoner er antall `@keyframes`-navn / transisjonsmål (elementer) / elementer med JS-satt `style` under rulling.

| Side | Stack (bevis i del 4) | Lighthouse | LCP / CLS / TBT | Vekt ved load | Vekt etter rulling (forespørsler) | JS-KB (filer) | Animasjoner (kf / trans. / JS-stil) |
|---|---|---|---|---|---|---|---|
| kodekonsulentene.no (drift) | Astro, Fly.io | 99 / 100 / 100 / 100 | 1011 ms / 0,057 / 83 ms | 0,13 MB (11) | 1,94 MB (12) | 10,9 (4) | 20 / 4 / 13 |
| kodekonsulentene (redesign, lokal) | Astro, `server.mjs` | 100 / 100 / 100 / 100 | 776 ms / 0,000 / 0 ms | 0,16 MB (8) | 2,01 MB (9) | 3,7 (1) | 0 / 2 / 9 |
| syntaxstudio.no | Next.js (Turbopack), React 19, Tailwind, Lenis, Vercel | **78** / 100 / 100 / 100 | **3265 ms** / 0,000 / **466 ms** | **10,52 MB** (38) | **21,4 MB** (77) | 201,8 (20) | 7 / 2 / 0 (3 klasse) |
| nettsidebyra.no | Vite, React, Tailwind, framer-motion (sannsynlig), Vercel | 98 / 100 / 100 / 100 | 2337 ms / 0,000 / 19 ms | 0,30 MB (19) | 0,58 MB (25) | 186,4 (9) | 0 / 6 / 12 |
| kodestudio.no | Next.js, React, Tailwind, Vercel | 91 / 97 / 100 / 100 (`/en`) | 3423 ms / 0,000 / 22 ms | 0,38 MB (34) | 0,57 MB (55) | 284,4 (22) | 3 / 11 / 6 (12 klasse) |
| nettsmed.no | Next.js, React, Tailwind, Vercel, Google Tag Manager | 95 / 100 / 100 / 100 | 2877 ms / 0,000 / 33 ms | 0,50 MB (50) | 0,59 MB (56) | 231,6 (15) | 17 / 11 / 5 (22 klasse) |
| nettbyra.no | Next.js, React, Tailwind, Cloudflare | 93 / 96 / 100 / 100 | 3255 ms / 0,000 / 1 ms | 0,73 MB (42) | 0,73 MB (42) | 156,3 (9) | 7 / 0 / 0 |
| appfabrikken.no (ikke aktiv) | Ingen rammeverk funnet. Express (`x-powered-by`), Cloudflare | 98 / 100 / 96 / 100 | 872 ms / 0,000 / 173 ms | 2,27 MB (14) | 2,27 MB (15) | 6,4 (3) | 0 / 2 / 1 |

Vekt fordelt etter rulling (desktop, KB overført):

| Side | Dokument | JS | CSS | Bilder | Video | Fonter (filer) |
|---|---|---|---|---|---|---|
| kodekonsulentene (drift) | 30 | 11 | 0 (inline, ingen CSS-fil) | 20 | 1847 (1 mp4) | 77 (2) |
| kodekonsulentene (redesign) | 17 | 4 | 0 (inline) | 35 | 1888 (1 mp4) | 108 (2) |
| syntaxstudio.no | 25 | 202 | 13 | 830 | 20 664 (6 mp4) | 131 (2) |
| nettsidebyra.no | 13 | 186 | 25 | 297 | 0 | 74 (2) |
| kodestudio.no | 24 | 284 | 10 | 118 | 0 | 84 (3) |
| nettsmed.no | 38 | 232 | 65 | 206 | 0 | 55 (1) |
| nettbyra.no | 11 | 156 | 13 | 455 | 0 | 66 (2) |
| appfabrikken.no | 9 | 6 | 1 | 2279 | 0 | 23 (1) |

Mobil (390×844), samlet overført etter rulling: drift 0,90 MB, redesign 1,80 MB, syntaxstudio 16,1 MB, nettsidebyra 0,58 MB, kodestudio 0,55 MB, nettsmed 0,54 MB, nettbyra 0,73 MB, appfabrikken 2,27 MB.

Lighthouse sin egen `total-byte-weight` (mobil, ved første lasting, uten rulling): drift 140 KB, redesign 170 KB, syntaxstudio 4829 KB, nettsidebyra 309 KB, kodestudio 428 KB, nettsmed 537 KB, nettbyra 731 KB, appfabrikken 2329 KB.

Sidehøyde (px), desktop / mobil: drift 10 197 / 15 028; redesign 13 056 / 15 442; syntaxstudio 8 959 / 11 642; nettsidebyra 8 517 / 14 167; kodestudio 10 819 / 13 883; nettsmed 10 824 / 16 188; nettbyra 4 293 / 6 546; appfabrikken 2 441 / 4 364.

## 3. Målte forskjeller: kodekonsulentene mot syntaxstudio.no

Alle tall er fra del 2 og filene i `maaling.json` og `lighthouse-mobil.json` per side.

**Ytelse og vekt**
1. Lighthouse ytelse: syntaxstudio 78, drift 99, redesign 100 (lokal). LCP: 3265 ms mot 1011 ms (drift) og 776 ms (redesign, lokal). TBT: 466 ms mot 83 ms og 0 ms. Tilgjengelighet, beste praksis og SEO er 100 på alle tre.
2. Vekt ved første lasting: syntaxstudio 10,52 MB, drift 0,13 MB, redesign 0,16 MB. Hero-videoen `hero/reel.mp4` alene er 10,12 MB (10 120 KB).
3. Vekt etter rulling gjennom hele siden: syntaxstudio 21,4 MB (77 forespørsler, seks mp4-filer: reel 10 120 KB, film 4 083 KB, foto-puma 3 033 KB, brasil 2 962 KB, kombo 465 KB, burgertesten 0 KB lastet). Drift 1,94 MB (12). Redesign 2,01 MB (9).
4. JS: syntaxstudio 20 filer, 202 KB overført, 609 KB utpakket. Drift 4 filer, 10,9 KB overført, 26,2 KB utpakket. Redesign 1 fil, 3,7 KB overført (2,4 KB utpakket).
5. CSS: syntaxstudio 1 fil, 12,6 KB overført (63,9 KB utpakket). Drift og redesign har ingen CSS-fil (inline i HTML).
6. Fonter: begge 2 woff2-filer. Syntaxstudio 131 KB, drift 77 KB, redesign 108 KB. Syntaxstudio: Mona Sans (variabel) og Archivo. Drift: Schibsted Grotesk og JetBrains Mono.
7. Forespørsler ved load: syntaxstudio 38, drift 11, redesign 8. Tredjepartsverter: ingen på noen av de tre (én vert hver).
8. Cookies satt før samtykke: ingen på noen av de tre. Syntaxstudio viste ikke samtykkebanner. Det gjør nettsidebyra, kodestudio og nettsmed.

**Innhold og oppbygning (fra bildene)**
9. Syntaxstudio første skjerm (desktop): fullbredde hero-video, overskrift «VI BYGGER BRANDS.», to knapper. Drift første skjerm: lys flate, overskrift, terminalvindu, pris, to handlinger. Redesign første skjerm: lys flate, overskrift «Gratis befaring av nettsiden din», skjema med ett felt, ett tekstlenke. Ingen bilde eller video på første skjerm i redesign.
10. Syntaxstudio viser faktiske kundebilder og -videoer, logoer til åtte kunder (Puma, Snatched, Jønk, Svart Humor og fire til), kundesitater og tre teammedlemmer med portrett. I bildene jeg har sett av drift og redesign er det ingen kundelogoer og ingen portretter (redesign har en plassholder for portrett). Ikke alle rulleruter er gjennomgått for drift.
11. **Redesign inneholder synlige plassholdere i bygget.** `dist/client/index.html` har 12 forekomster av «MANGLER», blant annet «MANGLER: skjermopptak» (3 ganger, som svarte bokser i bildene), «MANGLER: navn på app nummer én/to, fra eier», «MANGLER: portrett av eier – ekte foto, ikke KI», «MANGLER: målt ytelsestall for kodekonsulentene.no» og «MANGLER: brukertall, dokumentert av eier». Se `kodekonsulentene-redesign/kontaktark-rulling-2.png`.
12. Redesign-navigasjonen vises i bildene som lenker i standard blå farge med understreking (`samlet/desktop-overfolden-alle.png`, rute 2). Drift og syntaxstudio har stilt navigasjon.
13. Redesign har bildetekster «Illustrasjon laget med KI» under to bilder (rulling y 2800–3200 og pris-seksjonen).

**Bevegelse**
14. Syntaxstudio åpner med en introskjerm på ca. 2,2 s: svart flate, logoen «syntax» tegnes bokstav for bokstav, to fargede paneler feier over (lilla og svart), så vises hero-videoen. Hero-overskriften er på plass ved ca. 2250–2500 ms. Drift åpner med en mørk skjerm med to tall (72 % og 58 %, teller opp) i ca. 1,5 s før forsiden vises. Redesign har ingen introskjerm. Første bilde (0 ms) viser navigasjon og skjema uten overskrift, og overskriften er på plass ved 273 ms.
15. Syntaxstudio bruker Lenis (jevn rulling): `window.lenis` finnes, `<html class="... lenis">`. Drift og redesign har ingen rullebibliotek (ingen globale `Lenis`, `gsap`, `ScrollTrigger`).
16. Redesign sin sentrale scene (rulling y ca. 800 til 3200) er en video som styres av rulleposisjonen. `video.paused` er `true` hele tiden, og `currentTime` er 0 ved y=800, 2,53 s ved y=1600, 5,19 s ved y=2400, 5,99 s ved y=3200 (videoen er 6 s). Syntaxstudio og drift spiller av video med `loop`: syntaxstudio `hero/reel.mp4` (20 s), `hero/film.mp4` (21,8 s) og flere `services/*` og `films/*`. De pauses når de er utenfor skjermen (`reel.mp4` `paused: true` fra y=1600). Drift `scener/floke-1920.mp4` (5,4 s) spiller i løkke.
17. Antall elementer med CSS-hover/fokusendring av 8 testede over folden (computed style endret etter 450 ms hover): syntaxstudio 6, drift 6, redesign **0**. Syntaxstudio har `transition-duration` 0,15–0,2 s på navigasjon og knapper. Redesign: ingen endring målt på navigasjonslenkene.
18. Antall `@keyframes`: syntaxstudio 7, drift 20, redesign 0. Redesign registrerte to transisjoner (`.loft__skyv` transform 560 ms og video-opacity 300 ms).

## 4. Per side

Alle stier er relative til `/Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web/.skudd/sammenligning/<side>/`. Hver mappe har: `desktop-overfolden.png`, `desktop-helside.png`, `mobil-overfolden.png`, `mobil-helside.png`, `kontaktark-laste-3s.png` (13 bilder), `kontaktark-rulling-N.png` (12 bilder per ark, hver 400 px), enkeltbilder i `laste-3s/` og `rulling/`, `maaling.json` (all rådata) og `lighthouse-mobil.json`. Samlearkene ligger i `samlet/`: `desktop-overfolden-alle.png` og `mobil-overfolden-alle.png`.

### 4.1 kodekonsulentene-drift (https://kodekonsulentene.no/)

- **Stack:** Astro. Bevis: `<script type="module" src="/_astro/page.CMFgH77u.js">` i HTML-kilden. Ingen `generator`-meta. Ingen globale bibliotek. Header `server: Fly/781f3a6652 (2026-11-10)`, `fly-request-id` (Fly.io). Mønstertreff for gsap, lenis, three, lottie, swiper, tailwind, react: ingen.
- **Fonter:** Schibsted Grotesk (700, 800), JetBrains Mono (400, 600).
- **Kontaktark:** `kontaktark-laste-3s.png`, `kontaktark-rulling-1.png` til `-3.png`.
- **Animasjoner (20 `@keyframes`, 4 transisjonsmål, 13 JS-stilelementer):**

| Hva | Utløser | Varighet |
|---|---|---|
| Åpningsskjerm: mørk flate, to tall 72 % og 58 % teller opp, grønn strek tegnes, så tones skjermen bort (`apning-inn`, `apning-strek`, `apning-bort`) | Lasting | `apning-bort` 1500 ms, strek 1150 ms. Sett i bildene fra 251 til ca. 1500 ms. |
| Pulserende «live»-prikk (`hero-puls`) | Lasting, uendelig | 2400 ms |
| Blinkende markør i terminalen (`kk-blink`) | Lasting, uendelig | 1000 ms |
| Overskrift og kort tones inn ord for ord (`avslor-inn`, `avslor-ord`, `rett-seg-opp`, `mega-ord`) | Rulling | Ikke tidtatt. Registrert med varighet 1 ms i `getAnimations()`, noe som tyder på rullestyrt animasjon (ikke verifisert) |
| Nøkkeltall teller opp: 6/6, 0, 0,1 s, 23 t (`nokkeltall-maaler`) | Rulling. Sett: «0,0 s / 0 t» ved y 400, «0,1 s / 23 t» ved y 800. | Ikke tidtatt |
| Flytdiagram «Fra booking til regnskap»: streker tegnes, glimt og sirkler beveger seg langs linjene (`flyt-tegnes`, `flyt-tones-inn`, `flyt-glimt`, `flyt-reiser`, `flyt-tennes`, `flyt-kvittering`) | Rulling (tegning), deretter uendelig sløyfe | Sløyfe 7200 ms |
| Prosess: streker og numre (`steg-strek`, `steg-nr`), `scene-strek`, `slep-puls` | Rulling | Ikke tidtatt |
| «Fem systemer. Én kjede.»: plater stables, kolonner vokser (transisjoner på `.slep__flate` grid-template-columns 420 ms, `.stabel__plate` 120 ms) | Rulling | 120–420 ms |
| Video `floke-1920.mp4` (1,85 MB, 5,4 s) spilles i løkke | Rulling (lastes først når den nærmer seg skjermen) | Løkke |

### 4.2 kodekonsulentene-redesign (http://127.0.0.1:4410/, gren redesign/befaring)

- **Stack:** Astro. Bevis: `<script type="module" src="/_astro/page.CMFgH77u.js">` (samme filnavn som i drift). Serveren er `server.mjs` (Node). Ingen `x-powered-by` eller `server`-header. Ingen mønstertreff for gsap, lenis, three, tailwind, react. Se begrensning om `package.json` overfor.
- **Fonter:** 2 woff2-filer, 108 KB.
- **Kontaktark:** `kontaktark-laste-3s.png`, `kontaktark-rulling-1.png` til `-3.png`.
- **Animasjoner (0 `@keyframes`, 2 transisjonsmål, 9 JS-stilelementer):**

| Hva | Utløser | Varighet |
|---|---|---|
| Overskrift «Gratis befaring av nettsiden din» er synlig fra 273 ms. Ikke synlig ved 0 ms (første bilde). Ingen CSS-animasjon registrert på `h1`. | Lasting | Ikke målt |
| Scene med eksplodert lagdelt maskinvare: lagene skilles og kablene løftes mens du ruller. Det er en video som styres av rulleposisjon (`currentTime` 0 → 5,99 s over y 800 → 3200). | Rulling | Ca. 2400 px rulling |
| Bildetekster («Dette er nettsiden din», «Jeg tar den fra hverandre», «Hvert lag blir målt») byttes ut under scenen (sett i `kontaktark-rulling-1.png`, y 1200–2800). `.loft__skyv` har `transform`-transisjon. | Rulling | 560 ms |
| Videoen tones inn (`opacity` 300 ms) | Rulling, når scenen nærmer seg | 300 ms |
| Befaringsrapport-kortet: sett ved y 3200–4000 med tall og små streker som peker mot verdier. Det er ikke registrert noen animasjon der. | | |
| Pris-valg (radioknapper, «Start» markert) | Peker/klikk. Ikke testet. | |

Hover over de 8 første lenkene og knappene over folden ga ingen endring i computed style.

### 4.3 syntaxstudio (https://www.syntaxstudio.no/)

- **Stack:** Next.js med Turbopack, React 19, Tailwind, Lenis, hostet på Vercel. Bevis:
  - Next.js: `<link href="/_next/static/immutable/chunks/1rjmo067b-u6l.css">`, `_next/static/immutable/media/*.woff2`, `x-powered-by: Next.js`, `turbopack-3h_ctkfaeun7f.js`.
  - Vercel: `server: Vercel`, `x-vercel-id: arn1::iad1::…`.
  - React 19: `react-dom@19.3.0` og `react@19.3.0` i modulsti i `chunks/3l8rz-4ll-4_-.js`.
  - Tailwind: `--tw-translate-x:0;--tw-translate-y:0` i `chunks/1rjmo067b-u6l.css`.
  - Lenis: `window.lenis` er definert, `<html class="… lenis">`, CSS `html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth`, `window.lenisVersion` i `chunks/1t0kwor149ghf.js`.
  - Ikke funnet: gsap, ScrollTrigger, framer-motion, three.js, locomotive, barba, swup, splitting, lottie, rive, swiper, embla (ingen treff i HTML, 20 JS-filer eller CSS).
  - Analyse: `/55ce07e4ae10c0ca/script.js` (egen vert, 2,4 KB). Cookies før samtykke: ingen.
- **Fonter:** Mona Sans (variabel 200–900) og Archivo (variabel 100–900).
- **Kontaktark:** `kontaktark-laste-3s.png`, `kontaktark-rulling-1.png`, `kontaktark-rulling-2.png`.
- **Animasjoner (7 `@keyframes`, 2 transisjonsmål, Lenis, 3 klasseendringer, 6 videoer). Sett i bildene:**

| Hva | Utløser | Varighet |
|---|---|---|
| Introskjerm: svart, logoen «syntax» tegnes bokstav for bokstav (`intro-letter`, 1300 ms). Lilla og svart panel feier over (`intro-wipe`, 850 ms hver). Skjermen tones bort (`intro-done`). | Lasting | Sett fra 250 ms til ca. 2250 ms |
| Hero-overskrift «VI BYGGER BRANDS.» stiger inn (`rise`, 1100 ms). Faner/knapper (`tab-in`, 350 ms). | Lasting, etter intro | 1100 ms / 350 ms |
| Hero-video (`reel.mp4`, 20 s, 10 MB) spiller i løkke bak overskriften. Innholdet bytter mellom 2251 og 2501 ms (mann i hvit jakke → fjell). | Lasting | Løkke, pauses utenfor skjerm |
| Fast header: kantfarge og forskyvning endres (300 ms) | Rulling | 300 ms |
| Tekstlinjer i seksjonsoverskrifter glir opp (`.reveal-inner` transform, 1100 ms) | Rulling | 1100 ms |
| Tjenestekort («Film», «Foto & design», «Nettsider», «Strategi og identitet», «Sosiale medier», «Annonsering») rulles inn med bilder og video. Hvert kort har prikker under bildene. | Rulling | Ikke tidtatt |
| Nettsider-kortet: nettsidebilde rulles innvendig (`page-scroll`, 5200 ms) | Rulling | 5200 ms |
| Teamkort svinger (`team-sway`, uendelig). Teksten «Snu et kort for å ta kontakt direkte» står over. | Rulling, deretter uendelig | 7000 ms |
| Jevn rulling (Lenis) på hele siden | Rulling | Hele siden |
| Hover på navigasjon og knapper | Peker | 150–200 ms |

### 4.4 nettsidebyra (https://nettsidebyra.no/)

- **Stack:** Vite + React + Tailwind. framer-motion er sannsynlig. Bevis: `<script type="module" crossorigin src="/assets/index-Bv14IprH.js">` (Vite-mønster), `--tw-translate-x` i `assets/index-Dupqtrm_.css`, `__reactFiber$` / `__reactProps$` i `index-Bv14IprH.js`, `data-framer-portal-id` og `latestValues`/`projection` i `assets/Portfolio-psbC14YK.js` (framer-motion-kode). Hosting: `server: Vercel`, `x-vercel-id`. Ingen gsap eller lenis.
- **Fonter:** Inter (400, 600) og Plus Jakarta Sans (600, 800).
- **Kontaktark:** `kontaktark-laste-3s.png`, `kontaktark-rulling-1.png` og `-2.png`.
- **Animasjoner (0 `@keyframes`, 6 transisjonsmål, 12 JS-stilelementer). Sett i `kontaktark-laste-3s.png`:**

| Hva | Utløser | Varighet |
|---|---|---|
| Nettleser-mockup i hero tones og skaleres inn (`hero-reveal`: filter, opacity, transform) | Lasting | 500 ms (sett ca. 450–1000 ms) |
| Mobil-mockup glir inn (`hero-phone`) | Lasting | 500 ms (sett ca. 1750–2750 ms) |
| Fire «chips» («SEO 100/100», «Live på 7 dager», «Mobil 99/100», «Beste praksis 100/100») tones inn | Lasting | 500 ms |
| Samtykkebanner dukker opp i bunn (ca. 1500 ms) | Lasting | Ikke målt |
| Hover på navigasjon | Peker | 150 ms |

Rulleanimasjoner er ikke vurdert i bildene.

### 4.5 kodestudio (https://kodestudio.no/ → https://www.kodestudio.no/en i Lighthouse)

- **Stack:** Next.js, React, Tailwind, Vercel. Bevis: `/_next/static/immutable/media/e41d5df559864f9e-s.p.2rlzm4mj5kw8e.woff2`, `createRoot(…).render` i `_next/static/immutable/chunks/0a…js`, `--tw-border-spacing-x` i CSS, `server: Vercel`. Samtykketekst nevner Vercel Web Analytics. To `<canvas>`-elementer i DOM. Ingen three.js-, gsap- eller lenis-treff.
- **Fonter:** 3 woff2, 84 KB.
- **Kontaktark:** `kontaktark-laste-3s.png`, `kontaktark-rulling-1.png` til `-3.png`.
- **Animasjoner (3 `@keyframes`, 11 transisjonsmål, 6 JS-stilelementer, 12 klasseendringer):**

| Hva | Utløser | Varighet |
|---|---|---|
| Overskrift, ingress, knapper og pil `fade-in` | Lasting (ca. 657 ms) | 220 ms |
| Skisse av nettleservindu i hero tegnes opp linje for linje (sett i bildene 657–4339 ms) | Lasting | Minst 3,7 s. Ikke registrert som CSS-animasjon, så trolig JS eller SVG. |
| Pil i hero hopper (`bounce`) og lys prikk pulserer (`pulse`) | Lasting, uendelig | 1000 ms / 2000 ms |
| Header endrer bakgrunn, kant, radius, skygge ved rulling (`transition-all` 500 ms) | Rulling | 500 ms |
| Sitat og kort tones inn (`opacity`/`transform` 300 ms) | Rulling | 300 ms |
| Hover på navigasjon | Peker | 300 ms |

### 4.6 nettsmed (https://nettsmed.no/)

- **Stack:** Next.js, React, Tailwind, Vercel, Google Tag Manager. Bevis: `<link rel="preload" href="/_next/static/immutable/media/DMSans_latin_opsz_wght.p.2gfybca7pr7aj.woff2">`, `createRoot(…).render` i `chunks/31iqd297…js`, `--tw-rotate-x:initial` i CSS, `https://www.googletagmanager.com/gtm.js?id=GTM-TF2PPZQ` i `chunks/3w7wl4c4…js`, `window.dataLayer` og `window.gtag` finnes, `server: Vercel`. Samtykkebanner med «Godta» og «Avslå».
- **Fonter:** DM Sans (variabel), 1 fil, 55 KB.
- **Kontaktark:** `kontaktark-laste-3s.png`, `kontaktark-rulling-1.png` til `-3.png`.
- **Animasjoner (17 `@keyframes`, 11 transisjonsmål, 5 JS-stilelementer, 22 klasseendringer). Sett i `kontaktark-laste-3s.png`:**

| Hva | Utløser | Varighet |
|---|---|---|
| Prisestimat-kortet bygges opp: rader fylles og summen vokser (sett 0–2750 ms; `lvTegn`, `lvFyllX`, `pzVokse`, `up`) | Lasting | Opptil 6500 ms (`lvFyllX`) |
| Portrettbildet tones inn mellom 0 og 250 ms | Lasting | Ikke målt |
| Glimt over navigasjonslinjen og logomerket (`shimmer`, `shimmerMark`) | Lasting, uendelig | 3000 ms |
| Tegnet bakgrunnsmønster flyter (`lvVugg`, `lvDrift`) | Lasting, uendelig | 30 000 ms / 108 000 ms |
| Chat-felt nederst («Søk, eller still et spørsmål») med blinkende markør (`nsk-faq-blink`) og gnist (`nsk-gnist`) | Lasting, uendelig | 1050 ms / 3400 ms |
| Dokket element nederst endrer størrelse (`nsk-dock` width/height/transform 340 ms, `nsk-dokk-hint` 1300 ms) | Rulling | 340 / 1300 ms |
| Stolper vokser (`grow` 800 ms, `knFyll` 5500 ms) | Rulling | 800 / 5500 ms |
| Header-skygge ved rulling | Rulling | 200 ms |
| Hover på navigasjon | Peker | 150 ms |

### 4.7 nettbyra (https://nettbyra.no/)

- **Stack:** Next.js, React, Tailwind, Cloudflare. Bevis: `/_next/static/media/0c8f209abc35ee02-s.p.03rqv30url-~q.woff2`, `__reactFiber$` i `_next/static/chunks/07lhk_q6pmm3r.js`, `--tw-translate-x` i `chunks/17dvy.77ino6k.css`, `server: cloudflare`. Ingen gsap eller lenis.
- **Fonter:** Inter (400–700), 2 filer, 66 KB.
- **Kontaktark:** `kontaktark-laste-3s.png`, `kontaktark-rulling-1.png`.
- **Animasjoner (7 `@keyframes`, ingen transisjonsmål i testen, 0 JS-stilelementer). Fra `getAnimations()`, ikke vurdert i bildene:**

| Hva | Utløser | Varighet |
|---|---|---|
| `aurora-breathe`, `gradient-shift`, `diamond-float`, `diamond-float-slow`, `bounce`, `step-pulse` | Lasting/rulling, uendelig (alle 6 har `iterations: Infinity`) | Ikke notert |
| `revealUp` | Rulling | Ikke notert |

Hover: 7 av 8 testede elementer endret computed style.

### 4.8 appfabrikken (https://appfabrikken.no/), ikke aktiv

- **Stack:** Ingen rammeverk funnet i HTML, 3 JS-filer eller CSS. Bevis for hosting: `server: cloudflare`, `x-powered-by: Express`, `cf-ray`. `window._hsq` (HubSpot) og `window.dataLayer` finnes. Eksterne verter: `fonts.googleapis.com`, `fonts.gstatic.com`, `d130aqu9paj906.cloudfront.net`, `assets.appfabrikken.no`, `analyse.appfabrikken.no`, `openfpcdn.io`. Cookies før samtykke: `af3`, `af3_insecure` (appfabrikken.no).
- **Kontaktark:** `kontaktark-laste-3s.png`, `kontaktark-rulling-1.png` (siden er 2 441 px høy).
- **Animasjoner:** 2 `background-color`-transisjoner (300 ms) på navigasjonsfeltet ved rulling. Ingen `@keyframes`.
- **Innhold:** Første skjerm sier at de ikke lenger tar oppdrag for skreddersydd apputvikling og viser logoen til infohub.no.

## 5. Åpne punkter

1. Redesign er ikke målt i drift. Kjør Lighthouse mot preview-URL eller drift når grenen er publisert, og kjør minst tre ganger.
2. Syntaxstudio kan ha ulike resultater ved gjentatte kjøringer. Lighthouse ytelse 78 er fra én kjøring.
3. Animasjonene på nettsidebyra, kodestudio, nettsmed og nettbyra er bare vurdert for de første 3 sekundene. Rulleanimasjonene er hentet fra `getAnimations()`, ikke sett.
4. Pekerutløste effekter er bare testet som computed-style-endring på 8 elementer over folden. Egne pekerfølgende effekter (egendefinert markør) er ikke testet.
5. Mobil Lighthouse for redesign ble kjørt mot `127.0.0.1`. Mobil-skjermbildene er i `mobil-overfolden.png` og `mobil-helside.png` i hver mappe.
