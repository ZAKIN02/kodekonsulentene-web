# Historiemanus: forsiden som én film

Skrevet 19. nov. 2026 av fortellerregissøren. Gjelder gren `redesign/wow`. Manus, ikke kode: ingen filer i
`src/` er endret. Byggeren og `bevegelse` lager koden etter at eier har valgt behandling.

**Bestillingen.** Eier 19. nov.: «De må fortsatt fortelle en historie. Du må bruke disse scenene, kanskje
noen nye i tillegg. Du må ha narrator som den personen som lagde Inception – kreativitet. Denne er grei, men
den forteller ikke en sammensatt historie.» Utvidet samme dag, etter eiers skjermbilde av «Slik går det» og
«Det folk spør om»: «Nettsiden kan bli så mye bedre. Vi konkurrerer med syntax og andre animerte nettsider.»
Behandlingene dekker derfor hele forsiden, ikke bare kameraturen.

**Tolkning.** Eier vil ha en forteller og en struktur med samme ambisjon som filmskaperen han peker på:
lag inni lag, tid som brytes eller går baklengs, en gjenstand som avgjør hva som er ekte, en åpning midt i
handlingen og en slutt som snur det du trodde. Ingenting av hans filmer, figurer, replikker eller musikk
skal etterlignes eller nevnes på siden. Fortelleren er vår egen stemme, «vi».

**Skills lastet:** `auteur` (direct-registeret, `reference/direct.md`), `storybrand`, `plot-structure`,
`cinematic-ui`, `scroll-craft`, `kodekonsulentene-tekst`, `kodekonsulentene-seo`.

**Grunnlag sett med egne øyne:**
- Alle ni klipp i `public/media/wow/scroll-world/` (16:9), hver 15. ramme. Ark: `.design/arbeid/manus/rammer-a1.jpg`
  (dive-0, conn-0, dive-1, conn-1, dive-2) og `rammer-a2.jpg` (conn-2, dive-3, conn-3, dive-4). Kjedearkene
  `.design/arbeid/produsent/sw-kjede-16x9.png` (eldre, med skiltet som nå er fjernet).
- Resten av siden: `.skudd/wow/r6/etter/desktop-*-hel.png`.
- Tekst: `docs/design/tekst/forside.md`, `src/data/historie.ts`, `docs/design/wow-brief.md` runde 3,
  `docs/design/rapporter/wow-r4-kritiker.md`, `docs/design/bevegelse.md` (ScrollWorld).
- Referanser: se eget avsnitt. Ark i `.design/arbeid/manus/ref-*.jpg` (`.design/` er i `.gitignore`).

---

## Del 1. Felles grunnlag for alle tre behandlingene

### Hva klippene faktisk viser

| Klipp | Rammer | Hva du ser | Hva det kan bære |
|---|---|---|---|
| dive-0 | 121 | Øy med tre hus, blå trikk, folk. Kameraet skyver inn til gata i skumring. Små grønne lys på brosteinen. | Gata, «alle vinduer lyser» |
| conn-0 | 121 | Opp over takene, bakeriøya flyter i mørket langt fram, ned mot den. | Overgang, «vi går videre» |
| dive-1 | 105 | Bakeriøya, kunde med mobil utenfor, inn gjennom vinduet. Grønn skjerm bak disken synes fra første ramme. | Bakeriet. Grønt i bildet før noe er gjort (kritiker r4 #1) |
| conn-1 | 121 | Ut av bakeriet, langs en gate med lykter, ned mot kontorøya. | Overgang |
| dive-2 | 121 | Kontor i snitt, kvinne ved pult, skjerm med fargerik kalender. **Ingen grønn skjerm.** | Kontoret |
| conn-2 | 121 | Ut, tom gate med lykter, fram til gult hus med hvit varebil. | Overgang |
| dive-3 | 121 | Rørlegger med telefon som lyser grønt fra første ramme, åpen varebil med rør. | Rørleggeren |
| conn-3 | 121 | Opp over en hel by i skumring med hundrevis av opplyste vinduer, ned til verkstedøya. | Den store bevegelsen. Byen |
| dive-4 | 121 | Verkstedet uten skilt. Inn gjennom vinduet til pult med to skjermer med grønn hake. **Tom stol.** | Verkstedet, målingene |

Motoren (`src/scripts/wow/scroll-world.ts`) spoler klippene etter rullingen, kutter hardt i sømmene, legger
gråtone over til lampa blir grønn, holder kameraet nesten stille i «ro», og lar panelet med målingene gli
over i rapporten. Den kan i dag ikke spille et klipp baklengs eller vise et stillbilde som eget segment.

### Det som er sant og kan brukes

- Målingene av kodekonsulentene.no, 18. nov. 2026 (`src/data/historie.ts`): Cookies før samtykke 0,
  Sikkerhetsheadere 6/6, Universell utforming 0 maskinelt testbare feil, Lovpålagt informasjon org.nr. bekreftet.
- «30 sekunder» for rapporten, «20 minutter» samtale, prototype 72 timer etter samtalen, bygging 2–3 uker,
  lanseringsuke regnet fra i dag (`forside.md` del 8), svartid 24 timer (`firma.ts`).
- Prisene leses fra `src/data/priser.ts`. «Prisene er endelige» står i vilkårene.
- «Denne siden bruker ikke cookies.» står i footeren.
- `/status` er helsesjekken Fly bruker. Den kan måles fra nettleseren når siden åpnes.

**Ikke lov:** tall om bakeriet, kontoret eller rørleggeren, påstander om kunder vi har hatt, og utfall vi ikke
kan måle («bestillingen er gjort før kunden går»). Bedriftene i gata er illustrasjon, merket KI.

### Felles regler for fortelleren

- Fortelleren er «vi». Snakker til én person, «du». Presens, korte setninger, maks ca. 90 tegn per linje.
- Linjene står i den ene platen som finnes i dag, én om gangen. De er `<p>`, ikke overskrifter. Overskriftene
  (H2) bærer søkeordene.
- Ingen utropstegn, ingen tankestrek i linjene, ingen floskler. Hver linje er lest høyt; det som hørtes ut
  som reklame, er strøket.
- Uten JS og med redusert bevegelse står alle linjene i rekkefølge som statisk tekst ved stillbildene, slik
  at historien kan leses som et manus. Platen er ikke `aria-live`.

### Overskrifter og søk (felles)

| Sted | I dag | Nytt (H2 med mindre annet står) | Hvorfor |
|---|---|---|---|
| Heroen | H1 «Gratis befaring av nettsiden din» | Uendret | Søkeord og løfte står |
| Bakeriet | «Nettsider» | «Nettsider som laster på mobilen» | Utfall + søkeord (kritiker r4 #11) |
| Kontoret | «Systemer og integrasjoner» | «Integrasjoner for booking, betaling og regnskap» | Nisjesøk, jf. `kodekonsulentene-seo` |
| Rørleggeren | «Apper og AI» | «Apper for håndverkere» | AI vises aldri i bildet (r4 #11) |
| Rapporten | «Lyser din side grønt?» | «Sjekk nettsiden din» | Samme navn som verktøyet og footer-lenken |
| Priser | «Prisene står her» | «Fast pris på nettside, system og app» | Sier hva det gjelder |
| Slik går det | «Slik går det» | «Fra samtale til lansering» | Sier hva tidslinjen er |
| Spørsmål | «Det folk spør om først» | Uendret | `FAQPage`-schema finnes |
| Kontakt | «Snakk med den som koder» | Uendret | |

Lenkene fra tjeneste-H2-ene går til `/nettsider`, `/systemer` og `/apper-og-ai` som før.

### Typografisk rytme (felles, bryter med wow-briefens «versaler overalt»)

Eiers skjermbilde viser problemet: fra rapporten og ned har hver seksjon samme gigantiske versal-overskrift
og samme oppbygning. Det bryter auteur-bannene #6 og #11 og taket på 6rem for overskrifter i løpende flyt.
Regelen for alle tre behandlingene:

- **Bare to gigantiske versal-øyeblikk etter heroen:** garantifeltet og ordmerket i footeren. Alt annet er
  setningsform, maks 4,5rem.
- **Hver seksjon åpner på sin egen måte:** rapporten åpner med radene, Arbeid med et bilde, garantien med en
  setning fra fortelleren og så feltet, prisene med tallene, tidslinjen med én dato, spørsmålene med det
  første spørsmålet, kontakten med fortellerens siste linje og knappen.
- **Det store er alltid innhold, aldri en etikett:** et tall, en dato, et spørsmål, et bilde.

### Bevegelsesbudsjett (felles ramme)

Auteur: høyst tre rullestyrte mønsterfamilier på siden, nøyaktig én topp (intensitet ≥ 8), heroen på 6–7.
Klikk (prisvelger, spørsmål, felt) teller ikke som rullefamilie. Hver behandling under navngir sine tre
familier, sin topp og sine støttescener.

---

## Del 2. Referanser: hvordan andre gjør tidslinje, priser og spørsmål til scener

Sett 19. nov. 2026 som stillbilder på 8–12 rulleposisjoner (1440 × 900, Chrome), ikke som video. Bevegelsen
mellom bildene er utledet, ikke tidtatt. Grepet beskrives, ikke oppsettet.

| # | Side | Hva de gjør | Grepet vi låner | Ikke kopier |
|---|---|---|---|---|
| 1 | [superlocaldesign.com](https://superlocaldesign.com/) (Superlocal Design Festival 2026; Awwwards-element «"S" Accordion scroll animation») | Programmet er dager som bånd i full bredde. Én dag er åpen med øktene sine, de neste står som tynne fargede bånd under, og neste dag åpner seg når du ruller (bilde 6–9 i `ref-superlocal.jpg`). Datoen er det største på skjermen. | Tidslinjen som bånd som åpner seg ett om gangen, med datoen som display. Passer «Fra samtale til lansering». | Fargene, den prikkete displayfonten |
| 2 | [mschristensen.com/capabilities](https://www.mschristensen.com/capabilities) (Awwwards-element «Capability Walkthrough», tagget sticky, accordion, scroll) | Et bilde står fast til venstre og bytter for hver gruppe, mens teksten ruller til høyre. En liten prikk på skillelinja viser hvilken gruppe du er i (`ref-msc.jpg`, bilde 3–6). | Spørsmål og svar med et fast «bevis» ved siden av: paragrafen, avtaleteksten eller målingen som svaret bygger på, byttet per spørsmål. | Enhetsmockupene |
| 3 | [andluca.com/company](https://www.andluca.com/company) (Awwwards-element «Timeline animation») | Loddrett tidslinje 2017–2026 med prikker på en strek, og til slutt markøren «TODAY» (`ref-andluca.jpg`, bilde 1–6). | Vi snur den: vår tidslinje *starter* i «I dag» og regner datoene framover. Deres er historie, vår er en avtale. | Lange lister per år |
| 4 | [heyorca.com/pricing](https://www.heyorca.com/pricing) (Awwwards-element «Interactive pricing page») | Priskalkulator med valg, og en kostnadsoppstilling der hver linje i prisen står. Planhodene blir stående øverst mens du sammenligner radene (`ref-heyorca.jpg`). | Prisen vises som rader med navn og verdi, i samme grammatikk som målingene i rapporten. Valget fyller radene, ikke et kort. | Kortrekka i pastell, rabattlogikken |
| 5 | epic.net (vår egen studie, `docs/design/referanser.md`, filmstripe 8. okt. 2026) | Ordene i en setning løsner og forsvinner mens du ruller, de tre fete ordene blir stående og blir til en tegning. | Én setning som står igjen med kjernen. Brukes i garantien i behandling C. | Slottet og ballongene |

Syntaxstudio (sammenligningen i `.skudd/sammenligning/`) har ingen historie (kritiker r4 gir 4 av 10), men vinner
på at hver seksjon har sin egen bevegelse. Det er det resten av siden mangler, og det alle tre behandlingene retter.

---

## Del 3. Behandling A: «Lag»

**Logline.** Kameraet går ned gjennom lagene i en nettside, fra fasaden kunden ser til grunnmuren ingen ser,
måler det eneste som er ekte på bunnen, og sendes så rett opp igjen til din egen fasade.

**Forteller.** «Vi» som leder et dykk. Rolig, instruerende, nesten som en sjekkliste lest høyt. Navngir hvert
lag når vi går inn i det. Sier aldri mer enn det som trengs for å gå videre.

**Struktur.**
- *Overflate* (gata): spørsmålet, «det som avgjør, ligger under».
- *Akt I–III, tre lag*: bakeriet (det kunden trykker på), kontoret (det som skjer etter bestillingen),
  rørleggeren (det som skjer ute). Vi går inn i hvert lag gjennom en skjerm i laget over.
- *Tiden strekkes*: jo dypere, jo mer rulling per sekund klipp (dykk-vekt 0,9 / 1,1 / 1,3 / 1,5 / 1,8).
  Fortelleren sier det høyt én gang, så leseren kjenner det i hånda.
- *Bunnen* (verkstedet): målingene av siden du står på.
- *Vendepunkt og topp, oppstigningen*: alle lag spoles baklengs på én skjermhøyde, hardt kuttet, opp til gata.
- *Døra*: tilbake på gata i farger. «Hvilket lag svikter hos deg?»

### Beat-ark, filmen (ca. 8,5 skjermhøyder)

| Rulleandel | Klipp og avspilling | Fortellerlinje | Skjerm og UI | Leseren skal føle |
|---|---|---|---|---|
| 0–6 % | dive-0 ramme 0, stillbilde, farge | (heroen: H1, ingress, felt) | Heroen som i dag. Dybdemåler langs venstre kant: Fasade · Lag 1 · Lag 2 · Lag 3 · Bunn | Rolig nysgjerrighet |
| 6–12 % | dive-0 forover | Fra gata ser alle nettsider like ut. Det som avgjør, ligger under. | Heroen glir ut, platen kommer | Gjenkjennelse |
| 12–16 % | conn-0 forover | Vi går ned. Ett lag for hver ting kunden aldri ser. | Dybdemåleren tennes ved «Fasade» | Forventning |
| 16–22 % | dive-1 0→0,72, gråtone | Første lag: det kunden trykker på. Siden laster ikke, og kunden går. | Måleren glir til «Lag 1» | Ubehag |
| 22–27 % | dive-1 ro, farge tilbake | **Nettsider som laster på mobilen** · Vi bygger siden lett, så den åpner raskt på mobilen. | Lampa grønn | Lettelse |
| 27–31 % | NY portal 1 (bakeriskjermen → kontoret) | Bak skjermen er det et lag til. | Skjermen fyller bildet, vi går gjennom lyset | Svimmelhet, «å» |
| 31–37 % | dive-2 fra innsiden, gråtone | Andre lag: det som skjer etter bestillingen. Tre programmer, samme tall. | «Lag 2» | Gjenkjennelse |
| 37–43 % | dive-2 ro, farge | **Integrasjoner for booking, betaling og regnskap** · Vi kobler dem sammen, så hvert tall føres én gang. | | Ro |
| 43–47 % | NY portal 2 (kalenderen → telefonen) | Merk at det går saktere nå. Jo lenger ned, jo bedre gjemmer feil seg. | Rullingen per sekund klipp øker merkbart | Tyngde |
| 47–54 % | dive-3 fra nærbildet, gråtone | Tredje lag: det som skjer ute. Jobbene står på lapper, og én er borte. | «Lag 3» | Stress |
| 54–60 % | dive-3 ro, farge | **Apper for håndverkere** · Jobbene i en app, koblet til det samme systemet. | | Orden |
| 60–64 % | NY portal 3 (telefonen → skjermen i verkstedet) | Bunnen. Her er det ingen fasade igjen, bare målinger. | «Bunn» | Stillhet |
| 64–78 % | dive-4 innerste del, hold | Bedriftene over er tegnet. Siden du står på, er ikke det. Den målte vi. | Panelet: fire målinger låser seg én etter én, «Målt 18. nov. 2026» | Tillit |
| 78–80 % | hold | Alt holder. Nå går vi opp. | | Pust inn |
| 80–90 % | **Oppstigningen:** én ferdig klippet fil, alle dykk og portaler baklengs i tredobbel fart, harde kutt | (ingen linje) | Dybdemåleren raser fra «Bunn» til «Fasade» | Fart, kroppslig. **Toppen** |
| 90–95 % | dive-0 siste ramme, farge, hold | Tilbake på gata. Alt ser likt ut. Forskjellen er at vi vet. | | Klarhet |
| 95–100 % | sløret toner mot rapporten | Din side har de samme lagene. Hvilket av dem svikter? | Panelet blir rapportradene | Spørsmålet er ditt |

**Payoff.** Leseren har vært på bunnen og blitt dratt opp igjen. Gata ser lik ut som i starten, men nå vet
leseren at det finnes lag under, og at bare målinger viser hvilket som svikter. Spørsmålet gjelder nå din
side, og feltet står rett under.

### Resten av siden

| Seksjon | Fortellerlinje | Bærer | Signaturbevegelse | Åpning og skala | Int. |
|---|---|---|---|---|---|
| Rapporten | Svaret kommer lag for lag, på 30 sekunder. | Radene | Radene sorteres i lag mens de fylles: cookies og universell utforming øverst (det kunden ser), sikkerhetsheadere under, org.nr. nederst (grunnmuren) | Radene først, H2 «Sjekk nettsiden din» i 3,5rem | 6 |
| Arbeid | Det vi har bygget, sett i snitt. | Skjermbildene | Hvert kort glir opp og viser laget under: bookingsystemet viser Vipps, SMS, kalender og regnskap som merkede koblinger | Bildet først, H2 i 3rem | 5 |
| Garanti | Det øverste laget kan du trykke på før noe under er bygget. | Refleksfeltet | Feltet løftes som et lokk (clip-path nedenfra), og under ligger en tynn strektegning av en forside | Versaler, sidens ene store setning | 6 |
| Priser | Du betaler for lagene du trenger. Ikke flere. | Prisvelgeren | Pakkene stables som lag: Start ett lag, Bedrift to, System tre. Valget løfter stabelen, prisen ruller med number-flow | Tallene er display | 5 |
| Fra samtale til lansering | Samme vei ned, nå i ekte tid. Datoene er regnet fra i dag. | Tidslinjen | Rullelengden per steg følger varigheten (logaritmisk): 20 minutter er kort, 2–3 uker er lang. Tiden kjennes i hånda | Én dato om gangen | 5 |
| Spørsmål | Grunnmuren: det som står i avtalen. | Lista | Svaret skyves opp under spørsmålet som en luke (bare transform) | Første spørsmål er overskriften i synet | 3 |
| Kontakt | Det øverste laget er en samtale på 20 minutter. | Knappen | Ingen | H2 i 3,5rem | 3 |
| Footer | (ingen) | Ordmerket | Bokstavene legges som murstein, nederste rad først: grunnmuren med org.nr. og adresse | Ordmerket, versaler | 3 |

**Topp:** oppstigningen. **Støttescener:** portalene (7), målingene (7), garantien (6). **Tre familier:**
scrub (filmen og oppstigningen), festet scene (rapporten, tidslinjen), avdekking (Arbeid, garanti, spørsmål).

### Nytt i motoren (A)

- Segment med `retning: -1` er unødvendig her; oppstigningen er én ferdig fil laget med ffmpeg
  (`reverse`, `setpts=PTS/3`, concat, GOP 8), 0 kreditter, ca. 2 MB.
- `dykk`-vekter per kapittel styrer tidsstrekkingen (finnes).
- Kapitler 2–4 starter midt i klippet (ny egenskap `fra: 0–1`, så vi hopper over øya utenfra).
- Dybdemåler i stedet for telleren: fem trinn, `aria-hidden`, tilstanden står som tekst for skjermleser.

### Nye scener (A): tre portaler, 90 kreditter

Alle: Kling v4.0 image-to-video, 5 s, 1080p, uten lyd, start- og sluttbilde, i 16:9 og 9:16 (≈ 30 per portal).
Stilsetningene er ordrett fra `assets/higgsfield/scroll-world/prompter/konn.txt`.

**Portal 1.** Start: siste ramme i dive-1. Slutt: ramme ca. 100 i dive-2.
> Single continuous cinematic camera move, no cuts. The camera pushes slowly toward the glowing lime-green screen behind the bakery counter. The screen grows until its soft green glow fills the whole frame, the camera passes through the glow and comes out on the other side inside a different small clay room: a cosy office at night where a person sits at a wooden desk in front of a monitor with a colourful calendar. Soft matte clay diorama, handmade plasticine texture, tilt-shift miniature, warm amber light against cool blue dusk. Smooth graceful slow motion. The shapes stay solid and keep their form. No text, no captions, no readable screen content.

**Portal 2.** Start: siste ramme i dive-2. Slutt: ramme ca. 105 i dive-3. Samme prompt med «the monitor with the colourful calendar» → «a plumber standing by an open white van holding a phone that glows lime-green».

**Portal 3.** Start: ramme ca. 110 i dive-3. Slutt: siste ramme i dive-4. Samme prompt med «the glowing phone» → «a small workshop at night, a desk with two monitors showing green check marks».

### Risiko (A)

- Portaler gjennom en skjerm er det modellene oftest smører ut. Kalibrer portal 1 i 16:9 (15 kreditter) før resten.
- Metaforen er løsere enn den ser ut: bakeriet, kontoret og rørleggeren er tre bedrifter, ikke tre lag av én.
  En håndverker kan lese det som tre historier med en ny effekt mellom.
- Oppstigningen er sidens topp, men den viser ingenting nytt. Den kan føles som et triks.
- Budsjettet brukes nesten opp (90 av ca. 100).

---

## Del 4. Behandling B: «Baklengs»

**Logline.** Filmen åpner der alt virker og spoles tilbake til øyeblikket ingenting gjorde det, så leseren ser
virkningen før årsaken og ender i begynnelsen, der hennes egen side står.

**Forteller.** «Vi» som spoler et opptak tilbake og forklarer det vi ser, som en etterforsker. Hver linje i
fortiden begynner med «Før det». Tørr, presis, uten å skynde seg.

**Struktur.**
- *Prolog i slutten*: verkstedet, alle fire målinger låst.
- *Tilbakespolingen*: rullingen er tiden, baklengs. Hvert kapittel viser løsningen først (farge, H2), så
  renner fargen ut og problemet kommer (gråtone). Lampene i telleren slukner én etter én: 3, 2, 1, 0.
- *Vendepunkt*: vi når første ramme av hele filmen. Den lille gråe gata i svart. «Her står din side også.»
- *Topp*: tiden snur. Klippet som har gått baklengs, begynner å gå forover når du ruller videre, og resten av
  siden går framover i tid.

### Beat-ark, filmen (ca. 8 skjermhøyder)

| Rulleandel | Klipp og avspilling | Fortellerlinje | Skjerm og UI | Leseren skal føle |
|---|---|---|---|---|
| 0–6 % | dive-4 siste ramme, stillbilde, farge | (heroen: H1, ingress, felt) | Teller: 3 av 4 lyser grønt | Ro, alt er ferdig |
| 6–12 % | hold | Dette er slutten. Alt lyser grønt, og vi vet hvorfor: det er målt. | Panelet med de fire målingene står ferdig, med dato | Tillit, litt for tidlig |
| 12–14 % | dive-4 baklengs starter | Spol tilbake. | | Brudd |
| 14–20 % | dive-4 baklengs, gråtone øker | Før målingene var det bare to haker på en skjerm. | Radene løsner nedenfra, én etter én | Tvil |
| 20–28 % | conn-3 baklengs (ned i byen, opp, ned mot rørleggeren) | Før det: en by full av nettsider, og ingen visste hvilke som virket. | | Skala |
| 28–32 % | dive-3 baklengs fra nærbildet, farge | **Apper for håndverkere** · Rørleggeren har dagens jobber i en app. | Lampe 3 grønn | Orden |
| 32–38 % | dive-3 baklengs, fargen renner ut | Før det sto jobbene på lapper i bilen. Én av dem forsvant. | Lampe 3 slukner | Tap |
| 38–42 % | conn-2 baklengs | (ingen linje) | Teller 2 av 4 | |
| 42–46 % | dive-2 baklengs, farge | **Integrasjoner for booking, betaling og regnskap** · Kontoret fører hvert tall én gang. | | Ro |
| 46–52 % | dive-2 baklengs, gråtone | Før det lå booking, betaling og regnskap i tre programmer. | Lampe 2 slukner | Slit |
| 52–56 % | conn-1 baklengs | (ingen linje) | | |
| 56–60 % | dive-1 baklengs, farge | **Nettsider som laster på mobilen** · Bakeriets side åpner raskt på mobilen. | | Lett |
| 60–66 % | dive-1 baklengs, gråtone | Før det lastet den ikke, og kunden gikk videre. | Lampe 1 slukner. Teller 0 av 4 | Ubehag |
| 66–72 % | conn-0 baklengs | Og før alt dette: en gate der ingen visste om noe virket. | | Tomhet |
| 72–82 % | dive-0 baklengs til ramme 0, helt grå, øya krymper i svart, hold | Her står din side også, til noen har målt den. | Den fjerde lampa, «Din side», er alene igjen | Det gjelder meg |
| 82–92 % | **Tiden snur:** dive-0 forover igjen, fargen kommer tilbake i takt med rullingen | Herfra går tiden bare én vei. Første steg tar 30 sekunder. | Teller og lampe blir stående; klokkeikonet bytter retning | **Toppen.** Fart framover |
| 92–100 % | sløret toner mot rapporten | (ingen linje) | Rapporten med tomme rader for din side | Handling |

**Payoff.** Leseren tror filmen er en suksesshistorie, men den går baklengs til der ingen visste noe. Den siste
rammen i fortiden er den første rammen i filmen, og det er der leserens side står. Da snur tiden, og siden blir
en avtale med datoer framover.

### Resten av siden

Hver seksjon får et tidsstempel i margen (vanlig tekst, ikke versaler): når i avtalen den hører hjemme.

| Seksjon | Tidsstempel | Fortellerlinje | Signaturbevegelse | Åpning og skala | Int. |
|---|---|---|---|---|---|
| Rapporten | I dag, 30 sekunder | (linja fra filmen holder) | Tomme rader for din side. Våre målinger sto i prologen og gjentas ikke | Feltet først, H2 «Sjekk nettsiden din» | 6 |
| Arbeid | Før i dag | Dette har vi bygget før. Konsept står som konsept. | Kortene glir inn fra høyre mot venstre, mot rulleretningen: fortid | Bildet først | 4 |
| Garanti | 72 timer etter samtalen | Det neste du ser, er din egen forside. | Feltet skaleres inn (finnes), med tidsstempelet som teller fram fra «I dag» | Versaler, sidens ene store setning | 6 |
| Priser | Ved oppstart og ved lansering | Du betaler i to deler: ved oppstart og ved lansering. | Når du velger pakke, deler prisen seg i to blokker langs en strek, 40 % ved oppstart og resten ved lansering (bare andeler, ingen nye kronebeløp) | Tallet er display | 5 |
| Fra samtale til lansering | Fra i dag | Tiden går framover nå. Datoene er regnet fra i dag. | Festet scene. Datoen ruller fram som et datohjul (number-flow) fra dagens dato til prototypedagen og lanseringsuka. Ruller du opp, går den tilbake | Én stor dato | 7 |
| Spørsmål | Etter lansering | (ingen) | Ingen. Stillhet | Første spørsmål | 3 |
| Kontakt | Nå | Alt over begynner med 20 minutter på telefon. | Ingen | H2 3,5rem | 3 |
| Footer | (ingen) | (ingen) | Ordmerket som i dag | Ordmerket | 3 |

**Topp:** tiden snur. **Støttescener:** tidslinjen (7), prologen (6), garantien (6). **Tre familier:** scrub
(filmen, baklengs og forover), festet scene (tidslinjen), avdekking (Arbeid, priser, garanti).

### Nytt i motoren (B)

- `retning: -1` per segment: klippet spoles fra 1 til 0. Med GOP 8 og Blob-lasting fungerer søk bakover,
  men iOS må måles (se risiko).
- Gråtonen snus: farge → grå innen et kapittel. Telleren teller ned.
- Panelet med målingene starter fullt og låser seg opp baklengs. Rapporten under starter tom (bare din side),
  så målingene står ett sted.
- Vendesegmentet: dive-0 forover etter at det har gått baklengs, med `kart` som speiles.

### Nye scener (B)

Ingen. 0 kreditter.

### Risiko (B)

- StoryBrand: løsningen kommer før problemet i hvert kapittel. Det er det motsatte av hvordan en kunde tenker,
  og «If you confuse, you lose» gjelder.
- Slutten står i en grå, liten øy i svart. Følelsen er tom akkurat der vi ber om en handling.
- Baklengs dykk ser ut som at kameraet trekker seg ut. Det er riktig for tilbakespoling, men leseren får aldri
  komme *inn* i noe før vendepunktet.
- Søk bakover er tyngre for dekoderen enn forover. Må testes på ekte iPhone før det velges.

---

## Del 5. Behandling C: «Lampa»

**Logline.** En forteller viser deg en gate full av grønne lys og nekter å tro på ett eneste av dem, til
filmen innrømmer at hele gata står på pulten vår, og at det eneste som er målt, er siden du leser nå.

**Forteller.** «Vi», som en inspektør. Lav, saklig, litt mistenksom, med tørr humor én gang. Viser deg ting og
sier hva de *ikke* beviser. Innrømmer det andre ville skjult. Sier «du». Snakker aldri om seg selv som helt:
kunden er den som skal vite, vi er den som måler.

**Gjenstanden.** Én lampe ved teksten. Hul ring betyr *ikke målt*. Fylt grønn betyr *målt, med dato*. Den
skifter bare på ekte målinger. Gråtone til farge i bildet betyr noe annet: det viser hva vi bygger. Bildet
viser løftet, lampa viser beviset. Den samme lampa følger med resten av siden og står til slutt ved feltet
ditt, hul, til du har målt.

**Struktur.**
- *Prolog midt i slutten*: to grønne haker på en skjerm, uten forklaring.
- *Akt I, regelen*: gata og lampa. Leseren lærer hva som tenner den.
- *Akt II, tre forsøk*: bakeriet, kontoret, rørleggeren. Hver gang kommer fargene tilbake, og hver gang blir
  lampa hul. Tredje gang sier fortelleren det leseren allerede tenker.
- *Vendepunkt, innrømmelsen*: kameraet trekker seg ut av gata og avslører at den er en modell på pulten vår.
  KI-merket som har stått nede i hjørnet hele filmen, var ledetråden.
- *Akt III og topp, målingen*: det eneste som finnes, er siden du leser. Fire målinger låser seg på pulten.
  Lampa tennes for første gang.
- *Lukking*: samme bilde som i starten. Nå betyr det noe.
- *Døra*: din lampe er hul.

**Ledetråder og innfrielse (plot-structure).** Plantet: kolofonen «Illustrasjon laget med KI» (synlig hele
filmen), den tomme stolen (prologen), «Hvem som helst kan tegne dem» (prologen), den grønne skjermen i bakeriet
mens lampa er hul. Innfridd: innrømmelsen (kolofonen blir linja), målingene på samme skjerm, stolen i kontakten,
lampa i footeren.

### Beat-ark, filmen (ca. 8 skjermhøyder)

| Rulleandel | Klipp og avspilling | Fortellerlinje | Skjerm og UI | Leseren skal føle |
|---|---|---|---|---|
| 0–5 % | dive-4 siste ramme som stillbilde, farge, langsom innzoom 1,00→1,04 (transform) | (heroen: H1 «Gratis befaring av nettsiden din», ingress, felt) | Heroteksten til venstre, pulten med to haker fyller høyre del | Nysgjerrig: hvorfor et rom? |
| 5–9 % | hold | Vi begynner på slutten. To grønne haker på en skjerm. | Heroen glir ut. Platen og lampa (hul) kommer | Rolig |
| 9–12 % | hold | Haker er lette å tegne. Hvem som helst kan gjøre det. | | Første mistanke |
| 12–16 % | dive-4 baklengs i høy fart (kameraet rygger ut av vinduet), hardt kutt til dive-0 ramme 0 | Så vi spoler tilbake til der det begynte. | | Brudd, filmisk |
| 16–23 % | dive-0 forover, farge | En gate i Oslo. Tre bedrifter, tre nettsider. Alle vinduene lyser. | Lampa hul | Gjenkjennelse |
| 23–26 % | conn-0 forover | Lys i et vindu sier ingenting om siden. Derfor har vi en lampe. | Lampa pulserer én gang (opasitet), uten å tennes | Oppmerksom |
| 26–28 % | conn-0 forover | Den tennes bare for det som er målt. Ikke for det som ser bra ut. | | Regelen sitter |
| 28–33 % | dive-1 0→0,72, gråtone | Bakeriet. Kunden står utenfor med mobilen, og siden laster ikke. | | Ubehag |
| 33–38 % | dive-1 ro, fargene strømmer tilbake | **Nettsider som laster på mobilen** · Vi bygger siden lett, så den åpner raskt på mobilen. | Lampa forblir hul | Lettelse |
| 38–41 % | dive-1 slutt + conn-1 | Skjermen bak disken lyser grønt. Lampa gjør ikke det. Ingen har målt bakeriet. | Den grønne skjermen i bildet og den hule lampa står samtidig. Det er poenget | Aha |
| 41–45 % | dive-2 0→0,75, gråtone | Kontoret. Booking, betaling og regnskap ligger i hvert sitt program. | | Gjenkjennelse |
| 45–50 % | dive-2 ro, farge | **Integrasjoner for booking, betaling og regnskap** · Vi kobler dem sammen, så hvert tall føres én gang. | Hul | Orden |
| 50–53 % | dive-2 slutt + conn-2 | Kalenderen fylles opp. Fint å se på. Fortsatt ikke målt. | | Mønsteret |
| 53–57 % | dive-3 0→0,68, gråtone | Rørleggeren. Dagens jobber står på lapper i bilen, og én av dem er borte. | | Stress |
| 57–62 % | dive-3 ro, farge | **Apper for håndverkere** · Dagens jobber i en app på telefonen. Ingen lapper. | Hul | Orden |
| 62–64 % | dive-3 slutt | Telefonen lyser grønt. Du vet hva vi skal si. | | Smil. Leseren er med |
| 64–67 % | hardt kutt til NY N2 baklengs: starter på nøyaktig samme bilde som dive-0 ramme 0 | Her må vi innrømme noe. | KI-merket nede i hjørnet løfter seg og blir til neste linje | Uro: dette har jeg sett |
| 67–74 % | N2 baklengs: kameraet trekker seg ut, gata er en modell på pulten vår, ved siden av bakeriet, kontoret og varebilen | Gata står på pulten vår. Vi laget den med KI. Bakeriet finnes ikke. | | Gulvet forsvinner. **Toppen begynner** |
| 74–77 % | N1 stillbilde, hold | Tegninger kan ikke måles. Så vi målte det eneste her som finnes: | Panelet kommer ved skjermene | Spenning |
| 77–80 % | N1, langsom innzoom mot skjermene | siden du leser nå. | | Svimmel: jeg er inni den |
| 80–88 % | N1 hold, gråtone til første hake | (stillhet mens radene låser seg) | Cookies før samtykke 0 · Sikkerhetsheadere 6/6 · Universell utforming 0 feil · Lovpålagt informasjon org.nr. bekreftet · Målt 18. nov. 2026. Lampa fylles grønn ved fjerde rad | **Toppen.** Tillit som er fortjent |
| 88–92 % | hold | Den første lampa i filmen som lyser. Den har dato. | | Lettelse |
| 92–96 % | N1 hold (samme utsnitt som prologen, men med modellene) | Samme to haker som i starten. Nå betyr de noe. | | Sirkelen lukkes |
| 96–100 % | sløret toner mot rapporten, panelet blir radene | Din side ser sikkert fin ut. Det er ikke det samme som at den virker. | Den fjerde lampa står hul ved feltet: «Din side: ikke målt» | Spørsmålet henger igjen |

**Payoff.** Leseren tror filmen handler om tre bedrifter som får det til å virke. Så viser det seg at de er
modeller på en pult, og at fortelleren har sagt det hele tiden: lampa ble aldri tent for dem. Det eneste ekte i
filmen er siden leseren står på, og den er målt med dato. Da blir spørsmålet til leseren uunngåelig: din side ser
fin ut, men er den målt? Lampa ved feltet er hul. Den står sånn til du har sjekket.

### Resten av siden

| Seksjon | Fortellerlinje | Bærer | Signaturbevegelse | Åpning og skala | Int. |
|---|---|---|---|---|---|
| Rapporten | Lampa ved feltet står slukket til du har målt. Det tar 30 sekunder. | Radene og feltet | Den hule lampa ved feltet er filmens lampe, som har fulgt med ned. Kjører du sjekken, fylles radene én etter én, og lampa blir grønn eller får rød ring | Radene er display. H2 «Sjekk nettsiden din» i 3,5rem | 6 |
| Arbeid | Det vi har bygget, med samme lampe. Konsept står som konsept. | Kortene | Driftsstatus-kortet får en levende lampe: nettleseren spør `/status` når kortet kommer inn, og lampa tennes med svartiden som faktisk ble målt, i formatet «svarte på {N} ms» (tallet måles hver gang og skrives aldri inn i koden). Bookingsystemet har hul lampe og «Konsept, ikke oppdrag» | Bildet først, H2 i 3rem | 5 |
| Garanti | Du skal ikke tro oss på ordet. Du skal trykke på det først. | Refleksfeltet | Feltet kommer som en tynn strektegning av en forside og fylles med refleksfarge når det står midt i skjermen: tegningen blir noe du kan trykke på. Så løsner ordene i setningen (epic-grepet), og «nei» og «ingenting» står igjen et øyeblikk før hele setningen kommer tilbake | Versaler, sidens ene store setning | 6 |
| Fast pris på nettside, system og app | Ingen anslag. Prisene er endelige, og de står her. | Prisvelgeren og lista | Prislista settes i samme grammatikk som målingene: navn, blå målelinje, tall. Velger du pakke, trekkes målelinja fra navnet til tallet. Prisen leses som en måling, ikke et tilbud | Tallene er display, H2 i 3rem | 5 |
| Fra samtale til lansering | Herfra er datoene ekte. De er regnet fra i dag. | Tidslinjen | Festet scene som starter i markøren «I dag» (andluca snudd). Én stor dato ruller fram (number-flow) mens prikken går langs streken: i dag, prototypedagen, uke for lansering. Bare én dato er stor om gangen | Én dato | 7 |
| Spørsmål | (stillhet) | Lista | Til venstre står et fast «bevis» for svaret som er åpent: ekomloven § 3-15, «35 krav i WCAG 2.0», avtalepunktet. Byttes per spørsmål (msc-grepet) | Første spørsmål i 2,5rem, H2 liten | 3 |
| Kontakt | Stolen i verkstedet har stått tom hele filmen. Book 20 minutter, så sitter vi der. | Stillbilde N3 | Bildet av pulten fra filmen, nå med en leirfigur i stolen sett bakfra, glir inn ved knappen | H2 i 3,5rem | 4 |
| Footer | (ingen) | Ordmerket | Ordmerket som i dag. Linja «Denne siden bruker ikke cookies.» får sidens siste lampe, fylt, med «Målt 18. nov. 2026» | Ordmerket | 3 |

**Topp:** pulten, fra kameraet trekker seg ut av gata til lampa tennes (64–92 % av filmen, ca. 40 % ned på
siden). **Støttescener:** prologen (6), tidslinjen (7), garantien (6), rapporten (6). **Tre familier:** scrub
(filmen), festet scene (rapportovergangen, tidslinjen), avdekking med målelinje (rapportradene, prisene,
garantiens tegning). Spørsmål og kontakt er bevisst rolige.

### Nytt i motoren (C)

- `retning: -1` per segment (p → 1 − p): prologens tilbakespoling og N2.
- Stillbilde som eget segment med CSS-skala (transform), for prologen og N1.
- Lampa frikobles fra gråtonen. Ny tilstand per kapittel: `malt: false` (hul) eller målingene. Telleren
  «N av 4» fjernes; det er én lampe ved platen pluss «Din side» ved feltet.
- `linjer: { ved: 0–1, tekst }[]` per segment i stedet for problem/løsning-paret, så platen kan ha 2–3 linjer
  per kapittel. Tittel og lenke beholdes for H2-ene.
- Kolofonen løftes og blir til linja ved 64 % (transform og opasitet).
- Arbeid: én `fetch("/status", { cache: "no-store" })` når kortet er synlig, svartid fra `performance.now()`.
  Feiler den, står lampa hul med «ikke målt nå». Ingen tredjepart.
- Tidslinjen: number-flow på én dato (biblioteket finnes).

### Nye scener (C): ca. 36 kreditter

**N1, stillbilde: pulten med modellene** (redigert bilde, qwen-image-3/edit som ved skiltfjerningen, ≈ 1,5 × 2
formater = 3). Referanse 1: siste ramme i dive-4 (og dive-4-m for 9:16). Referanse 2: dive-0 ramme 0 og
poster-1..3 for modellene.
> Edit the first reference image. On the wooden desk in front of the two monitors, add four tiny clay diorama models standing side by side on small round bases, each about the size of a coffee cup: the cobblestone street island with three narrow townhouses, street lamps and a small blue tram exactly as in the second reference image, a small brick bakery with a striped awning, a small office building with one lit window, and a small yellow wooden house with a white van. The models have the same soft matte plasticine look, warm window glow and small lime-green (#C8F24A) light accents as the room. Keep everything else exactly as in the first reference: the same camera angle and framing, the two monitors with green check marks, the desk lamp, shelves, plants, bricks, window, wooden floor, lighting and clay style. The chair stays empty. Do not add any text, letters, numbers, logos or signs. Change nothing else.

**N2, klipp: inn i gata på pulten** (Kling v4.0, 5 s, 1080p, uten lyd, 16:9 og 9:16 = 30). Start: N1. Slutt:
dive-0 ramme 0 (poster-0). Spilles **baklengs** i motoren, så det starter på nøyaktig bildet leseren kjenner
fra gata og trekker seg ut til pulten.
> Single continuous cinematic camera move, no cuts. Start on the wooden desk with the two monitors and the four small clay models. The camera slowly pushes in and descends toward the small cobblestone street model with the three townhouses and the tram, until the street model fills the frame and the desk, the room and the other models fall away into a perfectly flat near-black darkness, so the street becomes the floating island in a dark void. Soft matte clay diorama, handmade plasticine texture, tilt-shift miniature, warm amber light against cool blue dusk, muted brick red, ochre and slate-blue palette with lime-green accents. Smooth, graceful, slow motion, subtle parallax. The shapes stay solid and keep their form. No text, no captions.

**N3, stillbilde: stolen er ikke tom** (redigert bilde, ≈ 3). Referanse: siste ramme i dive-4.
> Edit the reference image. Add one small clay figure sitting in the desk chair, seen from behind, facing the two monitors, short dark hair and a dark knitted sweater, one hand on the keyboard. The face is not visible. Keep everything else exactly as in the reference: camera angle, framing, monitors with green check marks, desk lamp, shelves, plants, window, lighting and clay style. Do not add any text, letters, numbers, logos or signs. Change nothing else.

Rekkefølge for kredittene: N1 16:9 → se på det → N2 16:9 (15) → se på sømmen mot poster-0 (PSNR som før) →
9:16. N3 er valgfri og kan vente til eier har sagt ja til en figur i stolen.

**Reserve uten N1/N2:** byen i conn-3 holdes ved ca. 0,45 med linja «Her må vi innrømme noe. Bakeriet, kontoret
og rørleggeren er laget med KI.» Twisten står i teksten, men mister bildet. Det er en svakere topp.

### Risiko (C)

- Innrømmelsen kan leses som at vi sier at tjenestehistorien er falsk. Motvekt: H2-ene og lenkene til
  tjenestesidene står uendret, og linja sier at *bedriftene* er tegnet, ikke tjenestene.
- Tre kapitler uten tent lampe kan føles som tre kapitler uten utbetaling. Motvekt: fargene kommer tilbake hver
  gang, og det tredje kapitlet har en vits som belønner leseren for å ha skjønt regelen.
- N2 baklengs må treffe dive-0 ramme 0 nesten nøyaktig, ellers ser leseren ikke at det er samme gate. Kling har
  truffet sluttbilder med 36–39 dB i sømmene før (`assets/higgsfield/logg.md`), men en reise fra pult til øy er
  lenger enn en vanlig kobling. Kalibrer i 16:9 først.
- Den levende lampa i Arbeid måler bare at serveren svarer. Teksten må si akkurat det.
- En figur i stolen (N3) må godkjennes av eier, fordi «Hvem jeg er» venter på ekte portrett.

---

## Del 6. Sammenligning og anbefaling

| | A «Lag» | B «Baklengs» | C «Lampa» |
|---|---|---|---|
| Fortellergrep | Lag inni lag, tid som strekkes | Tid baklengs, start i slutten | Gjenstand som avgjør hva som er ekte, åpning i slutten, sirkel |
| Twist | Oppstigningen (bevegelse) | Begynnelsen er der du står (sted) | Gata er en modell; det eneste målte er siden du leser (mening) |
| Kunden er helten | Delvis: dykket er vårt | Svakt: løsning før problem | Ja: leseren lærer regelen og bruker den på sin egen side |
| Bruker kritiker r4 #1 | Nei | Nei | Ja, gjør det til plottet |
| KI-merket | Plikt | Plikt | Ledetråd og innfrielse |
| Kreditter | ca. 90 | 0 | ca. 36 (3 uten N2) |
| Motorendring | Middels | Middels, iOS-risiko | Middels |
| Største risiko | Portalene smører | Uklart, tom slutt | Innrømmelsen misforstås |

**Anbefaling: C «Lampa».**

1. **Temaet er produktet.** Æresregelen i CLAUDE.md sier at en falsk «Bestått» er verre enn ingen sjekk. C gjør
   den regelen til en historie: grønt som ikke er målt, teller ikke. Det kan ingen konkurrent låne uten å måle
   selv, og det er det syntax ikke har.
2. **Twisten snur meningen, ikke bare bildet.** A og B snur bevegelsen. C snur hva leseren har sett: gata var
   tegnet, og fortelleren sa det hele tiden. Det er den typen slutt eier ber om.
3. **Svakhetene blir plott.** Den grønne skjermen i bakeriet og telefonen til rørleggeren (kritiker r4 #1) og
   KI-merket er nå ledetråder. Byttetesten består, for det eneste ekte er målt med dato.
4. **Slutten er et spørsmål til leseren**, med en hul lampe ved feltet. Spørsmålet henger igjen, og svaret
   tar 30 sekunder.
5. **Billigst av de modige:** 36 kreditter, og alt annet er klipp vi har.

---

## Del 7. Anbefalt behandling lest høyt (C «Lampa»)

**Logline.** En forteller viser deg en gate full av grønne lys og nekter å tro på ett eneste av dem, til filmen
innrømmer at hele gata står på pulten vår, og at det eneste som er målt, er siden du leser nå.

| # | Klipp | Linje |
|---|---|---|
| | dive-4 siste ramme (hero) | *H1:* Gratis befaring av nettsiden din |
| 1 | hold | Vi begynner på slutten. To grønne haker på en skjerm. |
| 2 | hold | Haker er lette å tegne. Hvem som helst kan gjøre det. |
| 3 | dive-4 baklengs → kutt | Så vi spoler tilbake til der det begynte. |
| 4 | dive-0 | En gate i Oslo. Tre bedrifter, tre nettsider. Alle vinduene lyser. |
| 5 | conn-0 | Lys i et vindu sier ingenting om siden. Derfor har vi en lampe. |
| 6 | conn-0 | Den tennes bare for det som er målt. Ikke for det som ser bra ut. |
| 7 | dive-1, grå | Bakeriet. Kunden står utenfor med mobilen, og siden laster ikke. |
| 8 | dive-1, farge | *H2:* Nettsider som laster på mobilen · Vi bygger siden lett, så den åpner raskt på mobilen. |
| 9 | dive-1 → conn-1 | Skjermen bak disken lyser grønt. Lampa gjør ikke det. Ingen har målt bakeriet. |
| 10 | dive-2, grå | Kontoret. Booking, betaling og regnskap ligger i hvert sitt program. |
| 11 | dive-2, farge | *H2:* Integrasjoner for booking, betaling og regnskap · Vi kobler dem sammen, så hvert tall føres én gang. |
| 12 | dive-2 → conn-2 | Kalenderen fylles opp. Fint å se på. Fortsatt ikke målt. |
| 13 | dive-3, grå | Rørleggeren. Dagens jobber står på lapper i bilen, og én av dem er borte. |
| 14 | dive-3, farge | *H2:* Apper for håndverkere · Dagens jobber i en app på telefonen. Ingen lapper. |
| 15 | dive-3 slutt | Telefonen lyser grønt. Du vet hva vi skal si. |
| 16 | N2 baklengs (starter på gata) | Her må vi innrømme noe. |
| 17 | N2 baklengs (ut til pulten) | Gata står på pulten vår. Vi laget den med KI. Bakeriet finnes ikke. |
| 18 | N1 | Tegninger kan ikke måles. Så vi målte det eneste her som finnes: |
| 19 | N1, innzoom | siden du leser nå. |
| | N1, målingene låser seg | *(stillhet)* Cookies før samtykke 0 · Sikkerhetsheadere 6/6 · Universell utforming 0 feil · Org.nr. bekreftet · Målt 18. nov. 2026 |
| 20 | N1 | Den første lampa i filmen som lyser. Den har dato. |
| 21 | N1 | Samme to haker som i starten. Nå betyr de noe. |
| 22 | overgang | Din side ser sikkert fin ut. Det er ikke det samme som at den virker. |
| 23 | Rapporten | *H2:* Sjekk nettsiden din · Lampa ved feltet står slukket til du har målt. Det tar 30 sekunder. |
| 24 | Arbeid | Det vi har bygget, med samme lampe. Konsept står som konsept. |
| 25 | Garanti | Du skal ikke tro oss på ordet. Du skal trykke på det først. |
| 26 | Priser | Ingen anslag. Prisene er endelige, og de står her. |
| 27 | Fra samtale til lansering | Herfra er datoene ekte. De er regnet fra i dag. |
| | Spørsmål | *(stillhet)* |
| 28 | Kontakt (N3) | Stolen i verkstedet har stått tom hele filmen. Book 20 minutter, så sitter vi der. |
| | Footer | *(lampa ved «Denne siden bruker ikke cookies.», fylt)* |

## Åpne spørsmål

1. Godtar eier innrømmelsen «Bakeriet finnes ikke» på forsiden? Hele C står på den.
2. Godtar eier en leirfigur i stolen (N3), eller skal stolen stå tom til det ekte portrettet kommer? Da blir linje
   28: «Stolen i verkstedet står tom. Book 20 minutter, så sitter vi der.»
3. Heroen starter på pulten i stedet for gata. LCP-bildet byttes til dive-4 siste ramme. Revisor må måle.
4. Typografiregelen over endrer wow-briefens «overskrifter i versaler». Dirigenten må skrive det inn i briefen.
5. `tekstforfatter` bør lese linjene høyt én gang til før de går inn i `historie.ts`, og `faktasjekker` bør se
   paragrafene i spørsmålsbeviset.
