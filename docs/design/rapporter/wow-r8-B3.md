# wow-r8-B3: lesesidene over i wow-drakten

Gren `redesign/wow`, 24. nov. 2026. Ikke committet. Dev på 4750 (`astro dev --port 4750 --ignore-lock`), stoppet etter målingen. Skills lastet: frontend-design, emil-design-eng. `wai-implementation` ble ikke lastet.

## Resultat

Alle åtte sidene bruker `MalWow` med `bevegelse="rolig"`: `/artikler/`, de tre artiklene, `/handbok/`, `/personvern/`, `/vilkar/` og `/terminal/`. De fire komponentene er portert til `src/components/wow/les/`, og `public/terminal.js` virker mot den nye prislista.

- **SEO-feltene er like før og etter** på alle åtte: `<title>`, description, canonical, alle `og:*`, `article:*`, `twitter:*` og all JSON-LD, sammenlignet mot v1 i `dist/client`. FAQPage bygges nå med `faqSide()` av samme liste som den synlige FAQ-en, og gir samme JSON som den håndskrevne.
- **Ingen interne lenker er borte.** Nye lenker er ankrene i innholdslistene, brødsmulene (`/`, `/artikler`) og «Les om oss» (`/om`) i forfatterlinja.
- **Teksten er uendret**, med unntakene under «Avvik».
- **Terminalen virker som før, uten `tema`.** Prøvd: `help`, `pris`, `ls`, `whoami`, `cat priser`, modalen med `~` og Esc. `tema` svarer «ukjent kommando».

## Målt

| | Resultat |
|---|---|
| axe WCAG 2.0–2.2 A/AA ved 390, 1440 og 320, alle åtte | 0 brudd |
| Sidelengs overflyt ved 390 og 1440 | 0 på alle åtte |
| Sidelengs overflyt ved 320 | 0 på sju, 1 px på `/handbok/` |
| Én H1, første Tab = «Hopp til innhold», konsollfeil | 1, ja, 0 på alle |
| Uten JS: skjult tekst | ingen |
| `localStorage` og cookies etter besøk | ingen |
| Linjelengde | 62 tegn på avsnitt og lister (`Prosa`) |
| `npx astro check` | 0 feil i mine filer, 2 feil i `nettsider.astro` og `sikkerhet.astro` (B1) |
| `npm run test` | 338 av 342. De fire røde er ikke fra mine filer (se åpne punkter 6) |

Lighthouse er ikke kjørt (krever bygg, som dirigenten kjører til slutt).

Skjermbilder ligger i `.skudd/wow/r8/B3/<side>/{m,d}-hel.png` og utsnitt `{m,d}-NN.png`. Skript samme sted: `skudd.mjs`, `maal.mjs`, `hent.mjs` og `sammenlign.mjs` (hode, JSON-LD, lenker, tekst), `terminal-test.mjs`, `overflyt.mjs`.

## Hva som er gjort per side

- **`/artikler/`**: `SideHode` og artiklene som `Tekstrader` (display), nyest først, med «Kontrollert {dato}» til høyre. Linja om eldste kontrolldato står under. Kortene, numrene og «Les artikkelen» er borte.
- **De tre artiklene**: `SideHode` med brødsmuler, `Artikkelkropp` med kort svar (v1-ingressen), datoer, innholdsliste, `UrlFelt` mot artikkelens verktøy, brødteksten, synlig FAQ, to handlinger, forfatterlinje og `Kontaktblokk`.
- **`/handbok/`**: lesemalen med innholdsliste over de ti overskriftene. `Flyt` (prosess) står foran første overskrift, som H2. De seks rutinene står som `Tekstrader` uten nummer. Ankeret `#tilgang` er beholdt.
- **`/personvern/` og `/vilkar/`**: lesemalen, variant «juridisk», uten kontaktblokk (`bookHref="/kontakt"`). Forbeholdet står først med strek til venstre. Vilkårene har nummereringen 1–15. Ankeret `#ai` er beholdt. `Hukommelse` står sist på personvernsiden.
- **`/terminal/`**: kommandoene som `<dl>` med `<code>`, og utsnittet i den ekte terminalen. Med JavaScript kan du skrive i den. Uten står utsnittet som tekst og feltet er av.

## Porterte komponenter (`src/components/wow/les/`)

| Komponent | Endret fra v1 |
|---|---|
| `Registerstolper` | Målelinje under tallet i stedet for fylt stolpe. Ingen rulleanimasjon. Ingen sidelengs rulling: under 40rem (container-spørring) står hver rad som en blokk, med ARIA-roller så tabellen overlever. Ingen monospace, ingen versaler i hodet. |
| `Nokkeltall` | Ingen opptelling, ingen målestrek, ikke noe skript. To og to på mobil, fire på rad fra 768 px. |
| `Tusjstrek` | Tykk refleksstrek under teksten, står ferdig. `varsel` og `feil` bruker `--wow-feil`. |
| `Hukommelse` | Samme skript. Tabellen står i `Prosa`. Nøklene står i `<code>`. |

V1-komponentene i `src/components/` er ikke rørt og ikke slettet.

## `public/terminal.js`

- `pris` leser `.wow-velger__valg` på `/priser` (v1-klassene `.kk-price` finnes ikke lenger). Uten rettingen svarte kommandoen «klarte ikke å hente prisene».
- `data-kkterm-innfelt="utsnitt"` beholder det serveren har skrevet og slår bare på feltet. `/404` er uendret (attributtet uten verdi).
- `historie: "/historie"` er fjernet fra `ls`, fordi siden ikke finnes i `src/pages`.

## Rettet etter selvkontrollen

- `/artikler/`: radene sto helt ut i skjermkanten (standardslotten i `SideHode` har ingen marg). Flyttet til `wow-rute`.
- `/personvern/`: H1 var 415 px bred på 390 px og ga 25 px sidelengs rulling. Mykt bindestrek i ordet.
- Registertabellen: tittelen brøt til ett ord per linje i smal visning.
- Sider uten kontaktblokk sto helt inntil bunnfeltet. Luft lagt til.
- `Hukommelse`: siste kolonne var klippet på mobil, og en tom kvitteringsblokk ga dobbel luft.
- 320 px: lange knappetekster og «tilgjengelighetserklæring?» i FAQ-en sprengte kolonnen. Rettet med sidestil i de tre artiklene.
- Terminalutsnittet: stien sto høyrestilt.

## AI-preg (del 12)

Ingen etiketter over overskrifter, ingen `// 01`, ingen «→», ingen midtprikk som pynt. Monospace bare i `<code>` og i terminalen. Ingen kort. Nummer bare i vilkårene. Ingenting beveger seg uten handling.

## Avvik og valg som trenger et blikk

1. **FAQ-en er nå synlig i de tre artiklene** (sto bare i markupen i v1). Overskriften er komponentens standard, «Det folk spør om først».
2. **Mellomrom lagt til:** «38 svarte.68 %» og «38 svarte.66 %» manglet mellomrom i v1 (samme feil som grunnmuren rettet i cookie-artikkelen).
3. **Setningen «Tabellen er bredere enn skjermen. Rull den sidelengs …» er borte**, fordi tabellen ikke ruller lenger.
4. **Footer-utsnittet i org.nr.-artikkelen** er en liste med de fire linjene, ikke en terminal. Vindustittelen «footeren på denne siden» og skjermleserteksten er borte.
5. **Terminalutsnittet:** «dkim .... Ikke sjekket» står uten farge (v1 hadde varselfarge). Skjermleseretiketten fra v1 er borte, fordi linjene nå er ekte tekst.
6. **`/terminal/` har en terminal du kan skrive i**, også på berøringsskjerm. Ingressen sier at terminalen er av der (det gjelder snarveien `~`). Vil eier ha et stillestående utsnitt, fjernes attributtet og feltet.
7. **Meta-linja i registerartikkelen** står under H1 (`SideHode meta`), fordi ordlyden avviker fra den faste setningen i `Artikkelkropp`.
8. **Aksentfargen på det første nøkkeltallet er fjernet.** Tusjstreken rett over sier det samme tallet.
9. **`Hukommelse` står nå inne i `<main>`.** I v1 sto den etter `</Base>`.

## Filer endret

- Sider: `src/pages/artikler/index.astro`, `artikler/35-wcag-krav.astro`, `artikler/orgnr-pa-nettsiden.astro`, `artikler/wcag-i-registeret.astro`, `handbok.astro`, `personvern.astro`, `vilkar.astro`, `terminal.astro`
- Nye: `src/components/wow/les/{Registerstolper,Nokkeltall,Tusjstrek,Hukommelse}.astro`
- `public/terminal.js`
- `docs/design/rapporter/wow-r8-B3.md`, arbeidsfiler i `.skudd/wow/r8/B3/`

## Kilder

Ingen eksterne kilder hentet. Internt: `docs/design/rapporter/wow-r8-grunnmur.md`, `docs/design/wow-undersider.md` del 1.7, 1.9 og 4, `src/pages/artikler/cookies-for-samtykke.astro`, og bygget i `dist/client` (24. nov. 16:10) som sammenligningsgrunnlag.

## Åpne spørsmål og antakelser

1. **Personvernteksten som må rettes av tekstforfatter** (ikke rørt):
   - `/personvern`, under «Cookies», hele avsnittet: «Ett unntak, som ikke er en cookie: velger du lyst eller mørkt tema, lagres valget i nettleserens eget lager (`localStorage`) på din maskin. Det sendes aldri til serveren, og vi kan ikke lese det.» Ingenting lagres lenger.
   - `Hukommelse`, raden `kk-tema`: «Om du valgte lyst eller mørkt tema» og «Så siden ikke blinker hvitt neste gang du kommer.»
   - `Hukommelse`, raden `kk-prisvalg`: «Valgene dine i prisvelgeren» og «Så du ikke må huke av Vipps og regnskap på nytt.» Prisvelgeren som skrev nøkkelen, står bare på `/lab/lek`.
   - `Hukommelse`, siste avsnitt: «`localStorage` brukt til ren bekvemmelighet er ikke sporing …» forutsetter at noe lagres.
   - Rettes teksten, må «Sist oppdatert 5. oktober 2026» endres, og `KJENTE` i skriptet i `Hukommelse` følge radene. Blir tabellen tom, trenger den en setning.
2. **`Hukommelse` har ingen overskrift.** De tre målingene begynner rett etter «Endringer». Trenger en H2 fra tekstforfatter.
3. **Testene i `test/uuregister.test.ts` må oppdateres etter neste bygg** (jeg eier dem ikke). «stolpen er merket aria-hidden» leter etter `class="regstolper__stolpe"`. Ny markup er `class="wow-regstolper__spor"` med `aria-hidden="true"`. De to andre markup-testene består fortsatt (`wow-regstolper__tabell`, `wow-tusj--staar`). Suiten «stolpene kan ikke bli stående halvvokste» leser v1-fila og ryker når den slettes i bølge C.
4. **Felles komponenter, ikke rørt:**
   - `SideHode`: et langt ord i H1 sprenger siden på mobil («Personvernerklæring»). Trenger `overflow-wrap` eller orddeling.
   - `Handlinger` / `.wow-knapp`: lange knappetekster sprenger kolonnen på 320 px.
   - `Sporsmal`: samme for lange ord i spørsmålet på 320 px.
   - `SideHode`: standardslotten har ingen sidemarg, i strid med kommentaren i fila.
   - `Kontaktblokk`: standardingressen mangler «et prisspenn og» sammenlignet med v1.
5. **Terminalutsnittets siste linje** («Ingen brudd, 1 bør fikses, 1 ikke sjekket. Samlet: 67/100.») er ikke det terminalen skriver i dag. `skrivRapport()` gir «1 å fikse. Samlet: 67/100.». Teksten er beholdt ordrett; faktasjekker bør velge.
6. **Røde tester som ikke er mine:** `.DS_Store` i `public/media/wow/` (dukket opp igjen), `astro check` (B1), «alle fem verktøysidene slår den på» (verktøy), «statusordene er de samme …» i `test/sjekk-sekvens.test.ts` (`/sjekk`).
7. Antakelse: innholdsliste også på `/personvern` og `/vilkar` (planen krever den bare på håndboken).
8. Antakelse: «Kontrollert {dato}» på `/artikler/` er ordlyden fra planen (del 1.7).

## Neste steg

1. Dirigenten: `npm run verify` når alle gruppene er inne. Vent ett rødt punkt fra åpent punkt 3.
2. `tekstforfatter`: åpne punkter 1 og 2, og avvik 1 og 6.
3. `faktasjekker`: åpent punkt 5.
4. Eier av `side/*`: åpent punkt 4.
5. `kritiker`: registertabellen i smal visning og `/terminal/`.
6. Bølge C: slett v1 `Registerstolper`, `Nokkeltall`, `Tusjstrek`, `Hukommelse` når `/status` (B4) ikke lenger bruker `Nokkeltall`.
