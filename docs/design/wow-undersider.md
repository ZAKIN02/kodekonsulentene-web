# Undersidene i wow-uttrykket

Skrevet 18. nov. 2026 av designleder etter oppdrag fra dirigenten. Gjelder gren `redesign/wow`.
Bygger på `wow-brief.md` (særlig «Runde 3»), `bevegelse.md`, `tokens-wow.css`, `wow.css`,
`MalWow.astro`, `src/components/wow/**`, `wow-r4-kritiker.md`, `wow-r4-revisor.md` og de 27 sidene
i `src/pages`. Der denne planen og `sidemonstre.md` er uenige, gjelder denne for undersidene
(nummererte etiketter, `display-lg`, «Eyebrow» og `mono` er opphevet etter del 12 i briefen).

Eier: «Den er bedre, men nå fokuser på de andre segmentene også og andre sidene.»

---

## 0. Grepet som binder alt sammen

**Lampa.** Forsiden forteller at «grønt lys betyr at det virker». Undersidene fortsetter samme
historie med samme lampe, slik at en som kommer rett fra et søk, ser det samme språket:

| Sidetype | Hva lampa gjør |
|---|---|
| Tjenesteside, /om | Kapittelet fra filmen er toppbildet. Bildet er grått og lampa grå under problemet. Når kameraet når det grønne lyset, blir lampa grønn og fargene kommer tilbake. |
| Bransjeside | Samme kapittel som stillbilde. Grått til lampa blir grønn etter første rulling. |
| Verktøy, /sjekk | Den fjerde lampa fra forsiden, «Din side: ikke sjekket», står ved feltet. Resultatet tenner én lampe per måling: grønn, rød eller grå. |
| Artikkel, håndbok, juridisk | Ingen lampe i teksten. Lampa brukes bare når det står en ekte måling (rad i rapportspråket). |
| Priser, caser, kontakt, status, 404 | Lampa bare der den betyr noe: status «svarer», kvittering «sendt», målte tall i caser. |

Byttetesten: et annet byrå har ikke denne gata, ikke disse målingene med dato og ikke en lampe
som tennes av din egen side. Alle valg under er kontrollert mot det.

**Én mal, to bevegelsesnivåer.** Alle 27 sidene bruker `MalWow`. Persuade-sidene får
«film» (Lenis, GSAP, kapittel, overskrifter som løftes inn). Read- og Operate-sidene får «rolig»
(ingen Lenis, ingen GSAP, ingen egendefinert peker, ingenting som beveger seg uten at leseren har
gjort noe). Det er det viktigste skillet i planen.

---

## 1. Sidetyper og mal per type

### 1.0 Felles for alle typer

- **Ramme:** `MalWow` → `Hode` → `<main>` → `Bunn`. Bunnen (ordmerke, lovpålagt innhold) er lik på
  alle sider. På «rolig» står ordmerket stille og helt (ingen `data-split-scrub`).
- **Rutenett:** `.wow-rute`, 12 spalter, `--wow-marg` og `--wow-luke`. Mobil først: én spalte under
  768 px. 768–1023: innhold i spalte 1–10. Fra 1024: oppsettene under.
- **Seksjonsluft:** `--wow-seksjon` over hver H2, aldri under. `--wow-seksjon-tett` i Read/Operate.
- **Bunnfarge varierer, malen gjør det ikke likt:** `--wow-bunn` er standard, `--wow-flate` for én
  seksjon av gangen, refleksfelt (`--wow-refleks`) høyst én gang per side og bare på Persuade-sider.
- **Én stor ting per skjermhøyde.** Høyst tre H2 i `--wow-tekst-stor` per side. Resten i
  `--wow-tekst-tjeneste`.
- **Forbudt på alle undersider (del 4 og 12):** nummererte etiketter over seksjoner, `01–04` på ting
  som ikke er en rekkefølge, monospace utenfor ekte kode og den ekte terminalen, versaler med
  sperring på småtekst, «→» og midtprikker som pynt, ett uthevet ord i overskrifter, tre eller
  flere like kort, inntoning av kort/avsnitt/bilder, dekorative terminalutsnitt, KI-bilder utenfor
  et kapittel, «MANGLER»/«TODO»/«PLASSHOLDER» i HTML.
- **Lenker i tekst:** `.wow-lenke`. Knapper: `.wow-knapp` (primær), `.wow-knapp--strek` (sekundær).
  Maks to handlinger i en toppdel, og bare én primær.
- **Overskrifter med Æ, Ø, Å i versaler** (kritiker r4 #14): ny token `--wow-display-linje-smal`
  (0,95) brukes på all displaytekst under 768 px og på alle H1/H2 som inneholder Æ, Ø eller Å.

### 1.1 Typografisk skala per type (bare tokens fra `tokens-wow.css`)

| Rolle | Persuade (tjeneste, bransje, priser, caser/om) | Read (artikkel, håndbok, juridisk, terminal) | Operate (verktøy, sjekk, kontakt, status, 404) |
|---|---|---|---|
| H1 | Kapittel: `--wow-tekst-hero`. SideHode: `--wow-tekst-stor`. Archivo 800, 78 %, versaler | `--wow-tekst-tjeneste`, Archivo 800, versaler | `--wow-tekst-tjeneste`, Archivo 800, versaler |
| H2 | `--wow-tekst-stor` (maks 3) ellers `--wow-tekst-tjeneste`, versaler | **ny** `--wow-tekst-les-h2`, Schibsted Grotesk 700, vanlig setningsform | `--wow-tekst-h3`, Schibsted Grotesk 700, setningsform |
| H3 | `--wow-tekst-h3`, Schibsted 700 | **ny** `--wow-tekst-les-h3`, Schibsted 600 | `--wow-tekst-brod`, Schibsted 600 |
| Ingress | `--wow-tekst-ingress`, `--wow-maal-ingress`, `--wow-tekst-dempet` | `--wow-tekst-ingress`, maks 62ch | `--wow-tekst-brod`, `--wow-tekst-dempet` |
| Brødtekst | `--wow-tekst-brod`, linje 1,55, `--wow-maal-brod` | `--wow-tekst-brod`, **ny** `--wow-linje-les` (1,65), `--wow-maal-brod` (62ch) | `--wow-tekst-brod` |
| Tall/verdier | `--wow-tekst-tall`, `--wow-tekst-pris` | bare i tabeller, `font-variant-numeric: tabular-nums` | `--wow-tekst-rapport-verdi` (`-smal` under 480 px) |
| Meta, kilde, dato, KI-merke | `--wow-tekst-liten` / `.wow-kolofon` | `--wow-tekst-liten`, `--wow-tekst-dempet` | `--wow-tekst-liten` |
| Kode | – | **ny** `--wow-font-kode` (systemets monospace), bare i `<code>`/`<pre>` | den ekte terminalen på /terminal og 404 |

Read-sidene holder Archivo i rammen (H1, brødsmuler, sidehode) og Schibsted i kolonnen. Det er
«verden eier rammen, kolonnen er rolig» (impeccable, Read).

### 1.2 Bevegelse per type: hva beveger seg, hva står stille

| Type | Beveger seg | Står stille |
|---|---|---|
| Tjeneste (film) | Kapittelet (skrubbet klipp, grått → farge, lampa), H2 med `data-split="lines"`, ekte skjermbilde med `data-reveal="clip"` (ett per side), linja i «Slik går det» (`data-draw`), magnetiske knapper, Lenis | H1 (synlig ved første maling), brødtekst, lister, priser, alt i skjema |
| Bransje (film) | Kapittel som stillbilde: sløret letter og lampa blir grønn etter 30 % rulling. H2-linjer. `data-draw` i flyten | som over |
| Priser (film) | H2-linjer, refleksfeltet `data-scale-in`, prisrad skifter tilstand på valg (160 ms) | prisene (ingen opptelling, del «fast pris»), tabellene |
| Caser/om (film) | /om: kapittelet. Caser: `data-hover="zoom"` på skjermbilder, ett `data-reveal="clip"` per case | tekst, resultatlister |
| Read (rolig) | Bare svar på handling: lenkestrek ved hover og fokus, `<details>` åpnes (`--wow-tid-svar`) | alt annet. Ingen Lenis (søk i siden og vanlig rulling skal virke som i en bok) |
| Operate (rolig) | Svar på handling: lampene i resultatet går fra «venter» til status (`--wow-tid-kort` per rad), feltet får fokusring, kvittering vises. Ingen opptelling | toppdel, forklaringstekst |

Alle typer: `prefers-reduced-motion` og Save-Data gir stillbilder i full farge, ingen video, ingen
Lenis, ingen festing. Uten JS ser siden ut som med redusert bevegelse.

Overgang mellom sider: CSS-only `@view-transition { navigation: auto; }` med 200 ms krysstoning av
`<main>` og `view-transition-name: wow-hode` på toppfeltet, så toppfeltet står stille mellom sider.
Av ved redusert bevegelse. Ingen JS.

### 1.3 Tjenesteside (Persuade, «film»): /nettsider, /systemer, /apper-og-ai, /sikkerhet

**Toppdel:** `Kapittel` med sidens klipp (del 2). /sikkerhet har ikke klipp og får `SideHode` med
`Rapportark` (se 1.3b).

**Seksjonsrekkefølge (fast for alle tre med klipp):**

1. `Kapittel`: H1, ingress (maks 2 linjer), «Book 20 minutter» (primær) og tekstlenken
   «Sjekk siden du har i dag» til `/sjekk`. Problem → løsning på platen.
2. **Beviset for tjenesten** (én ting, sidens eget øyeblikk): /nettsider `KodeBygg`, /systemer
   flyten med ekte systemnavn + ekte skjermbilde, /apper-og-ai `AiTekst`-demoen.
3. **Hva du får:** `Kravrader` (typografiske rader, ikke kort). Står det en ekte måling bak et krav,
   står verdien og datoen ved raden (fra `historie.ts`). Ellers bare kravet.
4. **Ekte arbeid:** én `Ramme` med ekte skjermbilde (nettleser + telefon som på forsiden), lenket til
   casen eller siden den viser. Kritiker r4 #12: casen svarer på kapittelet.
5. `Prosess` («Slik går det», ekte datoer).
6. `Prisliste` i kortform med bare pakkene som gjelder tjenesten.
7. `Sporsmal` bare hvis `faq.ts` har 3–5 svar som gjelder tjenesten (ingen ny tekst).
8. `Kontaktblokk`.

Bunnfarge: 1 film, 2 bunn, 3 flate, 4 bunn (full bredde), 5 bunn, 6 flate, 7 bunn, 8 bunn.

**Mobil (390 × 844), første skjerm:**

```
┌──────────────────────────────┐
│ ■ KK            [Book] Meny  │ 72 px, heldekkende
├──────────────────────────────┤
│                              │
│   stillbilde 9:16, motivet   │ bildet fyller 100svh,
│   i øvre 45 % (kritiker #15) │ object-position 50% 22%
│                              │
│░░░░░░░░ slør fra 45 % ░░░░░░░│
│ EN NETTSIDE SOM              │ H1 --wow-tekst-hero,
│ FAKTISK BLIR FUNNET          │ linje 0,95
│ Ingress, maks to linjer.     │
│ [   Book 20 minutter       ] │ full bredde, 56 px
│ Sjekk siden du har i dag     │ tekstlenke, 44 px mål
│ Illustrasjon laget med KI    │ kolofon
└──────────────────────────────┘
```

**Desktop (1440 × 900), første skjerm:**

```
┌──────────────────────────────────────────────────────────────────┐
│ ■ KodeKonsulentene   Tjenester Priser Caser Om      [Book 20 min] │
├──────────────────────────────────────────────────────────────────┤
│▓▓▓▓▓▓ slør fra venstre ▓▓▓░░░░                                   │
│ EN NETTSIDE SOM          ░░░     klippets første bilde, 16:9,     │
│ FAKTISK BLIR             ░░      full bredde, grått               │
│ FUNNET                   ░                                        │
│ Ingress i 40ch.             spalte 1–7 tekst, 8–12 fri for bildet │
│ [Book 20 minutter]  Sjekk siden du har i dag                      │
│                                             Illustrasjon laget med KI │
└──────────────────────────────────────────────────────────────────┘
```

Etter ca. 12 % av kapittelets rulling glir teksten opp og ut, platen kommer nede til venstre:
`○ Kunden står utenfor med mobilen, men siden din laster ikke.` → ved grønt:
`● En rask side, så kunden bestiller rett fra mobilen.` Så slipper kapittelet, og seksjon 2 kommer.

#### 1.3b /sikkerhet (tjenesteside uten klipp)

Toppdel: `SideHode` (stor) med H1 «Siden vår består sin egen sjekk» i spalte 1–6 og `Rapportark` for
kodekonsulentene.no i spalte 7–12 (desktop), under H1 på mobil. Radene låser seg én gang ved
innlasting (4 × `--wow-tid-kort`, totalt under 900 ms), står ferdig ved redusert bevegelse. Dette
er sidens ene måling: den gamle `CheckReport` lenger ned slås sammen med denne og fjernes.
Rekkefølge: SideHode + Rapportark → `SamtykkeSekvens` → «Verktøyet tok oss selv» (fortelling +
`Opptak`) → «Seks ting på hver leveranse» (`Tekstrader`) → «Fire krav som er konkrete og
testbare» (`Kravrader`) → refleksfelt: Lovsjekk-pakken med pris fra `priser.ts` + `UrlFelt` →
`Kontaktblokk`.

### 1.4 Bransjeside (Persuade, «film»): /bransjer/handverkere, /bransjer/klinikker

**Toppdel:** `Kapittel` i modus `still` (del 2): håndverkere = rørleggeren (dive-3), klinikker =
kontoret med kalenderen (dive-2). Platen bruker sidens egen tekst, ikke filmens (se tabell i del 4).

**Rekkefølge:** Kapittel (H1, ingress, «Book 20 minutter» + tekstlenke til `#demo`) → **Tallene**
(SSB-tallene som to store tall i `--wow-tekst-tall` med kilde, tabell og dato under; terminalutsnittet
fjernes) + `Flyt` → **Demo** (`Steg`, ekte rekkefølge, id `demo`) → **Det du allerede betaler for**
(`Tekstrader`, uten nummer) → **Start her** (`UrlFelt` med den fjerde lampa) → `Kontaktblokk` med
sidens egen tittel og ingress.

Wireframe: som tjenestesiden. På mobil er toppdelen 100svh og kapittelets rulling 0,6 skjermhøyde.

### 1.5 Priser (Persuade, «film»): /priser

**Toppdel:** ingen bilde. Prislista er bildet (retning C sin idé, nå i mørk drakt). `SideHode`
(stor) med H1 «Prisene står her» og ingressen med `mvaSetning` i spalte 1–7, og `Prisliste`
(full) starter i samme skjerm på desktop (1440 × 900: H1 + ingress ca. 380 px, første prisrad
synlig over folden). Mobil: H1, ingress, så velgeren.

```
Mobil                              Desktop
┌───────────────────────┐   ┌──────────────────────────────────────────────┐
│ PRISENE               │   │ PRISENE STÅR HER        Fordi du skal kunne   │
│ STÅR HER              │   │                         regne på det …        │
│ Fordi du skal …       │   ├──────────────────────────┬───────────────────┤
├───────────────────────┤   │ ○ START        14 900 kr │ Dette er med i     │
│ ○ START     14 900 kr │   │ ● BEDRIFT  Anbefalt 29 900│ Bedrift            │
│ ● BEDRIFT   29 900 kr │   │ ○ SYSTEM    fra 60 000 kr │ • …                │
│ ○ SYSTEM fra 60 000 kr│   └──────────────────────────┴───────────────────┘
│ Dette er med i …      │   (tallene er eksempler fra priser.ts i dag;
└───────────────────────┘    de skrives aldri inn, de leses)
```

**Rekkefølge:** SideHode + Prisliste (full) → **Tre typiske oppdrag, ferdig regnet** (`beregn()`,
tre rader: hvem, hva, sum i `--wow-tekst-pris`) → **Drift, abonnement og timer** (`loepende` som rader,
alle `prisvilkaar`, timepris med Innovena-kilden) → **Hva det koster over tre år** (`treAar`,
formelen i vanlig tekst, ikke `mono`) → **Hvorfor ikke {abonnementspris} i måneden**
(sammenligningstabellen med kilder og datoer, uendret innhold) → refleksfelt: garantien (samme tekst
som forsidens `Garanti`) → `Sporsmal` («Om pris og binding», `prisFaq`) + lenker til vilkår og
håndbok → **Vet du ikke hva du trenger?** (to handlinger: `/sjekk` og «Book 20 minutter») →
`Kontaktblokk`.

### 1.6 Caser og om (Persuade, «film»): /caser, /om

**/caser:** `SideHode` (stor) «Problem, løsning, resultat» → casene **sortert etter kapitlene i
filmen** (kritiker r4 #12): Nettsider (denne siden med målingene fra `historie.ts` og priskalkulatoren
som ekte skjermbilde), Systemer (`booking-demo` med merkelappen «Ikke et levert oppdrag»), Apper
(rendres ikke før `caser.ts` har ekte navn og tall). Hver case: `Ramme` (ekte skjermbilde, 16:10, full
bredde i spalte 1–12), så problem, løsning og resultat i spalte 1–7 og 8–12. Resultatlista vises bare
med målte tall. Teknologi i vanlig tekst, ikke `mono`. → **Derfor er listen kort** (de fire kravene som
`Tekstrader`, uten 01–04) → `Kontaktblokk` («Vil du bli den neste?», pilottilbudet ordrett).

**/om:** `Kapittel` med verkstedet (dive-4) → **Hvorfor det er bygget slik** (lesekolonne i spalte
1–7, tallet fra `uu-register.json`, lenker til håndbok og artikkelen) + `Opptak` (flyt, ekte) i
spalte 8–12 → **Hva vi ikke gjør** (`Tekstrader`, fire avslag, uten nummer) → **Målt, ikke
anslått** (`bevis.ts` som `Maaling`-rader, bare verdier som er målt, se åpne punkter) →
`Kontaktblokk`. «Hvem jeg er» med portrett rendres ikke før eier leverer.

### 1.7 Artikkel og håndbok (Read, «rolig»): /artikler, 4 artikler, /handbok

**Artikkel, rekkefølge = påbudt struktur i `kodekonsulentene-seo`:**

1. `Brodsmuler` (Forsiden / Artikler / tittel).
2. H1 (`--wow-tekst-tjeneste`) + meta-linje: «Publisert {dato}. Kontrollert mot kilden {dato}.
   Dette er ikke juridisk rådgivning.» (ordrett som i dag).
3. **Kort svar** (dagens ingress, 40–60 ord) i `--wow-tekst-ingress`, med en tynn
   `--wow-refleks`-strek til venstre (2 px). Det er den ene aksenten i kolonnen.
4. **Verktøyet over folden:** `UrlFelt` mot riktig verktøy (cookies → `/verktoy/cookie-sjekk`,
   35 krav og registeret → `/verktoy/uu-sjekk`, org.nr. → `/sjekk`).
5. Faktatabell (der artikkelen har en), så brødteksten med H2-ene som i dag.
6. Egen data: `Registerstolper`, `Nokkeltall`, målingene fra `maalinger.json`. Terminalutsnitt
   som viser en måling, blir `Maaling`-rader. Terminalutsnitt som viser en kommando, blir `<pre><code>`.
7. `Sporsmal` med nøyaktig samme spørsmål som `FAQPage` i siden (se krav i del 4).
8. Forfatterboks: «Skrevet av KodeKonsulentene, utviklermiljø i Oslo med sikkerhet som fagfelt.
   Les om oss.» (setningen finnes på /om; ingen person nevnes ved navn).
9. Kildeliste med «sist sjekket» der artikkelen har kilder.
10. `Videre`: 3–5 interne lenker (pilar, verktøy, tjenesteside), de samme som i dag pluss det som
    mangler etter strukturen.
11. `Kontaktblokk` med artikkelens egen tittel og ingress.

```
Mobil                              Desktop (lesekolonne spalte 3–9)
┌───────────────────────┐   ┌──────────────────────────────────────────────┐
│ Forsiden / Artikler   │   │        Forsiden / Artikler                    │
│ DE 35 WCAG-           │   │        DE 35 WCAG-KRAVENE                     │
│ KRAVENE               │   │        Publisert … Kontrollert …              │
│ Publisert … Kontr. …  │   │        ┃ Private nettsider i Norge må         │
│ ┃ Private nettsider … │   │        ┃ oppfylle 35 av 61 …   (kort svar)    │
│ [dinbedrift.no][Sjekk]│   │        [dinbedrift.no        ][Sjekk siden]   │
│ Hvilke krav som …     │   │        Hvilke krav som gjelder deg   (H2)     │
│ brødtekst 18 px …     │   │        brødtekst, 62ch …                      │
└───────────────────────┘   └──────────────────────────────────────────────┘
```

Fra 1280 px: innholdsliste (lenker til H2-ene) i spalte 10–12, `position: sticky`, `--wow-tekst-liten`.
Under 1280 px står den som en `<details>` «Innhold» rett under kort svar.

**/artikler (oversikt):** SideHode (tjeneste-størrelse) «Hva loven krever av nettsiden din» +
ingressen med tallord som regnes ut → artiklene som typografiske rader (tittel i `--wow-tekst-h3`
Archivo, løftet under, «Kontrollert {dato}» til høyre), nyest først, ingen nummer, ingen kort →
linja om eldste kontrolldato → `Kontaktblokk`.

**/handbok:** samme lesemal som artikkelen, uten kort svar og verktøy. Innholdslista over de ti H2-ene
er påkrevd her. `Flyt` (prosess) står etter første H2. «Seks rutiner» blir `Tekstrader` (er de en
rekkefølge, `Steg`). Slutter med `Videre` (vilkår, sikkerhet) og `Kontaktblokk`.

### 1.8 Verktøy (Operate, «rolig»): /sjekk, /verktoy, 4 verktøy

**Toppdel:** `Verktoyramme`. Skjemaet står i første skjerm på 390 × 844, alltid.

```
Mobil                              Desktop
┌───────────────────────┐   ┌──────────────────────────────────────────────┐
│ Forsiden / Verktøy    │   │ Forsiden / Verktøy                            │
│ SJEKK NETTSIDEN DIN   │   │ SJEKK NETTSIDEN DIN          (spalte 1–8)     │
│ Fem ting, svar i      │   │ Fem ting, svar i klartekst …                  │
│ klartekst …           │   │ ○ Din side: ikke sjekket                      │
│ ○ Din side: ikke      │   │ [dinbedrift.no                ][Kjør sjekken] │
│   sjekket             │   │ Vi laster forsiden din én gang …              │
│ [dinbedrift.no      ] │   ├──────────────────────────────────────────────┤
│ [   Kjør sjekken    ] │   │ Befaringsrapport   dinbedrift.no   18. nov.   │
│ Vi laster forsiden …  │   │ ● Ytelse ……………………………………………… 92           │
├───────────────────────┤   │ ● Sikkerhetsheadere ………………………… 6/6          │
│ resultat / tom-tilst. │   │ ○ Universell utforming …… Ikke sjekket        │
└───────────────────────┘   └──────────────────────────────────────────────┘
```

**Tilstander i resultatområdet (`aria-live="polite"`):**

| Tilstand | Hva står der |
|---|---|
| Tom | Ingenting under feltet bortsett fra hintet. Den fjerde lampa «Din side: ikke sjekket» er tom-tilstanden. |
| Laster | `Rapportark` med radene i «venter» (`.wow-hake--venter`) og navnene på det som måles, pluss «Dette tar vanligvis 10–30 sekunder.» Ingen spinner, ingen `$ sjekk`. |
| Resultat | `Rapportark` med én `Maaling` per rad. Lampa ved feltet bytter til samlet status. Fokus flyttes til rapportens tittel (`tabindex="-1"`). Under: e-postskjemaet «Få rapporten på e-post» og `<details>` «Forbehold». |
| Feil | Én rad med rød lampe, hva som skjedde og hva du gjør nå (dagens feiltekster). Feltet beholder verdien. |

**Rekkefølge under verktøyet:** forklaring (loven/«hva en automatisk test ikke kan se») som
lesekolonne → `Opptak` (ekte opptak, ett per side) → «Etterpå» med Lovsjekk-pakken og pris fra
`priser.ts` → `Kontaktblokk` (kort, sidens egen tittel).

**/verktoy (oversikt):** SideHode + verktøyene som rader (navn i Archivo `--wow-tekst-h3`, hva det
måler, lenke). Ingen `ServiceCard`. → «Sjekken som kjører» (`Opptak`) → «Motoren er åpen kildekode»
(bare hvis eier bekrefter, se åpne spørsmål) → `Kontaktblokk`.

**/verktoy/priskalkulator:** skjemaet (fire spørsmål) til venstre i spalte 1–7, resultatet (prisspennet
i `--wow-tekst-pris`, linjene estimatet består av) i spalte 8–12, `position: sticky` på desktop. På
mobil står resultatet rett under skjemaet og oppdateres uten animasjon. → Forutsetninger → «Hva andre
tar» (tabellen, `id="markedet"` beholdes, forsiden og /priser lenker hit) → `Kontaktblokk`.

### 1.9 Info, juridisk, kontakt, 404 (Read/Operate, «rolig»)

| Side | Mal |
|---|---|
| /kontakt | `Kontaktblokk` med `niva={1}` er hele toppdelen: H1 «Snakk med den som koder», booking til venstre, skjema til høyre (mobil: booking først). Kvittering (`?sendt=1`) og feil (`?feil=1/2`) står over skjemaet som en rad med grønn eller rød lampe og `role="status"`. Deretter «Kjør sjekken først» (én lenke til /sjekk). Terminalen fjernes. |
| /personvern, /vilkar | Lesemalen uten verktøy og uten kontaktblokk. Innholdet er lovpålagt og står ordrett. «Sist oppdatert» øverst. Vilkårenes nummerering (1–15) beholdes fordi det er en ekte rekkefølge. `Hukommelse` beholdes på /personvern. |
| /status | `SideHode` (tjeneste) «Driftsstatus» + tjenestene som `Maaling`-rader med grønn lampe og «svarer». Forbeholdet om at det ikke er en oppetidsprosent står rett under. → Ytelsesbudsjettet som rader med «grense» (ingen lampe, det er ikke en måling) → avviksløpet som `Steg` → `Videre`. Ingen terminal. Siden er Fly sin helsesjekk og skal være statisk og lett (krav i del 6). |
| /terminal | Lesemalen. Kommandotabellen med kommandoene i `--wow-font-kode` (ekte kode). Den ekte terminalen (`kkterm`) med utsnittet mot eget domene, restylet med wow-tokens. |
| /404 | `SideHode` (tjeneste) «Den siden finnes ikke», `Mentedu` (gjettet) først, så den innfelte terminalen (spalte 1–7) og «Sider som finnes» (spalte 8–12, vanlige lenker) + «Til forsiden». `noindex`. |

---

## 2. Historiens tråd videre: kapittelklippene på undersidene

### 2.1 Hvilket klipp hvor (ingen nye kreditter, bare ffmpeg på filer vi har)

| Side | Klipp | Modus | Tekst på platen |
|---|---|---|---|
| /nettsider | `dive-1` bakeriet | `skrubb` | `historie[1]`: problem og løsning ordrett |
| /systemer | `dive-2` kontoret | `skrubb` | `historie[2]` |
| /apper-og-ai | `dive-3` rørleggeren | `skrubb` | `historie[3]` |
| /om | `dive-4` verkstedet | `skrubb` | `historie[4]` uten målepanelet |
| /bransjer/handverkere | `dive-3` | `still` | sidens egen (del 4) |
| /bransjer/klinikker | `dive-2` | `still` | sidens egen (del 4) |

/kontakt får ikke klipp. Det er en Operate-side; skjemaet skal stå i første skjerm.

### 2.2 Filene (eies av `bevegelse`, lages med ffmpeg i bølge A)

Fra `public/media/wow/scroll-world/dive-N.mp4` (1920 × 1080) og `dive-N-m.mp4` (1080 × 1920):

```
public/media/wow/kapitler/
  kapittel-N.mp4          16:9, segment fra «start» til «slutt» (tabell under), H.264, -g 8,
                          uten lyd, +faststart, CRF valgt så fila er ≤ 1,2 MB
  kapittel-N-m.mp4        9:16, samme segment, ≤ 1,0 MB
  kapittel-N-start.avif   + .webp   første bilde i segmentet (16:9), ≤ 120 kB avif
  kapittel-N-start-m.avif + .webp   (9:16), ≤ 90 kB
  kapittel-N-gronn.avif   + .webp   bildet ved gronnVed + 0,02 (16:9)
  kapittel-N-gronn-m.avif + .webp   (9:16)
```

| N | Kilde | start (andel av klippet) | gronnVed i dag | slutt |
|---|---|---|---|---|
| 1 | dive-1 | 0,30 | 0,72 | 0,80 |
| 2 | dive-2 | 0,30 | 0,75 | 0,83 |
| 3 | dive-3 | 0,28 | 0,68 | 0,76 |
| 4 | dive-4 | 0,35 | 0,78 | 0,86 |

«start» er valgt så kameraet allerede er nær bedriften (ikke en øy i svart, revisor r4 avvik 2) –
`bevegelse` kontrollerer mot rammene (`.design/arbeid/bevegelse/r3/ark-dive-*.png`) og justerer i
`historie.ts`, som er eneste kilde. Kortsiden er 1080 i alle filer (del 12). Ingen oppskalering.

### 2.3 `Kapittel` – nøyaktig oppførsel

Seksjonshøyde: `100svh + rull × 100svh`. `rull` = 1,2 (skrubb, desktop), 1,0 (skrubb, mobil
`(max-aspect-ratio: 4/5)`), 0,6 (still). Bildeflaten er `position: sticky; top: 0; height: 100svh`.

| Rulling i kapittelet | Skjer |
|---|---|
| 0 | Startbildet står, grått (samme to lag som ScrollWorld: `mix-blend-mode: saturation` + mørkt lag, bare opasitet animeres). H1, ingress og handlinger står synlige fra første maling (`data-split-inngang`, LCP). |
| 0–12 % | Heroteksten glir opp og ut (`translateY` + opasitet, ferdig ved 12 %, ingen ramme viser den halvveis, kritiker r4 #9). |
| 12–45 % | Platen nede til venstre med grå lampe og problemet. Klippet spoles fra start mot `gronnVed`. |
| ved `gronnVed` | Lampa blir grønn, gråfilteret går bort på `--wow-tid-lang` (700 ms) med `--wow-kurve`, platen bytter til løsningen (gammel ut 120 ms, ny inn 160 ms etter 120 ms, samme som ScrollWorld). |
| 45–100 % | Løsningen står. Klippet går bare videre til «slutt» (kameraet står nesten stille). Løsningen får 55 % av rullingen (kritiker r4 #3). |
| etter | Seksjonen slipper. Platen og KI-merket ruller ut med bildet. |

`still`: ingen video. Det grønne bildet står med gråfilteret på. Ved 30 % av rullingen går filteret
bort og lampa blir grønn. Ellers likt.

**Lasting:** startbildet (avif, webp som reserve) er det eneste som hentes ved load, forhåndslastet med
`fetchpriority="high"` via `forhandslast` i `MalWow`. Klippet hentes først etter første interaksjon
(rulling, hjul, berøring, tast; ikke pekerbevegelse), samme regel som ScrollWorld. Sidevekt ved load
skal være ≤ 700 kB, med klipp ikke medregnet før interaksjon (revisorens rad 13-metode).

**Uten JS, redusert bevegelse, Save-Data:** seksjonen har vanlig høyde. Det grønne bildet står i full
farge (ikke grått). Under heroteksten står platen som statisk liste: grå lampe + problem, grønn lampe +
løsning, begge i `--wow-tekst` (kritiker r4 #16). Ingen video hentes.

**Tilgjengelighet:** bildeflaten er `aria-hidden`. Problem og løsning ligger i DOM-en fra start
(skjult visuelt ved behov, aldri `display: none` for skjermleser). Lampas tilstand leses opp som
tekst («Løst:»), ikke farge alene. Tekst over bilde holder 4,5:1 mot `--wow-slor-tung` under tekst.
Ingen hopp-lenke trengs (kapittelet er kort), men Tab fra siste handling i heroen går rett til
seksjon 2.

**KI-merke:** «Illustrasjon laget med KI» som `.wow-kolofon` nede til høyre i bildeflaten. Ikke en
bildetekst som forklarer.

### 2.4 Sider uten klipp

Verktøy, artikler, håndbok, juridisk, status, terminal, 404, priser, caser, kontakt og sikkerhet har
ingen video og ingen KI-bilder. De bærer uttrykket med:

- **Ren typografi:** Archivo-versaler i rammen, Schibsted i kolonnen.
- **Ekte UI:** rapportarket, lampene, feltet, prisvelgeren, ekte skjermbilder (`Ramme`) og ekte
  skjermopptak (`Opptak`). Bildene i `public/media/wow/ekte/` tas på nytt i bølge C når sidene er
  ombygd (kritiker r4 #12: priskalkulatoren står i gammel drakt).
- **Lampa** der det finnes en ekte status.

Disse KI-flatene fjernes fra undersidene fordi de er KI utenfor et kapittel: `Storflate`
«Fra skjelett til ferdig» (/nettsider), `Stillbilde` «bransje-handverk» (aluminiumsblokker),
`Storflate` «Det sto åpent.» på /sikkerhet hvis den er KI-generert (sjekk `assets/LICENSES.md`; er
det et ekte opptak, blir det `Opptak`), og alle `SceneFilm`-bakgrunner.

---

## 3. Felles komponenter (lages én gang, i bølge A)

Nye ligger i `src/components/wow/side/`. Eksisterende seksjoner i `src/components/wow/seksjoner/`
får props i stedet for å kopieres. Alle bruker bare `var(--wow-*)`, har scoped `<style>`, og virker
uten JS. Ingen komponent viser «MANGLER»: mangler data, rendres den ikke.

| Komponent | Fil | Props | Brukes på |
|---|---|---|---|
| **MalWow** (endres) | `src/layouts/MalWow.astro` | i dag + `bevegelse: "film" \| "rolig"` (standard `"film"`), `artikkel?: { publisert; oppdatert }` (gir `og:type=article` og datoene, som i Base), `bookHref?: string` | alle 27 |
| **Hode** (endres) | `seksjoner/Hode.astro` | `bookHref = "#kontakt"`, `aktiv?: string` | alle |
| **Bunn** (endres) | `seksjoner/Bunn.astro` | `rull: boolean` (ordmerket følger rullingen bare på «film») | alle |
| **SideHode** | `side/SideHode.astro` | `tittel`, `ingress?`, `storrelse: "stor" \| "tjeneste"`, `handlinger?: {tekst; href; type: "primar" \| "strek" \| "lenke"}[]` (maks 2), `brodsmuler?: boolean`, `meta?: string`, slot `side` (høyre spalte) | priser, caser, sikkerhet, artikler, håndbok, verktøy-oversikt, status, terminal, 404, juridisk |
| **Kapittel** | `wow/Kapittel.astro` (eies av bevegelse) | `nummer: 1–4`, `modus: "skrubb" \| "still"`, `tittel` (H1), `ingress`, `handlinger`, `problem?`, `losning?` (overstyrer `historie.ts`), `prioritet = true` | nettsider, systemer, apper-og-ai, om, 2 bransjer |
| **Seksjon** | `side/Seksjon.astro` | `id?`, `tittel`, `niva = 2`, `ingress?`, `storrelse: "stor" \| "tjeneste" \| "les"`, `tone: "bunn" \| "flate"`, `bredde: "full" \| "les"`, `tett?` | alle undersider |
| **Brodsmuler** | `side/Brodsmuler.astro` | ingen; leser `Astro.url.pathname` og sidens tittel via `brodsmuleLedd()` (ny eksport i `schema.ts`, samme kilde som `BreadcrumbList`) | artikler/*, verktoy/*, bransjer/* |
| **Lampe** | `side/Lampe.astro` | `status: "bestatt" \| "bor" \| "brudd" \| "ikke-sjekket" \| "venter"`, `etikett` (skjermlesertekst) | Maaling, UrlFelt, Kapittel-plate, kontakt-kvittering, status |
| **Maaling** | `side/Maaling.astro` + `src/lib/wow-maaling.ts` | `navn`, `verdi`, `status`, `forbehold?`, `merknad?` (én setning om hva det betyr for bedriften). Markupen lages av `maalingHtml()` i `wow-maaling.ts`, som også verktøyskriptene bruker i nettleseren. Én kilde for server og klient. Verdien deles med `delVerdi()` | sikkerhet, sjekk, 4 verktøy, status, om, caser, artikler |
| **Rapportark** | `side/Rapportark.astro` | `tittel = "Befaringsrapport"`, `adresse`, `dato`, `datoIso`, slot med `Maaling`-rader | sikkerhet, sjekk, verktøy |
| **UrlFelt** | `side/UrlFelt.astro` | `id`, `action = "/sjekk"`, `navn = "url"`, `knapp`, `hint?`, `lampe = true` («Din side: ikke sjekket»), `type: "url" \| "domene"` | sjekk, 3 verktøy, artikler, bransjer, sikkerhet |
| **Verktoyramme** | `side/Verktoyramme.astro` | `tittel` (H1), `ingress`, slot `skjema` (vanligvis `UrlFelt`), slot `noscript`, `resultatId = "resultat"` | sjekk, cookie-sjekk, uu-sjekk, dmarc, priskalkulator |
| **Artikkelkropp** | `side/Artikkelkropp.astro` | `kortSvar?`, `publisert?`, `oppdatert?`, `innhold?: {id; tittel}[]` (innholdsliste), `forfatter = true`, `kilder?: {tittel; url; sjekket}[]`, `variant: "artikkel" \| "handbok" \| "juridisk"`; slot = brødteksten, stilt med `:global()` for `p, h2, h3, ul, ol, table, blockquote, code, pre, a, strong` | 4 artikler, håndbok, personvern, vilkår, terminal |
| **Kravrader** | `side/Kravrader.astro` | `rader: {tittel; tekst; maaling?: Maaling}[]` | nettsider, systemer, sikkerhet |
| **Tekstrader** | `side/Tekstrader.astro` | `rader: {tittel; tekst; href?; merke?}[]`. Samme form som `.wow-andre` på forsiden: tittel, linje, strek mellom. Ingen nummer | apper (tre ting), bransjer, caser, om, artikler-oversikt, verktøy-oversikt, håndbok |
| **Steg** | `side/Steg.astro` | `steg: {naar; navn; tekst}[]`, `tegn = true` (`data-draw` på film) | bransjer (demo), apper (fire steg), status (avvik), håndbok |
| **Prosess** (endres) | `seksjoner/Prosess.astro` | datoene flyttes til `src/lib/prosessdatoer.ts`, så alle sider får samme utregning | forsiden, nettsider, systemer, apper |
| **Prisliste** (endres fra `Priser.astro`) | `seksjoner/Priser.astro` | `variant: "kort" \| "full"`, `pakker?: string[]`, `valgt?: string`, `gruppe` (prefiks for id-er), `tittel`, `ingress`, `niva`, `lenkeTilPriser = true`. `:has()`-reglene i `wow.css` skrives om til å lese `value` og `data-pakke` innenfor seksjonen, ikke faste id-er | forsiden, priser, nettsider, systemer, apper |
| **Sporsmal** (endres) | `seksjoner/Sporsmal.astro` | `liste`, `tittel = "Det folk spør om først"`, `id?`, `storrelse` | forsiden, priser, tjenester, artikler |
| **Kontaktblokk** (endres fra `Kontakt.astro`) | `seksjoner/Kontakt.astro` | `tittel`, `ingress`, `niva: 1 \| 2`, `idPrefiks = "k"`, `id = "kontakt"`, `skjema = true`, `tilstand?: "sendt" \| "feil-1" \| "feil-2"`. Feltnavnene (`navn`, `epost`, `nettside`, `melding`) og `action="/api/kontakt"` er uendret | 22 sider |
| **Refleksfelt** (endres fra `Garanti.astro`) | `seksjoner/Garanti.astro` | `hoved`, `under?`, slot (handling). Standard = garantiteksten | forsiden, priser, sikkerhet |
| **Ramme** | `seksjoner/Ramme.astro` (uendret) | som i dag | tjenester, caser |
| **Opptak** | `side/Opptak.astro` | `navn` (nøkkel i `opptak.json`), `adresse?`. Nettleserrammen fra `Ramme` rundt `<video muted playsinline loop preload="none">` med poster. Spiller når den er 40 % synlig (fin peker: ved hover og fokus). Mangler fila: ingenting rendres | om, sikkerhet, sjekk, verktøy (4), verktøy-oversikt |
| **Videre** | `side/Videre.astro` | `tittel = "Les videre"`, `lenker: {tittel; tekst; href}[]` (2–5) | artikler, håndbok, verktøy, status |
| **Flyt** (portes) | `side/Flyt.astro` | `flyt` fra `flyter.ts` (uendret data). Tegnes i wow-tokens, systemnavn i Schibsted, ikke `mono` | systemer, apper, bransjer, håndbok |
| **Terminalstil** | `src/styles/wow-terminal.css` | – | den globale terminalen (`/terminal.js`, `~`), /terminal, 404 |

**Komponenter fra v1 som beholdes og portes av den gruppa som eier siden** (bølge B):
`KodeBygg` (nettsider, i A3), `AiTekst` (apper), `SamtykkeSekvens` (sikkerhet), `ForOgEtter` og
`Snitt` (verktøy), `Registerstolper`, `Nokkeltall`, `Tusjstrek`, `Hukommelse` (les), `Mentedu`
(404). Portering = samme oppførsel og markup-semantikk, stil bare med wow-tokens, ingen `mono`
utenom kode, ingen «→», ingen nummererte etiketter.

**Fjernes fra undersidene og erstattes:** `Scene`, `Section`, `Mega`, `Avslor`, `Eyebrow`,
`Button`, `ContactBlock`, `PriceCard`, `Prisvelger` (v1), `Pekerkort`, `ServiceCard`, `Horisont`,
`ProcessSteps`, `ProofStrip`, `CheckReport`, `UrlCheck`, `Storflate`, `Stillbilde`, `SjekkSekvens`,
`Lagstabel`, dekorative `Terminal`-utsnitt. Filene slettes ikke før bølge C (lab-sidene bruker dem).

**Det `MalWow` må overta fra `Base`** (ellers mister undersidene funksjon):
1. `artikkel`-prop (og:type, datoer).
2. `/terminal.js` og `Snarveikart` på alle sider (del 5: terminal og snarveier beholdes som skjulte
   ekstra), med stil fra `wow-terminal.css`.
3. Skriptet som gir vannrett rullende tabeller `tabindex="0"` (axe `scrollable-region-focusable`).
4. `Intro` bare på `/` (i dag rendres den på alle sider som bruker `MalWow`).
5. `Hode` med absolutte lenker. På forsiden er «Priser» `#priser`, ellers `/priser`.

**Hode, ny meny (alle sider):** «Tjenester» blir en `<details>`-knapp som åpner et panel med
Nettsider, Systemer og integrasjoner, Apper og AI og Sikkerhet (lenke + løsningslinja fra
`historie.ts` under hver av de tre første). Så Priser, Caser, Om og «Book 20 min» (`bookHref`).
Virker uten JS. Med JS: lukkes med Esc og klikk utenfor (≤ 1 kB). `aria-current="page"` på aktiv side.

**Nye tokens (A1 legger dem i `tokens-wow.css`, ingen andre):**

```css
--wow-tekst-les-h2: clamp(1.5rem, 1.25rem + 0.9vw, 2rem);      /* 24–32 px */
--wow-tekst-les-h3: clamp(1.1875rem, 1.1rem + 0.3vw, 1.375rem); /* 19–22 px */
--wow-linje-les: 1.65;
--wow-display-linje-smal: 0.95;                                  /* Æ Ø Å, kritiker r4 #14 */
--wow-font-kode: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
--wow-status-bestatt: var(--wow-refleks);
--wow-status-brudd: var(--wow-feil);
--wow-status-venter: var(--wow-linje-sterk);
```

Lampene: bestått = fylt `--wow-status-bestatt` med hake i `--wow-tekst-pa-refleks`; bør fikses = ring
2 px i `--wow-status-brudd` uten fyll; brudd = fylt `--wow-status-brudd`; ikke sjekket = stiplet ring i
`--wow-status-venter`; venter = som i dag (`.wow-hake--venter`). Status står alltid også som ord.
Kontrast (beregnet, fra tallene i `tokens-wow.css`): refleks på bunn 15,25:1, feil på bunn 7,05:1,
`--wow-linje-sterk` er kant og trenger 3:1. `revisor` måler.

---

## 4. Per side

Mal-kodene: **T** tjeneste, **B** bransje, **P** priser, **C** caser/om, **L** les (artikkel/håndbok/
juridisk), **V** verktøy, **I** info/kontakt/404. «film»/«rolig» er `bevegelse`-prop.

| Side | Type | Mal | Toppdel | Beholdes | Fjernes / erstattes | Særlige krav |
|---|---|---|---|---|---|---|
| /nettsider | tjeneste (pilot) | T, film | Kapittel 1, skrubb | KodeBygg (portes), fire krav (blir Kravrader: «Lovlig fra dag én» med «Org.nr. bekreftet», «Uten cookie-banner» med «0», begge med dato), prosess, pris Start/Bedrift med `mvaSetning` | Snitt (de fire kravene sier det samme), Storflate (KI), Demo lagstabel (blir Ramme med `klinikker-d` + `handverkere-m`), Terminal, «Hva det er bygget av» som terminal | `tjeneste()`-schema uendret. «Hva det er bygget av» står som `<dl>` i en Seksjon med tone flate, men bare etter faktasjekk (åpent punkt 3). Tittel og beskrivelse uendret |
| /systemer | tjeneste | T, film | Kapittel 2, skrubb | «Hvordan det ser ut i praksis» (Flyt + Ramme `systemer-flyt`/`systemer-m`), «Det vi kobler oftest», «System fra {pris}» (Prisliste kort, bare System) | Terminal | schema uendret; prisen og 40 % fra `priser.ts`/eksisterende tekst |
| /apper-og-ai | tjeneste | T, film | Kapittel 3, skrubb | «To flater, én kobling» (Flyt + Ramme `apper-kobling`/`apper-m`), «Tre ting en app løser» (Tekstrader), «Fire steg» (Steg), «AI som gjør en jobb» + AiTekst (sidens øyeblikk) | Mega nr. 2, Pekerkort-nummer, Horisont, Terminal «I praksis» | AiTekst beholder kall mot `/api/ai-tekst` og personvernlenken `#ai` |
| /sikkerhet | tjeneste uten klipp | T, film | SideHode stor + Rapportark (historie.ts) | SamtykkeSekvens, «Verktøyet tok oss selv» (tekst + Opptak), «Seks ting», «Fire krav», Lovsjekk (refleksfelt + UrlFelt) | CheckReport (slås sammen med toppen), Terminal, Storflate hvis KI | Målingene står én gang på siden. Funnet 6. okt. står som tekst, ikke terminal |
| /bransjer/handverkere | bransje | B, film | Kapittel 3, still. Problem: «De fleste håndverkersider er et telefonnummer og et skjema.» Løsning: «Befaringsforespørsel med bilder fra kunden, tilbud samme dag og ordre rett i Tripletex eller Fiken.» (begge står på siden i dag) | SSB-tallene med `kilde("ssb-14933")` og forbehold, Flyt, demo-steg (`id="demo"`), «Det du allerede betaler for», «Start her», kontaktblokk med egen tittel | Terminal, Stillbilde (KI), Horisont-nummer 01–04 | `test/kilder.test.ts` skal fortsatt finne 14933 og SN2025. «Book 20 minutter» + lenke til `#demo` |
| /bransjer/klinikker | bransje | B, film | Kapittel 2, still. Problem: dagens ingress «Telefonbestilling betyr at dere bare kan selge timer i åpningstiden …». Løsning: «Timebestilling, Vipps-betaling, SMS-påminnelse og medlemsregister …» fra schema-beskrivelsen | «Tre tall dere kjenner igjen» (bare tall med kilde), Flyt, «Fra bestilling til oppgjør» (Steg), «Medlemmer, ikke bare timer» (Tekstrader), «Start her», kontaktblokk | SceneFilm, Terminal, Pekerkort-nummer | Ingen påstand om effekt (kommentaren i fila om «mesteparten» gjelder) |
| /priser | priser | P, film | SideHode stor + Prisliste full | alt innhold: eksempler fra `beregn()`, løpende, vilkår, tre år, sammenligning med kilder og datoer, prisFaq, pilottilbudet | v1 Prisvelger med video, PriceCard ×3 (Prisliste erstatter begge), SceneFilm | Tittel og beskrivelse bygges fra `priser.ts` og skal gi nøyaktig samme streng som i dag (test). Lighthouse-CI kjører mot /priser |
| /caser | caser | C, film | SideHode stor | `synligeCaser`, merkelapper, «Derfor er listen kort», pilotlinja | Eyebrow, `mono`, Horisont | Sorteres etter kapittel. Ingen case med TODO rendres |
| /om | om | C, film | Kapittel 4, skrubb | «Hvorfor det er bygget slik» med registertallet, Opptak flyt, «Hva vi ikke gjør» | Lagstabel og Utenskript (del 4: tre små interaktive ting), Pekerkort-nummer | «vi»-form, ingen navn i brødtekst. ProofStrip blir Maaling-rader bare med målte verdier |
| /kontakt | kontakt | I, rolig | Kontaktblokk niva 1 | booking, e-post, telefon (bare når satt), svartid, sted, skjema med hint, kvittering/feil | Terminal, Scene | `prerender = false` og `noindex` ved `sendt`/`feil` beholdes. Skjemaet virker uten JS |
| /sjekk | verktøy | V, rolig | Verktoyramme + UrlFelt (`id="url-sjekk"`) | `#resultat` med `aria-live`, e-postskjema, forbehold, noscript-teksten, «Fem punkter», ForOgEtter, Opptak sammenlign, Lovsjekk-pris | SjekkSekvens, Terminal, `$ sjekk`-teksten, `kk-report`-markup | Æresregelen: «Ikke sjekket» med setning, aldri falsk «Bestått». `?url=` kjører automatisk som i dag. `verktoy()`-schema uendret. `tests/sjekk-url.spec.ts` grønn |
| /verktoy | verktøy-oversikt | V, rolig | SideHode tjeneste | verktøylista (Tekstrader), Opptak | ServiceCard, Demo-ramme | «Åpen kildekode»-seksjonen bare med eiers bekreftelse |
| /verktoy/cookie-sjekk | verktøy | V, rolig | Verktoyramme | API-kall, tabellene i resultatet (som `Maaling` + tabell for cookie-lista), «Hva ekomloven § 3-15 krever», Opptak, «Etterpå» | Terminal, `card`-markup | All funksjon og alle feiltekster uendret. `verktoy()`-schema uendret |
| /verktoy/uu-sjekk | verktøy | V, rolig | Verktoyramme | som over + «Hva en automatisk test ikke kan se» | Terminal | `<details open>` for reglene beholdes |
| /verktoy/dmarc | verktøy | V, rolig | Verktoyramme (`type="domene"`) | skjemaet `#dmarc-skjema` med `<details>`, Snitt (portes), «De tre postene, forklart», Opptak, timeprisen fra `firma` | Terminal, inline `style` | SPF/DKIM/DMARC som tre `Maaling`-rader, «Ikke sjekket» for DKIM uten selektor |
| /verktoy/priskalkulator | verktøy | V, rolig | Verktoyramme med skjema `#kalk` venstre, resultat høyre | `beregn()`, forutsetningene, Opptak, tabellen `#markedet` med kilder | Terminal, `card` | Tallene fra `priskalkyle.ts` og `markedspriser.ts`, aldri skrevet av. Nytt skjermbilde `kalkulator-d` tas i bølge C |
| /artikler | les-oversikt | L, rolig | SideHode tjeneste | tallord som regnes ut, eldste kontrolldato, `artikkelOversikt()`-schema | Pekerkort med nummer | Rekkefølge etter dato |
| /artikler/35-wcag-krav | artikkel | L, rolig | Brodsmuler + H1 + meta | alt innhold, `maalinger.json`, `WCAG_NAVN`, Article + FAQPage | Section/eyebrow | FAQ synlig (Sporsmal med de tre spørsmålene i schemaet). `artikkel`-prop til MalWow |
| /artikler/cookies-for-samtykke | artikkel | L, rolig | som over | alt innhold | Terminal (blir Maaling-rader eller `<pre>` etter innhold) | som over |
| /artikler/orgnr-pa-nettsiden | artikkel | L, rolig | som over | alt innhold, `kilde()`, `orgnrVist` | Terminal (som over) | som over |
| /artikler/wcag-i-registeret | artikkel | L, rolig | som over | Registerstolper, Nokkeltall, Tusjstrek (portes, refleks som markørstrek) | – | Tallene fra `uu-register.json` og `uuregister.ts` |
| /handbok | håndbok | L, rolig | SideHode tjeneste + innholdsliste | ti H2 med innhold, `id="tilgang"`, Flyt prosess, seks rutiner, «Videre» | Horisont, Scene | Ankeret `#tilgang` beholdes (lenkes fra andre sider) |
| /personvern | juridisk | L, rolig | SideHode tjeneste, meta «Sist oppdatert» | all tekst ordrett, `id="ai"`, Hukommelse | Section/eyebrow | Lovpålagt innhold uendret (tekstdiff = 0) |
| /vilkar | juridisk | L, rolig | som over | all tekst ordrett, nummerering 1–15, `mvaSetning` | Section/eyebrow | Tekstdiff = 0 |
| /status | info | I, rolig | SideHode tjeneste + tre `Maaling`-rader «svarer» | forbeholdet om oppetid, budsjettet, avviksløpet, `avvikIngress` | Nokkeltall (blir rader), Terminal, Horisont | Helsesjekk for Fly: ingen klientskript utover rolig-pakken, ingen nye avhengigheter, svarer 200 |
| /terminal | info | L, rolig | SideHode tjeneste | kommandotabellen, utsnittet mot eget domene med dato og forbehold | Section/eyebrow | Kommandoen `tema` må få et svar som stemmer når siden bare er mørk (åpent spørsmål 1) |
| /404 | 404 | I, rolig | SideHode tjeneste | Mentedu, innfelt terminal (`disabled` til JS slår den på), lenkeliste, Snarveikart | Eyebrow med «//» | `noindex`. Uten JS: lenkelista gjør jobben |

**Krav som gjelder alle radene:** samme URL, `<title>`, `meta description`, canonical, OG-bilde
(`ogBilde` som i dag) og JSON-LD som før. Alle interne lenker siden har i dag, finnes fortsatt
(fjernes én, står grunnen i rapporten). Én H1 (`test/bygget-html.test.ts`).

---

## 5. Rekkefølge for bygging

Maks fire agenter samtidig. Ingen to agenter rører samme fil. En fil som ikke står på en agents
liste, er lesetilgang for den agenten. Trenger en agent en endring i en fil den ikke eier, skriver den
det i rapporten, og dirigenten samler det til neste bølge.

### Bølge A: felles grunnlag og pilot (to agenter, så pilot)

**A1 `bygger` (felles)** – parallelt med A2:
- `src/layouts/MalWow.astro`
- `src/components/wow/seksjoner/{Hode,Bunn,Kontakt,Priser,Sporsmal,Prosess,Garanti}.astro`
- `src/components/wow/side/*` (alle nye i del 3 unntatt Kapittel)
- `src/lib/wow-maaling.ts`, `src/lib/prosessdatoer.ts`
- `src/data/schema.ts` (bare ny eksport `brodsmuleLedd`, resten urørt)
- `src/styles/tokens-wow.css`, `src/styles/wow.css`, `src/styles/wow-terminal.css` (ny)
- `src/pages/index.astro` (bare tilpasning til nye props og `prosessdatoer.ts`)
- `tests/wow/felles.spec.ts` (ny), `src/pages/lab/wow-komponenter.astro` (ny, `noindex`, viser alle
  komponenter i alle tilstander)

**A2 `bevegelse`** – parallelt med A1:
- `src/components/wow/Kapittel.astro`
- `src/scripts/wow/kapittel.ts` (hentes dynamisk bare når `[data-kapittel]` finnes)
- `src/scripts/wow/rolig.ts` (ny inngang: hode-skjul, lukking av menypanelet, `<details>`-høyde;
  ≤ 20 kB gzip inkludert alt den laster)
- `src/scripts/wow/index.ts` (filminngangen; uendret oppførsel på forsiden)
- `src/styles/wow-bevegelse.css`
- `src/data/historie.ts` (legg til `start`, `slutt` og `kapittelFor(href)`)
- `public/media/wow/kapitler/*` (ffmpeg, del 2.2)
- `tests/wow/kapittel.spec.ts`, `src/pages/lab/kapittel.astro`

Kontrakten mellom A1 og A2: `MalWow` rendrer én av to små komponenter, `BevegelseFilm` eller
`BevegelseRolig` (A1 lager dem, de inneholder bare `<script>import "../scripts/wow/index.ts"</script>`
eller `rolig.ts`). A1 måler i bygget at en «rolig»-side ikke laster GSAP eller Lenis. Kapittel snakker
med skriptet bare gjennom `data-kapittel`, `data-kapittel-modus`, `data-kapittel-gronn` (andel) og
`data-kapittel-rull`.

**A3 `bygger` (samme som A1, etter A1 og A2): pilot `/nettsider`**
- `src/pages/nettsider.astro`
- `src/components/wow/side/KodeBygg.astro` (portert; den gamle `KodeBygg.astro` røres ikke)

**Port A:** `revisor` måler /nettsider og forsiden (forsiden skal ikke ha blitt dårligere), `kritiker`
ser bilder av /nettsider. Eier sier «GODKJENT» før bølge B. Rettinger av felleskomponenter skjer her,
av A1.

### Bølge B: fire grupper samtidig

| Agent | Sider (eneste filer i `src/pages` den rører) | Egne nye filer | Porterer |
|---|---|---|---|
| **B1 `bygger` – tjenester og bransjer** | `systemer.astro`, `apper-og-ai.astro`, `sikkerhet.astro`, `om.astro`, `bransjer/handverkere.astro`, `bransjer/klinikker.astro` | `src/components/wow/tjeneste/*`, `tests/wow/sider-tjenester.spec.ts` | AiTekst, SamtykkeSekvens |
| **B2 `verktoybygger` – verktøy** | `sjekk.astro`, `verktoy/index.astro`, `verktoy/cookie-sjekk.astro`, `verktoy/uu-sjekk.astro`, `verktoy/dmarc.astro`, `verktoy/priskalkulator.astro` (inkludert skriptene i filene) | `src/components/wow/verktoy/*`, `tests/wow/sider-verktoy.spec.ts` | ForOgEtter, Snitt |
| **B3 `bygger` – lesesider** | `artikler/index.astro`, `artikler/35-wcag-krav.astro`, `artikler/cookies-for-samtykke.astro`, `artikler/orgnr-pa-nettsiden.astro`, `artikler/wcag-i-registeret.astro`, `handbok.astro`, `personvern.astro`, `vilkar.astro`, `terminal.astro` | `src/components/wow/les/*`, `tests/wow/sider-les.spec.ts` | Registerstolper, Nokkeltall, Tusjstrek, Hukommelse |
| **B4 `bygger` – salg og info** | `priser.astro`, `caser.astro`, `kontakt.astro`, `status.astro`, `404.astro` | `src/components/wow/info/*`, `tests/wow/sider-info.spec.ts` | Mentedu |

Låst for alle i bølge B: alt A1 og A2 eier, `src/data/*` (unntatt lesing), `src/lib/sjekk.ts`,
`src/lib/hent.ts`, `src/pages/api/*`, `sikkerhet.mjs`, `server.mjs`, `astro.config.mjs`, eksisterende
tester i `test/` og `tests/` (de skal være grønne, ikke endres), v1-komponentene i `src/components/*.astro`.
Sidestil skrives i sidens egen `<style>` eller i gruppens komponentmappe, aldri i `wow.css`.

### Bølge C: måling, retting og opprydding

1. `revisor`: Lighthouse mobil og desktop på alle 27, sidevekt, JS, axe, tastatur, uten JS, redusert
   bevegelse, SEO-diff (del 6). `kritiker`: bilder av alle sider mot forsiden.
2. `produsent`: nye skjermbilder i `public/media/wow/ekte/` av de ombygde sidene (kalkulator, sjekk,
   bransjer), 1920 × 1200 og 1170 × 2532.
3. A1 retter felleskomponenter, gruppene retter sine sider (samme fileierskap som i B).
4. Opprydding: v1-komponenter som ingen side bruker lenger (unntatt lab), `Base.astro`, `scener.css`.
   Bare etter at `npm run verify` og hele Playwright-settet er grønt, og med dirigentens godkjenning.

---

## 6. Akseptkriterier

### Gjelder alle sider

| # | Krav | Hvordan det måles |
|---|---|---|
| 1 | Lighthouse mobil ≥ 95 i alle fire kategorier. LCP ≤ 2,5 s, CLS < 0,1 | 3 kjøringer, median, mot `node server.mjs` |
| 2 | Vekt ved første innlasting ≤ 700 kB (video som hentes etter interaksjon telles ikke, samme metode som revisor r4 rad 13) | CDP |
| 3 | Egen JS gzip: «rolig» ≤ 20 kB, «film» ≤ 70 kB | filene siden faktisk laster |
| 4 | Ingen hardkodede farger, avstander eller radier utenfor `tokens-wow.css` (unntak: `theme-color` i `MalWow`, dokumentert) | grep etter `#[0-9a-fA-F]{3,8}\b`, `rgb(`, `hsl(` og `px` i endrede filer |
| 5 | Virker uten JS: alt innhold synlig, skjemaer sender (GET `/sjekk`, POST `/api/kontakt`), verktøy viser noscript-teksten | JS av i Playwright |
| 6 | Redusert bevegelse: 0 videoforespørsler, ingen Lenis, ingenting skjult | `reducedMotion: "reduce"` |
| 7 | Tastatur: hopp-lenken er første stopp, synlig fokus på alle stopp (2 px `--wow-fokus`), menypanelet lukkes med Esc, mål ≥ 24 px (≥ 44 px på mobil for handlinger utenfor løpende tekst) | Tab gjennom hele siden |
| 8 | Ingen «MANGLER», «TODO», «PLASSHOLDER», «Lorem» i bygget HTML | grep i `dist/` |
| 9 | Samme SEO som før: `<title>`, description, canonical, `og:*`, `twitter:*` og alle `application/ld+json` er byte-like før og etter, unntatt rekkefølge i JSON-nøkler | skript som henter `<head>` fra bygget på `main` og på grenen og sammenligner per URL |
| 10 | Alle interne lenker fra før finnes fortsatt, eller begrunnes | lenkesett per side, før og etter |
| 11 | Én H1. axe: 0 brudd | `test/bygget-html.test.ts`, axe-core |
| 12 | Media: korteste side ≥ 1080 i største variant, KI-merke ved hvert KI-bilde | ffprobe / bildedimensjoner |
| 13 | AI-preg-sjekken i del 12 og byttetesten | kritiker, med bilder |
| 14 | `npm run verify` grønn, eksisterende Playwright-tester grønne | CI |

### Per sidetype

| Type | Tilleggskrav |
|---|---|
| Tjeneste og /om (Kapittel skrubb) | Lampa skifter i rammen ved `gronnVed` begge veier. Aldri to tekster synlige samtidig på platen. Grått før grønt, farge etter. Ved load hentes bare startbildet. H1 er LCP-elementet. Løsningen får ≥ 55 % av kapittelets rulling. Ingen sidelengs overflyt ved 320 px. |
| Bransje (Kapittel still) | Som over, uten video. SSB-tall med tabellnummer og dato synlig. |
| Priser | Prisvalg virker uten JS (`:has`). Ingen opptelling av tall. Alle beløp fra `priser.ts`/`beregn()`/`markedspriser.ts`. Tittel og description identiske med i dag. |
| Caser | Ingen case med TODO. Resultatlister bare med målte tall. «Ikke et levert oppdrag» synlig der det står i dag. |
| Les (artikkel, håndbok) | Linjelengde 45–75 tegn ved 390 og 1440 px. Brødtekst ≥ 18 px. Ingenting beveger seg uten handling. `FAQPage` bare når FAQ-en er synlig, med identiske spørsmål. Datoene i teksten = `datePublished`/`dateModified`. Artikkelstrukturen i `kodekonsulentene-seo` (11 punkter) oppfylt, avvik skrevet i rapporten. |
| Juridisk | Tekstinnholdet i `<main>` er identisk med før (normalisert mellomrom). Bunnens lovpålagte innhold uendret. |
| Verktøy | All funksjon som før: samme API-kall, samme feltnavn og id-er (`#url-sjekk`, `#resultat`, `#dmarc-skjema`, `#kalk`, `#markedet`), samme feiltekster. Æresregelen: hver rad har én av fire statuser, «Ikke sjekket» har en setning om hvorfor. Resultat flytter fokus til rapportens tittel. Skjemaet i første skjerm på 390 × 844. `test/sjekk.test.ts` og `tests/sjekk-url.spec.ts` grønne uten endring. |
| Kontakt | Skjema virker uten JS, kvittering og feil vises fra query-parametrene, `noindex` ved kvittering. |
| Status | Svarer 200 uten klientskript utover rolig-pakken. Ingen ekstern forespørsel. |
| 404 | `noindex`. Lenkelista virker uten JS. Terminalfeltet er `disabled` uten JS. |

---

## 7. Hva jeg endret etter kontrollen mot del 4 og byttetesten

- Første utkast hadde kapittelklippet også på /kontakt. Fjernet: kontakt er en Operate-side, og
  skjemaet må stå i første skjerm.
- Første utkast hadde `UrlFelt` både i heroen og i en egen seksjon på tjenestesidene. Del 4: URL-sjekken
  sto to ganger. Nå er det en tekstlenke i heroen og ingen egen sjekkeseksjon på tjenestesidene.
- «Fire krav» som fire kort (v1) ville vært «samme kortoppsett» tre ganger på flere sider. Erstattet av
  `Kravrader` med ekte målinger, så byttetesten består (målt dato, eget domene).
- Bransjesidene fikk først nye tekster på platen. Endret til setninger som allerede står på sidene, så
  ingen tekst er diktet opp.
- Rapporten på /sikkerhet sto to ganger (hero og CheckReport). Slått sammen til én.
- Innholdslista på lesesidene var først en fast venstremarg på alle bredder. Flyttet til høyre og bare
  fra 1280 px, så kolonnen beholder målet på mindre skjermer.

---

## 8. Åpne punkter

1. **Lyst tema.** Briefens del 5 sier at lyst og mørkt skal virke. Wow-briefen sier «alltid mørkt».
   Terminalkommandoen `tema` og v1-temaknappen forsvinner. Planen bygger bare mørkt. Eier avgjør.
2. **Portrett og navn til /om** («Hvem jeg er») mangler fortsatt.
3. **Faktasjekk før bygging av disse:** /nettsider «Hva det er bygget av» sier hosting Cloudflare (siden
   kjører på Fly.io) og «0 kB JS på forsiden» (forsiden laster nå ca. 63 kB); /verktoy «Motoren er åpen
   kildekode … GitHub Action»; `bevis.ts` «0,1 s». Står de ikke målt eller dokumentert, rendres de ikke.
4. **App-caser** i `caser.ts` har TODO. Apper-gruppa på /caser vises ikke før de er fylt inn.
5. **Prisene i `<title>` og description på /priser** er skrevet inn for hånd i dag (CLAUDE.md forbyr det).
   Planen bygger strengen fra `priser.ts` og krever at den blir lik dagens.
6. Rammer som ikke er avklart av koden og som A1 må bekrefte i bygget: at en betinget rendret
   komponent med `<script>` bare tas med på sidene som rendrer den (Astro 7). Hvis ikke: to separate
   layoutinnganger i stedet for en prop.
7. Planen er skrevet i `docs/design/wow-undersider.md` etter dirigentens oppdrag. Rollebeskrivelsen min
   sier at jeg bare skriver `retning.md` og `designsystem-v2.md`, og at jeg ikke leser kode. Oppdraget ba
   om begge deler; jeg har lest komponentene og sidene, men ikke endret noe utenom denne fila.

---

## 9. Sammendrag

**Malene, én linje per type**
- **Tjeneste** (/nettsider, /systemer, /apper-og-ai; /sikkerhet uten klipp): kapittelklippet skrubbes fra grått til grønt under H1, så bevis, krav med ekte målinger, ekte skjermbilde, prosess, pris, kontakt. «film».
- **Bransje** (2): samme kapittel som stillbilde som tennes ved rulling, så SSB-tall med kilde, flyt, demo-steg, «Start her» med feltet, kontakt. «film».
- **Priser:** H1 og prislista er første skjerm, så eksempler, løpende, tre år, sammenligning med kilder, garanti i refleksfelt, spørsmål, kontakt. «film».
- **Caser/om:** caser sortert etter filmens kapitler med ekte skjermbilder; /om åpner med verkstedet. «film».
- **Les** (artikler, håndbok, juridisk, terminal): Archivo i rammen, rolig Schibsted-kolonne på 62ch, kort svar, verktøyet over folden, FAQ, kilder, videre. «rolig».
- **Verktøy** (/sjekk + 5): feltet og den fjerde lampa i første skjerm, resultatet som rapportark med lamper, forklaring, ett ekte opptak, kontakt. «rolig».
- **Info/kontakt/404/status:** kontaktblokken er toppen på /kontakt; status som lamperader; 404 med gjett, terminal og lenker. «rolig».

**Felles komponenter:** MalWow (endret), Hode, Bunn, SideHode, Kapittel, Seksjon, Brodsmuler,
Lampe, Maaling (+ `wow-maaling.ts`), Rapportark, UrlFelt, Verktoyramme, Artikkelkropp, Kravrader,
Tekstrader, Steg, Prosess, Prisliste, Sporsmal, Kontaktblokk, Refleksfelt, Ramme, Opptak, Videre, Flyt,
wow-terminal.css.

**Bølgene:** A1 felles (layout, seksjoner, side/*, tokens, wow.css) ∥ A2 bevegelse (Kapittel, kapittel.ts,
rolig.ts, historie.ts, ffmpeg-klippene) → A3 pilot /nettsider → port med eier → B1 tjenester og bransjer
(6) ∥ B2 verktøy (6) ∥ B3 lesesider (9) ∥ B4 priser, caser, kontakt, status, 404 (5) → C måling, nye
skjermbilder, retting, opprydding.
