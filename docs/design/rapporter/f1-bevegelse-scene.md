# Rapport: f1-bevegelse-scene

## Hva som er gjort

- `src/components/bevegelse/Scene.astro`: referansekoden fra briefens del 8, ordrett. Ingen avvik i komponenten.
- `public/scener/test/`: testvideoer laget med ffmpeg – `test-1080` (1920×1080) og `test-mobil` (1080×1920), 6,0 s, mp4 (H.264) og webm (VP9), nøkkelramme hver 8. ramme (verifisert med ffprobe: K-rammer ved 0,000/0,333/0,667 s ved 24 fps), innbrent tidskode for å verifisere spoling. Postere `poster.avif` og `poster-mobil.avif` (første ramme, libaom-av1).
- `tests/bevegelse/`: egen Playwright-oppsett (`playwright.config.ts`), statisk testserver med Range-støtte på port 4330 (`server.mjs`), sidegenerator (`lag-testside.mjs`) og 12 tester (`scene.spec.ts`). Serveren ble kontrollert med curl: `206` på `Range: bytes=0-99`. Serveren er stoppet.
- `docs/design/bevegelse.md`: kontrakten for Scene (egenskaper, filkrav, eksempel, uten JavaScript, redusert bevegelse/Save-Data, tilgjengelighet).

## Testoppsettets konstruksjon

Kortet forbyr build, og jeg eier ingen side i `src/pages/`. Testsiden genereres derfor av `lag-testside.mjs`: skriptet og stilene trekkes **ordrett** ut av `Scene.astro` ved kjøring (endres komponenten, testes den nye koden), mens template-markupen speiles for hånd for eksempel-propsene. Endres markupen i komponenten, må generatoren oppdateres – notert i generatorens filhode.

## Målt

- Tester: **12 av 12 grønne** (`npx playwright test --config tests/bevegelse/playwright.config.ts`). Dekker: 206 på Range, halvveis rulling = halvveis video (±0,2 s), gradvis åpning (`--apning` 0 → 0,417 → 1 og `clip-path: inset` når lukket), baklengs rulling spoler tilbake, bunn = slutt (5,95 s av 6 s), mobil får 9:16-fila (videoWidth/Height = 1080×1920 beviser dekoding), redusert bevegelse laster ingen video (0 nettverkskall mot mp4/webm), uten JavaScript leses alle 4 steg, første Tab treffer hopp-lenken, ingen vannrett rulling på mobil ved 4 rulleposisjoner, ingen konsoll-/sidefeil gjennom hele rullingen.
- Egen JavaScript: komponentskriptet er **1,1 kB gzip** urørt (2 509 B rå), 0,8 kB gzip minifisert. Langt under taket på 20 kB.
- Filmstriper: `.design/arbeid/bevegelse/filmstripe-desktop/` og `filmstripe-mobil/` (8 bilder + opptak.webm hver), sett gjennom i rekkefølge. Rute 0 viser scenen lukket (avrundet kort, tid 0), rutene videre viser full bredde og tidskode som følger rullingen (5,917 s nederst = målet 5,95 s), siste rute viser utrulling til innholdet etter. Bevegelsen forklarer framdrift: hvor du er i gjennomgangen.

## Avvik

- Testen «mobil får 9:16-fila» godtar både webm og mp4. Briefen (del 8) sier Playwrights Chromium ikke spiller H.264, men Chromium i Playwright 1.63 gjør det (`canPlayType` gir ikke tom streng lenger; målt i testen – komponenten valgte mp4 og dekodet den). Kontrollens poeng – at mobil får `-mobil`-fila – testes fortsatt strengt, pluss faktisk dekoding via videoWidth/Height. webm-filene beholdes; produksjon trenger dem for andre nettlesere.
- Skillene `emil-design-eng`, `find-animation-opportunities` og `review-animations` finnes ikke i oppsettet. Selvkontrollen er gjort manuelt (filmstriper + testene). GSAP-skills er ikke relevante – scenen bruker ikke GSAP.

## Oppfølging (revisors tre funn, docs/design/rapporter/f1-revisor-maaling.md)

1. **Videolasting:** Videoen lastes nå først når begge vilkår er oppfylt: IntersectionObserver (150 % av vinduet) **og** brukerens første rulleintensjon (scroll/wheel/touchstart/keydown, lytterne fjernes etter første treff). En scene øverst henter null videobytes i første innlasting – verifisert av ny test som teller mp4/webm-rekvester (0 før, >0 etter første musehjul). Redusert bevegelse/Save-Data laster fortsatt ingenting.
2. **CLS:** Scenen aktiveres av et lite inline-skript (`<script is:inline>` i komponenten) som kjører synkront under parsing, før første opptegning – sticky-oppsettet står dermed fra start og flytter aldri innhold. Valgt framfor min-height-reservasjon fordi det gir identisk layout før og etter aktivering uansett steghøyde. Ny test måler `layout-shift` via PerformanceObserver: **CLS 0,000** (krav < 0,01).
3. **Bakgrunn:** Ny prop `bakgrunn` (default `#080809`, målt i de ekte klippene) satt som `--scene-bakgrunn` på seksjonen og brukt av flaten. Dokumentert i docs/design/bevegelse.md.

Avvik fra referansekoden i del 8 er dermed: inline-aktiveringsskriptet, intensjonsvilkåret i lastingen, og `bakgrunn`-prop – alle pålagt av oppfølgingen. Resten står ordrett.

**Målt etter oppfølgingen:** 15 av 15 tester grønne (3 nye: ingen videorekvest før rulleintensjon, CLS < 0,01, bakgrunn `rgb(8, 8, 9)`). Egen JavaScript (inline + modul): **1,5 kB gzip** (3 639 B rå). Filmstriper mot de ekte klippene i `public/scener/hero/` (`SCENE_NAVN=hero`): `.design/arbeid/bevegelse/filmstripe-hero-desktop/` og `filmstripe-hero-mobil/`, sett gjennom – hvit tekst over nesten svart klippbakgrunn er godt lesbar på desktop; på mobil krysser brødteksten i steg 2 glassplaten i ett klipp (lys flate) – kontrastmåling mot ekte klipp står fortsatt som åpent punkt for revisor/kritiker. Flate og klipp er sømløse med `#080809`. Testserveren svarte 206 på Range og er stoppet.

## Åpne punkter

1. **iOS er ikke testet** – komponentens touchstart-opplåsing må prøves på ekte iPhone (står også i briefen).
2. Tekstkontrast over video (krav ≥ 4,5:1) kan først måles mot de ekte klippene fra `produsent`; testmønsteret er med vilje grelt. Mørke klipp (som `#0b0d10`-flaten) er en forutsetning – ellers trengs en tekstplate.
3. Fargene i komponenten er briefens referanseverdier og skal byttes til tokens når designsystem v2 finnes.
4. Testsiden speiler komponentens markup for hånd (skript/stil trekkes ut ordrett); når `bygger` setter Scene på en ekte side, bør revisor kjøre de samme kontrollene mot den Astro-rendrede siden.
5. Produksjonsserveren (`server.mjs` i rota) må kontrolleres for 206 på Range før scener settes i drift – kun testserveren er verifisert her.
