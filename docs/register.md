# Registertallene, tusjstreken og den fjerde tilstanden

Bygget 7. oktober 2026, ut fra `docs/research-2026.md`. Dette dokumentet sier hva
som ble bygget, hva som ble målt underveis, og hva som ble valgt bort.

Utgangspunktet fra researchen var ubehagelig og tydelig: siden som vant Awwwards av
de fem forbildene animerer minst av dem alle, juryens høyeste karakter på den var
**Innhold 8,20**, og vi ligger allerede foran forbildene på teknikk. Flere effekter
løser derfor ingenting. Prioriteringen her er innhold og friksjon, ikke bevegelse.

Fire forslag er bygget, ett er målt og **forkastet**, og resten er listet nederst med
grunn.

---

## 1. Forslag 15 – norske tall fra Uu-tilsynets åpne datasett

Det eneste forslaget på hele lista som gir oss et **innhold ingen annen norsk
leverandør har**. Sant, norsk, offentlig, og stort nok til å bære en påstand.

### Hva som ble bygget

| Fil | Hva |
|---|---|
| `src/lib/uuregister.ts` | Ren aggregering, ingen nettverk. Typer, `aggreger()`, navnetabell for alle 48 krav, kobling til skannerens regelliste |
| `scripts/uuregister.mjs` | Henter hele settet og skriver et datert øyeblikksbilde. Kjøres for hånd |
| `src/data/uu-register.json` | Øyeblikksbildet, 8 kB, sjekket inn |
| `src/components/Registerstolper.astro` | Tabellen med stolper. 0 kB JavaScript |
| `src/pages/artikler/wcag-i-registeret.astro` | Artikkelen |
| `test/uuregister.test.ts` | 35 tester |

### Tallene, hentet 7. oktober 2026

Alle 9 549 erklæringer hentet, ikke et utvalg. Samme antall som API-et selv oppgir.

| | |
|---|---|
| Erklæringer / virksomheter | 9 549 / 1 326 |
| Nettsteder / apper | 8 829 / 720 |
| Delvis i samsvar / I samsvar / Ikkje i samsvar | 7 311 / 2 216 / 22 |
| Andel med minst ett selvrapportert brudd | **76,8 %** |
| Brudd per løsning: snitt / median / maks | 6,63 / 4 / 47 |
| Egenkontroll: `talBrot` = antall «no»-rader | **9 549 av 9 549** |

De seks øverste kravene etter andel rapporterte brudd:

| Krav | Navn | Andel | Vår skanner |
|---|---|---|---|
| 1.2.5 | Synstolking (forhåndsinnspilt) | 48,4 % | nei |
| 1.1.1 | Ikke-tekstlig innhold | 42,6 % | **ja** |
| 1.3.1 | Informasjon og relasjoner | 38,2 % | **ja** |
| 1.2.2 | Teksting (forhåndsinnspilt) | 33,7 % | nei |
| 1.4.3 | Kontrast (minimum) | 33,1 % | **ja** |
| 4.1.2 | Navn, rolle, verdi | 29,8 % | **ja** |

**Artikkelens ene idé, som kan fortelles i én setning:** av de tolv kravene norske
virksomheter oftest rapporterer brudd på, har vår egen skanner en regel for fem.

Det tallet er **ikke skrevet inn noe sted.** Det utledes av `WCAG_NAVN` i
`src/data/wcag.ts` hver gang siden bygges. Legger noen til en regel i skanneren, går
tallet opp av seg selv – og ingen kan påstå en dekning vi ikke har. En test feiler
hvis koblingen brytes.

### Fire presisjoner som følger tallene overalt

1. Registeret dekker **offentlige** virksomheter, som har erklæringsplikt.
2. Tallene er **selvrapporterte**, ikke målt av oss.
3. Offentlig sektor er bundet av 48 krav etter WCAG 2.1, private av 35 etter
   WCAG 2.0. De to listene er ikke de samme.
4. «Ikke relevant» er holdt **utenfor nevneren**. Det er ikke pedanteri: 5 094
   erklæringer sier at 1.2.5 ikke gjelder dem. Hadde de ligget i nevneren, ville
   kravet som faktisk topper lista framstått som et lite problem.

Uten disse fire er tallet en falsk generalisering – samme feil som en falsk «Bestått».

### Tre kvirker i API-et, og en korreksjon av researchen

Alt målt, og ingen av dem er dokumentert hos kilden.

1. **`page` er 1-indeksert.** `?page=0` svarer HTTP 200 med en **tom konvolutt** –
   `_embedded` mangler helt – selv om `page.totalPages` sier at sidene finnes.
   Utelater man `page`, får man side 1.
2. **`size=1000` virker, men bare sammen med `page >= 1`.** Kombinasjonen
   `page=0&size=1000` ser ut som «store sider støttes ikke».
   `docs/research-2026.md` skriver *«API-et er paginert i 955 sider på 10, men godtar
   `size=1000`»* – det første er standarden, det andre krever altså `page >= 1`.
   Vi tok feil vei først, og det kostet tid.
3. **`Accept: application/json` gir HTTP 406.** API-et svarer `application/hal+json`.
   Vi sender ingen Accept-header. Dette stemmer med researchen.

I tillegg: **`/dataset/metadata` svarer HTTP 500** med full Java-stacktrace.

### Navnene er kontrollert mot regulatoren, alle 48

Kravnavn og nivå er lest ut av Uu-tilsynets egen sitemap, og deretter **kontrollert
mot sidetittelen på tilsynets egen side for hvert enkelt krav**. 48 av 48 stemmer
på navn, nivå og lenke. To navn var feil i første utkast og ble rettet mot kilden:

- 1.4.10 «Dynamisk tilpasning (reflow)» → **«(Reflow)»**, stor R
- 3.3.4 «(juridiske, økonomiske, datafeil)» → **«(juridiske feil, økonomiske feil, datafeil)»**

Hver rad i tabellen lenker til tilsynets side for kravet, så leseren kan kontrollere
raden hos kilden og ikke bare hos oss.

### Lisens: funnet, ikke antatt

Ført i `assets/LICENSES.md`. Kort: **ingen lisenstekst er oppgitt for settet.**
Tilsynets egen side kaller det åpne data og tilbyr nedlastingsskript;
`/dataset/metadata` svarer 500; settet lot seg ikke finne i Felles datakatalog.
Enhetsregisteret er NLOD 2.0 på data.norge.no, men **det sier ingenting om dette
settet**, og vi fører det derfor ikke som NLOD.

Vi publiserer ikke datasettet. Vi publiserer **vår egen aggregering** – summer og
andeler, ingen virksomhetsnavn, ingen organisasjonsnumre, ingen adresser – med kilde,
hentedato og lenke tilbake. Skal rådata eller enkeltoppføringer publiseres, må
lisensen innhentes fra tilsynet først.

### Hvordan tallene oppdateres

```bash
node scripts/uuregister.mjs          # henter og skriver
node scripts/uuregister.mjs --torr   # henter og skriver ingenting
```

Skriptet kjøres **for hånd, ikke i bygget**: settet er ~250 MB over ti forespørsler,
og et bygg som må laste det ned er et bygg som feiler den dagen tilsynet bytter
sertifikat. Resultatet er 8 kB som sjekkes inn, så siden bygger uten nett og tallet
på siden er alltid tallet vi faktisk har sett. Diffen i git er dokumentasjonen på hva
som endret seg. Oppdater `oppdatert` i `src/data/artikler.ts` i samme omgang.

---

## 2. Forslag 17 – tusjstreken (`src/components/Tusjstrek.astro`)

Phamilypharmas mest kopierbare grep, og det eneste i vårt vokabular som peker på
**poenget i en setning** i stedet for å flytte en hel blokk. Vi har sju
`Avslor`-gester, og alle sju flytter en blokk.

### Den er en strek UNDER ordet, ikke en flate bak det, og det er målt fram

Phamily legger tusjen bak teksten. Det holder ikke i vårt fargesystem, fordi
aksenten vår er lime – en **lys** farge – og en limeflate på en lys flate er usynlig.
Målt over alle tre temaer og begge flateregistre, aksent mot flaten:

| alfa | mørkt | varm | **lyst** |
|---|---|---|---|
| 22 % | 1,74–1,80:1 | 1,82–1,84:1 | **1,08–1,09:1** |
| 34 % | 2,61–2,67:1 | 2,65:1 | **1,12–1,14:1** |

Lyst tema går ikke over 1,14:1 uansett hvor mye lime vi heller på.
`--accent-soft` er like ille: **1,02:1** mot `--bg` i lyst tema.

Derfor bærer **streken** effekten og flaten er bare et tillegg:

- **streken** er `--accent-text` (eller `--ok`/`--warn`/`--fail`). Målt mot begge
  flater i alle tre temaer: laveste 4,84:1, høyeste 15,06:1. WCAG 1.4.11 krever 3:1.
- **flaten** er aksenten på 22 % alfa. Synlig i mørkt og varmt tema, praktisk talt
  usynlig i lyst – og det er greit, fordi den ikke er alene om jobben.

Teksten røres ikke: `--ink` hele veien, laveste målte 7,30:1 over flaten.

### Målt feil nummer to: området måtte finnes, ikke gjettes

- **`entry 55% cover 30%`** (første forsøk, samme familie som resten av huset):
  på et 700 px vindu lå den første tusjstreken på y = 652, altså **over folden**,
  og sto på **23,7 %** bredde ved innlasting. En halvtegnet strek på en setning
  leseren allerede kan lese.
- **`entry 25% entry 100%`** (andre forsøk): løste det, og laget en ny feil. `entry`
  spenner bare over elementets egen høyde i scroll, og for et ord på 20 px er hele
  animasjonen over på 20 piksler. Målt på åtte scrollposisjoner: **100 % på alle
  åtte.** Gesten fantes ikke lenger.
- **`entry 10% cover 22%` + propen `staar`** (landet): streken tegner seg over ~200
  px rulling (21,6 % → 97,6 % → 100 %), og `staar` slår animasjonen helt av for alt
  som kan stå over folden.

**Det er ikke mulig å løse begge deler i ett område.** Et område langt nok til å ses
er per definisjon ikke ferdig for et element som står stille over folden. Resten av
huset løser det samme med `.scene:first-of-type`-overstyringer; `staar` er samme grep
i komponentform.

### Den redaksjonelle regelen

**Én per skjerm.** Phamily bruker den på ordspillene – på det de vil at du skal
huske. Brukes den tre ganger i samme avsnitt, er den en understreking, og en
understreking som er overalt peker ingensteds. En test håndhever maks én per `<p>`.
`<strong>` beholdes, så skjermlesere er upåvirket.

I bruk tre steder på artikkelen, godt adskilt.

---

## 3. Forslag 5 – `@media (scripting: none)` (`src/components/Utenskript.astro`)

En av de fire bindende degraderingstilstandene våre er «uten JavaScript», og den har
til nå bare vært **testbar**, ikke **formbar**. `<noscript>` kan ikke stilsettes og
kan ikke stå inne i en setning. `@media (scripting)` kan, og er Baseline widely
available 2026-06-07 – Chrome 120, **Firefox 113**, Safari 17, altså langt under
Firefox ESR 140.

### Den konkrete friksjonen den fjerner

På `/om` sto bildeteksten under lagstabelen: *«Dra i stabelen. De fire lagene er de
samme vi leverer i hvert prosjekt.»* `Lagstabel` degraderer helt riktig uten
JavaScript – `:not([data-klar])` setter lagene 0,7 fra hverandre og skjuler
kontrollene – men **teksten ved siden av ba leseren om å gjøre noe som ikke gikk an.**
På en side som selger at vi sjekker slike ting hos andre.

Verifisert i headless Chrome med `javaScriptEnabled: false`:

```
MED JavaScript  /om               [med] Figuren er fire ekte lag i DOM-en, ikke en video.
UTEN JavaScript /om               [uten] Uten JavaScript står lagene fra hverandre i stedet …
MED JavaScript  /lab/interaksjon  [med] Lagene er ekte DOM, ikke en video. …
UTEN JavaScript /lab/interaksjon  [uten] Uten JavaScript ligger lagene fra hverandre …
```

### Regelen komponenten håndhever

**Begge setningene ligger i DOM-en, og standardtilstanden viser begge.**
`scripting: enabled` skjuler «uten», `scripting: none` skjuler «med», og en nettleser
som ikke kjenner spørringen viser begge. Teksten må derfor skrives slik at begge
sammen også leses greit. Spørringen brukes til å **forklare og tilby**, aldri til å
skjule innhold.

**Forbeholdet som må stå:** en utvidelse som blokkerer skript på andre måter enn
nettleserens egen innstilling vipper ikke nødvendigvis spørringen. Den er en
**forbedring av** tilstanden uten JavaScript, ikke en erstatning for at innholdet må
virke uten.

I bruk på `/om` og `/lab/interaksjon` (to steder).

---

## 4. Forslag 6 – `sibling-index()` i stedet for en `trinn`-prop

Forskyvningen mellom de tolv stolpene i `Registerstolper` regnes ut av CSS fra radens
egen plass i tabellen. Ingen `--i` i markupen. Baseline newly available 2026-08-18.

**To målte feller, og den andre er alvorlig.**

### Felle 1: forskyvningen må ligge i `animation-range`, ikke i `animation-delay`

Første forsøk var `animation-delay: calc(sibling-index() * var(--takt) * -0.06)`.
Det ser riktig ut og er helt galt: på en scroll-tidslinje er `animation-duration`
1 ms, og en forsinkelse på −66 ms er da 66 ganger hele animasjonen. **Alle tolv
stolpene lå klemt på 1.00 i hver eneste av sju scrollposisjoner.** En forsinkelse i
sekunder hører til dokumentets tidslinje; på en scroll-tidslinje er det *området* som
er tiden. `Snitt` og `Flyt` gjør det allerede slik med `--i`.

### Felle 2: `overflow-x: auto` dreper `view()`, og degraderingen gikk mot skjult

`overflow-x: auto` gjør elementet til en **rullebeholder i begge akser** – CSS
tillater ikke `overflow-x: auto` sammen med `overflow-y: visible`. Og
`animation-timeline: view()` måler mot nærmeste rullende forelder. Stolpene lå altså
i en boks som aldri ruller loddrett.

Målt, fire scrollposisjoner fra 1000 til 2200:

```
med overflow-x: auto     1.00 ×8, så 0.87 0.64 0.41 0.18   — uendret i alle fire
med overflow: visible    0.10 … → 1.00 ×5, 0.77 0.53 0.30 … → alle 1.00
```

Den første raden er ikke bare «ingen animasjon»: **de fire nederste stolpene ble
stående på 0,18–0,64 for alltid.** Det er degradering mot *skjult*, og det er den ene
feilen dette huset ikke gjør.

Løsningen: rulleboksen slås bare på under 52 rem, og i samme mediaspørring står
stolpene ferdig vokst. En test feiler hvis de to skilles – kontrollert ved å fjerne
`transform: scaleX(1)` og se testen bli rød.

Resultat, 1280 px, stolpenes `scaleX` ved stigende scroll:

```
scrollY 1100   0.56 0.33 0.09 0 0 0 0 0 0 0 0 0
scrollY 1300   1.00 1.00 1.00 0.78 0.54 0.31 0.07 0 0 0 0 0
scrollY 1500   1.00 ×7, 0.76 0.53 0.29 0.05 0
scrollY 1900   alle 1.00
```

---

## Målt og FORKASTET: forslag 10, `content-visibility: auto`

Researchen rangerer det blant de sterkeste CSS-teknikkene og noterer at det ikke er
gjennomført. Vi gjennomførte det, målte det, og **lar være å ship'e det.**

Median av sju innlastinger per side, Chrome, 1280×900, via CDP
`Performance.getMetrics`, med `.section:nth-of-type(n+3), .scene:nth-of-type(n+3)
{ content-visibility: auto; contain-intrinsic-size: auto 900px }`:

| Side | høyde uten → med | layout uten → med | stil uten → med |
|---|---|---|---|
| `/artikler/wcag-i-registeret` | 6174 → 6174 px | 24,6 → **25,9** ms | 8,9 → 9,1 ms |
| `/handbok` | 8182 → **8678** px | 9,0 → 9,3 ms | 11,2 → 11,5 ms |
| `/caser` | 4618 → 4605 px | 6,9 → 7,4 ms | 7,4 → 8,4 ms |
| `/om` | 4895 → **5013** px | 11,8 → 11,9 ms | 6,5 → 7,0 ms |

**Ingen gevinst på noen side**, og på to av fire **endrer dokumenthøyden seg** fordi
`contain-intrinsic-size` gjetter feil på seksjoner som aldri er rendret. Det betyr
rullefelt som lyver og dybdelenker som lander feil – nøyaktig risikoen researchen
selv flagger som obligatorisk å unngå.

Konklusjonen er at **sidene våre er for små til at teknikken har noe å gjøre.**
Den er riktig for sider med tusenvis av noder utenfor skjermen. Vi selger ytelse, og
da kan vi ikke legge inn en teknikk som måler dårligere enn å la være. Tas opp igjen
hvis en side vokser forbi ~15 000 px.

---

## Mindre funn rettet underveis

- **`/artikler` telte feil.** Ingressen sa «Tre artikler» og bunnteksten «Alle tre er
  kontrollert» mens det lå fire kort på siden. Begge regnes nå ut av lista.
- **Bunnteksten oppga feil dato.** Den brukte `sortert[0].oppdatert` – den *sist
  publiserte* artikkelen – og påsto dermed at alt var kontrollert i dag. Den oppgir
  nå den **eldste** kontrolldatoen, som er den som sier noe om det svakeste leddet.
  På juridisk innhold var det den gale halvdelen å oppgi.
- **`<caption>` i en `display: block`-tabell** får bredden til første kolonne og brøt
  til ett ord per linje. Rulleboksen er nå et eget element rundt tabellen, og
  tabellen beholder `display: table`.
- **Tusjstreken spiste mellomrommet etter ordet.** Negativ marg i begge ender limte
  «… ett brudd.» og «Medianløsningen …» sammen. Negativ marg bare til venstre nå.
- **Dobbel instruks på `/om`.** `Lagstabel` skriver selv «Dra i stabelen, eller bruk
  piltastene» under spaken. Bildeteksten gjentok den. «med»-setningen sier nå hva
  figuren *er* i stedet.
- **Tabellen på mobil.** Tre runder: først lå prosentkolonnen utenfor skjermkanten
  (tallet som *er* dataen krevde sidelengs dragning); så brøt kravnavnene midt i
  ordet på 67 px; til slutt rant kolonneoverskriftene inn i hverandre. Landet på
  faste kolonnebredder der krav, navn og prosent er innenfor 290 px av en 310 px
  boks, og de to utledbare kolonnene ruller inn.
- **Det vanlige `visually-hidden`-mønsteret fungerer ikke i en tabellcelle inne i en
  rulleboks.** Et absoluttplassert element uten posisjonert forelder rømmer ut:
  `scrollWidth` vokste fra 310 til 344 px – 34 px falsk rullebredde på en tabell som
  ellers passet.

---

## Tilstand etter arbeidet

```
npm run test     245 passerer (210 før, 35 nye), 0 feil
npx astro check  0 feil, 0 advarsler, 0 hint
npm run build    grønt
```

Førstelast målt mot `server.mjs`, Chrome, 1280×900:

| Side | Vekt | Mot taket på 400 kB |
|---|---|---|
| `/artikler/wcag-i-registeret` | **112,8 kB** | 28 % |
| `/artikler/35-wcag-krav` | 108,8 kB | 27 % |
| `/om` | 134,8 kB | 34 % |
| `/` | 131,5 kB | 33 % |

Den nye artikkelen er den letteste av sidene som ble målt. **De tre nye komponentene
legger til 0 byte JavaScript** – 7,7 kB er samme tall som på artikkelen ved siden av.
Null nye cookies, null nye tredjeparter, ingen CSP-endring.

---

## Ikke bygget, og hvorfor

| # | Forslag | Hvorfor ikke |
|---|---|---|
| 1 | Egne fontsubsett | `src/styles/fonter.css` eies av andre agenter nå. **Verdt 15,4 kB** – det største enkelttiltaket som står igjen |
| 3 | Navngitte easing-tokens | `src/styles/tokens.css` er ikke vårt. Se overlevering under |
| 4 | CSS ut av HTML-en | `astro.config.mjs` + `sikkerhet.mjs` + delte tester. For bredt til å ta uten koordinering |
| 7 | `text-box-trim` | Krever at avstandene rundt alle overskrifter kalibreres på nytt – altså `src/styles/` |
| 8 | `offset-path` | Mer bevegelse. Researchens eget hovedfunn sier at det ikke er det som mangler |
| 9 | FAQ i alle tre motorer | Rettelsen hører hjemme i `src/styles/site.css` linje 389. Se overlevering |
| 11 | `contrast-color()` | Nytteverdien er som nett under flateregistrene, som ligger i `tokens.css` |
| 13 | Agent-beredskapssjekk | Et verktøy hører hjemme på `/verktoy`, som ikke er vårt. Største forslaget på lista |
| 14 | Markdown-innholdsforhandling | `server.mjs` er delt drift-infrastruktur. Lav kompleksitet, bør tas |
| 16 | Content Signals | `robots.txt.ts` er delt. Trivielt, men verdien er dokumentarisk og ingen crawler respekterer den |
| 18 | Variabelskriftakse | Mer bevegelse, og den ene med reell layout-risiko (endret vekt reflower tekst) |
| 19–22 | Illustrasjoner, tekstforfatter, én idé per side, ny displayskrift | Koster penger eller en beslutning eieren må ta. Artikkelen her er ett forsøk på nummer 21 |

---

## Overlevering til agentene som eier `src/styles/`

Tre endringer som hører hjemme i de delte arkene, og som ikke ble gjort:

1. **`.kv { margin: 0 }` i `site.css`.** `<dl>` har 1em marg fra nettleserens egen
   stilmal. `/status` har en scoped lapp for dette med en kommentar om at den riktige
   kuren ligger i `site.css`. Står fortsatt.
2. **FAQ-overgangen, `site.css` linje 389** ligger bak
   `@supports (interpolate-size: allow-keywords)`. Den er Chromium-bare – 71,74 %, og
   **verken Firefox eller Safari har en pref for den.** `grid-template-rows: 0fr → 1fr`
   på `::details-content` gir samme effekt i alle tre motorer. Merk fellen som alt er
   dokumentert på linje 401: den globale `prefers-reduced-motion`-regelen treffer `*`,
   `*::before` og `*::after`, men **ikke** `::details-content`.
3. **Easing-tokens.** Seks `cubic-bezier()`-kurver i 24 forekomster, pluss 37 nakne
   nøkkelord, og null tokens. De tre komponentene her bruker `linear` på
   scroll-tidslinjer, som er riktig uansett, så de trenger ingen endring – men de kan
   ikke bidra med en signatur heller før tokenene finnes.

Og én ting til protokollen: `.skudd/`-skriptene som ble brukt til målingene her lå i
`.skudd/tmp-reg/` og er slettet. Målingene står i dette dokumentet, ikke i verktøyene.
