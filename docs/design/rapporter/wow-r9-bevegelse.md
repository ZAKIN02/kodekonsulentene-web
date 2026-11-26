# wow-r9-bevegelse: revisjon av all bevegelse

Dato: 24. nov. 2026. Gren: `redesign/wow`. Ikke commitet.

## Kort

- **Ingen P0.** Ingen side hakker i målingene: 0 bilder over 20 ms og 0 lange oppgaver under rulling på
  27 sider i to profiler (desktop 1440 og mobil 390 med CPU-struping 4x), bortsett fra ett enkelt bilde
  på 33 ms. Ingenting animerer layout under rulling. Ved redusert bevegelse og uten JavaScript står
  ingen tekst skjult på noen side.
- **Fem P1 er rettet:** sideoverganger manglet helt, knappene svarte ikke på trykk (og «strek» og «mørk»
  ga ingen tilbakemelding i det hele tatt under pekeren), FAQ-en hoppet 32 px i starten av åpningen og i
  slutten av lukkingen og kunne ikke avbrytes, og motoren hadde bare harde kutt og ikke noe hold.
- **Motoren har nå det manus v6 trenger,** datadrevet per segment: `som: "kutt" | "toning" | tall` og
  `hold: { ved, lengde }`. Dagens film har ingen av delene satt og oppfører seg som før. Testet med
  dagens klipp.
- **Rullefilmen er ikke målbart dårligere.** Tid bak rullingen, median: desktop 4,7 % før (sju
  kjøringer) og 4,7 % etter (tre), mobil 4x 4,7 % før og 4,8 % etter. 0 frys før og etter. Forskjellen
  ligger innenfor spredningen mellom kjøringer av samme bygg. Se forbeholdet under «Før og etter».
- **`npm run verify`:** {{VERIFY}}.

## Slik er det målt

Alt ligger i `.design/arbeid/bevegelse/r9/`. Én Mac (Apple M3), hodeløs Chrome (installert kanal) og
Playwrights WebKit. Ingen ekte telefon. CPU-struping 4x bremser hovedtråden, ikke videodekodingen.

| Skript | Hva |
|---|---|
| `revisjon.mjs` | Per side og profil: ruller hele siden ned og opp, teller bilder over 20, 34 og 50 ms, lange oppgaver, layoutskift og vannrett rulling, og logger hva som faktisk animeres: alle CSS-animasjoner og -overganger (`document.getAnimations()`, egenskap for egenskap) og alle inline-stiler skrevet per bilde (det GSAP og skriptene våre gjør). Så redusert bevegelse og uten JavaScript: tekst med `opacity: 0`, `visibility: hidden` eller klippet bort. |
| `samspill.mjs`, `faq-spor.mjs`, `trykk.mjs` | FAQ åpne, lukke og avbryte (høyde per bilde), prisvelgeren, knappetrykk. |
| `.skudd/wow/r7-flyt/maal-side.mjs` | Samme måling som wow-r7-flyt: filmen fem ganger gjennom pluss vugging. |
| `som-stripe.mjs` | Kontaktark over hver søm, fem bilder fra −0,03 til +0,03 skjermhøyder, med kutt og med toning. |
| `tests/wow/som.spec.ts`, `tests/wow/sideovergang.spec.ts`, `test/som.test.ts` | Nye tester. |

Koden er lest fil for fil: `src/scripts/wow/` (28 filer), `src/styles/wow.css`, `wow-bevegelse.css`,
`tokens-wow.css`, og stilene i komponentene under `src/components/wow/`.

## Funn, prioritert

Rekkefølgen er virkning delt på innsats. «Rettet» betyr rettet i denne runden.

| # | Pri | Hvor | Funn | Status |
|---|---|---|---|---|
| 1 | P1 | `src/styles/wow-bevegelse.css` (manglet), plan i `docs/design/wow-undersider.md:89` | **Sideoverganger fantes ikke.** Planen sier krysstoning mellom sider og toppfelt som står stille. MalWow hadde ingen `@view-transition`; hver navigasjon var et hardt bytte. Det som burde animere, gjorde det ikke. | Rettet |
| 2 | P1 | `src/styles/wow.css:229` (`.wow-knapp:active`), `:261`, `:275` | **Knappene svarte ikke på trykk i formen**, bare med en fargeovergang på 280 ms. På «strek» og «mørk» lå hover-regelen etter `:active` med samme vekt, så et trykk under pekeren ga ingen tilbakemelding i det hele tatt. | Rettet |
| 3 | P1 | `src/scripts/wow/accordion.ts` (før: `height: 0` alene), `src/styles/wow.css:2196` | **FAQ-en hoppet.** Svaret har 32 px luft i bunnen. Høyden gikk til 0, men luften sto, så boksen startet åpningen med et hopp på 32 px og avsluttet lukkingen med et hopp på 32 px. Målt per bilde: 116 → 81 → 55 → 37 → 32 → 32 … → 0. | Rettet |
| 4 | P1 | `src/scripts/wow/accordion.ts:43` (før: `fromTo` fra `height: 0`) | **FAQ-en kunne ikke avbrytes.** Et nytt trykk midt i lukkingen startet åpningen fra null. Lukkingen brukte `power3.inOut` over 400 ms: treg start på et svar på et trykk. | Rettet |
| 5 | P1 | `src/scripts/wow/scroll-world.ts`, `src/data/historie.ts` | **Motoren hadde bare harde kutt og ikke noe hold.** Manus v6 trenger krysstoning i sju sømmer, tre harde kutt og hold på frysrammen i T6. | Rettet |
| 6 | P2 | `src/styles/wow.css:218` (før), `:247`, `:259` | **Hover ble hengende på berøringsskjerm.** `.wow-knapp:hover` gjaldt uten `@media (hover: hover)`, så «Start befaringen» sto i hover-fargen etter et trykk. | Rettet |
| 7 | P2 | `src/styles/wow.css:2517` (før) | **`.wow-hode__pil` animerte `margin`** (layout) når «Tjenester» åpnes. Eneste overgang på en layoutegenskap i wow-stilene. | Rettet (`translate`) |
| 8 | P2 | `src/scripts/wow/split.ts:93` | **Overskriftene brukte 1,15 s per linje og 85 ms mellom linjene.** Tre linjer var på plass etter 1,3 s. Del 8 sier inntoninger 400–700 ms; lesingen skal ikke vente på bevegelsen. | Rettet (0,9 s og 70 ms) |
| 9 | P2 | `src/scripts/wow/reveal.ts:36` (før: `autoAlpha`) | **`data-reveal="fade"` satte `visibility: hidden`** på blokker som ikke var rullet inn. Tab hoppet da over lenker i dem. Brukes i dag bare på lab-sidene, men attributtet er i kontrakten. | Rettet (`opacity`) |
| 10 | P2 | `src/styles/wow.css:1179` (før) | `.wow-tjeneste__flater:hover` skalerte bildet uten `hover`- og bevegelsesspørring. Komponenten (`Tjenester.astro`) brukes ikke av noen side nå. | Rettet |
| 11 | P3 | `src/scripts/wow/scroll-world.ts:412` | `--sw-zoom` settes som egendefinert egenskap på laget og leses av barnet (`.sw__poster`). En arvet variabel gir stilberegning for alle barn. Her er det to barn, og målingen viser ingen kostnad. | Ikke rørt |
| 12 | P3 | `src/components/wow/tjeneste/KodeBygg.astro:260` (`kb-linje`) | Animerer `background-color` sammen med `clip-path` (maling per bilde). Ingen bilder over 20 ms på `/nettsider`. | Ikke rørt |
| 13 | P3 | `src/styles/wow.css:170` (`.wow-lenke`), `:1645` (`.wow-velger__radio`) | Overgang på `background-size` og `box-shadow` (maling). Små flater, ingen målt kostnad. | Ikke rørt |
| 14 | P3 | `src/scripts/wow/count.ts:45–49`, `src/scripts/wow/felles.ts` (`KURVE`), `src/styles/tokens-wow.css:186` | Tre nesten like ut-kurver: GSAP `expo.out`, `cubic-bezier(0.16, 1, 0.3, 1)` skrevet inn i count.ts, og `--wow-kurve: cubic-bezier(0.2, 0.7, 0.1, 1)`. Pluss én bar `ease-out` (`count.ts:49`). Bør samles i ett sett. | Ikke rørt |
| 15 | P3 | `src/styles/wow-bevegelse.css:763` | Ringen rundt lampa (`sw-lampe`, 700 ms) spilles ved lasting i de statiske blokkene, også uten JavaScript. Pynt uten årsak; ingen ser den under folden. | Ikke rørt |
| 16 | P3 | `src/scripts/wow/reveal.ts:27` | `data-reveal="clip"` bruker `power3.inOut` over 1,25 s på en inngang (treg start). Bevisst («teppe», `felles.ts`), derfor ikke rørt, men det er den lengste inngangen på siden. | Ikke rørt |
| 17 | P3 | `src/components/wow/seksjoner/Garanti.astro:120–123` | `data-scale-in` på flaten og `data-split` på setningen inni: to lag inngang i samme beholder. Skaleringen følger rullingen, så de slåss ikke i praksis. | Ikke rørt |

**Det som ikke er funn.** Rulling: alt som skrives per bilde er `transform`, `opacity`, `clip-path`,
`visibility` og `stroke-dashoffset` (én SVG-linje). Eneste layoutegenskap i loggen er `min-width` på
prisene, satt én gang for å låse bredden. Redusert bevegelse: Lenis, GSAP-innganger, film, peker og
festede scener er av, og tidene i `tokens-wow.css` er 0 ms. Uten JavaScript: ingen startstil skjuler
noe. Båndet (`data-marquee`) har stoppknapp og stopper under pekeren (WCAG 2.2.2). Tastatur gir ingen
animasjon på fokus. Overgangen fra film til rapport (`overgang.ts`) skriver bare `transform` og
`opacity` og er kontinuerlig begge veier.

## Hva som er rettet

**Sideoverganger (funn 1).** `@view-transition { navigation: auto; }` i `wow-bevegelse.css`, inne i
`@media (prefers-reduced-motion: no-preference)`. Innholdet krysstones på 280 ms (`--wow-tid-svar`,
`--wow-kurve-inn-ut`), og toppfeltet har `view-transition-name: wow-hode` og står stille. Ren CSS:
`bygger` trenger ikke sette inn noe i malen. Planen sa 200 ms; jeg har brukt tokenet på 280 ms (del 8
sier 250–400 ms, og det finnes ikke noe token på 200). Firefox har ikke overganger mellom dokumenter
og bytter side som før.

**Knapper (funn 2 og 6).** `.wow-knapp:active { scale: 0.97 }` med 160 ms (`--wow-tid-kort`). `scale`
og ikke `transform`, fordi `data-magnetic` eier `transform`. Målt under trykk: 1 → 0,979 → 0,971 → 0,97
på fire bilder, tilbake ved slipp. Regelen har `!important`, og det er med vilje: GSAP setter
`scale: none` inline på alt det flytter, og uten `!important` sto de magnetiske knappene på
`scale: none` under trykk (målt). Hover-fargene står nå i `@media (hover: hover)`.

**FAQ-en (funn 3 og 4).** Luften animeres sammen med høyden, mot målte verdier (ikke `height: auto`).
Lukking målt per bilde etter rettelsen: 118 → 82 → 55 → 38 → 25 → 17 → 11 → 7 → 5 → 3 → 2 → 1. Et nytt
trykk midt i snur fra høyden den har. Åpning 550 ms, lukking 300 ms, samme kurve (`expo.out`). Ingen
bilder over 34 ms ved åpning og lukking, heller ikke på mobil 4x.

**Overskrifter (funn 8).** 0,9 s per linje og 70 ms mellom linjene (bokstaver 0,7 s). Tre linjer er på
plass etter ca. 1,0 s.

## Motoren: sømmer og hold (punkt 3 i oppdraget)

Modellen står i `docs/design/bevegelse.md`, «Sømmer og hold», med de ti tagningene i v6 skrevet ut som
segmentliste, klar til å limes inn når klippene kommer.

- **`som`** på et segment er sømmen ut av det: `"kutt"` (standard), `"toning"` (0,05 skjermhøyder)
  eller en bredde i skjermhøyder. Det nye laget ligger over det gamle og tones inn lineært med
  rullingen, begge veier. Det gamle står under med full opasitet, så bildet ikke blir mørkere i midten.
  Bare `opacity`.
- **`hold: { ved, lengde }`** lar klippet stå på rammen ved `ved` mens rullingen går `lengde`
  skjermhøyder. Samme fart før og etter holdet.
- **Gråtonen** følger tiden og går derfor over en søm uten noe ekstra. I en toning toner den med CSS; i
  et kutt byttes den straks, som før.
- **Rene funksjoner** i `src/scripts/wow/som.ts`: `somBredde`, `toning`, `somVed`, `erKutt`,
  `holdAndel`, `holdKart`. 17 tester i `test/som.test.ts` (kjøres av `npm run verify`), blant annet at
  toningen er monoton, at holdet aldri går baklengs eller hopper, og at `film` i historie.ts bare har
  gyldige verdier.
- **I nettleseren, med dagens klipp** (`tests/wow/som.spec.ts`, 6 tester, desktop og mobil): testene
  setter `som` og `hold` inn i `data-scroll-world` før skriptet leser det, slik `ScrollWorld.astro`
  skriver dem. Midt i sømmen står begge lagene med det nye på halv opasitet; toningen er 0 før og 1
  etter, lik begge veier; uten `som` er det aldri to lag med delvis opasitet; et segment merket som
  kutt tones ikke selv om naboene gjør det; klippet står på samme ramme gjennom holdet og når slutten.
- **Sett med egne øyne:** `som-desktop-kutt-1.jpg` og `som-desktop-toning-1.jpg`. Sømmene der bildene
  er like (hero → dive-4, dive-0 → conn-0, dive-1 → conn-1) er like med og uten toning. Sømmen fra
  kontoret til gata (dive-4 baklengs → dive-0) er to ulike bilder og blir en dobbelteksponering med
  toning. Det er grunnen til at **dagens film beholder harde kutt overalt**: toning er for sømmer mellom
  to stille og nesten like bilder, som manuset sier.

Motoren søker ikke etter sømmer i det hele tatt når filmen ikke har toning, så dagens film går
gjennom samme kode som før per bilde.

## Før og etter

**Rullefilmen** (`maal-side.mjs`, hele filmen fem ganger pluss vugging). «Tid bak» er andelen av tiden
bildet er minst én rame fra ønsket rame. wow-r7-flyt målte 4,4–5,0 %.

| Profil | Før, hver kjøring | Etter, hver kjøring | Median før → etter | Frys > 50 ms | Tapte bildebytter | rAF > 20 ms | Lange oppgaver |
|---|---|---|---|---|---|---|---|
| chrome-desktop | 4,3 · 4,5 · 4,6 · 4,7 · 4,7 · 4,7 · 4,9 | 4,5 · 4,7 · 4,7 | 4,7 → 4,7 | 0 → 0 | 0,1–0,6 % → 0,4–0,6 % | 0 → 0 | 0 → 0 |
| chrome-mobil-4x | 4,6 · 4,6 · 4,7 · 4,7 · 4,7 · 4,9 · 5,0 | 4,7 · 4,8 · 4,9 | 4,7 → 4,8 | 0 → 0 | 0–0,2 % → 0–0,1 % | 0 → 0 | 0 → 0 |
| webkit-desktop (én kjøring) | 5,2 | 5,6 | | 0 → 0 | 0,3 → 0,5 % | 2 → 1 | 0 → 0 |
| webkit-mobil (én kjøring) | 5,2 | 5,2 | | 0 → 0 | 0,2 → 0,1 % | 2 → 1 | 0 → 0 |

Lest: etter-tallene er sluttbygget, tre kjøringer per profil. Før-tallene er sju kjøringer av bygget fra
før endringene (én mot `server.mjs`, seks mot den statiske måletjeneren, annenhver gang med
etter-bygget). Spredningen mellom kjøringer av samme bygg er 0,4–0,6 prosentpoeng, altså større enn
forskjellen mellom byggene. Dataene filmen leser (`data-scroll-world`) er byte for byte like før og etter.

**Forbehold.** Et mellombygg, før motoren hoppet over sømsøket når filmen ikke har toning, målte
desktop 4,7–5,0 (median 4,8) og mobil 4,5–5,3 (median 5,0) på fem kjøringer. To av mobilkjøringene sto
på 5,3, over båndet fra r7. Derfor la jeg inn hoppet. Jeg kan ikke skille den endringen fra støy: det
jeg kan si, er at sluttbygget ligger i samme område som før, ikke at mellombygget var dårligere.
WebKit er målt én gang hver, på mellombygget og ikke på sluttbygget.

**Resten av siden** (`revisjon.mjs`, 27 sider, to profiler, før og etter):

| Måling | Før | Etter |
|---|---|---|
| Bilder over 20 ms under rulling, alle sider | 1 (33 ms, `/verktoy/dmarc` mobil) | 0 |
| Lange oppgaver under rulling | 0 | 0 |
| Layoutskift under rulling (høyeste) | 0,0001 (forsiden) | 0,0001 (forsiden) |
| Vannrett rulling | 0 px på alle | 0 px på alle |
| CSS-animasjon eller -overgang på layoutegenskap | 0 under rulling (`margin` på pila ved klikk) | 0 |
| Skjult tekst ved redusert bevegelse / uten JS | 0 / 0 | 0 / 0 |

**JavaScript ved første visning, gzip** (statisk importert fra HTML-en):

| Side | Før | Etter |
|---|---|---|
| Forsiden | 63,7 kB | 64,2 kB |
| Film-underside (`/priser`) | 63,6 kB | 64,1 kB |
| Rolig side (`/artikler`) | 1,8 kB | 1,8 kB |

Det nye er `som.ts` i hovedbunten (+0,3 kB). Målet på 70 kB holder.

## Selvkontroll

1. **Tester:** `npm run test` {{TEST_NODE}}. `tests/wow/` mot bygget på 4780: {{TEST_WOW}}.
   De åtte testene i `tests/wow/kapittel.spec.ts` som feiler mot `server.mjs`, er skrevet for
   `astro dev` (de ser etter `rolig.ts` i skriptadressen og henter bilder med `fetch`, som CSP-en i
   drift stopper). Mot dev-tjeneren på 4800, med samme kildekode, er alle ti grønne.
   **`tests/bevegelse/` kunne ikke kjøres:** Playwrights egen Chromium er ikke installert på maskinen
   («Executable doesn't exist … chromium_headless_shell-1243»), og de testene bruker ikke installert
   Chrome. Jeg har ikke installert nettlesere. Komponentene de dekker (`src/components/bevegelse/`) er
   ikke rørt.
2. **Filmstriper:** `scripts/filmstripe.mjs` med `KANAL=chrome`, 30 bilder for desktop og 30 med
   `VISNING=mobil`, i `.design/arbeid/bevegelse/r9/stripe-desktop/` og `stripe-mobil/`, samlet i
   `stripe-desktop-ark-1.jpg`, `stripe-desktop-ark-2.jpg` og `stripe-mobil-ark.jpg`. Sett på i rekkefølge.
   Teksten er lesbar over bildet i hver rute, og bevegelsen forklarer noe i hver scene (lampa, målingene
   som låser seg, panelet som blir rapporten, datoene som ruller fram). Én ting som ikke er bevegelse:
   på desktop åpner garantien og datohjulet med en nesten tom skjerm (bare strektegningen, bare «I dag»).
   Det er komposisjon og hører til `kritiker`.
3. **Sett på:** teksten på platen er lesbar over bildet i alle rutene over sømmene (kontaktarkene), også
   midt i en toning.
4. **`review-animations`** finnes ikke som skill her. Revisjonen er gjort etter `emil-improve-animations`
   (katalogen i `AUDIT.md`), `emil-animation-performance`, `emil-choreograph`, `emil-animate`,
   `motion-typography`, `gsap-scrolltrigger` og `gsap-performance`.
5. **JavaScript:** se tabellen over.

**iOS er ikke testet.** Motoren er endret, så det er et åpent punkt igjen: krysstoning mellom to lerret
med `opacity` under minnepress på en ekte iPhone er ikke sett.

## Avvik jeg vil si fra om

- **Filer utenfor mine.** Rollen min eier `src/components/bevegelse/`, `tests/bevegelse/` og
  `docs/design/bevegelse.md`. Oppdraget ba om revisjon og retting av hover, trykk og motoren, så jeg har
  endret `src/styles/wow.css` (knapper, pila i menyen, én hover-regel), `src/data/historie.ts` (bare
  typene og kommentaren, ingen tekst og ingen verdier i `film`), `src/components/wow/ScrollWorld.astro`
  og lagt en test i `test/`. Si fra hvis noe av det skulle gått via `bygger`.
- **`build`.** Reglene mine sier at jeg ikke kjører `build`. Oppdraget ba om `npm run verify`, som
  bygger, og om målinger mot et bygg på 4780. Jeg har bygget. Ingen annen prosess serverte `dist/` da
  (dev-tjeneren på 4800 leser kildekoden). Tjeneren på 4780 er stoppet.
- **`emil-improve-animations` sier «aldri endre kildekode», bare skriv planer.** Oppdraget ba om retting,
  så jeg har brukt skillen til revisjonen og rettet selv.

## Resultat

Hele bevegelsesflaten er revidert med målinger og kodelesing. Ingen P0. Fem P1 og fem P2 er rettet, sju
P3 står med begrunnelse. Motoren har sømmer og hold, datadrevet og testet med dagens klipp.
Rullefilmen er ikke målbart dårligere.

## Filer endret

Nye:

- `src/scripts/wow/som.ts`
- `test/som.test.ts`
- `tests/wow/som.spec.ts`
- `tests/wow/sideovergang.spec.ts`
- `docs/design/rapporter/wow-r9-bevegelse.md`
- `.design/arbeid/bevegelse/r9/` (måleskript, logger, kontaktark)

Endret:

- `src/scripts/wow/scroll-world.ts` (sømmer og hold)
- `src/scripts/wow/accordion.ts` (luften, avbrudd, kurve)
- `src/scripts/wow/split.ts` (varighet)
- `src/scripts/wow/reveal.ts` (`opacity` i stedet for `autoAlpha`)
- `src/components/wow/ScrollWorld.astro` (`som` og `hold` inn i dataene)
- `src/data/historie.ts` (typene `som` og `hold`, kommentaren)
- `src/styles/wow-bevegelse.css` (sideoverganger)
- `src/styles/wow.css` (knapper, pila, én hover-regel)
- `docs/design/bevegelse.md` («Sømmer og hold», «Sideoverganger», «Trykk og hover på knapper»)

## Kilder

- `docs/design/regi/film-manus-v3.md` del 2, 6, 9 og 10 (v6), lest 24. nov. 2026.
- `docs/design/rapporter/wow-r7-flyt.md` og `wow-r8-samling.md`, lest 24. nov. 2026.
- `docs/design/redesign-brief.md` del 8, `docs/design/wow-brief.md` («Global bevegelse», blokk 9),
  `docs/design/wow-undersider.md` del 1.2.
- Skillene `emil-improve-animations` (`AUDIT.md`), `emil-animation-performance`, `emil-choreograph`,
  `emil-animate`, `motion-typography`, `gsap-scrolltrigger`, `gsap-performance`, lastet 24. nov. 2026.
- Ingen nettkilder er hentet.

## Åpne spørsmål og antakelser

1. **T6 og holdet.** Holdet tas av segmentets lengde. Med 1,2 skjermhøyder og 0,3 hold går resten av
   tagningen 33 % fortere enn manuset regner med. Eksempelet i bevegelse.md bruker 1,5, og filmen blir
   da 0,3 skjermhøyder lengre enn 8,1. Hvilken vil regi ha?
2. **Antakelse: `ved` for frysen i T6 er 0,19** (midt i 2,0–3,8 s av 15 s). Må leses av det ferdige
   klippet, ramme for ramme, før det settes.
3. **Antakelse: hvert nytt klipp får en `poster`** (`<navn>-start`, som kodeskriptet lager). Uten den
   blir en toning inn i et klipp som ikke har tegnet ennå, et kutt.
4. **Del 8 mot wow-uttrykket.** Del 8 sier «bare transform, opacity og clip-path» og «maks én scene som
   holder skjermen fast per side». FAQ-en animerer høyde (wow-briefen blokk 9 ber om det), og forsiden
   har tre festede scener (filmen, garantien, datohjulet). Jeg har lest det som opphevet av eier
   18. nov. og ikke rørt det. Bør del 8 oppdateres, så reglene og siden sier det samme?
5. **Sideovergangen er 280 ms, planen sa 200.** Skal den være 200, trengs et token til.
6. **Følelsen kan ikke måles.** Tre ting bør ses i sakte film (Chrome DevTools, Animations, 10 %) før
   port: at FAQ-en ikke virker brå i første bilde (`expo.out` tar nesten halve høyden på 50 ms), at
   krympingen på 0,97 leses som et trykk og ikke som et rykk på «Book 20 min» i toppfeltet, og at
   krysstoningen mellom sider ikke blinker i toppfeltet når menyen har ulik markering på de to sidene.
7. **Åtte tester i `kapittel.spec.ts` kan bare kjøres mot `astro dev`.** De bør enten merkes slik eller
   skrives så de også går mot bygget.

## Neste steg

- **`produsent`:** levere klippene fra v6 kodet med `scripts/kod-rullefilm.sh`, med `-start`-bildene.
- **`bevegelse`** (når klippene finnes): lime inn segmentlisten fra bevegelse.md i `film`, sette
  linjenes `ved` etter taktene i manuset, lese av `hold.ved` for T6, ta kontaktark over alle ni sømmer
  og måle rullefilmen på nytt.
- **`dirigent`:** avgjøre spørsmål 1, 4 og 5. Kjøre `tests/bevegelse/` der Playwrights Chromium finnes,
  eller be meg legge `channel: "chrome"` i oppsettet.
- **Eier:** se sideovergangen, knappetrykket og FAQ-en på en ekte telefon. Se filmen på en ekte iPhone.
