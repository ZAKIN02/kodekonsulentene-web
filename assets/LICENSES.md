# Lisenslogg for medier

Hver fil som ikke er skrevet av oss selv skal stå her, med kilde, lisens og dato.
Dette er beviset vårt hvis noen spør. Mangler en fil her, skal den ut av repoet.

Regelen: ingen bilder hentet fra tilfeldige nettsider. Alle fotografier er vernet
etter åndsverkloven § 23, uansett kunstnerisk nivå, og at et bilde ligger åpent på
nettet gir ingen bruksrett.

| Fil | Kilde / verktøy | Prompt eller URL | Lisens | Dato | Ansvarlig |
|---|---|---|---|---|---|
| `public/historie/historie-720.mp4`<br>`public/historie/historie-1080.mp4`<br>`public/historie/poster.avif` | Higgsfield – SOUL V2 (plate) → Kling 2.5 Turbo Pro (bilde-til-video), betalt API-plan | Plate: «Exploded view of a layered rectangular interface panel suspended in dark empty space … no text, no letters, no logos, no people», 16:9, 1080p, seed 202.<br>Video: «The stacked plates separate and drift apart vertically in sequence from bottom to top … Smooth weightless mechanical motion, cold neutral light.», 10 s | Generert av oss på betalt plan. Kommersiell bruk tillatt etter leverandørens vilkår. Rene KI-bilder får trolig ikke opphavsrettsvern i Norge, se merknad under. | 2026-10-06 | KodeKonsulentene |
| `public/fonts/schibsted-grotesk-*.woff2` | Schibsted Grotesk, via Google Fonts | github.com/schibsted/Schibsted-Grotesk | SIL Open Font License 1.1 – tillater selvhosting og kommersiell bruk | 2026-10-06 | KodeKonsulentene |
| `public/fonts/jetbrains-mono-*.woff2` | JetBrains Mono, via Google Fonts | github.com/JetBrains/JetBrainsMono | SIL Open Font License 1.1 | 2026-10-06 | KodeKonsulentene |
| `public/fonts/schibsted-grotesk-var-latin.woff2`<br>`public/fonts/schibsted-grotesk-var-latin-ext.woff2` | Schibsted Grotesk (variabel), kildefil `SchibstedGrotesk[wght].ttf` fra github.com/google/fonts (ofl/schibstedgrotesk), instansiert til wght 400–700 og subsettet til latin/latin-ext med fontTools 4.51 | github.com/google/fonts/tree/main/ofl/schibstedgrotesk | SIL Open Font License 1.1 (OFL.txt i samme mappe, lest 2026-10-08) – tillater endring, subsetting, selvhosting og kommersiell bruk | 2026-10-08 | KodeKonsulentene |
| `public/fonts/archivo-var-latin.woff2` | Archivo (variabel), kildefil `Archivo[wdth,wght].ttf` fra github.com/google/fonts (ofl/archivo), instansiert til wght 700–800 og wdth 75–112, subsettet til latin med fontTools 4.51 | github.com/google/fonts/tree/main/ofl/archivo | SIL Open Font License 1.1 (OFL.txt i samme mappe, lest 2026-10-08) – tillater endring, subsetting, selvhosting og kommersiell bruk | 2026-10-08 | KodeKonsulentene |
| `src/data/uu-register.json` | Uu-tilsynets åpne datasett «Erklæringar med resultat», hentet med `scripts/uuregister.mjs` | [data.uutilsynet.no/dataset/alle-erklaeringer](https://data.uutilsynet.no/dataset/alle-erklaeringer) · [dokumentasjon](https://www.uutilsynet.no/innsikt-og-analyse/opne-data-fra-tilgjengelegheitserklaeringane/3076) | **Ingen lisenstekst oppgitt.** Se merknaden under. | 2026-10-07 | KodeKonsulentene |

## Merknader

**Hvorfor fontene er selvhostet.** De lå på Google Fonts, og vår egen cookie-skanning
fant kallene til `fonts.googleapis.com` og `fonts.gstatic.com` på vår egen forside.
Ingen cookies ble satt, men hver besøkende sendte IP-adressen sin til Google før de
hadde gjort noe – på en side som selger «ingen tredjeparter før samtykke». Fontene
ligger nå i `public/fonts` (116 kB totalt, latin og latin-ext), og CSP-en tillater
ikke lenger noen ekstern fontkilde.

**Opphavsrett til KI-innhold.** Åndsverkloven § 2 krever «individuell skapende
åndsinnsats», og i norsk juridisk teori legges det til grunn at bare mennesker kan
skape åndsverk. Rene KI-genererte bilder får derfor trolig ikke vern, og kan i
prinsippet kopieres av andre. Det er foreløpig ingen norsk rettspraksis.

**Merking.** Vi merker KI-illustrasjoner synlig i kolofonen. Plikten til
maskinlesbar merking etter EUs AI-forordning artikkel 50 ligger på leverandøren av
verktøyet, og forordningen var ikke innlemmet i EØS-avtalen per september 2026.
Vi merker likevel, fordi det er god skikk og forebygger villedning etter
markedsføringsloven.

**Motivregler.** Ingen ekte logoer, ingen gjenkjennelige personer, ingen tekst inne
i bildet. Integrasjoner vises som nøytrale ikoner eller med partnerens egen
logopakke etter deres retningslinjer – aldri generert.

**Uu-tilsynets datasett, og hva vi faktisk fant.** Tilsynet for universell utforming
av ikt publiserer alle ferdigstilte tilgjengelighetserklæringer under overskriften
«Opne data frå tilgjengelegheitserklæringane» (side opprettet 11. februar 2026), med
feltdokumentasjon og et eksempelskript for å laste ned hele settet. Kontaktpunktet er
`post@uutilsynet.no`.

**Vi fant ingen lisenstekst for settet, og det er etterprøvd, ikke antatt** (7. oktober 2026):

- Tilsynets egen dokumentasjonsside oppgir ansvarlig og kontakt, men ingen lisens.
- `data.uutilsynet.no/dataset/metadata` svarer **HTTP 500** med en Java-stacktrace.
- Settet lot seg ikke finne i Felles datakatalog på fritekstsøk etter
  «tilgjengelighetserklæring», «uutilsynet» eller «alle-erklaeringer».

Enhetsregisteret føres under NLOD 2.0 på data.norge.no; **det sier ingenting om dette
settet**, og vi fører det derfor ikke som NLOD.

Vurderingen vår: vi publiserer ikke datasettet, vi publiserer **vår egen aggregering**
av det – summer og andeler, ingen virksomhetsnavn, ingen organisasjonsnumre, ingen
adresser – med kilde, hentedato og lenke tilbake til kilden på hver rad. Et offentlig
register som eieren selv kaller åpne data og tilbyr nedlastingsskript for, aggregert og
attribuert, er innenfor. Skal vi en dag publisere rådata eller enkeltoppføringer, må
lisensen innhentes fra tilsynet først.

Dette er ikke juridisk rådgivning.

Dette er ikke juridisk rådgivning.

## public/scener/hero/
- Type: KI-generert video og stillbilde. Merket på siden: «Illustrasjon laget med KI».
- Plattform: Higgsfield (API), betalt konto. Vilkår punkt 4.4 lest 2026-10-08 (lest av brief, ikke åpnet på nytt av produsenten; eier bekrefter).
- Bilder: A (16:9) Qwen Image 3 (`alibaba/qwen-image-3/text-to-image`, 2k), forsøk 3 av 3. B (16:9) og mobilbildene (9:16 A og B) Grok Imagine Image 2.0 (`xai/grok-imagine-image-2.0`, 2k), redigert fra A. B flyttet 55 px opp med ffmpeg (ingen oppskalering) for å treffe bunnplaten i A. Generert 2026-10-08. C (16:9) er ikke levert.
- Video: Kling 3.0 pro (`kling-video/v3.0/pro/image-to-video`), 6 s, lyd av, klipp A i 16:9 (forsøk 1 i pro etter 2 std-utkast) og 9:16 (forsøk 1 i pro etter 1 std-utkast). Generert 2026-10-08. Klipp B (B til C) finnes ikke.
- Prompter: assets/higgsfield/prompter/ (stilkort, bilde-A-v3, bilde-B-v4, bilde-A-mobil, klipp-A-v2). Fullt forsøksforløp i assets/higgsfield/logg.md.
- Etterarbeid: scripts/lag-scene.sh hero.
- Innhold: ingen logoer, varemerker, personer eller navngitte kunstneres stil.
- Kreditter brukt: ca. 67 (estimat fra POST /estimate for hele oppdraget, inkludert forkastede bilder og std-utkast).
