# f1-revisor-maaling: retning A, B og C, 2026-10-08

Bygget (`npm run build`) og servert med `server.mjs` på port 4331 (samme server som i drift, med sikkerhetsheadere). Stoppet etter målingen. Lighthouse 13.5.0 mobil (simulert struping), tre kjøringer, median. Playwright/Chromium og axe 4.13 (wcag2a/aa, 21a/aa, 22aa) i mobil 390x844 og desktop 1440x900, lyst og mørkt, med og uten redusert bevegelse. Rådata og bilder: `.design/maaling-retninger/`, skript i `.design/arbeid/revisor-maaling/`. Videoen er testklippet (SMPTE-striper) i `public/scener/test/`, ikke ekte hero-klipp. Skills `accessibility-review`, `wai-testing`, `core-web-vitals`, `performance`, `accessibility`, `seo`, `break-ui` ble ikke lastet (finnes ikke under disse navnene).

## Retning A (`/retning/a`)
| Krav | Grense | Målt | Bestått |
|---|---|---|---|
| Lighthouse ytelse, tilgj., beste praksis | ≥ 95 | 100 (99/100/100), 100, 100 | ja |
| Lighthouse SEO | ≥ 95 | 66, eneste feil `is-crawlable` (noindex, påbudt på prototyper) | nei |
| LCP / CLS / TBT | ≤ 2,5 s / < 0,1 / (INP: ikke målt) | 1,43 s / 0,052 (0,052/0,052/0) / 0 ms (74/0/0). CLS kommer fra `ol.scene__tekst` | ja |
| Vekt første innlasting | ≤ 700 kB | 2 890 kB mobil, 2 726 kB desktop (LH 2 893 KiB). Video 2 782 kB hentes ved innlasting. Uten video 109 kB | nei |
| Egen JS gzip, fontfamilier | ≤ 20 kB uten GSAP, maks 2 | 1,09 kB ekstern + 0,75 kB inline = 1,8 kB; 1 familie (Schibsted Grotesk) | ja |
| WCAG-test automatisk | 0 brudd | 0 i mørkt og med redusert bevegelse. Lyst tema med bevegelse: `color-contrast`, 8 elementer, scenetekst #e9ecef (mot lyseste bakgrunn 1,02–1,19:1). Bekreftet med axe midt i scenen (6 treff) | nei |
| Tastatur, første skjerm og scene | rekkefølge, hopp-lenke, synlig fokus | Rekkefølge logo, meny, felt, knapp, booklenke, hopp-lenke (stopp 6 mobil, 12 desktop). Ring 2 px (ringfargens kontrast ikke målt), aldri dekket. Enter gir `#rapport` i syne, neste Tab går til «Book 20 minutter» | ja |
| Kontrast tekst over video, tre ruter | ≥ 4,5:1 mot lyseste punkt | Mobil 1,02 / 1,11 / 1,02. Desktop 1,19 / 1,19 / 1,19. Mot mørkeste punkt 7,4–9,8 | nei |
| 3.-part, cookies, headere, CSP | 0 / 0 / 6 av 6 / `media-src 'self'` | Bare 127.0.0.1:4331. 0 cookies, tom localStorage. 6/6. CSP har `media-src 'self'` | ja |
| Video: 206, mp4+webm, lazy, ikke LCP | 206, begge formater, ikke før nær skjermen, ikke LCP | 206 på alle fire filer, mp4 og webm finnes. Hentes ved innlasting fordi scenen starter 64 px under folden (innenfor 150 %-marginen). LCP-element er H1 | ja |
| Scene-tester `tests/bevegelse/` | grønne | 12 av 12 (kjøres mot generert testside, ikke mot retningssiden). På siden selv: framdrift 0,334 gir 1,98 s, 1,0 gir 5,94 s, 0 konsollmeldinger | ja |
| Redusert bevegelse, uten JS | all tekst og alle overskrifter | 6 av 6 overskrifter og alle 119 ord likt, `video.src` null, ingen vannrett rulling | ja |
| Lange oppgaver, 4x CPU, rulling | info (ingen grense i del 12) | 0 oppgaver over 50 ms, lengste 0 ms, tre kjøringer | ja |

## Retning B (`/retning/b`)
| Krav | Grense | Målt | Bestått |
|---|---|---|---|
| Lighthouse ytelse, tilgj., beste praksis | ≥ 95 | 100, 100, 100 | ja |
| Lighthouse SEO | ≥ 95 | 66, eneste feil `is-crawlable` (noindex) | nei |
| LCP / CLS / TBT | ≤ 2,5 s / < 0,1 / (INP: ikke målt) | 1,50 s / 0 / 0 ms | ja |
| Vekt første innlasting | ≤ 700 kB | 2 883 kB mobil, 2 719 kB desktop (LH 2 886 KiB). Video 2 782 kB. Uten video 101 kB | nei |
| Egen JS gzip, fontfamilier | ≤ 20 kB, maks 2 | 1,09 + 0,92 = 2,0 kB; 1 familie | ja |
| WCAG-test automatisk | 0 brudd | 0 brudd i alle 16 kombinasjoner, også midt i scenen | ja |
| Tastatur, første skjerm og scene | som over | Hopp-lenke er stopp 9 (etter logo og 7 menylenker). Ring 2 px, aldri dekket. Enter gir `#sjekk` i syne. Adressefeltet er stopp 11 | ja |
| Kontrast tekst over video, tre ruter | ≥ 4,5:1 | 13,03:1 i alle ruter og profiler (tekst ligger på plate, ikke på video) | ja |
| 3.-part, cookies, headere, CSP | som over | Bare eget domene. 0 cookies. 6/6. `media-src 'self'`. Booklenken går til cal.com som lenke, ikke som kall | ja |
| Video: 206, mp4+webm, lazy, ikke LCP | som over | 206, begge formater. Hentes ved innlasting (scenen 0,61–0,68 skjermhøyder under folden). LCP-element er `poster.avif`, ikke video | ja |
| Scene-tester | grønne | 12 av 12. På siden: 0,334 gir 1,98 s, 1,0 gir 5,95 s, 0 konsollmeldinger | ja |
| Redusert bevegelse, uten JS | all tekst | 6 av 6 overskrifter og alle 107 ord likt | ja |
| Lange oppgaver, 4x CPU | info | 0 over 50 ms, lengste 0 ms | ja |

## Retning C (`/retning/c`)
| Krav | Grense | Målt | Bestått |
|---|---|---|---|
| Lighthouse ytelse, tilgj., beste praksis | ≥ 95 | 100, 100, 100 | ja |
| Lighthouse SEO | ≥ 95 | 63, eneste feil `is-crawlable` (noindex) | nei |
| LCP / CLS / TBT | ≤ 2,5 s / < 0,1 / (INP: ikke målt) | 1,28 s / 0 / 0 ms | ja |
| Vekt første innlasting | ≤ 700 kB | Mobil 95 kB (LH 98 KiB, video ikke hentet). Desktop 2 713 kB (video 2 618 kB hentes ved innlasting; scenen 0,99 skjermhøyder under folden) | nei |
| Egen JS gzip, fontfamilier | ≤ 20 kB, maks 2 | 1,09 + 0,95 = 2,0 kB; 1 familie | ja |
| WCAG-test automatisk | 0 brudd | Som A: 0 i mørkt og redusert bevegelse. Lyst tema med bevegelse: `color-contrast`, 8 elementer, scenetekst #e9ecef (1,01–1,19:1). Bekreftet midt i scenen (6 treff) | nei |
| Tastatur, første skjerm og scene | som over | Første stopp er «Til innholdet»; «Hopp over animasjonen» er stopp 7 mobil, 13 desktop. Ring 3 px, aldri dekket. Radiovalg 24x24 px. Enter gir `#arbeid` i syne | ja |
| Kontrast tekst over video, tre ruter | ≥ 4,5:1 | Mobil 1,02 / 1,01 / 1,02. Desktop 1,19 / 1,19 / 1,19. Mot mørkeste punkt 7,1–9,8 | nei |
| 3.-part, cookies, headere, CSP | som over | Bare eget domene. 0 cookies. 6/6. `media-src 'self'` | ja |
| Video: 206, mp4+webm, lazy, ikke LCP | som over | 206, begge formater. Mobil: hentes først ved rulling 300 px (scenen 1,45 skjermhøyder unna). LCP-element er avsnittet `.hero__prisenhet` | ja |
| Scene-tester | grønne | 12 av 12. På siden: 0,379 gir 2,25 s, 1,0 gir 5,95 s, 0 konsollmeldinger | ja |
| Redusert bevegelse, uten JS | all tekst | 9 av 9 overskrifter og alle 174 ord likt | ja |
| Lange oppgaver, 4x CPU | info | 0 over 50 ms, lengste 0 ms | ja |

## Merknader og ikke målt
- Kontrollen av lange oppgaver er verifisert: en 80 ms-oppgave lagt inn med vilje ble registrert. Rulling med musehjul (30 px per 16 ms), ikke ekte fingerfling. INP: ikke målt, krever ekte brukere.
- A og C får tekstkontrast 1,0–1,2:1 mot testklippet. Det sier hva ekte klipp må tåle (mørke klipp eller en tekstplate som i B), ikke hvordan hero-klippene blir.
- Vekt: målt én gang med Playwright og kontrollert mot Lighthouse (kjøring 1); ikke gjentatt tre ganger. Tallene med video er reelle for A, B og C desktop, fordi Scene henter filen når den er innen 150 % av vinduet.
- Ikke målt (utenfor kortet): URL-liste, oppløsning på `public/`, ekte iPhone/Android. Scene-testene dekker ikke retningssidene selv og kjører bare én desktopprofil. Bivirkning: testgeneratoren skrev til `.design/arbeid/bevegelse/side/`, og `dist/` er bygget på nytt.
