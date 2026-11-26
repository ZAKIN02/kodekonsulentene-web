# Kritikk wow-r1: forsiden på redesign/wow mot syntaxstudio.no

Grunnlag: bare bilder. `.skudd/wow/endelig/` (overfold, helside, kontaktark og rulling-desktop/*),
`.design/arbeid/bevegelse/wow/ark-*.png` og `.skudd/sammenligning/`. Kontaktarkene er tatt hver 400 px på desktop og hver 500 px på mobil, og y-verdiene nedenfor viser til dem.

**Dom:** Ikke på nivå med syntax ennå. Typografien og fargen sitter, og garantien er et ekte øyeblikk. Men siden er 14 361 px lang på desktop mot syntax sine ca. 8 900, og den har mindre innhold. Signaturøyeblikket (befaringen) er en nesten tom boks i 1 200 px rulling, og alle bildene er KI-stemning som ikke viser noe vi har laget. Syntax vinner på bilder, rytme og troverdighet. Vi vinner bare på at vi har et verktøy som virker, og det verktøyet viser vi for lite av.

## Karakterer (1–10)

| | Oss | Syntax |
|---|---|---|
| Førsteinntrykk | 6 | 8 |
| Typografi | 7 | 7 |
| Bilde/medier | 3 | 9 |
| Bevegelse (fra filmstriper) | 5 | 7 |
| Rytme | 4 | 8 |
| Mobil | 6 | – (ingen mobilbilder av syntax i mappen) |
| Troverdighet | 5 | 9 |

## De første 3 sekundene

- **0–1,6 s:** KK-merket og «KODEKONSULENTENE» tegnes inn, så dekker et refleksgrønt teppe hele skjermen (ark-desktop-intro, 1350–1500 ms). Det er nesten samme koreografi som syntax: logo bokstav for bokstav, så fargeteppe, så hero (kontaktark-laste-3s, 250–2251 ms). Den som har sett syntax, kjenner den igjen. Og en side som selger fart, lar deg vente 1,6 s.
- **1,6–3 s:** Heroen. Overskriften «GRATIS BEFARING AV NETTSIDEN DIN» vinner, og det er riktig ting. Bildet bak er en skjerm ved et regnvått vindu. Det viser ingenting av det vi gjør, og det har en KI-merkelapp oppe til høyre. Briefen lover «ting som låser seg på plass, måles og blir grønne». Ingenting på første skjerm låser seg, måles eller blir grønt.
- Syntax bruker de samme 3 sekundene på menneske, landskap og film i full bredde. Det er ekte opptak og det er dyrt. Vi kan ikke slå det med KI-stemning. Vi kan slå det med noe de ikke har: en måling som skjer foran øynene på deg.

## Funn

| # | Fil (seksjon, y) | Funn | Alvorlighet | Forslag |
|---|---|---|---|---|
| 1 | desktop-overfolden.png, mobil-overfolden.png (hero, y0) | Heroen er et stemningsbilde (skjerm, regn) med tom skjerm. Det svarer ikke på hva vi gjør. Signaturen, rapporten, begynner først én skjerm lenger ned, og da tom. Briefens «presisjon i bevegelse» finnes ikke på første skjerm. Den gamle driftssiden hadde terminalmock med målinger i heroen og var mer på brief (desktop-overfolden-alle.png). | blokker | Legg rapporten i heroen. Desktop: kolonne 8–12, et rapportkort på ca. 560×520 px. Ved lasting skrives «kodekonsulentene.no», og fire rader låser seg grønne etter tur, 120 ms mellom radene og 1,4 s totalt. Verdiene står i Archivo 900 på 56–64 px. Videoen blir bakgrunn med 35–40 % dekk, eller fjernes. Mobil: kortet under overskriften med tre rader. |
| 2 | kontaktark-desktop-1 y1200–y3600, rulling-desktop/04-y1600.png | Befaringen er en festet boks på 885×655 px som står nesten tom i ca. 1 200 px rulling. Radene har etiketter på 14 px og tynne blå streker og fyller under halve boksen. Selv ferdig (y3200) er boksen tom over refleksfeltet. Det ser ut som en innlastingsskjerm, ikke et signaturøyeblikk. | blokker | Fjern boksen. Hver rad får hele bredden (12 kolonner): etikett på 20 px til venstre, verdi i Archivo 900 med `clamp(4rem, 8vw, 8rem)` til høyre, og målelinjen trekkes over hele bredden mellom dem. Én rad per ca. 25vh, festet i 120–150vh totalt. Til slutt fyller refleksfeltet hele bredden med «7 900 kr» på 11rem. |
| 3 | desktop-helside.png, kontaktark-desktop-1 y800/y4000, -2 y5200/y8000 | For mye svart. Mellom seksjonene står det 250–400 px tom flate, og mellom tjenesteradene er det ca. 300 px tomrom (y5200). Siden er ca. 60 % lengre enn syntax sin, og innholdet er tynnere. Den som ruller, møter flere tomme skjermer enn fulle. | høy | Sett `padding-block` til topp `clamp(6rem, 10vw, 9rem)` og bunn 0 når en ny overskrift følger. Målet er ≤ 10 500 px på desktop og ≤ 10 000 px på mobil. Kutt tallraden (#4). |
| 4 | kontaktark-desktop-1 y400–y800, rulling-desktop/02-y800.png | Tallraden følger malen «stort tall, liten etikett» ×4, som craft-floor avviser, og alle fire tallene står også andre steder: 14 900 i prisene, 30 sek i hero-ingressen, 72 t i «Slik går det», 6 av 6 i befaringen og i case-kortet. «6 AV 6» står fire ganger på siden. Tallene blir mindre verdt for hver gang. | høy | Slett tallraden. La hvert tall stå én gang, der det bevises. |
| 5 | kontaktark-desktop-1 y400, -2 y8800/y9200, rulling-desktop/23-y9200.png, kontaktark-mobil-1 y500/y6492 | Tallrullingen (number-flow) har ikke maske. Midt i rullingen står sifrene utenfor linjen: «29 900» leses som «2 9 9 00», og spøkelsessifre henger over tallet. Det fanges i hvert skjermbilde og i hvert opptak. At prisen ruller opp som en spilleautomat, går også mot budskapet «fast pris». | høy | Klipp hver sifferkolonne med `overflow: clip` og `line-height: 1`. Ingen rulling når prisene kommer inn i bildet, bare når pakken byttes, og maks 500 ms. |
| 6 | kontaktark-desktop-2 y4800–y6400, rulling-desktop/13-y5200.png, kontaktark-mobil-1 y2500–y3500 | Tjenestebildene er tre KI-klisjeer: hånd med telefon og kaffe, serverskap, en finger med grønt lys. Byttetesten feiler, for alle tre kunne stått hos et hvilket som helst IT-firma. Telefonskjermen i «Nettsider» er blank, så bildet om nettsider viser ingen nettside. | høy | Bytt til ekte skjermmateriale. Nettsider: opptak av kodekonsulentene.no rullet på 390 px i en telefon. Systemer: den faktiske flyten Vipps → kalender → regnskap som ekte grensesnitt, der hvert steg låser seg. Apper og AI: et ekte skjermbilde. Gjør som syntax og bruk 2–3 flater per rad, ett stort bilde i 16:10 og ett lite i 4:5 forskjøvet, i stedet for ett bilde per rad. |
| 7 | rulling-desktop/18-y7200.png, kontaktark-mobil-1 y4000–y4500 | «Hva jeg har bygget» har null bilder. Kortet for egen side er tekst med ca. 180 px tomrom i midten, kort 2 er merket «Ikke et levert oppdrag», og kort 3 er et salgskort. Under den overskriften sier seksjonen i praksis «jeg har nesten ikke bygget noe». Syntax sin tilsvarende del er bare bilder. | høy | Med én ekte case: dropp karusellen. Vis egen side som én case i full bredde, med skjermopptak i 16:9 øverst (60 % av høyden), tre målte verdier i visningsstørrelse og lenke til den faktiske rapporten fra /sjekk. Flytt konseptet til /caser. |
| 8 | desktop-overfolden.png (øverst til høyre), rulling-desktop/13-y5200.png | Fire synlige merkelapper med «Illustrasjon laget med KI». I heroen er den en kontrastrik pille og et av de tre mest synlige elementene på første skjerm. Hver merkelapp forteller at bildet ikke er ekte. | høy | Den egentlige løsningen er #6: færre KI-bilder. Behold merket der det trengs, men som tekst på 12 px med 60 % dekk nede til venstre i bildet, ikke som pille. |
| 9 | ark-desktop-intro.png, ark-mobil-intro.png vs syntax kontaktark-laste-3s.png | Introen kopierer signaturen til referansen: logo, så fargeteppe over hele skjermen, så hero. På 1350–1500 ms blinker hele skjermen #C8F24A på en mørk side. Det er et hardt blink, og det koster 1,6 s på en side som selger fart. | høy | Lag vår egen intro, eller kutt den. Forslag på 1,2 s: «kodekonsulentene.no» skrives i et felt midt på skjermen, fire haker blir grønne (120 ms hver), og feltet glir på plass som URL-feltet i heroen (FLIP). Da blir introen befaringen i miniatyr og går rett over i #1. |
| 10 | kontaktark-desktop-1 y4000, -2 y6800, mobil-1 y2000/y3500, mobil-2 y12000 | Teksten sier «jeg» («TRE TING JEG GJØR», «HVA JEG HAR BYGGET», «Forhåndsutfylt for min egen side», «Jeg bruker opplysningene»), mens merkenavnet er i flertall og prosjektregelen sier «vi». Kombinasjonen gjør at siden virker liten og uavklart. | høy | Velg én form, etter regelen «vi». Avklar med eier før endringen. |
| 11 | rulling-desktop/02-y800, 13-y5200, 19-y7600, 23-y9200; kontaktark-mobil-1 y2500/y3000 | Toppfeltet er halvgjennomsiktig på desktop, så overskrifter skinner gjennom bak menyen («NETTSIDER», «PRISENE STÅR HER»). På mobil mangler det bakgrunn helt, og «JEG GJØR» ligger oppå KK-merket. | middels | Gi toppfeltet heldekkende `#0A0B0C` og skjul det ved rulling nedover (`translateY(-100%)`, 200 ms), vis det igjen ved rulling oppover. Ingen blur, siden glassmorphism er forbudt. |
| 12 | desktop-overfolden.png (meny) | Menyen har sju lenker pluss knapp, mot fire hos syntax. Den får uryddig tyngde ved siden av en hero som skal være ren. | middels | Fire lenker: Tjenester, Priser, Caser, Om. Pluss «Book 20 min». |
| 13 | desktop-overfolden.png (y700–840) | Handlingssonen i heroen er splittet. Ingressen og knappen står til venstre, URL-feltet til høyre på en annen grunnlinje uten sammenheng. Det er tre handlinger på første skjerm, og to av dem er identiske («Book 20 min» i menyen og «Eller book 20 minutter»). | middels | Legg feltet rett under ingressen i samme kolonne (kolonne 1–6, 560 px bredt). Gjør «Eller book 20 minutter» til en tekstlenke under feltet, ikke en pille. |
| 14 | desktop-overfolden.png (x≈1378, y 145–215) | En løs vertikal strek på 1 px øverst til høyre i heroen, under KI-pillen. Den leses som en feil, ikke som en rulleindikator. | middels | Flytt den nederst midt på med teksten «Rull» i 12 px, eller fjern den. |
| 15 | rulling-desktop/13-y5200.png | Kollisjon: «INTEGRASJONER» slutter ved ca. x 630, og bildet begynner ved x 618, så teksten går inn i bildet. | middels | La bildet begynne i kolonne 7, eller sett overskriften i denne raden til `clamp(3rem, 6vw, 6rem)`. |
| 16 | kontaktark-desktop-1 y4000, -2 y6800/y8800, -3 y10400/y11600 | Fem seksjoner har samme oppsett: overskrift i versaler oppe til venstre og en grå setning forskjøvet til kolonne 7. Typografien hopper rett fra ca. 100 px til 20 px uten mellomnivå. Det blir monotont, og ingen bildemosaikk bryter mønsteret slik syntax gjør. | middels | Bryt mønsteret minst to ganger. I prisene: overskriften blir første rad i prislisten. I «Slik går det»: datoene er overskriften. Innfør et mellomnivå på 40–48 px for ingressene i de viktigste seksjonene. |
| 17 | rulling-desktop/20-y8000.png, kontaktark-desktop-2 y8800, kontaktark-mobil-1 y6000 | Garantien er sidens beste øyeblikk, men refleksfeltet har ca. 170 px tom flate over teksten og et tomt bånd under. På mobil står det ca. 250 px tom grønn flate under teksten. | middels | Gjør feltet like høyt som innholdet pluss 120 px luft. |
| 18 | kontaktark-desktop-3 y9600/y10000, kontaktark-mobil-1 y7500–y8000 | Hovedprisene står godt, men abonnement, drift og timepris står på 14–16 px med finskrift på 11–12 px i en tabell med tre kolonner som er tung å skumlese. Kortet «Dette er med i Bedrift» flyter og etterlater en tom kolonne under seg. | middels | Sett sekundærprisene som én rad med tre tall på 32 px og finskrift på minst 14 px. Fest kortet i toppen av kolonnen eller la det følge med ved rulling innenfor seksjonen. |
| 19 | kontaktark-desktop-3 y12400/y12800, kontaktark-mobil-2 y11500–y12000 | Kontaktskjemaet har hårstrekfelter og etiketter på 11–12 px. Det ser tomt og uferdig ut og tar ca. 900 px. | middels | Etiketter på 15 px, felter på 56 px høyde med hel ramme på 1 px, og tekstfelt på 4 rader. |
| 20 | kontaktark-desktop-3 y10800 | Datoene i «Slik går det» («LØRDAG 21. NOVEMBER», «UKE 50») er det mest konkrete på hele siden, men står på ca. 22 px med etiketter på 11 px. | lav | Sett datoene i Archivo 900 på 48–64 px. Det er troverdighet på kjøpet. |
| 21 | rulling-desktop/34-y13461.png | Ordmerket i bunnteksten fungerer, men står med 60 px innrykk på hver side. | lav | La ordmerket gå fra kant til kant (skriftstørrelse slik at bredden blir 100vw) og kutt det ca. 8 % mot grunnlinjen. Det gir siden et sluttpunkt. |
| 22 | mobil-overfolden.png | Mobilheroen ligger i et innfelt kort med avrundede hjørner og et mørkt bånd under. Briefen sier full bredde. | lav | Gi heroen full bredde og `100svh` under toppfeltet. |

Telling: 2 blokker, 8 høy, 9 middels, 3 lav.

## Seksjon for seksjon, kort

- **Karusellen «Hva jeg har bygget»:** svakest mot syntax (#7). Kortene er like store, uten bilder, og ett av tre er en reklame for oss selv.
- **Garantien:** sterkest. Fullbredde refleks med svarte versaler på ca. 110 px er ekte wow, særlig på mobil (mobil-1 y5500). Stram inn tomrommet (#17).
- **Prisene:** typografisk ryddig, og prisvelgeren gir mening. Rullefeilen (#5) ødelegger førsteinntrykket.
- **Spørsmål:** godt. To kolonner, store spørsmål og ingen pynt. Trenger ikke mer.
- **Kontakt:** «SNAKK MED DEN SOM KODER» er en god overskrift, men skjemaet er for svakt (#19).
- **Bunntekst:** god. Det store ordmerket og den rene lovpålagte linjen gjør jobben (#21 er finpuss).
- **Mobil:** På flere punkter bedre enn desktop. Befaringsradene kan leses (mobil-1 y1000–y1500), og garantien treffer. Toppfeltet uten bakgrunn (#11) og den lange rullingen (#3) trekker ned.

## Hva syntax gjør som vi ikke gjør

1. Ekte bilder av arbeid, 2–4 per tjeneste i mosaikker med ulike størrelser (rulling-1, scrollY 1200–4000).
2. Bevis fra andre: logovegg, sitater med navn og firma, ansikter i teamet (rulling-2).
3. En kort side: ca. 8 900 px, og hver skjerm har innhold.
4. Fire menypunkter og én handling.

## Hva vi har som syntax ikke har

1. Et verktøy som virker i heroen: URL inn, rapport på 30 sekunder. Syntax har bare «Start et prosjekt».
2. Faste priser på forsiden, og en prisvelger.
3. Ekte datoer i prosessen, og en garanti man kan forstå: prototype før betaling.
4. Målbart bevis på egen side (0 cookies, 6 av 6 headere, 0,1 s).

Alt vårt forsprang ligger i punkt 1 og 4, og begge er gjemt eller satt i 14 px. Wowen vår er målingen, ikke filmen.

## De 5 endringene som gir mest wow per time

1. **Bygg befaringen om til rader i visningsstørrelse (#2)** og legg en kort versjon i heroen (#1). Det er det ene øyeblikket ingen konkurrent har. Ca. 1 dag.
2. **Slett tallraden og stram inn tomrommet (#3, #4).** Siden går fra ca. 14,4k til ca. 10,5k px og føles straks raskere og tettere. Ca. 2 timer.
3. **Fiks tallrullingen (#5).** Maske per sifferkolonne og rulling bare ved bytte av pakke. Ca. 1 time, og en synlig feil forsvinner fra hvert opptak.
4. **Bytt KI-bildene og case-kortene ut med ekte skjermopptak av egen side og rapport (#6, #7, #8).** Én opptaksøkt gir materiale til tjenester, case og hero, og tre av fire KI-merkelapper forsvinner. Ca. ½–1 dag.
5. **Bytt syntax-introen med «befaring i miniatyr» (#9), og gjør toppfeltet heldekkende med fire lenker (#11, #12).** Ca. ½ dag.

---

Hva ville en rørlegger husket fra denne siden i morgen? At han kunne få sjekket nettsiden sin gratis, og den store grønne boksen der det stod at han slipper å betale hvis han ikke liker prototypen. Ikke ett eneste bilde.
