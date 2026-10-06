# Astro-økosystemet: hva vi bør ta i bruk

Undersøkt 6. oktober 2026 mot Astro 7.3.5, Node 22.20, `@astrojs/node` i
`middleware`-modus. Alle tall er målt i dette repoet, ikke hentet fra README-er.

Kort svar: **ta i bruk OG-bilder nå.** La View Transitions ligge – den koster mer
enn den gir, og grunnen er konkret. `astro:assets` er ikke aktuelt ennå, men blir
det i det øyeblikket vi legger inn ekte skjermbilder.

---

## 1. Delingsbilder (OG) — ta i bruk

### Problemet

`src/layouts/Base.astro` setter `og:title`, `og:description` og `og:url`, men
**ingen `og:image`**. Deler noen en lenke på LinkedIn, Slack eller iMessage, kommer
den som en naken tekstboks. `twitter:card` står dessuten på `summary`, som er det
lille kortformatet.

For et byrå som selger nettsider er det en dårlig førsteinngang, og den er synlig
for alle som deler en lenke til oss.

### Løsningen

`scripts/og.mjs` genererer kortene med **satori** (SVG fra en elementstruktur) og
**@resvg/resvg-js** (SVG til PNG). Kjøres med `npm run og`.

```
public/og/forside.png        45 kB   /
public/og/sjekk.png          39 kB   /sjekk
public/og/priser.png         31 kB   /priser
public/og/sikkerhet.png      44 kB   /sikkerhet
public/og/systemer.png       43 kB   /systemer
public/og/historie.png       32 kB   /historie

6 bilder, 232 kB til sammen. 1200×630.
```

Se dem side om side på `/lab/og`.

**Kortet bygges fra designsystemet, ikke ved siden av det.** Fargene leses ut av
`src/styles/tokens.css` ved kjøring, så endrer aksentfargen seg der, endrer
delingsbildene seg med den. Et skjermbilde eller en Figma-eksport ville drevet fra
designet første gang noen justerte en farge.

### Lisenser, verifisert

| Pakke | Versjon | Lisens | Kommersielt |
|---|---|---|---|
| satori | 0.35.0 | MPL-2.0 | Ja. Fil-nivå copyleft: bare endringer i satoris EGNE filer må deles. Bruk som bibliotek er uberørt |
| @resvg/resvg-js | 2.6.2 | MPL-2.0 | Samme |
| wawoff2 | 2.0.1 | MIT | Ja |
| astro-og-canvas | 0.13.2 | MIT | Ja, men ikke valgt – se under |
| **astro-opengraph-images** | 1.20.3 | **GPL-3.0-only** | **Diskvalifisert** etter våre rammer |

Alle tre vi bruker er **utviklingsavhengigheter**. De havner aldri i noe
nettleseren laster. `npm audit --omit=dev`: 0 sårbarheter.

### Fontfella — den tok mest tid, og er verdt å skrive ned

Satori leser ikke woff2. Verre: den **krasjer på variable fonter uansett format**.

```
TypeError: Cannot read properties of undefined (reading '256')
    at parseFvarAxis (@shuding/opentype.js/dist/opentype.js:10285)
```

`fvar`-tabellen slår opp aksenavn i `name`-tabellen før den er lest.

Jeg antok først at årsaken var Google Fonts' subsetting, som stripper navn-ID-ene
`fvar` peker på. **Det var feil.** Jeg testet med den komplette fonten fra
`google/fonts` også – samme krasj. Begge fontene våre er variable:

```
schibsted-grotesk-700_800-latin   fvar: JA   akser: wght 400–900
jetbrains-mono-400_600-latin      fvar: JA   akser: wght 400–800
```

Google Fonts' eldre endepunkt (legacy UA) hjelper ikke – det serverer `font/eot`.

**Løsningen** er å instansiere de variable fontene til statiske, med `fontTools`
(Python, allerede installert på maskinen):

```bash
node .skudd/instansier.mjs        # woff2 → variabel TTF (wawoff2)
python3 - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
for src, dst, w in [(".skudd/sg-var.ttf","assets/fonts-og/schibsted-grotesk-800.ttf",800),
                    (".skudd/sg-var.ttf","assets/fonts-og/schibsted-grotesk-400.ttf",400),
                    (".skudd/jm-var.ttf","assets/fonts-og/jetbrains-mono-400.ttf",400)]:
    f = TTFont(src); instancer.instantiateVariableFont(f, {"wght": w}, inplace=True); f.save(dst)
PY
```

Resultatet ligger i `assets/fonts-og/` (3 filer, 166 kB) og er **committet med
vilje**, slik at `npm run og` virker offline og i CI uten Python. Kjør oppskriften
på nytt bare hvis fontene på siden byttes.

Fontene er instansiert ut av nøyaktig de woff2-filene `public/fonts/` serverer, så
delingsbildene kan ikke havne på en annen skrift enn nettsiden.

**Ett bevisst avvik:** ingressen på kortet bruker Schibsted Grotesk 400. Siden
serverer bare 700–800 og setter systemfont på brødtekst. Å embedde en systemfont
er ikke mulig, og 800-vekt på ingressen fikk den til å slåss med tittelen.

### Hvorfor ikke astro-og-canvas

MIT, støtter Astro 7, og ville trolig virket. Men den drar inn `canvaskit-wasm`
(Skia, flere megabyte) og gir et tegne-API i stedet for layout. Satori lar oss
skrive kortet som flexbox med de samme tokenene som siden – kortet ser ut som
siden fordi det er bygget med samme vokabular, ikke fordi noen har kopiert tallene.

### Dette gjenstår, og ligger utenfor mitt område

Bildene er generert, men **ikke koblet til**. `src/layouts/Base.astro` må:

1. Ta imot en valgfri `ogBilde`-prop og falle tilbake på `/og/forside.png`.
2. Skrive `<meta property="og:image" content={...absolutt URL...} />` –
   absolutt, ikke relativ; LinkedIn og Slack følger ikke relative stier.
3. Legge til `og:image:width` 1200 og `og:image:height` 630.
4. Bytte `twitter:card` fra `summary` til `summary_large_image`.

CSP er ikke i veien: `img-src 'self' data:` dekker `/og/*.png`.

---

## 2. View Transitions — ikke nå, og grunnen er konkret

Astro har `<ClientRouter />` innebygd, og myke sideoverganger ville gitt siden en
mer gjennomført følelse. Men i vårt oppsett koster den mer enn den gir.

**CSP er ikke problemet.** Ruteren legger et inline-skript i `<head>`, og
`inlineSkriptHasher()` i `sikkerhet.mjs` plukker opp hashen fra bygget ved
serveroppstart. For SSR-sider beregner `server.mjs` CSP-en per svar. Begge veier
er dekket.

**Problemet er at ingenting av det interaktive ville overlevd en navigering.**
`<ClientRouter />` bytter ut `<body>` på klienten uten å kjøre modulskriptene på
nytt. Komponenter som binder seg én gang ved første lasting mister elementene sine.

Målt med grep i dette repoet: **åtte komponenter** binder `addEventListener` uten
å lytte på `astro:page-load`:

```
Demo · HeroFilm · Horisont · Lagstabel · Pekerkort · Rontgen · SceneFilm · ScrollHistorie
```

Og de to globale skriptene:

```
public/terminal.js      0 treff på astro:page-load
public/hero-live.js     0 treff på astro:page-load
```

Konkret konsekvens etter første klikk i menyen: scroll-spolte videoer står stille,
røntgenlinsen følger ikke pekeren, lagstabelen lar seg ikke dra, og hero-feltet
kjører ikke lenger en skanning.

**Dette er observert for bindingsmønsteret vårt** (grep) og **følger av Astros
dokumenterte oppførsel** for skript ved klientside-navigering. Jeg har ikke kjørt
ruteren i produksjonsoppsettet, siden det krever endringer i `Base.astro` som
ligger utenfor mandatet.

**Hvis den skal innføres,** må alle ti filene legges om til å binde seg i en
funksjon som kalles både ved første lasting og på `astro:page-load`, og bindingene
må bli idempotente. Det er en reell omlegging av hele interaksjonslaget for en
kosmetisk gevinst. Anbefalingen er å vente til interaksjonene er ferdig polert.

---

## 3. `astro:assets` og sharp — ikke aktuelt ennå

Premisset i oppdraget stemmer ikke lenger: `imageService: "compile"` står **ikke**
i `astro.config.mjs`. Den innstillingen hørte til Cloudflare-adapteren, som er
byttet ut med `@astrojs/node`.

I dag har vi ingenting å optimalisere:

```
16 rasterfiler, 346 kB til sammen
  – 4 plakater, allerede AVIF (7–44 kB)
  – 6 OG-bilder, generert i riktig format og størrelse
  – 6 ikoner og app-ikoner
```

Ingen bruker `astro:assets`; alle bilder er `<img>` mot `/public`. Det er riktig
for ikoner og ferdig optimaliserte plakater – `astro:assets` gir ingen gevinst på
filer som allerede er i målformatet.

**Men det snur** i det øyeblikket vi legger inn ekte skjermbilder fra kundeprosjekter
eller et portrett på `/om`. Da bør bildene inn i `src/assets/` og gjennom
`<Image />`, som gir AVIF og WebP med riktige `width`/`height` automatisk. Den
siste delen er verdt noe i seg selv: feil dimensjoner på en `<img>` er nøyaktig
feilen som ga CLS 0,145 på logoen.

**Utløser:** første ekte skjermbilde eller foto i repoet.

---

## 4. Øvrige integrasjoner

| Integrasjon | Verdt det | Hvorfor |
|---|---|---|
| `@astrojs/partytown` | **Nei** | Flytter tredjepartsskript til en worker. Vi har null tredjepartsskript – det er et salgsargument, ikke en mangel |
| `@astrojs/prefetch` | **Allerede** | `prefetch: { prefetchAll: true, defaultStrategy: "hover" }` står i konfigurasjonen |
| `astro-compress` | **Nei** | `server.mjs` komprimerer allerede med brotli og gzip, med hurtigbuffer. En ekstra byggesteg ville duplisert det |
| `critters` / critical CSS | **Nei** | `build.inlineStylesheets: "always"` legger all CSS inline. Det er grunnen til at `style-src` trenger `unsafe-inline`, og byttet er allerede tatt bevisst |
| `@astrojs/sitemap` | **Allerede** | Installert og konfigurert med `nb-NO` |

---

## Oppsummert

| | |
|---|---|
| Ta i bruk nå | OG-bilder. Mangler bare fire linjer i `Base.astro` |
| Vent | View Transitions. Krever omlegging av 10 filer først |
| Senere | `astro:assets`, når første ekte foto eller skjermbilde legges inn |
| Dropp | partytown, astro-compress, critters |

## Avhengigheter lagt til

```
satori            0.35.0   MPL-2.0   dev
@resvg/resvg-js   2.6.2    MPL-2.0   dev
wawoff2           2.0.1    MIT       dev
```

Ingen av dem havner i klientbunten. `npm audit --omit=dev`: 0 sårbarheter.
