# Ytelsesmåling etter dagens omlegging

Målt 6. oktober 2026, etter ni videoer, fire diagrammer, åtte skjermopptak,
tre artikler og ny forside-dramaturgi. 26 ruter, begge profiler, lokalt og
mot produksjon.

Verktøy: `.skudd/ytelse2-lh.mjs` (Lighthouse), `.skudd/ytelse2-uu.mjs`
(tilgjengelighet i satt tilstand), `.skudd/ytelse2-byte.mjs` (byte før/etter
scroll), `.skudd/ytelse2-avstand.mjs` (piksler fra folden til hver film),
`.skudd/ytelse2-overskrifter.mjs` (overskriftsrekkefølge),
`.skudd/ytelse2-foreldreloes.mjs` (ubrukte filer).

## Kortsvaret

**Ingen side bryter 95-løftet.** Ytelse er 99–100 på mobil og 100 på skrivebord,
CLS er 0 overalt, TBT er 0 overalt. Beste praksis og SEO er 100 på alle 26 ruter
i begge profiler.

Målingene er stabile: `/om` kjørt tre ganger ga 99/96/100/100 hver gang, med LCP
innenfor 12 ms.

## Full tabell, lokalt

Y = ytelse, U = tilgjengelighet, B = beste praksis, S = SEO.

| Side | Mobil Y/U/B/S | Skrivebord Y/U/B/S | Mobil kB | Skrivebord kB |
|---|---|---|---|---|
| `/` | 99/100/100/100 | 100/100/100/100 | 159 | 1940 |
| `/apper-og-ai` | 99/100/100/100 | 100/100/100/100 | 773 | 2763 |
| `/artikler/35-wcag-krav` | 100/100/100/100 | 100/100/100/100 | 123 | 123 |
| `/artikler/cookies-for-samtykke` | 100/100/100/100 | 100/100/100/100 | 124 | 123 |
| `/artikler/orgnr-pa-nettsiden` | 100/100/100/100 | 100/100/100/100 | 123 | 123 |
| `/bransjer/handverkere` | 100/97/100/100 | 100/100/100/100 | 135 | 135 |
| `/bransjer/klinikker` | 100/100/100/100 | 100/97/100/100 | 758 | 1276 |
| `/caser` | 100/97/100/100 | 100/97/100/100 | 798 | 1301 |
| `/handbok` | 100/97/100/100 | 100/100/100/100 | 138 | 138 |
| `/historie` | 100/100/100/100 | 100/96/100/100 | 1892 | 4200 |
| `/kontakt` | 99/100/100/100 | 100/97/100/100 | 773 | 1176 |
| `/nettsider` | 99/95/100/100 | 100/99/100/100 | 1196 | 2200 |
| `/om` | 99/96/100/100 | 100/96/100/100 | 2183 | 4229 |
| `/personvern` | 100/100/100/100 | 100/100/100/100 | 121 | 121 |
| `/priser` | 99/95/100/100 | 100/98/100/100 | 139 | 139 |
| `/sikkerhet` | 99/100/100/100 | 100/97/100/100 | 1266 | 1670 |
| `/sjekk` | 99/95/100/100 | 100/99/100/100 | 378 | 1593 |
| `/status` | 100/100/100/100 | 100/100/100/100 | 799 | 1329 |
| `/systemer` | 99/97/100/100 | 100/97/100/100 | 148 | 148 |
| `/terminal` | 100/100/100/100 | 100/100/100/100 | 121 | 121 |
| `/verktoy` | 100/96/100/100 | 100/96/100/100 | 169 | 169 |
| `/verktoy/cookie-sjekk` | 99/97/100/100 | 100/97/100/100 | 166 | 788 |
| `/verktoy/dmarc` | 99/95/100/100 | 100/99/100/100 | 167 | 167 |
| `/verktoy/priskalkulator` | 99/100/100/100 | 100/100/100/100 | 171 | 171 |
| `/verktoy/uu-sjekk` | 100/97/100/100 | 100/97/100/100 | 165 | 1640 |
| `/vilkar` | 100/100/100/100 | 100/100/100/100 | 122 | 122 |

Produksjon, stikkprøve: `/` 100/100/100/100, `/om` 100/96, `/historie` 100/100
mobil og 100/96 skrivebord, `/sjekk` 100/95 mobil og 100/99 skrivebord. Samme
bilde som lokalt.

## Tilgjengelighetstallene under 100 er målefeil

Lighthouse rapporterer `color-contrast` på 16 ruter. Fargene den oppgir er ikke
tokenverdier: `#2a2e34` på 1,4:1, `#32373c` på 1,59, `#535a63` på 2,66. Det er
mellomverdier fra `Avslor`-inntoningen, lest mens elementet er halvveis inne.

Målt på nytt med `prefers-reduced-motion`, der alt hopper til sluttverdien, i
begge temaer: **null brudd** på `/priser`, `/sjekk`, `/verktoy`, `/om`,
`/verktoy/dmarc` og `/nettsider` — både lokalt og i produksjon.

Det er samme falske positiv som er dokumentert tidligere. Den koster poeng i
Lighthouse, men ingen bruker ser den.

## De tre tyngste funnene

### 1. `/om` laster 2 MB film før brukeren har scrollet

Målt på mobil, 390 px, uten å scrolle i det hele tatt:

| Side | Før scroll | derav film | Etter scroll | Totalt |
|---|---|---|---|---|
| `/om` | **2155 kB** | **1999 kB** | +0 | 2155 kB |
| `/historie` | 1868 kB | 1743 kB | +0 | 1868 kB |
| `/sikkerhet` | 1240 kB | 1093 kB | +886 | 2126 kB |
| `/nettsider` | 1170 kB | 1045 kB | +1605 | 2775 kB |
| `/apper-og-ai` | 747 kB | 618 kB | +11 | 758 kB |
| `/` | 135 kB | **0 kB** | +1734 | 1870 kB |
| `/verktoy/uu-sjekk` | 139 kB | **0 kB** | +747 | 887 kB |

**60 %-grensen er ikke brutt — den virker.** Målt avstand fra folden til hver
film, med vindu 844 px og 506 px margin:

```
/om            Demo        -433px  (over folden)   flyt-960.mp4
/om            Demo        -134px  (over folden)   lev-om-960.mp4
/sikkerhet     Demo        -377px  (over folden)   terminal-960.mp4
/apper-og-ai   SceneFilm   -194px  (over folden)   apper-960.mp4
/historie      ScrollHist. -411px  (over folden)   historie-1280.mp4
/nettsider     Demo        +205px  (innenfor 506)  lagstabel-960.mp4
/nettsider     SceneFilm   +646px  (utenfor)       lastes ikke
/sikkerhet     SceneFilm  +1691px  (utenfor)       lastes ikke
```

Negative tall betyr at filmen er synlig uten å scrolle. Bekreftet visuelt i
`.skudd/ytelse2-fold.png`: på `/om` ligger opptaket rett under ingressen, med et
nytt like under.

Dette er altså ikke en feil i lastemekanikken, men en **plasseringsavgjørelse**.
Forsiden viser hvordan det kan gjøres: 0 kB film før scroll, 1734 kB etter.

Flyttes de to opptakene på `/om` ned under folden, faller førstelast fra
2155 kB til rundt 156 kB. Det er det største enkelttiltaket på nettstedet.

**`ScrollHistorie` står fortsatt på `rootMargin: "200% 0px"`** mens `SceneFilm`
og `Demo` er satt til 60 %. Den bør sannsynligvis følge etter — men filmen på
`/historie` ligger uansett over folden, så det alene løser ikke den siden.

### 2. Fire sider hopper fra `h1` til `h3`

Lest rett ut av bygget HTML, altså uavhengig av animasjon:

```
/nettsider        h1 -> h3   (2. overskrift)
/priser           h1 -> h3
/sjekk            h1 -> h3
/verktoy/dmarc    h1 -> h3
```

Begge komponentene har allerede propen. Rettingen er ett attributt per kallsted:

- `src/pages/nettsider.astro:51`      `<Snitt snitt={snitt.nettside} nivaa={2} />`
- `src/pages/sjekk.astro:79`          `<Snitt snitt={snitt.sjekk} nivaa={2} />`
- `src/pages/verktoy/dmarc.astro:33`  `<Snitt snitt={snitt.epost} nivaa={2} />`
- `src/pages/priser.astro:32`         `<PriceCard … nivaa={2} />`

`Snitt.astro:36` og `PriceCard.astro:22` har begge `nivaa = 3` som standard.
`PriceCard` har allerede fått overskriftsstilen flyttet til en klasse, så
`nivaa={2}` endrer ikke utseendet.

Dette er WCAG 1.3.1 og er en ekte feil, ikke en målefeil.

### 3. 6,9 MB foreldreløse filer

| Fil | Størrelse | Master |
|---|---|---|
| `public/scener/bransje-sortering-{1920,960}.mp4` + plakat | 3938 kB | **finnes** |
| `public/scener/verktoy-sjekk-{1920,960}.mp4` + plakat | 2837 kB | **finnes** |
| `public/bilder/reg-{naer,plan,gjennomlyst}-{1600,800}.avif` | 133 kB | nei |
| `public/historie/historie-poster.avif` | 23 kB | duplikat |
| `public/logo/kk-app-icon-1024.png` | 6 kB | nei |
| `public/favicon-32.png` | 1 kB | nei |

**`verktoy-sjekk` HAR master** (`assets/mastere/verktoy-sjekk-master.mp4`,
2,7 MB). En tidligere notat sa at den manglet, og at sletting derfor var
irreversibel. Det stemmer ikke — begge de tunge settene kan gjenskapes gratis
med `.skudd/reramme.mjs`.

`historie-poster.avif` er byte-identisk med `poster.avif` (begge 23 411 B).
`ScrollHistorie` bruker `poster.avif`; den andre er en rest.

**To funn i min egen skanning var falske positiver:** `icon-192.png` og
`icon-maskable-512.png` er referert fra `manifest.webmanifest`, som skanningen
hoppet over fordi den bare leste `.html`, `.js` og `.json`. De må ikke slettes.

## Cache-headere — endret

`server.mjs` ga alt utenom `_astro/` og `fonts/` én times buffer. Det ble satt
mens materialet var under arbeid.

Mediefilnavnene er **ikke innholds-hashede** — `hist2-steg-1920.mp4` beholder
navnet sitt når klippet regenereres, og det skjedde flere ganger i dag. Derfor
kan de ikke bli `immutable`: et rettet klipp ville ligget gammelt i et år hos
alle som hadde sett det.

Satt til `max-age=86400, stale-while-revalidate=604800`. Nettleseren viser den
bufrede fila med en gang i et døgn, henter ny i bakgrunnen i en uke, og ETag
fanger endringen. Verifisert: 304 på `If-None-Match`, 206 med `accept-ranges`
på Range-forespørsel, så scroll-spoling er uberørt.

Den egentlige løsningen er innholds-hashede mediefilnavn. Da kan de bli
`immutable`, og det ligger i rørledningen, ikke i serveren.

## Ikke rørt

Alt under `src/` — fem agenter arbeidet der samtidig. Overskriftsrettingene og
flyttingen av opptakene på `/om` er beskrevet, ikke utført.

*Etterkontroll:* En parallell agent committet en språkvask (`eab7d3c`) etter at
tabellen over ble målt. Funnene er verifisert på nytt mot det nye bygget:
overskriftshoppene står uendret på de samme fire sidene, og `/om` 99/96,
`/sjekk` 99/95 og `/` 99/100 er identiske med før.
