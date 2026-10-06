# Tomme flater under seksjoner — årsak og retting

6. oktober 2026. Kunden sendte skjermbilder der omtrent en halv skjerm sto tom under
en seksjon. Dette er målingen, årsaken og hva som ble gjort.

Verktøy: `.skudd/syn3.mjs tomrom` (finner hvor), `.skudd/maal-tomt.mjs` (svarer på
hvorfor), `.skudd/tomt-degradering.mjs` (verifiserer at det degraderer riktig).

---

## Årsaken, målt

På `/nettsider` ved scroll 3150, 1512 × 900:

```
scene over:   720 px høy, 391 px innhold, min-height 720 px, padding 96/96, align center
scene under:  720 px høy, 290 px innhold, min-height 720 px, padding 96/96, align center
```

`min-height: 80svh` ga 720 px. Med `box-sizing: border-box` spiser polstringen
96 + 96 av de 720, så innholdsboksen er 528 px. `align-items: center` deler slakken
likt over og under innholdet, og **to nabo-scener legger sine halvdeler sammen**:

```
165 px under innholdet i den ene
215 px over innholdet i den neste
= 380 px sammenhengende tomt, målt til 412 px med hårlinjen imellom
```

Nesten halve skjermhøyden, brutt bare av én hårlinje.

## Hvorfor minstehøyden var riktig knapp

Minstehøyden binder **bare korte scener**. En scene med mye innhold er allerede høyere
enn taket og merker ingen forskjell. Å senke den rammer altså nøyaktig de seksjonene
som lagde hullene, og lar luften på de innholdsrike stå urørt.

`min-height: 80svh` → `55svh`.

**Polstringen på 96 px står.** Den ble målt: å senke den til 64 px kjøpte bare 16–32 px,
og på `/status` og `/handbok` rørte den seg ikke i det hele tatt. Den luften er med
vilje, og den er ikke årsaken.

## Målt, før → etter (1512 px, største tomme bånd)

| Side | Før | Etter |
|---|---|---|
| `/nettsider` | 421 px | **ingen over 240** |
| `/status` | 415 px | 310 px |
| `/handbok` | 359 px | 246 px |
| `/bransjer/handverkere` | 347 px | 256 px |
| `/systemer` | 303 px | **ingen over 240** |
| `/sikkerhet` | 241 px | **ingen over 240** |

**Fjorten sider hadde bånd over 240 px. Nå fem.** Stabilt over to kjøringer mot
to ferske bygg.

Mobil (390 px) er praktisk talt uendret, som forventet: regelen gjelder fra 861 px,
og mobil hadde allerede langt mindre tomrom.

## Det som er igjen er en annen årsak

På de fem sidene som står igjen binder minstehøyden ikke lenger — scenene er høyere
enn den uansett, og flere er `scene--lav` med `min-height: 0`.

```
/apper-og-ai  scene 855 px, innhold 663 px, min 0      — hullet ligger etter Horisont-sporet
/status       scene 1005 px, innhold 813 px, min 495   — ingen intern slakk; ren scenepolstring
/caser        scene 1673 px, innhold 1481 px, min 0    — sparsomt innhold i en lang scene
```

Det som gjenstår er 96 + 96 px polstring mellom to scener, pluss litt margin fra
innholdet. 192 px mellom to hovedseksjoner på en 900 px skjerm, med en hårlinje som
markerer skillet, er den rolige negative plassen merkevaren ber om — ikke en feil.

Vil man lenger ned, ligger grepene i sidene og i `Horisont`, ikke i `scener.css`.

---

## Bunnen av vinduet var permanent nedtonet

Målt på forsiden ved scroll 3900, etter 2,5 sekunder i ro — altså mens brukeren sto
helt stille:

```
«// 07 PRISER»                        opacity 0,60
«Fordi du skal kunne regne på det …»  opacity 0,38
```

`animation-range` sluttet på `cover 32%`. Cover-fasen er lang, og 32 % av den nås
først når elementet er godt oppe på skjermen. Følgen var at nedre fjerdedel sto
permanent halvgjennomsiktig. Det **forsterket** de tomme båndene: flaten under var
tom, og det lille som sto der var nedtonet.

Sluttpunktet er nå `entry 80%` + trappen, altså omtrent «ferdig inne i vinduet».
Målt etter: **0,38 → 1,00**.

Trappen beholdes på både start og slutt, men med 5 % på slutten, så trinn 4 lander på
`entry 100 %` og ingenting kan bli stående halvsynlig.

## Degradering, verifisert

| | halvsynlige avdekkinger i synsranden |
|---|---|
| Chromium, normalt | 0–3, alle midt på vei inn |
| **Redusert bevegelse** | **0 på alle sider** |
| **Uten JavaScript** | 0–3, samme som normalt |
| **Firefox** (mangler `view()`) | 0–1, midt i en 420 ms overgang |

Degraderingen går mot synlig. Ingenting blir stående borte.

Bygget er sjekket for minifier-fellen: eneste treff på `animation:` med `view()` er
`/lab/bibliotek`, som har mønsteret med vilje. Min egen regel shipper med langformene
og trappen intakt:

```css
animation-range: entry calc(8% + min(var(--trinn,0), 4) * 6%)
                 entry calc(80% + min(var(--trinn,0), 4) * 5%)
```

## Merknad

Kommentaren øverst i `scener.css` sier at fila «lastes bare av index.astro». Det
stemmer ikke lenger — 20 sider importerer den. Endringene her slår derfor inn på hele
nettstedet, ikke bare forsiden.
