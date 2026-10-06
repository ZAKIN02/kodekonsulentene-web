# SVG- og linjeanimasjon – vurdering

Målt 6. oktober 2026. Alle størrelser er egne målinger med esbuild, ikke tall fra
README eller bundlephobia.

## Konklusjon

**Ren CSS holder. Ingen av bibliotekene bør tas inn.**

Hele grunnen til at `vivus`, `lazy-line-painter` og `walkway.js` finnes, er å måle
banelengden med JavaScript – `path.getTotalLength()` – for å sette
`stroke-dasharray` riktig. Det problemet forsvinner med SVG-attributtet
`pathLength="1"`: banen normaliseres til lengde 1 uansett hvor lang eller
kompleks den er, og da er dette alt som skal til:

```css
stroke-dasharray: 1;
stroke-dashoffset: 1;  /* utegnet */
stroke-dashoffset: 0;  /* ferdig tegnet */
```

Kombinert med `animation-timeline: view()` gir det scroll-styrt strøkanimasjon
for **0 kB JavaScript**. Demoen ligger på `/lab/svg`.

`pathLength` er i SVG 1.1 og har vært støttet i alle nettlesere i mange år. Det er
ingen progressiv forbedring – det virker eller så er hele SVG-en brutt.

## Kandidatene

Målt med esbuild: `bundle: true, minify: true, format: "esm", platform: "browser"`,
med en importlinje som speiler realistisk bruk hos oss.

| Bibliotek | Lisens | min | gzip | Dekker | Innenfor rammene |
|---|---|---|---|---|---|
| [svg-path-morph](https://github.com/Chaphasilor/svg-path-morph) | MIT¹ | 2,4 kB | **1,19 kB** | path-morphing mellom former | Ja på vekt – men vi har ingen former som skal morfe |
| [walkway.js](https://github.com/ConnorAtherton/walkway) | MIT¹ | 4,8 kB | **1,80 kB** | strøktegning | Ja på vekt – men `pathLength="1"` gjør den overflødig |
| [vivus](https://github.com/maxwellito/vivus) | MIT¹ | 13,4 kB | **4,53 kB** | strøktegning med flere moduser | Ja på vekt – samme innvending |
| [lazy-line-painter](https://github.com/camoconnell/lazy-line-painter) | MIT¹ | 18,1 kB | **5,60 kB** | strøktegning + tidslinje | På grensen, og samme innvending |
| [flubber](https://github.com/veltman/flubber) | MIT¹ | 52,8 kB | **18,53 kB** | morphing mellom ulike topologier | Nei – 2× budsjettet |
| [@svgdotjs/svg.js](https://github.com/svgdotjs/svg.js) | MIT¹ | 89,2 kB | **29,30 kB** | full SVG-manipulasjon | Nei – 5× budsjettet |

¹ **Lisens-forbehold:** ingen av disse pakkene leverer en LICENSE-fil i npm-pakken.
MIT er oppgitt i `package.json`. Direktivet ba om verifikasjon i LICENSE-fila, og
det lot seg ikke gjøre fra pakkene alene. Skal noen av dem faktisk tas i bruk, bør
lisensen bekreftes i GitHub-repoet først.

Ikke vurdert videre:

- **SMIL** (`<animate>`, `<animateMotion>`) – virker, men er utfaset i Chrome-planer
  siden 2015, og gir ingenting CSS ikke gir oss her.
- **Snap.svg** – finnes ikke lenger på npm under det navnet.
- **anime.js v4** – allerede målt til 12,46 kB i `docs/research-animasjon.md`.
  Generell animasjon, ikke SVG-spesifikk.

## Når et bibliotek likevel ville lønt seg

`pathLength`-trikset dekker **strøktegning**. Det dekker ikke:

- **Morphing mellom ulike former** – å gjøre en bane om til en annen med et annet
  antall punkter. Der er `flubber` (18,53 kB) faktisk det riktige verktøyet, fordi
  problemet er matematisk, ikke bare et spørsmål om dash-offset.
- **Path-følging** – å flytte et element langs en bane. Dette løses i dag med ren
  CSS via `offset-path` og `offset-distance`, som er bredt støttet. Ingen pakke
  trengs.

Vi har ingen planlagt bruk av morphing. Skulle det komme, er `flubber` kandidaten –
men da bør den lastes bare på den ene siden som trenger den.

## Demoen: `/lab/svg`

Flyten vi selger på `/systemer`: kunde → booking → Vipps → regnskap. Fire noder og
tre forbindelser. Ringene og strekene tegner seg mens man scroller, forskjøvet per
element via `--i`, slik at flyten leses venstre mot høyre.

**Målt JavaScript på siden: 1,83 kB gzip.** Alt sammen er sidens grunnmur
(temaskript, `Avslor`-reserven, terminalhintet). **Figuren bidrar med 0 kB.**

Verifisert at animasjonen faktisk kjører – `stroke-dashoffset` lest fra computed
style gjennom scrollet:

| scrollY | strek 1 | strek 2 | strek 3 |
|---|---|---|---|
| 53 | 1 | 1 | 1 |
| 214 | 0,743 | 0,826 | 0,868 |
| 375 | 0,152 | 0,423 | 0,563 |
| 536 | 0 | 0,021 | 0,259 |
| 697 | 0 | 0 | 0 |

Tilstander, målt:

| Tilstand | Resultat |
|---|---|
| `prefers-reduced-motion: reduce` | Alle strøk `0px` – ferdig tegnet, ingen animasjon |
| Uten JavaScript | 4 listepunkter, 3 baner til stede, figuren komplett |
| 390 px bredde | SVG skjult, listen bærer innholdet, ingen vannrett overflyt |

## Fellen som må unngås

CSS-minifieren (lightningcss) slår `animation` og `animation-timeline` sammen til
`animation: linear both navn view()`. Den formen er **ugyldig** –
`animation-timeline` er ikke del av `animation`-stenografien – og både Chromium og
Firefox forkaster hele erklæringen uten å si fra.

Bruk derfor alltid langformene:

```css
animation-name: strek-tegnes;
animation-duration: 1ms;
animation-timing-function: linear;
animation-fill-mode: both;
animation-timeline: view();
animation-range: entry 14% cover 34%;
```

`test/bygget-html.test.ts` feiler hvis mønsteret dukker opp i bygget. Verifisert
at demoen ikke utløser den.

## Firefox

Firefox mangler fortsatt `animation-timeline` i stabil versjon. På `/lab/svg` betyr
det at figuren står **ferdig tegnet** i stedet for å tegne seg – som er riktig
degradering, siden standardtilstanden i CSS-en er «tegnet». Ingen reserve i
JavaScript er nødvendig, i motsetning til `Avslor`, der innholdet ellers ville
stått usynlig.

Det er et argument for å foretrekke strøkanimasjon framfor innton-effekter: den
degraderer til noe komplett helt av seg selv.
