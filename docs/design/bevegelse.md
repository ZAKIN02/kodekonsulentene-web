# Bevegelseskomponenter

Kontrakten `bygger` bruker. Én oppføring per komponent. Kildekoden ligger i
`src/components/bevegelse/`, testene i `tests/bevegelse/`
(`npx playwright test --config tests/bevegelse/playwright.config.ts`).

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
