# Bevegelseskomponenter

Kontrakten `bygger` bruker. Én oppføring per komponent. Kildekoden ligger i
`src/components/bevegelse/`, testene i `tests/bevegelse/`
(`npx playwright test --config tests/bevegelse/playwright.config.ts`).

Komponentene bruker bevegelsestokens fra `src/styles/tokens-v2.css` (`--ut`,
`--tid-inn`, `--tid-inn-trinn`, `--tid-svar-lang`, rolletokens for scenefarger)
med innebygde reserveverdier, så de virker også på sider som ennå ikke laster
tokens-v2. Last tokens-v2 der det går.

## Scene

`src/components/bevegelse/Scene.astro`

Avrundet, mørk flate med video som følger rullingen. Scenen holder skjermen fast
(sticky) mens brukeren ruller gjennom stegene: flaten åpner seg fra avrundet kort
til full bredde i løpet av de første 12 % av rullingen, og videoen spoles i takt
med hvor langt brukeren har rullet. Baklengs rulling spoler tilbake. Rullingen
låses aldri – brukeren kan alltid rulle videre, hoppe over med lenken og bruke
tastaturet. Maks én Scene per side.

### Egenskaper

| Egenskap | Type | Påkrevd | Betydning |
|---|---|---|---|
| `navn` | `string` | ja | Mappenavn under `public/scener/`. Styrer hvilke filer som lastes. |
| `etikett` | `string` | ja | `aria-label` på seksjonen. Beskriv hva scenen viser. |
| `steg` | `{ tittel: string; tekst: string }[]` | ja | Tekststegene. Hvert steg får én skjermhøyde. Antallet styrer scenens rullelengde (`steg.length` × 100svh). |
| `hoppTil` | `string` | ja | `id` (uten `#`) på elementet rett etter scenen. Hopp-lenken peker hit. `bygger` må sette denne id-en på neste blokk. |
| `prioritet` | `boolean` | nei (`false`) | `true` bare når scenen er øverst på siden: posterbildet får `loading="eager"` og `fetchpriority="high"`. |
| `bakgrunn` | `string` | nei (`'#080809'`) | Bakgrunnsfarge bak videoen (`--scene-bakgrunn`). Skal være identisk med klippenes bakgrunn, slik at flate og video er sømløse. De ekte klippene har `#080809`. |

### Filer som må finnes i `public/scener/<navn>/`

```
<navn>-1080.mp4   <navn>-1080.webm    16:9, desktop (min. 1080p)
<navn>-mobil.mp4  <navn>-mobil.webm   9:16, mobil (min. 1080 px kort side)
poster.avif                            16:9, første ramme i videoen
poster-mobil.avif                      9:16, første ramme i videoen
```

Videoene må ha tett nøkkelrammeavstand (hver 8. ramme) for jevn spoling, og
serveren må svare `206 Partial Content` på Range-forespørsler (`server.mjs` i
rota må kontrolleres; testserveren i `tests/bevegelse/server.mjs` gjør det).
Testfiler finnes i `tests/bevegelse/fixtures/scener/test/` (flyttet ut av `public/` 24. nov. 2026, serveres av `tests/bevegelse/server.mjs` på `/scener/test/`) til klippene fra `produsent` er klare.

### Eksempel

```astro
---
import Scene from '../components/bevegelse/Scene.astro';
---
<Scene
  navn="hero"
  etikett="Slik befarer vi en nettside"
  hoppTil="rapport"
  prioritet
  steg={[
    { tittel: 'Fem verktøy. Null samtaler.', tekst: 'Nettside, booking, betaling og regnskap lever hvert sitt liv.' },
    { tittel: 'Vi tar siden fra hverandre', tekst: 'Lag for lag: design, kode, sikkerhet og integrasjoner.' },
    { tittel: 'Hvert lag får en jobb', tekst: 'Universell utforming, kryptert trafikk, Vipps inn, Fiken ut.' },
    { tittel: 'Ett system som henger sammen', tekst: 'Når lagene passer, slutter du å være limet.' },
  ]}
/>
<section id="rapport">…neste blokk…</section>
```

### Uten JavaScript

Scenen blir vanlig innhold: posterbildet vises i en avrundet 16:9-flate (3:4 på
mobil), og alle stegene leses som en vanlig nummerert liste under. Ingen video
lastes, ingenting holdes fast, ingenting krever interaksjon.

### Med redusert bevegelse eller Save-Data

Skriptet trekker seg før det gjør noe: ingen video lastes (ingen nettverkskall),
scenen får aldri `data-aktiv`, og siden ser ut og oppfører seg som uten
JavaScript. Stillbilde og vanlig rulling.

### Tilgjengelighet

- Første Tab i scenen treffer «Hopp over animasjonen», som hopper til `#<hoppTil>`.
  Lenken er visuelt skjult til den får fokus.
- Videoflaten er `aria-hidden` – alt innhold ligger i tekststegene.
- Video er alltid uten lyd og lastes først når **begge** vilkår er oppfylt:
  scenen er innenfor 150 % av vinduet (IntersectionObserver) **og** brukeren har
  vist rulleintensjon (første scroll, wheel, touchstart eller keydown). En scene
  øverst på siden henter derfor ingen video i første innlasting – posterbildet
  bærer førsteinntrykket, og sidevektsbudsjettet på 700 kB holdes.
- Scenen aktiveres av et lite inline-skript som kjører før første opptegning,
  slik at sticky-oppsettet ikke flytter innhold (ingen ny CLS). Ikke flytt
  inline-skriptet bort fra komponenten.

### Å vite

- Mobil (under 768 px) får 9:16-fila; desktop får 16:9-fila. Nettleseren velger
  selv mp4 eller webm ut fra `canPlayType`.
- iOS krever én berøring før siden får spole i videoen; komponenten håndterer
  det, men det er ikke testet på ekte iPhone ennå.
- Fargene i komponenten (`#fbfbf9`, `#111315`, `#080809`, `#e9ecef`) er
  referanseverdier og byttes til tokens når designsystem v2 finnes.
  `#080809` er målt bakgrunn i de ekte klippene (revisors måling).
- Tekst over video skal holde 4,5:1 – kontroller mot de ekte klippene når de
  kommer; mørke klipp er en forutsetning.

## Loft (øyeblikk 2)

`src/components/bevegelse/Loft.astro`

Overskrift som løftes inn linje for linje, én gang, når den kommer i syne.
CSS-maske (overflow-klipp per linje) og `transform` – ingen bibliotek, ingen
GSAP. Én linje bruker `--tid-inn` (560 ms) med kurven `--ut`; linjene under
forsinkes `--tid-inn-trinn` (70 ms) per linje. Etter animasjonen settes
overskriften tilbake til ren tekst, så markering, søk og linjebryting er som
normalt. Brukes bare på h1 og h2 (fast inntoning gjelder bare overskrifter –
brødtekst, kort og bilder står stille).

### Egenskaper

| Egenskap | Type | Påkrevd | Betydning |
|---|---|---|---|
| `tekst` | `string` | ja | Overskriftsteksten. Linjedelingen følger nettleserens egen bryting. |
| `niva` | `1 \| 2` | nei (`2`) | Overskriftsnivå: `1` gir `<h1>`, `2` gir `<h2>`. |
| `klasse` | `string` | nei | Ekstra klassenavn, f.eks. typografiklasse fra designsystemet. |
| `id` | `string` | nei | `id` på overskriften, f.eks. som ankermål. |

### Eksempel

```astro
---
import Loft from '../components/bevegelse/Loft.astro';
---
<Loft niva={1} tekst="Gratis befaring av nettsiden din" />
<Loft tekst="Vi tar siden fra hverandre lag for lag" id="rapport-tittel" />
```

### Uten JavaScript

Overskriften er vanlig servert tekst og står stille, fullt synlig. Oppdelingen
i linjer skjer først i nettleseren, så ingenting er skjult uten JavaScript.

### Med redusert bevegelse eller Save-Data

Skriptet trekker seg før det gjør noe: teksten deles aldri opp og står stille,
fullt synlig. I tillegg nuller CSS-en overgangen under
`prefers-reduced-motion`, som dobbel sikring.

### Å vite

- Mens animasjonen kjører har overskriften `aria-label` med hele teksten, så
  skjermlesere ikke leser ord for ord. Etter animasjonen fjernes den.
- Linjeklassene (`.loft__linje`, `.loft__skyv`) lages i JavaScript og er derfor
  globale (`<style is:global>`), prefikset med `loft__`.
- Overskriften animeres når 20 % av den er i syne, og aldri mer enn én gang
  (heller ikke ved baklengs rulling).

## CaseVideo (øyeblikk 3)

`src/components/bevegelse/CaseVideo.astro`

Case-kortets video: ekte skjermopptak som spiller når pekeren er over casen
eller fokus er i den (desktop), eller når kortet er i syne (mobil, uten
pekerstøtte). `<video muted playsinline loop preload="none">` med posterbilde –
videoen har ingen `src` og laster ingenting før avspilling trengs. Mangler
opptaket eller posteren på disk ved bygging, vises en mørk plassholderflate med
teksten «MANGLER: skjermopptak» i stedet (ingen video, ingen 404).

### Egenskaper

| Egenskap | Type | Påkrevd | Betydning |
|---|---|---|---|
| `opptak` | `string` | ja | Sti under `public/` uten endelse, f.eks. `/opptak/booking`. Forventer `.mp4` og/eller `.webm`. Nettleseren velger selv format. |
| `poster` | `string` | ja | Sti til posterbilde under `public/`, f.eks. `/opptak/booking-poster.avif`. |
| `bredde` | `number` | nei (`1920`) | Bredde i kilden. Gir `aspect-ratio` og hindrer CLS. |
| `hoyde` | `number` | nei (`1080`) | Høyde i kilden. |

### Eksempel

```astro
---
import CaseVideo from '../components/bevegelse/CaseVideo.astro';
---
<a href="/caser/booking" data-case>
  <CaseVideo opptak="/opptak/booking" poster="/opptak/booking-poster.avif" />
  <h3>Booking for frisører</h3>
</a>
```

`bygger` må legge komponenten inni casens lenke (eller et element med
`data-case`): avspillingen styres av pekeren over og fokus i nærmeste slike
forelder. Finnes ingen, lyttes det på selve komponenten.

### Uten JavaScript

Posterbildet står (via `poster`-attributtet), ingen video lastes, casen er en
vanlig lenke.

### Med redusert bevegelse eller Save-Data

Skriptet trekker seg helt: ingen video lastes uansett peker eller rulling,
posteren står. Laster opptaket ikke (nettverksfeil), står også posteren.

### Å vite

- Videoen er `aria-hidden` og utenfor tab-rekkefølgen – casens tittel og lenke
  bærer innholdet.
- Desktop/mobil avgjøres med `(hover: hover) and (pointer: fine)`, ikke
  skjermbredde. På mobil spiller opptaket fra 40 % synlighet og stopper utenfor.
- Opptaket spiller i løkke uten lyd. Filene må være minst 1080p (del 12).

## Reel (øyeblikk 6)

`src/components/bevegelse/Reel.astro`

«Spill av» åpner filmen i et `<dialog>`-element med `<video controls>`.
Videoen får `src` og lastes først ved klikk – før det hentes ingenting.
Dialogen åpnes med `opacity` og `transform: scale(0.98)` → 1 på
`--tid-svar-lang` (240 ms) med kurven `--ut`. Lukkeknappen får fokus når
dialogen åpnes; Esc, lukkeknappen og klikk utenfor lukker; videoen pauses og
fokus går tilbake til «Spill av». Mangler filmen på disk ved bygging, vises en
plassholderflate med «MANGLER: skjermopptak» i stedet for knappen.

### Egenskaper

| Egenskap | Type | Påkrevd | Betydning |
|---|---|---|---|
| `film` | `string` | ja | Sti under `public/` uten endelse, f.eks. `/film/reel`. Forventer `.mp4` og/eller `.webm`. |
| `tittel` | `string` | ja | Tilgjengelig navn på dialogen (`aria-label`), f.eks. «Film: slik jobber vi». |
| `poster` | `string` | nei | Posterbilde som vises i dialogen før avspilling. |
| `knapp` | `string` | nei («Spill av») | Knappeteksten. |

### Eksempel

```astro
---
import Reel from '../components/bevegelse/Reel.astro';
---
<Reel film="/film/reel" poster="/film/reel-poster.avif" tittel="Film: slik jobber vi" />
```

### Uten JavaScript

«Spill av» er en vanlig lenke rett til videofila – nettleseren spiller den
selv. Med JavaScript får lenken `role="button"` og åpner dialogen i stedet.

### Med redusert bevegelse eller Save-Data

Åpningsanimasjonen er nullet (`--tid-svar-lang: 0ms` fra tokens, pluss
`animation: none` under `prefers-reduced-motion` i komponenten). Selve dialogen
og filmen virker som før: avspilling er et aktivt valg fra brukeren og starter
aldri av seg selv. Lyd styres av brukeren via `controls`.

### Å vite

- `bygger` trenger ingen egen lukkelogikk – Esc og fokusflyt håndteres av
  `<dialog>` og komponenten.
- Knappeteksten skal fortelle hva som spilles av hvis det er flere reels på
  samme side.

## Prisvelger (øyeblikk 5)

`src/components/bevegelse/Prisvelger.astro`

Prislista ER velgeren (designsystem 7.8): hver rad er en radioknapp, og valget
spoler scenens video mykt til pakkens stoppunkt – objektet bygger seg opp eller
ned, og prisen følger valget. Bare `currentTime`-søk med inn-ut-kurve over
`--tid-inn`; aldri avspilling, aldri lyd. Videoen hentes først når velgeren er
nær skjermen og brukeren har vist intensjon (rulling, berøring, tastatur eller
et valg) – samme strategi som Scene. Egen komponent, ikke en utvidelse av
Scene: Scene er rullestyrt og holder skjermen fast, prisvelgeren er valgstyrt
og fester ingenting.

### Egenskaper

| Egenskap | Type | Påkrevd | Betydning |
|---|---|---|---|
| `navn` | `string` | ja | Mappenavn under `public/scener/` – samme filer som Scene (`<navn>-1080.mp4/webm`, `<navn>-mobil.mp4/webm`, `poster.avif`, `poster-mobil.avif`). Hero-videoen er A→B (kaos → ordnet, 6 s). |
| `etikett` | `string` | ja | Tekst i `<legend>`, f.eks. «Velg pakke». |
| `pakker` | `Pakke[]` | ja | Radene, i rekkefølge. Første pakke er valgt ved innlasting. `Pakke`: `{ id, navn, pris, tekst, stopp, merke? }` der `stopp` er stoppunktet i sekunder (f.eks. 0 / 3 / 6) og `pris` er ferdig formatert fra `src/data/priser.ts` – komponenten kjenner ingen priser selv. |
| `gruppe` | `string` | nei (`'prisvelger'`) | `name` på radiogruppen. |
| `statusMal` | `string` | nei («Valgt: {navn}. Illustrasjonen viser hva som er med.») | Leses opp (`role="status"`) ved valg; `{navn}` byttes med pakkenavnet. |
| `bakgrunn` | `string` | nei (`'#080809'`) | Bakgrunn bak videoen, lik klippenes kant. |

### Eksempel

```astro
---
import Prisvelger from '../components/bevegelse/Prisvelger.astro';
import { pakker } from '../data/priser';
// pakker[n] har navn, pris (ferdig formatert), prefiks? («fra»), beskrivelse og anbefalt?.
const stopp = [0, 3, 6]; // kaos → midt → ordnet i hero-videoen (6 s)
---
<Prisvelger
  navn="hero"
  etikett="Velg pakke"
  pakker={pakker.map((p, i) => ({
    id: p.navn.toLowerCase(),
    navn: p.navn,
    pris: p.prefiks ? `${p.prefiks} ${p.pris}` : p.pris,
    tekst: p.beskrivelse,
    stopp: stopp[i],
    merke: p.anbefalt ? 'Anbefalt' : undefined,
  }))}
/>
```

Kolofonen «Illustrasjon laget med KI» legger `bygger` rett under komponenten.

### Uten JavaScript

En vanlig prisliste med Start valgt og posterbildet som stillbilde. Ingen video
hentes. Radioknappene er vanlige HTML-kontroller.

### Med redusert bevegelse eller Save-Data

Skriptet trekker seg helt: valg virker (radene skifter tilstand), men ingen
video hentes og ingenting spoler – posterbildet er stillrammen hele tiden.

### Å vite

- Tilstandene fra designsystem 7.8 er bygget inn: valgt rad fylles med
  `--refleksflate` med ring og prikk i `--blekk` i begge temaer, pekt-på gir
  venstrekant, fokusring rundt raden. Prisene står høyrejustert med `tnum`;
  under 480 px legger prisen seg under navnet (ingen vannrett rulling).
- Spolekurven i JavaScript er easeInOutCubic, en tilnærming av `--inn-ut`.
  Varigheten leses fra `--tid-inn` (560 ms, 0 ved redusert bevegelse).
- Lastes videoen først ved et valg, hoppes det rett til stoppunktet uten myk
  spoling (det finnes ikke noe synlig utgangspunkt å spole fra).
- Maks én komponent som bruker hero-videoen trenger ikke gjelde: Prisvelger
  holder aldri skjermen fast og teller ikke som scenen på siden.
- iOS krever én berøring før siden får spole; komponenten håndterer det, men
  det er ikke testet på ekte iPhone.

## ScrollWorld (wow, runde 4: historien C «Lampa»)

Gjelder forsiden (`redesign/wow`). Kilde: `src/components/wow/ScrollWorld.astro`,
`src/scripts/wow/scroll-world.ts`, `src/scripts/wow/rullefilm.ts` og `src/scripts/wow/spole.ts` (runde 7:
bildekilden og spolelogikken), `src/scripts/wow/overgang.ts` og `src/scripts/wow/film-filer.ts`
(bare server: filer, plassholdere, forhåndslasting), stiler i `src/styles/wow-bevegelse.css`, historien i
`film` i `src/data/historie.ts`. Manus: `docs/design/historie-manus.md` del 5 og 7. Tester:
`tests/wow/lampa.spec.ts`, `tests/wow/rullefilm.spec.ts` (bildet følger rullingen, Range, reserven),
`tests/wow/spole.spec.ts` (rene funksjoner, uten nettleser) og det som gjelder lasting, CSP og
tilgjengelighet i `tests/wow/scroll-world.spec.ts`, mot `/lab/scroll-world`. Filmstripe:
`node tests/wow/lampa-stripe.mjs <url> <utmappe> [steg]`. Teknikken er tilpasset fra
oso95/scroll-world (MIT).

Hva den gjør: en forteller viser deg en gate full av grønne lys og nekter å tro på ett eneste av dem,
til filmen innrømmer at gata står på pulten vår, og at det eneste som er målt, er siden du leser nå.

- **Segmenter. Sømmen er et hardt kutt eller en kort krysstoning** (runde 9, se «Sømmer og hold»).
  Klipp forover, klipp **baklengs** (`retning: -1`, andelen
  snus: prologen spoler dive-4 tilbake, N2 `pult-inn` trekker seg ut fra gata til pulten) og
  **stillbilder** som eget segment (`type: "still"`, zoom etter nøkkelpunkter, bare transform).
  Heroen er et stillbilde: siste ramme i dive-4 (`hero.avif`/`.webp`), som også er LCP-bildet.
- **Én plate, én linje om gangen.** Fortellerlinjene (manus C, ordrett) tar over platen ved sin
  andel av segmentet. Gammel ut 120 ms, ny inn 160 ms etter 120 ms. H2-ene (søkeordene) står i
  platen med lenke til tjenestesiden, i setningsform. En «stille» linje tømmer platen mens
  målingene låser seg.
- **Én lampe, uavhengig av gråtonen.** Hul ring = ikke målt. Fylt grønn med hake og datoen
  («Målt 18. nov. 2026») = målt. Den tennes første gang i det den fjerde målingen låser seg på
  pulten, og slukkes igjen baklengs. Den pulserer én gang (opasitet) ved linja «Derfor har vi en
  lampe». Telleren «N av 4» er fjernet.
- **Gråtonen** viser hva vi bygger: dykkene i bakeriet, kontoret og hos rørleggeren er grå til det
  grønne lyset (`gra: [0, "gronn"]`), pulten fra stillheten til første hake (`[a, "hake"]`).
  700 ms ut av det grå, 280 ms inn, straks i et kutt.
- **Panelet blir rapporten** (`overgang.ts`): uendret mekanikk, se under.
- **Heroteksten** (slot) glir opp og ut og er borte etter 12vh. Platen kommer med prologens første linje.

### Modellen (`film` i historie.ts)

`FilmKapittel { id, sted, bilde, bildeReserve?, segmenter: Segment[] }`. Kapitlene er det som blir
statiske blokker uten JS; `id` gir ankeret `#sw-<id>` (bakeriet er `kapittel-1`, som toppfeltets
«Tjenester» peker på). `Segment { kilde, type?, lengde, retning?, gronnVed?, problemAndel?, ro?, gra?,
zoom?, poster?, linjer?, maalinger?, som?, hold?, reserve? }`. Se kommentaren øverst i historie.ts.
Rullelengden er summen av `lengde` (9,0 skjermhøyder), og seksjonen er én skjermhøyde til.

### Sømmer og hold (runde 9, manus v6 del 10)

Datadrevet per segment i `film` (historie.ts). Regnes i `src/scripts/wow/som.ts` (rene funksjoner,
`test/som.test.ts`), tegnes av `scroll-world.ts`, og er testet i nettleseren med dagens klipp i
`tests/wow/som.spec.ts`. Dagens film har ingen av delene satt, og oppfører seg som før.

| Felt | Verdi | Hva |
|---|---|---|
| `som` | `"kutt"` (standard) | Sømmen UT av segmentet er et hardt kutt, som før. |
| `som` | `"toning"` | Kort krysstoning over sømmen, 0,05 skjermhøyder (`SOM_TONING`). |
| `som` | tall | Bredden i skjermhøyder. Aldri over 0,3 og aldri over 40 % av det korteste nabosegmentet. |
| `hold` | `{ ved, lengde }` | Klippet står på rammen ved andelen `ved` (0–1 av klippet, i avspillingsretningen) mens rullingen går `lengde` skjermhøyder. Lengden tas av segmentets `lengde`. Kan ikke kombineres med `gronnVed`. |

- **Krysstoningen** ligger midt over sømmen. Det nye laget ligger over det gamle og tones inn
  (opasitet 0 → 1, lineært med rullingen, begge veier). Det gamle står under med full opasitet, så
  bildet ikke blir mørkere i midten. Før sømmen står det nye på sitt første bilde, etter sømmen står
  det gamle på sitt siste. Bare `opacity` endres.
- **Det nye segmentet må ha noe å vise:** et stillbilde, et klipp som har tegnet, eller en `poster`.
  Har det ikke det, blir sømmen et kutt (forrige lag står til klippet har tegnet). Gi derfor hvert
  klipp `poster: "<navn>-start"` (kodeskriptet lager fila).
- **Gråtonen** følger tiden, ikke segmentet: `gra: [0.3, 1]` på ett segment og `gra: [0, 0.15]` på det
  neste gir ett sammenhengende grått strekk over sømmen. I en toning toner gråtonen med CSS; i et
  kutt byttes den straks.
- **Holdet** har samme fart før og etter, så kameraet ikke skifter tempo. Linjenes `ved` er fortsatt
  andel av segmentets rulling, ikke av klippet.

Slik fylles v6 inn når klippene kommer (ti tagninger, tre harde kutt; linjer, kapitler og gråtone
etter manuset; `kilde` er navnet `scripts/kod-rullefilm.sh` får):

```ts
{ kilde: "t1",    lengde: 0.4, poster: "hero",        som: "toning" },
{ kilde: "t2",    lengde: 1.2, poster: "t2-start",    som: "toning" },
{ kilde: "t3a",   lengde: 0.8, poster: "t3a-start",   som: "kutt" },   // i døra
{ kilde: "t3b",   lengde: 0.8, poster: "t3b-start",   som: "kutt" },   // opp til kontoret
{ kilde: "t4a",   lengde: 0.8, poster: "t4a-start",   som: "toning" },
{ kilde: "t4b",   lengde: 0.9, poster: "t4b-start",   som: "toning" },
{ kilde: "t5a",   lengde: 0.8, poster: "t5a-start",   som: "toning" },
{ kilde: "t5b-1", lengde: 0.6, poster: "t5b-1-start", som: "kutt" },   // bildøra til porten
{ kilde: "t5b-2", lengde: 0.6, poster: "t5b-2-start", som: "toning" },
// Frysen står 2,0–3,8 s av 15 s: midten er 0,19 av klippet. 0,3 skjermhøyder hold.
{ kilde: "t6",    lengde: 1.5, poster: "t6-start",    som: "toning", hold: { ved: 0.19, lengde: 0.3 } },
```

`t6` er her 1,5 og ikke manusets 1,2, så resten av tagningen går i manusets fart (holdet tas av
segmentets lengde). Skal filmen holde 8,1 skjermhøyder, settes den til 1,2, og bevegelsen rundt
frysen går 33 % fortere. Heroen foran (`type: "still"`) får også `som: "toning"`.

### Egenskaper

| Egenskap | Standard | Hva |
|---|---|---|
| `film` | `film` fra historie.ts | Historien. |
| `tekst` | `filmTekst` | `{ etikett, ikkeMalt, dinSide, dinSideStatus, kolofon, hopp, hoppTil, overgang }`. |
| `mappe` | `/media/wow/scroll-world` | Filene under `public/`. |
| `etikett` | `tekst.etikett` | `aria-label`. |
| `kapitler`, `kobling` | – | Fra runde 3. Godtas og ignoreres, så index.astro virker til den er ryddet. |
| slot | – | Heroen: H1 «Gratis befaring av nettsiden din», ingress, adressefelt. |

`historie.ts` eksporterer også `tjenester` (navn, H2, lenke, problem, løsning), `historie`
(bakoverkompatibel visning for Hode.astro og lab-sidene), `malinger`, `maltDato`, `maltDatoIso`,
`maltAdresse` og `delVerdi`.

### Filer

`public/media/wow/scroll-world/`: klippene `dive-0..4`, `conn-0..2` og N2 `pult-inn` (16:9 og `-m`
9:16, H.264, `-g 8`, uten lyd, `+faststart`), stillbildene `hero` (siste ramme i dive-4, avif + webp,
laget av bevegelse), N1 `pult` (produsenten), `byen` (conn-3 ved 0,45, reserven for N2) og
`poster-0..3` (første bilde i dykkene). `pult-inn` baklengs starter på `poster-0` (dive-0 ramme 0),
så produsentens klipp må slutte nøyaktig der. Mangler `pult-inn` i et bygg, brukes manusets reserve
(byen holdes, linja «Her må vi innrømme noe. Bakeriet, kontoret og rørleggeren er laget med KI.»).
Mangler `pult`, står `hero`. I `astro dev` brukes plassholdere fra
`.design/arbeid/bevegelse/scroll-world/` (pult = hero, pult-inn = en overtoning fra pulten til gata).

### Rullefilmen: slik spoles klippene (runde 7)

Målinger og begrunnelse: `docs/design/rapporter/wow-r7-flyt.md`.

- **Ingen søking.** Der nettleseren har WebCodecs (`VideoDecoder`: Chrome, Edge, Safari 16.4+,
  Firefox 130+), leser `rullefilm.ts` tabellen over ramer rett fra MP4-en, dekoder hele GOP-er FØR de
  trengs i et vindu rundt rulleposisjonen, og tegner riktig rame på et `<canvas class="sw__video">` i
  samme bilde som teksten. Baklengs koster det samme som forlengs.
- **Vinduet er en ring med fast minne.** Det aktive klippet holder 24–48 dekodede ramer (96 MB på
  desktop, 40 MB på stående skjerm, aldri under tre GOP-er), naboene 4 ramer ved inngangen, resten
  ingenting. Et klipp på 30 s bruker like mye minne som ett på 5 s.
- **Fila hentes i deler** med Range (640 kB, nærmest rulleposisjonen først). Første henting er de
  første 256 kB: tabellen og de første GOP-ene, så første bilde venter ikke på hele fila.
- **Motoren antar ingen lengde.** Antall ramer, bildefrekvens, mål og nøkkelramer leses fra fila.
- **Reserve:** `<video class="sw__video">` og `currentTime`, én søking om gangen (som før runde 7),
  når `VideoDecoder` mangler, ikke støtter fila, eller feiler tre ganger på rad. Samme fil.
- **Kontrakt for testene:** elementet har `data-kilde` og egenskapene `swAndel` (andelen av klippet
  som vises, 0–1), `swRamer` (antall ramer; 0 i reserven) og `swMotor` (`"webcodecs"` | `"video"`).
  Laget får `data-har-klipp` når første bilde er tegnet.

**Nye klipp** kodes med `scripts/kod-rullefilm.sh <inn-16x9.mp4> <navn> [<inn-9x16.mp4>]`. Det lager
`<navn>.mp4` (1920 × 1080, CRF 27) og `<navn>-m.mp4` (720 × 1280, CRF 24) i
`public/media/wow/scroll-world/`: H.264 High, uten lyd, uten B-ramer, nøkkelrame hver 8. rame, moov
først. I tillegg `<navn>-start` og `<navn>-slutt` (webp og avif, også `-m`) til poster og sømmer
(`STILL=0` hopper over dem). Skriptet stopper hvis resultatet ikke er slik motoren forutsetter.
Nettfilene fra før runde 7 ligger i `assets/higgsfield/scroll-world/forkastet-r7/`.

### Forhåndslasting (LCP)

Heroens bilde er siste ramme i dive-4. På stående skjerm er det 720 × 1280 (`hero-m.avif`, 25 kB;
før runde 7 1080 × 1920 og 70 kB), dekodes synkront (`decoding="sync"`) og har `fetchpriority="high"`.
Stillbildene til nabolagene (f.eks. `poster-0`) hentes først etter første interaksjon, så de ikke
konkurrerer med heroens bilde ved første visning. Siden forhåndslaster heroens bilde med
`filmForhandslast()`:

```astro
---
import { filmForhandslast } from "../scripts/wow/film-filer";
---
<MalWow … forhandslast={filmForhandslast(import.meta.env.DEV)}>
  <ScrollWorld> <HeroTekst /> </ScrollWorld>
  <Befaring />
```

### Uten JavaScript

Heroen står over pulten (hero-bildet), i full farge. Hvert kapittel er en statisk blokk med sitt
stillbilde og alle linjene i rekkefølge, med H2-ene som lenker, så historien kan leses som et manus.
Lampa står hul med «Ikke målt» ved hver blokk og fylt med datoen ved pulten. Målingene står i
rapporten. Ingen video.

### Med redusert bevegelse eller Save-Data

Som uten JavaScript. Ingen video, intet lerret, ingen henting av klipp (`rullefilm.ts` lastes ikke),
ingen inntoning, intet panel, ingen overgang.

### Rapporten (`Befaring.astro`) og kontrakten med filmen

`<Befaring />` står rett etter `<ScrollWorld>`. Rapportarket har `data-sw-rapport`, bakgrunnen til
panelet `data-sw-bak`, og hver del i radene `data-maal-del="<rad>:<del>"` (`status`, `navn`,
`forbehold`, `spor`, `verdi`), samme nøkler som panelet. Radene står øverst i `#rapport`, og
spørsmålet og adressefeltet kommer etter dem (bygger wow-r6). Panelet venter bare mens toppluften i
`#rapport` (`clamp(seksjon-tett, 12vh, rom-10)`) ruller inn, og legger seg inn i radene når de når det
(transform, toppen festet). Overgangen trenger minst 0,4 skjermhøyder mellom slutten av filmen og
radene. Delene har ingen CSS-overgang på transform mens `overgang.ts` eier dem (ellers hang haken
etter og sto over etiketten). Ved feltet står den hule lampa med `filmTekst.dinSideStatus`
(«Din side: ikke målt»). `overgang.ts` hentes først 2,5 skjermhøyder før slutten.

### Å vite

- Lasting: ingen klipp og ingen andre stillbilder enn heroens før første interaksjon (rulling, hjul,
  berøring, tast, trykk; ikke peker). Deretter lastes klippene etter nærhet (1,6 skjermhøyder).
- Baklengs avspilling: med WebCodecs er det samme vindu som forlengs. I reserven er det spoling
  bakover; klippene har nøkkelrame hver 8. rame, så det holder.
- Tastatur: hopp-lenken («Hopp til rapporten») kommer rett etter heroen. Hver H2-lenke i platen er ett
  Tab-stopp; fokus ruller dit linja står. Fokus i heroen mens den er ute, ruller til toppen.
- Mobil er stående skjerm, `(max-aspect-ratio: 4/5)`: panelet står øverst under toppfeltet, platen
  nederst, så linjene om lampa kan stå mens målingene er synlige.
- KI-merket står ved hvert KI-bilde hele filmen (også på pulten). Manusets «kolofonen løfter seg og
  blir linja» er ikke bygget: da ville et KI-bilde stått uten merke (åpent punkt i rapporten).
- iOS kan ikke testes her. WebCodecs-veien er målt i Playwrights WebKit (macOS), ikke på en ekte
  iPhone. Priming med `play()`/`pause()` ved første berøring gjelder bare reserven. Ikke sett på en
  ekte iPhone: dekoding og lerret under minnepress, baklengs spoling, blandingsmodus over lerretet.

## Sideoverganger (øyeblikk 4, runde 9)

Stilene står i `src/styles/wow-bevegelse.css` («Sideoverganger»), og MalWow laster den fila på alle
sider. **`bygger` trenger ikke sette inn noe i malen**: ingen `<ClientRouter />`, ingen skript.

Hva den gjør: mellom to sider i wow-uttrykket krysstones innholdet (280 ms, `--wow-tid-svar`,
`--wow-kurve-inn-ut`, bare opasitet), og toppfeltet (`.wow-hode`, `view-transition-name: wow-hode`)
står stille i stedet for å tones med. Teknikk: `@view-transition { navigation: auto; }` mellom
dokumenter.

- **Egenskaper:** ingen. Toppfeltet må ha klassen `wow-hode` (har det i `Hode.astro`). Bare ett
  element per side kan ha navnet `wow-hode`.
- **Uten JavaScript:** virker likt (ren CSS).
- **Redusert bevegelse:** av. Hele regelen står i `@media (prefers-reduced-motion: no-preference)`.
- **Uten støtte** (Firefox per nov. 2026): siden byttes som før.
- **Å vite:** gjelder klikk på lenker innenfor samme opphav, ikke adresser skrevet inn i feltet.
  Forsidens inntoning fra svart (`html.wow-inngang`) spilles bare når du kommer utenfra, så de to
  overlapper ikke.

## Trykk og hover på knapper (runde 9)

`.wow-knapp` krymper til 0,97 mens den trykkes (`scale`, 160 ms, `--wow-tid-kort`), i alle varianter.
`scale` og ikke `transform`, fordi `data-magnetic` eier `transform`. Hover-fargene gjelder bare der
pekeren kan sveve (`@media (hover: hover)`), så knappen ikke blir stående i hover-fargen etter et
trykk på berøringsskjerm. Ved redusert bevegelse skjer krympingen uten overgang.

`data-accordion` (FAQ) kan avbrytes: et nytt trykk midt i åpning eller lukking snur fra høyden den
har nå. Åpning 550 ms, lukking 300 ms, samme kurve (`expo.out`). Høyden animeres her (wow-briefen
blokk 9, «myk høydeanimasjon»); det er det eneste unntaket fra «bare transform, opacity og clip-path».

## wow-attributter, runde 2

| Attributt | Hvor | Effekt |
|---|---|---|
| `data-hode-skjul` | toppfeltet | Glir opp (`translate`, 280 ms) ved rulling nedover, tilbake ved rulling oppover, alltid synlig med fokus inni eller åpen meny. |
| `data-hover="zoom"` | bilderamme | Bildet inni skaleres til 1,04 ved hover (bare fin peker). Rammen får `overflow: clip`. |
| `data-hover="strek"` | lenke | Strek trekkes under fra venstre ved hover og tastaturfokus. |
| `data-split-scrub` | sammen med `data-split="chars"` | Bokstavene følger rullingen begge veier (ordmerket i bunnen). |
| `data-split-inngang` | H1 | Deles ikke og spilles ikke inn: synlig fra første maling (LCP). Det samme gjelder alt i kapittel 0 i ScrollWorld og tekst med lenke eller skjemafelt inni. |
| `data-count-inn="av"` | `data-count` | Ingen opptelling ved inngang; ruller bare ved bytte (500 ms). Bruk på prisene. |
| `data-befaring-venter` | `data-pin="befaring"` | Radene står synlige i «venter» fra start; bare fyll, linje og verdi spilles. |
| `data-befaring-verdi` | i et steg | Verdien låser seg på plass når raden fylles. |
| `data-befaring-landet` | settes av skriptet | Står på fastpris-steget (`data-befaring-lander`) når det har landet. Stil for «lyst» felt. |

Befaringen med festing (`data-pin="befaring"`) brukes bare i lab-sidene nå; `befaring.ts` hentes bare når siden har den. Steg skjules aldri med `visibility`, så lenker i dem kan nås med Tab.
Tallene i `data-count` er klippet til linjen per siffer, så ingen sifre står utenfor
linjen midt i rullingen.

## Kapittel (wow, bølge A2: toppbildet på undersidene)

`src/components/wow/Kapittel.astro`, skriptet `src/scripts/wow/kapittel.ts` (hentes av
`index.ts` bare når siden har `[data-kapittel]`), klippene og tallene i
`src/scripts/wow/kapittel-klipp.ts`, filene i `public/media/wow/scroll-world/kapitler/`
(lages av `.design/arbeid/bevegelse/a2/lag-kapitler.sh`). Plan: `wow-undersider.md` del 2.
Tester: `tests/wow/kapittel.spec.ts` mot `/lab/kapittel/<side>`. Filmstripe:
`node tests/wow/kapittel-stripe.mjs <url> <utmappe>`.

Hva den gjør: et utdrag av dykket fra filmen på forsiden står øverst på siden, under H1.
Bildet er grått og lampa grå mens problemet står. Når kameraet når det grønne lyset, blir
lampa grønn, det grå går bort på 700 ms, og platen bytter til løsningen. Bildeflaten står
fast mens du ruller gjennom kapittelet, så slipper den. Rullingen låses aldri.

Komponenten har ingen tekst selv. Tittel, ingress, problem og løsning kommer fra siden, så
undersidene ikke er bundet til fortellingen i `historie.ts` (eier skriver den om).

| Rulling i kapittelet | Skjer |
|---|---|
| 0 | Startbildet, grått fra første maling. H1, ingress og handlinger synlige (H1 er LCP, spilles ikke inn). |
| 0–12 % | Heroteksten glir opp og klippes bort nedenfra (som ScrollWorld, kritiker r4 #9). Sløret fra venstre følger den ut. |
| 12 %–grønt | Platen nede til venstre: grå lampe og problemet. Klippet spoles fra start mot det grønne lyset og bremser inn. |
| grønt (45 % skrubb, 30 % still) | Lampa blir grønn (ring slipper ut), det grå går bort (700 ms), platen bytter: gammel ut 120 ms, ny inn 160 ms etter 120 ms. |
| grønt–100 % | Løsningen står (55 % av rullingen i skrubb). Klippet går sakte videre til slutten av utdraget. |
| etter | Seksjonen slipper. Platen og KI-merket ruller ut med bildet. |

Baklengs går alt tilbake, i samme ramme. Lampa og klippet tegnes fra samme klokke.

### Egenskaper

| Egenskap | Type | Påkrevd | Betydning |
|---|---|---|---|
| `nummer` | `1 \| 2 \| 3 \| 4` | ja | Klippet: 1 bakeriet, 2 kontoret, 3 rørleggeren, 4 verkstedet. |
| `modus` | `"skrubb" \| "still"` | nei (`"skrubb"`) | `still`: ingen video, det grønne bildet står grått og får farge ved 30 %. Bransjesidene. |
| `tittel` | `string` | ja | H1. |
| `ingress` | `string` | ja | Maks to linjer. |
| `problem` | `string` | ja | Linja med grå lampe. |
| `losning` | `string` | ja | Linja med grønn lampe. |
| `handlinger` | `{ tekst, href, type? }[]` | nei | Maks 2. `type`: `"primar"` (standard for den første), `"strek"`, `"lenke"` (standard for den andre). |
| `kolofon` | `string` | nei («Illustrasjon laget med KI») | KI-merket nede til høyre i bildet. |
| `prioritet` | `boolean` | nei (`true`) | Første bilde med `loading="eager"` og `fetchpriority="high"`. |
| `id` | `string` | nei (`"kapittel-tittel"`) | id på H1; seksjonen er `aria-labelledby` den. |
| `mappe` | `string` | nei | Overstyrer `kapittelMappe`. |

Hjelpere i `kapittel-klipp.ts`: `kapittelFor(sti)` gir `{ nummer, modus }` for sidene planen
gir klipp (/nettsider 1, /systemer 2, /apper-og-ai 3, /om 4, /bransjer/handverkere 3 still,
/bransjer/klinikker 2 still), ellers `null`. `kapittelForhandslast(nummer, modus)` gir
`forhandslast` til MalWow (avif, med `media` for stående/liggende og redusert bevegelse).

Skriptet leser bare disse attributtene: `data-kapittel`, `data-kapittel-modus`,
`data-kapittel-gronn` (0–1 i utdraget), `data-kapittel-rull`, `data-kapittel-klipp(-mobil)`,
og setter `data-kapittel-film` (inline, før første maling), `data-kapittel-klar`,
`data-kapittel-fase` (`problem` | `losning`), og på barna `data-synlig`, `data-gronn`,
`data-har-klipp`, `data-vis-gronn`.

### Eksempel

```astro
---
import MalWow from "../layouts/MalWow.astro";
import Kapittel from "../components/wow/Kapittel.astro";
import { kapittelFor, kapittelForhandslast } from "../scripts/wow/kapittel-klipp";
const kap = kapittelFor(Astro.url.pathname)!; // { nummer: 1, modus: "skrubb" }
---
<MalWow tittel="…" beskrivelse="…" bevegelse="film" forhandslast={kapittelForhandslast(kap.nummer, kap.modus)}>
  <Kapittel
    nummer={kap.nummer}
    modus={kap.modus}
    tittel="En nettside som faktisk blir funnet"
    ingress="…"
    problem="Kunden står utenfor med mobilen, men siden din laster ikke."
    losning="En rask side, så kunden bestiller rett fra mobilen."
    handlinger={[
      { tekst: "Book 20 minutter", href: "#kontakt" },
      { tekst: "Sjekk siden du har i dag", href: "/sjekk" },
    ]}
  />
  <!-- seksjon 2 rett etter: Tab fra siste handling i heroen går hit -->
</MalWow>
```

Kapittel står bare på «film»-sider. Står den på en «rolig» side, gjør `rolig.ts` den til
stillbilde.

### Filer

`kapittel-N.mp4` (16:9, 1920 × 1080, ≤ 1,2 MB) og `kapittel-N-m.mp4` (9:16, 1080 × 1920,
≤ 1,0 MB): H.264, nøkkelramme hver 8. ramme, uten lyd, `+faststart`.
`kapittel-N-start(-m).avif/.webp` (første bilde i utdraget, avif ≤ 120 kB / ≤ 90 kB) og
`kapittel-N-gronn(-m).avif/.webp` (bildet ved det grønne lyset + 0,02). Utdragene (andel av
dykket): 1: 0,44–0,80, 2: 0,48–0,83, 3: 0,46–0,76, 4: 0,48–0,86. Planens start (0,28–0,35)
viste bedriften som en øy i svart; flyttet etter `.design/arbeid/bevegelse/a2/start-valg-*.png`.

### Uten JavaScript

Vanlig høyde (100svh, teksten nederst). Det grønne bildet i full farge. Under heroteksten
står platen som liste: grå lampe og problemet, grønn lampe og løsningen, begge i
`--wow-tekst`. Ingen video.

### Med redusert bevegelse eller Save-Data

Som uten JavaScript. Inline-skriptet setter aldri `data-kapittel-film`, så ingen høyde, ingen
festing, ingen video, ingen grått. `<picture>` gir det grønne bildet ved redusert bevegelse,
og forhåndslastingen henter det grønne i stedet for startbildet. Bytter brukeren til redusert
bevegelse underveis, blir kapittelet stillbilde.

### Å vite

- Lasting: ved load hentes bare første bilde (startbildet i skrubb, det grønne i still). Klippet
  hentes som Blob først etter første interaksjon (rulling, hjul, berøring, tast, trykk; ikke
  peker), og bare når seksjonen er nær. Det grønne bildet er `loading="lazy"` og skjult i
  filmen, så det hentes bare om lampa blir grønn før klippet har tegnet.
- Kommer ikke `kapittel.ts` innen 4 s, går seksjonen tilbake til stillbildet (`data-kapittel-sent`).
- Tastatur: lenkene i heroteksten kan få fokus også når teksten er ute (ingen `visibility`);
  fokus der ruller tilbake til toppen av kapittelet (gjennom Lenis når den kjører). Platen har
  ingen lenker, så Tab fra siste handling går rett til seksjon 2.
- Bildeflaten er `aria-hidden`. Problem og løsning står i DOM-en hele tiden, med «Problem:» og
  «Løst:» som skjermlesertekst; lampa er aldri eneste bærer av status.
- Mobil er stående skjerm, `(max-aspect-ratio: 4/5)`, ikke bredde: 9:16-filene og
  `object-position: 50% 22%`.
- iOS kan ikke testes her. Priming med `play()`/`pause()` ved første berøring er med, men ikke
  sett på en ekte iPhone. Blandingsmodus over video er heller ikke sett i Safari.

## Rolig (wow, bølge A2: lese- og verktøysidene)

`src/scripts/wow/rolig.ts`. MalWow rendrer den i stedet for `index.ts` når
`bevegelse="rolig"`. Den importerer bare `hode.ts` (som ikke lenger bruker GSAP). Ingen GSAP,
ScrollTrigger, SplitText, Lenis, Embla, number-flow, peker eller inntoning. Søk i siden og
vanlig rulling virker som i en bok.

Det som beveger seg, gjør det bare som svar på leseren:

- Toppfeltet (`data-hode-skjul`) glir bort ved rulling nedover og tilbake ved rulling oppover
  (280 ms). Ikke ved redusert bevegelse.
- `<details>` i `<main>` toner innholdet inn når det åpnes (`::details-content`, opasitet,
  `--wow-tid-svar`). Høyden åpnes straks: del 8 tillater ikke å animere høyde, så planens
  «`<details>`-høyde» er bare opasitet. Toppfeltets menyer tones ikke.
- Menyen i toppfeltet lukkes med Esc og klikk utenfor av `Hode.astro` sitt eget skript.

`rolig.ts` fjerner også `wow-js`/`wow-inngang` (står `Intro` på siden ved en feil, står ingenting
skjult) og gjør et eventuelt `Kapittel` til stillbilde. Uten JavaScript ser siden lik ut.

Bygget (`astro build --outDir` i en midlertidig mappe, 19. nov. 2026): se rapporten fra A2 for
filene en rolig side laster og størrelsen i gzip.
