# Kritikk: tre retninger, fase 1, runde 1

Grunnlag: 54 stillbilder i `.design/retninger/` og seks filmstriper. Mobil ble sett før desktop. Alle stier under er relative til `.design/retninger/`.

Viktig forbehold: alle tre scenene viser et testbilde (fargestriper og tidskode), ikke et Higgsfield-klipp. Derfor kan ingen av retningenes største øyeblikk vurderes ennå. Rangeringen under bygger på første skjerm, hierarki, rytme og hvor godt hver side gjør jobben sin.

## Rangering

| | Vinner | Hvorfor |
|---|---|---|
| **Mobil** | **A, Befaring** | Én ting vinner første skjerm: overskriften og adressefeltet, med handlingen innen tommelavstand. Rapporten under er det eneste på tvers av retningene som består byttetesten. Den kunne bare tilhørt denne siden. |
| **Desktop** | **C, Prislista** | Overskriften fyller bredden, og prisvelgeren står i samme skjermhøyde uten å konkurrere. Det er den eneste første skjermen på desktop som bruker hele flaten. A står i venstre halvdel med tom høyre halvdel. |
| **Sist på begge** | **B, Verkstedet om natta** | Første skjerm har ingen handling. Scenen er et avrundet kort under en overskrift i versaler, ikke en fullskjermscene. Fire like mørke kort og spredte venstrekanter gjør at siden ser ut som en mal. |

Anbefaling: bygg videre på A. Hent den typografiske prislista og prisvelgeren fra C inn i As blokk «Prisvelgeren og prislista», og gi A en desktopkomposisjon som fyller flaten. B forkastes.

## Funn

| fil | funn | alvorlighet | forslag |
|---|---|---|---|
| `localhost-retning-a--mobil--light--01.png`, `film-a/bilde-03.png`, `localhost-retning-b--desktop--light--00.png`, `localhost-retning-c--desktop--light--02.png` | Scenen viser et testbilde med tidskode i alle tre retningene. Sidens ene store øyeblikk kan ikke vurderes, og bevegelsen forklarer ingenting. | blokkerende | Legg inn ekte Higgsfield-klipp i 16:9 og 9:16 før neste opptak. Ta nye filmstriper. |
| `film-a-mobil/bilde-04.png`, `film-a/bilde-03.png`, `film-c-mobil/bilde-05.png`, `film-c/bilde-06.png` | I A og C står scenetekst i tynn hvit skrift rett på videoen uten slør. Over gule og cyan felt er kontrasten godt under 4,5:1. Ekte klipp vil også ha lyse partier. | blokkerende | Legg en mørk gradient bak tekstsonen, eller sett hvert steg på en egen mørk flate. Mål kontrasten mot den lyseste rammen i det ekte klippet. |
| `localhost-retning-a--mobil--light--03.png`, `localhost-retning-b--mobil--light--03.png`, `localhost-retning-a--desktop--light--04.png` | A og B slutter uten footer. Foretaksnavn, org.nr., adresse, e-post, personvern og vilkår mangler. Dette er et fast krav. | blokkerende | Gi alle tre prototypene samme lovpålagte footer som C. |
| `film-c-mobil/bilde-09.png` | Footeren i C på mobil går utenfor skjermen, så «Salgsvilkår» blir kuttet. Siden får horisontal rulling, og det bryter WCAG 1.4.10 om reflow. | blokkerende | La lenkene bryte over flere linjer med `flex-wrap`. |
| `localhost-retning-c--mobil--dark--00.png`, `localhost-retning-c--desktop--dark--00.png` | I mørkt tema i C har den valgte radioknappen hvit ring og prikk på lime, omtrent 1,2:1. Kontroller må ha minst 3:1. | blokkerende | Bruk blekkfarge på ringen og prikken når raden er valgt, i begge temaer. |
| `localhost-retning-b--mobil--light--00.png`, `film-b-mobil/bilde-07.png` | Første skjerm i B har ingen handling. Adressefeltet kommer først etter fire kort, omtrent tre skjermhøyder ned. Sidens jobb er sjekken eller booking. | bør rettes | Ligger i retningens premiss, og er hovedgrunnen til at B rangeres sist. Velges B, trenger scenen en fast handling nederst. |
| `localhost-retning-b--mobil--light--00.png` | Scenen i B fyller ikke første skjerm slik retningen beskriver. Sju navigasjonslenker over to linjer og en overskrift på tre linjer skyver den ned til et kort. | bør rettes | Bruk «Meny» som i A og C. Legg overskriften over videoen. |
| `localhost-retning-b--mobil--light--01.png`, `localhost-retning-b--desktop--dark--01.png` | Scenestegene i B er fire like mørke kort med avrundede hjørner. Det er samme kortoppsett fire ganger, et treff i AI-preg-sjekken. | bør rettes | Bruk ren tekst på slør over videoen, uten kortflater. |
| `localhost-retning-b--desktop--dark--02.png`, `localhost-retning-b--desktop--light--00.png` | Venstrekantene i B spriker: logo ved 24 px, overskrift 40, kort 64 og KI-merket 168. «Spill av filmen» står alene til høyre, og sjekkboksen er sentrert. Det finnes ikke noe rutenett. | bør rettes | Bruk én venstrekant og ett rutenett. |
| `localhost-retning-a--desktop--light--00.png`, `localhost-retning-a--desktop--light--03.png` | Både hero og rapport i A ligger i venstre halvdel, og høyre halvdel er tom på desktop. Rapporten ser ut som en mobilside midt i en desktopflate. | bør rettes | La overskriften gå over hele bredden. Bruk høyre spalte ved rapporten til målelinjer og påskrifter i arbeidstegningsstilen, som peker på radene. |
| `localhost-retning-a--desktop--light--02.png`, `localhost-retning-c--desktop--light--03.png` | Uten aktiv scene står stegteksten ved 24 px fra venstre, utenfor sidens kant på 72 og 58 px, og i liten skrift. Rytmen bryter rett før rapporten. | bør rettes | Bruk samme venstrekant og en større overskriftsgrad som resten av siden. |
| `localhost-retning-a--mobil--light--03.png`, `localhost-retning-a--desktop--light--03.png` | Tre tomme linjer etter «Ytelse» i rapporten ser ut som noe som ikke lastet. | bør rettes | Fjern dem, eller merk dem med «Fylles ut når du kjører befaringen». |
| `localhost-retning-a--mobil--dark--00.png`, `localhost-retning-a--desktop--dark--00.png` | Mørkt tema i A er nesten svart med én lime-knapp, altså dagens formspråk som del 4 forkaster. Det ser invertert ut, ikke valgt. Feltet og knappen mister også kanten i blekk. | bør rettes | Gi mørkt tema en egen farge. C sin marineblå viser at det går. Behold 1 px kant på kontroller i begge temaer. |
| `localhost-retning-c--desktop--light--00.png`, `localhost-retning-c--desktop--light--01.png` | C gjentar seg. 14 900 kr står i overskriften og i velgeren. «1–3 sider, skrevet ferdig» står i velgeren og i lista. «Du eier koden og domenet» står tre ganger, og «To revisjonsrunder» står to ganger. | bør rettes | Ett sted per løfte. Eierskap og revisjonsrunder bør bare stå i vilkårslinja. |
| `localhost-retning-c--mobil--light--03.png`, `localhost-retning-c--desktop--light--03.png` | Scenen i C forklarer Start, Bedrift og System en tredje gang, etter velgeren og prislista. | bør rettes | Flytt scenen før prislista. Er det velgeren den skal drive, la den drive den, slik øyeblikk 5 beskriver. |
| `film-c-mobil/bilde-05.png`, `film-c-mobil/bilde-07.png` | På mobil dekker scenen i C ikke hele høyden. En lys stripe ligger under den faste flaten, og stegteksten blir blek over lys bunn når den glir ut av videoen. | bør rettes | Gi scenens flate full `100svh`, og la stegteksten slutte før flaten slipper. |
| `localhost-retning-b--mobil--light--02.png`, `localhost-retning-b--desktop--light--00.png` | Plassholderen «dinbedrift.no» i B har full blekkfarge og ser ut som en utfylt verdi. | bør rettes | Bruk plassholderfarge som i A, med minst 4,5:1 mot bunnen. |
| `localhost-retning-b--desktop--light--00.png` | Byttetesten: B feiler. Overskrift i smale versaler, marineblå kort og en avrundet sjekkboks kunne tilhørt hvilket som helst byrå. A består på grunn av befaringsrapporten. C består bare halvveis, fordi stor pristypografi er lett å kopiere. | bør rettes | Ingen tiltak hvis B forkastes. |
| `localhost-retning-a--mobil--light--02.png`, `localhost-retning-c--mobil--light--04.png` | A og C skriver «jeg», men ingen person synes: ikke noe portrett, navn eller ekte arbeid. C viser «MANGLER: skjermbilder av appene». Uten en person og et case har «jeg» ingenting å hvile på. | bør rettes | Eier må levere portrett og skjermopptak. Se åpne punkter: repoets regler sier «vi», briefen sier «jeg». |
| `localhost-retning-c--mobil--light--01.png` | «Ikke med» står i feil-rød. Rødt betyr at noe er galt, så Start-pakken leser som en advarsel. | smak | Bruk blekk med gjennomstreking eller dempet grå. Hold rødt for mangler i rapporten. |
| `localhost-retning-c--mobil--light--00.png` | C har bare ordmerket, uten KK-merket i lime. Logoens farge forsvinner fra toppen. | smak | Behold KK-merket som i A og B. |
| `localhost-retning-a--mobil--light--00.png` | I A står «Ingen innlogging …» og «Eller book 20 minutter» i like tung skrift tett under knappen. Bookinglenken drukner. | smak | Gi mer luft over den andre handlingen, eller sett den på egen linje med tydeligere vekt. |

**Det en rørlegger ville husket i morgen:** fra A «gratis befaring» og et skjema som ligner en befaringsrapport, fra C «nettside 14 900 kr», og fra B bare et fargeprøvebilde.
