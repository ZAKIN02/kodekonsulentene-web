# Feiljakt, andre runde — degradering og nettlesere

Målt 6. oktober 2026 med `.skudd/feiljakt2.mjs` mot lokal server på port 4443,
etter et ferskt bygg. Tre nettlesere, tre modi, pluss `ffprobe` på hver videofil
og rå HTTP-kontroll mot produksjon.

    node .skudd/feiljakt2.mjs http://127.0.0.1:4443 lokal
    node .skudd/feiljakt2.mjs https://kodekonsulentene.no prod

Runde 1 (`docs/feil.md`) sa selv fra om to blindsoner: den målte bare Chromium, og
den målte ikke degradering. Denne runden dekker nettopp dem.

Sortert etter hvor synlig feilen er for en kunde.

---

## 1. Produksjon har ingenting av dagens arbeid — den kjører fortsatt den billige videoen

Dette er det viktigste funnet, og det er ikke en kodefeil. Alt som ble forbedret i
dag ligger lokalt.

| Fil | Produksjon | Lokalt |
|---|---|---|
| `historie/hero-1920.mp4` | **4,19 MB** (gammel) | 7,16 MB (ny) |
| `scener/sikkerhet-1920.mp4` | **HTTP 404** | 4,34 MB |
| `scener/nettsider-1920.mp4` | **HTTP 404** | 5,44 MB |
| `scener/priser-1920.mp4` | **HTTP 404** | 5,79 MB |
| `historie/hero-2560.mp4` | **HTTP 404** | 9,55 MB |

Kunden ser altså fortsatt nøyaktig den videokvaliteten han har klaget på fire
ganger. Markupen for undersidene er committet, men filene er ikke deployet.

---

## 2. Redusert bevegelse virker ikke på `/historie` — overstyringen er død kode

Ber brukeren om mindre bevegelse, skal scroll-historien falle tilbake til vanlig
stabling. Den gjør ikke det. Målt med `getComputedStyle`:

| | `prefers-reduced-motion` av | på |
|---|---|---|
| `.hist__media` `position` | `sticky` | **`sticky`** |
| `.hist__scener` `margin-top` | `-900px` | **`-900px`** |
| `.hist__scene` `min-height` | `1170px` | **`1170px`** |

Identisk. Overstyringen har ingen virkning i det hele tatt.

**Årsaken er rekkefølge, ikke spesifisitet.** I `src/components/ScrollHistorie.astro`:

    linje  87   @media (prefers-reduced-motion: reduce) {
    linje  88       .hist[data-aktiv] .hist__media, …  → position: static
    linje 101   .hist[data-aktiv] .hist__media { position: sticky; … }

Begge selektorene er `.hist[data-aktiv] .hist__media` — nøyaktig samme spesifisitet.
En media-spørring legger ikke til spesifisitet. Da avgjør rekkefølgen, og regelen på
linje 101 kommer sist. Den vinner.

Dette er en regresjon fra endringen som i dag flyttet aktiveringen fra skriptet til
CSS for å fjerne CLS. CLS-rettingen virker; porten for redusert bevegelse ble satt
inn før reglene den skulle overstyre.

Blokken på linje 189 virker derimot, fordi den bruker `!important` — så kortene
slutter å animere. Men selve det festede, scroll-spolte oppsettet står.

Følgen: en bruker som har bedt systemet om mindre bevegelse, får fortsatt
helskjerms video som spoles av scrollen. Det er den kraftigste bevegelsen på
nettstedet.

Rettes ved å flytte `@media`-blokken etter linje 140, eller gi den `!important`
slik den andre blokken har.

**Kontrasten til `Avslor` bekrefter diagnosen.** Samme kontroll på forsiden, der
dempingen i `scener.css` bruker `!important`:

| | normal | redusert |
|---|---|---|
| Elementer | 31 | 31 |
| Laveste opacity | 0 (utenfor syn) | **1** |
| `animation-name: none` | 0 av 31 | **31 av 31** |

Der virker det, fullstendig. Forskjellen mellom de to stedene er nøyaktig
`!important` og rekkefølge — ikke noe annet.

---

## 3. `systemer`-klippet er aldri omkodet — og det ligger på forsiden

Fire scener er omkodet til den nye kvaliteten. To er ikke. Målt med `ffprobe`:

| Klipp | 1280 | 1920 | 2560 | Omkodet? |
|---|---|---|---|---|
| `hero` | 1,62 | 3,73 | 4,98 | ja |
| `nettsider` | 2,85 | 5,67 | 6,81 | ja |
| `priser` | 2,93 | 6,04 | 7,13 | ja |
| `sikkerhet` | 2,26 | 4,53 | 5,44 | ja |
| **`systemer`** | **0,64** | **1,58** | — | **nei** |
| **`historie`** | **0,67** | **1,86** | — | **nei** |
| `verktoy` | 1,51 | 3,08 | — | nei |
| `verktoy-sjekk` | 0,73 (960) | 2,15 | — | ny, men lav |

Alt i Mbit/s.

`systemer-1920.mp4` på 1,58 Mbit/s brukes **to steder**: `src/pages/index.astro:100`
og `src/pages/systemer.astro:75`. Forsiden er den flaten flest ser, og den har det
nest dårligste klippet på nettstedet. `historie-1920.mp4` på 1,86 Mbit/s ligger i
`ScrollHistorie` på `/historie`.

`verktoy-sjekk` er helt nytt, men ble enkodet på 2,15 Mbit/s — under halvparten av
de fire omkodede. Verdt å sjekke om den agenten brukte gammel CRF.

**Samme klipp to steder** er fortsatt uløst fra runde 1: besøkeren ser `systemer`
både på forsiden og på `/systemer`.

---

## 4. Nettleserstøtte: bare Firefox trenger reserven, og den virker

Målt direkte med `CSS.supports()`, ikke antatt:

| Nettleser | Versjon | `animation-timeline: view()` | Vei |
|---|---|---|---|
| Chromium | 153.0.8010.12 | **ja** | ren CSS |
| WebKit (Safari) | 26.6 | **ja** | ren CSS |
| Firefox | 155.0 | **nei** | IntersectionObserver |

I Firefox aktiveres reserven korrekt: `html.js-avslor` settes, og `@supports not
(animation-timeline: view())` tar over. I WebKit settes `js-avslor` **ikke** —
riktig, for der gjør CSS-en jobben selv, og skriptet koster da ingenting.

Degraderingen er bygget riktig vei: `scener.css` skjuler bare under
`html.js-avslor`, altså bare når JavaScript har bekreftet at det kan vise innholdet
igjen. Mangler JavaScript, skjules ingenting.

**Verifisert empirisk i Firefox, ikke bare lest ut av koden.** Forsiden, 31
tekstelementer vurdert mens de sto i synsranden, etter at overgangene hadde satt
seg: **0 usynlige, og ingen under opacity 0,9.** Alt som skal leses, leses.

Det tok to forsøk å måle riktig. Første gjennomløp meldte fire elementer på opacity
0,04. Overgangen i Firefox-reserven er 420 ms pluss opptil 350 ms trinnforsinkelse,
og jeg målte med 70 ms ventetid — altså midt i inntoningen. Med 5 sekunders settetid
før målingen forsvant alle fire. Det var min måling, ikke siden.

---

## 5. Nøkkeltallene: gapet krympet, men variasjonen er uendret

Subgrid-rettingen er anvendt — `grid-template-columns` er `344px 711px` på 1440,
altså `max-content` pluss resten, ikke to like kolonner. Men den løste bare halve
problemet.

Målt som faktisk blekk, fra tallets høyre kant til etikettens venstre:

| Tall | 1440 px | 2000 px |
|---|---|---|
| `6/6` | 163 px | 169 px |
| `0` | **295 px** | **306 px** |
| `0,1 s` | **32 px** | **32 px** |
| `24 t` | 98 px | 100 px |

Gapene er rundt 170 px mindre enn før. Men spennet mellom smaleste og bredeste rad
er **274 px** (306 − 32) — og det var nøyaktig tallet den forrige agenten kalte
«verre enn størrelsen» og mente å ha rettet.

Årsaken er geometrisk: subgrid gir alle radene samme *kolonnebredder*, så etikettene
får én felles venstrekant. Men tallene har ulik bredde og slutter derfor fire ulike
steder. Avstanden fra tall til etikett må da variere like mye som tallene gjør.
Felles kolonnebredde og jevnt gap er to forskjellige ting, og bare det første ble
løst.

Skal gapet jevnes ut, må etiketten knyttes til tallets slutt i stedet for til en
felles kant — eller tallene gis en felles bredde.

---

## 6. Range virker på hver eneste videofil

Alle ti filene svarer `206 Partial Content` med `accept-ranges: bytes`, inkludert
de fire nye. Uten dette er `seekable.end(0)` null og scroll-spolt video står bom
stille — det har skjedd her før.

---

## Hva jeg sjekket og ikke fant noe på

| Kontroll | Resultat | Bevis for at kontrollen så noe |
|---|---|---|
| Range på video | **0 feil** | 10 filer, alle `206` + `accept-ranges` |
| Ukjent URL svarer 404 | **riktig** | `/finnes-ikke-<tid>` → 404 |
| Kvittering uten JavaScript | **virker** | «Takk – meldingen kom fram» i rå HTML fra serveren |
| CSP-hasher på `/kontakt` | **21** | mot 4 script-tagger; rettingen fra i dag holder |
| `js-avslor` i WebKit | **ikke satt** | riktig — CSS-veien brukes |

---

## Målefeil jeg forkastet

**106 «usynlige» tekstelementer var min egen feil.** Første utkast scrollet gjennom
siden, scrollet tilbake til toppen, og målte så. Med `animation-timeline: view()`
er opacity 0 når elementet er utenfor synsranden — det *er* mekanikken. Alt under
skjermkanten ble derfor meldt som usynlig.

Verifisert ved å måle de samme elementene mens de sto i syn:

| Tekst | Utenfor syn | I syn |
|---|---|---|
| «3/6 Sikkerhetsheadere…» | 0,094 | **1** |
| «Se hva som ligger inne…» | 0,266 | **1** |
| «Nettsider 01 Rask side…» | 0,915 | **1** |

Skriptet måler nå beste synlighet over et helt gjennomløp, og feller bare elementer
som var i syn og likevel aldri ble synlige.

**Fire 404-er på `/nettsider` og `/priser` var agenter midt i arbeidet.** Markupen
pekte på videofiler som ennå ikke var ferdig generert. Kontrollert igjen senere:
alle svarer 200.

**Testserveren min ble drept midt i en kjøring** av en parallell agents `pkill -f
server.mjs`. Loggen viser `SIGTERM – stopper`. Serveren kjører nå som `tjener-f2.mjs`
så mønsteret ikke treffer den.

---

## Metode, og hva som ikke ble ferdig

`.skudd/feiljakt2.mjs` tar tre nettlesere × tre modi. Full matrise ble **ikke kjørt
ferdig**: fem agenter genererte video og bilder samtidig, og 21 nettleserprosesser
sloss om maskinen. En enkelt Chromium-runde brukte over 25 minutter uten å bli
ferdig, så jeg stoppet den og målte i stedet målrettet, side for side.

Funnene over er derfor fra fokuserte sonderinger med eksplisitt settetid, ikke fra
matrisen. Hver tabell viser tallene den bygger på. Skriptet er lagt igjen og kan
kjøres når maskinen er ledig:

    node .skudd/feiljakt2.mjs http://127.0.0.1:4443 lokal
    node .skudd/feiljakt2.mjs http://127.0.0.1:4443 lokal firefox   # én nettleser

---

## Usikkert

- `verktoy-sjekk`-klippets lave bitrate (2,15 Mbit/s) er observert, ikke
  diagnostisert. Jeg har ikke lest enkodingsinnstillingene til agenten som laget det.
- Degradering er verifisert på `/` og `/historie`. De øvrige 22 sidene er ikke målt
  i Firefox, så et tilsvarende rekkefølgeproblem et annet sted ville jeg ikke
  oppdaget.
- Jeg målte ikke mot produksjon i nettleser, bare med rå HTTP. Det holder for å
  fastslå hvilke filer som finnes, men ikke for CSP eller konsollfeil der.
