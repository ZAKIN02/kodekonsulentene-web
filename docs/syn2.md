# Synrapport, runde 2 — 6. oktober 2026

Alle sider sett på 390, 1440 og 1680 px med ekte Chromium, mot et **ferskt bygg**.
Verktøy: `.skudd/syn2.mjs` (bevegelse), `.skudd/syn2-csp.mjs`, `.skudd/syn2-par.mjs`,
`.skudd/syn2-montasje.mjs`, `.skudd/syn2-endring.mjs`. Bilder i `.skudd/syn2/`.

Fem agenter skrev i sidefilene mens dette ble målt. Hvert funn er derfor merket med
klokkeslett, og tre funn er forkastet som mine egne målefeil nederst.

Runde 1 sine to ØDELAGT-funn er **begge borte**: Mega-klippingen og `/priser` sin
svarte video. Det er verifisert, ikke antatt.

---

## Det korte svaret på «statisk og ikke oppsiktsvekkende»

**19 av 21 medieelementer er det samme objektet.** Alle 13 stillbildene og 7 av 8
filmklipp viser en stabel aluminiumsplater på nesten svart. Bytter du underside,
skifter teksten – men bildet ser likt ut.

Det eneste som bryter mønsteret er `/verktoy`, som har et **ekte skjermopptak** av
sjekken som kjører mot nkom.no. Det er det mest overbevisende materialet på hele
nettstedet, og det er det eneste som ikke er generert.

Dette er ikke en feil i noe enkelt bilde. Hvert bilde er godt laget for seg. Det er
at hele nettstedet har ett motiv, og et motiv som gjentas 19 ganger slutter å si noe.

---

## ØDELAGT

### 1. Tre sider peker på film som ikke finnes (målt 11:43–11:46)

| Side | Refererer | Svar |
|---|---|---|
| `/apper-og-ai` | `apper-1920.mp4` + plakat | **404** |
| `/bransjer/handverkere` | `bransje-sortering-{1920,960}.mp4` + plakat | **404** |
| `/bransjer/klinikker` | `bransje-fylling-{1920,960}.mp4` + plakat | **404** |

Målt på videoelementet: `readyState 0`, `seekable.end(0) = 0`. Klippet laster aldri,
og scroll-spoling gjør ingenting.

**Det ser bedre ut enn i runde 1.** `/priser` viste da et 720 px høyt svart rektangel.
Nå faller seksjonen tilbake til en vanlig lys seksjon med teksten sin
(`.skudd/syn2/bransje-videoband.png`). Ingen svart hull — men siden er stille uten
film, og markupen sier at det skal være en.

Alle tre er agenter som fortsatt jobber. **Mønsteret har nå gjentatt seg på fem sider**
(`/nettsider` og `/priser` i runde 1, disse tre nå): markup kobles inn før filene
finnes. Lander ikke agenten, går det i produksjon.

### 2. Tre sider laster 3–5,6 MB film før brukeren har scrollet

Målt ved 1680 px, førstelast, uten å scrolle:

| Side | Overført | Hvorav film |
|---|---|---|
| `/nettsider` | **5685 kB** | `nettsider-1920.mp4` 5570 kB |
| `/sikkerhet` | **4562 kB** | `sikkerhet-1920.mp4` 4445 kB |
| `/verktoy` | **2994 kB** | `verktoy-1920.mp4` 2847 kB |
| `/sjekk` | 2225 kB | `verktoy-sjekk-1920.mp4` 2106 kB |
| `/historie` | 1935 kB | `historie-1920.mp4` 1827 kB |
| `/systemer` | 1284 kB | `systemer-1920.mp4` 1168 kB |
| `/priser` | **117 kB** | – filmen ligger lavt nok på siden |
| `/bransjer/handverkere` | 148 kB | – filmen 404-er |

Årsaken er kjent og dokumentert: `SceneFilm` bruker `rootMargin: "150% 0px"`, så alt
innenfor de første ~2,5 skjermhøydene hentes med én gang. `preload="none"` hjelper
ikke. En agent fant dette og la et 960-trinn på `/sjekk` — men `/nettsider`,
`/sikkerhet` og `/verktoy` har fortsatt bare 1280 og 1920.

`/priser` på 117 kB viser at plasseringen alene avgjør det: ligger filmen under
margen, lastes ingenting.

---

## STYGT

### 3. `Horisont` bruker 78 % av skjermen på ingenting, i tre skjermhøyder

Identisk geometri på `/caser`, `/status` og `/handbok`:

```
seksjonshøyde  2700 px   (tre skjermhøyder scroll)
festet vindu    900 px
korthøyde       198 px   -> 22 % av flaten bærer innhold
```

Det er den direkte årsaken til alle tre målte døde strekk:

| Side | Svakeste overgang | Endring |
|---|---|---|
| `/caser` | skjerm 3 → 4 | **2,8** |
| `/handbok` | skjerm 5 → 6 | **2,9** |
| `/status` | skjerm 5 → 6 | **3,0** |

(Snittet for en levende side ligger på 11–18.)

Bildene: `.skudd/syn2/caser-3-4.png`, `status-5-6.png`, `handbok-5-6.png`. I alle tre
ligger kortene i øvre tredel, og under dem er det 500–600 px tomt. En hel skjermhøyde
med scrolling flytter kortene omtrent ett kort sidelengs.

**På mobil (390 px) blir det samme til målte døde felt**, altså sammenhengende strekk
uten blekk i det hele tatt:

| Side | Døde felt |
|---|---|
| `/status` | 496 px (y 2442–2938) og 477 px (y 3361–3838) |
| `/caser` | 473 px (y 2463–2936) |
| `/handbok` | 425 px og 415 px |

`document.elementFromPoint` midt i feltet svarer `DIV.horisont__fest`. Bildet:
`.skudd/syn2/status-390-dod.png` — mellom terminalblokken og «Hvis noe er nede» ligger
det en tom flate på nesten en tredels skjerm.

Komponenten er ikke ødelagt — den gjør det den er bygget for. Men den tar tre
skjermhøyder betalt for lite, og den sprer seg: den ble nettopp anbefalt som
rytmegrep til flere sider.

### 4. `/verktoy`-klippet står stille i sine siste 40 %

Endring mellom nabo-rammer gjennom klippet:

```
15 %   1,4
30 %  12,7
45 %  13,5
60 %   0,7
75 %   0,2
90 %   0,1
99 %   0,2
```

Alt skjer mellom 15 % og 45 %. Resten er samme bilde. På et scroll-spolt klipp betyr
det at over en tredel av scrollingen ikke gir noe tilbake.

### 5. Hero-klippet tar tilbake sin egen avsløring

`hero-1920.mp4` er 16 s og 7,2 MB. Montasjen (`.skudd/syn2/montasje.png`, øverste rad)
viser forseglet blokk → kjerneprøve ute → **forseglet blokk igjen**. Målt slutt mot
start: 1,8 av 255 — praktisk talt samme bilde.

Det er ping-pong. Poenget med motivet er at noe skjult blir synlig, og klippet lukker
det igjen før det er ferdig. Nøyaktig den begrunnelsen ble brukt til å fjerne ping-pong
fra `/sjekk`: en bevegelse som reverserer av seg selv trenger det ikke, og det doblet
fila. Her står den igjen.

### 6. To klipp er aldri omkodet og ligger på gammel bitrate

| Klipp | Bitrate 1280 | Bitrate 1920 |
|---|---|---|
| `systemer` | **0,63** | **1,58** Mbit/s |
| `historie` | **0,66** | **1,86** Mbit/s |
| nettsider | 2,85 | 5,67 |
| priser | 2,93 | 6,03 |
| sikkerhet | 2,26 | 4,52 |
| hero | 1,62 | 3,73 |

`systemer` er det svakeste klippet vi har — og det ligger på **både forsiden og
`/systemer`**. Det er det første en besøkende ser.

### 7. 18,5 MB 2560-film som ingen side ber om

`SceneFilm` støtter `data-stor`, men tre sider sender den ikke:

```
nettsider-2560.mp4   6,5 MB   0 referanser
priser-2560.mp4      6,8 MB   0 referanser
sikkerhet-2560.mp4   5,2 MB   0 referanser
```

Filene er generert og ligger i repoet. Brukere på brede skjermer får 1920 selv om
komponenten allerede kan servere bedre. Dette er samme feil som hero hadde, gjentatt
tre ganger.

---

## SER BRA UT — verifisert, ikke antatt

- **Mega-klippingen er borte.** 23 sider × 4 bredder (1280/1440/1680/2000):
  `ingen klipping`. Runde 1 sine elleve treff er alle vekk.
- **Null CSP-brudd** på 23 sider, med `securitypolicyviolation`-lytter og ferskt bygg
  bak serveren.
- **Ingen vannrett overflyt** på verken 390 eller 1680 px, og **nøyaktig én `h1`** på
  hver side. Ingen døde flater ved 1680 px; de som finnes på 390 px er alle
  `Horisont` (punkt 3).
- **Alle bilder laster, alle har `width`/`height`.**
- **Oppgitte dimensjoner stemmer med filene på disk.** Alle 13 stillbilder sjekket mot
  `sharp`: null avvik. Manifestet skrives etter at filene er laget, så ingen dimensjon
  er skrevet for hånd.
- **Alt-tekstene beskriver det som faktisk er tegnet**, og unngår å telle plater —
  nettopp der et tidligere bilde bommet med «tre, fem og åtte» mot 3, 5 og 10.
- **Ingen morph.** Start- og sluttbilde for alle sju klipp sett side om side i
  `.skudd/syn2/montasje.png`. Objektet er det samme gjennom hvert klipp. `priser` deler
  én stabel i tre grupper uten å endre antall; `sikkerhet` flytter én plate.

---

## Tre funn forkastet som mine egne målefeil

**1. «CSP-brudd på `/sjekk`.»** Serveren min startet 11:32:05.
`dist/client/sjekk/index.html` ble skrevet 11:37:24 av en parallell agent. Hashene ble
høstet fem minutter før fila fikk sitt nåværende innhold. Etter nytt bygg og omstart:
null brudd på alle 23 sider. Dette er samme artefakt som runde 1 punkt 3.

**2. «`/verktoy` er helt død — 0,0 endring, 100 % døde strekk.»** Målingen fanget to
identiske bilder fordi siden var 1800 px i stedet for 4613 px i det øyeblikket. Målt på
nytt alene: 12,2 i snitt, 0 % døde strekk. Transient, trolig et bygg midt i kjøringen.
En side som rapporteres som fullstendig død bør alltid måles om før den meldes.

**3. «`/apper-og-ai` har generert 168 kB bilder som ligger ubrukt.»** Sant 11:41 — null
referanser til `Stillbilde` eller `SceneFilm` i sidefila. 11:45 var begge bildene koblet
inn og lastet. Agenten var midt i arbeidet. Det eneste som står igjen fra det funnet er
filmen, som fortsatt 404-er.

---

## Metode

```
node .skudd/syn2.mjs <base> <bredde> [sider...]     bevegelse per skjermhøyde
node .skudd/syn2-csp.mjs <base> [sider...]          CSP-brudd, ferskt bygg påkrevd
node .skudd/syn2-par.mjs <base> <sti> <n> <ut.png>  to naboskjermer side om side
node .skudd/maal-mega-klipp.mjs <base> [sider...]   klipping, fra Range
```

**Bevegelsestallet** er gjennomsnittlig kanalavvik mellom to skjermbilder tatt én
skjermhøyde fra hverandre, 0–255. Det gjør «statisk» målbart: en side med mye tekst kan
ha høy blekktetthet (runde 1) og likevel gi lite tilbake når man scroller.

Som i runde 1: tallene er en kikkert, aldri konklusjonen. Hvert funn her er fulgt opp
med å se på bildet.
