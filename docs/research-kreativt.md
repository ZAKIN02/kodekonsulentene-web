# Kreativ research: hva referansene faktisk gjør

Undersøkt 6. oktober 2026. Alle påstander er merket med hvordan jeg vet det:

- **Observert** – lest i rå markup eller CSS jeg hentet ned selv
- **Dokumentert** – lest i leverandørens egen dokumentasjon
- **Antatt** – min slutning, ikke verifisert

Rammene fra `docs/brandbok.md` er ufravikelige og ligger til grunn for alt under:
mørk grunn, én limegrønn aksent `#c8f24a`, hårlinjer, små radier, Schibsted Grotesk
og JetBrains Mono, ingen gradienter, ingen glassmorphism, ingen bento, ingen 3D eller
WebGL, ingen scroll-jacking, Lighthouse 95+.

---

## Del 1 – Hva referansene faktisk er bygget av

### Det viktigste funnet

**To av tre referanser er no-code-plattformer.** Det endrer hele premisset for
«hvordan blir vi som dem».

| Side | Plattform | Hvordan jeg vet det |
|---|---|---|
| bdsn.club | **Framer** | Observert: 2 261 forekomster av `framer` i markup, 138 `data-framer-component-type`, ingen egne `<script src>` |
| brand.dropbox.com | **Webflow** + jQuery 3.5.1 + Lottie + Rive | Observert: `webflow.6a7c66f5.js`, `jquery-3.5.1.min.js`, `data-animation-type="lottie"` og `="rive"`, `data-renderer="svg"` |
| epic.net | **Egen Vue/Nuxt + Vite** | Observert: `data-server-rendered`, `data-head-attrs`, `index-1d3fe84d.js` med Vite-hash, rutedelte CSS-filer |

**Konsekvens:** bdsn og Dropbox har ingen teknisk hemmelighet vi mangler. De har
designbeslutninger. Framer og Webflow produserer ganske vanlig DOM og CSS. Det vi
oppfatter som «kreativt» er komposisjon, skala og konsept – ikke kode.

### epic.net er teknisk enklere enn vår side

Jeg hentet ned `index-317f88c7.css` (97 kB) og `Homepage-27233730.css` (6 kB) og
talte opp (observert):

| Teknikk | epic.net hoved-CSS | Vår side |
|---|---|---|
| `clamp()` | **0** | brukt i `Mega.astro` |
| `mask-image` | **0** | brukt i `Rontgen.astro`, `HeroFilm.astro` |
| `mix-blend-mode` | 1 | 0 |
| `position: sticky` | 2 | flere |
| `will-change` | 2 | 0 |
| `animation-timeline` | **0** | brukt i `Avslor.astro`, `Mega.astro` |
| `@media (prefers-reduced-motion)` | 1 (global reset) | gjennomgående |
| CSS-variabler | 46 | langt flere |

**Vi bruker allerede mer moderne CSS enn epic.net.** Problemet vårt er ikke mangel
på teknikk.

### Den ene teknikken verdt å stjele fra epic.net

**Lineært interpolert flytende typografi.** De bruker ikke `clamp()`, men
tostegs lineær interpolasjon direkte i `calc()` (observert):

```css
font-size: calc(14.4230769231vw - 1.1538461538px);   /* største */
font-size: calc(10.2884615385vw + 0.0769230769px);
font-size: calc(3.8461538462vw + 27.6923076923px);
font-size: calc(2.4038461538vw + 17.3076923077px);
font-size: calc(0.2083333333vw + 8.3333333333px);    /* minste */
```

To ting å merke seg:

1. **Skalaspennet er ekstremt.** Fra `0.21vw` til `14.42vw` – en faktor på nesten
   70 mellom minste og største tekst. Det er skalakontrasten som gjør siden
   dramatisk, ikke bevegelsen.
2. **Formelen er `avw + bpx`.** Den gir en rett linje mellom to brekkpunkter uten
   `clamp()`s klipping. `clamp()` er enklere å lese og gjør samme nytte for oss;
   poenget er spennet, ikke syntaksen.

### epic.net sin egentlige signatur: skjulte ruter

Observert i markup, bekrefter og utvider det som allerede var funnet:

```html
/en/404-video-game/   →  merket "Puzzle"
/en/thank-you/        →  merket "Rabbit"
/#castle              →  internt anker
```

Tre skjulte innganger, merket med lekne navn, lenket fra footeren. **Dette er hele
hemmeligheten.** Ikke bevegelse – belønning for nysgjerrighet.

### Rutedelt CSS

epic.net laster `Homepage-27233730.css`, `Video-f3ad2b79.css`, `hold-small-16e76c1f.css`
separat (observert). Astro gjør dette av seg selv med `inlineStylesheets`, så vi har
det allerede.

### Framer.com bruker samme maske som vår røntgenlinse

Observert i `framer.com`-markup: `mask-image: radial-gradient(... at ..., rgba(0,0,0,1) 0%, ...)`.
Det er nøyaktig mekanikken i `Rontgen.astro`. Vi er ikke bakpå – vi har teknikken.

### Linear, Vercel, Stripe

Hentet ned forsidene (observert): ingen `clamp`, `mask-image`, `mix-blend-mode`,
`animation-timeline` eller `prefers-reduced-motion` i den serverte HTML-en. Alt
ligger i eksterne CSS-bunter som er blokkert for direkte nedlasting (Linear svarte
tomt). **Antatt:** de bruker standard React/Next med CSS-moduler og rammeverksdrevet
animasjon. Ingenting som peker på eksotisk teknikk.

---

## Del 2 – Hva som er VÅRT, og som ingen av dem har

Dette er den viktigste delen. De sterkeste grepene må bruke det ingen kan kopiere.

| Vår ressurs | Hva den gjør | Finnes den hos referansene? |
|---|---|---|
| `/api/sjekk` | Skanner en vilkårlig nettside: ytelse, headere, cookies, WCAG, org.nr. mot Enhetsregisteret | Nei |
| `/api/cookie-sjekk` | Ekte Chromium laster siden uten samtykke og rapporterer sporere | Nei |
| `/api/dmarc` | DNS-oppslag av SPF, DKIM, DMARC | Nei |
| `public/terminal.js` (6,0 kB gzip) | Terminal som kjører ekte kommandoer mot disse API-ene | Nei |
| `sikkerhet.mjs` | Våre faktiske sikkerhetsheadere som data | Nei |
| `services/skanner/wcag-navn.mjs` | 8+ WCAG-regler forklart på norsk | Nei |

Et generisk animasjonsbibliotek gjør oss til alle andre. **Disse gjør oss til oss.**

---

## Del 3 – Tolv konkrete grep, rangert etter effekt delt på innsats

Rangeringen er min vurdering. JS-vekt er anslag i gzip der ikke annet er sagt.

### 1. Skalaspennet opp til epic.nets nivå ★★★★★

**Hva:** Vår `Mega.astro` bruker `clamp(44px, 11vw, 200px)`. epic.net går til
`14.42vw` uten tak. Øk til `clamp(40px, 13vw, 260px)` på én tittel per side, og
senk den minste etiketten til 11–12 px monospace. Spennet er effekten.

**Hvor:** Hero-tittel, og én seksjonstittel per scene.

**Hvordan:** Kun CSS. Endre `--mega-size` i `typo.css`. Sjekk at ordbrytingen holder
på 390 px med `overflow-wrap: break-word` og `hyphens: manual`.

**JS:** 0 kB.

**Brandbok:** Ingen konflikt. Brandboken sier eksplisitt «uttrykksfull typografi».
Mobilgrensene (`display-xl` til 40px/40px) gjelder fortsatt for `display-xl`;
`Mega` er en egen stil utenfor den skalaen og må dokumenteres som det.

**Kan gå galt:** Lange norske sammensatte ord («sikkerhetsheadere», «integrasjoner»)
flyter ut av skjermen på 390 px. Mål det, ikke anta.

---

### 2. Skjulte ruter etter epic.nets modell ★★★★★

**Hva:** epic.net har tre lenker i footeren med lekne navn som fører til skjulte
sider. Vi har allerede terminalmodus og konami-sekvensen. Gi dem **synlige, rare
innganger** i footeren – det er det som får folk til å klikke.

**Hvor:** `LegalFooter`, som en egen liten rad under det lovpålagte.

**Hvordan:** Tre lenker med monospace-navn, for eksempel `~/terminal`,
`/sjekk --alt`, `/404`. Hver fører et sted som faktisk finnes og gjør noe.
Ren HTML.

**JS:** 0 kB.

**Brandbok:** Teknisk humor er tillatt i terminalkontekst. Monospace i footeren er
allerede brukt til org.nr. Ingen konflikt.

**Kan gå galt:** Blir det for mye, ser footeren rotete ut og de lovpålagte
opplysningene drukner. Maks tre, i `ink-faint`, under hårlinjen.

---

### 3. Skanneren som sidens hovedperson ★★★★★

**Hva:** I dag er `/sjekk` et verktøy nede på siden. Hos epic.net er det mest
særegne det første du møter. Gjør skanningen til hero-ens innhold, ikke et felt
under ingressen: resultatet skrives ut i stor monospace, ikke i en liten terminal.

**Hvor:** Hero.

**Hvordan:** `hero-live.js` finnes allerede (1,6 kB gzip) og virker. Endringen er
visuell: resultatlinjene i `clamp(18px, 2.4vw, 32px)` monospace i stedet for 14 px,
med statusfargene `ok`/`warn`/`fail` som allerede er definert.

**JS:** 0 kB ekstra – gjenbruk av det som finnes.

**Brandbok:** «Vis, ikke påstå» er prinsipp nummer én. Dette er den reneste
oppfyllelsen av det.

**Kan gå galt:** Skanningen tar 10–30 sekunder. Hero må ha en troverdig
mellomtilstand, ellers ser siden ødelagt ut mens den venter. Og en tom hero før
brukeren skriver noe er verre enn dagens.

---

### 4. Røntgenlinsen større og tydeligere ★★★★☆

**Hva:** `Rontgen.astro` finnes og virker (0,85 kB gzip for linsen). Den er for
forsiktig: liten ring, nedtonet innhold. Øk radius til 220–280 px og la innsiden
stå i full `ink`-styrke i stedet for dempet.

**Hvor:** Hero eller `/sikkerhet`.

**Hvordan:** Radiusen er `const RADIUS = 150` på linje 126 i `Rontgen.astro`, ikke
en CSS-variabel. Den settes på `--h` som brukes i `--maske` i `rontgen.css` linje 84.
Øk konstanten, og vurder å gjøre den responsiv (`Math.min(280, bredde * 0.22)`) så
linsen ikke dekker hele flaten på mobil. Fjern samtidig opasitetsdempingen på
innsidelaget. Masken er allerede `radial-gradient` – samme teknikk som framer.com
bruker (observert).

**JS:** 0 kB ekstra.

**Brandbok:** «Én detalj per skjerm» – linsen må da være den eneste aksentbruken
i hero. Fjern aksent fra noe annet der.

**Kan gå galt:** Større maske gjør at mer tekst er halvveis avdekket samtidig,
som kan lese som rot. Kontrasten må måles i begge lag på nytt etter endringen.

---

### 5. Lineær flytende typografi i stedet for brekkpunkter ★★★★☆

**Hva:** Erstatt faste mobilbrekkpunkter med epic.nets `calc(avw + bpx)`-formel
for display-stilene, så skalaen er jevn hele veien i stedet for å hoppe.

**Hvor:** `tokens.css`, `display-xl` og `display-lg`.

**Hvordan:** For spenn fra 40 px ved 390 px bredde til 120 px ved 1440 px:
`font-size: calc(7.6190476vw + 10.2857143px)`. Formelen er
`a = (maks - min) / (bredmaks - breddmin) * 100`, `b = min - a * breddmin / 100`.

**JS:** 0 kB.

**Brandbok:** Brandboken spesifiserer faste mobilverdier (`display-xl` 40px/40px).
**Dette er en reell konflikt** – enten oppdateres brandboken, eller så lar vi det
være. Min anbefaling: oppdater brandboken, fordi hoppet mellom brekkpunkter er
synlig på nettbrett.

**Kan gå galt:** Linjeavstand må følge samme interpolasjon, ellers blir tette
overskrifter rotete på mellomstore skjermer.

---

### 6. Terminalen som navigasjon, ikke bare easter egg ★★★★☆

**Hva:** Terminalen kjører allerede `sjekk`, `headere`, `dmarc`, `pris`. Gjør den
til en reell inngang: en synlig knapp i topbaren ved siden av temabryteren, med
`~`-tegnet som etikett.

**Hvor:** `Topbar.astro`.

**Hvordan:** En `iconbtn` som sender samme hendelse som `~`-tasten.

**JS:** ~0,1 kB.

**Brandbok:** Brandboken sier terminalmodus «må ikke være hovednavigasjonen». En
knapp ved siden av temabryteren er en sidevei, ikke hovedveien. Innenfor.

**Kan gå galt:** Besøkende som ikke er utviklere kan bli forvirret. Knappen trenger
`aria-label` som sier hva den gjør på norsk, ikke bare et tegn.

---

### 7. Nøkkeltall som leser seg selv fra produksjon ★★★☆☆

**Hva:** `Nokkeltall.astro` viser tall fra `bevis.ts`. Få dem fra en faktisk måling
ved bygg i stedet: kjør `/api/sjekk` mot vårt eget domene under `astro build` og
skriv resultatet til datafilen.

**Hvor:** Bevis-stripen.

**Hvordan:** Et byggesteg i `astro.config.mjs` eller et npm-skript før `build`.

**JS:** 0 kB på klienten.

**Brandbok:** «Alt skal kunne måles» og «tallene skal være sanne». Dette er den
sterkeste formen for det.

**Kan gå galt:** Bygget blir avhengig av at API-et svarer. Må falle tilbake på
siste kjente verdi med dato, ikke feile bygget.

---

### 8. Horisontal seksjon – behold, men begrens ★★★☆☆

**Hva:** `Horisont.astro` finnes. Den er bygget riktig (ekte `overflow-x`, tastatur,
redusert bevegelse faller tilbake til kolonne).

**Hvor:** Prosess eller caser – der innholdet er en sekvens.

**Hvordan:** Ferdig bygget.

**Brandbok:** **Grensetilfelle.** Brandboken forbyr parallax. Innholdet beveger seg
i en annen akse enn siden, som er beslektet. Jeg vurderer det som innenfor fordi
bevegelsen aldri er eneste vei til innholdet og sporet kan scrolles direkte – men
det er en beslutning som bør tas bevisst, ikke glippe inn.

**Kan gå galt:** På nettbrett i landskap kan sporet fylle hele skjermen og føles
som at siden har hengt seg opp.

---

### 9. Statusfargene som strukturelt språk ★★★☆☆

**Hva:** Vi har `ok`/`warn`/`fail` definert og brukt i rapporter. Bruk dem også
som strukturell farge ellers på siden – for eksempel en hårlinje i `fail` ved
siden av et avsnitt om hva som går galt uten sikkerhet.

**Hvor:** `/sikkerhet`, caser.

**Hvordan:** Ren CSS, `border-inline-start`.

**Brandbok:** **Konflikt.** Brandboken forbyr eksplisitt «fargede venstrekanter på
kort». En hårlinje ved et avsnitt er ikke et kort, men det er nær nok til at det
bør avklares før det bygges.

**Kan gå galt:** Fargen mister betydning hvis den brukes dekorativt. Da virker
rapportene mindre alvorlige.

---

### 10. Visningsoverganger mellom sider ★★☆☆☆

**Hva:** `view-transition` på navigasjon, så sidebytter glir i stedet for å blinke.

**Hvor:** Hele siden.

**Hvordan:** Astros `<ViewTransitions />`.

**JS:** ~2 kB.

**Brandbok:** Ingen direkte konflikt, men «bare mikrointeraksjoner» er en stram
formulering.

**Kan gå galt:** Astros klientruting kan bryte skriptene våre som kjører én gang
ved lasting (`terminal.js`, `hero-live.js`, røntgenlinsen). De må da kobles til
`astro:page-load` i stedet for `DOMContentLoaded`. **Ingen av referansene bruker
dette** (observert: 0 treff på alle tre). Lav prioritet.

---

### 11. Lottie- eller Rive-animasjoner ★☆☆☆☆

**Hva:** Dropbox bruker begge (observert).

**Vurdering:** **Ikke verdt det for oss.** Lottie-runtime er 60–250 kB gzip
avhengig av bygg. Rive er rundt 100 kB wasm. Begge krever illustrasjonsarbeid i
verktøy vi ikke har. Dropbox har et designteam og et merkevarebudsjett; vi har et
ytelsesbudsjett. Vår SVG- og CSS-vei gir 95 % av effekten til 2 % av vekten.

---

### 12. Framer eller Webflow som plattform ★☆☆☆☆

**Hva:** To av tre referanser kjører på no-code.

**Vurdering:** **Direkte skadelig for oss.** Vi selger at vi bygger selv, eier koden
og holder Lighthouse 95+. Framer-siden bdsn.club leverte 189 kB HTML; vår forside
er en brøkdel. Å bytte plattform ville motsagt hele salgsargumentet.

---

## Del 4 – Hva som ikke er verdt det

**Ren pynt som koster ytelse uten å selge noe:**

1. **Lottie og Rive** (punkt 11). 60–250 kB for bevegelse vi kan lage i CSS.
2. **Egendefinert markør.** bdsn har `data-framer-cursor` (observert). Det skjuler
   systemmarkøren, bryter tilgjengelighetsforventninger og gir null informasjon.
3. **Tekst som skriver seg selv utenfor terminalen.** Brandboken forbyr det allerede,
   og med god grunn: det forsinker lesing uten å tilføre mening.
4. **Scroll-drevet video som bakgrunn.** Vi har prøvd det. En nedtonet video bak
   tekst leser som tapet, og det generiske motivet var selve problemet. Et innrammet
   opptak av produktet som virker, slår det hver gang.
5. **`mix-blend-mode` for stemning.** epic.net bruker det én gang. Det er dyrt å
   komponere og uforutsigbart over temaer.
6. **Flere webfonter.** Vi har to, selvhostet, 116 kB. Det er riktig.

---

## Del 5 – Den ubehagelige konklusjonen

Sidene brukeren liker er **ikke teknisk mer avanserte enn vår**. epic.net har null
`clamp()`, null `mask-image`, null `animation-timeline`. Vi har alle tre.

Forskjellen ligger i tre ting:

1. **Skalaspenn.** De tør å gå fra 11 px til 14 vw på samme side. Vi er forsiktige.
2. **Skjult dybde.** Tre rare lenker i footeren som belønner nysgjerrighet.
3. **Konseptuell klarhet.** Hver seksjon har én idé, og ideen er konkret.

Alle tre er gratis. Ingen av dem krever et nytt bibliotek.

Og vi har noe ingen av dem har: et produkt som finner ekte feil på ekte nettsider
mens du ser på. Den sterkeste kreative avgjørelsen er å la det produktet være
innholdet, ikke en knapp under ingressen.

---

## Kilder

Hentet og analysert 6. oktober 2026:

- `https://www.epic.net/en/` – rå HTML (163 kB), `index-317f88c7.css` (97 kB), `Homepage-27233730.css` (6 kB)
- `https://www.bdsn.club/` – rå HTML (189 kB)
- `https://brand.dropbox.com/` – rå HTML (104 kB)
- `https://www.framer.com` – rå HTML (1,9 MB)
- `https://linear.app`, `https://vercel.com`, `https://stripe.com` – rå HTML; CSS-bunter utilgjengelige for direkte nedlasting
- `https://tympanus.net/codrops/` – svarte 5,6 kB, antagelig blokkert
