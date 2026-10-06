# Animasjonsbibliotek på GitHub – vurdering

Målt 6. oktober 2026 mot repoets daværende tilstand. Alle størrelser er egne
målinger, ikke tall fra README eller bundlephobia.

## Konklusjon

**Ingen av kandidatene bør tas inn.** Vi har allerede scroll-avdekking, tellende
tall, dra-interaksjon, røntgenlinse og horisontal seksjon bygget i ren CSS og
vanilla-JS for **5,39 kB gzip til sammen**. Det letteste biblioteket som dekker
noe av det samme koster mer alene.

Den eneste kandidaten som fylte et ekte hull – `scroll-timeline-polyfill` for
Firefox – **virket ikke** da den ble testet på ekte. Begrunnelsen står under.

## Hva vi allerede har, og hva det koster

| Komponent | JS gzip |
|---|---|
| `Avslor` (scroll-avdekking) | 0,75 kB |
| `Nokkeltall` (tall som teller) | 0,83 kB |
| `Lagstabel` (dra-interaksjon) | 1,01 kB |
| `Rontgen` (maske som følger pekeren) | 1,91 kB |
| `Horisont` (vannrett bevegelse) | 0,89 kB |
| **Sum** | **5,39 kB** |

Forsiden som helhet lå på 12,71 kB gzip ved måling, inkludert `terminal.js` (6,00 kB).

## Kandidatene

Størrelse er målt med esbuild, `bundle: true, minify: true, format: "esm"`, med
en importlinje som speiler realistisk bruk hos oss. Lisens er lest i pakkens
egen LICENSE-fil der den finnes.

| Bibliotek | Lisens | min | gzip | Dekker | Innenfor rammene |
|---|---|---|---|---|---|
| [gsap](https://github.com/greensock/GSAP) | Standard «no charge» (ikke åpen kildekode) | 69,0 kB | **27,03 kB** | tidslinjer, easing | Nei – 5× hele vårt interaksjonslag |
| gsap + ScrollTrigger | samme | 112,5 kB | **44,21 kB** | scroll-styring | Nei – 8× |
| [motion](https://github.com/motiondivision/motion) | MIT | 53,9 kB | **19,90 kB** | animate() | Nei – over 15 kB |
| motion (scroll + animate) | MIT | 60,0 kB | **22,35 kB** | scroll-styring | Nei |
| [animejs](https://github.com/juliangarnier/anime) v4 | MIT | 31,6 kB | **12,46 kB** | generell animasjon | Teknisk ja, men dekker lite vi mangler |
| [scroll-timeline-polyfill](https://github.com/flackr/scroll-timeline) | Apache-2.0 (verifisert) | 59,5 kB | **15,96 kB** | `animation-timeline` i Firefox | Nei – virket ikke, se under |
| [@formkit/auto-animate](https://github.com/formkit/auto-animate) | MIT | 7,7 kB | **3,05 kB** | layoutendringer | Ja på vekt, men vi har ingen lister som endrer seg |
| [countup.js](https://github.com/inorganik/countUp.js) | MIT | 6,6 kB | **2,13 kB** | tall som teller | Ja, men vi har det på 0,83 kB |
| [splitting](https://github.com/shshaw/Splitting) | MIT | 4,5 kB | **2,07 kB** | ord/tegn-oppdeling | Ja, men `Mega` gjør det i ren CSS |

Ikke vurdert videre: **Lenis** og **Rellax** – brandboken forbyr scroll-jacking og
parallax. **Swiper**, **Embla** – vi har ingen karusell. **tsParticles** – partikler
er forbudt. Alle tre ville uansett ligget over vektbudsjettet.

### CSP

Ingen av kandidatene bruker `eval` eller `new Function`. **CSP er altså ikke et
skille mellom dem.** Flere setter stiler via `cssText` eller `insertRule`, men
CSP-en vår har allerede `style-src 'self' 'unsafe-inline'` fordi Astro legger
CSS inline, så det er uproblematisk. Det harde kravet er `script-src`, og det
består alle.

### Om GSAP-lisensen

Lisensteksten ligger ikke i pakken, bare som URL i `package.json`. Lest på
gsap.com/standard-license 6. oktober 2026: kommersiell bruk er gratis, alle
plugins inkludert, ingen omsetningsgrense. Men den er **ikke åpen kildekode** –
Webflow eier rettighetene, og det finnes en «Prohibited Uses»-klausul rettet mot
konkurrerende animasjonsverktøy. For vår egen nettside er det uproblematisk. For
et byrå som også leverer til kunder er det verdt å merke seg at vilkårene eies og
kan endres av en konkurrent i nettsidemarkedet.

## Integrasjonstest: scroll-timeline-polyfill

Den ble valgt fordi den var den eneste som fylte et hull vi faktisk har: Firefox
mangler `animation-timeline: view()` i stabil versjon (caniuse, september 2026:
global dekning 87,84 %, støtte ventet i Firefox 160).

**Vekten var god.** Lastet bak en funksjonstest kostet den 0,84 kB for alle, og
15,96 kB bare for nettlesere uten egen støtte.

**Men den virket ikke.** Målt i ekte Firefox 155:

```
supports etter tidlig polyfill: true
opacity gjennom scroll: 1 → 1 → 1 → 1 → 1 → 1
animationName: none
antallAnimasjoner: 0
```

Polyfillen lastet, registrerte `ScrollTimeline` og `ViewTimeline` på `window`, og
patchet `CSS.supports` til å svare `true`. Men animasjonen kjørte ikke. Den ble
testet både lastet dynamisk etter funksjonstesten og injisert før all annen kode –
samme resultat.

### Hvorfor den ikke virket, og hva det avdekket

Årsaken lå ikke i polyfillen. Den bygde CSS-en så slik ut:

```css
animation: linear both lab-inn view();
animation-range: entry 10% cover 40%;
```

Minifieren (lightningcss) hadde slått `animation-timeline: view()` inn i
`animation`-stenografien. **Den formen er ugyldig** – `animation-timeline` er
ikke del av stenografien.

Målt side ved side i reproduksjonen på `/lab/bibliotek`:

| Motor | `supports` | stenografi | langform |
|---|---|---|---|
| Chromium | true | `animationName: none` | `animationName: lab-inn` |
| Firefox 155 | false | `animationName: none` | `animationName: none` |

**Stenografien er altså ødelagt også i Chromium**, ikke bare i Firefox. Jeg antok
først at dette var en Firefox-sak. Det er det ikke – erklæringen forkastes av
begge motorer. Firefox viser `none` for begge fordi hele `@supports`-blokken ikke
gjelder der.

Dette er samme felle som allerede er dokumentert i `src/styles/typo.css`.
Løsningen er å alltid bruke langformene:

```css
animation-name: lab-inn;
animation-timing-function: linear;
animation-fill-mode: both;
animation-timeline: view();
```

## Funn utenfor mandatet: samme feil i produksjon

Et søk gjennom bygget CSS fant mønsteret ett sted i produksjon:

```
dist/client/historie/index.html:  animation:linear both hist-inn view()
```

Det er `ScrollHistorie.astro`. Forsiden, `/priser` og `/lab/typo` er rene.

Jeg målte `.hist__kort > *` på `/historie` i begge motorer og fikk
`animationName: none` og null animasjoner i **både Firefox og Chromium**.

Den isolerte reproduksjonen viser at det ugyldige mønsteret gir `none` i begge
motorer, mens langformen gir `lab-inn` i Chromium. Det peker på at avdekkingen på
`/historie` ikke kjører for noen besøkende – ikke bare for Firefox-brukere.

Jeg har ikke utelukket at `[data-aktiv]`-gatingen bidrar, siden den krever
JavaScript. Men den ugyldige stenografien er bekreftet til stede i bygget CSS, og
den alene er nok til å drepe animasjonen.

Filen ligger utenfor mitt mandat, så jeg har ikke rørt den. Anbefalt tiltak, i prioritert rekkefølge:

1. Bytt `ScrollHistorie.astro` til langformene.
2. Legg en test som feiler hvis bygget CSS inneholder `animation:` med `view()`
   eller `scroll()` inni. Mønsteret kan bare oppstå ved minifisering og er aldri
   riktig. Én linje i `test/bygget-html.test.ts` dekker hele kodebasen for all
   framtid – og den ville fanget dette før deploy.
3. Behold `/lab/bibliotek` som levende reproduksjon, så neste utvikler ser
   forskjellen i stedet for å lese om den.

## Hva jeg etterlot

Avhengigheten `scroll-timeline-polyfill` er **avinstallert**, siden anbefalingen
er å ikke bruke den. `src/pages/lab/bibliotek.astro` er beholdt som en
reproduksjon av stenografi-feilen i ren CSS, uten avhengigheter.
