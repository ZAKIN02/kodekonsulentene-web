# Synrapport, runde 3 — 6. oktober 2026

Alle 22 sider målt på 1512 og 390 px i **mørkt tema**, som er det kunden ser på
skjermbildene sine. Verktøy: `.skudd/syn3.mjs`. Bilder i `.skudd/syn3/`.

Seks agenter skrev i sidefilene mens dette ble målt. Hvert tall er derfor målt to
ganger mot to ferske bygg, og **fire funn er forkastet som mine egne målefeil** nederst.
Den listen er like viktig som funnlisten.

---

## Metoden måtte skiftes ut først

`.skudd/maal-tomrom.mjs` meldte «ingen bånd over 300 px» på nettopp de sidene kunden
hadde sendt skjermbilder av. Den regnet enhver beholder med tekst i seg som fylt, så en
`<section>` på 900 px med 200 px innhold telte som full.

Første forsøk på å rette det — måle tekst via `Range.getClientRects()` og medier via
`getBoundingClientRect()` — undervurderte også, fordi en seksjon med bakgrunnsfarge
teller som blekk i DOM-en selv om flaten er helt tom å se på.

**Fasiten er pikslene.** `syn3.mjs` tar et visningsbilde ved hver scrollposisjon og
regner en rad som tom når ≥ 99,5 % av pikslene ligger innenfor liten avstand fra sidens
hyppigste farge. Den tåler avbrudd på inntil 6 px, fordi en hårlinje ikke deler en tom
flate for øyet — uten den toleransen ble 435 px tomrom på forsiden rapportert som to
biter på 155 og 105.

---

## ØDELAGT

### 1. `/bransjer/klinikker` peker på film som ikke finnes (målt 12:41)

```
/scener/lev2-klinikk-1280.mp4   404
videoelementet: readyState 0, seekable.end(0) = 0
```

Markupen er koblet inn før filen er generert. **Dette er sjette gang mønsteret
gjentar seg** — `/nettsider` og `/priser` i runde 1, `/apper-og-ai`,
`/bransjer/handverkere` og `/bransjer/klinikker` i runde 2, og nå igjen. En agent
arbeider med det nå, så det kan være løst når du leser dette. Lander agenten ikke,
går en 404 i produksjon.

---

## FALSK BEVEGELSE

Dette er den presise forklaringen på at siden kjennes statisk **selv der det ligger
video**. Målt som gjennomsnittlig kanalavvik mellom rammer ved 0, 25, 50, 75 og 100 %.

### 2. Forsidens to nye historieklipp er frosne i andre halvdel

| Klipp | Varighet | Endring per kvartal | Slutt mot start |
|---|---|---|---|
| `hist2-apne-1280` | 14 s | 2,6 · 3 · **1** · **0** | 4,8 |
| `hist2-steg-1280` | 14,5 s | 7,6 · 3,8 · **0,4** · **0,1** | 6,8 |

Sett etter i `.skudd/syn3/hist2-steg.png`: ramme 3, 4 og 5 er praktisk talt like.
Bevegelsen er ferdig halvveis. På et scroll-spolt klipp betyr det at **halve
scrollstrekningen ikke gir noe tilbake** — brukeren drar og drar, og bildet står.

Dette er nøyaktig samme defekt som runde 2 fant på `/verktoy`-klippet. Det klippet er
nå beskåret fra 8 til 3,6 s, så feilen er kjent og rettet ett sted — men gjeninnført
i de to nyeste klippene.

### 3. `bransje-sortering` ender der den begynte

16,1 s, jevn endring gjennom hele (3,7 · 3,2 · 3,2 · 2,7) — men **slutt mot start er
1,7**, altså praktisk talt samme bilde. Varigheten er dobbelt av de andres 8 s.

Det er ping-pong. Samme defekt som hero-klippet hadde i runde 2, og samme begrunnelse
gjelder: scroll-spoling reverserer av seg selv når brukeren scroller opp, så reversen
i fila er bortkastede byte som i tillegg tar tilbake avsløringen.

### 4. Skjermopptakene bruker én fjerdedel av tiden sin

| Opptak | Endring per kvartal |
|---|---|
| `uu-sjekk-1280` | 0,6 · **27,5** · 6,3 · 5,5 |
| `cookie-sjekk-1280` | 0,7 · **34,9** · 0,2 · 0,5 |
| `verktoy-1920` | 1,5 · 0,9 · **12,4** · 0,2 |

Resultatet dukker opp i ett sprang, og resten av klippet står. Opptakene er ekte og
innholdet er riktig — men tre av fire kvartaler er stillbilde.

---

## TOMT

### 5. Tomme bånd på skrivebord, 1512 px

Stabilt over to kjøringer mot to ferske bygg. Sortert etter størrelse.

| Side | Største tomme bånd | Hvor |
|---|---|---|
| `/nettsider` | **415 px** | scroll 2700 |
| `/status` | **413 px** | scroll 4050 |
| `/handbok` | 359 px | scroll 5850 |
| `/bransjer/handverkere` | 357 px | scroll 4950 |
| `/verktoy/dmarc` | 337 px | scroll 2250 |
| `/kontakt` | 332 px | scroll 900 |
| `/verktoy/uu-sjekk` | 330 px | scroll 2250 |
| `/apper-og-ai` | 326 px | scroll 2250 |
| `/verktoy/cookie-sjekk` | 321 px | scroll 2250 |
| `/systemer` | 299 px | scroll 2700 |
| `/caser` | 282 px | scroll 3150 |
| `/priser` | 276 px | scroll 2250 |
| `/` | 270 px | scroll 3150 |
| `/sikkerhet` | 253 px | scroll 3150 |

**Rene:** `/om`, `/sjekk`, `/historie`, `/verktoy`, `/verktoy/priskalkulator`,
`/personvern`, `/vilkar`.

Et bånd på 400 px er nesten halve skjermhøyden. `.skudd/syn3/forside-steg.png` viser
hvordan det ser ut på forsiden: de fire prosesstegene slutter 465 px ned, og under dem
er det én hårlinje og en nedtonet etikett før neste seksjon.

### 6. Bunnen av hvert vindu er alltid nedtonet

Målt på forsiden ved scroll 3900, etter 2,5 sekunder i ro:

```
«// 07 PRISER»                              opacity 0,60   (y 730)
«Fordi du skal kunne regne på det …»        opacity 0,38   (y 776)
```

`animation-timeline: view()` når full styrke først når elementet er godt oppe på
skjermen. Følgen er at innhold i nedre fjerdedel står permanent nedtonet så lenge
brukeren står stille. Det er ikke en feil i seg selv, men det **forsterker** de tomme
båndene: flaten under er tom, og det lille som er der er halvgjennomsiktig.

### 7. Mobil er klart bedre enn på skrivebord

Bare fem sider har bånd over 240 px, og det største er 308 px:

| Side | Største bånd |
|---|---|
| `/status` | 308 px |
| `/caser` | 286 px |
| `/bransjer/handverkere` | 284 px |
| `/handbok` | 269 px |
| `/apper-og-ai` | 268 px |

**Runde 2 sine døde felt på 415–496 px fra `Horisont` er borte.** Det er verifisert,
ikke antatt — komponenten regner nå høyden fra målt vannrett vei.

---

## STILLESTÅENDE

### 8. Fire sider har nesten ingen bevegelse

Antall elementer med `animationName !== "none"` etter et helt gjennomløp. (Merk:
`animationTimeline` leser `auto` selv når `view()` er satt og kan ikke brukes.)

| Side | Animerte | Høyde | Video |
|---|---|---|---|
| `/caser` | **3** | 5111 px | 0 |
| `/sjekk` | **1** | 3032 px | 1 |
| `/kontakt` | 5 | 2547 px | 0 |
| `/handbok` | 15 | 8277 px | 0 |
| `/om` | 16 | 4628 px | 0 |
| `/status` | 18 | 5533 px | 0 |
| — til sammenligning — | | | |
| `/` | 74 | 9169 px | 2 |
| `/bransjer/handverkere` | 50 | 7697 px | 1 |

`/caser` er den dødeste siden vi har: **tre animerte elementer over fem skjermhøyder**,
og ingen film. `/sjekk` er verre i forhold til hva den skal gjøre — den er
leadmagneten, og har ett animert element.

`/caser`, `/om`, `/handbok` og `/status` er sidene en agent arbeider med akkurat nå.

---

## SER BRA UT — verifisert, ikke antatt

- **All video spoler**, unntatt `klinikker` som 404-er. `readyState 4` og
  `seekable.end(0)` lik varigheten på alle elleve andre klipp. Range-støtten virker.
- **`/verktoy`-klippet er beskåret** fra 8 til 3,6 s. Runde 2 sitt funn om at de siste
  40 % sto stille er rettet.
- **Demo-opptakene laster og spoler** på alle fem verktøysider, med `data-stor` i bruk.
- **Mobil har ingen vannrett overflyt** og langt mindre tomrom enn skrivebord.
- **`/om` er ren** på begge bredder, etter at bildet kom inn.

---

## Fire funn forkastet som mine egne målefeil

**1. «Ingen tomme bånd noe sted.»** Det var premisset i oppdraget mitt, og det kom fra
et verktøy som teller beholdere. Både den og min egen første DOM-baserte erstatning
undervurderte. Pikselmåling var eneste vei.

**2. «`/om` har 875 px tomt øverst, `/kontakt` 900 px.»** Begge forsvant ved ny måling:
`/om` ga 108 px, `/kontakt` 332 px. `/kontakt` svarte HTTP 500 — serveren min startet
12:24:50, og en parallell agent bygde `dist/server/entry.mjs` om 12:30. `/kontakt` er
den eneste serverrendrede siden, så bare den rammes. Kjent artefakt fra runde 1 og 2.

**3. «`/bransjer/klinikker` har 875 px tomt øverst.»** Nøyaktig samme signatur som `/om`
hadde i forrige kjøring — 875 px fra y 25. Målt om to ganger: 211 px begge ganger. Når
det samme tallet flytter seg mellom sider fra kjøring til kjøring, følger det agentene
som skriver, ikke sidene.

**4. «Alle fem verktøysider har video som ikke spoler, og CSP blokkerer et inline-skript
på `/verktoy/dmarc`.»** Begge var stale server. Hashene høstes én gang ved oppstart;
`dist/client/verktoy/dmarc/index.html` ble skrevet 12:39:53, serveren min startet
12:40:01 etter nytt bygg — og da: null CSP-brudd, og alle Demo-videoene på
`readyState 4` med 6–9 sekunder spolbart. Filene svarte 200 hele tiden.

---

## Metode

```
node .skudd/syn3.mjs tomrom    <base> <bredde> [sider...]
node .skudd/syn3.mjs bevegelse <base> <bredde> [sider...]
node .skudd/syn3.mjs film      <base> [sider...]
node .skudd/klipp-endring.mjs                      # endring per kvartal i hvert klipp
node .skudd/rammer.mjs <url> <filnavn> <ut.png>    # fem rammer side om side
```

Serveren kjører som `.skudd/syn3srv.mjs` — en kopi av `server.mjs` med stiene justert,
slik at andre agenters `pkill -f server.mjs` ikke dreper den.

**Bygg alltid på nytt og start serveren etterpå før du måler.** Tre av de fire
forkastede funnene over skyldtes at det ikke var gjort.
