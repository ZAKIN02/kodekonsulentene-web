# CSS-teknikker som koster null kilobyte

Research 6. oktober 2026. Oppfølging av `docs/research-animasjon.md`, som
konkluderte med at **ingen** animasjonsbibliotek var verdt vekten for oss. Da må
alternativet være konkret. Dette er det.

Levende oppslagsverk: **`/lab/teknikker`**. Hver teknikk står der i bruk, ikke
beskrevet. Siden la til **0 kB JavaScript** — alt er CSS.

## Kilder og metode

Støttetallene er **ikke anslag**. De er hentet fra:

- `api.webstatus.dev` — Googles baseline-data, gir status og dato per nettleser
- `caniuse.com` via `features-json` — gir bruksandel i prosent

Begge hentet 6. oktober 2026. Der kildene spriker, står det i tabellen.

## Tabellen

| # | Teknikk | Baseline | Dato | Mangler i | Bruksandel |
|---|---|---|---|---|---|
| 1 | `:has()` | widely | 19.12.2023 | — | 94,82 % |
| 2 | `text-wrap: balance` | newly | 13.05.2024 | — | 87,92 % + 4,81 % delvis |
| 3 | `@starting-style` | newly | 06.08.2024 | — | — |
| 4 | `content-visibility` | newly | 15.09.2025 | — | 93,91 % |
| 5 | View Transitions (samme dokument) | newly | 14.10.2025 | — | 91,75 % |
| 6 | `@scope` | newly | 24.03.2026 | — | 91,66 % |
| 7 | `field-sizing: content` | newly | 16.06.2026 | — | — |
| 8 | `animation-timeline: view()` | limited | 18.07.2023 | **Firefox** | — |
| 9 | `animation-timeline: scroll()` | limited | 18.07.2023 | **Firefox** | — |
| 10 | `interpolate-size` | limited | 17.09.2024 | **Firefox, Safari** | — |
| 11 | Anchor positioning | limited | 14.09.2026 | se merknad | 85,91 % delvis |

Scroll-drevne animasjoner: Chrome 18.07.2023, Edge 21.07.2023, Safari 15.09.2025.
Firefox mangler fortsatt. Det stemmer med forrige research, som fant at
polyfillen ikke virket.

**Anchor positioning er usikker.** webstatus.dev oppgir bare Safari som ferdig
(14.09.2026) og Chrome som manglende, mens caniuse melder 85,91 % *delvis*
støtte. Sannsynligvis måler de to ulike deler av spesifikasjonen. Jeg har ikke
klart å avklare det, og anbefaler derfor ikke å ta den i bruk ennå.

## De fem sterkeste for oss

### 1. `text-wrap: balance` — størst effekt per innsats

Jevner ut linjelengdene i korte overskrifter. **Målt på `/lab/teknikker`**, samme
overskrift i `display-lg`:

```
uten balance:   489, 451, 182 px   ← siste linje er en stump
med balance:    431, 354, 338 px   ← jevnt
```

Hører hjemme på **alle display-overskrifter**, og særlig i `Mega`, der ett løst
ord på siste linje er synlig på lang avstand. Koster ingenting, krever ingen
omskriving, og degraderer til vanlig linjebryting.

Dette er den eneste teknikken her jeg mener bør inn uten videre diskusjon.

### 2. `:has()` — tilstandslogikk uten JavaScript

Bredest støttet av alle (94,82 %, widely siden desember 2023). **Målt i
nettleser** på demosiden:

```
ugyldig e-post  → rammefarge rgb(255, 123, 114)  (--fail)
gyldig e-post   → rammefarge rgb(95, 227, 192)   (--ok)
```

Hele logikken er to regler:

```css
.felt:has(:user-invalid) .felt__inn { border-color: var(--fail); }
.felt:has(input:valid:not(:placeholder-shown)) .felt__inn { border-color: var(--ok); }
```

`:user-invalid` er nøkkelen — den slår bare til etter at brukeren faktisk har
skrevet noe, ikke ved sidelasting. Hører hjemme i **kontaktskjemaet** og i
**FAQ-en**.

### 3. `@starting-style` — inn-animasjon uten klasse satt fra JavaScript

Lar et element tone inn første gang det vises. Før dette måtte man sette en
klasse fra JavaScript ett bilde etter innsetting.

Hører hjemme i **kvitteringen på `/kontakt`**, i feilmeldinger, og i
**terminalens svarlinjer** når skanningen skriver ut resultatet.

En felle verdt å kjenne: `@starting-style` og hovedregelen har **lik
spesifisitet**. Står `@starting-style` først, overstyrer hovedregelen den og
ingenting skjer. Den må stå etter.

### 4. `content-visibility: auto` — ytelse på lange sider

Nettleseren hopper over layout og maling av seksjoner utenfor skjermen.

Hører hjemme på **`/handbok`, `/vilkar`, `/personvern`** — de lange lesesidene —
og på forsiden under folden. Krever `contain-intrinsic-size` så rullefeltet ikke
hopper.

Lighthouse måler bare første innlasting, så gevinsten vises ikke nødvendigvis i
scoren. Den vises i hvor jevnt lange sider scroller.

### 5. `field-sizing: content` — feltet vokser med teksten

Fjerner et helt mønster: å måle `scrollHeight` i JavaScript og sette høyden.
Baseline siden 16.06.2026.

Hører hjemme i **meldingsfeltet i kontaktskjemaet**. Degraderer til fast høyde
med scroll, altså nøyaktig det vi har i dag.

## Fellen som allerede har kostet oss en feil

Alle scroll-drevne teknikker må skrives med **langformene**:

```css
/* Riktig */
animation-name: kort-inn;
animation-duration: 1ms;
animation-timing-function: linear;
animation-fill-mode: both;
animation-timeline: view();

/* Feil — lightningcss lager dette av stenografien */
animation: linear both kort-inn view();
```

Den andre formen er ugyldig. `animation-timeline` er ikke del av
`animation`-stenografien, og **både Chromium og Firefox forkaster hele
erklæringen uten en lyd**. Dette lå i produksjon på `/historie` uten at noen
merket det.

`test/bygget-html.test.ts` feiler nå hvis mønsteret dukker opp i bygget CSS.
Verifisert på denne siden: ingen treff, og `animation-timeline: scroll(root)` og
`view()` overlevde minifiseringen som egne erklæringer.

## Verifisert

| | |
|---|---|
| `npx astro check` | 0 feil (98 filer) |
| `npm run test` | 155/155 |
| JS lagt til av teknikkene | **0 kB** |
| Stenografi-fellen i bygget | ingen treff |
| Redusert bevegelse | 0 kort under full opasitet, `animationName: none` |
| Uten JavaScript | 11 rader, 3 kort, 2 FAQ-poster, 3 felt, `h1` på plass |

Skjermbilder sett på: `.skudd/teknikker.png` (8 ruter nedover),
`.skudd/tek-balance.png`, `.skudd/tek-has.png`, `.skudd/tek-utenjs.png`.

## Det jeg ikke anbefaler ennå

**View Transitions** er fristende, men vi har tre ting som kan brekke: de
scroll-spolte videoene, terminalmodus som er en global modal, og
`hero-live.js`. Den må testes mot vår strenge CSP før den tas i bruk — en annen
agent ser på det.

**Anchor positioning** — kildene spriker, se over.

**`interpolate-size`** mangler i både Firefox og Safari. Den er trygg som
progressiv forbedring på FAQ-en, men ikke noe å bygge på.

## Hva som gjenstår

Teknikkene står nå demonstrert, ikke tatt i bruk. Å flytte dem inn i
produksjonskomponentene krever endringer i `src/components/` og `src/styles/`,
som ligger utenfor dette mandatet. Rekkefølgen jeg ville tatt dem i:

1. `text-wrap: balance` på `Mega` og alle `display-*`-stilene
2. `:has()` i kontaktskjemaet
3. `field-sizing` i meldingsfeltet
4. `content-visibility` på de lange lesesidene
5. `@starting-style` på kvitteringen
