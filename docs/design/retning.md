# Retningsplaner A, B og C

Oppdrag: f1-designleder-retninger. Skrevet 2026-10-08 av `designleder`.
Grunnlag: briefen del 2, 4, 6, 8 og 12, `kartlegging.md`, `referanser.md` og `rapporter/f0-revisor-utgangsmaaling.md`.

Skills lastet: `frontend-design` (styrende), `design-system`, `design-handoff`. `kodekonsulentene-design` (v1) er bare brukt for logo (lime `#C8F24A`) og ytelsesbudsjettet.

## Felles for alle tre

Disse valgene gjelder i alle retningene. Da er det bare retningsvalgene som skiller prototypene.

- **Kontrast.** Alle tall under er **beregnet** med WCAG-formelen for relativ luminans. `revisor` måler dem. Krav: tekst ≥ 4,5:1, kontroller og grafikk som bærer mening ≥ 3:1.
- **Ingen grå småtekst.** Utgangsmålingen fant brudd nettopp der: `.small.muted` på 4,04:1 og 3,93:1. Derfor har ingen av retningene en dempet tekstfarge. Hierarkiet lages med størrelse, vekt og luft, ikke med gråtone. Dermed finnes ikke fargen som brøt kravet.
- **Brødtekst:** Schibsted Grotesk, én variabel woff2-fil (400–800), latin-subset. Ekte kode bruker systemets monospace. JetBrains Mono fjernes.
- **Ingen kursivord og ingen aksentord.** Kartleggingen viser at «kursivordet» er ett aksentfarget ord i h1 (`site.css:347`) og ett aksentord per `Mega`-overskrift. Ingen retning farger, kursiverer eller feter ett ord i en overskrift.
- **Åpningsoverlegget (`Apning.astro`) fjernes** i alle tre. Del 8: ingen innlastingsskjerm. NorSIS-tallene står da bare ett sted.
- **Video finnes allerede** (`<Storflate>` med `floke-*.mp4`, kartlegging avvik 1). Planene bygger ny scene med `<Scene>` fra del 8. Om de gamle klippene kan brukes, avgjør `produsent`.
- **Tall og tekst i skissene** er plassholdere. Priser leses fra `src/data/priser.ts` og står som `<pris Start>`. Overskrifter er briefens arbeidstitler til `tekstforfatter` har levert.
- **Stemme («jeg» eller «vi»):** se ÅPNE PUNKTER nederst. Skissene viser blokken «Hvem jeg er» med `MANGLER: portrett`.

---

## Retning A: «Befaring» (anbefalt i briefen)

### Farger

| Navn | Hex | Rolle |
|---|---|---|
| betong | `#E9EAE6` | Sidebunn i lyst tema. |
| papir | `#FBFBF9` | Skjema, rapport, tilbud og prisliste. Det som er «dokument». |
| blekk | `#111315` | All tekst på lys bunn. Bunnen i scenene og i mørkt tema. Kant på refleksfelt som er kontroller. |
| refleks | `#C8F24A` | Store flate felt: hovedknappen, garantifeltet og fastprisen nederst i rapporten. Aldri tynn glød, aldri tekstfarge på lys bunn. |
| snorblå | `#2443E0` | Lenker, målelinjer og påskrifter på arbeidstegningene. Navnet kommer fra blå kritt i slagsnora. |
| mangelrød | `#B3301B` | Mangler i rapporten: overstrekingen og ordet «Mangler». |

Kontrast (beregnet):

| Par | Forhold | Bruk |
|---|---|---|
| blekk på papir | 17,97:1 | brødtekst i rapport og prisliste |
| blekk på betong | 15,40:1 | brødtekst på sidebunnen |
| blekk på refleks | 14,41:1 | tekst i knapp og garantifelt |
| papir på blekk | 17,97:1 | tekst i scenen og i mørkt tema |
| refleks på blekk | 14,41:1 | knapp i scenen |
| snorblå på papir | 6,86:1 | lenker og påskrifter |
| snorblå på betong | 5,88:1 | lenker |
| snorblå på refleks | 5,50:1 | lenke i garantifeltet |
| mangelrød på papir | 6,04:1 | «Mangler» og overstreking (grafikk ≥ 3:1) |
| mangelrød på betong | 5,18:1 | samme hvis skjemaet ligger direkte på bunnen |
| refleks mot betong | 1,07:1 | **Ikke nok for en kontroll.** Derfor får refleksknapper 1 px kant i blekk (15,40:1), slik briefen sier. |

Mørkt tema: blekk er bunn, papir er tekst, refleks som før. Snorblå er for mørk på blekk, så mørkt tema bruker `#8FA2FF` til lenker (7,78:1 på blekk, beregnet). `designsystem-v2` fastsetter resten.

### Fontroller

- **Archivo, variabel (bredde 62–125, vekt 100–900), én fil.** Brukes bare til hero-overskriften, prisene og store tall. Hero settes bredt og tungt (bredde rundt 112, vekt 800), slik det står malt på en firmabil. Prisene settes smalt (bredde rundt 75) med tabelltall, slik at kronebeløpene står rett under hverandre i prislista. Én fil gir begge rollene.
- **Schibsted Grotesk** til all annen tekst, og til vanlige overskrifter i vekt 700.
- Valget blant de tre kandidatene i briefen: Archivo, fordi breddeaksen gir to roller fra én fil. Barlow Condensed og Big Shoulders har bare den smale stemmen. `kritiker` tester valget i skjermbildene.

### Oppsett

Én kolonne venstrejustert på betong. Den største tingen i hver skjermhøyde er et dokument eller en scene, aldri et kortrutenett. Rapporten og prislista er papirark med 2 px radius som ligger oppå bunnen. Scenen er et mørkt rom med 24 px radius.

### Første skjerm

Mobil (390 × 844):

```text
+--------------------------------------+
| [logo]                   Meny   [◐]  |
|                                      |
|                                      |
|  Gratis befaring                     |  Archivo bred 800, ca. 44 px
|  av nettsiden din                    |
|                                      |
|  <ingress, maks 2 linjer, fra        |  Schibsted 18 px, blekk
|   tekstforfatter>                    |
|                                      |
|  +--------------------------------+  |
|  | dinbedrift.no                  |  |  papir, 2 px kant i blekk, 56 px høyt
|  +--------------------------------+  |
|  +--------------------------------+  |
|  |##### Start befaringen #########|  |  refleksfelt, 1 px blekk-kant
|  +--------------------------------+  |
|                                      |
|  Eller book 20 minutter              |  snorblå lenke
|                                      |
| .-----------------------------------.|  topp av scenen (blekk, 24 px radius)
+--------------------------------------+  <- fold
```

Desktop (1440 × 900):

```text
+------------------------------------------------------------------------------------------+
| [logo]                                      Tjenester  Priser  Arbeid  Om  Kontakt  [◐]  |
|                                                                                          |
|                                                                                          |
|   Gratis befaring                                                                        |
|   av nettsiden din                                      Archivo bred 800, ca. 96 px      |
|                                                                                          |
|   <ingress, maks 2 linjer, fra tekstforfatter>                                           |
|                                                                                          |
|   +--------------------------------------------------+ +----------------------+          |
|   | dinbedrift.no                                    | |## Start befaringen ##|          |
|   +--------------------------------------------------+ +----------------------+          |
|   Eller book 20 minutter                                                                 |
|                                                                                          |
|                                                                                          |
|     .--------------------------------------------------------------------------------.   |
|     |  scenen (blekk) stikker 64 px opp over kanten og åpner seg når du ruller        |   |
+------------------------------------------------------------------------------------------+
```

### Tre prinsipper

1. **Dokumentet er grensesnittet.** Rapport, tilbud og prisliste ser ut som papir man får i hånda etter en befaring. Det som er resultat, står på papir. Det som er handling, står på refleks.
2. **Hver påstand har en målelinje.** Skjermbilder og scener får påskrift i snorblå som peker på en målt verdi. Har vi ikke målt det, står det ingen påskrift.
3. **Refleks er felt, ikke lys.** Lime brukes bare som store flate felt med blekk på. Det er aldri en glød, en strek eller tekst på lys bunn.

### Øyeblikk fra del 8

Alle seks: 1 scenen, 2 overskrifter linje for linje, 3 arbeid i bevegelse (krever skjermopptak fra eier), 4 sideoverganger, 5 prisvelgeren og 6 reel.

### Hva som skiller A fra B og C

A er den eneste retningen der **første handling er sjekken**, og den eneste der resultatet vises som et **fysisk dokument**. B åpner med film og C med pris. A har to lyse flatenivåer, betong og papir, og bruker snorblå. Ingen av de andre har en blåfarge.

### Kontroll mot del 4

| Punkt i del 4 | Hvordan A løser det | Endret etter kontroll |
|---|---|---|
| Nesten svart med syrlig lime | Lys standard. Lime er flate felt på lys bunn. | Ja. I første utkast ble mangler streket over i lime, slik briefen skisserer. Lime mot papir er bare 1,26:1, beregnet, og overstrekingen bærer mening, så den trenger 3:1. Overstrekingen er nå mangelrød (6,04:1), og ordet «Mangler» står i tillegg i teksten. Lime brukes bare på fastprisfeltet nederst i rapporten. |
| Mono-etiketter, nummererte etiketter, kort nummerert 01–03 | Ingen etiketter over seksjoner. Tjenester er tekstlenker. Nummer bare i «Slik går det», som er en rekkefølge, og der er det datoer i stedet for nummer. | Ja. Første utkast hadde «Rapport nr.» i mono øverst på skjemaet. Det er pynt. Fjernet. |
| «→» etter lenker | Lenker er understreket snorblå tekst uten tegn. | Nei |
| Kursivord / aksentord i h1 | Hele overskriften i blekk og samme snitt. | Nei |
| Årsaken er v1 | Planen følger ikke v1. Listen over opphevede regler kommer i `designsystem-v2.md`. | Nei |
| Ingen bilder eller bevegelse, ikke noe ansikt | Scene, arbeidstegninger på ekte skjermbilder, portrett på «Hvem jeg er». | Nei. Avhenger av eierens portrett og skjermopptak (MANGLER). |
| Samme rytme ti ganger | Bunnene veksler: betong, papir, blekk (scene), refleks (garanti). Bredden veksler mellom én kolonne, ark og full bredde. | Nei |
| Hero prøver å si alt | Overskrift, ingress, felt, knapp og én lenke. Pris, mva, terminal og nøkkeltall er flyttet ned. | Ja. Første utkast hadde en prislinje under feltet. Den sto også i prislista, så den ble fjernet. |
| Gjentakelser | Garantien bare i garantifeltet. Mva-setningen bare i prislista. Sjekken bare i heroen. Rapporten er resultatet av sjekken, ikke et nytt felt. | Nei |
| Snakker til utviklere | Ord fra håndverksfaget: befaring, rapport, fast pris. Terminal og snarveier er skjult. | Nei |
| Tre små interaktive ting | Én stor: scenen. Sjekken og prisvelgeren hører til scenen og rapporten. | Nei |
| Grå småtekst under 4,5:1 (utgangsmåling) | Ingen dempet tekstfarge. | Ja. Første utkast hadde «blyantgrå» til bildetekster. Den er fjernet, se felles regler. |

Byttetest: Ordene befaring, rapport og overlevering, refleksfelt på betong og snorblå målelinjer hører til et fag og en person. Uten logoen leser siden fortsatt som «den som befarer nettsiden din». Bestått på papiret. `kritiker` avgjør på skjermbildene.

---

## Retning B: «Verkstedet om natta»

### Farger

| Navn | Hex | Rolle |
|---|---|---|
| natt | `#0F1B2D` | Sidebunn i standardtemaet, som er mørkt. Tydelig blå, ikke nesten svart. |
| benk | `#18283F` | Andre flatenivå: rapport, prisliste og tekstplatene i scenen. |
| kritt | `#EEF1EC` | All tekst og alle målelinjer. Målelinjene er tegnet som kritt på et verkstedgulv. |
| refleks | `#C8F24A` | Bare store flate felt: hovedknappen og adressefeltets knapp. I filmen er lime det som lyser når lampen treffer en refleksvest. |
| signalrød | `#FF8A73` | Mangler i rapporten og feilmeldinger. |

Kontrast (beregnet):

| Par | Forhold | Bruk |
|---|---|---|
| kritt på natt | 15,16:1 | brødtekst og overskrifter |
| kritt på benk | 13,03:1 | tekst i rapport og prisliste |
| natt på refleks | 13,37:1 | tekst i knapper |
| refleks mot natt | 13,37:1 | knappeflate som kontroll |
| refleks mot benk | 11,49:1 | knappeflate på benk |
| signalrød på natt | 7,52:1 | «Mangler» |
| signalrød på benk | 6,46:1 | «Mangler» i rapporten |

Tekst ligger aldri rett på video. Teksten i scenen står på en plate i benk, så kontrasten er 13,03:1 uansett hva filmen viser. Det holder 4,5:1-kravet over video.

Lyst tema: kritt er bunn og natt er tekst (15,16:1). Signalrød blir for lys på kritt, så lyst tema bruker mangelrød `#B3301B` fra A.

### Fontroller

- **Big Shoulders Stencil, variabel.** Brukes bare til den ene setningen på første skjerm og til store tall. Sjablongskrift er det som står sprayet på kasser og maskiner i et verksted. Den skiller B tydelig fra A og C.
- **Schibsted Grotesk** til alt annet.
- `bygger` må kontrollere at fila har æ, ø og å før den tas i bruk (ÅPNE PUNKTER).

### Oppsett

Scenen fyller hele første skjerm, med én setning på natt over. Etter scenen kommer resten som ark i benk på natt. Adressefeltet står rett etter scenen.

### Første skjerm

Mobil (390 × 844):

```text
+--------------------------------------+
| [logo]                   Meny   [◐]  |  natt
|                                      |
|  <én setning, 2-3 linjer,            |  Big Shoulders Stencil, ca. 48 px, kritt
|   fra tekstforfatter>                |
|                                      |
| .----------------------------------. |
| |                                  | |
| |   scenen, 9:16                   | |  posterbilde, så video styrt av rulling
| |   plater og kabler i lampelys    | |
| |                                  | |
| |                                  | |
| |                                  | |
| |  +----------------------------+  | |
| |  | <steg 1, tekst på benk>    |  | |  tekstplate, kritt på benk
| |  +----------------------------+  | |
| '----------------------------------' |
|  Hopp over animasjonen   Spill av film|  kritt-lenke / knapp (reel)
+--------------------------------------+  <- fold
```

Desktop (1440 × 900):

```text
+------------------------------------------------------------------------------------------+
| [logo]                                      Tjenester  Priser  Arbeid  Om  Kontakt  [◐]  |
|   <én setning på én eller to linjer, fra tekstforfatter>       Stencil ca. 80 px, kritt  |
| .--------------------------------------------------------------------------------------. |
| |                                                                                      | |
| |                                                                                      | |
| |                    scenen, 16:9, nesten full bredde (24 px innrykk)                  | |
| |                    åpner seg til full bredde når du ruller                           | |
| |                                                                                      | |
| |   +--------------------------+                                                       | |
| |   | <steg 1, tekst på benk>  |                                                       | |
| |   +--------------------------+                                                       | |
| |                                                                                      | |
| '--------------------------------------------------------------------------------------' |
|   Hopp over animasjonen                                             [ Spill av film ]    |
+------------------------------------------------------------------------------------------+
```

### Tre prinsipper

1. **Lyset viser arbeidet.** Det som er viktig, er det som er belyst: scenen, refleksfeltet og skjermopptakene. Resten ligger i natt. Overskriftene står stille, så filmen er det eneste som beveger seg på første skjerm.
2. **Kritt, ikke neon.** Målelinjer og påskrifter tegnes i kritt, ikke i lysende farge. Det tekniske kommer fra opptakene, ikke fra fargene.
3. **Tekst står aldri i filmen.** All tekst over video ligger på en plate i benk. Lesbarheten er den samme med og uten bevegelse.

### Øyeblikk fra del 8

1 scenen (på første skjerm), 3 arbeid i bevegelse, 4 sideoverganger, 5 prisvelgeren og 6 reel («Spill av film» på første skjerm).
**Ikke med:** 2, overskrifter linje for linje. Når filmen fyller skjermen, blir bevegelig tekst i tillegg to store ting i samme skjermhøyde.

### Hva som skiller B fra A og C

B er den eneste retningen der **filmen er det første du ser**. Den er mørk som standard og har sjablongskrift. Målelinjene er i kritt, ikke snorblå. Reelen ligger på første skjerm. B har høyest wow og den tyngste første skjermen. Sjekken kommer etter scenen.

**Ytelsesrisiko:** Med scenen på første skjerm blir posterbildet LCP-elementet. Det er lov, for videoen er aldri LCP. Men posteren må være en lett AVIF med `fetchpriority="high"`, og `revisor` må måle LCP ≤ 2,5 s på mobil før B kan velges.

### Kontroll mot del 4

| Punkt i del 4 | Hvordan B løser det | Endret etter kontroll |
|---|---|---|
| Nesten svart med syrlig lime | Bunnen er tydelig blå (`#0F1B2D`), ikke nesten svart. Lime er bare flate felt og ting i filmen, aldri glød eller tekst. | **Ja, viktigst.** Første utkast hadde `#0B0F14` med lime som tynn lenkefarge. Det er dagens side med nye navn. Bunnen ble byttet til natt, lenkene til kritt med understrek, og tekst i lime ble fjernet. |
| Mono-etiketter og nummererte etiketter | Ingen. Sjablongskriften brukes bare til én setning og store tall, ikke til småetiketter. | Ja. Første utkast hadde små sjablongetiketter over seksjonene. Det er samme grep som `// 03` i ny drakt. Fjernet. |
| «→» og kursivord | Ingen piler. Setningen har ett snitt og én farge. | Nei |
| Årsaken er v1 | Følger ikke v1. | Nei |
| Ingen bilder, bevegelse eller ansikt | Film på første skjerm, skjermopptak, reel og portrett. | Nei |
| Samme rytme ti ganger | Bunnen veksler mellom natt, benk og full bredde med film. Ett kontrastbrudd: garantifeltet i refleks er sidens eneste lyse felt. | Nei |
| Hero prøver å si alt | Én setning, scenen og to handlinger: «Hopp over» (krav) og «Spill av film». | Ja. Første utkast hadde adressefeltet under scenen på første skjerm. Det ble to store ting, så feltet ble flyttet til etter scenen. |
| Gjentakelser | Som A. Reelen står bare på første skjerm. | Nei |
| Snakker til utviklere | Mørkt kan lese som utviklerside. Det motvirkes med verkstedbilder i filmen og ingen terminal. | Nei. Risikoen gjenstår, se byttetest. |
| Tre små interaktive ting | Én: scenen. | Nei |
| Grå småtekst under 4,5:1 | Ingen dempet tekst. | Nei |

Byttetest: B er svakest av de tre. Mørk side med stor film er nettopp lusion-genren. Det som gjør den til vår, er innholdet i filmen, verkstedet og befaringen, og sjablongskriften. Blir filmen generisk, stryker B på byttetesten. Det må `kritiker` se på filmstripa.

---

## Retning C: «Prislista»

### Farger

| Navn | Hex | Rolle |
|---|---|---|
| ark | `#F7F8F5` | Sidebunn. Kjølig hvit, ikke krem. |
| stempelblå | `#1E2A5E` | All tekst og alle kanter. Det er blått blekk, som stempelet og underskriften på et tilbud. |
| refleks | `#C8F24A` | Bare hovedknappen og det valgte alternativet i prisvelgeren. |
| mangelrød | `#B3301B` | Mangler og feil. |

Fire farger med vilje. C er retningen med minst. Det finnes ingen andre flatefarger. Prislista skiller seg fra bunnen med luft og typografi, ikke med et kort.

Kontrast (beregnet):

| Par | Forhold | Bruk |
|---|---|---|
| stempelblå på ark | 12,79:1 | all tekst |
| stempelblå på refleks | 10,50:1 | tekst i knapp og valgt pakke |
| mangelrød på ark | 5,90:1 | mangler og feil |
| refleks mot ark | 1,22:1 | **Ikke nok for en kontroll.** Refleksfelt får 2 px kant i stempelblå (12,79:1). |
| stempelblå kant mot ark | 12,79:1 | felt, radioknapper og fokus |

Mørkt tema: stempelblå er bunn og ark er tekst (12,79:1). Mangelrød byttes ut med signalrød `#FF8A73` fra B.

### Fontroller

- **Bare Schibsted Grotesk**, én variabel fil, til alt: prisen på første skjerm i vekt 800, ca. 120 px på desktop, med tabelltall, overskrifter i 700 og brødtekst i 400. Ekte kode bruker systemets monospace.
- Begrunnelse: C skal være den raskeste siden. Én fontfil i stedet for to. Schibsted er tegnet for et norsk mediehus og bærer stor skrift godt. Det er en norsk stemme uten en ekstra fil.

### Oppsett

Venstrejustert typografi på ark, i én bred kolonne. Prisen og løftet står på første skjerm i svært stor skrift, med pakkevalget rett under som tre store radioknapper i tekst. Scenen kommer først etter prislista.

### Første skjerm

Mobil (390 × 844):

```text
+--------------------------------------+
| [logo]                   Meny   [◐]  |
|                                      |
|  Nettside                            |  Schibsted 800, ca. 56 px, stempelblå
|  <pris Start> kr.                    |  tabelltall
|  Du ser den før                      |
|  du betaler.                         |
|                                      |
|  ( ) Start     <pris Start> kr       |  radioknapper, 48 px høye
|  ( ) Bedrift   <pris Bedrift> kr     |  valgt rad: refleksfelt, 2 px kant
|  ( ) System    <pris System> kr      |
|                                      |
|  +--------------------------------+  |
|  |####### Book 20 minutter #######|  |  refleks, 2 px kant i stempelblå
|  +--------------------------------+  |
|  Eller sjekk nettsiden din gratis    |  understreket lenke
+--------------------------------------+  <- fold
```

Desktop (1440 × 900):

```text
+------------------------------------------------------------------------------------------+
| [logo]                                      Tjenester  Priser  Arbeid  Om  Kontakt  [◐]  |
|                                                                                          |
|   Nettside <pris Start> kr.                                  Schibsted 800, ca. 120 px   |
|   Du ser den før du betaler.                                                             |
|                                                                                          |
|                                                                                          |
|   ( ) Start        <pris Start> kr      <én linje om hva pakken er>                      |
|   (•) Bedrift      <pris Bedrift> kr    <én linje>                    <- refleksfelt     |
|   ( ) System       <pris System> kr     <én linje>                                       |
|                                                                                          |
|   +------------------------+                                                             |
|   |### Book 20 minutter ###|   Eller sjekk nettsiden din gratis                          |
|   +------------------------+                                                             |
+------------------------------------------------------------------------------------------+
```

Når du velger en pakke, bytter tallet i overskriften. Uten JavaScript står de tre radene som en vanlig prisliste, og overskriften viser Start.

### Tre prinsipper

1. **Prisen er overskriften.** Det viktigste for kunden, hva det koster, står størst. Alt annet er mindre.
2. **Typografi er hele uttrykket.** Én familie, én tekstfarge og ett felt i refleks per skjermhøyde. Ingen kort, ingen skygger og ingen pynt.
3. **Raskest vinner.** Hvert element må tjene sin vekt. Én fontfil, ingen video før scenen lenger ned, og ingen GSAP før den trengs.

### Øyeblikk fra del 8

1 scenen (lenger ned, etter prislista), 2 overskrifter linje for linje (prislinja løftes inn på første skjerm, det er C sitt ene øyeblikk øverst), 4 sideoverganger og 5 prisvelgeren. Scenen stopper ved pakken du valgte på første skjerm.
**Ikke med:** 3, arbeid i bevegelse. Casene vises med stillbilder, fordi C er den raske retningen. Heller ikke 6, reel. Uten film i toppen har reelen ingen naturlig plass.

### Hva som skiller C fra A og B

C er den eneste retningen **uten bilde på første skjerm**, med **bare én fontfamilie** og **tekst i blått blekk** i stedet for svart. Første handling er å booke, ikke å sjekke (A) eller se på (B). Lavest wow, lettest side og mest direkte svar på kundens spørsmål om hva det koster.

### Kontroll mot del 4

| Punkt i del 4 | Hvordan C løser det | Endret etter kontroll |
|---|---|---|
| Nesten svart med syrlig lime | Lys standard. Tekst i blått blekk. Lime bare på knapp og valgt pakke. | Nei |
| Mono, nummererte etiketter og kort | Ingen etiketter. Pakkene er tekstrader, ikke tre like kort. | Ja. Første utkast hadde prikkelinjer mellom pakkenavn og pris, slik det står på en prisliste. AI-preg-sjekken teller midtprikker som pynt, og tabelltall i kolonne gjør samme jobb. Fjernet. |
| «→» og kursivord | Ingen. Begge setningene står i samme snitt og farge. | Ja. Første utkast hadde «Du ser den før du betaler» i refleksmarkering. Det er aksentgrepet på en hel setning. Fjernet. |
| Årsaken er v1 | Følger ikke v1. | Nei |
| Ingen bilder, bevegelse eller ansikt | Første skjerm er ren tekst med vilje. Scene, stillbilder av ekte arbeid og portrett kommer lenger ned. | Nei. Svakest her, og det er prisen for at siden er rask. |
| Samme rytme ti ganger | Typografien veksler i skala, fra 120 px pris til 18 px prisliste. Scenen er det eneste mørke rommet. | Nei |
| Hero prøver å si alt | Pris, løfte, pakkevalg og én handling. | Nei |
| Gjentakelser | Løftet står i heroen, så **garantifeltet fra A utgår i C**. Prisene står i heroen, så prislista lenger ned viser bare vilkårene og hva som er med. | **Ja.** Første utkast hadde både garantifelt og full prisliste. Da hadde løftet og prisene stått to ganger hver. |
| Snakker til utviklere | Kronebeløp og «du ser den før du betaler» er kundens språk. | Nei |
| Tre små interaktive ting | Én: prisvelgeren, som henger sammen med scenen. | Nei |
| Grå småtekst under 4,5:1 | Én tekstfarge. | Nei |

Byttetest: Svært få byråer har prisen som hovedoverskrift. Åpne, faste priser på første skjerm er en posisjon, ikke en stil. Faren er at ren typografi på lys bunn ser ut som hvilken som helst minimalistisk side. Det tallet og det blå blekket må bære. Bestått på papiret.

---

## Hvordan valget kan begrunnes

| | A Befaring | B Verkstedet om natta | C Prislista |
|---|---|---|---|
| Første handling | Sjekk nettsiden | Se filmen | Book 20 minutter |
| Standardtema | Lyst (betong og papir) | Mørkt (natt) | Lyst (ark) |
| Displayfont | Archivo, bred og smal | Big Shoulders Stencil | Ingen. Bare Schibsted |
| Aksent ved siden av lime | Snorblå | Kritt | Stempelblå er tekstfargen |
| Øyeblikk | 1–6 | 1, 3, 4, 5, 6 | 1, 2, 4, 5 |
| Største risiko | Mange deler og avhenger av eierens materiale | LCP og byttetesten | For lite bevis på første skjerm |
