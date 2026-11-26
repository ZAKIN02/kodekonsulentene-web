# wow-r8 grunnmur: undersidene over i wow-drakten

Gren `redesign/wow`, 24. nov. 2026. Ikke committet (slettinger og flyttinger står staget fordi de er gjort med `git rm`/`git mv`). Dev på 4720 (`astro dev --ignore-lock`, fordi 4800 holder låsen), målt mot bygget med `PORT=4720 node ./server.mjs`. Begge er stoppet. Skills lastet: frontend-design, wai-implementation, emil-design-eng.

## Resultat

Grunnmuren fantes i stor grad fra bølge A1 (`MalWow` med `bevegelse`, `artikkel`, `bookHref`; `src/components/wow/side/`). Denne runden har tettet hullene, flyttet tre mønstersider og fjernet tema og `/retning/a/`.

1. **Tre sider er flyttet helt over:** `/priser/` (film), `/artikler/cookies-for-samtykke/` (rolig) og `/verktoy/cookie-sjekk/` (rolig). `<title>`, description, canonical, alle `og:*`/`twitter:*` og all JSON-LD er like før og etter (sammenlignet mot bygget fra r7; eneste avvik er `theme-color` og ny `color-scheme`). Ingen interne lenker er borte.
2. **Nye byggeklosser** i `src/components/wow/side/`:
   - `Prosa.astro`: brødtekst i lesestil (p, h2, h3, lister, tabell, sitat, kode, `<details>`, `.wow-notat`, `.wow-ubrutt`). Global stil med vilje, så markup som verktøyskript setter inn, får samme stil. `Artikkelkropp` bruker den nå i stedet for egne regler.
   - `Prisrader.astro`: `<dl>` med navn, én linje og beløp til høyre (`storrelse="h3" | "pris"`).
   - `rapportarkHtml()` i `maaling.ts`: hele rapportarket som HTML-tekst for verktøyskriptene (samme markup som `Rapportark.astro`).
   - `Artikkelkropp` fikk `metaTillegg` («Dette er ikke juridisk rådgivning.») og luft i `etter`-slotten.
   - Stilen for rapportarkets tittel er flyttet fra `Rapportark.astro` til `wow.css`, fordi skriptene lager samme markup.
3. **Temabryteren er fjernet overalt:** knappen i `Topbar`, `TEMA_SCRIPT` i `<head>` og i `sikkerhet.mjs`, lytteren i `Base.astro`, kommandoen `tema` i `public/terminal.js` og raden i `/terminal`. `Base.astro` og `MalWow.astro` sletter nøkkelen `kk-tema` hos besøkende som har den. V1-sidene står alltid mørke til de er flyttet.
4. **`/retning/a/` er slettet** (`src/pages/retning/a.astro`, `src/components/retning-a/`). Den er ute av nettstedskartet (kartet bygges av sidene; 0 treff i `sitemap-0.xml`). Lighthouse-konfigene hadde den ikke. Testvideoene er flyttet ut av `public/` (se avvik 1).

## Målt

| | /priser/ | /artikler/cookies-for-samtykke/ | /verktoy/cookie-sjekk/ |
|---|---|---|---|
| Lighthouse mobil (median av 3): ytelse / UU / praksis / SEO | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| LCP / CLS / TBT | 795 ms / 0,003 / 0 | 797 ms / 0 / 0 | 799 ms / 0 / 0 |
| Vekt første innlasting | 232 kB | 158 kB | 191 kB |
| axe WCAG 2.0–2.2 A/AA ved 390, 1440 og 320 | 0 | 0 | 0 |
| Sidelengs overflyt ved 390, 1440 og 320 | 0 | 0 | 0 |
| Én H1, første Tab = «Hopp til innhold», konsollfeil, 4xx | 1, ja, 0, 0 | 1, ja, 0, 0 | 1, ja, 0, 0 |
| Uten JS: skjult tekst | ingen | ingen | ingen, noscript-teksten står |

- `npm run verify`: 342 av 342 tester, `astro check` 0 feil og 0 advarsler, bygg fullført.
- Sikkerhetsheadere: alle seks på svarene. CSP er som før, bortsett fra at hashen for temaskriptet er borte (script-src er `'self'` pluss hashene fra bygget). Ingen CSP-feil i konsollen på `/`, `/sjekk/`, `/kontakt/` (SSR), `/terminal/`, `/lab/wow-side/` eller de tre nye.
- Cookie-sjekken, med etterlignet API-svar: venter, resultat (fokus flyttes til rapportens tittel, `?url=` settes i adressen), feil (én rad «Ikke sjekket» med årsaken). `?url=` kjører sjekken av seg selv og sender samme POST som før. Ekte kall lokalt svarte «Skanneren er ikke satt opp ennå», som forventet uten skannertjenesten.
- Ingen `localStorage`-nøkler og ingen cookies etter besøk.
- Bilder: `.skudd/wow/r8/{priser,artikkel,verktoy}/{m,d}-{topp,hel}.png`, tilstander i `.skudd/wow/r8/verktoy/{m,d}-{venter,resultat,feil}.png`. Skript: `skudd.mjs`, `maal.mjs`, `lh.mjs`, `verktoy-tilstander.mjs` samme sted. Lighthouse-rådata i `.skudd/wow/r8/lh/`.

## Rettet etter selvkontrollen

- Tabellen fikk luft foran komma og punktum («side , levert raskt .»): `tabular-nums` på hele tabellen. Fjernet.
- Listenummer sto som «1 .»: nettleseren setter `tabular-nums` på `::marker`. Overstyrt i `Prosa`.
- Mobil: siste tabellkolonne ble klemt til ett ord per linje. Kolonnene har nå minstebredde, og tabellen ruller sidelengs (som i v1).
- Mobil: prisspennet brøt midt i tallet («145 / 500 kr»). `Prisrader` holder tallet samlet og bryter etter tankestreken.
- Brødsmulene tok to høye rader på mobil når sidetittelen er lang. Minstehøyden står nå bare på lenkene.
- Verktøysiden: lovseksjonen og opptaket sto i lesekolonnen (spalte 3), mens toppdelen står i spalte 1. Nå har alt samme venstrekant.
- Artikkelen: «38 svarte.79 %» og «høyere enn79 %» manglet mellomrom (feilen sto også i v1). Rettet.
- Notat i full bredde ga for lange linjer. `Prosa` holder 62 tegn på avsnitt uansett kolonnebredde.

## AI-preg (del 12)

Ingen etiketter over overskrifter, ingen `// 01`, ingen «→», ingen midtprikk som pynt (v1 hadde «3 sider · Start-pakken», nå komma). Monospace bare i `<code>`. Ingen kort: rader med strek. Nummerert liste bare der det er en rekkefølge (stegene i sjekken, F12-oppskriften). Ingen inntoning ved rulling på de rolige sidene; resultatet i verktøyet tones inn på 280 ms som svar på handling.

## Migreringsoppskrift

**1. Importer**

```astro
// ut
import Base from "../layouts/Base.astro";
import Scene, Mega, Avslor, Section, Eyebrow, Button, ContactBlock, PriceCard, Prisvelger,
       Faq, Terminal, Demo, UrlCheck, Pekerkort, ServiceCard, Horisont … fra "../components/"
import "../styles/scener.css";

// inn
import MalWow from "../layouts/MalWow.astro";
import { SideHode, Seksjon, Prosa, Prisrader, Artikkelkropp, Verktoyramme, UrlFelt, Rapportark,
         Maaling, Tekstrader, Kravrader, Steg, Flyt, Opptak, Videre, Brodsmuler,
         Prisliste, Sporsmal, Refleksfelt, Kontaktblokk, Ramme } from "../components/wow/side";
import Handlinger from "../components/wow/side/Handlinger.astro";
```

**2. Malen.** `<Base …>` blir `<MalWow …>` med de samme propsene (`tittel`, `beskrivelse`, `schema`, `artikkel`, `ogBilde`, `noindex`). Legg til `bevegelse`: `"film"` på tjenester, bransjer, priser, caser, om; `"rolig"` på artikler, håndbok, juridisk, verktøy, kontakt, status, terminal, 404. Sider uten kontaktblokk setter `bookHref="/kontakt"`.

**3. Hva erstattes med hva**

| V1 | Wow |
|---|---|
| `Scene` + `Mega som="h1"` + ingress | `SideHode` (`storrelse="stor"` på Persuade, `"tjeneste"` ellers; `brodsmuler` der siden ligger under `/artikler`, `/verktoy`, `/bransjer`). Verktøy: `Verktoyramme`. Tjenester med klipp: `Kapittel` |
| `Scene n eyebrow tittel ingress` | `Seksjon tittel ingress storrelse tone bredde tett`. Eyebrow og nummer forsvinner |
| `Section nivaa={1}` + `.prose` (artikkel) | `SideHode bredde="les"` + `Artikkelkropp` (kort svar, datoer, innholdsliste, slot `verktoy`, slot `etter`, forfatter, kilder) |
| `.prose`, `.stack` med avsnitt, tabell | `<Prosa>` (i en `Seksjon`). Fjern `class="kk-link"` og `class="body-strong"`; `Prosa` stiler `a` og `strong` selv |
| `<p class="small faint">` / `small muted` | `<p class="wow-notat">` inne i `Prosa` |
| `<dl class="kv">` med pris | `Prisrader` |
| `PriceCard` ×3 og v1 `Prisvelger` | `Prisliste` (`variant="kort"`, `pakker={[…]}`) |
| `Faq` | `Sporsmal liste tittel id storrelse` (i artikkel: `storrelse="les" innfelt`) |
| `Button` | `<a class="wow-knapp">` / `wow-knapp--strek` med `<span class="wow-knapp__tekst">`, eller `Handlinger` (maks to, én primær) |
| `ContactBlock n tittel ingress` | `Kontaktblokk tittel ingress` (uten `n`) |
| `UrlCheck id action buttonLabel value hint` | `UrlFelt id action knapp verdi hint` (behold id-en) |
| `Terminal` som viser en måling | `Maaling`-rader (i `Rapportark` eller `<ol class="wow-maalinger">`) |
| `Terminal` som viser en kommando som finnes | `<pre><code>` i `Prosa` |
| `Terminal` som pynt | innholdet som liste eller tekst, ellers ut |
| `Demo` (opptak) | `Opptak navn adresse` |
| `Pekerkort`, `ServiceCard`, `Horisont` | `Tekstrader` (uten nummer), `Steg` der det er en rekkefølge |
| `kk-report`, `kk-badge`, `.card` i skript | `rapportarkHtml()` og `maalingHtml()` fra `side/maaling`, tabeller i `<div class="wow-prosa">` |
| `var(--space-*)`, `--ink`, `--line` | `var(--wow-rom-*)`, `--wow-tekst`, `--wow-linje` (bare `tokens-wow.css`) |

**4. Verktøyskript.** Importer `maalingHtml`, `rapportarkHtml`, `fraSjekk` i `<script>`. Behold id-ene (`#url-sjekk`, `#resultat`, `#dmarc-skjema`, `#kalk`, `#markedet`), feltnavn, API-kall og feiltekster. `Verktoyramme` lager `#resultat` med `aria-live`; skriptet setter `aria-busy`. Venter = rapportark med radene i `status: "venter"`. Resultat = flytt fokus til `tittelId`. Kjørte ikke sjekken, er statusen «Ikke sjekket» med årsaken i `merknad`, aldri «Brudd» eller «Bestått». Les `?url=` fra `location.search` (siden er forhåndsbygget).

**5. Fallgruver**

- Stil for markup som lages i nettleseren, må være global. `Prosa` har global stil, men den er bare med når siden rendrer minst én `<Prosa>`.
- `Handlinger` kutter alt etter to. Har siden tre lenker, skriv den tredje som `.wow-lenke` (se `cookie-sjekk.astro`).
- `Prisliste niva={1}` har ikke luft for det faste toppfeltet. Pakk den i en `div` med `padding-top: var(--wow-hode-hoyde)` (se `priser.astro`).
- `FAQPage` bare når spørsmålene står synlig. Bygg markupen med `faqSide(liste)` av samme liste som `Sporsmal` får.
- Astro fjerner linjeskift foran inline-elementer: skriv `{" "}` der et mellomrom må stå.
- Fjern sidenes `<style is:global>` med `.scene:first-of-type …`; de gjelder v1-avdekkingen.
- Høyst tre H2 i `storrelse="stor"` per side, resten `tjeneste` eller `les`.
- Sammenlign `<head>` før og etter (title, description, canonical, JSON-LD) og lenkesettet i `<main>`. Skriptet står i denne rapportens kjøring; `maal.mjs` og `skudd.mjs` kan gjenbrukes med andre stier.
- `astro dev` nekter å starte når en annen dev-server har låsen: bruk `--ignore-lock --port <egen>`. Playwright må startes med `channel: "chrome"` (nettleserne for 1.63 er ikke lastet ned).
- Rør ikke `wow.css`, `tokens-wow.css`, `MalWow.astro` eller `side/*` fra en sidegruppe. Mangler noe, meld det.

## Gruppeinndeling for de 24 sidene og 404

| Gruppe | Sider (filer i `src/pages/`) | Eier også |
|---|---|---|
| **B1 tjenester og bransjer** (6, film) | `nettsider.astro`, `systemer.astro`, `apper-og-ai.astro`, `sikkerhet.astro`, `bransjer/handverkere.astro`, `bransjer/klinikker.astro` | portering av `KodeBygg`, `AiTekst`, `SamtykkeSekvens` |
| **B2 verktøy** (5, rolig) | `sjekk.astro`, `verktoy/index.astro`, `verktoy/uu-sjekk.astro`, `verktoy/dmarc.astro`, `verktoy/priskalkulator.astro` | portering av `ForOgEtter`, `Snitt`; `tests/sjekk-url.spec.ts` skal stå grønn uendret |
| **B3 lesesider** (8, rolig) | `artikler/index.astro`, `artikler/35-wcag-krav.astro`, `artikler/orgnr-pa-nettsiden.astro`, `artikler/wcag-i-registeret.astro`, `handbok.astro`, `personvern.astro`, `vilkar.astro`, `terminal.astro` | portering av `Registerstolper`, `Nokkeltall`, `Tusjstrek`, `Hukommelse`; `public/terminal.js` |
| **B4 caser, om, kontakt, status, 404** (5) | `caser.astro`, `om.astro` (film), `kontakt.astro`, `status.astro`, `404.astro` (rolig) | portering av `Mentedu` |

Gruppene deler ingen filer. Detaljer per side står i `docs/design/wow-undersider.md` del 4. Opprydding etterpå (bølge C): `Base.astro`, v1-komponentene, `tokens.css`, `site.css`, `components.css`, `scener.css`, `MalV2.astro`, `src/components/bevegelse/` og `forside/` når lab-sidene er flyttet eller slettet.

## Avvik og valg som trenger et blikk

1. **Testvideoene er flyttet, ikke slettet.** `public/scener/test/` (13,7 MB) brukes også av `tests/bevegelse/` (`scene.spec.ts`, `oyeblikk.spec.ts`). De ligger nå i `tests/bevegelse/fixtures/scener/test/` og serveres av `tests/bevegelse/server.mjs` på samme adresse. De følger ikke lenger med i bygget. Jeg har ikke kjørt `tests/bevegelse` etter flyttingen. Vil eier ha dem helt bort, må de testene skrives om eller slettes.
2. **`test/lansering.test.ts` er endret.** Testen «CSP inneholder en hash som matcher temaskriptet» kunne ikke bestå uten temaskriptet. Den er erstattet av en som krever at script-src er `'self'` uten hasher, og at hasher fra bygget kommer med i headeren. Testene i `test/sjekk.test.ts` er ikke rørt.
3. **Tekst jeg måtte endre på /priser:** «Regnet ut av den samme kalkulatoren som står under» er blitt «Regnet ut av den samme kalkulatoren» med lenke til `/verktoy/priskalkulator`, fordi v1-prisvelgeren ikke står på siden lenger (planen del 1.5). «{hva} · {pakke}-pakken» er blitt komma. Eyebrow-ordene «Løpende», «Sammenligning», «Spørsmål», «Usikker» er borte (planen).
4. **`PriceCard`-innholdet er byttet.** Prislista viser «Dette er med» fra forsidens tekst, ikke `inkludert`/`ikke`/`beskrivelse`/`cta` fra `priser.ts`. Prisene er de samme. Garantifeltet er nytt på siden (planen del 1.5, forsidens tekst).
5. **Terminalutsnittene:** i artikkelen står eksempelet som to målingsrader med bildeteksten fra utsnittets skjermlesertekst. På verktøysiden står de fire leddene som nummerert liste («ALDRI» er blitt uthevet «aldri», stor forbokstav).
6. **Feil i verktøyet er «Ikke sjekket», ikke rød lampe.** Planen sier rød lampe; æresregelen sier at en sjekk som ikke kjørte, ikke kan vise brudd.
7. **FAQ-en er nå synlig i artikkelen** (den sto bare i markupen i v1). Overskriften er komponentens standard, «Det folk spør om først».
8. **Tittel og beskrivelse på /priser bygges av `priser.ts`.** Strengene er like som før. Siste setning («Prisene er endelige – foretaket er ikke mva-registrert.») står fortsatt skrevet i siden.
9. **`public/media/wow/.DS_Store` er slettet.** Den felte `test/bygget-html.test.ts` og dukker opp igjen hvis mappa åpnes i Finder.

## Filer endret

- Nye: `src/components/wow/side/Prosa.astro`, `src/components/wow/side/Prisrader.astro`, `docs/design/rapporter/wow-r8-grunnmur.md`
- Flyttet over: `src/pages/priser.astro`, `src/pages/artikler/cookies-for-samtykke.astro`, `src/pages/verktoy/cookie-sjekk.astro`
- Grunnmur: `src/components/wow/side/{Artikkelkropp,Rapportark,Brodsmuler}.astro`, `src/components/wow/side/{maaling,index}.ts`, `src/styles/wow.css` (tittelen på rapportarket), `src/layouts/MalWow.astro` (rydder `kk-tema`)
- Tema: `sikkerhet.mjs`, `sikkerhet.d.ts`, `src/layouts/Base.astro`, `src/components/Topbar.astro`, `public/terminal.js`, `src/pages/terminal.astro`, `test/lansering.test.ts`
- Slettet: `src/pages/retning/a.astro`, `src/components/retning-a/Rapport.astro`, `public/media/wow/.DS_Store`
- Flyttet: `public/scener/test/*` til `tests/bevegelse/fixtures/scener/test/`; `tests/bevegelse/server.mjs`, `tests/bevegelse/oyeblikk.spec.ts` (kommentar), `docs/design/bevegelse.md` (én linje)

## Kilder

Ingen eksterne kilder hentet. Internt: `docs/design/wow-undersider.md`, `docs/design/rapporter/wow-r7-revisor.md`, `docs/design/rapporter/wow-a1-felles.md`, `docs/sidemonstre.md`, bygget fra r7 (`dist/`, 24. nov. 15:10) som sammenligningsgrunnlag.

## Åpne spørsmål og antakelser

1. **Personvernerklæringen sier noe som ikke stemmer lenger.** `/personvern` og `Hukommelse` oppgir at temavalget (`kk-tema`) og prisvalget (`kk-prisvalg`) lagres i nettleseren. Temaet lagres ikke lenger, og v1-prisvelgeren brukes bare på `/lab/lek`. Teksten er lovpålagt og er ikke rørt. B3 og tekstforfatter må rette den.
2. **Opptaket på verktøysiden viser v1-drakten** (r7 P1-4 gjelder opptakene også). Nye opptak må tas når sidene er flyttet.
3. **Forsiden har sidelengs overflyt i bygget nå:** 66 px ved 1440 og 8 px ved 390, fra `.wow-kontakt__bilde-ramme`, og ett kontrastbrudd i axe. Jeg har ikke rørt de filene; det hører til arbeidet som pågår på forsiden.
4. **Lyst-tema-CSS står igjen** i `tokens.css`, `site.css`, `components.css`, `scener.css` og `Topbar` (død kode; `scripts/og.mjs` leter etter `[data-theme="light"]` i `tokens.css`). Tas i bølge C sammen med `Base.astro`.
5. `MalV2.astro`, `src/components/bevegelse/` og `src/components/forside/` brukes ikke av noen side etter at `/retning/a/` er borte, bare av `tests/bevegelse/`.
6. Antakelse: `/priser` skal ikke ha synlige brødsmuler (v1 hadde dem ikke). Artikkel og verktøy har dem.
7. `CLAUDE.md` og `docs/sidemonstre.md` nevner fortsatt Base, tokens.css og eyebrow-nummer. Ikke rørt.

## Neste steg

1. Dirigenten: start B1–B4 parallelt med oppskriften over. Hver gruppe måler med `maal.mjs`, `lh.mjs` og hodesammenligningen.
2. `kritiker` ser på de tre mønstersidene før gruppene kopierer mønsteret (særlig prisradene på /priser og resultatet i cookie-sjekken).
3. `tekstforfatter`: avvik 3, 5 og 7, og åpent punkt 1.
4. `bevegelse`: kjør `tests/bevegelse` etter flyttingen av testvideoene (avvik 1).
5. Eier: avgjør om testvideoene skal helt bort (avvik 1).
