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
Testfiler finnes i `public/scener/test/` til klippene fra `produsent` er klare.

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
