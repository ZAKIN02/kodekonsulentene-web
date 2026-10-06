# Opptak av egne verktøy

## Hvorfor

En visuell gjennomgang (`docs/syn2.md`) fant at **19 av 21 medieelementer viser
det samme genererte objektet** – en stabel aluminiumsplater på nesten svart.
Hvert bilde er godt for seg, men gjentatt nitten ganger slutter det å si noe:
bytter du underside, skifter teksten, mens bildet ser likt ut.

Brandboken rangerer dessuten ekte materiale høyest. Prinsipp 1 er «Vis, ikke
påstå … ekte skjermbilder, et verktøy som faktisk kjører», og det eneste
materialet på nettstedet som virkelig overbeviser er opptaket av sjekken som
kjører mot nkom.no på `/verktoy`.

Dette er mer av det.

## Hva som ble laget

| Opptak | Varighet | 1920 | Hva det beviser |
|---|---|---|---|
| `rontgen` | 8 s | 2,01 MB · 2,11 Mbit/s | At vi faktisk kan lese hva som ligger under en side |
| `priskalkulator` | 9 s | 5,25 MB · 4,89 Mbit/s | At prisen er en utregning med poster, ikke et forhandlingsutspill |
| `dmarc` | 9 s | 6,02 MB · 5,61 Mbit/s | At verktøyet gjør et reelt DNS-oppslag |
| `uu-sjekk` | 6 s | 3,84 MB · 5,37 Mbit/s | At sjekken starter en ekte nettleser og kjører axe-core |
| `cookie-sjekk` | 6 s | 3,72 MB · 5,21 Mbit/s | Hva «før samtykke» faktisk betyr, målt |
| `lagstabel` | 6 s | 4,24 MB · 5,93 Mbit/s | **Hva en nettside består av** – fire lag med navn og forklaring |
| `sammenlign` | 6 s | 3,19 MB · 4,46 Mbit/s | **Hva forskjellen er i tall** – 50 av 100 mot 90 av 100 |
| `terminal` | 8 s | 2,27 MB · 2,38 Mbit/s | At verktøyene er ekte, kjørt mot vårt eget domene |
| `flyt` | 7 s | 5,04 MB · 6,04 Mbit/s | **Hva «systemer som snakker sammen» betyr** – fem noder med ekte navn |
| `skjema` | 6 s | 1,92 MB · 2,69 Mbit/s | **At skjemaet sier fra før du sender** – rød ✕, grønn ✓, null JavaScript |

Alle i 1920, 1280 og 960 med AVIF-plakat. CRF 19 og `-g 8`, som de genererte
scenene. Dimensjonene i `src/data/opptak.json` er målt med `ffprobe` etter at
filene er laget – aldri skrevet for hånd, fordi en håndskrevet dimensjon på
logoen ga CLS 0,145 i produksjon.

## Hvorfor bildesekvens og ikke `recordVideo`

1. Klippene spoles av scroll. Brukeren stopper på enkeltrammer og leser dem som
   stillbilder, så stillbildekrav gjelder. `recordVideo` gir variabel
   bildefrekvens og ujevn tidsakse.
2. Pekerposisjon og avkryssing settes **per ramme**, så opptaket er
   determenistisk og kan kjøres om igjen med identisk resultat.
3. Vi tar opp på dobbel pikseltetthet (3200×1800) og skalerer ned. Det gir
   merkbart skarpere skjermtekst enn en 1:1-innspilling.

## Hvor de bør plasseres

Jeg eier ikke sidefilene, så dette er anbefalinger:

- **`rontgen` → `/sikkerhet`.** Den er sidens signaturinteraksjon og viser
  bokstavelig talt det siden selger. `Rontgen.astro` har aldri blitt plassert
  utenfor `/lab`; et opptak virker også der komponenten ikke passer inn.
- **`priskalkulator` → `/priser`**, over prislisten. Den viser at prisen er en
  utregning med poster, før leseren ser tallene.
- **`dmarc` → `/verktoy/dmarc`**, og eventuelt `/sikkerhet`. Den er det korteste
  beviset på at verktøyene gjør reelle oppslag.

Bruk `Demo.astro`, ikke `SceneFilm`. `Demo` rammer opptaket med hårlinje og
radius, slik brandboken krever for skjermbilder, og har bildetekst med kildedato.
`SceneFilm` toner video ned som bakgrunn – det leser som tapet, ikke som bevis.
Komponenten tar `smal`, `bred`, `plakat`, `tekst` og `kilde`; verdiene ligger
ferdig i `src/data/opptak.json`.

`Demo` støtter i dag bare `smal` og `bred`. 1920-filene blir liggende ubrukt til
komponenten får et `stor`-trinn, slik `SceneFilm` og `HeroFilm` har fått.

## To feil som ble funnet ved å se på resultatet

**DMARC-opptaket slo først opp feil domene.** Tidsaksen skrev `n = floor((a /
0,45) × lengde)` og sendte ved `a ≥ 0,45`, så siste tegn ble aldri skrevet.
Oppslaget gikk mot `nkom.n`, et domene som ikke finnes, og rapporten viste «SPF:
BRUDD, mangler». Bildeteksten ville påstått et ekte oppslag mot nkom.no. Hele
strengen skrives nå ferdig, og verdien verifiseres før Enter.

**To bildetekster overdrev.** Den første for kalkulatoren sa at tallet er «den
samme utregningen du får i et tilbud» – mens siden selv sier «Et estimat er et
spenn. Et tilbud er et tall». Den for røntgen slo sammen sikkerhetsheadere (ekte
svar fra serveren) og WCAG-punkter (kravene siden måles mot) som om begge var
funn på siden. Begge er rettet.

## Kjøring

```
node scripts/opptak.mjs --liste
node scripts/opptak.mjs rontgen                  # mot lokal server på 4493
node scripts/opptak.mjs dmarc --base https://kodekonsulentene.no
node scripts/opptak.mjs rontgen --behold         # behold rammene for feilsøk
```

Opptak som avhenger av skanner-tjenesten (`uu-sjekk`, `cookie-sjekk`) må tas opp
mot produksjon, der tjenesten kjører. Lokalt degraderer de ærlig til «Skanneren
er ikke satt opp ennå» – riktig oppførsel, men ikke materiale som selger:

```
node scripts/opptak.mjs uu-sjekk --base https://kodekonsulentene.no
node scripts/opptak.mjs cookie-sjekk --base https://kodekonsulentene.no
```

## Subjektvalget er et ærlighetsspørsmål

`Slepesammenligning.astro` sier: «Den sjekkede siden er ikke navngitt – vi
publiserer ikke navn på sider som kommer dårlig ut.» Den regelen binder også
opptakene.

nkom.no **stryker** på uu-sjekken – tre brudd på `link-name`, WCAG 2.4.4 – og
kunne derfor ikke brukes, selv om den er riktig subjekt for DMARC-opptaket der
den kommer godt ut med 83 av 100. digdir.no består begge: 0 maskinelle brudd og
0 cookies før samtykke. Da bryter det ingen regel å navngi dem.

Vår egen forside ble også vurdert og forkastet som subjekt – ikke av hensyn til
regelen, som ikke gjelder oss selv, men fordi den **stryker med ni
kontrastbrudd** (se under).

## De tre som forklarer produktet, ikke bare verktøyene

De fem første beviser at **verktøyene** virker. Det er nyttig, men en kunde som
ikke vet hva en nettside består av, blir ikke klokere av å se en DNS-sjekk.

- **`lagstabel`** svarer på spørsmålet kunden stiller først: *hva er det jeg
  kjøper?* Fire lag, hvert med navn og en setning: Design (det kunden ser), Kode
  (det som gjør at det virker), Sikkerhet (det ingen spør om før det er for
  sent), Integrasjoner (booking, Vipps, regnskap). Ingen abstrakt render sier
  det. Denne er bokstavelig, og teksten er komponentens egen.
- **`sammenlign`** er det nærmeste vi kommer et før/etter: 50 av 100 mot 90 av
  100, med radene som skiller dem navngitt. Utsnittet tar med bunnteksten med
  vilje, for der står vår egen regel om at vi ikke navngir sider som kommer
  dårlig ut.
- **`terminal`** kjører `sjekk` og `headere` mot **vårt eget domene**. Subjektet
  er et valg: den fulle sjekken gir digdir.no 3/6 headere og 1 uu-feil, altså
  middels, og da forbyr vår egen regel å navngi dem. Regelen gjelder ikke oss,
  så vi måler oss selv – inkludert forbeholdet «Ingen brudd, men 1 ikke sjekket».

Alle tre drives av komponentenes **egne kontroller** – samme spak en
tastaturbruker bruker – så opptaket viser komponenten gjøre det den gjør.

## Hvordan utsnittet regnes ut

Motivet VANDRER i to av dem. Lagstabelen står 95 px høyere samlet enn adskilt,
og modalen i `terminal` vokser fra 138 til 490 px mens kommandoene kjører. Måles
utsnittet i én stilling, klipper det motivet i en annen.

Derfor måles unionen av det faktiske blekket gjennom hele forløpet – for
stabelen ved spak 0, 25, 50, 75 og 100 – og rettes så opp til 16:9. Utsnittet
oppgis som et fast objekt i `klipp`, ikke som en velger.

Små utsnitt tas opp tettere. Lagstabelen er 926×520 CSS; på tetthet 2 blir det
1852 px bredt, altså en **oppskalering** til 1920. Scenen kan derfor overstyre
`tetthet`.

## Måleverktøyet som ikke virker på tekst

`scene_score` i ffmpeg – som `.skudd/maal-doedhale.mjs` bruker – oppdager
scene­skift, ikke tekst som skrives fram. På `terminal` rapporterte den 0,0000
for hvert eneste sekund, i et klipp der både kommandoer og svar kom til syne.

For tekstklipp må man måle faktisk pikselforskjell i stedet:

```
ffmpeg -i rammeA.png -i rammeB.png \
  -filter_complex "blend=all_mode=difference,signalstats,metadata=print:file=-" -f null -
```

Det avslørte det `scene_score` skjulte: mellom de to kommandoene sto bildet
stille i halvannet sekund (0,001 i endring). Den andre kommandoen ble derfor
byttet fra `pris` (fire tegn, for kort til å fylle midten) til
`headere kodekonsulentene.no` (27 tegn). Tasting er liten endring, men det ER
endring – og den holder strekningen i live.

## Hvorfor klippene er 6 s og ikke 10

Første forsøk brukte 10 s. En rapport fra en side som består er kort, så
rulletrekket blir nesten null, og de siste 65 % av fila viste et bilde som ikke
endret seg – 1,2 MB på mobil der halvparten var stillstand. Det er samme feil
som `verktoy`-klippet har, der all endring skjer mellom 15 % og 45 %.

Med 6 s og tidsaksen flyttet (skriving 0–30 %, lastetilstand 30–42 %, rapport
42–100 %) falt mobilfila til 0,73 MB for `uu-sjekk` og 0,57 MB for
`cookie-sjekk`, uten at noe innhold gikk tapt.

Ventetiden komprimeres med vilje: rammene tas sekvensielt, så et `await` inne i
ramme-funksjonen pauser opptaket i stedet for å fylle fila med spinner. Det er
ikke juks – rapporten viser selv «Skannet på 2,5 s», som er den ekte tiden.

## To funn utenfor opptakene

**`Demo.astro` laster for tidlig.** `rootMargin: "200% 0px"` betyr at videoen
hentes når rammen er innenfor to og en halv skjermhøyde – altså før brukeren har
scrollet. Målt på mobil, førstelast:

| Side | Med video | Uten video | Lastet før scroll |
|---|---|---|---|
| `/verktoy/dmarc` | 1304 kB | 142 kB | **1162 kB** |
| `/verktoy/uu-sjekk` | 886 kB | 139 kB | **747 kB** |
| `/verktoy/cookie-sjekk` | 715 kB | 133 kB | **582 kB** |
| `/verktoy/priskalkulator` | 145 kB | 145 kB | 0 kB |

Kalkulatoren koster ingenting fordi opptaket ligger langt nok ned på en lang
side til at 200 % ikke rekker. De tre andre betaler full pris før brukeren har
bedt om noe. `SceneFilm` hadde samme feil og ble satt til `60%`; `Demo` står
fortsatt på `200%`. Én linje, og tre sider faller til ~140 kB førstelast.

**Vår egen forside stryker på uu-sjekken.** Ni brudd på `color-contrast`
(WCAG 1.4.3, alvorlighet «serious»), alle i terminalblokken: `.kk-fail` og
`.kk-warn` har for svak kontrast mot bakgrunnen. Kjør selv:

```
curl -sS -X POST https://kodekonsulentene.no/api/uu-sjekk \
  -H 'content-type: application/json' -d '{"url":"https://kodekonsulentene.no"}'
```

Det er «den feilen flest faktisk merker», med vår egen formulering, på siden som
selger universell utforming. Fargene ligger i `src/styles/`, så det er ikke
rettet her.

## Runde to: `flyt` og `skjema`

Kunden ba om flere videoer, og om at de skal være **elegante**. Eleganse er en
begrensning, ikke en invitasjon: færre bevegelser, ett grep om gangen, ingenting
som konkurrerer. Derfor to opptak og ikke fire.

### `flyt` – flytdiagrammet tegner seg selv

Én gest: scroll. Ingen peker, ingen klikk. Nodene heter Kunde, Booking, Vipps,
Fiken og SMS – ikke abstrakte former. Brandboken rangerer «diagram med ekte
navn» som nivå 2 og «opptak av verktøyet i drift» som nivå 1; dette er begge
deler samtidig, fordi figuren *er* en komponent som tegner seg mens du scroller.

**Redusert bevegelse måtte av for denne scenen.** Opptakskonteksten setter
`reducedMotion: reduce` globalt, og det er riktig for de andre – sidens egen
inntoning er bare støy. Men `Flyt` slår da av tegningen (`animation: none
!important`) og står ferdig. Opptaket ville vist et stillbilde av den eneste
figuren vi har der tegningen selv er motivet. Scenen kan nå overstyre med
`bevegelse: "no-preference"`.

**Ikke klippet, og vinduet er smalere.** Figuren vandrer 829 px opp gjennom
visningsvinduet mens den tegnes – målt: rammen står på topp 900 når første strek
begynner og på topp 71 når den siste er ferdig. Et fast utsnitt kan ikke romme
den, og et utsnitt per ramme ville ristet. I stedet rammer et smalere vindu den:
figuren er 1056 px bred uansett vindusbredde, så i 1600 fyller den 66 % av
bredden og drukner i teksten rundt, mens den i 1200 fyller 88 %. Målt på fem
bredder. Scenen kan nå overstyre med `vindu`.

### `skjema` – kontaktskjemaet sier fra før du sender

Tre slag: navnet fylles ut, e-posten er ugyldig og blir rød med ✕, e-posten
rettes og blir grønn med ✓. Alt sammen er `:has(.control:user-invalid)` i
`site.css` – ikke en linje JavaScript. Det beviser en håndverkspåstand vi ellers
bare kunne hevde.

## To feil funnet ved å se på resultatet, igjen

**`kari@eksempel` er en GYLDIG e-postadresse.** Første forsøk brukte den som
ugyldig verdi, og feltet ble grønt: `input[type=email]` godtar `bruker@vert`
uten toppdomene. Rødtilstanden – halve poenget – dukket aldri opp. Verdien er nå
`kari`, uten krøllalfa, som er utvetydig ugyldig.

**Tabulatortasten rullet skjemaet ut av bildet.** Første forsøk tabbet mellom
feltene, og nettleseren rullet neste felt inn i synsranden. Flaten vandret ut av
det faste utsnittet, og de tre siste sekundene viste bunnteksten.
`document.activeElement.blur()` utløser `:user-invalid` like godt uten å flytte
siden, og scrollposisjonen låses i tillegg hver ramme.

## Hvile er ikke det samme som dødtid

`skjema` har tre frosne intervaller av 23, og de er med vilje: etter at navnet er
skrevet, på den røde tilstanden, og på den grønne. Et skjema som fylles ut uten
pause er stressende, ikke elegant – øyet trenger tid til å lese ✕ før det blir ✓.
Det som ble ryddet bort var noe annet: en første versjon på 7 s lot den grønne
tilstanden lande på 90 % av tidslinjen, slik at de siste 0,7 sekundene sto helt
stille i strekk. Nå er klippet 6 s og hvilene ligger spredt der de betyr noe.

`flyt` har null frosne intervaller av 27.

## To opptak ble valgt bort, og hvorfor

**Temabyttet lys/mørk.** Én klikk, hele siden snur. Teknisk elegant, men det
består ikke brandbokens prøve: dekker du til teksten ved siden av, forstår ikke
en rørlegger hva det handler om. Det viser at vi har bygget to temaer – en
kvalitetsdetalj, ikke et svar på «hva får jeg kjøpt?».

**404-siden som terminal.** Sjarmerende, men det er en påskeegg og ikke et bevis.
Den selger ingenting, og brandboken rangerer «ingenting» over et bilde som ikke
sier noe.

**Skannertjenesten** er allerede dekket: `uu-sjekk` og `cookie-sjekk` kjører den
mot digdir.no i produksjon, så tjenesten vises i drift der.
