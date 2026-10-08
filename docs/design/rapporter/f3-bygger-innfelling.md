# Rapport: f3-bygger-innfelling

Øyeblikk 2, 3, 5 og 6 felt inn på forsiden etter kontraktene i docs/design/bevegelse.md. 2026-10-08.
Komponentene i src/components/bevegelse/ er brukt uendret; all tilpasning er styling utenfra i mine egne filer.

## Hva som er gjort

- **Øyeblikk 2 (Loft):** h1 i Tilbud og alle åtte seksjons-h2 (Rapport, Arbeid, Tjenester, Prisliste, Prosess, Hvem, Spørsmål, Kontakt) rendres nå med `<Loft>`, med samme id-er som før, så `aria-labelledby` står. Bare overskrifter – brødtekst, kort og bilder står stille. Garantien er et avsnitt, ikke en overskrift, og står stille. Tilbuds-h1-stilene gikk fra scoped `h1` til `.tilbud :global(h1)` fordi overskriften nå rendres av komponenten.
- **Øyeblikk 3 (CaseVideo):** de to app-plassholderne i Arbeid er byttet til `<CaseVideo opptak="/opptak/app-1|2" poster="/opptak/app-1|2-poster.avif">` inni `article[data-case]`. Filene finnes ikke, så komponenten viser selv den mørke «MANGLER: skjermopptak»-flaten (ingen 404). Når eier leverer opptak på de stiene, virker hover/fokus-avspilling uten kodeendring.
- **Øyeblikk 5 (Prisvelger):** den statiske velgeren og stillbilde-figuren i Prisliste er erstattet med `<Prisvelger navn="hero" etikett="Velg pakke" bakgrunn="#080809">` med stoppunktene 0/3/6 s mot hero-videoen. Tekst uendret fra manuset (pakkelinjene), priser fra `priser.ts` («fra» kommer fra `prefiks`). Standard statusmal er ordrett manusets `velger.status`. Desktop-oppsettet (rader venstre, videoflate høyre, v2 4.2) og Archivo-prisene settes med `:global`-styling fra Prisliste – komponenten er urørt. Kolofonen «Illustrasjon laget med KI» står rett under komponenten.
- **Øyeblikk 6 (Reel):** `<Reel film="/film/reel" knapp="Spill av filmen">` står i Arbeid, mellom demo-caset og pilotavsnittet. Filmen finnes ikke, så komponenten viser «MANGLER: skjermopptak»-plassholderen. Se åpne punkter om plasseringen.

## Målt og kontrollert

- `npx astro check`: 0 feil, 0 advarsler.
- Playwright-sjekk (desktop, uten redusert bevegelse): 9 Loft-overskrifter animert, alle `data-ferdig` og tilbake til ren tekst (ingen spenn igjen); valg av Bedrift laster `hero-1080.mp4`, spoler til 3,0 s og statusen leser «Valgt: Bedrift. Illustrasjonen viser hva som er med.»; 2 CaseVideo- og 1 Reel-plassholder; **ingen konsollfeil**.
- Uten JavaScript: alle 15 kontrollsetninger finnes, prisvelgeren er vanlig prisliste med Start valgt (`input.checked` = true), posterbildet er stillbilde. Ingen regresjon mot forrige oppdrag.
- Skjermbilder: 54 utsnitt i `.design/arbeid/bygger-forside/innfelling/` (mobil først, begge temaer) pluss `prisvelger-bedrift--desktop.png` (videoen ved 3 s med Bedrift valgt). Mørkt tema: uvalgte ringer i papir mot blåkopi, valgt rad refleks med blekk-ring – som 7.8.

## AI-preg-sjekken

- Inntoning bare på h1/h2 (Loft), én gang. Ingen inntoning på kort, avsnitt eller bilder.
- All annen bevegelse svarer på handling og forklarer noe: valget spoler objektet til pakkens stoppunkt, case-opptak spiller ved peker/fokus/synlighet, reel-dialogen åpnes ved klikk.
- Ingen nye gjentakelser; prisene står fortsatt bare i velgeren.

## Åpne punkter

1. **Reel-plasseringen er min beslutning, ikke manusets.** Forsidemanuset (retning A) definerer ingen reel; bare retning B-manuset har `reel.knapp` («Spill av filmen» – gjenbrukt her) og `reel.innhold` (MANGLER fra eier). Plassert i Arbeid etter briefen del 6 punkt 8/12. Tekstforfatter bør gi forsiden egne reel-id-er, og dirigenten bekrefte plasseringen.
2. Dialogens `aria-label` («Film: appene og sidene i bruk») er kontrolltekst jeg har satt; vises aldri visuelt og brukes først når filmen finnes.
3. Eier må levere: `/opptak/app-1|app-2` (+ postere) og `/film/reel` (20–30 s), minst 1080p.
4. Egen JavaScript-vekt (fem småskript, ingen GSAP) er ikke målt i bygg – revisor måler mot 20 kB-budsjettet.
5. Stoppunktene 0/3/6 s forutsetter at hero-klippet er 6 s; stemmer med kontraktens beskrivelse, ikke verifisert mot fila med ffprobe.
