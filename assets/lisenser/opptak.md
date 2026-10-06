# Opptak av våre egne verktøy

Disse filene er skjermopptak av KodeKonsulentenes egne verktøy mens de kjører.
Ingenting er generert, og ingenting er iscenesatt: tallene og statusene i bildet
er det verktøyet faktisk svarte da opptaket ble gjort.

Lages med `node scripts/opptak.mjs <id>`. Opptaket er en bildesekvens, ikke en
videoinnspilling, fordi klippene spoles av scroll og hver ramme leses som et
stillbilde.

| Fil | Hva det viser | Kilde | Rettigheter | Dato | Av |
|---|---|---|---|---|---|
| `public/opptak/rontgen-{1920,1280,960}.mp4`, `rontgen-poster.avif` | Røntgenlinsen på vår egen forside. Sikkerhetsheaderne er de serveren faktisk sender (`sikkerhet.mjs`); WCAG-punktene er kravene fra `src/data/wcag.ts`. | `scripts/opptak.mjs`, opptak «rontgen» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/priskalkulator-{1920,1280,960}.mp4`, `priskalkulator-poster.avif` | Priskalkulatoren som regner mens valgene krysses av. Summen går fra 29 900 kr til 288 000–373 500 kr med postene som egne linjer. | `scripts/opptak.mjs`, opptak «priskalkulator» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/dmarc-{1920,1280,960}.mp4`, `dmarc-poster.avif` | DMARC-sjekken med ekte DNS-oppslag mot nkom.no: SPF bestått (`-all`, 4/10 oppslag), DKIM ikke sjekket, DMARC `p=quarantine`, samlet 83 av 100. | `scripts/opptak.mjs`, opptak «dmarc» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/uu-sjekk-{1920,1280,960}.mp4`, `uu-sjekk-poster.avif` | Universell utforming kjørt mot digdir.no gjennom vår egen skanner i produksjon: 0 maskinelle brudd, 1 regel som må testes manuelt, skannet på 2,5 s, WCAG 2.0 A + AA. | `scripts/opptak.mjs`, opptak «uu-sjekk» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/cookie-sjekk-{1920,1280,960}.mp4`, `cookie-sjekk-poster.avif` | Cookie-sjekken mot digdir.no: 0 cookies før samtykke, 0 sporingstjenester, 0 tredjeparts-cookies, 0 lagring i nettleser, skannet på 1,2 s uten å klikke. | `scripts/opptak.mjs`, opptak «cookie-sjekk» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/lagstabel-{1920,1280,960}.mp4`, `lagstabel-poster.avif` | Lagstabelen dratt fra hverandre av komponentens egen spak: Design (det kunden ser), Kode, Sikkerhet, Integrasjoner (booking, Vipps, regnskap). Teksten er komponentens egen. | `scripts/opptak.mjs`, opptak «lagstabel» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/sammenlign-{1920,1280,960}.mp4`, `sammenlign-poster.avif` | Slepesammenligningen: 50 av 100 mot 90 av 100. Begge kolonner målt med vår egen sjekk samme dag; den sjekkede siden er ikke navngitt, og forbeholdet står i bildet. | `scripts/opptak.mjs`, opptak «sammenlign» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/terminal-{1920,1280,960}.mp4`, `terminal-poster.avif` | Terminalen kjører `sjekk` og `headere` mot vårt EGET domene i produksjon: 6/6 headere, 0 cookies, 0 uu-feil, org.nr. bekreftet, samlet 90 av 100 – med forbeholdet «1 ikke sjekket» synlig. | `scripts/opptak.mjs`, opptak «terminal» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/flyt-{1920,1280,960}.mp4`, `flyt-poster.avif` | Flytdiagrammet på `/systemer` som tegner seg selv mens siden scrolles: Kunde → Booking → Vipps → Fiken → SMS, med detaljlinjen under hver node. Figuren er `Flyt.astro`, tegnet i SVG og animert i CSS. | `scripts/opptak.mjs`, opptak «flyt» | Eget verk | 2026-10-06 | KodeKonsulentene |
| `public/opptak/skjema-{1920,1280,960}.mp4`, `skjema-poster.avif` | Kontaktskjemaet som validerer uten JavaScript: rød kant og ✕ når e-posten mangler krøllalfa, grønn kant og ✓ når den er hel. Tilstanden kommer fra `:has(.control:user-invalid)` i `site.css`. | `scripts/opptak.mjs`, opptak «skjema» | Eget verk | 2026-10-06 | KodeKonsulentene |

## Om nkom.no

Oppslaget er et offentlig DNS-oppslag mot et offentlig domene, slik hvem som
helst kan gjøre det. Vi leser bare DNS; ingen e-post sendes og ingenting lagres.
Resultatet er dessuten positivt for nkom.no – 83 av 100 – så opptaket henger
ingen ut.

## Om digdir.no

Begge skanningene er kjørt mot et offentlig nettsted med de samme verktøyene
hvem som helst kan kjøre fra `/verktoy`. Vi leser bare det siden selv sender.

Valget av subjekt er et ærlighetsspørsmål, ikke en tilfeldighet.
`Slepesammenligning.astro` sier at **vi publiserer ikke navn på sider som kommer
dårlig ut**. nkom.no stryker på uu-sjekken med tre brudd og kunne derfor ikke
brukes her, selv om den er brukt i DMARC-opptaket der den kommer godt ut.
digdir.no består begge sjekkene – 0 brudd og 0 cookies før samtykke – så å
navngi dem bryter ingen regel vi har satt oss selv.

At digdir.no tilhører Digitaliseringsdirektoratet, altså etaten bak regelverket
sjekkene måler mot, er en bonus. Det er ikke grunnen til at de ble valgt.
