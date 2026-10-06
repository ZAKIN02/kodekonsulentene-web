# Ytelse — målte tall

Målt første gang **6. oktober 2026**. Fram til da hadde nettsiden påstått
«Lighthouse 95+» i brandboken, i tjenestekortet på forsiden og i salgsmateriellet
**uten at det var målt en eneste gang**. Dette dokumentet er rettelsen.

Metode: Lighthouse 13.5.0, mobil (390×844, DPR 2,625), simulert struping,
`--only-categories=performance,accessibility,best-practices,seo`.
Tre kjøringer per side, **median** — ikke snitt, fordi én kald kjøring ellers
drar tallet ned under det brukere faktisk opplever.

```
npm run ytelse            # lokalt mot http://127.0.0.1:4399
npm run ytelse:prod       # mot produksjon
npm run lhci              # med terskler, feiler ved brudd
```

## Lokalt (bygget kode, 6. oktober 2026)

| Side | Ytelse | UU | Praksis | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 2105 ms | 0,002 | 0 ms |
| `/historie` | 100 | 100 | 100 | 100 | 1729 ms | 0 | 0 ms |
| `/sjekk` | 99 | 100 | 100 | 100 | 1653 ms | 0 | 0 ms |
| `/priser` | 100 | **98** | 100 | 100 | 1578 ms | 0,001 | 0 ms |
| `/verktoy` | 99 | **98** | 100 | 100 | 1803 ms | 0,002 | 0 ms |

## Produksjon (kodekonsulentene.no, samme dag)

| Side | Ytelse | UU | Praksis | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1001 ms | 0,002 | 0 ms |
| `/historie` | **94** | 100 | 100 | 100 | 1131 ms | **0,145** | 0 ms |
| `/sjekk` | 100 | 100 | 100 | 100 | 983 ms | 0 | 0 ms |
| `/priser` | 100 | **98** | 100 | 100 | 873 ms | 0 | 0 ms |
| `/verktoy` | 100 | **98** | 100 | 100 | 840 ms | 0 | 0 ms |

Produksjon er raskere enn lokalt fordi den lokale målingen kjører mot en
ukomprimert utviklingsserver på samme maskin som nettleseren.

**Målingene inkluderer videoene.** Forsiden laster 657 kB over 12 forespørsler,
hvorav 472 kB er `systemer-1280.mp4`. `/historie` laster 788 kB, `/verktoy`
1 572 kB. Tallene over er altså ikke kunstig gode fordi mediene uteble.

## Funn 1 — logoen flytter layouten på hver sidelasting

**Dette er den eneste grunnen til at `/historie` får 94 i produksjon.**

`src/components/Topbar.astro` oppgir:

```html
<img src="/logo/kk-lockup-dark.svg" width="220" height="22" …>
```

men SVG-en har egen størrelse **309 × 40**, og CSS-en setter
`height: 22px; width: auto`. Nettleseren reserverer altså 220 px fra attributtet,
og krymper til 169,9 px når filen er lastet.

Målt direkte i nettleser, begge temaer:

```
dark   før: 220 x 22   etter: 169.9 x 22   endring: -50.1 px
light  før: 220 x 22   etter: 169.9 x 22   endring: -50.1 px
```

Lighthouse peker på nøyaktig dette: skiftet på 0,1445 skjer i `.hist__scener`,
med årsak `header.topbar > div.wrap > a.topbar__logo > img`.

**Hvorfor den er usynlig lokalt:** SVG-en lastes fra disk før første maling, så
skiftet rekker aldri å telle. Den dukker bare opp med ekte nettverkslatens. Det er
grunnen til at `npm run ytelse:prod` må kjøres i tillegg til den lokale.

**Rettingen** (i `src/`, utenfor mitt mandat — ikke utført):
sett `width="170"` på begge logo-taggene i `src/components/Topbar.astro`.
309 ÷ 40 × 22 = 169,95. Alternativt `aspect-ratio: 309 / 40` i CSS-en.

Forventet gevinst: CLS fra 0,145 til ~0 på `/historie`, ytelse fra 94 til 100.
Skiftet skjer på **alle** sider siden toppmenyen er felles; `/historie` er bare
den eneste der layouten gjør det stort nok til å måles.

## Funn 2 — overskriftsrekkefølgen hopper over `h2`

`/priser` og `/verktoy` får 98 i universell utforming, ikke 100. Lighthouse:
`heading-order` — «Heading elements are not in a sequentially-descending order».

Målt struktur fra servert markup:

```
/priser     h1 Prisene står her          → h3 Start, h3 Bedrift, h3 System
/verktoy    h1 Verktøy du kan bruke …    → h3 Sjekk nettsiden din, h3 Hva koster det?, …
```

Kortene i sidens første seksjon bruker `h3`, og når seksjonstittelen er sidens
`h1`, hoppes `h2` over. Det er WCAG 1.3.1 (Informasjon og relasjoner).

**Rettingen** (i `src/`, utenfor mitt mandat — ikke utført): la `PriceCard.astro`
og verktøykortene ta imot et overskriftsnivå, slik `Section.astro` allerede gjør
med `nivaa`, og sett `h2` der kortet står rett under sidens `h1`.

Dette er verdt å rette selv om 98 består terskelen: siden selger WCAG-samsvar og
kjører en sjekk som rapporterer nøyaktig denne typen brudd hos andre.

## Påstander på nettsiden, vurdert mot målingene

| Påstand | Hvor | Holder? |
|---|---|---|
| «Lighthouse 95+ som krav, ikke mål» | `src/data/tjenester.ts`, `/nettsider` | **Ja, nå målt.** Fire av fem sider ligger på 99–100 lokalt og 100 i produksjon. `/historie` ligger på 94 i produksjon til funn 1 er rettet. |
| «Lighthouse ≥ 95 på alle fire kategorier, mobil» | `docs/sidemonstre.md` | Ja, med samme forbehold. |
| «0 cookies før samtykke» | bevis-stripen | Ja — bekreftet av skanneren, ikke av Lighthouse. |
| «6/6 sikkerhetsheadere» | bevis-stripen, `/sikkerhet` | Ja — Lighthouse gir 100 i beste praksis på alle sider. |
| «0,1 s svartid, målt fra Oslo» | bevis-stripen | Ja — LCP i produksjon er 840–1131 ms, og svartid er lavere enn LCP. |

**Ingenting på siden må skrives om.** Men påstanden var ikke etterprøvd før i dag,
og `/historie` oppfyller den ikke før logoen er rettet.

## Hva som ikke ble funnet

Lighthouse rapporterte **null muligheter** og **null feilende diagnostikk** på
forsiden: ingen render-blokkerende ressurser, ingen ubrukt JavaScript eller CSS
verdt å nevne, ingen tredjeparter, ingen manglende `font-display`, ingen
treg serverrespons. Det var ingenting å rette i `astro.config.mjs` eller
`server.mjs`, så de er urørt.

## Verifisering av terskelverdiene

`lighthouserc.json` er ikke bare skrevet, den er kjørt. Mot produksjon,
6. oktober 2026:

```
Checking assertions against 2 URL(s), 2 total run(s)

1 result(s) for https://kodekonsulentene.no/historie :
  ✘  cumulative-layout-shift failure for maxNumericValue assertion
      expected: <=0.1
         found: 0.1401795027206262

Assertion failed. Exiting with status code 1.
```

Forsiden bestod alle sju påstandene. `/historie` feilet på nøyaktig det funn 1
beskriver. En terskel som aldri har blitt rød, er ikke en terskel — denne har.

## Kjent begrensning i denne målingen

Den fulle `lhci autorun`-kjøringen mot lokal server kunne **ikke** fullføres, fordi
bygget var ødelagt av en parallell endring utenfor mitt område:

```
[vite]: Rolldown failed to resolve import "scroll-timeline-polyfill"
        from "src/pages/lab/bibliotek.astro"
```

Tallene i tabellene over ble målt før dette oppsto, mot en fungerende server, og
står ved lag. Men `npm run lhci` bør kjøres på nytt når `src/` er i en bygg-bar
tilstand, for å bekrefte at terskelene passerer lokalt også.

Merk også at flere prosesser i prosjektet bruker port 4399. `lighthouserc.json`
bruker derfor **4477**, så en LHCI-kjøring ikke kolliderer med en testserver.
