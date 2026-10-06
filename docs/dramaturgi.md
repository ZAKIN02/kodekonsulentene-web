# Dramaturgi: å gjøre «statisk» målbart

Kunden har sagt seks ganger at siden er statisk og ikke oppsiktsvekkende, og peker på
epic.net, bdsn.club og brand.dropbox.com. «Statisk» er en følelse til man teller. Dette
dokumentet teller.

Måleverktøyet er `.skudd/maal-rytme.mjs`.

## Hva referansene faktisk gjør

WebFetch er ubrukelig på alle tre: de er JS-rendret, og markdown-konverteringen fjerner
nøyaktig det som er interessant. bdsn.club ga null innhold. **Ikke stol på en
referanseanalyse gjort med WebFetch** – hent stilarkene i stedet.

Målt på de faktiske stilarkene:

| | unike `font-size` | vw-baserte | `clamp()` | `position:sticky` |
|---|---|---|---|---|
| epic.net (`index-317f88c7.css`) | **59** | 23 | 0 | 2 |
| brand.dropbox.com (webflow) | **40** | 16 | 14 | 0 |
| **oss** (all inlinet CSS) | **19** | 54 | 56 | 19 |

Største enkeltverdi hos epic er 195 px; vi har 158 px som malt toppverdi.

To ting er verdt å merke seg:

- **Vi har en tredjedel av skalatrinnene deres.** Det er den mekaniske forskjellen
  bak «flat». Vi bruker mer `clamp()` og vw enn begge – vi er ikke primitive, vi er
  *ensartede*.
- **Ingen av referansene bruker `animation-timeline`** (0 forekomster i begge
  stilark). De gjør bevegelsen med JavaScript. Vår scroll-avdekking er CSS-drevet og
  koster 0 kB. Det er ikke verdt å kopiere veien deres dit.

## Våre egne tall

Målt på 1440×900, 14 sider (før endringene under):

| side | høyde (skjermer) | skalaskift | utbrudd | bevegelser | død sone |
|---|---|---|---|---|---|
| `/` | 10,7 | **8** | **31** | 60 | 2,3 |
| `/sikkerhet` | 6,7 | 5 | 9 | 34 | 2,0 |
| `/nettsider` | 5,7 | 5 | 9 | 29 | 2,0 |
| `/priser` | 6,3 | 6 | 9 | 28 | 2,1 |
| `/systemer` | 5,3 | 5 | 9 | 20 | 2,1 |
| `/om` | 5,1 | 6 | 4 | 12 | 2,4 |
| `/caser` | 3,4 | 4 | 2 | **0** | 3,4 |
| `/handbok` | 5,5 | 4 | 2 | **0** | **5,5** |

«Død sone» er lengste strekning du kan scrolle uten at ett eneste element endrer seg.

**Forsiden har 8 skalaskift og 31 utbrudd. Undersidene har 4–6 og 2–9.** Det er hele
forskjellen, og den er ikke subtil.

**`størst` er 158 px på hver eneste side.** Alle sidene åpner med nøyaktig samme gest i
nøyaktig samme størrelse. Et hierarki mellom sider krever at noen sider roper lavere.

## Den største enkeltårsaken, og den ligger utenfor dette laget

`/caser` og `/handbok` har **null** bevegelsesøyeblikk. Årsaken er ikke at de mangler
materiale – den er denne regelen, som er kopiert ordrett inn i **17 sidefiler**:

```css
.scene:first-of-type .mega .ord,
.scene:first-of-type .mega-blokk,
.scene:first-of-type .avslor { opacity: 1 !important; animation: none !important; }
```

Vakten finnes av en god grunn: innhold over folden skal ikke ligge usynlig og vente på
en scroll som aldri kommer. Men den slår ut **hele den første scenen**, ikke bare det som
faktisk er over folden. På sider med bare én `<Scene>` – `/caser` og `/handbok` – dreper
den dermed all avdekking på hele siden.

To grep, i prioritert rekkefølge:

1. **Del sidene i flere `<Scene>`.** `/caser` og `/handbok` er én scene hver. Forsiden
   har mange. Dette løser også utbrudd-tallet og gir scenestreken noe å tegne.
2. **Snevre inn vakten** til det som faktisk ligger over folden – scenens hode, ikke alt
   innhold i scenen:
   ```css
   .scene:first-of-type .mega .ord,
   .scene:first-of-type .mega-blokk,
   .scene:first-of-type > .avslor:nth-child(-n + 2) { … }
   ```

**Uavklart:** jeg forsøkte å måle om vakten er nødvendig i det hele tatt ved å slette den
i nettleseren og lese opasitet over folden. Første forsøk var ugyldig – vakten setter
også `opacity: 1 !important` og skjulte dermed sitt eget resultat. Andre forsøk traff
ingen regler (`deleteRule` matchet ikke etter minifisering). **Jeg vet altså ikke om
vakten kan fjernes helt.** Den bør testes ordentlig før noen rører de 17 kopiene.

## Hva som er endret her

Begge endringene ligger i det delte laget og krever ingen sidefiler.

**1. Scenestreken tegner seg** (`scener.css`). Hårlinjen mellom scenene går fra
`scaleX(0)` til `scaleX(1)` når scenen kommer inn. Scenegrensene er de eneste
holdepunktene som finnes på alle sider, så dette gir en puls uten å røre en eneste
sidefil. Null markup, null JavaScript – pseudoelementet fantes fra før.

Verifisert: scene 4 på `/systemer` går 0 → 1 mellom y1400 og y1900. Ved
`prefers-reduced-motion: reduce` står alle streker på 1 i alle scroll-posisjoner.

*Begrensning:* på sider med én scene finnes ingen scenegrense, og den første streken er
skjult (`:first-of-type`). **`/caser` og `/handbok` får altså ingenting ut av dette.**
De må deles i flere scener først.

**2. `Mega` har fått `storrelse`** (`Mega.astro` + `typo.css`): `"full"` (uendret
standard), `"stor"` (maks 150 px), `"mellom"` (maks 108 px). Standard er uendret, så
ingenting flytter seg av seg selv – men sidene kan nå variere åpningsgesten i stedet for
at alle roper like høyt.

## Feller som ikke må gjeninnføres

- **`animation`-stenografi med `view()`.** lightningcss slår `animation: x linear both`
  og `animation-timeline: view()` sammen til `animation: linear both x view()`, som er
  ugyldig. Både Chromium og Firefox forkaster tidslinjen *uten å si fra*. Bruk alltid
  langformene. Sjekkes av en test.
- **`margin-inline: auto` på `.mega`.** `auto` blir null når elementet er bredere enn
  forelderen. Ga «En nettside som faktisk blir funne» – 130 px utenfor skjermen på
  1680 px. `overflow-x: clip` skjuler det for alle vanlige overflytstester. Kjør
  `node .skudd/maal-mega-klipp.mjs <base> <sider…>` etter hver endring i `typo.css`.
- **`getComputedStyle().animationTimeline` leser `auto` selv når `view()` er satt.**
  Den er ubrukelig som detektor – bruk `animationName !== "none"`. Min første måling
  rapporterte 0 bevegelser på `/om` på grunn av nettopp dette. Det var min feil, ikke
  sidens.

## Dødt i `typo.css`

`.nokkeltall__post` har fortsatt `grid-template-columns: minmax(0,1fr) minmax(0,1fr)`,
men `Nokkeltall.astro` overstyrer med `subgrid` og vinner på spesifisitet. Regelen i
`typo.css` er død kode og bør fjernes når ingen andre skriver i filen.
