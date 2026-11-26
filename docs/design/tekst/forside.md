# Tekstmanus – forsiden, retning A «Befaring»

Oppdrag f2-tekst-forside, 2026-10-08. Hele forsiden i rekkefølgen fra briefens del 6.
Oppdatert i runde wow-r2b, 2026-11-18: stemmen er «vi» (dirigentens avgjørelse i wow-r2, jf. CLAUDE.md:
siden snakker som «vi», og ingen person nevnes ved navn). Der siden sier «vi», sier manuset det samme.
Del 2 er nå filmen (ScrollWorld), som erstatter scenen og «Det vi bygger». Den opprinnelige stemmen var
«jeg» (PORT 1). Lyst som standard i retning A; wow-forsiden er alltid mørk. Prislista er typografisk, hentet fra retning C (PORT 1).
Skills lastet: `kodekonsulentene-tekst`, `ux-copy`.
Kilder: `src/pages/index.astro`, `src/data/{priser,firma,bevis,tjenester,prosess,faq,caser,navigasjon}.ts`, `src/components/{ContactBlock,LegalFooter}.astro`, `docs/design/retning.md`, `docs/design/tekst/retning-a.md` (fase 1, gjenbrukt), `docs/design/rapporter/f1-kritiker-retninger.md`, briefen del 2, 3, 4 og 6.

Om kildekolonnen: «dagens side» betyr at innholdet står på siden i dag. Rader merket «dagens side,
vi-form» sto i jeg-form i forrige utgave av manuset og er skiftet tilbake til «vi» uten at innholdet er endret. Menyen beholder dagens punkter fra `src/data/navigasjon.ts` og omfattes ikke av manuset.

## Title, meta description og H1

| Felt | Dagens verdi | Ny verdi |
|---|---|---|
| Title | KodeKonsulentene – nettsider og systemer i Oslo | Beholdes uendret. Søkeordene nettsider, systemer og Oslo står. |
| Meta description | For norske småbedrifter som har vokst ut av Wix-siden: nettsider og systemer som henger sammen med booking, Vipps og regnskap – sikkert, raskt og til fast pris. | Gratis befaring av nettsiden din: rapport på 30 sekunder. Nettsider og systemer for norske småbedrifter i Oslo, til fast pris. |
| H1 | Nettsider og systemer som jobber for bedriften din (ordet «systemer» i aksentfarge) | Gratis befaring av nettsiden din |

Søkeordene fra dagens H1 (nettsider, systemer) står i title og meta description, slik fase 1-manuset avgjorde.

## Rekkefølgen (briefen del 6, retning A)

Wow-forsiden etter runde wow-r2b: Filmen (kapittel 0 er tilbudet, kapittel 1–3 er tjenestene, kapittel 4
leder inn i rapporten) → Rapporten → Arbeid → Garantien → Prisvelgeren og prislista → Slik går det →
Spørsmål → Kontakt → Footer. «Hvem jeg er» rendres ikke før eier har levert portrett.

Opprinnelig rekkefølge (retning A): Tilbudet → Scenen → Rapporten → Arbeid → Garantien → Det jeg bygger → Prisvelgeren og prislista → Slik går det → Hvem jeg er → Spørsmål → Kontakt → Footer.

---

## 1. Tilbudet (første skjerm, kapittel 0 i filmen)

| Id | Tekst | Kilde |
|---|---|---|
| hero.overskrift (H1) | Gratis befaring av nettsiden din | ny |
| hero.ingress | Rapport på 30 sekunder: cookies, sikkerhet, fart og om org.nr. står på siden. | dagens side |
| hero.felt.ledetekst (skjult for øyet, leses av skjermleser) | Nettadresse | dagens side |
| hero.felt.plasshold | dinbedrift.no | dagens side |
| hero.felt.hint | Ingen innlogging. Du velger selv om rapporten skal sendes på e-post. | dagens side |
| hero.felt.feil | Det ser ikke ut som en nettadresse. Prøv formen dinbedrift.no. | ny |
| hero.knapp | Start befaringen | ny |
| hero.booklenke | Eller book 20 minutter | dagens side |

## 2. Filmen (ScrollWorld, runde wow-r3: historien)

Oppdatert 2026-11-18 etter eiers «Den må fortelle en historie» og wow-briefen «Runde 3». Erstatter
r2b-tekstene. Den røde tråden er grønt lys: filmen går fra «ingen vet om nettsiden virker» til «lyser
din side grønt?». Hvert kapittel har samme form: **problem** (lampe grå) → **tittel og løsning** (lampe
grønn) → neste sted. Teksten bytter innhold på én plate, uten overlapp. Problemene står i du-form, slik
at leseren ser sin egen bedrift og ikke et oppdrag vi har levert (kritiker r3 #13). Ingen tall om de
oppdiktede bedriftene. Tre varianter står under, A er anbefalt.

### Felles for alle variantene

| Id | Tekst | Kilde |
|---|---|---|
| film.etikett (aria-label) | Kameratur gjennom en gate med tre bedrifter og verkstedet vårt | ny |
| film.hopp (hopp-lenke forbi filmen) | Hopp til rapporten | ny |
| film.kolofon (i tekstplata så lenge filmen går, ikke bare på første skjerm) | Illustrasjon laget med KI | påbudt, briefen del 6 punkt 12, kritiker r3 #13 |
| film.0.sted | Gata | dagens side (r2b) |
| film.1.sted | Bakeriet | dagens side (r2b) |
| film.2.sted | Kontoret | dagens side (r2b) |
| film.3.sted | Rørleggeren | dagens side (r2b) |
| film.4.sted | Verkstedet | dagens side (r2b) |
| film.1.tittel lenker til | /nettsider | dagens side |
| film.2.tittel lenker til | /systemer | dagens side |
| film.3.tittel lenker til | /apper-og-ai | dagens side |

Telleren øker med én hver gang en lampe blir grønn i kapittel 1–3, og står på 3 av 3 gjennom kapittel 4.
Lampen er pynt (`aria-hidden`). Telleren er vanlig tekst og bærer tilstanden for skjermlesere.

Målingene i kapittel 4, med navnene slik `src/lib/sjekk.ts` skriver dem (rekkefølge fra wow-briefen):

| Id | Etikett | Verdi | Kilde |
|---|---|---|---|
| film.4.maaling.cookies | Cookies før samtykke | 0 | dagens side (`bevis.ts`), format fra `sjekk.ts` |
| film.4.maaling.headere | Sikkerhetsheadere | 6/6 | dagens side (`bevis.ts`), format fra `sjekk.ts` |
| film.4.maaling.uu | Universell utforming | [MANGLER: verdien fra sjekken av kodekonsulentene.no 18. nov; sjekken skriver «N feil»] | – |
| film.4.maaling.lov | Lovpålagt informasjon | [MANGLER: verdien fra sjekken 18. nov; sjekken skriver «Org.nr. bekreftet» når Enhetsregisteret svarer] | – |

### Variant A (anbefalt): rolig og konkret

| Id | Tekst | Kilde |
|---|---|---|
| hero.overskrift (H1, kapittel 0) | Gratis befaring av nettsiden din | dagens side (uendret, søkeord og løfte beholdt) |
| hero.ingress (kapittel 0, erstatter ingressen i del 1) | Skriv inn adressen. På 30 sekunder ser du hva som virker, og hva som ikke gjør det. | ny («30 sekunder» fra dagens side) |
| film.teller | 0 av 3 lyser grønt → 1 av 3 lyser grønt → 2 av 3 lyser grønt → 3 av 3 lyser grønt | ny |
| film.0.problem (når heroteksten har tont ut) | Tre bedrifter, tre nettsider. Ingen vet om de virker. | ny (briefen runde 3) |
| film.0.tittel / film.0.losning | – (lampen er grå, telleren står på 0) | – |
| film.1.problem | Kunden står utenfor med mobilen, men siden din laster ikke. | ny |
| film.1.tittel | Nettsider | dagens side |
| film.1.losning | En rask side, så kunden bestiller rett fra mobilen. | ny |
| film.2.problem | Booking, betaling og regnskap ligger i hvert sitt program. | ny |
| film.2.tittel | Systemer og integrasjoner | dagens side |
| film.2.losning | Vi kobler dem sammen, så ingen skriver samme tall to ganger. | dagens side, forkortet |
| film.3.problem | Dagens jobber står på lapper i bilen, og én av dem er borte. | ny |
| film.3.tittel | Apper og AI | dagens side |
| film.3.losning | Jobbene i en app på telefonen, fra oss som bygde nettsiden. | dagens side («fra den som bygde nettsiden»), vi-form |
| film.4.problem | Her sitter vi. Vi foreslår ingenting før vi har målt. | ny (briefen runde 3) |
| film.4.tittel | Målt først | dagens side (r2b), forkortet |
| film.4.losning | Fire målinger av denne siden, med samme sjekk som du får. | ny |
| film.4.overgang (overskrift når filmen glir over i rapporten, over URL-feltet) | Lyser din side grønt? | ny |

Lest i ett: Gratis befaring av nettsiden din. Skriv inn adressen. På 30 sekunder ser du hva som virker,
og hva som ikke gjør det. Tre bedrifter, tre nettsider. Ingen vet om de virker. Kunden står utenfor med
mobilen, men siden din laster ikke. Nettsider: en rask side, så kunden bestiller rett fra mobilen.
Booking, betaling og regnskap ligger i hvert sitt program. Systemer og integrasjoner: vi kobler dem
sammen, så ingen skriver samme tall to ganger. Dagens jobber står på lapper i bilen, og én av dem er
borte. Apper og AI: jobbene i en app på telefonen, fra oss som bygde nettsiden. Her sitter vi. Vi
foreslår ingenting før vi har målt. Målt først: fire målinger av denne siden. Lyser din side grønt?

### Variant B: kortere og mer direkte

| Id | Tekst |
|---|---|
| hero.overskrift | Gratis befaring av nettsiden din |
| hero.ingress | Skriv inn adressen, så har du rapporten om 30 sekunder. |
| film.teller | 0 av 3 grønne → 3 av 3 grønne |
| film.0.problem | Tre bedrifter. Ingen vet om nettsiden virker. |
| film.1.problem / tittel / losning | Siden din laster ikke på mobilen. / Nettsider / Rask side, bestilling rett fra mobilen. |
| film.2.problem / tittel / losning | Tre programmer som ikke snakker sammen. / Systemer og integrasjoner / Koblet sammen. Hvert tall føres én gang. |
| film.3.problem / tittel / losning | Jobbene står på lapper i bilen. / Apper og AI / Jobbene i en app på telefonen. |
| film.4.problem / tittel / losning | Vi måler før vi foreslår noe. / Målt først / Fire målinger av denne siden. |
| film.4.overgang | Hva med din side? |

### Variant C: varmere

| Id | Tekst |
|---|---|
| hero.overskrift | Vi tar en gratis befaring av nettsiden din |
| hero.ingress | Skriv inn adressen. Om 30 sekunder vet du hva som virker på siden din. |
| film.teller | Ingen lyser grønt ennå → 1 av 3 lyser grønt → 3 av 3 lyser grønt |
| film.0.problem | En gate i Oslo. Tre bedrifter, og ingen vet om nettsiden virker. |
| film.1.problem / tittel / losning | Kunden står utenfor med mobilen og venter på at siden din skal laste. / Nettsider / Nå laster siden raskt, og bestillingen er gjort før kunden går videre. |
| film.2.problem / tittel / losning | Kvelden går med til å føre de samme tallene i tre programmer. / Systemer og integrasjoner / Nå snakker programmene sammen, og du fører hvert tall én gang. |
| film.3.problem / tittel / losning | Dagens jobber står på lapper i bilen, og én av dem er borte. / Apper og AI / Nå har du jobbene i en app, fra oss som bygde nettsiden. |
| film.4.problem / tittel / losning | Her sitter vi. Vi begynner alltid med å måle. / Vi måler først / Fire målinger av denne siden, med samme sjekk som du får. |
| film.4.overgang | Lyser din side grønt? |

### Hvorfor A

A holder H1 ordrett (søkeordet «befaring» og løftet står), og setter ordet «virker» i ingressen, som
gata, kapitlene og sluttspørsmålet bygger videre på. B er raskest å lese, men problemene blir
stikkord og historien forsvinner. C er varmest, men «Nå …» i hver løsning kan leses som at vi har levert
til bakeriet (kritiker r3 #13), og «bestillingen er gjort før kunden går videre» lover et utfall vi ikke
kan måle. «Lyser din side grønt?» forutsetter at leseren har sett lampene. Uten JavaScript eller med
redusert bevegelse må lampene stå grønne i kapittel 1–3. Hvis ikke, bruk «Hva med din side?».

### Fjernet i runde 3 fordi det sto flere ganger

1. **Firepunktslista i hero-ingressen** («cookies, sikkerhet, fart og om org.nr.») sto tre ganger: i ingressen, i merkene og i rapporten (kritiker r3 #8). Nå står målingene bare i kapittel 4, som glir over i rapporten.
2. **Tjenestelinjene fra dagens side** (lange versjoner) er byttet ut med én løsningssetning per kapittel. «Rangerer lokalt», «består lovkravene» og «AI som faktisk gjør en jobb» står på tjenestesidene.
3. **«Du får se de samme tallene som vi ser»** (r2b) er slått sammen med kapittel 4-løsningen. Det står én gang.
4. **«Vi måler siden din før vi foreslår noe»** (r2b) er nå problemlinja i kapittel 4 og står ikke lenger i løsningen.

## 3. Rapporten (anker `#rapport`)

| Id | Tekst | Kilde |
|---|---|---|
| rapport.tittel (H2) | Befaringsrapport | ny |
| rapport.emne (forhåndsutfylt adresselinje i skjemaet) | kodekonsulentene.no | ny |
| rapport.ingress | Forhåndsutfylt for vår egen side. Kjører du befaringen øverst, fylles den ut for din – linje for linje. | ny, vi-form |
| rapport.status (vises mens sjekken kjører) | Befaringen pågår. Rapporten fylles ut linje for linje. | ny |
| rapport.rad.cookies | Cookies før samtykke — 0 | dagens side (`bevis.ts`) |
| rapport.rad.headere | Sikkerhetsheadere — 6 av 6 | dagens side (`bevis.ts`) |
| rapport.rad.svartid | Svartid, målt fra Oslo — 0,1 s | dagens side (`bevis.ts`) |
| rapport.rad.orgnr | Org.nr. på siden — Funnet | dagens side (står i footeren) |
| rapport.rad.ytelse | Ytelse — [MANGLER: målt ytelsestall for kodekonsulentene.no; revisor må måle før raden kan stå] | – |
| rapport.tomfelt (i stedet for tomme linjer, jf. kritikerfunn) | Fylles ut når du kjører befaringen. | ny |
| rapport.mangelord (merkelapp på overstrøkne rader når besøkendes sjekk finner feil) | Mangler | dagens side (begrep fra `/sjekk`) |
| rapport.fastpris | Fast pris på utbedring: 7 900 kr, endelig pris. Dekker cookie-samtykke, universell utforming, org.nr. og personvernerklæring. | dagens side (`priser.ts`, Lovsjekk-pakke) |
| rapport.knapp | Book 20 minutter | dagens side |

## 4. Arbeid (caser)

| Id | Tekst | Kilde |
|---|---|---|
| arbeid.tittel (H2) | Hva vi har bygget | dagens side, vi-form |
| arbeid.ingress | Problem, løsning, resultat. Står det et tall her, er det målt – ikke anslått. | dagens side |
| arbeid.app1.tittel | [MANGLER: navn på app nummer én, fra eier] | eier |
| arbeid.app1.merke | App | dagens side (`caser.ts`) |
| arbeid.app1.tekst | [MANGLER: problem og løsning i to setninger, fra eier] | eier |
| arbeid.app1.tall | [MANGLER: nedlastinger og vurdering i App Store, dokumentert av eier] | eier |
| arbeid.app2.tittel | [MANGLER: navn på app nummer to, fra eier] | eier |
| arbeid.app2.merke | App | dagens side (`caser.ts`) |
| arbeid.app2.tekst | [MANGLER: problem og løsning, fra eier] | eier |
| arbeid.app2.tall | [MANGLER: brukertall, dokumentert av eier] | eier |
| arbeid.demo.merke | Ikke et levert oppdrag | dagens side |
| arbeid.demo.tittel | Bookingsystem for klinikk | dagens side |
| arbeid.demo.problem | Problem. Timebestilling over telefon i åpningstiden betyr tapte timer, avbrutte behandlinger og en halv dag i måneden på å avstemme Vipps mot regnskapet. | dagens side |
| arbeid.demo.losning | Løsning. Booking med Vipps-betaling ved bestilling, automatisk SMS-påminnelse, og timen rett inn i behandlerens kalender og som ordre i regnskapet. | dagens side |
| arbeid.demo.lenke | Se caset | dagens side |
| arbeid.pilot | Vi tar inn to til tre pilotprosjekter til redusert pris mot at vi får bruke tallene som case. Si fra hvis det er aktuelt. | dagens side, vi-form |
| arbeid.merkeregel | Konseptarbeid er alltid merket «Konsept, ikke oppdrag». | dagens side |
| arbeid.lenke | Se alle caser | dagens side |

## 5. Garantien (ett felt i full bredde, på refleksfarge)

| Id | Tekst | Kilde |
|---|---|---|
| garanti.tekst | Du ser en klikkbar prototype av forsiden din før du har betalt noe. Sier du nei til prototypen, koster det ingenting. | dagens side (ordlyd fastsatt i briefen del 6 punkt 11) |

Garantien og prototype-løftet står her og ingen andre steder på siden.

## 6. Det vi bygger (ikke på wow-forsiden etter wow-r2b)

Tjenestene står nå i filmen, del 2. Tittelen og ingressen under brukes ikke på forsiden. Radene står
igjen i vi-form, fordi tjenestelinjene er de samme som i filmen.

| Id | Tekst | Kilde |
|---|---|---|
| tjenester.tittel (H2) | Tre ting vi gjør | dagens side, vi-form |
| tjenester.ingress | Og én ting vi ikke gjør: selge deg noe du ikke trenger. Trenger du bare en lovsjekk, er det det du får. | dagens side, vi-form |
| tjenester.1.lenke (stor tekstlenke → /nettsider) | Nettsider | dagens side |
| tjenester.1.linje | Rask side som rangerer lokalt, består lovkravene og lar deg endre teksten selv. | dagens side |
| tjenester.2.lenke (stor tekstlenke → /systemer) | Systemer og integrasjoner | dagens side |
| tjenester.2.linje | Booking, betaling og regnskap som snakker sammen, slik at ingen skriver samme tall to ganger. | dagens side |
| tjenester.3.lenke (stor tekstlenke → /apper-og-ai) | Apper og AI | dagens side |
| tjenester.3.linje | Intern app eller iOS-app fra den som bygde nettsiden – og AI som faktisk gjør en jobb. | dagens side |

## 7. Prisvelgeren og prislista

Prisene står i velgeren og ingen andre steder i seksjonen. Lista under viser hva som er med, de løpende radene og vilkårene – som en typografisk prisliste på veggen, ikke tre like kort. Alle beløp leses fra `src/data/priser.ts` og skrives aldri av.

| Id | Tekst | Kilde |
|---|---|---|
| priser.tittel (H2) | Prisene står her | dagens side |
| priser.ingress | Fordi du skal kunne regne på det før du ringer. | dagens side |
| velger.etikett (fieldset-legend) | Velg pakke | ny |
| velger.rad.start | Start — 14 900 kr — For deg som trenger å finnes, bli ringt og bestå lovkravene. | dagens side (`priser.ts`, linje forkortet så sidetallet 1–3 bare står i lista) |
| velger.rad.bedrift.merke | Anbefalt | dagens side |
| velger.rad.bedrift | Bedrift — 29 900 kr — Du endrer innholdet selv, og siden synes i lokale søk. Pakken de fleste trenger. | dagens side (`priser.ts`, linje forkortet) |
| velger.rad.system | System — fra 60 000 kr — Kundeportal, app eller kobling mot systemene du allerede betaler for. | dagens side (`priser.ts`, uten fagordet «web-app») |
| velger.status (aria-live, leses opp ved valg) | Valgt: {pakkenavn}. Illustrasjonen viser hva som er med. | ny |
| prisliste.start.tittel | Dette er med i Start | ny |
| prisliste.start.punkter | 1–3 sider, skrevet ferdig · Booking eller kontaktskjema · Grunnleggende SEO og Google Bedriftsprofil · Lovsjekk: org.nr., cookies, universell utforming | dagens side (`priser.ts`) |
| prisliste.start.ikke | Ikke med: CMS – vi endrer teksten for deg · Lokal SEO per bydel | dagens side, vi-form |
| prisliste.bedrift.tittel | Dette er med i Bedrift | ny |
| prisliste.bedrift.punkter | 5–8 sider med CMS du kan redigere selv · Lokal SEO per tjeneste og bydel · Cookieløs analyse – ingen banner · Lovsjekk og sikkerhetsheadere | dagens side (`priser.ts`) |
| prisliste.system.tittel | Dette er med i System | ny |
| prisliste.system.punkter | Booking, kundeportal eller intern app · Vipps- eller Stripe-betaling · Integrasjon mot Tripletex, Fiken eller PowerOffice · BankID-innlogging ved behov · Sikkerhetsgjennomgang før lansering | dagens side (`priser.ts`) |
| prisliste.rad.abonnement | Abonnement — 1 290–1 990 kr/mnd — Side bygget, hosting, endringer og sikkerhetsoppdateringer. Ingen oppstartskostnad. | dagens side (`priser.ts`, binding og timetak står i spørsmålene) |
| prisliste.rad.drift | Drift og vedlikehold — 590–1 490 kr/mnd — For deg som kjøpte siden som engangskjøp. Oppdateringer, backup og overvåkning. | dagens side (`priser.ts`, forkortet) |
| prisliste.rad.timepris | Timepris — 950 kr/t — Arbeid utenfor avtalt omfang. Faktureres per påbegynte halvtime. | dagens side (`priser.ts`, forkortet) |
| prisliste.vilkaar.mva | Prisene er endelige. Foretaket er ikke mva-registrert, så det kommer ingen mva på toppen. | dagens side (`mvaSetning` i `priser.ts`) |
| prisliste.vilkaar.betaling | 40 % faktureres ved oppstart, resten ved lansering. | dagens side (`priser.ts`) |
| prisliste.vilkaar.revisjoner | To revisjonsrunder er inkludert. Flere runder er timepris. | dagens side (`priser.ts`) |
| prisliste.lenke | Se hele prislisten | ny |
| prisvelger.kolofon (bildetekst under prisvelgerens illustrasjon) | Illustrasjon laget med KI | ny (påbudt, briefen del 6 punkt 12). Ikke i bruk på wow-forsiden: prisvelgeren har ingen illustrasjon. |

## 8. Slik går det (ekte datoer, regnet fra visningsdagen)

Datoene hardkodes aldri. De regnes ut ved hver visning, slik:

- **[prototypedato]** = dagens dato + 3 døgn (72 timer), formatert som norsk ukedag og dato, for eksempel «torsdag 15. oktober».
- **[lanseringsuke]** = ISO-ukenummeret for dagens dato + 24 døgn (72 timer prototype + 3 uker bygging, øvre grense av «2–3 uker», så løftet alltid holder).

| Id | Tekst | Kilde |
|---|---|---|
| prosess.tittel (H2) | Slik går det | ny |
| prosess.ingress | Datoene under er regnet fra i dag. | ny |
| prosess.steg1 | Samtale — 20 minutter. Vi går gjennom hva som tar tid i bedriften i dag. Du får et prisspenn på telefonen. | dagens side |
| prosess.steg2 | Prototype — [prototypedato]. Booker du i dag, er prototypen klar 72 timer etter samtalen. | dagens side (72-timersløftet; selve garantien står i garantifeltet) |
| prosess.steg3 | Bygging — 2–3 uker. Ukentlig oppdatering mens siden bygges. | dagens side (betalingsplanen står i prisvilkårene) |
| prosess.steg4 | Lansering — uke [lanseringsuke]. Deretter overvåkning, sikkerhetsoppdateringer og månedsrapport med ytelse og oppetid. | dagens side |

## 9. Hvem jeg er

Rendres ikke på wow-forsiden før eier har levert portrett og navn. Står igjen i jeg-form til eier har
avgjort om denne ene blokken skal være personlig; resten av siden sier «vi».

| Id | Tekst | Kilde |
|---|---|---|
| hvem.tittel (H2) | Hvem jeg er | ny |
| hvem.portrett | [MANGLER: portrett av eier – ekte foto, ikke KI] | eier |
| hvem.tekst1 | KodeKonsulentene er mitt enkeltpersonforetak i Oslo, med sikkerhet som spesialfelt. Jeg bygger nettsiden, systemet bak og appen oppå – og setter ikke ut noe til noen. | dagens side, jeg-form |
| hvem.tekst2 | Jeg holder antallet prosjekter lavt med vilje, så ingenting forsvinner i et ledd. Hvordan jeg jobber, hva ting koster, og hva som skjer hvis jeg ikke kan fullføre, står i håndboken. | dagens side, jeg-form |
| hvem.navn | [MANGLER: navnet slik eier vil ha det på siden – briefen del 6 punkt 7 krever portrett, navn og første person] | eier |
| hvem.lenke | Mer om meg | dagens side, jeg-form |

## 10. Spørsmål

| Id | Tekst | Kilde |
|---|---|---|
| faq.tittel (H2) | Det folk spør om først | dagens side |
| faq.1.q | Eier jeg koden og domenet? | dagens side |
| faq.1.a | Ja. Domenet står registrert på ditt foretak fra dag én, og koden ligger i en konto i ditt navn fra lansering. Sier du opp et abonnement, får du en kjørbar kopi av siden og databasen – ingen innlåsing. | dagens side (uten fagordet «Git-repo») |
| faq.2.q | Hva er bindingstiden? | dagens side |
| faq.2.a | Abonnement har 12 måneder binding, fordi byggekostnaden ligger i de første månedene. Drift og vedlikehold på en side du har kjøpt har ingen binding og kan sies opp med én måneds varsel. | dagens side |
| faq.3.q | Hva skjer hvis dere ikke kan fullføre? | dagens side, vi-form |
| faq.3.a | Du har koden, domenet og alle kontoer i ditt navn, så siden står uansett. Avtalen sier at du får full dokumentasjon og alle tilganger utlevert innen fem arbeidsdager hvis vi ikke kan fullføre, og vi oppgir to andre utviklere som kan overta. | dagens side, vi-form |
| faq.4.q | Trenger siden min cookie-banner? | dagens side |
| faq.4.a | Sannsynligvis ikke. Vi bruker cookieløs analyse, og da er det ingenting å samtykke til. Fra 1. januar 2025 krever ekomloven § 3-15 at cookie-samtykke oppfyller GDPR-kravene – ingen forhåndsavkryssing, «avvis» like lett som «godta», ingen sporing før samtykke. Den enkleste måten å overholde det på er å ikke sette cookies. | dagens side, vi-form |
| faq.5.q | Må siden være universelt utformet? | dagens side |
| faq.5.a | Private virksomheter skal oppfylle 35 krav i WCAG 2.0 nivå A og AA. Vi bygger etter WCAG 2.2 AA, som er strengere, fordi det koster lite ekstra og gjør at du også kan levere til det offentlige. Du får en rapport som viser hva som er testet. | dagens side, vi-form |
| faq.6.q | Hva koster det å endre noe etterpå? | dagens side |
| faq.6.a | Småting er inkludert i drift eller abonnement, med tak på én time per måned. Utover det gjelder timeprisen i prislista over, alltid avtalt skriftlig på forhånd. Du får aldri en faktura du ikke har sagt ja til. | dagens side (tallet 950 kr står bare i prislista) |
| faq.7.q | Hva om jeg allerede har en WordPress-side? | dagens side |
| faq.7.a | Da er lovsjekk-pakken ofte riktig sted å starte. Hva den dekker og hva den koster, står nederst i befaringsrapporten lenger opp. Virker resten av siden, trenger du ikke en ny. | dagens side (prisen og dekningen står bare i rapporten) |

## 11. Kontakt

| Id | Tekst | Kilde |
|---|---|---|
| kontakt.tittel (H2) | Snakk med den som koder | dagens side |
| kontakt.ingress | 20 minutter på telefon, ingen presentasjon. Du får en ærlig vurdering av om du trenger det du tror du trenger. | dagens side (prisspennet står i «Slik går det») |
| kontakt.book.tittel | Book direkte | dagens side |
| kontakt.book.tekst | Velg et ledig tidspunkt i kalenderen. Du får en bekreftelse med lenke – ingen e-post fram og tilbake. | dagens side («kvarter» rettet til «tidspunkt»; samtalen er 20 minutter) |
| kontakt.book.knapp | Book 20 minutter | dagens side |
| kontakt.epost.etikett | E-post | dagens side |
| kontakt.epost.verdi | hei@kodekonsulentene.no | dagens side (`firma.ts`) |
| kontakt.svartid.etikett | Svartid | dagens side |
| kontakt.svartid.verdi | 24 timer | dagens side (`firma.ts`) |
| kontakt.skjema.tittel | Eller skriv kort | dagens side |
| kontakt.skjema.navn | Navn | dagens side |
| kontakt.skjema.epost | E-post | dagens side |
| kontakt.skjema.nettside | Nettside i dag | dagens side |
| kontakt.skjema.nettside.hint | Har du ingen ennå, la feltet stå tomt. | dagens side |
| kontakt.skjema.melding | Hva tar tid i dag? | dagens side |
| kontakt.skjema.knapp | Send meldingen | ny (dagens «Send» sier ikke hva som skjer) |
| kontakt.personvern | Vi bruker opplysningene bare til å svare deg, og sletter dem etter seks måneder hvis det ikke blir et oppdrag. Se personvernerklæringen. | dagens side, vi-form |

## 12. Footer (lovpålagt, uendret innhold)

| Id | Tekst | Kilde |
|---|---|---|
| footer.ordmerke | KodeKonsulentene | dagens side (`firma.ts`) |
| footer.tagline | Nettsider som virker. Systemer som henger sammen. | dagens side (`firma.ts`) |
| footer.orgnr | Org.nr. 936 374 336 | dagens side (`firma.ts`, vises via `orgnrVist`) |
| footer.foretaksnavn | KodeKonsulentene Elkassmi | dagens side (`firma.ts`, lovpålagt, bare her) |
| footer.adresse | Oslo | dagens side (`firma.ts`) |
| footer.epost | hei@kodekonsulentene.no | dagens side (`firma.ts`) |
| footer.lenker | Dagens liste fra `navigasjon.ts` beholdes uendret: Priser, Caser, Artikler, Sjekk nettsiden din, Gratisverktøy, Priskalkulator, E-postsjekk (SPF, DMARC), For håndverkere, For klinikker, Håndbok, Driftsstatus, Terminal (~), Personvern, Salgsvilkår | dagens side |
| footer.cookies | Denne siden bruker ikke cookies. | dagens side (`firma.ts`) |

## Alt-tekster og KI-merking

- **Filmens stillbilder og klipp (ScrollWorld):** dekorativ flate med `aria-hidden="true"` og `alt=""`. Innholdet bæres av kapitteltekstene. KI-merket står én gang, nede i hjørnet på første skjerm (`film.kolofon`).
- **Scenens posterbilde og klipp (retning A):** dekorativ flate med `aria-hidden="true"` og tom alt-tekst (`alt=""`), slik referansekoden i briefen del 8 krever. Innholdet bæres av stegtekstene, som leses som vanlig tekst uten JavaScript.
- **«Illustrasjon laget med KI»** står to steder: som bildetekst rett under scenen (`scene.kolofon`) og under prisvelgerens illustrasjon (`prisvelger.kolofon`). Det er de to stedene på forsiden som bruker Higgsfield-materiale.
- **Portrett** (når eier leverer): alt-tekst «Portrett av [MANGLER: navn], utvikleren bak KodeKonsulentene.» Ekte foto, aldri KI.
- **App-skjermopptak** (når eier leverer): tilgjengelig navn «Skjermopptak av [MANGLER: appnavn] i bruk.» Opptakene skal ikke KI-merkes – de er ekte arbeid, og KI-merket ville undergravd dem.
- Demo-caset har ikke bilde i dag og får ingen alt-tekst.

## Fjernet fordi det sto flere ganger

1. **Prototype-løftet** sto tre ganger (hero, prosess-ingress, prosess-steg 2). Nå står det én gang, i garantifeltet. Prosess-steg 2 sier bare når prototypen er klar.
2. **Mva-setningen** sto fire ganger (hero, prisingress, prisvilkår, FAQ-svar). Nå står den én gang, som første vilkår i prislista. Enheten «endelig pris» står i tillegg i rapportens fastprislinje, slik brandboken krever enheten synlig ved beløpet.
3. **URL-sjekken** sto to ganger (hero og seksjon 05). Nå står feltet bare i heroen; rapporten er resultatet av sjekken, ikke et nytt felt.
4. **Pristallene i heroen** (tre priser pluss «Hele prislisten») er fjernet fra første skjerm; prisene står bare i prisvelgeren.
5. **De fire nøkkeltallene** sto som egen bevisstripe og på /om. Tre av dem (0 cookies, 6 av 6 headere, 0,1 s) står nå som målte rader i rapporten; «24 t» står som svartid i kontaktblokken.
6. **NorSIS-tallene** (78 % og 59 %) sto to ganger (åpningsoverlegg og verktøyingress). Åpningsoverlegget fjernes i alle retninger; tallene er ikke med på den nye forsiden og kan stå på /sjekk.
7. **Lovsjekk-prisen 7 900 kr** sto i prislista og hadde fått en ny plass i rapporten. Nå står den bare i rapporten; Lovsjekk-raden er tatt ut av forsidelista (står fortsatt på /priser), og FAQ-svaret om WordPress peker på rapporten i stedet for å gjenta tall og deknings­liste.
8. **«Du eier koden og domenet»** sto i Start-lista, Bedrift-lista, System-lista (som databasen), prisvilkårene og FAQ. Nå bærer FAQ-svaret «Eier jeg koden og domenet?» hele løftet; punktet er tatt ut av pakkelistene og vilkårene på forsiden.
9. **«To revisjonsrunder»** sto i Bedrift-lista og i vilkårene. Nå bare i vilkårslinja.
10. **«12 måneder binding»** sto i abonnementsraden og i FAQ. Nå bare i FAQ-svaret om bindingstid.
11. **Timetaket «1 time endringer per måned»** sto i abonnementsraden, driftsraden og FAQ. Nå bare i FAQ-svaret om endringer.
12. **«Avtalt skriftlig på forhånd»** sto i timeprisraden og FAQ. Nå bare i FAQ-svaret.
13. **Timeprisen 950 kr** sto i prislista og FAQ. Nå bare i prislista; FAQ-svaret peker dit.
14. **«Du får et prisspenn»** sto i prosess-steg 1 og i kontaktingressen. Nå bare i steg 1.
15. **«1–3 sider» og «5–8 sider»** sto både i pakkelinjene og i inkludert-listene. Sidetallene står nå bare i listene.
16. **«Snakker med utvikleren som skriver koden»** sto i om-teksten og som kontakt-tittel («Snakk med den som koder»). Kontakt-tittelen bærer det alene; «Hvem jeg er» sier i stedet at ingenting forsvinner i et ledd.
17. **FAQ «Hvem gjør jobben?»** er tatt ut av forsiden; innholdet dekkes av «Hvem jeg er» og kontakt-tittelen.
18. **Terminalen, hero-live-teksten og «Skriv inn adressen, så kjører sjekken i terminalen …»** er ute av forsiden; terminalen beholdes som skjult ekstra, slik briefen del 5 krever.
19. **Pilottilbudet** sto ordrett på forsiden og på /caser. Det står én gang på forsiden; /caser-forekomsten håndteres i det sidemanuset.

### Note om knappeteksten

«Book 20 minutter» står tre steder (hero-lenken, rapportens knapp og kontaktblokken). Det er med vilje: samme handling skal ha samme navn, og briefen del 6 punkt 3 fastsetter ordlyden i rapporten. Kontrolltekster regnes ikke som gjentatte setninger.
