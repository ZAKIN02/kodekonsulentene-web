# Åpningen

Forsiden åpner med at siden måler seg selv: de tre tallene fra `src/data/bevis.ts`
telles opp mens en hårlinje fylles, på terminalflaten. Så lettes den og forsiden
ligger under.

```
// SJEKKER KODEKONSULENTENE.NO

6/6     Sikkerhetsheadere på denne siden
0       Cookies før samtykke
0,1 s   Svartid, målt fra Oslo

────────────────────────────────────────
```

## Hvorfor den ser slik ut

Vi selger at utsiden av en nettside er blank, og at jobben er å vise hva som
ligger inne. Et innlastingsbilde som teller til hundre sier ingenting om det.
Her kjøres sidens egen måling i stedet, og tallene er de samme som står lenger
nede på forsiden — ikke pynt, og etterprøvbare ved å kjøre `/sjekk` på oss.

Flaten er `--terminal`, som er **mørk i begge temaer**. Det er ikke en snarvei: en
åpning i `--bg` ville blinket hvitt for den som har lyst tema, fordi temavalget
settes av et skript og flaten males før det rekker å virke. Terminalen er dessuten
vårt eget register — samme flate som verktøyene kjører i.

Den fjerde posten i `bevis.ts`, «24 t svar på henvendelser», er med vilje utelatt.
Den er et løfte om oppførsel, ikke noe en skanning kan bekrefte, og hører ikke
hjemme i en sekvens som later som den måler.

## Når den vises

Bare på forsiden, bare én gang per økt, og aldri ved `prefers-reduced-motion`.
Avgjørelsen tas av et inline-skript i `Apning.astro` som setter `data-apning` på
`<html>`. CSS viser overlegget bare når det flagget finnes.

| Tilstand | Vises |
|---|---|
| Første besøk i økten | ja |
| Andre besøk i økten | nei |
| `prefers-reduced-motion: reduce` | nei |
| Uten JavaScript | nei |
| Undersider | nei |

Uten JavaScript settes flagget aldri, og overlegget er `display: none` fra start.
Innholdet er der umiddelbart i alle fire tilstandene — verifisert ved at `<h1>`
leses i alle.

## Hvordan den ikke kan låse siden

Tre lag, hvert uavhengig av det neste:

1. **Tallene står som ferdig tekst i HTML-en.** `/apning.js` teller dem bare opp.
   Kommer skriptet aldri fram, står riktig verdi der allerede.
2. **Bortgangen er en CSS-keyframe**, ikke JavaScript. `apning-bort` fader ut og
   setter `visibility: hidden` ved 1150 ms av 1500. Feiler alt annet, forsvinner
   åpningen likevel.
3. **Ingen fokuserbare barn**, så det finnes ingenting å låse fokus i.

## Tre feil som ble funnet ved å måle

**`document.currentScript.nextElementSibling` er null.** Første forsøk lot inline-
skriptet fjerne `hidden` fra diven under seg. Den diven er ikke parset ennå når
skriptet kjører, så åpningen viste seg aldri — og CSP-kontrollen var grønn hele
veien. Ingenting feiler synlig når et element bare blir stående skjult. Flagget
settes derfor på `<html>`.

**`data-apning` på både `<html>` og flaten.** `querySelector("[data-apning]")`
traff `<html>` først, og målingen rapporterte `display: block`. Flaten har nå
`data-apning-flate`.

**`inert` ga klikk rett gjennom.** Chrome hopper over inerte elementer i treffsøk,
så et klikk under den ugjennomsiktige flaten traff `<h1>` — målt med
`elementFromPoint`. En utålmodig bruker kunne treffe en lenke han ikke så. Uten
`inert` fanges klikket i stedet: et svelget klikk kan man ta om igjen, en uventet
navigering kan man ikke. `aria-hidden` dekker skjermlesere alene, siden det ikke
finnes fokuserbare barn.

## Målt

| | Mobil før | Mobil etter | Skrivebord før | Skrivebord etter |
|---|---|---|---|---|
| Ytelse | 99 | **99** | 100 | **100** |
| LCP | 2,1 s | **2,0 s** | 0,5 s | **0,5 s** |
| FCP | 0,9 s | **0,9 s** | 0,3 s | **0,3 s** |
| CLS | 0 | **0** | 0 | **0** |
| TBT | 10 ms | **0 ms** | 0 ms | **0 ms** |

Lighthouse kjører med fersk profil, så åpningen vises i hver måling — altså verste
fall. `apning.js` er **942 B gzip**. Null CSP-brudd i begge temaer.

LCP er uendret fordi overlegget ikke hindrer at innholdet bak males; det ligger
bare oppå. CLS er null fordi flaten er `position: fixed` og ingenting flytter seg
når den forsvinner.

## Tilgjengelighetstallet på skrivebord

Lighthouse melder 97 i stedet for 100, med fire `color-contrast`-noder i
`Nokkeltall`. **Det er ikke åpningen.** Målt tre kjøringer med og tre uten
åpningen i bygget: fire noder i alle seks. Og med åpningen fjernet helt fra
`Base.astro` og siden bygget på nytt: fortsatt 97.

Fargen axe oppgir, `#656c73` på `#0b0d10`, finnes ikke i `tokens.css`. Det er en
mellomverdi fra scroll-drevet avdekking på elementer **under folden**, som
legitimt står halvveis gjennomsiktige til man scroller til dem. Under
`prefers-reduced-motion` er tallet null brudd.

Dette er en eksisterende svakhet i måleoppsettet, ikke i siden — og den ligger i
filer jeg ikke eier. Verdt å ta tak i, men ikke her.

## Filer

- `src/components/Apning.astro` — markup, stil og valgskriptet
- `public/apning.js` — opptellingen, 942 B gzip
- `src/layouts/Base.astro` — `visApning` på forsiden
- `.skudd/apn-*.mjs` — måleverktøyene
