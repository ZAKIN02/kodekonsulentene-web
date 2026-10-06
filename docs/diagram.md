# Diagrammer: flyt og snitt

Målt 6. oktober 2026. To figurtyper, begge ren SVG og CSS, begge **0 kB JavaScript**.

Brandboken rangerer diagram med ekte navn som nivå 2, rett under opptak av
verktøyet i drift og over alt generert materiale. Disse figurene er der for å gjøre
nivå 2 billig nok til at det alltid er et reelt alternativ.

## To former, to betydninger

| | `Flyt` | `Snitt` |
|---|---|---|
| Tegner | en **vei** – noe beveger seg og blir til noe annet | en **oppbygning** – lagene finnes samtidig |
| Retning | venstre → høyre | ovenfra og ned |
| Aksent | siste ledd (dit det bærer) | ett valgt lag (`aksent`-indeks) |

Formen må stemme med påstanden. Da `apper`-flyten het «Én kundeliste, tre flater»
mens streken tegnet en kjede med piler én vei, beskrev tittel og figur to ulike
ting. Samme feil oppsto i første utkast av `epost` – se under.

## De fire nye figurene, og hvor de hører hjemme

| Figur | Side | Forklarer |
|---|---|---|
| `snitt.nettside` | `/nettsider` | De fire lagene i en nettside, med navn |
| `snitt.sjekk` | `/sjekk`, seksjon 02 | De fem punktene sjekken måler, i oppgitt rekkefølge |
| `snitt.epost` | `/verktoy/dmarc`, seksjon 02 | SPF, DKIM og DMARC |
| `flyter.prosess` | forsiden, seksjon 06 | De fire stegene, med tiden over boksen |

Innkobling er to linjer:

```astro
import Snitt from "../components/Snitt.astro";
import { snitt } from "../data/flyter";
<Snitt snitt={snitt.nettside} />
```

**Alle navn og detaljer er hentet ordrett fra det som allerede står på sidene** –
`src/data/prosess.ts`, definisjonslista på `/sjekk`, `<dl>`-en på `/verktoy/dmarc`
og lagnavnene i `Lagstabel.astro`. En figur som kaller dem noe annet enn rapporten
gjør, ville vært en tredje versjon av samme sannhet.

`snitt.nettside` erstatter ikke opptaket av lagstabelen på `/nettsider`. Opptaket
står sterkere som bevis, fordi det er vår egen side i drift. Figuren står ved siden
av og setter navn på lagene, som et opptak av en dragbar flate ikke rekker å gjøre
leselig.

## Målt

Alt målt på ekte visningsbilde gjennom et fullt gjennomløp, ikke `fullPage` – det
fotograferer scroll-drevne elementer ved scroll 0, altså med `opacity: 0`.

**JavaScript: 0 B.** Ingen `<script>` i `Flyt.astro` eller `Snitt.astro`. De tre
skriptene på `/lab/svg` (`page.js` 956 B, `hero-live.js` 1423 B, `terminal.js`
5501 B) er sidens egen grunnmur og uendret av figurene.

**Malt skriftstørrelse** – det som faktisk treffer skjermen, ikke viewBox-enheter:

| Element | Oppgitt | Skala | Malt |
|---|---|---|---|
| `snitt__navn` | 17px | 1,006 | **17,1 px** |
| `snitt__detalj` | 13px | 1,006 | **13,1 px** |
| `snitt__nr` | 13px | 1,006 | **13,1 px** |
| `flyt__nr--tid` | 13px | 1,006 | **13,1 px** |

`VB_B = 1000` mot en spalte på ~1005 px gir skala 1,006. Det er med vilje: Flyt
brukte først 1200 og ble skalert til 0,84, slik at 13px-merket ble malt på 9,2 px.
Kontrasten besto hele veien, og teksten var likevel for liten å lese.

**Kontrast**, målt på glyffenes og strøkenes egen farge mot flaten bak:

| | mørkt | lyst | krav |
|---|---|---|---|
| `snitt__navn` | 17,98:1 | 17,98:1 | 4,5:1 |
| `snitt__detalj` | 7,24:1 | 7,24:1 | 4,5:1 |
| `snitt__nr` | 5,67:1 | 5,67:1 | 4,5:1 |
| stolpe og leder | 3,10:1 | 4,06:1 | 3:1 |
| aksentstolpe | 14,03:1 | 6,78:1 | 3:1 |
| aksentnavn | 14,03:1 | 6,78:1 | 4,5:1 |

**Animasjonen kjører faktisk** – `stroke-dashoffset` lest gjennom scrollet, ikke
antatt fra at CSS-en finnes:

| scrollY | stolpe 1 | stolpe 2 | stolpe 3 | stolpe 4 |
|---|---|---|---|---|
| 2069 | 1,000 | 1,000 | 1,000 | 1,000 |
| 2230 | 0,692 | 0,794 | 0,850 | 0,886 |
| 2391 | 0,019 | 0,318 | 0,482 | 0,586 |
| 2553 | 0,000 | 0,000 | 0,112 | 0,284 |
| 2714 | 0,000 | 0,000 | 0,000 | 0,000 |

Trappen virker: lag 1 er ferdig mens lag 4 så vidt har begynt, og figuren står
komplett omtrent når den når lesehøyde. Det er den ene gesten – én stolpe om
gangen, ovenfra og ned.

**Degradering**, fire tilstander, 48 elementer i synsranden:

| | `view()` | usynlige | utegnede |
|---|---|---|---|
| Chromium, normalt | ja | 0 | 0 |
| Redusert bevegelse | ja | 0 | 0 |
| Uten JavaScript | ja | 0 | 0 |
| **Firefox** | **nei** | **0** | **0** |

Firefox rapporterer selv at `animation-timeline: view()` mangler, og figuren står
likevel ferdig tegnet. Det er fordi standardtilstanden i CSS-en er «tegnet» –
`@supports` skjuler og tegner på nytt bare der støtten finnes. Ingen reserve i
JavaScript trengs, i motsetning til `Avslor`, der innholdet ellers blir stående
usynlig.

**Mobil, 390 px:** SVG skjult, alle tre listene bærer innholdet, 0 px sidelengs
drag, minste skrift 12 px. Grensen går ved 900 px, samme som `Flyt`, fordi teksten
under det males under ~13 px.

## To feil funnet ved å måle

**Aksentstrøket var nesten usynlig i lyst tema.** `--accent` er et *fyll* –
brandboken sier den aldri skal være tekst på lyse flater – og som strøk har den
samme svakhet: **1,46:1** mot flaten. I mørkt tema målte den 14,03:1, så feilen var
usynlig til begge temaer ble målt. Begge figurtypene bruker nå `--accent-text`, som
holder i begge. **`Flyt` hadde den samme latente feilen og er rettet i samme slengen.**

**Stolpene var 1,22:1 med `--line`.** I `Snitt` ER stolpene innholdet – stablingen
er hele påstanden – så de bruker `--line-strong`. Brandbokens hairline-regel gjelder
strekbredden (1px), ikke fargen. `Flyt` beholder `--line` på boksene, som bare
rammer inn, og `--line-strong` på pilene, som bærer mening.

## Én feil i mitt eget første utkast

`snitt.epost` la først DMARC øverst, for å vise at den hviler på SPF og DKIM. Men
da ble DMARC nummerert «01», og et tall øverst leses som «dette kommer først» –
stikk i strid med prosaen under figuren, som går SPF → DKIM → DMARC.

Figuren påsto altså det motsatte av teksten ved siden av. Rekkefølgen følger nå
siden, og avhengigheten bæres av aksenten på DMARC og av beskrivelsen i stedet for
av stablingen.

## Fellen som må unngås

CSS-minifieren slår `animation` og `animation-timeline` sammen til
`animation: linear both navn view()`. Den formen er ugyldig, og både Chromium og
Firefox forkaster hele erklæringen uten å si fra. Bruk alltid langformene.
`test/bygget-html.test.ts` feiler hvis mønsteret dukker opp i bygget; verifisert at
begge figurene er rene, og at eneste treff er `/lab/bibliotek`, som har mønsteret
med vilje.

## Verktøy

`.skudd/snitt-maal.mjs` (malt skrift, kontrast, JS-vekt), `snitt-strek.mjs`
(strøkkontrast i begge temaer), `snitt-tegner.mjs` (beviser at animasjonen kjører),
`snitt-stripe.mjs` og `snitt-alle.mjs` (filmstriper), `snitt-degrad.mjs` (fire
tilstander), `snitt-mobil.mjs`, `snitt-prosess.mjs`.
