# Feiljakt – hva som faktisk er galt

Målt 6. oktober 2026 med `.skudd/feiljakt.mjs` mot lokal server og mot produksjon,
32 ruter, ekte Chromium. Supplert med `ffprobe` på hver videofil.

    node .skudd/feiljakt.mjs http://127.0.0.1:4423 lokal
    node .skudd/feiljakt.mjs https://kodekonsulentene.no prod

Sortert etter hvor synlig feilen er for en kunde, ikke etter hvor lett den er å rette.

---

## 1. Videoen er enkodet for lavt til å tåle å bli sett på — dette er «billig»-følelsen

Målt bitrate i produksjon:

| Fil | Oppløsning | Bitrate |
|---|---|---|
| `systemer-1920.mp4` | 1920×1080 | **1,58 Mbit/s** |
| `historie-1920.mp4` | 1920×1080 | 1,86 Mbit/s |
| `hero-1920.mp4` | 1920×1080 | 2,18 Mbit/s |
| `verktoy-1920.mp4` | 1920×1080 | 3,08 Mbit/s |

Rørledningen bruker `-crf 24` på 1920-trinnet (`scripts/scene.mjs` linje 119).

**Hvorfor det er feil akkurat her:** CRF 24 er et fornuftig valg for video som
*spilles av*. Øyet oppløser ikke detalj i bevegelse, så komprimeringen går upåaktet
hen. Men dette er scroll-spolt video. Brukeren stopper på enkeltrammer og ser på dem
som stillbilder. Da gjelder stillbildekrav, ikke videokrav — og CRF 24 er synlig
mykt når en ramme holdes.

**`-g 8` gjør det verre, ikke bedre.** Tette nøkkelbilder er nødvendige for at
spolingen skal være jevn, men de er dyre. Målt på `systemer-1920.mp4`:

    19 nøkkelbilder = 50 % av alle dataene, 126 øvrige bilder = de andre 50 %
    snitt nøkkelbilde: 30,8 kB

Et 1920×1080 nøkkelbilde på 30,8 kB er omtrent en JPEG på kvalitet 45. Halve
budsjettet går til nøkkelbildene, og budsjettet er for lite til å begynne med.
Kombinasjonen tette nøkkelbilder + lav CRF er den verste av begge verdener.

**Rettingen er CRF, ikke oppløsning.** 2560 eller 4K på samme CRF gir større filer
som fortsatt ser myke ut. CRF 18–20 på 1920 er det som monner.

**Og det haster:** høykvalitetsmellomfila (CRF 16) legges i `.skudd/scene-tmp/`,
som er tom. Masterne er borte. Å enkode på nytt fra det som ligger i `public/`
henter ikke tilbake detaljer som allerede er kastet — jeg prøvde: samme klipp
re-enkodet på CRF 18 vokser bare fra 1,14 til 1,52 MB, fordi det ikke er mer
informasjon igjen å beholde. **Bedre kvalitet krever å generere scenene på nytt
hos Higgsfield**, altså å betale igjen. Rørledningen bør beholde masteren.

---

## 2. `/kontakt` har en lenke som går ingen steder — i produksjon nå

    <a href="tel:"></a>

Tom `href="tel:"`, og ingen tekst inni. To feil i ett element: lenken gjør ingenting
om den klikkes, og den har ikke noe tilgjengelig navn, så en skjermleser annonserer
«lenke» uten å kunne si hva den fører til. Bryter WCAG 2.4.4 og 4.1.2.

Kommer av at telefonnummeret står tomt i `src/data/firma.ts` — med vilje, fordi tomt
er ærligere enn oppdiktet. Men da skal ikke lenken rendres i det hele tatt.

**Dette er det eneste ekte funnet i produksjon.** Det er også det eneste funnet som
var der i begge kjøringer, lokalt og i produksjon.

---

## 3. Halve siden har ingen bevegelse i det hele tatt

12 av 24 ekte sider har verken film eller stillbilde:

    404, apper-og-ai, caser, handbok, historie*, kontakt,
    om, personvern, sjekk, status, terminal, vilkar

`/historie` har film, men ikke gjennom `SceneFilm`-komponenten.

Målt per side i produksjon: **2 bilder på hver eneste side** — og begge to er
logoen, lys og mørk variant. Det finnes ikke ett eneste illustrerende bilde på
hele nettstedet.

---

## 4. Tre sider har film lokalt som aldri er blitt publisert

| Side | `<video>` i produksjon | `<video>` lokalt |
|---|---|---|
| `/sikkerhet` | 0 | 1 |
| `/nettsider` | 0 | 1 |
| `/priser` | 0 | 1 |

`git status` viser alle tre som endret og ikke committet. Arbeidet er gjort, men
står igjen i arbeidsmappa.

---

## 5. Samme klipp brukes på to sider

`systemer-1920.mp4` ligger både på forsiden og på `/systemer`. Besøkeren ser samme
film to ganger og oppfatter nettstedet som tynnere enn det er. Det finnes bare
**fire** distinkte klipp på hele siden.

---

## Hva jeg sjekket og IKKE fant noe på

Null-funn er bare verdt noe hvis kontrollen faktisk hadde noe å måle på. Derfor
tallene bak hvert punkt:

| Kontroll | Resultat | Bevis for at den faktisk kjørte |
|---|---|---|
| CSP-brudd i produksjon | **0** | hver inline-hash kontrollert mot headeren, alle til stede |
| Døde forespørsler, 404/500 | **0** | 32 ruter, alle svarte 200 |
| Bilder som ikke lastet | **0** | `naturalWidth > 0` på samtlige |
| Bilder uten `width`/`height` | **0** | alle hadde begge |
| Video som ikke kan spoles | **0** | `readyState 4`, `seekable.end(0)` 6,0–8,0 s — Range virker |
| Ugyldig animasjons-stenografi | **0** | 246–353 CSS-regler faktisk lest, 0 utilgjengelige ark |
| Ukjent URL svarer 404 | **ja** | `/finnes-ikke-<tid>` → 404 |

Scroll-drevet animasjon er i live: 11–56 elementer per side har en reell
`animation-timeline` i produksjon (56 på forsiden, 35 på `/sikkerhet`).

---

## Tre «funn» jeg forkastet som egne målefeil

Dette er ikke selvkritikk for sin egen skyld — hver av dem ville blitt rapportert
som en sidefeil hvis jeg ikke hadde ettergått dem.

1. **CSP-brudd på `/status`, `/lab/typo`, `/lab/interaksjon` lokalt.** Serveren
   høster hashene for inline-skript **én gang ved oppstart**. Parallelle agenter
   bygget `dist/` om midt i kjøringen, så HTML-en hadde endret seg mens serveren
   holdt gamle hasher. Verifisert: etter omstart var samtlige hasher til stede.
   `dist/client/lab/interaksjon/index.html` ble skrevet 10:37:03, serveren startet
   10:35:28.

2. **`/lab/typo` svarte 404.** Samme årsak — fila ble skrevet mens kjøringen pågikk.
   Svarer 200 nå.

3. **Seks «feil sideforhold» på `/lab/og`.** Min egen kontroll var gal. Et bilde med
   `width="1200" height="630"` og `width:100%; height:auto` i CSS er *riktig* —
   attributtene er der nettopp for å reservere plassen. Jeg sammenlignet oppgitt
   bredde mot malt bredde; det riktige er å sammenligne sideforholdet. Rettet i
   skriptet.

**Følgen for arkitekturen:** at hashene høstes én gang ved oppstart er trygt i
produksjon, der bildet er uforanderlig. Men det betyr at enhver innholdsendring uten
omstart slår ut alle inline-skript stille. Det har allerede skjedd to ganger i dette
prosjektet. En oppstartskontroll som sammenligner antall hasher mot antall inline-
skript i `dist/` ville fanget det.

---

## Usikkert

- Jeg målte ikke Firefox. `animation-timeline` mangler der, og degraderingen er
  bare verifisert for SVG-strøk, ikke for `Avslor`-komponenten.
- Bitrate-vurderingen er en fagvurdering, ikke en måling mot en fasit. Jeg har
  ikke kjørt VMAF mot en master, fordi masteren ikke finnes lenger.
