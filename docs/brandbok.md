KodeKonsulentene er et utviklermiljø i Oslo som bygger nettsider, interne systemer og apper for norske småbedrifter – sikkert, raskt og til fast pris. Designsystemet skal få en besøkende til å tro tre ting på fem sekunder: dette er bygget av noen som kan mer enn nettsider, det går fort, og det er trygt. Alt under følger av det.

> «Nettsider som virker. Systemer som henger sammen.»

## Prinsipper

1. **Vis, ikke påstå.** Siden er det første caset. Ekte tall (`mono-stat`), ekte skjermbilder, et verktøy som faktisk kjører. Ingen stock-illustrasjoner, ingen AI-bilder, ingen floskler som «digitale opplevelser».
2. **Presisjon er estetikken.** Tynne linjer (`hairline` i `line`), små radier (`radius-sm`, `radius-md`), monospace der det er tall eller system. Dybde kommer fra kanter, ikke skygger (`shadow-none` er standard).
3. **Én detalj per skjerm.** Aksentfargen `accent` brukes på én ting i hvert visningsområde: primærknappen, et tall, en markør. Blir det to, fjern den ene.
4. **Alt skal kunne måles.** Lighthouse 95+, WCAG 2.2 AA, ingen cookies før samtykke. Systemet gir ingen komponent lov til å bryte det det selges for.

## Innhold og tone

- Skriv bokmål i du-form. Direkte, konkret, uten superlativer: «Levert på 3 uker. Last-tid 0,8 s.» – ikke «lynrask og moderne».
- Tall og tid før adjektiver. Skriv `0,8 s`, `29 900 kr`, `72 timer` i `mono` eller `mono-stat`; aldri i display-fontene.
- Overskrifter i setningsform med stor forbokstav bare først: «Prototype på 72 timer». Ingen punktum i overskrifter, punktum i ingresser.
- Eyebrows over seksjoner i `mono-label`, versaler, med nummer: `// 02 TJENESTER`. Nummereringen følger rekkefølgen på siden.
- Knapper er verb i imperativ og under fire ord: «Book 20 minutter», «Sjekk nettsiden din». Aldri «Klikk her», aldri «Be om tilbud» som eneste valg.
- Ingen anglisismer der det finnes et norsk ord: «nettside», ikke «website»; «kundeportal», ikke «dashboard». Unntak: etablerte navn (Vipps, Fiken, Lighthouse, WCAG).
- Priser skrives med mellomrom som tusenskiller og «kr» etter, alltid med «eks. mva» synlig i samme visning: `29 900 kr eks. mva`.
- Ingen emoji. Ingen utropstegn. Teknisk humor er tillatt i terminalmodus (`Terminal`), ikke i tilbud eller priser.
- Snakk om resultater, ikke teknologi: «færre telefoner, betalt med Vipps» foran «React og Supabase». Teknologi nevnes i case-detaljer og i `Terminal`, der det hører hjemme.

## Farger

Mørkt tema (`dark`) er standard og første tema; lyst tema (`light`) følger `prefers-color-scheme` og brukerens valg via `data-theme`. Alle komponenter skal se riktige ut i begge.

- Sidegrunn er `bg`. Kort og paneler er `bg-raised` med `hairline` kant i `line` – aldri skygge for å skille dem fra grunnen. Inputfelt og innfelte flater er `bg-sunken`.
- Terminal- og rapportblokker er `terminal` i begge temaer, med `on-terminal` som tekst, `on-terminal-muted` til prompt-tegn og `accent` til markører. Det er den ene flaten som ikke bytter tema; det er med vilje.
- Tekst er `ink` på `bg`, `bg-raised` og `bg-sunken`. Sekundærtekst er `ink-muted`, metadata `ink-faint`. Ikke lag lysere gråtoner – `ink-faint` er gulvet (≥ 4,5:1 i begge temaer).
- `accent` er fyll (primærknapp, aktiv markør), aldri tekst på lyse flater. Tekst i aksentfargen er `accent-text`, som i lyst tema er en mørk oliven slik at den leser 4,5:1. Tekst på `accent`-fyll er `on-accent` – alltid mørk, aldri hvit.
- Status har tre nivåer, alltid med ord eller ikon ved siden av fargen: `ok` (teal, «bestått»), `warn` (amber, «bør fikses»), `fail` (rød, «brudd»). `ok` ligger mot blå for å ikke være avhengig av rød–grønn-skillet. Hvert nivå har en `-soft`-tone til merker og rapportrader.
- Fokus er `focus`: 2px solid ring med 2px offset i `bg`-fargen. Den er aksentfarget i mørkt tema og `ink` i lyst tema, slik at den holder 3:1 på alle flater. Fjern aldri fokusringen.
- Lenker i løpende tekst er `link` (alias av `ink`) med 1px understrek i `line-strong`; hover flytter understreken til `accent-text`. Lenker i navigasjon har ingen understrek, men `accent-text` på aktiv side.
- Forbudt: mesh-gradienter, glassmorphism, fargede venstrekanter på kort, lilla/blå «AI-farger». Én grain-tekstur via CSS på `bg` er tillatt hvis den holder seg under 4 % opasitet.

## Typografi

Tre familier med klare roller; ingen av dem heter Inter eller Roboto.

- **Display – Schibsted Grotesk** (`display`, Google Fonts, variabel 400–900, last bare 700–800). Overskrifter og store tall. Stilene er `display-xl` (hero, én per side), `display-lg` (sidetitler, seksjonstitler), `heading` (korttitler, FAQ-spørsmål) og `subheading` (undertitler, pakkenavn). Alltid negativ sperring og tett linjeavstand. Fonten er tegnet for et norsk mediehus, og det er grunnen til at vi bruker den: den ser norsk ut uten å si det.
- **Tekst – systemfont** (`sans`). Null nedlasting, maks ytelse. `body-lg` til ingresser, `body` til alt annet, `body-strong` til knapper og fremhevinger, `small` til hjelpetekst og footer. Maks 70 tegn per linje; ingressen maks 60.
- **Mono – JetBrains Mono** (`mono`, Google Fonts, last 400 og 500–600). Alt som er tall, kode, status eller system: `mono-stat` til live-tall, `mono` til terminal, rapporter, URL-er og priser i tabeller, `mono-label` til eyebrows og merker. Monospace er det tekniske sporet i merkevaren – bruk det der innholdet faktisk er teknisk, ikke som pynt på brødtekst.
- Last fontene med `font-display: swap` og `preconnect` til Google Fonts. Fallback-stakkene i `type.families` er valgt slik at layouten holder uten webfont.
- Mobil: `display-xl` går til 40px/40px, `display-lg` til 32px/36px. Alle andre stiler er like på alle skjermer.

## Avstand, radier og kanter

- 4px-rutenett (`space-1` … `space-9`). Komponenter bruker `space-1` – `space-6`, seksjoner `space-7` – `space-9`. Sidens maksbredde er 1120px med `space-5` marg på mobil og `space-6` på desktop.
- Kort og terminalblokker har `radius-md`; knapper, inputfelt og kodebiter `radius-sm`; `radius-pill` bare på `StatusBadge` og «Anbefalt»-etiketten. Ingen andre radier.
- Alle kanter er `hairline` (1px). Det eneste 2px-strøket er fokusringen og understreken på aktiv lenke (`focus-width`).
- Layout: innhold i ett spor på mobil, 12 kolonner på desktop. Tjenester og priser er tre kort i bredden med `space-6` mellom. Ingen bento-rutenett med ulike kortstørrelser.

## Bevegelse

- Bare mikrointeraksjoner: hover på knapper og kort (kantfarge `line` → `line-strong`, 120 ms), «kopiert»-bekreftelse, tall som teller opp én gang når de kommer i syne (400 ms, `ease-out`).
- Ingen scroll-jacking, ingen parallax, ingen tekst som «skriver seg selv» uten innhold – unntaket er `Terminal`, der en markør kan blinke og kommandoer kan skrives inn fordi det *er* innholdet.
- Respekter `prefers-reduced-motion`: alt over 0 ms blir 0 ms.
- Ingen 3D, ingen WebGL. Ytelsesbudsjettet (Lighthouse 95+) går foran all bevegelse.

## Ikoner og bilder

- Ikoner: strektegnede, 1,5px strek, 20px standard, i `currentColor`. Bruk Lucide (MIT) som sett; ikke bland med andre sett. Ikoner står alltid ved et ord – aldri alene som eneste bærer av mening.
- Statusikoner er faste: `ok` = hake, `warn` = trekant med utropstegn, `fail` = kryss i sirkel. Fargene følger `ok`/`warn`/`fail`.
- **Hvert bilde må bestå én prøve: dekk til teksten ved siden av. Skjønner en rørlegger
  eller klinikkeier hva bildet handler om?** Gjør han ikke det, forklarer bildet ingenting,
  og da skal det ikke stå der. Prøven ble kjørt på hele nettstedet: 14 av 16 genererte
  motiver strøk. Alle fem skjermopptakene besto.

- **Rangordningen er bindende. Velg alltid det høyeste alternativet som er mulig:**

  1. **Opptak av verktøyet eller arbeidet i drift.** Ekte kjøring mot ekte adresse, med
     resultatet verktøyet faktisk gir. Dette beviser at produktet virker i stedet for å
     antyde det, og kan ikke kopieres av noen som ikke har bygget det.
  2. **Diagram med ekte navn.** «Booking → Vipps → Fiken → SMS 24 t før», ikke abstrakte
     former. Tegnet i SVG, animert i CSS, null kilobyte.
  3. **Ingenting.** En ren tekstflate er bedre enn et bilde som ikke sier noe.

  Generert materiale står ikke på listen, og er bare tillatt som bakgrunnstekstur under
  tekst – aldri som motiv noen skal se på og forstå.

- Skjermbilder får `hairline` kant i `line` og `radius-md`. Ingen stockfoto.

- Et bilde skal aldri fremstå som bevis på noe som ikke finnes. Genererte mennesker,
  kunder, kontorer eller leveranseresultater er forbudt uten unntak.

  Denne regelen het først «ingen AI-genererte bilder». Jeg myknet den opp 6. oktober 2026
  for å slippe til generert materiale, og stilte spørsmålet «lyver bildet?» – men glemte det
  viktigere: «sier bildet noe i det hele tatt?» Et generert motiv kan være fullstendig
  sannferdig og likevel verdiløst. Formuleringen «typografiens tredimensjonale fetter» var et
  forsvar for dekorasjon, skrevet inn i et dokument som ellers krever at alt gjør en jobb.
  Kunden så det med én gang: «bildene gir ingen historie eller mening».

- Logo: monogrammet «KK» på en flis i `accent` (`assets/Logo/kk-mark.svg`) og ordmerket «KodeKonsulentene» som baner. Bruk `kk-lockup-dark.svg` i mørkt tema og `kk-lockup-light.svg` i lyst tema i header og footer; merket alene som favicon og app-ikon. Reglene for friareal og farger står i `assets/Logo/README.md`. I `Terminal` kan navnet fortsatt stå som `~/kodekonsulentene` i `mono` – det er en signatur, ikke logoen.

## Komponenter

Komponentene ligger i `components/bundle.js` som `window.KK` og forventer React 18 på siden. De speiler forsidens rekkefølge, og hver har egne retningslinjer:

- `Eyebrow` – nummerert seksjonsetikett i `mono-label`.
- `Button` – `primary` (én per visning), `secondary`, `ghost`.
- `UrlCheck` – URL-felt med knapp; hero-ens sekundære CTA og sidens leadmagnet.
- `ProofStrip` – bevis-stripen under hero: fire–fem målbare påstander.
- `ServiceCard` – de tre tjenestekortene.
- `StatusBadge` – `ok`/`warn`/`fail` med ord.
- `CheckReport` – rapportrader fra «Sjekk nettsiden din».
- `Terminal` – terminalblokk for signaturdetaljen og tekniske case-detaljer.
- `PriceCard` – prispakke med «Anbefalt»-etikett og «eks. mva».
- `ProcessSteps` – fire steg med tidsangivelse.
- `LegalFooter` – lovpålagt informasjon: foretaksnavn, org.nr., adresse, kontakt, lenker.

Legg aldri til en komponent som ikke kan plasseres i sidestrukturen i `monstre.md`.
