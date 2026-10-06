# Visuell kvalitetssikring

Denne pakken finnes fordi vi har sendt ødelagte sider til produksjon med **alle
tester grønne**. Logikktestene i `test/` sjekker at funksjoner regner riktig og at
markup inneholder det den skal. Ingen av dem kan se at et skript ble blokkert, at
en video ikke kan spoles, eller at tekst er uleselig mot bakgrunnen sin.

Det krever en ekte nettleser. Derfor denne.

```bash
npm run visuell        # headless Chrome mot lokalt bygg (bygger og starter selv)
npm run visuell:prod   # bare @overvaak-testene mot kodekonsulentene.no
npm run visuell:ui     # Playwright UI, for å se hva som skjer
node .skudd/negativtest.mjs   # beviser at kontrollene faktisk blir røde
```

## Hver test, og feilen den ville fanget

| Test | Feilen den vokter | Hva som faktisk skjedde |
|---|---|---|
| `ingen konsollfeil og ingen CSP-brudd` | **1. CSP blokkerte egen JavaScript** | Astro la små `<script type="module">` rett i HTML-en. CSP-en hadde ingen `unsafe-inline` og bare temaskriptets hash, så scroll-historien og temabryteren ble avvist. Siden lastet, 153 tester var grønne, og ingenting beveget seg. Et skript stoppet av CSP kaster ingenting – det bare uteblir. |
| `videoene er lastbare og spolbare` (`seekable.end(0) > 0`) | **2. Manglende HTTP Range** | Serveren svarte 200 med hele fila på en Range-forespørsel og sendte aldri `accept-ranges`. Nettleseren meldte da `seekable.end(0) === 0`, altså «kan ikke spoles», og all scroll-styring satte `currentTime` uten virkning. |
| `currentTime endrer seg når man scroller` | **2, og koblingen generelt** | Fanger både manglende Range, blokkert skript og en scroll-lytter som aldri ble festet. Krever minst tre ulike verdier gjennom siden. |
| `content-type og accept-ranges` | **3. Feil MIME-type** | `.mp4` ble servert som `application/octet-stream` fordi serveren ikke kjente filtypen. Nettlesere nekter å spille av medier med feil MIME-type. |
| `kontrast mot faktisk malte piksler` | **4. Slør bak tekst malte ingenting** | Sløret var et `position: static` div. Bildet over det hadde `opacity` under 1, og et element med opasitet males i samme fase som posisjonerte elementer – altså *over* det statiske div-et. Sløret lå under bildet. Kontrasten var 3,7:1 uten at noe feilet. Å sette sløret til knallrødt endret knapt en piksel; bare pikselmåling avslørte det. |
| `nøyaktig én h1 per side` | **5. Ingen h1 på undersidene** | `Section` rendret alltid sidetittelen som `h2`, så 15 av 16 sider sto helt uten `h1`. Både WCAG og SEO. |
| `axe: ingen WCAG A/AA-brudd` | Bredden | Fanger klassen av brudd ingen av oss leter etter manuelt. |
| `uten JavaScript` | Progressiv forbedring | Innhold og CTA skal ligge i HTML-en, ikke bygges av et skript. |
| `redusert bevegelse` | WCAG 2.3.3 / vestibulære plager | Ingen video skal spille, og plakaten skal stå. `/historie` skal falle til statisk modus. |

## Hvorfor kontrasten måles i piksler

To fallgruver, begge påført oss selv, og begge innbakt i `tests/hjelpere.ts`:

1. **`boundingBox()` er viewport-relativ, `page.screenshot({clip})` bruker
   sidekoordinater.** Blandes de, klippes feil område ut, og målingen gir samme svar
   uansett hva CSS-en sier. Jeg endret CSS tre ganger og fikk 4,07:1 hver gang, før
   jeg forsto at det var målemetoden som var feil. Derfor brukes *elementskudd*
   (`locator.screenshot()`), aldri `clip`.

2. **Beregnede stilverdier lyver ikke, men de forteller ikke hele sannheten.**
   Et slør kan være til stede i DOM-en, ha riktig `background`, riktige mål – og
   likevel ikke male noe synlig, fordi malerekkefølgen setter det bak et annet lag.
   Derfor skjules teksten, bakgrunnen fotograferes, og den **verste** pikselen i
   tekstområdet avgjør.

## Negativ kontroll

`node .skudd/negativtest.mjs` starter fire bevisst ødelagte servere og kontrollerer
at nettleseren gir nøyaktig det signalet testene leter etter. Den rører ingen filer
i repoet.

Siste kjøring:

```
FANGET  manglende HTTP Range → seekbarTil === 0
FANGET  med HTTP Range → seekbarTil > 0
FANGET  feil MIME-type → ikke video/mp4
FANGET  CSP uten hash → inline-skript blokkert
```

Kjør denne når du har endret `server.mjs` eller `sikkerhet.mjs`. Blir en av dem
`BOMMET`, er testen som bygger på signalet blitt tannløs.

## Overvåkning av produksjon

`.github/workflows/overvaak.yml` kjører `@overvaak`-testene mot
`https://kodekonsulentene.no` på minutt 17 og 47 hver time – 48 ganger i døgnet.

Minutt 17 og 47, ikke 0 og 30, fordi GitHub selv skriver at starten av hver time er
et høylastvindu og at køede jobber kan bli droppet.

Ved feil opprettes **ett** issue med etiketten `overvaak`. Så lenge det står åpent,
opprettes ingen nye. Lukk det når feilen er rettet.

Repoet er offentlig, så dette koster ingenting. Blir det privat, dekker ikke
2 000 gratisminutter 48 kjøringer i døgnet – da må intervallet ned til én gang i
timen, eller overvåkningen flyttes til en ekstern tjeneste.

## Baselines for skjermbilder

Pakken sammenligner ikke skjermbilder i dag, med vilje: fontgjengivelse skiller seg
mellom macOS og CI-ens Linux, og det gir falske feil som lærer folk å ignorere rødt.

Trenger vi det senere, må baselines lages i **samme miljø som CI**:

```bash
docker run --rm -v "$PWD:/w" -w /w mcr.microsoft.com/playwright:v1.63.0-noble \
  npx playwright test --update-snapshots
```

Sett `maxDiffPixelRatio: 0.02` i `expect.toHaveScreenshot`. Og ikke kjør
skjermbildetester mot produksjon – der hører bare `@overvaak`-røyktestene hjemme.

## Når en test blir rød

Ikke juster terskelen. Terskelen er der fordi en bruker merker forskjellen.
Finn årsaken, eller skriv i PR-en hvorfor grensen er feil satt – og la et menneske
avgjøre.
