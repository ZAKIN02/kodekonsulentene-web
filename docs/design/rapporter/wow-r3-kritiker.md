# Kritikk wow-r3: forsiden med kameraturen mot syntaxstudio.no

Grunnlag: bare bilder. `.skudd/wow/sw/sw-0.png` til `sw-6300.png` og `ark.png` (desktop, ett bilde per 900 px rulling), `.design/arbeid/produsent/sw-kjede-16x9.png` og `sw-kjede-9x16.png` (rammeark), `.skudd/wow/r2b/` (hele siden, tatt med postere), `.skudd/wow/r2/` (runde 2) og `.skudd/sammenligning/syntaxstudio/`. Kontrollert mot `wow-r1-kritiker.md` etter at bildene var sett.

Forbehold: Det finnes ingen bilder av kameraturen på mobil, og ingen av lyst tema. Mobilkarakteren bygger derfor på r2b, der toppen viser de gamle posterne, og på rammearket i 9:16.

**Dom:** Klart bedre enn r1, men fortsatt ikke på syntax-nivå. Leiredioramaet er det første på siden som bare kunne vært vårt i retning: en rørlegger med varebil og et bakeri, altså kunden selv. Men overgangene i signaturøyeblikket har synlige feil i nesten hvert bilde mellom kapitlene: to bildetekster oppå hverandre, dobbeltbilder fra krysstoningen og en kapittelskinne som viser feil kapittel. Filmen viser heller ingenting av befaringen. Etter filmen kommer en tom rapport og tre like kort med små skjermbilder. Syntax vinner fortsatt på bilde, rytme og troverdighet.

## Karakterer (1–10)

| | Oss r1 | Oss r3 | Syntax |
|---|---|---|---|
| Førsteinntrykk | 6 | 7 | 8 |
| Typografi | 7 | 7 | 7 |
| Bilde/medier | 3 | 5 | 9 |
| Bevegelse | 5 | 6 | 7 |
| Rytme | 4 | 5 | 8 |
| Mobil | 6 | 6 (ikke kontrollert med klippene) | – |
| Troverdighet | 5 | 5 | 9 |

Kort om karakterene:
- **Førsteinntrykk 7:** Dioramaet med trikken er varmere og mer eget enn regnvinduet. Det ligger likevel bak et mørkt slør og under en h1 på 1 100 px bredde (sw-0). Komposisjonen er den samme som i r1, med tekst over et mørkt bilde.
- **Bilde 5:** Den kunstneriske retningen henger sammen gjennom hele filmen. Det er likevel KI, med dobbeltbilder og et uskarpt bakeri, og det eneste ekte arbeidet ligger i tre små kort i en karusell.
- **Bevegelse 6:** Filmen som følger rullingen er et ekte steg opp. Overgangsfeilene (#1, #2, #5) trekker under syntax, som har rene overganger.
- **Troverdighet 5:** Vi-formen er rettet, og footeren er i orden. Men vi har fortsatt ingen ansikter og ingen kunder, casene er piloter eller konsept, og filmen beviser ingenting.

## Bedre enn r1

- **Retning:** Dioramaet snakker til kunden. Bakeriet, kontoret og rørleggeren ved varebilen er småbedrifter rørleggeren kjenner igjen, mens syntax viser modeller og merkevarer.
- **Lukket fra r1:** tallraden er borte (#4), menyen har fire lenker (#12) og feltet står under ingressen (#13). KI-merket er nå liten tekst (#8), siden sier «vi» overalt (#10), og ordmerket i footeren går fra kant til kant (#21). Datoene i «Slik går det» står i visningsstørrelse (#20).
- **Befaringsradene** går over hele bredden med store verdier (r1 #2, delvis lukket).
- **Casene** har ekte skjermbilder av egne verktøy (r1 #7, delvis lukket).
- **Lengden** har gått ned fra ca. 14 400 til 13 239 px på desktop.

## Fortsatt svakere enn syntax

1. **Ekte bilder av ekte arbeid:** Syntax har 2–4 store flater per tjeneste (rulling-1, scrollY 1200–4000). Vi har tre kort på ca. 330 px i en karusell, og r2b har mindre ekte skjermmateriale i hovedløpet enn r2 hadde.
2. **Bevis fra andre:** Syntax har logovegg, sitater med navn og ansikter. Vi har ingenting av dette.
3. **Lengde:** 13 239 px mot 8 059 px. Første bevis (rapporten) kommer ved ca. 6 300 px, og første ekte skjermbilde ved ca. 8 800 px. Hos syntax kommer ekte arbeid ved 800 px.
4. **Polish i signaturøyeblikket:** Syntax har rene kutt. Våre overganger viser feil i nesten hvert bilde (#1, #2, #5).

## Hvor vi fortsatt slår syntax

Gratissjekken virker på første skjerm, prisene står åpent, prosessen har ekte datoer, og garantien er forståelig. Nå har vi også en film der kunden ser seg selv. Det forspranget forsvinner hvis filmen ser billig ut i overgangene.

## Funn

| # | Fil (hvor) | Funn: hva og hvorfor | Alvorlighet | Konkret retting |
|---|---|---|---|---|
| 1 | sw/sw-3600.png, ark.png (rad 3, venstre) | To bildetekster står på skjermen samtidig. «02 KONTORET / SYSTEMER OG INTEGRASJONER» tones ut med ca. 35 % dekk over varebilen, mens «03 RØRLEGGEREN / APPER OG AI» står under. Spøkelsesteksten ligger rett på videoen og kan ikke leses (langt under 4,5:1), og den ser ut som en feil midt i sidens dyreste øyeblikk. | blokker | Ingen overlapp. Den utgående teksten skal ha `opacity` 0 før den nye starter. Bruk ett tittelfelt som bytter innhold (designsystem v2 7.7), med 160 ms på teksten inne i feltet og ingen flytting. |
| 2 | sw/sw-1800.png, sw/sw-5400.png, sw-kjede-16x9.png (siste rad) | Krysstoningen mellom klippene gir dobbeltbilder. I bakeriet er det en spøkelsesfigur nede til venstre, og et grønt rektangel står forskjøvet fra skjermen. I verkstedet står to trekantskilt (vegg og vindu) og to skjermer med hake oppå hverandre. Det leses som en renderfeil. | blokker | Kjed klippene slik at siste ramme i klipp N er første ramme i klipp N+1, og kutt hardt i skjøten. Hvis det må tones: bare over maks 3 % av rullingen, og bare mens kameraet er i det svarte rommet mellom øyene. |
| 3 | r2b/mobil-overfolden.png, r2b/kontaktark-mobil-1.png y0–y5500, r2b/kontaktark-desktop-1.png og -2.png | Posterne er fortsatt de gamle KI-stemningsbildene: regnvindu, hånd med telefon og kaffe, serverskap og finger med grønt lys. Den som får posteren (redusert bevegelse, Save-Data, treg linje eller før videoen er lastet), ser siden r1 slaktet. Stilen skifter også fra «foto» til leire når klippet tar over. | blokker (må bekreftes) | Posteren skal være første ramme i hvert dioramaklipp, i 1920×1080 og 1080×1920 avif. Slett de gamle posterne fra `public/`. Ta nye mobilbilder med klippene koblet inn før neste kritikk. |
| 4 | sw/sw-0.png, sw/sw-900.png | Dioramaet, altså det nye wow-et, ligger bak et slør på ca. 55–60 % og dekkes av h1 (to linjer på ca. 1 100 px), felt, fire merker og lenke. I de første 900 px skjer det ingenting med innholdet utenom zoom. Første skjerm vinnes av overskriften, og det er riktig. Men verden bak sees knapt, så førsteinntrykket blir det samme som i r1. | høy | Sett h1 i spalte 1–7 (tre linjer). Legg sløret bare som en gradient fra venstre (fra 70 % til 0 over venstre 55 %), så høyre halvdel står i full lysstyrke. La heroteksten gli ut etter ca. 25vh, så kameraet har skjermen alene fra ca. 400 px. |
| 5 | sw/sw-900.png, sw/sw-4500.png | Kapittelskinnen viser feil kapittel. Ved 900 står det «BAKERIET», men bildet viser fortsatt gata og heroen. Ved 4500 står det «VERKSTEDET», mens bildeteksten sier «03 RØRLEGGEREN» og bildet viser rørleggeren. En navigasjon som sier feil om hvor du er, bryter regelen om at bevegelsen skal forklare hvor du er. | høy | Styr skinne og bildetekst fra samme indeks og samme terskel, satt midt i hvert kapittels klipp. |
| 6 | sw/sw-1800.png, sw-2700.png, sw-4500.png, sw-5400.png | AI-preg som er kommet tilbake. Over hver overskrift står en etikett i versaler med sperring og nummer i lime («01 BAKERIET»), og skinnen gjentar samme navn i versaler. Etiketten gir ingen ny informasjon, tjenester er ikke en rekkefølge, og del 4 nevner nettopp nummererte etiketter og sperrede versaler som malsignatur. | høy | Slett etiketten og nummereringen. Skinnen får vanlig skrift uten sperring, eller bare prikker. Overskriften bærer kapitlet. |
| 7 | sw/sw-0.png til sw-6300.png, r2b/kontaktark-desktop-1 til -3 | Hele siden er nesten svart med én lime-aksent, altså formspråket del 4 forkaster. Designsystem v2 har lyst som standard og blåkopi som mørkt tema. Det finnes ingen bilder av lyst tema. | høy | Eier avgjør. Beholdes mørkt: la filmen være det eneste nesten svarte rommet, og gi seksjonene etter den bunn i papir eller betong, med rapporten som et lyst ark. Da leses filmen som et rom i siden, ikke som hele siden. |
| 8 | sw/sw-0.png, r2b/mobil-overfolden.png | Samme liste på fire punkter står tre ganger: i ingressen («cookies, sikkerhet, fart og om org.nr.»), som merker rett under, og som rapportrader ved 6300. «Book 20 min» i toppfeltet og «Eller book 20 minutter» står på samme skjerm. | høy | Slett merkene og «kodekonsulentene.no»-linja fra heroen, for rapporten beviser det. Slett «Eller book 20 minutter», siden toppfeltet allerede har handlingen. |
| 9 | sw/sw-6300.png, r2b/kontaktark-desktop-2.png y6400–y7600, r2b/kontaktark-mobil-1.png y6000 | Rapporten starter fortsatt tom, med grå plassholderstreker, et tomt felt med markør og et tomt grått panel under radene, gjennom ca. 1 200 px rulling. Det er det første man ser etter filmen. r1 #2 er bare halvveis lukket. | høy | Vis de forhåndsutfylte verdiene for egen side straks. Animer bare målelinjen fra 0 til 100 % én gang når raden kommer i syne (560 ms, `--ut`). Fjern det tomme panelet. |
| 10 | sw/sw-1800.png til sw-5400.png, sw-kjede-16x9.png | Filmen viser ingen befaring: ingen målelinjer, ingen påskrifter og ingen målt verdi. Skjermene i leiren er tomme grønne flekker. Den viser hvem vi bygger for, men ikke hva vi gjør annerledes. Byttetesten: et isometrisk leirediorama er standardretningen i verktøyet som lager slike turer, og mye brukt. Dekker man til logoen, kunne dette vært et hvilket som helst byrå med Higgsfield. | høy | La de fire målingene av kodekonsulentene.no låse seg i tittelfeltet i kapittel 4 (Verkstedet, det er oss), med målelinjer i krittblått mot leireskjermen. Bare målte verdier. Rapporten etter filmen starter da utfylt, og filmen glir rett over i beviset. |
| 11 | r2b/kontaktark-desktop-2.png y8800–y9200, -3 y9600, r2b/kontaktark-mobil-1.png y7000–y7500 | «Hva vi har bygget» er tre like kort i en karusell. Skjermbildene er ca. 330 px brede og kan ikke leses, kort 2 er «Ikke et levert oppdrag», og på mobil er to av tre kort gjemt. AI-preg: samme kortoppsett tre ganger. | høy | Én case i full bredde: sjekkverktøyet i 16:10 på 1 296 px med skjermopptak (`preload="none"`), tittel og tre målte tall. Konseptcasene står som tekstlenker under. Ingen karusell. |
| 12 | r2/kontaktark-desktop-1.png y3200–y4400 mot sw/sw-1800.png til sw-4500.png | r2 hadde ekte skjermbilder (nettleser og telefon) for hver tjeneste. r2b har byttet dem ut med KI-film, så hovedløpet har nå færre ekte bilder enn i r2. | middels | Gi hver tjeneste ett ekte skjermbilde fra r2 et sted etter filmen. Et forslag: tjenesteseksjonen («Det vi bygger») med tre store tekstlenker og ett skjermbilde hver. |
| 13 | sw/sw-1800.png, sw-2700.png, sw-4500.png | «01 BAKERIET → NETTSIDER» kan leses som at vi har laget nettsiden til bakeriet. Briefen forbyr KI-bilder som ser ut som kundearbeid. KI-merket står bare i heroen, ikke i kapitlene. | middels | Bildeteksten skal handle om kundetypen, ikke et oppdrag. Ordlyden eies av `tekstforfatter`. «Illustrasjon laget med KI» står i hvert kapittel, eller én gang i tittelfeltet så lenge filmen går. |
| 14 | sw/sw-5400.png, sw-kjede-16x9.png og sw-kjede-9x16.png (siste rad) | Verkstedet, vårt eget hus, har et grønt skilt med trekant i ring. Det er ikke logoen vår (KK-flisen), men et oppdiktet merke på vår egen fasade. | middels | Generer siste klipp på nytt med et blankt skilt, eller legg på KK-flisen etterpå (egen logo, ikke et falskt skjermbilde). Ellers beskjær slik at skiltet er utenfor bildet. |
| 15 | sw/sw-1800.png, sw-4500.png | Teksten står rett på videoen, mot regel 5 i v2 som krever en tett plate. I bakeriet går spøkelsesfiguren bak «Rask side», og i sw-4500 ligger førerhuset og lyset rett bak ingressen. | middels | Bruk tittelfeltet (tett plate i `--scene-bunn`). Alternativt: mål den lyseste pikselen i tekstsonen i hver ramme og dokumenter at kontrasten er minst 4,5:1. |
| 16 | sw/sw-1800.png | Bakeriet er bløtere enn de andre kapitlene. Brød og disk har mindre detalj enn kontoret i sw-2700. Det ser oppskalert ut, eller hardt komprimert. | middels | Sjekk med `ffprobe` at kilden er 1920×1080. Klipp som følger rullingen trenger keyframe i hver ramme, så hev bitraten. Ikke skaler opp et 720p-klipp. |
| 17 | sw-kjede-9x16.png (rammene 1, 2, 6, 7, 11, 12, 19, 24 og 25) | I 9:16 fyller øyene bare ca. 35–40 % av høyden og flyter i svart. Med bildeteksten i nedre tredjedel får objektet ca. 30 % av mobilskjermen. Overgangsrammene (rad 2, nr. 2 og rad 1, nr. 5) er uskarpe. | middels | Ta 9:16-klippene tettere, slik at objektet fyller minst 70 % av bredden og står i øvre halvdel. Kontroller med mobilbilder der klippene er koblet inn. |
| 18 | r2b/desktop-helside.png, r2b/kontaktark-desktop-3.png y13239, r2b/kontaktark-mobil-2.png y13535 | 13 239 px på desktop og 13 535 px på mobil, mot 8 059 hos syntax. r1 #3 er fortsatt åpent. | middels | Filmen bruker maks 4 × 100vh. Kutt luft før prisene og spørsmålene. Målet er ≤ 10 500 px. |
| 19 | r2b/kontaktark-desktop-2.png y8000, r2b/kontaktark-mobil-1.png y6500 | «Fast pris på utbedring: 7 900 kr» står rett under fire beståtte verdier. Leseren spør hva som skal utbedres. | middels | Feltet sier hva det koster for den besøkende hvis befaringen finner mangler hos dem. Ordlyden eies av `tekstforfatter`. |
| 20 | r2b/kontaktark-desktop-3.png y10400–y10800, r2b/kontaktark-mobil-2.png y9000–y9500 | Abonnement, drift og timepris står fortsatt på ca. 16 px med finskrift på 11–12 px. r1 #18 er åpent. | middels | Én rad med tre tall på 32 px og finskrift på minst 15 px. |
| 21 | sw/sw-0.png (nede i midten) | «RULL» står i sperrede versaler over en strek på 1 px. Det er AI-preg, og filmen inviterer uansett til å rulle. | lav | Slett det, eller skriv «Rull for å se gata» i vanlig skrift. |
| 22 | r2b/mobil-overfolden.png | Første skjerm har ti elementer: h1 på fire linjer, ingress, felt, knapp, merknad, adresse, fire merker, lenke og KI-merke. | lav | Når #8 er gjort, står det bare h1, ingress, felt med knapp og merknad igjen. |
| 23 | r2b/kontaktark-mobil-2.png y12000–y12500 | Rammene på skjemafeltene er rettet, men etikettene er fortsatt ca. 13 px. | lav | Etiketter på 15 px. |

Telling: 3 blokker, 8 høy, 9 middels, 3 lav.

## AI-preg-sjekken (del 12)

| Punkt | Treff | Hvor |
|---|---|---|
| Etikett over overskrift uten ny info | ja | «01 BAKERIET» osv. (#6) |
| Nummerering på noe som ikke er en rekkefølge | ja | 01–04 på tjenester (#6) |
| Monospace utenfor kode | nei | |
| Versaler med sperring på småtekst | ja | etiketter, skinne, «RULL» (#6, #21) |
| «→» eller midtprikker som pynt | nei | |
| Samme kortoppsett tre ganger | ja | casekortene (#11) |
| Inntoning på kort eller avsnitt | kan ikke avgjøres fra stillbilder | |
| Bevegelse som ikke forklarer noe | delvis | filmen viser kundetyper, ikke befaringen (#10) |
| KI-bilde utenfor scene eller som kundearbeid | delvis | gamle postere (#3), bakeriet leses som oppdrag (#13) |
| Mer enn én stor ting per skjermhøyde | delvis | h1 og diorama konkurrerer i heroen (#4) |
| Samme setning eller tall flere ganger | ja | firepunktslista ×3, Book ×2 på første skjerm (#8) |
| Byttetesten | feiler for filmen, består for befaringen, prisene og datoene | #10 |

## Lyst mot mørkt tema

Kan ikke vurderes. Alle bildene er mørke, og designsystemet sier lyst som standard (#7).

## De 5 endringene som gir mest wow per time nå

1. **Rett overgangene i filmen (#1, #2, #5).** Ingen overlappende bildetekster, hardt kutt i skjøtene og skinnen synkronisert med bildeteksten. Ca. 2–3 timer. Da forsvinner feilene fra hvert bilde mellom kapitlene, og filmen ser dyr ut i stedet for skjør.
2. **Gi dioramaet første skjerm (#4, #8).** Smalere h1, slør bare fra venstre, ingen merker eller ekstra Book-lenke, og heroteksten ut etter 25vh. Ca. 1–2 timer. Førsteinntrykket går fra «tekst på mørkt bilde» til «en verden».
3. **La filmen ende i befaringen (#10, #9).** I kapittel 4 låser de fire målingene seg i tittelfeltet med målelinjer, og rapporten under starter utfylt. Ca. ½ dag. Det er øyeblikket syntax ikke kan kopiere, og det lukker byttetesten.
4. **Bytt posterne og ta mobilbilder med klippene (#3, #17).** Ca. 1 time for posterne, mer hvis 9:16 må tas på nytt. Uten dette er mobil og redusert bevegelse fortsatt r1-siden.
5. **Én stor ekte case i stedet for karusellen (#11, #12).** Sjekkverktøyet i full bredde med opptak, og skjermbildene fra r2 tilbake i tjenestene. Ca. ½ dag. Bildekarakteren kan ikke passere 6 før ekte arbeid får like stor flate som KI-filmen.

---

Hva ville en rørlegger husket fra denne siden i morgen? Den lille leirerørleggeren ved varebilen full av kobberrør, og at han kunne få sjekket nettsiden sin gratis. Men ikke hva sjekken fant, for det viser ikke filmen.
