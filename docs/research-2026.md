# Research 2026: kreativ nettside, GitHub-repoer og nye funksjonaliteter

Undersøkt 7. oktober 2026. Oppdraget var: finn åpne repoer, biblioteker og teknikker
som gir en nettside en slående opplevelse i 2026, finn ut hva forbildene faktisk
bruker, og finn ut hva som har landet i nettleserne som vi ikke bruker ennå.

Alle påstander er merket:

- **Målt** – egen måling i dette repoet eller mot den serverte filen
- **Observert** – lest i rå markup, CSS eller JS-bunt hentet ned selv
- **Dokumentert** – lest i leverandørens egen dokumentasjon eller i et maskinlesbart datasett
- **Antatt** – slutning, ikke verifisert
- **Ikke verifisert** – forsøkt, men kilden var utilgjengelig

Datakildene for støttestatus er de maskinlesbare, ikke blogginnlegg:
`api.webstatus.dev`, `@mdn/browser-compat-data` 8.1.4, `caniuse-db` 1.0.30001815,
Firefox' egen `StaticPrefList.yaml`, Bugzilla og WebKit Bugzilla REST, og
`product-details.mozilla.org`. Søkeresultater om «web design trends 2026» og
«CSS features 2026» er nesten utelukkende SEO-generert materiale med oppdiktede
versjonsnumre, og er forkastet.

Nettleserversjoner i dag: **Chrome 154 · Firefox 157.0.1** (sluppet 2026-09-29,
målt mot `product-details.mozilla.org`) **· Safari 27** (2026-09-14).
Firefox ESR er **140.17** – les avsnittet om ESR under punkt 4, det flytter gulvet vårt.

---

## Del 1 – Svaret på spørsmålet eieren faktisk stilte

Eieren har sagt åtte ganger at nettstedet er statisk og lite oppsiktsvekkende. En
agent målte at vi har mer bevegelse enn `spinxdigital.com` – ni animasjoner mot
sju, 69 transformerte elementer mot 38. Spørsmålet var hva som faktisk gjør
forbildene minneverdige.

### Det avgjørende tallet

JavaScript er **1,6–2,9 prosent** av sidevekten på alle tre forbildene (observert,
egen måling over nettet med `curl --compressed`):

| | forespørsler | totalt | JS | CSS | medier | JS som andel |
|---|---|---|---|---|---|---|
| phamilypharma.com | 51 | 1,95 MB | **53,6 kB** (1 fil) | 13,0 kB | 1,81 MB | **2,7 %** |
| jeton.com | 221 | 12,74 MB | 376,9 kB (141 biter) | 15,3 kB | 12,31 MB | **2,9 %** |
| osmo.supply | 111 | 15,78 MB | 254,9 kB (15 filer) | 74,2 kB | 15,0 MB | **1,6 %** |

Forbehold om metoden: hvert `srcset`-alternativ ble hentet, så medietallene
overdriver hva én nettleser laster. JS- og CSS-tallene er eksakte.
**Lighthouse- og CrUX-data finnes ikke her** – PageSpeed Insights' API svarte
HTTP 429 på alle tre.

Animasjonslaget er altså ikke der vekten, og dermed heller ikke der arbeidet,
ligger. Mediene og skriften er 88–98 prosent.

### Kontrollforsøket: siden som vant med minst bevegelse

`phamilypharma.com` er et apotekmeglernettsted som fikk Awwwards Honorable
Mention 27. januar 2025. Det er den av de tre som animerer **minst** (observert,
telling av animasjonskroker i serverrendret markup):

| | animasjonskroker på forsiden |
|---|---|
| **phamilypharma.com** (prisvinner) | **~61** |
| jeton.com | ~200+ |
| osmo.supply | ~260+ |

Og den gjør det med (alt observert i `site.Dca_zzip.js` og `site.Cuo4rdYi.css`):

- **Null GSAP. Null Three.js, WebGL, OGL, Lottie og Rive.** 54 kB JavaScript i alt.
- **To gratis Google-skrifter**, Anton og Poppins, selvhostet. Samme kategori som våre.
- **Vanlig Apache uten CDN.**
- Selvhostet Matomo med `disableCookies()` – **cookiefri, og derfor uten samtykkebanner.**
  Det er vår egen posisjon, hos en prisvinner.
- Bevegelsen er håndskrevet: 33 `requestAnimationFrame`, 14 `lerp`.

Eieren slår denne siden på animasjonstelling uten anstrengelse. Det beviser
ingenting. Så hva vant den på?

### Hva juryen faktisk premierte

**Awwwards' egne stikkord for phamilypharma er `Illustration`, `Storytelling`
og `Colorful` – ikke animasjon** (dokumentert, awwwards.com/sites/phamily).

Og den høyeste jurykarakteren er **Innhold 8,20** – over Kreativitet 8,07,
Design 8,00 og Brukervennlighet 7,87 (observert i sidekilden; 18 av 33 stemmer
ligger ikke i markupen, så den gjengitte totalen 8,13 er den autoritative).

De tre tingene som faktisk skiller, i rekkefølge etter hva juryen vektet:

1. **Tegninger.** Et bestilt vokabular på **23 håndgester** (`hands-hello`,
   `shaka`, `heart`, `check`, `no`, `ok`, `clac`, `baby`, `calm`, `coin`,
   `handshak`, `money`, `pencil`, `present`, `rock`, `sprinkle`, `think` …),
   flate tofargede vektorer, brukt som hele ikonsystemet. 13 plasseringer på
   forsiden. De sendte inn tegningene som et selvstendig bidrag til Awwwards.
   Det er en illustrasjonsbestilling, ikke en avhengighet.
2. **Ord.** De hyret en tekstforfatter og **krediterte henne som medforfatter av
   prisen** (Troa + White Elephant, Julie Barthélemy, dokumentert). Håndverket er
   ordspill hele veien: *«L'Achat et Vente de Pharmacies sans maux de tête»*,
   *«Un parcours de battant. Pas du combattant»*, *«Devenir proprio sans impro»*,
   og en seksjon som lister penger og balanse mellom jobb og fritid under
   mellomtittelen *«Pain au chocolat ou chocolatine?»*.
3. **Én idé per side man kan fortelle i én setning.** Phamilys 404-side er et
   spillbart stein-saks-papir («CHI FOU MI»). Jetons er en Rive-drevet
   fem-stegs simulering av å sende penger, matet fra Sanity – én idé, gjentatt
   ingen andre steder.

Jeton er kontrollforsøket fra motsatt kant: det minneverdige laget er
**12,3 MB 3ds Max-renderinger** og 1,16 MB Rive. Bürocratik sier det selv:
*«All crafted on the good old 3D Studio Max – no Spline, sorry about that.»*
Begge er kjøpt, ikke kodet.

### Konklusjonen, uten pynt

**Forbildene kjøper tegninger, ord og én idé. Vi kjøper teknikk.** Teknikk er den
ene posten der vi allerede er foran.

Dette er tredje gang dette huset kommer fram til samme svar. `docs/research-kreativt.md`
(6. okt.) konkluderte at referansene ikke er teknisk mer avanserte enn oss.
`docs/referanser.md` (6. okt.) målte at vi har like mye eller mer scroll-drevet
bevegelse enn både jeton og osmo, og rangerte fem gratis tiltak.

**Det er ikke mer research som mangler.** Det er utførelse. Dokumentert i dette
repoet (målt):

- `docs/referanser.md` rangerte **«la minst ett klipp gå i løkke i full styrke»**
  som tiltak nummer én, og kalte det «det eneste tiltaket som direkte svarer på
  *det er bevegelse jeg ønsker*». `SceneFilm.astro` **har** støtten – propen
  `loope` fjerner masken og setter opasitet 1. `grep -rn 'loope' src/pages/`
  gir **null treff i markup**. Komponenten er bygget og slått av på hver side.
- `docs/research-teknikker.md` rangerte `content-visibility: auto` blant de fem
  sterkeste. De to treffene vi har på `content-visibility` står inne i
  FAQ-overgangen. `contain-intrinsic-size` finnes **ikke i repoet**. Tiltaket er
  ikke gjennomført.
- Samtidig ligger fire dokumenter (`akt.md`, `skjelett.md`, `floke.md`, `stor.md`,
  til sammen ~55 kB) på AI-genererte videoscener, der vår egen dom er
  *«Nei, ikke god nok til å erstatte noe.»*

Og én ting eieren bør få vite, fordi den går motsatt vei: **`prefers-reduced-motion`
er praktisk talt fraværende hos alle tre forbildene** (observert: 0 treff i jetons
CSS og JS, 0 i phamilys CSS og JS, 2 i osmos Slater-JS). Vi har 67 treff.
Vi er bedre enn forbildene på det vi selger på. Det er ikke et problem som skal
løses – det er en påstand som skal brukes.

---

## Del 2 – Vår egen tilstand, målt 7. oktober 2026

### Førstelast, forsiden

| Post | Størrelse |
|---|---|
| `index.html` (brotli, inkludert 85,6 kB CSS inline) | **27,2 kB** |
| `terminal.js` (brotli) | 5,5 kB |
| `hero-live.js` (brotli) | 1,4 kB |
| `page.*.js` + `apning.js` (brotli) | 1,8 kB |
| To woff2-skrifter, latin | **78,2 kB** |
| **Sum** | **≈ 114 kB** |

Alt klient-JS på hele nettstedet, komprimert til sammen: **15,5 kB**.

**Taket er 400 kB. Vi bruker 114. Vi har 286 kB i klaring.**

Det er verdt å si rett ut: **vi er ikke begrenset av ytelsesbudsjettet.**
Budsjettet har vært brukt som argument mot ting det ikke rekker å være et argument
mot. Phamilypharma vant en pris på 1,95 MB.

Sett i sammenheng (dokumentert):

| | Førstelast / total |
|---|---|
| **Oss** | **114 kB** |
| Web Almanac 2025, median desktop-side | **2 412 kB** |
| Web Almanac 2025, p90 | 9 179 kB |
| `spinxdigital.com` (nærmeste sammenlignbare byrå) | ~1 110 kB |
| `davidlangarica.dev` | 884 kB, hvorav **671 kB JavaScript** |
| `landonorris.com` (Awwwards Site of the Year 2025) | 7,8 MB |
| `bruno-simon.com` (FWA of the Year 2025) | 11,9 MB |
| `samsy.ninja` | 44,0 MB |

Vi ligger på **en tjuendedel av medianen for en vanlig nettside.** Det er en
påstand vi kan dokumentere, og det er en salgsressurs vi ikke bruker.
Merk likevel motpunktet: `foodforfish.org` vant FWA of the Year 2024 på
**0,5 MB og 12 forespørsler**, så «prisvinner betyr tung» er ingen regel.

Og tilgjengelighet: WebAIM Million, februar 2026, målte **95,9 prosent** av én
million forsider med WCAG-brudd – opp fra 94,8 – med **56,1 feil per side,
en økning på 10,1 prosent fra året før**. Tilgjengeligheten på nettet gikk
**bakover**. Det er markedet vårt, i ett tall, fra en kilde som har målt årlig
siden 2019.

### Skriften er 68 prosent av førstelasten, og den har en feil

Fire funn, alle målt:

**1. Pilen ved siden av nesten hver knapp rendres i en fremmed skrift.**

Nettstedet bruker 107 unike synlige tegn i all bygget HTML (målt). Tre av dem
faller utenfor begge `unicode-range`-deklarasjonene i `src/styles/fonter.css`:

```
→  U+2192     ≤  U+2264     ≥  U+2265
```

Google Fonts' «latin»-subsett inneholder `↑` (U+2191) og `↓` (U+2193), men
**ikke** `→`. Kontrollert med fontTools mot de faktiske filene vi serverer:

```
jetbrains-mono-400_600-latin.woff2     → NEI   ≤ NEI   ≥ NEI   ↑ JA   ↓ JA
schibsted-grotesk-700_800-latin.woff2  → NEI   ≤ NEI   ≥ NEI   ↑ JA   ↓ JA
```

Glyffene finnes altså ikke i filene i det hele tatt – det er ikke nok å utvide
`unicode-range`. Og `.kk-arrow` er eksplisitt satt til `var(--font-mono)`
(`components.css` linje 32 og 65), så pilen faller gjennom til
`ui-monospace / SF Mono / Menlo / Consolas`: **ulik strektykkelse og bredde per
operativsystem, rett ved siden av primærknappen.**

Berørte steder (observert): `Button.astro` (hver knapp med pil), `ServiceCard.astro`,
`Pekerkort.astro`, `KodeBygg.astro`, og `≤`/`≥` i ytelsesbudsjett-tabellen på
`/status`.

For et nettsted hvis merkevare er hårlinjer og presis typografi er dette den
dyreste billige feilen i repoet.

**2. Et eget subsett kutter displayskriften 34 prosent.** Målt: `pyftsubset` av
`schibsted-grotesk-700_800-latin.woff2` til de 107 tegnene som faktisk brukes gir
**45,8 kB → 30,4 kB**, en besparelse på 15,4 kB. fontTools 4.51.0 er allerede
installert på maskinen.

**3. De to `latin-ext`-filene (31,7 kB) blir aldri forespurt.** Målt: ingen av de
107 tegnene ligger i `latin-ext`-området. De koster ikke førstelast, men de er
død last på disk – og for monoskriften bør de beholdes likevel, se risikoen under.

**4. Risikoen som gjør dette til to tiltak, ikke ett.** Monoskriften rendrer
*fremmed* innhold: URL-er, foretaksnavn fra Enhetsregisteret, WCAG-meldinger,
skannerutdata. Et 107-glyffs subsett ville gitt tofu på et polsk foretaksnavn.
**Subsett displayskriften hardt** – overskrifter er skrevet av oss.
**La monoskriften beholde hele latin og latin-ext**, og legg til de tre manglende
tegnene i begge.

### CSS-en sendes på nytt ved hver navigering

`build.inlineStylesheets: "always"` legger all CSS inline i hver HTML-fil.

Målt: av `/priser` sine 62 389 byte inline CSS er **58 783 byte – 94 prosent –
byte-identiske med forsidens**. Det er ~18 kB brotli som sendes på nytt ved hver
navigering og aldri kan caches. Med `prefetch: { prefetchAll: true, defaultStrategy: "hover" }`
multipliseres det med antall lenker brukeren drar pekeren over.

Phamilypharma løser samme problem slik (observert): 9,5 kB kritisk CSS inline,
hele arket lastet ikke-blokkerende med `<link async defer onload="this.media='all'">`.

**Men den strammere CSP-en følger ikke med gratis.** `docs/research-astro.md` noterer
riktig at `style-src 'unsafe-inline'` er prisen for inline-CSS. Å fjerne den krever
også at de **92 `style="…"`-attributtene** i bygget forside-HTML (målt) legges om
til klasser eller custom properties. Cachegevinsten er gratis; CSP-gevinsten er et
eget stykke arbeid. Ikke selg den før den er tatt.

### Easing er den ene verdiklassen som slapp unna tokenregelen

Brandbokens harde regel er at alle verdier går gjennom `tokens.css`, aldri en
hardkodet farge, avstand eller radius. Målt i `src/styles/` og `src/components/`:

- **6 forskjellige `cubic-bezier()`-kurver**, 24 forekomster
- pluss `ease`, `ease-out` og `linear` som nakne nøkkelord, 37 forekomster
- **null navngitte easing-tokens**

Til sammenligning (observert): osmo.supply har én kurve, og den heter firmaet:
`CustomEase.create("osmo", "0.625, 0.05, 0, 1")`. Jetons 38 kurver er derimot
alle hentet rett fra easings.net – og det er Jeton som leier inn 3D-studio for
å få karakter.

Phamilypharma har **egenskrevne oversvingskurver**: `cubic-bezier(.17,.67,.3,1.1)`
19 ganger og `cubic-bezier(.17,.67,.3,1.33)` 10 ganger (y₂ > 1 – den skyter over
og faller tilbake). Det er den minst bibliotekstunge av de tre som har den mest
bevisste bevegelsen.

Bevegelseskarakter er gratis og ligger i kurven. Vi har seks kurver og ingen signatur.

### Plattformfunksjoner vi alt bruker, og vi bruker mange

Målt, antall treff i `src/`:

`animation-timeline` 91 · `:has()` 76 · `prefers-reduced-motion` 67 ·
`@supports` 29 · `@starting-style` 19 · `mask-image` 17 · `text-wrap` 16 ·
`clip-path` 14 · `color-mix` 11 · `interpolate-size` 10 · `inert` 10 ·
`::details-content` 8 · `field-sizing` 5 · `allow-discrete` 4 · `subgrid` 3 ·
`@container` 2 · `@property` 2 · `@scope` 1 · `popover` 1

Og – viktig – `Avslor.astro` degraderer riktig: standardtilstanden i CSS er det
**ferdige, synlige** innholdet, `animation-timeline` ligger bak `@supports`, og
Firefox får en IntersectionObserver som legger på en klasse. Det er lærebokmessig.

**Null treff** på: `view-transition` · `anchor-name` / `position-area` /
`position-try` · `::scroll-marker` / `::scroll-button` · `offset-path` ·
`scroll-snap` · `scroll-state` · `corner-shape` · `@function` · `reading-flow` ·
`speculationrules` · `hidden="until-found"` · `oklch` · `light-dark()` ·
`mix-blend-mode` · `font-variation-settings` · `calc-size` · `text-box-trim` ·
`sibling-index` · `contrast-color` · `@media (scripting:)`

---

## Del 3 – Hva forbildene faktisk bruker

Alt i denne delen er **observert** i nedlastet markup, CSS og JS-bunter, med
versjonsstrenger lest i selve koden.

### jeton.com – Nuxt + GSAP + Lenis + Rive + Matter.js

| Bibliotek | Versjon | Bevis |
|---|---|---|
| Nuxt / Vue 3 | – | `/_nuxt/`-biter, `/_payload.json` |
| GSAP | **3.12.5** | versjonsstreng i bunten |
| Lenis | **1.0.42** | `window.lenisVersion="1.0.42"` |
| @rive-app/canvas | **2.19.3** | innebygd `package.json` |
| matter-js | **0.19.0** | 2D-fysikk |

Plugins som faktisk registreres: `ScrollTrigger` og `Observer`.
CMS er Sanity, hosting Vercel, analyse Umami **pluss** GTM og GA.

- **Tekstoppdelingen er deres egen, ikke GSAPs SplitText.** `<h1>` kommer
  ferdig oppdelt fra serveren: linje `.l` → ord `.w` → tegn `.c` → fragment `.f`.
  30 `data-split-text`, 125 tegn-spans på forsiden.
- **Avdekkingen er `overflow: hidden`-masker, ikke clip-path.** Målt i deres
  hoved-CSS: `clip-path` 0, `mix-blend-mode` 0, `animation-timeline` 0,
  `view-transition` 0. **Vi bruker tre av disse fire; de bruker ingen.**
- **Ingen egenskrevet WebGL.** `THREE` = 0 treff. De tre `getContext("webgl"`
  ligger inntil strengene `"mesh will not be drawn"` og `rive_fallback` – det er
  Rives interne renderer.
- Skrift: **Sequel Sans** (kommersiell), fire snitt, inkludert en egen vekt 450.
  Flytende skala opp til `clamp(…, 180px)`.
- «3D-en» er bakt video: `jeton-3dapp-fhd.mp4`, `jeton-card-rip.mp4`.

### phamilypharma.com – avvikeren uten GSAP

| Bibliotek | Versjon | Bevis |
|---|---|---|
| Lenis | **1.1.9** | `window.lenisVersion="1.1.9"` |
| Locomotive Scroll v5 | – | eksakt v5-signatur i opsjonsobjektet |
| @barba/core | – | `logger=new Lt("@barba/core")`, `x-barba`-header |
| SplitType | – | standardobjekt med `lineClass`/`wordClass`/`charClass` |
| modular.js | – | `data-module-*`-skanning |

**Og dette er teknikken verdt å kopiere.** JavaScript deler teksten i linjer og
skriver én CSS-variabel. CSS gjør hele animasjonen:

```css
.line {
  opacity: 0;
  transform: translateY(25px) rotate(3deg);
  transition:
    transform .5s cubic-bezier(.17,.67,.3,1.33) var(--delay),
    opacity   .5s ease-in-out                   var(--delay);
}
```

JS gjør bare `new SplitType(…, {types:"lines"})` og deretter
`r.style.setProperty("--delay", `${.2*(s+1)}s`)`.

Signaturen er at linjene **reiser seg 25 px og retter seg opp 3 grader samtidig**,
på en kurve som skyter over. Det er tre tall. Vi har allerede `fra="skjev"` i
`Avslor` som gjør nesten det samme – men vi gjør det som én av syv valgfrie
gester, ikke som husets ene bevegelse.

Andre grep:

- **Tusjstrek over hver `<strong>`:** `linear-gradient(to top, transparent 10%,
  #FFA9E9 10.01%, #FFA9E9 83%, transparent 83.01%)` animert fra
  `background-size: 0 100%`. Null kilobyte, og den markerer *poenget* i setningen.
- **Spredte kort som stabler seg**, drevet av `--scroll-progress` med ulik vinkel
  per barn: `rotate(calc(.3deg * (4 + var(--scroll-progress))))`, barn 2 `-1deg`,
  barn 3 `1.4deg`.
- **Teamet som et klikkbart kart over Frankrike.**
- **Tempo:** `transition-delay: 3s` og `3.2s` på heroens hender, som faller til
  `1s`/`1.2s` ved gjenbesøk via en `.-onceAnimate`-klasse. Noen satt og stilte inn
  et tre sekunders hold.

Typografi: **Anton** i versaler på `clamp(11rem, 8.5vw, 13rem)` (110–130 px),
`line-height: .93`, `letter-spacing: -.13rem`, og **Poppins** 400/600 til alt annet.
Ingen tredje skrift, ingen kursiv. Palett `#09543D` dyp grønn + `#FFFDF7` krem,
detonert med `#FFA9E9` tyggegummirosa (også `::selection`), `#CCF337` syrlig lime,
`#FFC200`, `#F45C24`.

### osmo.supply – GSAP er husmotoren

Webflow-side. Pinnede CDN-versjoner lest i deres egne `<script src>`:

```
gsap@3.15: gsap.min.js, ScrollTrigger, SplitText, Draggable, InertiaPlugin, Observer
gsap@3.14: CustomEase.min.js
lenis@1.3.23 · @barba/core@2.10.3 + @barba/prefetch@2.2.0
hls.js@1.6.11 · jquery-3.5.1 (Webflow) · outseta.min.js · plausible.io
```

Av 30 ressurssider lest direkte (av ~220 i katalogen): **~70 prosent GSAP,
~13 prosent ren CSS, ~13 prosent vanilla/Canvas 2D, ~3 prosent Three.js,
0 prosent Motion.dev.** Andelen er ekstrapolert fra utvalget, ikke fra hele katalogen.

Tre funn som er relevante for oss:

1. **Deres egen ressurs `stacking-cards-3d-css` er ren CSS med
   `animation-timeline: view()`**, og siden sier eksplisitt «no JavaScript is
   involved». Det er teknikken vi alt har 91 treff på.
2. **«3D-en» er CSS 3D-transformer, ikke WebGL.** 25 `transform-style: preserve-3d`
   i osmo.css. `3d-cards-tornado` og `globe-gallery` bruker `matrix3d()` uten
   Three.js.
3. **43 `font-variation-settings`.** Variabelskriftanimasjon er et reelt
   osmo-grep: `variable-font-weight-hover` animerer `wght` per tegn etter
   avstand til pekeren.

Skrift: Haffer VF / Haffer XH / Haffer Mono (Displaay, kommersiell variabel) +
Brisa Pro.

### spinxdigital.com – den nærmeste konkurrenten, og en gave

Dette er byrået brandboken alt måler oss mot. Hva det faktisk kjører (observert):

**WordPress på Bedrock-oppsett** (`/app/themes/`, `/app/uploads/`, `/wp/wp-includes/`),
eget tema, Gravity Forms, Max Mega Menu, Cookie Notice, Akismet,
All in One SEO Pro 4.9.4.2, og **NitroPack** foran alt (`x-nitro-cache: HIT`).

- **GSAP: ja, men bare kjernen.** `_gsap` ×27 og `GreenSock` inne i
  `nitro-min-app.js`. **Ingen ScrollTrigger** – null treff på `scrollerProxy`,
  `normalizeScroll` eller `refreshPriority`. Eksakt versjon overlevde ikke
  NitroPacks bunting og **kunne ikke verifiseres**.
- **jQuery i 2026** – kjerne, migrate, cookie, json, hoverIntent.
- **En `accessiBe`-overlegg på 239 kB – 60 prosent av all JavaScript på siden.**
- **Rundt ti sporingsleverandører** i CSP-en: GTM, GA, Hotjar, Microsoft Clarity,
  Meta Pixel, LinkedIn Insight, Mixpanel, HubSpot, Zoho PageSense, Apollo.io,
  Leadfeeder.
- ~1,11 MB førstelast, ~2,18 MB etter full scroll. **136 MB uoptimalisert MP4
  ligger ett klikk unna** (en vitnemålsvideo på 71 MB). En `loader.gif` på 101 kB.
  `loading="lazy"` forekommer **null ganger** – all lazy-loading avhenger av
  NitroPacks JavaScript.

Vær rettferdig: ~1,1 MB er **ikke** katastrofen man forventer av et byrånettsted.
NitroPack gjør reelt arbeid, og de ligger på medianen.

Men to av funnene er direkte salgsmateriale for oss, og de må brukes nøyaktig:

1. **De bruker et tilgjengelighetsoverlegg.** Et overlegg er bredt kritisert som
   erstatning for faktisk utbedring. Vi fikser kildekoden og måler den.
2. **De har rundt ti sporere og et cookie-banner. Vi har null cookies.**
   Brandboken sier de «roper mindre enn oss på alt vi trodde var problemet» –
   det stemmer visuelt, og samtidig laster de ti ganger så mye tredjepart.

### davidlangarica.dev – og en korreksjon

Next.js App Router på Vercel, React 19.2.0, next-i18n-router, CSS Modules
(**ingen Tailwind** – null `--tw-`-tokens), Umami i stedet for GA.
**three.js r185 + @react-three/fiber + /postprocessing + /drei**, syv blokker
håndskrevet GLSL, og **Lenis 1.3.25**.

**884 kB førstelast, hvorav 671 kB JavaScript over 29 biter.** Polyfiller alene
er 41,3 kB. Skriften `dreamFont` sendes som **.otf (44,3 kB)** der woff2 ville
halvert den.

**Korreksjon, og den er lærerik:** et naivt søk finner «GSAP» og «Astro» i
bunten hans. Begge er **brødtekst** – hans egen ferdighetsliste og
prosjektbeskrivelser. Null `_gsap`, null `gsap.registerPlugin`. Strengen
`version:"3.38.1"` er **core-js**, ikke GSAP. Et grep i en minifisert bunt er
ikke et bevis før man har sett konteksten.

**Ingen offentlig repo finnes** – `github.com/DavidLangarica` har 25 repoer, alle
studiearbeid. Avhengighetslisten er derfor fingeravtrykk, ikke `package.json`.
Han viser SpinX- og Awwwards-logoer som referanser; **ingen faktisk
Awwwards-utmerkelse kunne verifiseres**.

### Hva dette betyr for valgene våre

| Grep | jeton | phamily | osmo | oss |
|---|---|---|---|---|
| `animation-timeline` | 0 | 0 | ja, i én ressurs | **91** |
| `clip-path` | 0 | – | – | **14** |
| `mask-image` | 0 | – | – | **17** |
| `prefers-reduced-motion` | **0** | **0** | 2 | **67** |
| Navngitt easing | nei (easings.net) | egenskrevet oversving | **ja, «osmo»** | **nei** |
| Egne illustrasjoner | 3D-renderinger | **23 håndgester** | 90 foto | **0** |
| Innleid tekstforfatter | – | **ja, kreditert** | – | **nei** |
| Variabelskriftanimasjon | – | – | **ja, 43 steder** | **nei** |

---

## Del 4 – Nettleserplattformen: hva som har landet

### Hva prisvinnerne faktisk tar i bruk, og hva de ikke tar i bruk

Målt på to måter: 50 mot 50 tilfeldige Awwwards Site-of-the-Day-vinnere fra 2024
mot 2026 (fingeravtrykk i serverte bunter), og 18 Codrops-casestudier fra
juli–oktober 2026 der studioene selv oppgir stacken.

| Teknikk | 2024 | 2026 | Vår bruk |
|---|---|---|---|
| GSAP core | 69 % | **73 %** | 0 |
| ScrollTrigger | 67 % | 69 % | 0 |
| Lenis | 58 % | **62 %** | 0 |
| Three.js | 31 % | **35 %** | 0 (forbudt i brandboken) |
| React Three Fiber | 11 % | **4 %** | 0 |
| **View Transitions** | 13 % | **44 %** | **0** |
| **`prefers-reduced-motion`** | 33 % | **58 %** | **67 treff** |
| **CSS `animation-timeline` / `view-timeline`** | **2 %** | **2 %** | **91 treff** |
| `@container` | 2 % | 10 % | 2 |
| `@starting-style` | 2 % | 6 % | 19 |
| Motion / motion.dev | 9 % | 10 % | 0 |

Tre lesninger av dette som endrer hvordan vi snakker om oss selv:

1. **Scroll-drevne animasjoner er helt flate på 2 prosent i to år**, mot
   ScrollTrigger på 69. State of CSS 2026 sier 17,6 prosent har brukt dem, og
   52,3 prosent har «hørt om, ikke brukt». Vi har 91 deklarasjoner. Vi er ikke
   bakpå her – vi er på feil side av normalfordelingen i riktig retning, og det
   er en artikkel verdt.
2. **View Transitions er det største hoppet som ble målt, 13 → 44 prosent.**
   Det er den teknikken bransjen flyttet seg mest på i år, og vi har null.
   Se forslag 12.
3. **«WebGL ut, native CSS inn» er usant på prisnivå.** Three.js *vokste*
   31 → 35 prosent, og Awwwards' egen 3D-tagg er på sitt høyeste noensinne,
   37,6 prosent i 2026. Brandbokens forbud mot WebGL er derfor et bevisst valg
   om å gå motstrøms, ikke et valg som følger strømmen. Det er greit, men det
   skal kalles det det er.

Levetidstellinger på Awwwards' egne tagger: **gsap ≈4 558 nettsteder · webgl
≈3 168 · three-js ≈2 046 · framer-motion ≈459.** GSAP er omtrent ti ganger
Motion. Awwwards har **ingen tagg i det hele tatt** for Lenis, Rive, Theatre.js,
R3F, OGL eller WebGPU.

Og én ting som peker samme vei som Del 1: **Awwwards publiserer nå
Tilgjengelighet og WPO som to av seks underkarakterer i Developer Award.**
Den designdrevne Site of the Year fikk Tilgjengelighet 7,00 og WPO 7,60.
Det er to av seks karakterer vi ville slått.

Trendretningen i innhold bekrefter Del 1: **Storytelling-taggen steg 15,3 → 24,0
prosent** (sitt høyeste), mens Typografi falt 29,3 → 18,6, Minimal 13,2 → 9,7 og
Parallax 14,8 → 6,8. Brutalismen er på retur.

### Tryggest først: funksjoner i alle tre motorer, ren CSS, null kB

Disse er **ikke** i bruk hos oss i dag og kan tas i bruk uten vakt eller reserve
utover vanlig standardtilstand.

| Funksjon | Baseline | Chrome | Firefox | Safari | caniuse | Degraderer til |
|---|---|---|---|---|---|---|
| **`@media (scripting: none)`** | **widely 2026-06-07** | 120 | **113** | 17 | – | ingen regel treffer |
| **`sibling-index()` / `sibling-count()`** | newly 2026-08-18 | 138 | **154** | 26.2 | – | flat styling uten trappe |
| **`contrast-color()`** | newly 2026-04-10 | 147 | **146** | 26 | – | må ha håndsatt reserve |
| **`text-box-trim` / `text-box-edge`** | ikke Baseline | 133 | **154** | 18.2 | 85–87 % | vanlige linjebokser |
| **`content-visibility: auto`** | newly 2025-09-15 | 108 | 130 | 26 | 93,91 % | ingen hopp over rendering |
| **`offset-path` / `offset-distance`** | – | 46 | **72** | 16 | **96,84 %** | elementet står i ro |
| **`:open`** | newly 2026-05-11 | 133 | 136 | 26.5 | – | ingen åpen-stil |
| CSS anchor positioning | limited (per motor-hull) | 125 | **147** | 26 | 85,91 % delvis | vanlig absolutt posisjon |
| `shape()` | newly 2026-02-24 | 135 | **148** | 18.4 | 88,95 % | `polygon()`-reserve først |
| Container size queries | **widely 2025-08-14** | 105 | 110 | 16 | 94,79 % | standardregel |
| Container style queries `style()` | newly 2026-05-19 | 111 | **151** | 18 | ~90 % delvis | standardregel |
| `popover` + `popovertarget` | newly 2025-01-27 | 116 | 125 | 17 | **93,59 %** | elementet vises inline |
| `command` / `commandfor` | newly 2025-12-12 | 135 | **144** | 26.2 | 86,32 % | knappen gjør ingenting |
| `text-wrap: balance` | newly 2024-05-13 | 114 | 121 | 17.5 | 87,92 % | vanlig brytning |
| `@scope` | newly 2026-03-24 | 118 | **146** | 17.4 | 91,66 % | **hele blokken faller ut** |
| `::details-content` | newly 2025-09-16 | 131 | 143 | 18.4 | – | vanlig åpne/lukke |

### Krever vakt: ikke i Firefox

| Funksjon | Chrome | Firefox | Safari | caniuse | Merknad |
|---|---|---|---|---|---|
| **Kryssdokument-visningsoverganger** (`@view-transition`) | 126 | **ikke sluppet** | 18.2 | 85,97 % | se under |
| **Scroll-drevne animasjoner** | 115 | **kommer 159 eller 160** | 26 | 87,84 % | se under |
| `text-wrap: pretty` | 117 | **nei** (feil 1960910, NEW) | **26** | 87,62 % | Safari 26 vurderer hele avsnittet, ikke bare siste fire linjer |
| `interpolate-size` / `calc-size()` | 129 | **nei, ingen pref finnes** | **nei** | 71,74 % | to motorer mangler |
| `display`-overgang (`allow-discrete`) | 117 | **nei** (pref `false`) | 18 | – | utgang skjer momentant |
| `::scroll-marker` / `::scroll-button` | 135 | **nei** | **nei** | 71,14 % | se frarådingen |
| `scroll-state()`-container queries | 133 | **nei** | delvis plumbing | – | Chromium-kosmetikk |
| `reading-flow` / `reading-order` | 137 | **nei** | **nei** | – | se frarådingen |
| CSS `if()` | 137 | **nei** | kun TP | 70,22 % | ugyldig erklæring forkastes |
| `@function` | 139 | **nei** | kun TP | 70,46 % | bruk byggtidsabstraksjon |
| `corner-shape` / `superellipse()` | 139 | **kun Nightly** | kun TP | 70,46 % | faller til `border-radius` |
| `interestfor` | 142 | **nei** | **nei** | 70,19 % | spec er en uflettet WHATWG-PR |
| `overlay` | 117 | **nei** | **nei** | 74,25 % | kun Chrome |
| Speculation Rules | 109 | **ingen implementasjon** | kun `prefetch` bak pref | – | se under |
| CSS Grid Lanes (masonry) | 140 bak flagg | bak flagg | **26.4** | 12,49 % | ikke klar |

### De to datoene som betyr noe for oss

**1. Scroll-drevne animasjoner kommer til Firefox om noen uker.**
Bugzilla [1324602](https://bugzilla.mozilla.org/show_bug.cgi?id=1324602) –
«Ship CSS scroll-driven animations (let `layout.css.scroll-driven-animations.enabled`
ride the trains to release)» – er **RESOLVED FIXED**, `target_milestone: 159 Branch`,
løst **4. oktober 2026**. Firefox' kilde har nå `value: true` på `main`.
Firefox 159 slippes **27. oktober 2026**.

Konflikt, flagget: caniuse fører fremdeles Firefox som uten støtte til og med 159,
med første støtte i **160**. Bugzilla sier 159. Firefox 159-utgivelsesnotatene er
tomme ennå, så **dette kunne ikke avgjøres**. Planlegg for «159 eller 160, slutten
av oktober eller slutten av november 2026».

Konsekvens for oss: de 91 `animation-timeline`-deklarasjonene og
IntersectionObserver-reserven i `Avslor` blir native i Firefox i løpet av
2–8 uker, uten én linje arbeid. Det er verdt å måle før og etter, og det er verdt
å skrive om i en artikkel.

**2. Kryssdokument-visningsoverganger kommer ikke til Firefox med det første.**
`@view-transition`-regelens parsing, serialisering og CSSOM landet i Firefox 151
(bug [2020327](https://bugzilla.mozilla.org/show_bug.cgi?id=2020327), FIXED), men
`dom.viewTransitions.cross-document.enabled` har `value: false` **på alle kanaler,
også Nightly**. `pageswap`-hendelsen er uferdig: bug
[1881438](https://bugzilla.mozilla.org/show_bug.cgi?id=1881438) er ASSIGNED, sist
rørt 5. oktober 2026, uten milepæl. Og Firefox 144–147 støtter *samme-dokument*
visningsoverganger og *samme-dokument* typer – ikke kryssdokument.
**Ingen Firefox-versjon har sluppet det, og det finnes ingen annonsert dato.**

Det endrer likevel ikke konklusjonen om å ta den i bruk, og det korrigerer en
tidligere intern konklusjon. Se forslag 12.

### Firefox ESR er det egentlige gulvet

Firefox ESR er **140.17** (ESR-neste 153.4). ESR 140 er eldre enn
visningsoverganger (144), anchor positioning (147), `@scope` (146),
Navigation API (147), style queries (151) og `field-sizing` (152).

Det betyr at hver av de funksjonene trenger en **fungerende utgangstilstand uten
funksjonen**, ikke bare en uten animasjon. Det er samme disiplin `Avslor` alt har,
anvendt bredere.

---

## Del 5 – GitHub-repoer: hva som finnes, og hva som holder

Størrelser er merket `BP` (bundlephobia-API), `egen` (nedlastet dist gjennom
`gzip -9`; for uminifiserte filer er det et **øvre tak**) eller `påstått`
(prosjektets eget tall). Bundlephobia ratebegrenset oss (HTTP 429) på de fleste
oppslag, så kontroller alt som tas inn.

### De få som faktisk passer rammene våre

| Navn | URL | kB gz | Stjerner | Lisens | Krever JS | Hva det gir oss |
|---|---|---|---|---|---|---|
| **charts.css** | github.com/ChartsCSS/charts.css | 5,7 (egen, min) | 6,6k | MIT | **Nei** | Diagrammer fra en semantisk `<table>`. Tallene er lesbare med CSS og JS av – det er æresregelen vår, uttrykt i markup |
| **pattern.css** | github.com/bansal/pattern.css | **1,0** (egen) | 3,9k | MIT | **Nei** | Mønsterflater i ren CSS, null forespørsler |
| **transition-style** | github.com/argyleink/transition.css | 2,1 (egen) | 2,0k | ISC/Apache-2.0 (**motstridende**) | **Nei** | Ferdige keyframes for View Transitions |
| **@zachleat/table-saw** | github.com/zachleat/table-saw | 1,7 (egen) | 338 | MIT | **Nei** | Responsive tabeller; vanlig tabell uten JS |
| **@zachleat/details-utils** | github.com/zachleat/details-utils | 2,8 (egen) | 272 | MIT | **Nei** | Animer, tving åpen, lukk ved klikk utenfor – `<details>` virker som før uten JS |
| **@zachleat/filter-container** | github.com/zachleat/filter-container | 2,7 (egen) | – | MIT | **Nei** | Filtrering av en liste der hele listen vises uten JS |
| **@11ty/is-land** | github.com/11ty/is-land | 3,8 (egen) | 636 | MIT | **Nei** | Øyer med `<template>`-reserve; innholdet rendres før JS |
| **prop-for-that** | github.com/argyleink/prop-for-that | 3,1 (egen) | 919 | MIT | Ja | Fører peker/synlighet inn i CSS custom properties, så CSS gjør bevegelsen |
| **Fontsource / Capsize / subfont / glyphhanger** | fontsource/fontsource, seek-oss/capsize, Munter/subfont, zachleat/glyphhanger | **byggtid, 0 kB kjøretid** | 6,2k / 1,7k / 1,6k / 905 | MIT | **Nei** | Subsetting og metrikk-matchede reserveskrifter. Direkte relevant: skriften er 68 % av førstelasten vår |
| **@unpic/placeholder** | github.com/ascorbic/unpic-placeholder | ~2, **byggtid/SSR, 0 kB kjøretid** | 188 | MIT | **Nei** | LQIP-plassholder som vises uten JS |

Merk om plassholdere, siden premisset ofte gjentas feil: **thumbhash er ikke
mindre enn blurhash.** Målt på bundlephobia er blurhash 1,59 kB og thumbhash
2,03 kB. Thumbhash velges for alfakanal og sideforhold, ikke for størrelse.
Og `@unpic/placeholder` slår begge for vårt bruk, fordi plassholderen vises
**uten JavaScript**.

Advarsel på Capsize: **`@capsizecss/metrics`' `entireMetricsCollection` er ~255 kB
gzip.** Importer én skrift (~0,4 kB), aldri samlingen.

### Vurdert og forkastet, med grunn

| Navn | kB gz | Hvorfor ikke |
|---|---|---|
| **GSAP 3.15.0** (+ScrollTrigger +SplitText) | 27,6 / 17,5 / 3,6 = **48,7** (egen måling på 3.15.0) | **9× hele interaksjonslaget vårt** (5,39 kB). Se lisensavsnittet under – den er gratis, men ikke åpen kildekode |
| **Lenis 1.3.26** | 5,4 + CSS ≈ 7,7 med snap (egen) | Brandboken forbyr scroll-jacking. Og tastaturrulling håndteres **fremdeles ikke** – se under |
| **Rive** (`@rive-app/canvas` 2.44.0) | **≈878** – `rive.wasm` alene er **819,5 kB gzip** | **Ikke 60–250 kB, som vårt eget eldre notat sa.** Se under – dette er den største korreksjonen i denne runden |
| **Motion 14.0.0** (full vanilla) | **47,7** (egen, stemmer med BP til 0,2 %). `motion/mini` **3,24** målt | Deres egen dokumentasjon påstår 2,3 kB på én side og 2,6 kB på en annen. **Begge er feil** – Motions eget CI-budsjett for samme bunt sier 3,2 kB. Mini dekker uansett ingenting vi mangler |
| **Theatre.js** | – | **Offentlig frosset.** Siste offentlige commit 2024-04-11, `@theatre/core` 0.7.2 sist publisert 2024-05-19. README sier utviklingen er «temporarily moved to a private repo» – i to og et halvt år |
| **OGL** | 12,7 tre-shaket / 34,2 full | Også stille: siste commit 2025-04-13, siste utgivelse 2025-01-27 |
| **anime.js v4** | **40,3** hele pakken (BP) | Bare levedyktig tre-shaket; modulær `animejs/waapi` ~3–3,5 er **ikke verifisert** |
| **Splitting.js** | 1,8 + 0,6 CSS | **Erstattet av plattformen.** `sibling-index()` setter indeksen i CSS, i alle tre motorer, for 0 kB |
| **NumberFlow** | 5,7 (BP) / ~7,5 (egen) – tallene er motstridende | `<number-flow>` er et ekte vanilla-element og respekterer `prefers-reduced-motion`. Men `Nokkeltall` gjør det på **0,83 kB** |
| **Paper Shaders** | ~6–12 per shader; **64,2 hele pakken** (BP) | Brandboken forbyr WebGL og mesh-gradienter. 0.0.x, README advarer om brudd i patch-versjoner |
| **Lottie** | 15 % av prisvinnerne bruker den | Dropbox Brand (CSSDA Website of the Year 2025) kjører Lottie uten WebGL og uten GSAP – men 2,05 MB av vekten der er skrifter. Vi har ikke materialet |
| **scroll-timeline-polyfill** | 16,8 (egen, uminifisert) | Testet på ekte i `docs/research-animasjon.md` og **virket ikke**. Og Firefox fikser det selv om 2–8 uker |
| **quicklink** | 2,5 (BP) | Astros egen `prefetch` med `hover` gjør jobben for 0 kB |
| **ZzFX** | 1,3 (BP) | Lyd er ikke en faktor hos forbildene: 0 `AudioContext` hos både phamily og osmo. Og lyd uten brukerinitiering er et tilgjengelighetsproblem |
| **@oddbird/css-anchor-positioning** | **35,8–40,7** (egen) | Unødvendig: anchor positioning er i alle tre motorer |
| **@oddbird/popover-polyfill** | 3,8 | Unødvendig: `popover` er Baseline siden januar 2025 |
| **WICG/focus-visible** | – | Foreldet. Deres egen README: «not planning new versions» |
| **css-doodle** | **57,3** (egen) | Over budsjett |
| **media-chrome** | **41,7** (BP) | Over budsjett |
| **@bsmnt/scrollytelling** | – | React + GSAP som peer deps |
| **zstd i `server.mjs`** | – | **Målt og forkastet.** Node 22 har `zlib.zstdCompress`, men på forsiden vår gir zstd nivå 19 **28 959 byte mot brotlis 27 204 – 6,5 prosent dårligere**. Brotli vinner på HTML. Ikke verdt kodelinjene |

### Tre ting som er verdt å lese selv om vi forkaster bibliotekene

**GSAP er gratis, men ikke åpen kildekode – og versjonen er 3.15.0, ikke 3.13.**
Alt som før var Club GreenSock er fritt siden 29. april 2025, inkludert SplitText
og MorphSVG, og det er bekreftet hardt: **hver tidligere betalt plugin ligger i
den offentlige npm-pakken.** Men `package.json` har den bokstavelige lisenslinjen

```
"license": "Standard 'no charge' license: https://gsap.com/standard-license."
```

og det finnes **ingen `LICENSE.md`** i repoets rot. «Prohibited Uses» dekker blant
annet implementasjon i verktøy som lar brukere bygge visuelle animasjoner uten
kode og som dermed konkurrerer med Webflows egne animasjonsverktøy. For oss selv
er dette uproblematisk. For et byrå som leverer til kunder i nettsidemarkedet er
poenget verdt å huske: **gratis som i gratis øl, ikke gratis som i MIT**, og
vilkårene eies av en aktør i samme marked. Dette presiserer og oppdaterer
`docs/research-animasjon.md`, som målte 44,21 kB på en eldre versjon.

**Lenis ignorerte `prefers-reduced-motion` helt fram til 5. august 2026 – og alle
tre forbildene ligger under den versjonen.** `respectReducedMotion` forekommer
**null ganger i 1.3.0 til 1.3.25 og fire ganger i 1.3.26**, der den nå er `true`
som standard. Endringen kom av issue #534, åpnet 31. juli 2026, fra en bruker som
skrev at hun ble kvalm og svimmel, og at Lenis «purports to be accessible … it
does not respect prefers-reduced-motion».

Konsekvens, og den er direkte brukbar: **jeton.com kjører Lenis 1.0.42,
phamilypharma 1.1.9, osmo.supply 1.3.23 og davidlangarica.dev 1.3.25.**
Alle fire er under 1.3.26. Alle fire ignorerer altså brukerens
bevegelsesinnstilling i den mykgjorte rullingen. Det er mekanismen bak
observasjonen i Del 1 om at `prefers-reduced-motion` praktisk talt er fraværende
hos forbildene.

Og det som fremdeles ikke er fikset: **tastaturrulling håndteres ikke i det hele
tatt** – ingen `keydown`-lytter noe sted. Issue #518 er åpen og fiksen (PR #519)
ble lukket uten å bli flettet; issue #107 har stått åpen siden 2023 om at
rullingen ikke kan avbrytes med tastatur eller rullefelt. Riktig WCAG-kobling er
**2.3.3 Animation from Interactions**, som er **nivå AAA** – altså utenfor den
vanlige AA-grunnlinjen. **2.2.2 Pause, Stop, Hide gjelder ikke**, fordi den
krever bevegelse som starter av seg selv og varer over fem sekunder.

**Rive koster ikke 60–250 kB. Den koster nesten en megabyte.** Dette er den
største korreksjonen i denne runden, og den retter et tall vårt eget
`docs/research-kreativt.md` oppgir:

| Pakke | JS gzip | **WASM gzip** | Realistisk total |
|---|---|---|---|
| `@rive-app/canvas` 2.44.0 | 59,0 | **819,5** | **≈878 kB** |
| `@rive-app/canvas-lite` | 51,6 | 367,1 | ≈419 kB |
| `@rive-app/webgl2` (nå anbefalt) | 60,0 | 925,3 | **≈985 kB** |
| `@rive-app/canvas-single` (WASM inline) | – | – | **1,20 MB i én forespørsel** |

Grunnen til at tallet sirkulerer feil er at **bundlephobia ikke ser WASM-en** –
den hentes fra et CDN ved kjøring, noe Rive dokumenterer selv som en fordel for
buntstørrelsen.

Tre ting til, som gjør den uforenlig med rammene våre uansett vekt:

- **Ingen dokumentert degradering uten JavaScript.** I hele dokumentasjonskorpuset
  deres (1,76 MB) forekommer `noscript` **null ganger**, og «progressive
  enhancement», «poster image» og «fallback image» finnes ikke i relevant form.
  Uten JS er det et blankt `<canvas>`.
- **Tilgjengelighet er opt-in.** `SemanticMode.Disabled` er den dokumenterte
  **standarden**, så ut av boksen er en Rive-grafikk et umerket `<canvas>` for
  hjelpemidler.
- **Redusert bevegelse er helt manuelt:** Rive sier selv at den «can't
  automatically decide which motion should be reduced» og at preferansen må sendes
  inn som en databinding.

Til sammenligning: jeton.com laster 1,16 MB Rive for sin fem-stegs demo. Det er
**ti ganger hele vår førstelast** for én komponent.

### Lisenser å passe på

Funnet under gjennomgangen: `hover-tilt` er MPL-2.0 på npm og MIT på GitHub.
`transition-style` er ISC på npm og Apache-2.0 i repoet. `marquee6k` og
`lite-vimeo-embed` **deklarerer ingen lisens** – behandles som alle rettigheter
forbeholdt. `ditherjs` er CC-BY-SA-4.0, som er en dårlig lisens for kode.
OGL er Unlicense.

---

## Del 6 – Rangert liste

Rangeringen er effekt delt på innsats, vektet mot hva vi selger på: etterrettelighet,
ytelse og lovlighet. Kolonnen «motorer» sier hvor det virker i dag.

| # | Forslag | kB | Kompleksitet | Motorer |
|---|---|---|---|---|
| 1 | Bygg egne fontsubsett; fiks de tre manglende tegnene | **−15,4** | Lav | alle |
| 2 | Slå på `SceneFilm loope` på én side | **0** | Triviell | alle |
| 3 | Navngitte easing-tokens, og én signaturkurve | **0** | Lav | alle |
| 4 | Få CSS-en ut av HTML-en og gjør den cachbar | **−18/navigering** | Middels | alle |
| 5 | `@media (scripting: none)`: den fjerde tilstanden blir stylbar | **0** | Lav | alle |
| 6 | `sibling-index()` i stedet for `trinn`-propen | **0** | Lav | alle |
| 7 | `text-box-trim`: typografisk presisjon som matcher hårlinjen | **0** | Lav | alle |
| 8 | `offset-path`: bevegelse i ro som bærer informasjon | **0** | Middels | alle |
| 9 | FAQ-animasjon i alle tre motorer, ikke bare Chromium | **0** | Lav | alle |
| 10 | `content-visibility: auto` + `contain-intrinsic-size` | **0** | Lav | alle |
| 11 | `contrast-color()` som sikkerhetsnett, ikke som erstatning | **0** | Lav | alle |
| 12 | `@view-transition { navigation: auto }` | **0** | Lav | Chrome, Safari |
| 13 | Ny funksjonalitet: agent-beredskapssjekk | 0 klient | Høy | alle |
| 14 | Ny funksjonalitet: markdown-innholdsforhandling | 0 klient | Lav | alle |
| 15 | Ny funksjonalitet: norske tall fra uutilsynets åpne datasett | 0 klient | Middels | alle |
| 16 | Content Signals i `robots.txt` | **0** | Triviell | alle |
| 17 | Tusjstreken: én typografisk signatur i ren CSS | **0** | Lav | alle |
| 18 | Variabelskriftakse som bevegelse | **0** | Lav | alle |
| 19 | Et eget illustrasjonsvokabular | medier | Høy, koster penger | alle |
| 20 | En innleid tekstforfatter | 0 | Koster penger | – |
| 21 | Én minneverdig idé per side | 0 | Høy, krever en beslutning | alle |
| 22 | Distinkt variabel displayskrift | ~0 netto | Middels | alle |

---

### 1. Bygg egne fontsubsett, og fiks de tre manglende tegnene

**Hva det er:** Vi lager skriftfilene våre selv, med nøyaktig de bokstavene
nettsiden bruker, i stedet for å bruke Googles ferdige pakker.

**Hvorfor det passer oss:** Dette er ikke pynt, det er en feilretting. Pilen `→`
ved siden av nesten hver knapp på nettstedet rendres i dag i operativsystemets
skrift, fordi glyffen ikke finnes i filene vi serverer (målt med fontTools, se
Del 2). Det samme gjelder `≤` og `≥` i ytelsesbudsjettet på `/status`. Et
nettsted som selger presisjon kan ikke ha ulik strektykkelse på pilen ved
primærknappen per operativsystem. Og skriften er 68 prosent av førstelasten vår,
så det er også den største tilgjengelige ytelsesgevinsten.

**Kostnad:** **Sparer 15,4 kB** (målt: displayskriften 45,8 → 30,4 kB).
Lav kompleksitet – fontTools 4.51.0 er installert, og begge familiene er
SIL OFL 1.1, som tillater subsetting. Et skript på ~30 linjer i `scripts/`,
eller `subfont` / `glyphhanger` i byggsteget.

**Dokumentasjon:** [Munter/subfont](https://github.com/Munter/subfont) (krabber
HTML-en, lager subsett per side og **instansierer variable skrifter til de aksene
som faktisk brukes**) · [zachleat/glyphhanger](https://github.com/zachleat/glyphhanger) ·
[fontsource/fontsource](https://github.com/fontsource/fontsource) ·
[seek-oss/capsize](https://github.com/seek-oss/capsize)

En gratis bonus i samme omgang: Capsize sin `createFontStack()` genererer
`@font-face`-regler for **reserveskriften med matchede metrikker**, slik at
ombrytingen ikke hopper når webfonten kommer. Vi har `font-display: swap`, som
betyr at det hoppet skjer i dag.

**Risiko:** Monoskriften rendrer **fremmed** innhold – URL-er, foretaksnavn fra
Enhetsregisteret, WCAG-meldinger. Et hardt subsett der gir tofu på et polsk
foretaksnavn. Derfor to tiltak: subsett **displayskriften** hardt (overskrifter er
skrevet av oss), og la **monoskriften** beholde hele latin og latin-ext.
Legg U+2192, U+2264 og U+2265 til i begge. Ingen JS involvert, ingen
nettleserforskjell, ingen tilgjengelighetsrisiko. `font-display: swap` står
allerede riktig.

---

### 2. Slå på `SceneFilm loope` på én side

**Hva det er:** Vi har et videoklipp som kan gå i løkke i full styrke, men det
er ikke tatt i bruk noe sted. Vi slår det på.

**Hvorfor det passer oss:** Dette er tiltak nummer én i vår egen rangering i
`docs/referanser.md`, der det står at det er «det eneste tiltaket som direkte
svarer på *det er bevegelse jeg ønsker*». Målingen bak er at jeton.com har
485 pikselavvik når siden står helt stille, osmo 222, vi 153. Siden vår beveger
seg bare når noen rører den. `SceneFilm.astro` har propen `loope`, som fjerner
masken og setter opasitet 1 – og `grep -rn 'loope' src/pages/` gir null treff i
markup. Funksjonen er bygget og slått av.

**Kostnad:** **0 nye kB.** Videoen ligger i repoet med `preload="none"` og
plakatbilde. Triviell kompleksitet: én prop på én komponent.

**Risiko:** Lav, men ikke null. Klippet må fortsatt være `muted playsinline`,
må stoppes under `prefers-reduced-motion` (`SceneFilm` har allerede
`display: none` på videoen der), og må ikke starte før plakatbildet er malt.
Det er `aria-hidden="true"`, så skjermlesere berøres ikke. Vurder også
`loading="lazy"` – `@media` lazy video er bare Chrome 150 (64,69 % caniuse), så
behold `preload="none"` som den virkende mekanismen.

---

### 3. Navngitte easing-tokens, og én signaturkurve

**Hva det er:** Vi gir bevegelsen vår et navn og en fast kurve, slik vi har gjort
med farger og avstander, i stedet for seks forskjellige kurver spredt rundt.

**Hvorfor det passer oss:** Brandbokens harde regel er at alle verdier går gjennom
`tokens.css`. Easing er den ene verdiklassen som slapp unna: 6 ulike
`cubic-bezier()` i 24 forekomster, pluss 37 nakne `ease`/`ease-out`/`linear`,
og **null tokens** (målt). Og det er den verdiklassen som bærer karakter.
osmo.supply har én kurve og kalte den `"osmo"`. Phamilypharma, den minst
bibliotekstunge av de tre, har egenskrevne oversvingskurver
(`cubic-bezier(.17,.67,.3,1.33)`, 10 forekomster) – mens Jeton, som leier inn
3D-studio, bruker 38 kurver hentet rett fra easings.net.

**Kostnad:** **0 kB**, og CSS-en blir mindre. Lav kompleksitet, men det er et
designvalg som må tas av én person og deretter håndheves.

**Dokumentasjon:** [osmo.supply/easings](https://www.osmo.supply/easings)
eksporterer `cubic-bezier`, GSAP `CustomEase` og CSS `linear()`.
`linear()` tillater vilkårlige kurver i ren CSS, uten bibliotek.

To verktøy som gir dette gratis uten å bli en avhengighet:
[okikio/spring-easing](https://github.com/okikio/spring-easing) (2,8 kB BP) kan
generere en **CSS `linear()`-streng** vi limer inn i et token – da er den
0 kB i drift, og vi får en fjærkurve uten fysikkbibliotek.
[argyleink/open-props](https://github.com/argyleink/open-props) (7,67 kB full,
MIT, ren CSS, null JS) har ferdige easing-tokens å stjele navnekonvensjonen fra –
men den skal subsettes, ikke importeres hel.

**Risiko:** Ingen teknisk. Men en oversvingskurve (y₂ > 1) må ikke brukes på noe
som flytter tekst brukeren leser, og alt må fortsatt ligge under
`prefers-reduced-motion`. Et token endrer ingenting uten JS.

---

### 4. Få CSS-en ut av HTML-en og gjør den cachbar

**Hva det er:** I dag ligger all CSS limt inn i hver side, så den lastes ned på
nytt hver gang noen klikker. Vi legger den i en egen fil som nettleseren husker.

**Hvorfor det passer oss:** Målt: 94 prosent av `/priser` sin inline-CSS er
byte-identisk med forsidens – ~18 kB brotli som sendes på nytt ved hver
navigering, multiplisert med `prefetchAll` på hover. Vi selger ytelse. Og det er
en forutsetning for at forslag 12 skal føles raskt i stedet for bare se raskt ut.
Phamilypharma gjør nøyaktig dette: 9,5 kB kritisk CSS inline, resten
ikke-blokkerende via `<link async defer onload="this.media='all'">`.

**Kostnad:** **Sparer ~18 kB per navigering.** Middels kompleksitet:
`build.inlineStylesheets` fra `"always"` til `"auto"`, og så må
`inlineSkriptHasher()` og CSP-en i `sikkerhet.mjs` kontrolleres, pluss testene i
`test/bygget-html.test.ts`.

**Dokumentasjon:** [Astro build.inlineStylesheets](https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets)

**Risiko:** **Ikke selg den strammere CSP-en før den er tatt.** `docs/research-astro.md`
noterer riktig at inline-CSS er grunnen til `style-src 'unsafe-inline'`. Men
`style-src` dekker også inline `style`-attributter, og bygget forside-HTML har
**92 av dem** (målt). Å fjerne `'unsafe-inline'` krever at de legges om til
klasser eller custom properties – et eget stykke arbeid. Cachegevinsten er gratis
og kan tas nå; CSP-gevinsten er neste steg. Ny risiko: en ekstra blokkerende
forespørsel i kritisk vei. Behold kritisk CSS for hero inline.

---

### 5. `@media (scripting: none)`: den fjerde tilstanden blir stylbar

**Hva det er:** En CSS-regel som bare gjelder når JavaScript er avslått, så vi
kan tegne den tilstanden i stedet for bare å håpe på den.

**Hvorfor det passer oss:** En av de fire bindende degraderingstilstandene våre
er «uten JavaScript», og i dag er den bare **testbar**, ikke **formbar**. Vi kan
ikke si «last ned rapporten i stedet» eller «dette feltet krever JavaScript –
her er telefonnummeret» uten `<noscript>`-markup. Nå kan vi, i CSS, i alle tre
motorer. Dette er den funksjonen på hele listen som ligger nærmest det vi selger.

**Kostnad:** **0 kB.** Lav kompleksitet.

**Dokumentasjon:** [MDN `@media/scripting`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/scripting) –
**Baseline widely available 2026-06-07.** Chrome 120, Firefox 113, Safari 17.
Verdier: `none`, `initial-only`, `enabled`.

**Risiko:** Lav, med ett forbehold: utvidelser som blokkerer skript på andre
måter vipper ikke nødvendigvis denne. Den er altså en **forbedring av**
no-JS-tilstanden, ikke en erstatning for at innholdet må virke uten JS i
utgangspunktet. Regelen må aldri brukes til å *skjule* noe – bare til å
forklare og tilby et alternativ.

---

### 6. `sibling-index()` i stedet for `trinn`-propen

**Hva det er:** CSS kan nå selv regne ut hvilket nummer et element har i rekken,
så vi slipper å skrive det inn manuelt.

**Hvorfor det passer oss:** `Avslor` tar i dag en `trinn`-prop (0–5) som må
settes for hånd på hvert element for å få trappet avdekking. Det er en kilde til
feil, det begrenser oss til seks trinn, og det er grunnen til at biblioteker som
Splitting.js finnes. Nå gjør plattformen det for 0 kB i alle tre motorer, og
`Splitting.js` kan strykes permanent fra kandidatlisten.

**Kostnad:** **0 kB**, og markupen blir renere. Lav kompleksitet, men propen må
beholdes i en overgangsperiode for Firefox ≤153 og ESR 140.

**Dokumentasjon:** [MDN `sibling-index()`](https://developer.mozilla.org/en-US/docs/Web/CSS/sibling-index) –
Baseline newly available 2026-08-18. Chrome 138, Firefox 154, Safari 26.2.

**Risiko:** Lav. Uten støtte blir forsinkelsen flat – alle elementene kommer
samtidig, som er dagens tilstand i Firefox uansett. Ingen JS. Ingen
tilgjengelighetsrisiko: trappet rekkefølge er kosmetisk, ikke informasjon –
unntatt i `fra="rekke"`, der rekkefølgen *er* budskapet, og der må reserven
fortsatt vise alt.

---

### 7. `text-box-trim`: typografisk presisjon som matcher hårlinjen

**Hva det er:** Fjerner den usynlige luften over og under store bokstaver, så
tekst kan settes nøyaktig mot en linje.

**Hvorfor det passer oss:** Merkevaren er hårlinjer, små radier og tett typografi.
Den vanligste grunnen til at en stor overskrift ser feil plassert ut mot en
1 px-strek, er skriftens innebygde linjeavstand – ikke marginen man prøver å
justere. Dette er den funksjonen som gjør `space-*`-tokenene våre faktisk
forutsigbare på display-størrelser. Phamilypharma setter Anton på
`line-height: .93` for å oppnå det samme med et hack; `text-box-trim` er den
ekte løsningen.

**Kostnad:** **0 kB.** Lav kompleksitet, men avstandene rundt overskrifter må
kalibreres på nytt én gang.

**Dokumentasjon:** [MDN `text-box-trim`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-box-trim) ·
[caniuse](https://caniuse.com/css-text-box-trim) – 85–87 %, Chrome 133,
Firefox 154, Safari 18.2. Alternativ på byggtid: `@capsizecss/core`.

**Risiko:** Lav. Uten støtte får man dagens linjebokser. Men fordi avstandene
kalibreres **med** trimmen, ser Firefox ≤153 og ESR 140 litt mer luft enn
tilsiktet – degraderingen går mot mer plass, ikke mindre, og altså mot synlig.
Ikke bruk den på løpende brødtekst, bare på display og mellomtitler.
Ingen JS, ingen tilgjengelighetsrisiko.

---

### 8. `offset-path`: bevegelse i ro som bærer informasjon

**Hva det er:** Et lite element kan følge en usynlig bane over siden – for
eksempel et målepunkt som vandrer langs rutenettet vårt – kontinuerlig, uten at
brukeren gjør noe.

**Hvorfor det passer oss:** Den målte forskjellen mot jeton.com er bevegelse **i
ro**: 153 mot 485 pikselavvik uten scroll. Siden vår står stille helt til noen
rører den. Jeton løser det med videoløkker og canvas; osmo med 36 videoer.
Vi kan løse det med 0 kB, fordi vi har en hårlinjestruktur å følge og et produkt
som *er* en skanner. En signaturbevegelse som leser som en **måling som foregår**
er den ene bevegelsen ingen av forbildene kan kopiere – de har ikke noe å måle.
`Flyt.astro` gjør alt dette riktig i dag med en 7,2 sekunders tidsdrevet løkke,
men bare på ett sted, på én side. `offset-path` er verktøyet for å gjøre det til
husets gest.

**Kostnad:** **0 kB.** Middels kompleksitet – banen må tegnes, og takten må
stilles inn slik `Flyt` alt er stilt inn (der halvannen takt viste seg å være
grensen før «alt lyser» i stedet for «noe flytter seg»).

**Dokumentasjon:** [MDN `offset-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-path) ·
[caniuse css-motion-paths](https://caniuse.com/css-motion-paths) – **96,84 %**,
Chrome 46, **Firefox 72**, Safari 16. Dette er den best støttede funksjonen på
hele listen, og vi har null treff på den.

**Risiko:** Lav teknisk, reell redaksjonelt. Må ligge under
`@media (prefers-reduced-motion: no-preference)` – kontinuerlig bevegelse er
nøyaktig den kategorien den innstillingen finnes for. Må være `aria-hidden`, må
ikke ligge i nærheten av tekst som skal leses, og må være langsom nok til å
ikke trekke blikket fra en setning. Uten JS virker den; uten støtte står punktet
stille, altså synlig. Firefox og Safari dekket siden 2020 og 2022.
WCAG 2.2.2 gjelder: bevegelse som varer over fem sekunder og går automatisk
må kunne stoppes – løsningen er at den er dekorativ og under reduced-motion,
men vurder også en pausemekanisme hvis den blir prominent.

---

### 9. FAQ-animasjon i alle tre motorer, ikke bare Chromium

**Hva det er:** FAQ-en vår åpner og lukker seg mykt i Chrome, men hopper i
Firefox og Safari. Det finnes en teknikk som virker i alle tre.

**Hvorfor det passer oss:** `site.css` linje 389 legger FAQ-overgangen bak
`@supports (interpolate-size: allow-keywords)`. `interpolate-size` er
**Chromium-bare – 71,74 %, og verken Firefox eller Safari har en pref for den i
det hele tatt** (Firefox-bug 1945962 og WebKit-bug 295132 er begge NEW, uten
milepæl). Kommentaren i filen beskriver degraderingen riktig, men resultatet er
at to av tre motorer aldri ser animasjonen. `grid-template-rows: 0fr → 1fr`
på `::details-content` gir samme effekt i alle tre.

**Kostnad:** **0 kB.** Lav kompleksitet.

**Dokumentasjon:** [MDN `::details-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content) –
Chrome 131, Firefox 143, Safari 18.4. `:open` er Baseline newly 2026-05-11
(Chrome 133, Firefox 136, Safari 26.5).

**Risiko:** Lav. Behold `interpolate-size`-grenen som en forbedring der den
finnes. Den globale `prefers-reduced-motion`-regelen treffer `*`, `*::before` og
`*::after`, men **ikke** `::details-content` – det står alt dokumentert i
`site.css` linje 401 som en målt feil, og den samme fellen gjelder den nye
teknikken. Innholdet må ligge i DOM-en og være åpnbart uten JS, som i dag.

---

### 10. `content-visibility: auto` + `contain-intrinsic-size`

**Hva det er:** Nettleseren hopper over å regne ut seksjoner som er langt
utenfor skjermen, til brukeren nærmer seg dem.

**Hvorfor det passer oss:** `docs/research-teknikker.md` rangerte dette blant de
fem sterkeste CSS-teknikkene for oss, og det er **ikke gjennomført** – de to
treffene vi har står inne i FAQ-overgangen, og `contain-intrinsic-size` finnes
ikke i repoet (målt). Forsiden har 610 linjer markup og 17 ulike komponenter.
Vi selger ytelse og måler den selv.

**Kostnad:** **0 kB.** Lav kompleksitet.

**Dokumentasjon:** [caniuse content-visibility](https://caniuse.com/css-content-visibility) –
93,91 %, Baseline newly 2025-09-15, Chrome 108, Firefox 130, Safari 26.

**Risiko:** **`contain-intrinsic-size` er obligatorisk, ikke valgfritt.** Uten
den hopper rullefeltet og dybdelenker til seksjoner langt nede lander feil.
Det er også grunnen til at den ikke må settes på noe over folden. Ingen JS.
Innhold i en `content-visibility: auto`-seksjon er fortsatt søkbart med
finn-på-siden og tilgjengelig for skjermlesere – det er forskjellen fra
`display: none`, og den er verdt å verifisere i test før den rulles ut.

---

### 11. `contrast-color()` som sikkerhetsnett, ikke som erstatning

**Hva det er:** CSS kan selv velge svart eller hvit tekst på en bakgrunnsfarge.

**Hvorfor det passer oss:** Brandboken dokumenterer hva flateregistrene har kostet:
`--ok` uten `--ok-soft` ga **1,37:1** på fire statusmerker, og `--link: var(--ink)`
ga **1,18:1** på lenker på ni sider, fordi aliaset substitueres én gang på `:root`
og aldri følger en lokal `--ink`. Hver ny flate krever at en sjekkliste på elleve
punkter følges perfekt. `contrast-color()` kan ikke erstatte den sjekklisten, men
den kan være nettet under den.

**Kostnad:** **0 kB.** Lav kompleksitet.

**Dokumentasjon:** [MDN `contrast-color()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color) –
Baseline newly 2026-04-10. Chrome 147, **Firefox 146**, Safari 26.

**Risiko: les dette før den brukes.** Funksjonen returnerer **bare `white` eller
`black`**, ikke en vilkårlig farge. Den kan derfor ikke produsere
`--accent-text` (den dempede oliven som gir 4,5:1 på lys flate). Og MDN sier
rett ut at den **ikke garanterer 4,5:1**: mellomtonede bakgrunner gir ikke nok
kontrast mot verken svart eller hvit, og eksempelet deres er en kongeblå som
får svart tekst som ikke er lesbar.

Konsekvens for oss: **det bindende kravet på 4,5:1 kan ikke overlates til
`contrast-color()`.** Den kan brukes som et andre lag på lyse eller mørke
flater, og som en reserve der en ny flate ikke har fått håndsatte tokens ennå –
men hver flate må fortsatt måles. Brandbokens regel «tekst på `accent`-fyll er
alltid mørk, aldri hvit» holder tilfeldigvis for vår lime `#c8f24a`, men den
regelen må fortsatt stå i tokens, ikke i en funksjon. Firefox ≤145 og ESR 140
trenger den håndsatte verdien uansett.

---

### 12. `@view-transition { navigation: auto }`

**Hva det er:** Sidene glir over i hverandre når man klikker, i stedet for å
blinke hvitt.

**Hvorfor det passer oss:** Det er den billigste følelsen av helhet som finnes,
og **det korrigerer en tidligere intern konklusjon.** `docs/research-astro.md`
forkastet visningsoverganger med en god begrunnelse: Astros `<ClientRouter />`
bytter ut `<body>` uten å kjøre modulskriptene på nytt, og åtte komponenter pluss
`terminal.js` og `hero-live.js` binder seg bare ved første lasting – så
røntgenlinsen, lagstabelen og hero-skanningen ville dødd etter første klikk.

**Den begrunnelsen gjelder ikke denne teknikken.** `@view-transition` er en
CSS-at-regel. Den krever **ingen ruter og ingen JavaScript**. Navigeringen er en
helt vanlig full sidelast – alle skript kjører på nytt, ingen binding brytes.
Ingen av de ti filene trenger å røres.

**Kostnad:** **0 kB.** Lav kompleksitet – noen linjer CSS på to sider.

**Dokumentasjon:** [MDN `@view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition) ·
[caniuse](https://caniuse.com/cross-document-view-transitions) – 85,97 %,
Chrome 126, Safari 18.2. Krever samme opphav, som vi har.
[argyleink/transition.css](https://github.com/argyleink/transition.css) (2,1 kB,
ren CSS) har ferdige keyframes, men vi bør skrive våre egne for å få
signaturkurven fra forslag 3.

**Risiko:** Lav, men vær ærlig om Firefox. **Ingen Firefox-versjon har sluppet
kryssdokument-visningsoverganger**, og det finnes ingen dato – pref'en
`dom.viewTransitions.cross-document.enabled` er `false` på alle kanaler,
inkludert Nightly, og `pageswap`-hendelsen er uferdig (bug 1881438, ASSIGNED).
caniuse' «delvis fra 144» gjelder **Level 1, altså samme-dokument**. Firefox får
en helt vanlig navigering, som er dagens oppførsel – degraderingen er perfekt.
Avslutning er deklarativ:

```css
@media (prefers-reduced-motion: reduce) {
  @view-transition { navigation: none; }
}
```

Ingen CSP-endring (`style-src` tillater alt inline alt). Ingen cookies. Men:
**gjør forslag 4 først**, ellers animerer vi en navigering som fortsatt laster
ned 18 kB CSS på nytt – det ser raskt ut og er det ikke.

---

### 13. Ny funksjonalitet: agent-beredskapssjekk

**Hva det er:** Et gratis verktøy som sjekker om en nettside er lesbar for
AI-agenter, og som sier ærlig hva som faktisk virker og hva som er teater.

**Hvorfor det passer oss:** Vi selger nettsider, systemer **og AI**, og vi selger
på etterrettelighet. Cloudflare publiserte 17. april 2026 en «Agent Readiness
score» med en konkret, offentlig sjekkliste – det er en ferdig kravspesifikasjon
for et verktøy som ingen i Norge har bygget. Og her er det som gjør det til
*vårt*: vi kan være den som sier rett ut at **llms.txt ikke gjør noe for søk**.
Google har bekreftet at ingen Google-system leser den, og serverlogger fra
137 000 domener viser at **97 prosent av filene aldri blir forespurt**. Alle
andre selger llms.txt som SEO. Æresregelen vår sier at det som ikke er målt får
status «Ikke sjekket» – her kan vi gå ett skritt videre og si «sjekket, og det
betyr ingenting». Det er samme posisjon som cookieskanningen, i et nytt marked.

Sjekkene, fra Cloudflares egen liste: `robots.txt` · `sitemap.xml` ·
Link-headere (RFC 8288) · markdown-innholdsforhandling på
`Accept: text/markdown` · Content Signals · AI-bot-regler i robots.txt ·
Web Bot Auth · Agent Skills discovery · API-katalog (RFC 9727) ·
OAuth-oppdagelse (RFC 8414, 9728) · MCP Server Card · WebMCP.

**Kostnad:** **0 kB på klienten** – samme arkitektur som `/api/sjekk`, rene
funksjoner i `src/lib/` med tester. Høy kompleksitet, det er det største
forslaget på listen.

**Dokumentasjon:** [blog.cloudflare.com/agent-readiness](https://blog.cloudflare.com/agent-readiness/) ·
[llms.txt-spec](https://llmstxt.org)

**Risiko:** Ingen tilgjengelighets- eller nettleserrisiko – det er en
serverside-sjekk med et HTML-resultat. Den reelle risikoen er **faglig**:
standardene er ustabile. Cloudflares Content Signals og IETFs
`Content-Usage`-utkast bruker **ulike ord for samme ting** (`ai-train`/`ai-input`
mot `train-ai`/`ai-use`), ingen av dem er ferdig standard, og **ingen kjent
crawler eller LLM-leverandør respekterer Content-Signal per juli 2026** – Googles
John Mueller sa han ikke kjenner noen. WebMCP er bare en origin trial (Chrome
149–156, API-en flyttet fra `navigator.modelContext` til `document.modelContext`
i Chrome 150). Verktøyet må derfor **rapportere hva som er målt og hva det er
verdt, separat** – ellers bryter det vår egen æresregel. Og `src/lib/hent.ts`
sitt SSRF-vern og tak på størrelse og tid må gjelde her også.

---

### 14. Ny funksjonalitet: markdown-innholdsforhandling

**Hva det er:** Når en AI-agent ber om siden vår i enkelt tekstformat, får den
det – samme adresse, mindre å lese.

**Hvorfor det passer oss:** Det er det ene punktet på agent-beredskapslisten som
faktisk virker i dag, og det tar en ettermiddag. Vi kan ikke selge en
beredskapssjekk uten å bestå den selv. Og `server.mjs` serverer allerede alle de
statiske filene selv, med brotli og gzip – forhandlingen hører hjemme nøyaktig
der. Cloudflare oppgir inntil 80 prosent færre tokens for markdown mot HTML.

**Kostnad:** **0 kB for nettlesere.** Lav kompleksitet: en sjekk på
`Accept`-headeren i `server.mjs`, en `.md`-variant per side generert ved bygg,
og en `Link: rel=alternate`-header på HTML-en.

**Dokumentasjon:** [blog.cloudflare.com/agent-readiness](https://blog.cloudflare.com/agent-readiness/) ·
vi har alt en `public/llms.txt`.

**Risiko:** Lav. Må ikke forhandles på `sec-fetch-dest`-forespørsler fra
nettlesere, og `vary: accept` må settes sammen med `vary: accept-encoding` som
alt står der – ellers cacher en mellomliggende cache markdown til et menneske.
Ingen cookies, ingen JS, ingen nettleserforskjell.

---

### 15. Ny funksjonalitet: norske tall fra uutilsynets åpne datasett

**Hva det er:** Vi viser hva norske virksomheter selv rapporterer om
tilgjengelighet, hentet fra et offentlig datasett.

**Hvorfor det passer oss:** Brandboken forbyr oppdiktede tall og krever at
`ProofStrip` og `Nokkeltall` har sanne, helst live, tall. Dette datasettet er
sant, norsk, offentlig og live. Kontrollert mot API-et 7. oktober 2026 (målt,
alle 9 549 oppføringer hentet og aggregert):

| | |
|---|---|
| Tilgjengelighetserklæringer i registeret | **9 549** |
| Unike virksomheter | **1 326** |
| Nettsteder / apper | 8 829 / 720 |
| «Delvis i samsvar» | 7 311 |
| «I samsvar» | 2 216 |
| «Ikkje i samsvar» | 22 |
| **Andel som rapporterer minst ett WCAG-brudd** | **76,8 %** |
| Brudd per løsning: snitt / median / maks | **6,6 / 4 / 47** |

Det er en setning ingen annen norsk leverandør kan skrive med kilde:
tre av fire norske offentlige løsninger rapporterer selv at de bryter WCAG, og
medianen er fire brudd.

**Kostnad:** **0 kB på klienten** – hentes ved bygg eller av en nattlig jobb, som
`Nokkeltall` alt gjør. Middels kompleksitet: API-et er paginert i 955 sider på 10,
men godtar `size=1000`. Diagrammene kan bygges med `charts.css` (5,7 kB, null JS,
tallene lesbare fra en `<table>` med CSS av) – eller for hånd i SVG til 0 kB, som
`Flyt` og `Snitt`.

**Datakilde:** `https://data.uutilsynet.no/dataset/alle-erklaeringer`
(verifisert: HTTP 200, 242 kB JSON, feltene `samsvarsstatus`, `talSamsvar`,
`talBrot`, `talIkkjeRelevant`). Merk: **ikke** send `Accept: application/json` –
API-et svarer 406. Forbilde: [Skatteetaten/uu-status](https://github.com/Skatteetaten/uu-status)
bygger på samme datasett og oppdateres nattlig.

**Risiko:** To, og begge må stå i teksten.

Først **presisjon**: registeret dekker **offentlige** virksomheter, som har
erklæringsplikt. Kundene våre er private småbedrifter. Tallet kan derfor ikke
presenteres som «norske bedrifter» – det må stå «offentlige virksomheter som har
levert erklæring». Og det er **selvrapportert**, ikke målt av oss. En falsk
generalisering her er samme feil som en falsk «Bestått».

Deretter **lisens**: `data.norge.no` fører Enhetsregisteret under NLOD 2.0, men
jeg har **ikke verifisert** lisensen for uutilsynets datasett spesifikt.
Den må leses og arkiveres i `assets/LICENSES.md` før publisering.

Og den juridiske konteksten per i dag (dokumentert): private bedrifter i Norge
må oppfylle **35 krav i WCAG 2.0 A og AA**; offentlige virksomheter WCAG 2.1 A og AA.
**WCAG 2.2 er ikke norsk rett**, og Uutilsynet har bekreftet at det ikke endrer
seg på kort sikt. **EUs tilgjengelighetsdirektiv (EAA) trådte i kraft i EU
28. juni 2025, men er verken innlemmet i EØS-avtalen eller i norsk rett** –
Bufdir siterer Uutilsynet: «Det er vanskelig å si når dette vil skje.»
En revidert EN 301 549 ventes vedtatt i løpet av 2026. Vi må altså ikke selge
EAA som et norsk krav. Det er nøyaktig den typen overdrivelse konkurrentene våre
gjør, og nøyaktig det vi kan slå dem på.

---

### 16. Content Signals i `robots.txt`

**Hva det er:** En linje i `robots.txt` som sier hva AI-selskaper får bruke
innholdet vårt til.

**Hvorfor det passer oss:** Null kostnad, og det er en posisjon. Vi genererer
alt `robots.txt` fra `src/pages/robots.txt.ts` med en bryter som åpner seg selv
når org.nr. er ekte – det er riktig sted.

**Kostnad:** **0 kB.** Triviell.

**Dokumentasjon:** Cloudflares Content Signals, lansert 24. september 2025,
med `search`, `ai-input` og `ai-train` satt til yes eller no. IETFs
AI-preferences-arbeidsgruppe har et parallelt utkast (sist revidert
13. september 2026) med `train-ai`, `ai-use` og `search` satt til `y`/`n`,
festet til robots.txt som en `Content-Usage`-regel.

**Risiko:** **Ingen kjent crawler eller LLM-leverandør respekterer den.**
Cloudflare har den slått på for over 3,8 millioner domener, men bare ~4 prosent
av de 200 000 største domenene deklarerer strukturerte AI-preferanser i det hele
tatt (Cloudflare Radar, april 2026). Verdien er **dokumentarisk og posisjonell,
ikke teknisk** – vi har sagt fra, skriftlig, med dato. Den må ikke selges som
beskyttelse. De to vokabularene er dessuten uforenlige i ordvalg, så skriv begge
eller velg én og si hvilken.

---

### 17. Tusjstreken: én typografisk signatur i ren CSS

**Hva det er:** Et viktig ord i en setning får en strek over seg, som en
tusjmarkør, når setningen kommer i syne.

**Hvorfor det passer oss:** Det er phamilypharmas mest kopierbare grep (observert):
en `linear-gradient` på hver `<strong>`, animert fra `background-size: 0 100%`.
Null kilobyte, og den gjør noe ingen av våre nåværende gester gjør – den peker på
**poenget i setningen**, ikke på blokken. Vi har syv `Avslor`-gester som alle
flytter en hel blokk. Vi har ingen som utheving av mening. Og vi har allerede
`accent-soft`, `ok-soft`, `warn-soft` og `fail-soft` – fire tonede flater å
markere med, der fargen kan bære status i tillegg til oppmerksomhet.

**Kostnad:** **0 kB.** Lav kompleksitet.

**Risiko:** Lav, med én reell felle. Fargen må være en `-soft`-tone og kontrasten
på teksten **over** streken må måles på nytt i begge temaer – det er nøyaktig
feilen flateregistrene gjorde (1,37:1 på statusmerker). Må ligge under
`prefers-reduced-motion` (der streken bare står ferdig, ikke mangler). Uten
støtte for scroll-drevet start vises streken ferdig, altså synlig. Ingen JS.
`<strong>` beholder sin semantikk, så skjermlesere er upåvirket.
Ikke bruk den mer enn én gang per skjerm – phamily bruker den på ordspillene,
som er det de vil at du skal huske.

---

### 18. Variabelskriftakse som bevegelse

**Hva det er:** Bokstavene kan bli tykkere eller tynnere mykt, uten å bytte
skriftfil.

**Hvorfor det passer oss:** Begge skriftene våre er allerede variable –
`font-weight: 700 800` og `400 600` i `fonter.css` – og vi har **null treff** på
`font-variation-settings` eller animert `font-weight` (målt). osmo.supply har 43
(observert), og en hel ressurs, `variable-font-weight-hover`, som animerer `wght`
per tegn etter avstand til pekeren. Det er en bevegelse som bare eksisterer i
typografi, og typografi er merkevaren vår. Den koster **ingen ekstra kilobyte**,
fordi filen alt er lastet.

**Kostnad:** **0 kB.** Lav kompleksitet.

**Dokumentasjon:** Animer `font-weight`, ikke `font-variation-settings` –
sistnevnte nullstiller akser som ikke er listet. Variable skrifter er på ~97 %.

**Risiko:** Den eneste med en reell layout-risiko på listen: endret vekt
**reflower tekst**. Bruk den bare på korte elementer med fast plass – et tall i
`mono-stat`, et ord i en overskrift – aldri på brødtekst, og aldri på noe som
kan skubbe en knapp. Må ligge under `prefers-reduced-motion: no-preference`.
Hvis den knyttes til hover må den ikke bære informasjon, siden hover ikke finnes
på berøring. Uten støtte står vekten fast, altså synlig. Ingen JS nødvendig.

---

### 19.–21. De tre tingene juryen faktisk premierte

Disse står samlet fordi de er samme beslutning, og fordi ingen av dem er
tekniske. De er rangert sist fordi de koster penger eller en beslutning, ikke
fordi de betyr minst. **Målt mot Awwwards' egen jury betyr de mest:**
phamilypharmas høyeste karakter var Innhold 8,20, og stikkordene var
`Illustration`, `Storytelling`, `Colorful`.

**19. Et eget illustrasjonsvokabular.** Phamily har 23 håndgester, flate
tofargede vektorer, brukt som hele ikonsystemet. Brandboken vår peker i dag på
Lucide (MIT) – et sett tusenvis av nettsteder bruker – og krever at «hvert bilde
må bestå én prøve: dekk til teksten ved siden av, skjønner en rørlegger hva
bildet handler om?». Et eget sett på 10–15 motiver som består den prøven er den
enkeltposten som endrer førsteinntrykket mest. Som SVG koster det **0 kB over
nettet** når det er inlinet, i motsetning til Jetons 12,3 MB renderinger.
Risiko: brandboken forbyr genererte mennesker, kunder, kontorer eller
leveranseresultater uten unntak, og «et bilde skal aldri fremstå som bevis på
noe som ikke finnes». Et abstrakt, flatt, tofarget vokabular er innenfor;
genererte fotorealistiske motiver er ikke.

**20. En innleid tekstforfatter.** Phamily krediterte sin som medforfatter av
prisen. Juryen ga dem 8,20 på innhold – høyere enn på design. Vi har en
`kodekonsulentene-tekst`-skill og en streng stemme, og det er bra. Men avstanden
mellom en god stemme og *«Pain au chocolat ou chocolatine?»* i en seksjon om
lønn er ikke teknikk. Kostnad: penger. Risiko: norsk, du-form, ingen
utropstegn, ingen emoji og ingen floskler er ikke-forhandlbart, og en ekstern
forfatter må briefes på det.

**21. Én minneverdig idé per side.** Jetons er en Rive-drevet fem-stegs
simulering av å sende penger. Phamilys er et spillbart stein-saks-papir på
404-siden. Begge kan fortelles i én setning. Vi har ni ulike apparater på
forsiden – `Avslor` 20 ganger, og `Flyt`, `Slepesammenligning`, `Lagstabel`,
`Nokkeltall`, `Mega` og `Storflate` **én gang hver** (målt). Den gjentatte
gesten vår er den mest generiske som finnes: en innglidning på scroll.
De distinktive apparatene vises én gang og gjentas aldri.

`docs/research-kreativt.md` har alt svaret på hva ideen bør være: *«vi har noe
ingen av dem har: et produkt som finner ekte feil på ekte nettsider mens du ser
på. Den sterkeste kreative avgjørelsen er å la det produktet være innholdet,
ikke en knapp under ingressen.»* Det står skrevet 6. oktober 2026 og er ikke
gjennomført. Forslag 8 er den tekniske halvdelen av det. Den andre halvdelen er
å velge.

---

### 22. Distinkt variabel displayskrift

**Hva det er:** Vi bytter overskriftsskriften til noe som ikke brukes av tusenvis
av andre tekniske nettsteder.

**Hvorfor det passer oss:** `docs/referanser.md` kaller dette «den enkeltposten
som alene endrer førsteinntrykket mest», og kaller det et innkjøp. **Det behøver
det ikke å være** – og det er det nye i denne runden. Phamilypharma vant en
Awwwards-utmerkelse med **Anton**, en gratis Google-skrift, satt på 110–130 px
med `line-height: .93` og `letter-spacing: -.13rem`. Lisensen er ikke det som
skiller. Størrelsen og knipingen er.

Og det finnes distinkte, gratis-for-kommersiell-bruk variable skrifter:
[Fontshare](https://www.fontshare.com) (Clash Display, Cabinet Grotesk – begge
med variabel versjon), [Uncut.wtf](https://uncut.wtf),
[Velvetyne](https://velvetyne.fr) (libre, f.eks. Terminal Grotesque og VG5000),
[Collletttivo](https://www.collletttivo.it) (åpen kildekode, f.eks. Apfel Grotezk).
En variabel skrift gir dessuten forslag 18 gratis.

**Kostnad:** **~0 kB netto** hvis den subsettes som i forslag 1. Middels
kompleksitet: `fonter.css`, `tokens.css`, OG-bildegeneratoren i `scripts/og.mjs`
(som har hatt en fontfelle før, dokumentert i `docs/research-astro.md`), og alle
visuelle regresjonstester.

**Risiko: lisensen må leses før den brukes, ikke etter.** Jeg forsøkte å hente
`fontshare.com/licenses/itf-ffl` og fikk bare en JS-skall – **lisensteksten er
ikke verifisert**. Vi selger på lovlighet, og en uverifisert skriftlisens er
nøyaktig det vår egen skanner ville flagget hos noen andre. Kravene: kommersiell
bruk tillatt, selvhosting tillatt, subsetting tillatt (det er en modifikasjon
under flere lisenser), og teksten arkivert i `assets/LICENSES.md` med dato, slik
`fonter.css` alt gjør for SIL OFL 1.1. Behold JetBrains Mono – terminalen er vår,
og monoskriften rendrer fremmed innhold og trenger bred dekning.

---

## Del 7 – Hva vi ikke bør gjøre, og hvorfor

**Scroll-jacking og parallax som produkt.** Brandboken forbyr det alt, og
undersøkelsen styrker forbudet i stedet for å svekke det. Lenis koster 5,4 kB,
**håndterte ikke `prefers-reduced-motion` før 5. august 2026**, og håndterer
**fremdeles ikke tastaturrulling i det hele tatt**. Nielsen Norman Groups egen
studie av scrolljacking konkluderer at «the majority of our study participants
were at least mildly disoriented», og at sider som endret rullehastighet
**samtidig som brukeren skulle lese tekst** hadde de alvorligste problemene –
altså nøyaktig kombinasjonen et tekstdrevet nettsted som vårt ville laget.
Legg merke til at 62 prosent av prisvinnerne bruker den likevel.

**CSS-karuseller (`::scroll-marker`, `::scroll-button`).** 71,14 %, Chromium bare.
Og signalene fra de to andre leverandørene er **aktivt negative, ikke bare
fraværende**: Mozillas standards-position er merket `team: Accessibility`,
WebKits er merket `concerns: accessibility` og `concerns: internationalization`,
og en CSSWG-redaktør skrev 17. september 2026 at noen av innvendingene «seem
pretty fundamental». Spesifikasjonen endret seg i juli 2026. Vi har heller ingen
karusell.

**`reading-flow` / `reading-order`.** Chromium bare, og **aktivt skadelig på
tvers av nettlesere**: positive `tabindex`-verdier ignoreres inne i en
`reading-flow`-container, så samme side får ulik tabrekkefølge i ulike
nettlesere. Det er et dårligere tilgjengelighetsresultat enn ingen omrokering.
Fiks DOM-rekkefølgen i stedet.

**`if()`, `@function`, `interestfor`, `overlay`, `scroll-state()`, `corner-shape`.**
Alle Chromium-bare, 70–74 %. `if()` og `@function` har dessuten en farlig
feilmodus: hele erklæringen er ugyldig ved parsing og forkastes.
`interestfor`-spesifikasjonen er en uflettet WHATWG-PR, Mozilla lukket sin
posisjon som **nøytral** med `concerns: use cases`, og hover-basert avdekking er
et berørings- og tastaturproblem uavhengig av støtte.

**`interpolate-size` som den eneste veien.** Behold den som forbedring, men se
forslag 9: to av tre motorer har ikke engang en pref for den.

**Speculation Rules med `prerender`.** Firefox har ingen implementasjon, Safari
har bare `prefetch` bak en pref. Og `prerender` kjører JavaScript og laster
underressurser **før brukeren har uttrykt intensjon** – vi ville sett
forespørselen i loggen vår uten et klikk bak den. Hvis noe skal brukes, bruk
`prefetch` med `eagerness: moderate`. Astros `prefetch` med `hover` gjør det
allerede, for 0 kB. Merk til protokollen: jeg fant **ingen autoritativ uttalelse**
fra Chrome, spesifikasjonen eller noen tilsynsmyndighet om prerendering og
GDPR/ekomloven – det er ikke verifisert, og er ikke juridisk rådgivning. Teknisk:
en samme-opphav prerender av vår egen cookiefrie side setter og leser ingen
cookies, så ekomloven § 3-15 utløses ikke av mekanismen. Men ikke logg noe på
forespørsler med `Sec-Purpose: prefetch`.

**zstd i `server.mjs`.** Målt og forkastet: 28 959 byte mot brotlis 27 204 på
forsiden – 6,5 prosent dårligere. Brotli vinner på HTML.

**llms.txt som SEO-tiltak.** Vi har filen, og det er greit. Men Google har
bekreftet at ingen Google-system leser den, OpenAI, Copilot og Bing har ikke
annonsert støtte, og serverlogger fra 137 000 domener viser at **97 prosent av
filene aldri blir forespurt**. Den hjelper kodeagenter og dokumentasjonsverktøy.
Ikke selg den som annet.

**WebMCP.** Origin trial i Chrome 149–156, Edge fra 150, Firefox og Safari uten
tidsplan. API-en flyttet fra `navigator.modelContext` til `document.modelContext`
i Chrome 150. Nevn den i sjekken, ikke bygg på den.

**Temporal og JPEG XL.** Temporal har ingen stabil Safari, og polyfillen er
over 100 kB. JPEG XL er 0 % full støtte og en Interop 2026-**undersøkelse**, ikke
en forpliktelse. Bruk `Intl.DateTimeFormat` og AVIF (95,35 %).

**Egendefinert markør og lyd.** `docs/research-kreativt.md` forkastet markøren
alt, med rett begrunnelse. Og lyd er målt bort som faktor: 0 `AudioContext` hos
både phamily og osmo. Osmo *underviser* i Howler.js men bruker det ikke.

**Grid Lanes / masonry.** 12,49 %, bare Safari 26.4 har full støtte, og
spesifikasjonen er fortsatt Working Draft.

---

## Del 8 – Åpne spørsmål og det som ikke kunne verifiseres

1. **Firefox 159 eller 160 for scroll-drevne animasjoner.** Bugzilla 1324602 sier
   milepæl 159 (slippes 27. oktober 2026); caniuse fører første støtte i 160.
   Firefox 159-utgivelsesnotatene er tomme ennå. Planlegg for begge.
2. **Fontshares lisenstekst.** `fontshare.com/licenses/itf-ffl` er et JS-skall;
   teksten kunne ikke leses. Må verifiseres før en Fontshare-skrift tas i bruk.
3. **Lisensen for uutilsynets datasett.** Enhetsregisteret er NLOD 2.0 på
   data.norge.no; lisensen for `data.uutilsynet.no/dataset/alle-erklaeringer`
   spesifikt er ikke lest.
4. **Lighthouse-, PageSpeed- og CrUX-data for de tre forbildene.** PSI-API-et
   svarte HTTP 429 på alle tre. Alle vekttall i Del 1 er egne `curl`-målinger,
   ikke lab- eller feltdata, og forespørselstallene er opptalte asset-referanser,
   ikke en ekte nettleserwaterfall.
5. **Om Safari 27 stabil fikk `if()` eller `@function`.** Begge er i Technology
   Preview 249; 27.0-notatet kunne bare leses delvis.
6. **Osmos GSAP-andel.** ~70 % er ekstrapolert fra 30 av ~220 ressurssider.
7. **Eksakt GSAP-versjon på `spinxdigital.com`** – ingen versjonsstreng overlever
   NitroPacks bunting.
8. **`davidlangarica.dev` sin avhengighetsliste.** Det finnes ingen offentlig repo
   (`github.com/DavidLangarica` har 25 repoer, alle studiearbeid), så stacken er
   fingeravtrykk i bunten, ikke `package.json`. Og ingen faktisk
   Awwwards-utmerkelse for ham kunne bekreftes, selv om han viser logoen.
9. **To tall som sirkulerer i søkeresultater, og som er oppdiktet.** «65 prosent
   av nye 3D-webapper sender WebGPU» og «40 prosent ikke-komponerte animasjoner»
   oppgis begge som Web Almanac 2025. **Ingen av dem finnes der** – Web Almanac
   2025 har 16 kapitler, ingen CSS-kapittel, og Capabilities-kapittelet nevner
   ikke WebGPU. Skal ikke gjentas. Dette er en påminnelse om hvor lett et tall
   med en autoritativ kilde festet til seg passerer en lesning.
10. **CHIRA 2026-artikkelen om scrolljacking** (Voinea og Murano, Springer CCIS
    s. 93–107) er bak betalingsmur. Sitatet er verifisert, **funnene er ikke lest**,
    og skal ikke tilskrives.
11. **Orpetron Site of the Year** og **CSSDA Designer/Developer of the Year 2025**
    – ingen vinner publisert noe sted som var tilgjengelig. `siteinspire.com`
    svarte HTTP 429. Og `godly.website` **finnes ikke lenger**; den sender videre
    til `recent.design`.
8. **Et sidefunn utenfor mandatet.** Et oppslag i Enhetsregisteret
   (`data.brreg.no/enhetsregisteret/api/enheter?navn=kodekonsulentene`) ga ett
   treff: **KODEKONSULENTENE ELKASSMI**, org.nr. **936374336**, enkeltpersonforetak,
   registrert 14. oktober 2025, Oslo, næringskode 62.200. Det matcher
   foretaksnavnlovens § 2-2-kravet som `CLAUDE.md` beskriver. `test/lansering.test.ts`
   er rød så lenge org.nr. er plassholder. **Dette er ikke bekreftet som vårt
   foretak** og skal verifiseres av eieren før det skrives inn i
   `src/data/firma.ts` – men det er sannsynligvis tallet som åpner `robots.txt`
   og sitemapen.

---

## Kilder

Hentet og kontrollert 7. oktober 2026.

**Støttestatus, maskinlesbare kilder**
- `https://api.webstatus.dev/v1/features/<id>` – Baseline-status, kontrollert
  direkte for `contrast-color`, `sibling-count`, `scripting`, `content-visibility`,
  `cross-document-view-transitions`, `scroll-driven-animations`
- `https://unpkg.com/@mdn/browser-compat-data/data.json` – 8.1.4 (2026-10-01)
- `https://raw.githubusercontent.com/Fyrd/caniuse/main/fulldata-json/data-2.0.json` – 1.0.30001815
- `https://raw.githubusercontent.com/mozilla-firefox/firefox/main/modules/libpref/init/StaticPrefList.yaml`
- `https://product-details.mozilla.org/1.0/firefox_versions.json` – Firefox 157.0.1
- Bugzilla [1324602](https://bugzilla.mozilla.org/show_bug.cgi?id=1324602),
  [2020327](https://bugzilla.mozilla.org/show_bug.cgi?id=2020327),
  [1881438](https://bugzilla.mozilla.org/show_bug.cgi?id=1881438),
  [1960910](https://bugzilla.mozilla.org/show_bug.cgi?id=1960910)
- [web.dev/blog/interop-2026](https://web.dev/blog/interop-2026)

**Forbildene, rå markup og JS-bunter**
- `jeton.com` – `entry.DeNKAMS7.css`, `/_payload.json`, `DWXlxHGg.js`
- `phamilypharma.com` – `site.Dca_zzip.js`, `site.Cuo4rdYi.css`,
  [/page-introuvable-404](https://phamilypharma.com/page-introuvable-404)
- `osmo.supply` – forsiden, [/collection](https://www.osmo.supply/collection),
  30 ressurssider, [/easings](https://www.osmo.supply/easings)
- `spinxdigital.com` – 22 nedlastede JS-filer, `nitro-min-app.js`
- `davidlangarica.dev` – 29 JS-biter, 5 CSS-filer
- [awwwards.com/sites/phamily](https://www.awwwards.com/sites/phamily) ·
  [awwwards.com/sites/jeton](https://www.awwwards.com/sites/jeton) ·
  [burocratik.com/work/jeton](https://www.burocratik.com/work/jeton) ·
  [troa.fr/realisations/phamily](https://www.troa.fr/realisations/phamily)

**Prisvinnere, bransjetall og bibliotekstatus**
- [awwwards.com/annual-awards/winners](https://www.awwwards.com/annual-awards/winners) –
  Site of the Year 2025: [Lando Norris](https://landonorris.com/) (OFF+BRAND.);
  Developer Site of the Year: [Messenger](https://messenger.abeto.co) (abeto)
- `https://thefwa.com/api/cases/` – FWA of the Year 2025:
  [Bruno Simon](https://bruno-simon.com). Deres egen prisside svarer HTTP 500
- [cssdesignawards.com – 2025 Website of the Year](https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/) –
  [Dropbox Brand](https://brand.dropbox.com/) (Daybreak Studio)
- [2026.stateofcss.com](https://2026.stateofcss.com/en-US/features/) –
  scroll-drevne animasjoner 17,6 % brukt, `:has()` 83,7 %
- [almanac.httparchive.org/en/2025/page-weight](https://almanac.httparchive.org/en/2025/page-weight) –
  median desktop 2 412 kB, p90 9 179 kB
- [webaim.org/projects/million](https://webaim.org/projects/million/) –
  februar 2026: 95,9 % med WCAG-brudd, 56,1 feil per side
- [nngroup.com/articles/scrolljacking-101](https://www.nngroup.com/articles/scrolljacking-101/)
- [gsap.com/blog/3-13](https://gsap.com/blog/3-13/) ·
  [gsap.com/standard-license](https://gsap.com/standard-license/) ·
  `registry.npmjs.org/gsap/latest` (3.15.0, lisensfeltet lest direkte)
- [github.com/darkroomengineering/lenis issue #534](https://github.com/darkroomengineering/lenis/issues/534)
  og PR #537 – `respectReducedMotion`, flettet 5. august 2026
- `rive.app/docs/llms-full.txt` (1,76 MB) – søkt for `noscript`, fallback og
  redusert bevegelse; `registry.npmjs.org/@rive-app/canvas`
- [motion.dev/docs/animate](https://motion.dev/docs/animate) ·
  [motion.dev/docs/scroll](https://motion.dev/docs/scroll) ·
  [motion.dev/blog/framer-motion-is-now-independent-introducing-motion](https://motion.dev/blog/framer-motion-is-now-independent-introducing-motion)

**Norske datakilder og regelverk**
- `https://data.uutilsynet.no/dataset/alle-erklaeringer` – 9 549 oppføringer, hentet og aggregert
- `https://data.brreg.no/enhetsregisteret/api/enheter`
- [uutilsynet.no – Fremtidige regelverk og krav](https://www.uutilsynet.no/regelverk/fremtidige-regelverk-og-krav/747)
- [bufdir.no – EUs tilgjengelighetsdirektiv ennå ikke vedtatt i Norge](https://www.bufdir.no/aktuelt/nyhetsbrev/uu/eus-tilgjengelighetsdirektiv-enna-ikke-vedtatt-i-norge/)
- [datatilsynet.no – ny veiledning om samtykke til informasjonskapsler](https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2025/ny-veiledning-om-samtykke-til-informasjonskapsler-og-sporingsteknologier-er-klar/)
- [Skatteetaten/uu-status](https://github.com/Skatteetaten/uu-status)

**AI-agenter og nye protokoller**
- [blog.cloudflare.com/agent-readiness](https://blog.cloudflare.com/agent-readiness/) – 17. april 2026
- [llmstxt.org](https://llmstxt.org)
- [MDN Speculation Rules API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)

**Interne dokumenter dette bygger på og delvis korrigerer**
- `docs/referanser.md` – målingene av bevegelse i ro, blødning og visuell tetthet
- `docs/research-kreativt.md` – at referansene ikke er teknisk mer avanserte
- `docs/research-animasjon.md` – egne målinger av ni animasjonsbiblioteker, GSAP-lisensen
- `docs/research-teknikker.md` – `content-visibility`-anbefalingen som ikke er gjennomført
- `docs/research-astro.md` – forkastingen av visningsoverganger, som gjaldt
  `<ClientRouter />` og **ikke** `@view-transition` (se forslag 12)
- `docs/brandbok.md` – flateregistrene, kontrastfeilene som er målt, spinxdigital-målingen
