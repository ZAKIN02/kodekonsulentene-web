# Forsidens historie — og hvorfor ett gjennomgående klipp ikke var svaret

## Utgangspunktet, målt

Forsiden var 10,2 skjermer høy med **ett** medieelement, og **8,6 skjermer uten
noe visuelt i det hele tatt**. Det ene klippet var dessuten `systemer-*`, altså
nøyaktig samme fil som `/systemer` viste. To sider, identisk film.

## Funn 1: ett klipp over flere seksjoner ødelegger utsnittet

Oppdraget ba om ett gjennomgående klipp over hele forsiden. Jeg bygde det:
`.scenefilm-ramme` er `position: relative`, `SceneFilm` er `absolute; inset: 0`,
og spolingen regnes ut fra rammens plass i vinduet. Rammen rundt tre seksjoner
spoler derfor ett klipp gjennom alle tre — det virket på første forsøk,
`currentTime` gikk 1,0 → 8,04 jevnt.

Men filmflaten ble da 1512 × 2724 px, altså sideforhold 0,56 mot videoens 1,78.
Med `object-fit: cover` betyr det at **bare 31 % av bildebredden er synlig**.
Lagt sammen med masken skjulte den **85 % av motivets lyse blekk** — mot 46 % med
én seksjon. Det er den avkappede resten kunden har kalt lavkvalitet.

Å feste filmen (`position: sticky`) ville løst utsnittet, men spoleformelen leser
*samme* elements `getBoundingClientRect()`: fester man det, låses `r.top` på 0 og
spolingen stopper helt. Det krever en endring i `SceneFilm`, som ikke var min.

**Konklusjon: ett gjennomgående klipp er feil med denne komponenten.** Historien
fortelles i stedet som to akter av samme objekt, hver i en riktig proporsjonert
flate.

## Funn 2: siste tredel av hvert klipp spilles mens flaten forlater skjermen

Dette gjelder **alle** scenefilmer på nettstedet, ikke bare forsiden.

`SceneFilm` bruker `andel = (innerHeight − r.top) / (innerHeight + r.height)`.
`andel = 1` krever `r.top = −r.height`, altså at flaten er helt over vinduet.
Målt på en 752 px flate i et 850 px vindu:

| klipp-posisjon | filmflate synlig |
|---|---|
| 53 % | **100 %** |
| 84 % | 35 % |
| 100 % | **0 %** |

Hero-klippets poeng — kjerneprøven ute, den limegrønne linjen tent — ligger på
90–100 % av tidslinjen. Det er strukturelt utenfor rekkevidde. Målt med en
limegrønn-teller: ~100 piksler i filmseksjonen, altså bare UI-aksenter, aldri
motivet.

**Regelen som følger: et scenefilm-klipp må ha poenget sitt rundt 50 % av
tidslinjen, ikke på slutten.** Begge aktene er derfor re-timet med `tpad` som
holder siste ramme, så poenget faller der flaten er 100 % synlig. Etter: poenget
vises på `t = 7,41 / 14,04`, altså 53 %.

## Historien

Samme blokk, samme kamera, samme lys, to akter:

- **Akt 1 — «Tre ting vi gjør».** Blokken er blank og forseglet; kjerneprøven
  skyves ut og blottlegger et konstruert indre med en limegrønn kantlinje. Det er
  bokstavelig talt det vi selger: utsiden er blank, jobben er å vise innsiden.
- **Akt 2 — «Fire steg, kjente tider».** Fire plater glir inn i hulrommet, én om
  gangen, mens den limegrønne linjen vokser. Seksjonen gir bare mening fordi du
  har sett akt 1: der ble blokken åpnet, her fylles den. Fire plater, fire steg.

Akt 1 lå ferdig i `public/historie/hero-*` i tre oppløsninger, 10,5 MB, og
**ingen side refererte den** — `HeroFilm` importeres ikke av noen side.

## Funn 3: film bak en firekolonners tekstrad

Akt 2 ligger bak `ProcessSteps`, som er fire kolonner over hele bredden. Masken
hjelper ikke: kolonne 04 står lengst til høyre, altså midt i den delen masken
*skal* slippe filmen inn i. Målt «Lansering og drift»: **3,70:1**, under AA.

Å dempe filmen ville løst målingen ved å fjerne grunnen til at filmen er der.
Løsningen er den `ScrollHistorie` allerede bruker: gi teksten en ugjennomsiktig
flate, så filmen leses *rundt* teksten. Etter: **7,35:1**.

## Målt, før → etter

| | før | etter |
|---|---|---|
| Medieelementer på forsiden | 1 | 2 |
| Lengste strekning uten media | 8,6 skjermer | **5,6 skjermer** |
| Delt film med `/systemer` | ja | nei |
| Skjult andel av motivet | 85 % (tre seksjoner) | 46 % |
| Synlig bildebredde | 31 % | **100 %** |
| Poenget vises ved | 100 % av klippet (0 % synlig) | **53 % (100 % synlig)** |
| Kontrast, akt 1 | — | 7,04:1 |
| Kontrast, akt 2 | 3,70:1 | **7,35:1** |
| Lighthouse mobil / skrivebord | — | 99 / 100, CLS 0 |

## To målefeil jeg gjorde

**Jeg målte tekstboksen, ikke blekket.** Første kontrastmåling ga 3,16:1 på en
`.faint`-linje. Men boksen er 1056 px bred mens teksten er én kort linje — resten
er tom flate der filmen skinner gjennom. Jeg målte filmens lyshet der det ikke
sto tekst. Verktøyet tar nå to skudd, ett med og ett uten tekst, og måler bare der
differansen viser glyffer. Samme tekst: **4,84:1**, altså bestått hele tiden.

**Jeg ga `clip` feil nøkler** (`w`/`h` i stedet for `width`/`height`), og senere
`querySelector` i entall da forsiden fikk to filmrammer — da ble akt 2 stille
utelatt fra kontrastrapporten og så ut til å være i orden.

## Utenfor det jeg eide

- `public/historie/hero-*.mp4` (10,5 MB) er fortsatt ureferert. Akt 1 er laget fra
  `assets/mastere/hero-master.mp4`, så filene kan slettes.
- `Nokkeltall` gir `color-contrast`-brudd i Lighthouse på skrivebord (97 mot 100).
  Seksjonen ligger ikke bak film; komponenten ble skrevet om i dag av en annen.
- `systemer.astro` hadde en tom `<style>`-blokk med bare en krøllparentes igjen
  etter at den døde maskeregelen ble fjernet. Den brakk hele bygget
  (`Unexpected token Ident`). Fjernet.
