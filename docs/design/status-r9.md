# Status redesign/wow – 26. nov. 2026

Hvor langt arbeidet har kommet, skrevet av dirigenten. Gjelder grenen `redesign/wow`.
Ingenting er publisert eller merget. Det krever fortsatt et eksplisitt «GODKJENT» fra eier.

## Ferdig

### Hele nettsiden i nytt design
- Alle 27 undersider og 404 er flyttet fra v1 (`Base.astro`) til `MalWow`. Rapporter:
  `docs/design/rapporter/wow-r8-grunnmur.md`, `wow-r8-B1.md` til `wow-r8-B4.md`, `wow-r8-samling.md`.
- Bare mørkt tema (eiers valg 24. nov.). Temabryteren, `TEMA_SCRIPT` og lagret `kk-tema` er fjernet.
- `/retning/a/` er slettet (eiers valg).
- 21 døde v1-komponenter og lyst-tema-CSS er slettet.
- Målt 24. nov. (`wow-r8-samling.md`): 28 sider × 320/390/1440 med axe 0, sidelengs overflyt 0,
  én H1, 0 konsollfeil, alle interne lenker 200. SEO-felt og JSON-LD uendret mot v1.
- Revisor r7 før flyttingen: `docs/design/rapporter/wow-r7-revisor.md`.

### Tekst
- Eiers valg 24. nov. er lagt inn (`docs/design/tekst/r8-rettelser.md`): lagringen `wow-inngang` er
  fjernet, ingen påstand om besøksstatistikk, `/terminal` er skrivbar, «2 vår» → «Fra telefonen».
- Tre formuleringer er skrevet av bygger og står til eiers godkjenning (se «Venter på eier»).

### Rullefilmen hakker ikke lenger (`docs/design/rapporter/wow-r7-flyt.md`)
- Ny avspilling med WebCodecs til lerret, `<video>` som reserve. Filer: `src/scripts/wow/spole.ts`,
  `rullefilm.ts`, `scroll-world.ts`, `scripts/kod-rullefilm.sh`.
- Tid bildet ligger bak rullingen: ca. 49 % → 4,4–5,0 % (Chrome og WebKit, desktop og strupet mobil).
- LCP forside 2744 → 2599 ms (krav 2500, ikke nådd ennå). Første innlasting 383 → 259 kB.
- Ikke testet på ekte iPhone/Android.

### Ny forsidefilm: manus og prøveproduksjon
- Manus: `docs/design/regi/film-manus.md` (v1–v2) og `docs/design/regi/film-manus-v3.md`
  (v3–v6, del 8–10). Gjeldende er del 10 (v6): ti tagninger, 98 s, koreografi per tagning.
- Historien: én bestilling går gjennom en gate med et sykkelbud og en gul lapp (bakeri, kontor,
  rørlegger). Til slutt fryser alt, og gata viser seg å være en modell på pulten vår.
- Prompter: `assets/higgsfield/regi/prompter/` (v3–v9). Logg over hver generering og vurdering:
  `assets/higgsfield/logg.md` (runde wow-r8-prove til wow-r8-prove-7).
- Higgsfield-CLI er koblet til Ultra-kontoen (ny bruker, arbeidsområdet er valgt).
  Saldo etter runde 7: ca. 3872 kreditter.
- Lærdom fra sju runder:
  1. Høyst to–tre handlinger per tagning.
  2. Aldri kamera fra ett rom til et annet i samme tagning (gir dobbelteksponering). Bruk harde kutt.
  3. Ingenting skal dekke linsa, og ingen figur skal komme inn i eller gå ut av bildet.
  4. Figurer bakfra eller i profil.
  5. **Delte sømbilder:** samme bilde som `--end-image` i tagningen før og `--start-image` i tagningen
     etter. Sømmen T2→T3a gikk da fra 15,8 til 30,6 dB.
  6. 1080p holder start- og sluttbildet like dårlig som utkast (0,2 dB forskjell), så utkast er en god
     forhåndsvisning.
  7. Ikke bruk modellarket (N0) som referanse. Det lekker inn i klippene.
- Beste utkast per tagning (runde 7): T1 16, T2 17 (også laget i 1080p og godkjent), T3a 17, T3b 15,
  T4a 15, T4b 16, T5a 16, T5b-1 17, T5b-2 13, T6 17.

## Avbrutt da økta stoppet (må startes på nytt)

1. **Endelig produksjon i 1080p** (oppdrag wow-r9-endelig, ramme 2100 kreditter). Plan: rette N5c
   (porten i feil gate) og T5b-2/T6 i utkast, fastsette delte sømbilder for hele filmen, lage alle ti
   tagninger i 16:9 1080p, teste Higgsfield `reframe` til 9:16. Sjekk `assets/higgsfield/logg.md` og
   `assets/higgsfield/regi/klipp/` for hvor langt det kom før det stoppet.
2. **Bevegelsesrevisjon** (oppdrag wow-r9-bevegelse-revisjon) med motion-skillene: revisjon av all
   bevegelse på siden, retting av P0/P1, og motoren klar for de nye klippene (ti segmenter, tre harde
   kutt T3a→T3b, T3b→T4a og T5b-1→T5b-2, krysstoning ca. 0,05 skjermhøyder i myke sømmer, hold på
   frysrammen i T6). Ingen rapport ble skrevet. Endringer i `src/scripts/wow/` og
   `src/components/wow/` kan være halvferdige.

## Kjent feil
- `npm run verify` 26. nov.: 361 av 362 tester grønne. Rød: «statiske filer har riktig MIME-type» i
  `test/bygget-html.test.ts:58`. Ikke undersøkt. Trolig fra den avbrutte bevegelsesrevisjonen eller nye
  filtyper i `public/`.
- `/lab/lek` skriver fortsatt `kk-prisvalg` til localStorage (v1 `Prisvelger`). Lab-sidene er noindex og
  utenfor nettstedskartet, men personvernteksten sier at siden ikke lagrer noe.
- LCP på forsiden 2599 ms mot krav 2500.

## Venter på eier
- Godkjenne tre formuleringer: «Vi har ingen besøksstatistikk på siden i dag.» (/personvern),
  «Vi setter ingen cookies.» (/nettsider), og /personvern-beskrivelsen «… Ingen cookies og ingen sporing.»
- `/caser`: tekst og tall til casene (i dag bare booking-demoen, ingenting er diktet opp).
- `/om`: portrett, eller la stå uten (siden snakker som «vi»).
- `/verktoy`: finnes pakken på npm og `kodekonsulentene/norsk-lovsjekk@v1` som GitHub Action?
  Til da står «Motoren er åpen kildekode» ute.
- Test rullingen på ekte iPhone og Android.
- «GODKJENT» før noe publiseres eller merges.

## I git
Råfiler fra Higgsfield (kandidatbilder, utkast, råklipp, ca. 1,8 GB under `assets/higgsfield/`) er
pushet etter ønske fra eier 26. nov., i flere commits per mappe. Måle- og arbeidsmappene `.skudd/` og
`.design/` er fortsatt utenfor git (kontaktark og opptak).

## Neste steg
1. Start den endelige filmproduksjonen på nytt fra loggen (produsent).
2. Start bevegelsesrevisjonen på nytt og rett den røde MIME-testen (bevegelse).
3. Kod de ferdige klippene med `scripts/kod-rullefilm.sh` og sett dem inn (bevegelse).
4. Ny revisjon av hele siden, med Lighthouse og LCP (revisor), og kritikk (kritiker).
5. Eier ser og skriver «GODKJENT», så merge og deploy.
