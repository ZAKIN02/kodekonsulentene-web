# Søkeord og innhold

Skrevet 6. oktober 2026. Tre artikler levert, med kildene de bygger på og hullene
som står igjen.

## Forbehold om søkeord, les først

**Vi har ingen volumdata.** Google Keyword Planner er ikke hentet inn, og norske
søkevolum er nesten aldri offentlige. Alt under er derfor rangert etter hvor godt
søket matcher det vi faktisk selger og kan dokumentere — ikke etter hvor mange som
søker. Det er en vurdering, ikke en måling, og den skal erstattes så snart egne
tall finnes. Det står allerede som et åpent punkt i `docs/roadmap.md`.

Hvert søkeord under har en kilde. Fant jeg det ikke i en søkeresultatside eller i
et eksisterende dokument, står det ikke her.

## Søkeordene

### Gruppe 1 — cookies og samtykke

| Søk | Kilde |
|---|---|
| cookies samtykke nettside krav Norge | søkeresultat, flere norske byråer og Nkom rangerer |
| ekomloven § 3-15 | Nkom, Datatilsynet og Deloitte har egne sider om paragrafen |
| hvordan sjekke cookies nettsiden min | søkeresultat, flere «slik gjør du det»-artikler |
| nye regler for cookies 2025 | søkeresultat, flere byråer har datert innhold |
| trenger jeg cookie-banner | `docs/ai-synlighet.md`, spørsmål 5 |

Konkurransen her er norske digitalbyråer og noen advokatkontorer. Det de ikke har,
er et verktøy som kjører sjekken. Det er hele vinkelen vår.

### Gruppe 2 — universell utforming

| Søk | Kilde |
|---|---|
| 35 WCAG krav private virksomheter | søkeresultat, minst tre norske byråer bruker nøyaktig dette tallet |
| universell utforming nettside krav | søkeresultat, uutilsynet.no og Blindeforbundet rangerer |
| WCAG 2.0 eller 2.1 Norge | søkeresultat, forvirringen offentlig/privat går igjen |
| tilgjengelighetserklæring privat sektor | søkeresultat, spørsmålet stilles og besvares ulikt |

«35 krav» er et uvanlig presist tall som folk søker på direkte. Det er en god
inngang nettopp fordi det er spesifikt.

### Gruppe 3 — org.nr. og lovpålagt informasjon

| Søk | Kilde |
|---|---|
| må nettside ha organisasjonsnummer | `docs/ai-synlighet.md`, spørsmål 1 |
| foretaksregisterloven § 10-2 | Lovdata |
| ehandelsloven § 8 nettside informasjon | søkeresultat, Altinn og Forbrukertilsynet rangerer |
| hva må stå på nettsiden til en bedrift | Altinn har en egen side med nesten den ordlyden |

Et spørsmål folk stiller på Ung.no og i forbrukerfora, altså ekte usikkerhet.

## En legal rettelse som må videre

Oppdraget mitt sa at org.nr. på nettsiden er lovpålagt etter **foretaksnavnloven
§ 2-2**. Det stemmer ikke, og de to reglene blandes:

- **Foretaksregisterloven § 10-2** krever organisasjonsnummer og foretaksnavn på
  nettsidene. Det er hjemmelen for org.nr.-kravet.
- **Foretaksnavneloven § 2-2** krever at et enkeltpersonforetak har innehaverens
  etternavn i foretaksnavnet. Det er en helt annen regel.

`src/lib/sjekk.ts:304` siterer allerede foretaksregisterloven og er riktig.
`src/data/firma.ts:7` siterer foretaksnavnloven § 2-2, og er også riktig — den
forklarer hvorfor foretaksnavnet inneholder et etternavn. Begge stemmer altså.
Men blandingen er lett å gjøre, og artikkelen skiller dem nå eksplisitt.

## Artiklene

### `/artikler/cookies-for-samtykke`

Dekker: at § 2-7b er opphevet og § 3-15 gjelder fra 1. januar 2025, de fire
samtykkekravene fra personvernforordningen, kravet om at «Avvis alle» skal være
like lett som «Godta alle», de to unntakene, og hvem som fører tilsyn (Nkom
forvalter loven, Datatilsynet fører tilsyn med samtykket).

Leseren kan gjøre to ting selv: F12 → Application → Cookies i privat vindu, eller
kjøre `/verktoy/cookie-sjekk`, som også fanger cookies satt av JavaScript.

Avslutter med at vår egen side ikke setter cookies, og at leseren kan verifisere
det med stegene over. Det er den sterkeste påstanden vi har, fordi den kan
kontrolleres.

### `/artikler/35-wcag-krav`

Dekker: 35 av 61 kriterier i WCAG 2.0 nivå A og AA for private, mot 48 etter
WCAG 2.1 for offentlig sektor fra 1. februar 2023. At det ikke finnes noen terskel
for bedriftsstørrelse. At tilgjengelighetserklæring bare er påbudt for offentlig
sektor. De seks feilene som går igjen, med teksten hentet direkte fra `WCAG_NAVN`
slik at rapporten og artikkelen sier det samme.

Rekkefølge etter kostnad, uten kronebeløp — se neste avsnitt.

### `/artikler/orgnr-pa-nettsiden`

Dekker: foretaksregisterloven § 10-2 og ehandelsloven § 8 hver for seg, hva AS må
oppgi utover enkeltpersonforetak, at det er det *registrerte* foretaksnavnet som
skal stå, at «MVA» skal etter nummeret når foretaket er mva-registrert, og at
«geografisk adresse» er den som felles flest.

Bruker vår egen footer som eksempel, inkludert at vi selv står med «Oslo» uten
gateadresse og at det er noe vi rydder i. Det er ærligere enn å vise et perfekt
eksempel vi ikke oppfyller.

## Det jeg bevisst ikke skrev

- **Ingen kronebeløp per WCAG-krav.** Jeg har ingen målt kostnad per krav, og et
  anslag presentert som en pris er nøyaktig det `/caser` kaller «en løgn med
  desimaler». Artikkelen rangerer i stedet etter hva som koster minst, og sier at
  tastaturnavigasjon er der timene ligger.
- **Ingen søkevolum.** Se forbeholdet øverst.
- **Ingen navngitte dårlige eksempler.** `docs/metode-skanning.md` forbyr det, og
  alle tre artiklene sier eksplisitt at vi ikke navngir noen.
- **Ingen påstand om bøter.** Jeg fant ingen dokumentert bot mot en norsk
  småbedrift for noen av disse tre. Artikkelen om org.nr. sier rett ut at grunnen
  til å bry seg ikke er frykt for tilsyn, men at opplysningene gjør deg mulig å
  kontrollere.
- **Ingen påstand om at EAA/tilgjengelighetsdirektivet endrer kravet for private.**
  Kildene sier at webdirektivets nye krav ikke gjelder private, og at de 35 står.
  Tilgjengelighetsdirektivet er et eget regelverk med eget virkeområde, og jeg har
  ikke verifisert hvordan det slår ut for målgruppen vår. Det står derfor ikke i
  artikkelen i det hele tatt.

## Hullene — spørsmål målgruppen stiller som vi ikke besvarer

Rangert etter hvor nær de ligger et kjøp.

1. **«Hva koster en nettside i Norge?»** Vi har `/priser` og en kalkulator, men
   ingen artikkel som svarer på selve spørsmålet. Dette er sannsynligvis det mest
   søkte i hele listen, og vi har `src/data/markedspriser.ts` å bygge på.
2. **«Wix eller skreddersydd?»** Står i `docs/roadmap.md` for 61–90 dager. Høy
   kjøpsintensjon — den som søker vurderer å bytte.
3. **«Hvordan integrerer jeg Vipps på nettsiden?»** Vi selger nettopp dette, og
   `docs/integrasjoner.md` har stoffet. Ingen side svarer på det.
4. **«Hva bør en håndverker ha på nettsiden sin?»** `/bransjer/handverkere` finnes,
   men er en salgsside, ikke et svar.
5. **«Hvordan sjekker jeg om nettsiden min er sikker?»** Vi har verktøyet. Ingen
   artikkel forklarer hva de seks sikkerhetsheaderne faktisk gjør.
6. **«Hvilket bookingsystem passer for en klinikk?»** Nær `/bransjer/klinikker`,
   men det er et sammenligningsspørsmål vi ikke besvarer.

Punkt 5 er det billigste å skrive: dataene finnes i `maalinger.json`
({`harAlleSeksHeadere: 0`} — ingen av 38 sider hadde alle seks), verktøyet finnes,
og det knytter seg rett til den eksisterende `/sikkerhet`.

## Endringer utenfor mitt område

Artiklene er ikke lenket fra noen eksisterende side. De ligger i sitemap og er
indekserbare, men har ingen interne lenker inn. To forslag:

- **En oversiktsside på `/artikler`** som lister `artikler` fra
  `src/data/artikler.ts`. Registeret er laget for det.
- **Lenke fra verktøysidene til artikkelen som forklarer kravet.**
  `/verktoy/cookie-sjekk` → cookies-artikkelen, `/verktoy/uu-sjekk` →
  WCAG-artikkelen, `/sjekk` → org.nr.-artikkelen. Artiklene lenker allerede andre
  veien, så dette lukker sløyfen.

Begge krever endringer i filer andre agenter eide da dette ble skrevet.
