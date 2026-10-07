# Research: hva får en norsk småbedrift til å ta kontakt?

Målt og skrevet 7. oktober 2026. Supplement til `docs/research-2026.md`, som
handlet om biblioteker, nettleserfunksjoner og hva forbildene bruker. Denne
handler om kjøperen: rørleggeren, klinikken og regnskapsføreren i Oslo.

**Ikke gjentatt her:** at Awwwards-vinneren animerte minst, at juryen ga høyest
karakter på innhold, og hele biblioteks- og plattformdelen. Det står i
`research-2026.md`, og konklusjonen der holder.

---

## Hvordan lese kildemerkingen

| Merke | Betyr |
|---|---|
| **[VERIFISERT]** | Primærkilden er hentet og tallet lest i den. URL oppgitt. |
| **[VERIFISERT – EGEN MÅLING]** | Målt av meg i dag. Metoden står ved tallet, slik at den kan kjøres om. |
| **[SITERT]** | Bare sett omtalt hos andre. Ikke bruk det på nettsiden uten å finne primærkilden. |
| **[IKKE FUNNET]** | Jeg lette og fant det ikke. Står her for at ingen skal lete igjen. |
| **[IKKE BRUK]** | Primærkilden er funnet og den holder ikke. Begrunnelse oppgitt. |

**Anonymisering.** Konkurrentenes priser og løfter står med navn, fordi de er
publisert av dem selv som salgsmateriale. Konkurrentenes *tekniske tilstand*
står kun aggregert og uten navn. Ett unntak er beskrevet og begrunnet i del 4.6,
og det går mot vår interesse, ikke med den.

---

## Advarsel før alt annet: feilen jeg selv nesten publiserte

Jeg skrev først i denne rapporten at de to SSB-tallene på
`src/pages/bransjer/handverkere.astro` – 72 % og 86 % – ikke fantes hos SSB.
Jeg hadde hentet dem fra **tabell 10975** («Formål med eiga heimeside», etter
SN2007), der serien for bygg og anlegg 10–19 sysselsatte er …71, 68, **79**.
72 finnes ikke der.

**Det var min feil, ikke sidens.** SSB har lagt 2026-tallene i en **ny tabell med
ny næringsstandard**: tabell **14933**, «Bruk av sosiale medium og heimeside
(prosent), etter næring (SN2025), sysselsette», år 2026, oppdatert 25.09.2026.
Jeg hentet den og leste tallene selv **[VERIFISERT]**:

| Næring (SN2025), 2026 | Alle sysselsatte | 10–19 sysselsatte |
|---|---|---|
| **I alt** | **86 %** | **80 %** |
| **Bygge- og anleggsvirksomhet** | 83 % | **72 %** |
| Overnatting og servering | 76 % | 68 % |
| Varehandel | 87 % | 85 % |
| Annen tjenesteyting | 93 % | 91 % |

`https://data.ssb.no/api/v0/no/table/14933`

**Begge tallene på siden vår er riktige**, og forbeholdet som alt står der —
«2026-tallene bruker ny næringsstandard og kan ikke sammenlignes direkte med
tidligere år» — er presis og korrekt. Ingenting skal rettes.

Lærdommen er verdt mer enn funnet: **det finnes to SSB-tabeller om nettsidebruk,
en gammel på SN2007 og en ny på SN2025, og de gir ulike tall.** Hvem som helst
som «etterprøver» oss ved å søke seg til den gamle tabellen vil tro vi tar feil.

**Konkret endring:** skriv tabellnummeret inn i kildehenvisningen på siden —
«SSB, tabell 14933, 2026-tall etter SN2025» — så kan ingen etterprøve oss mot
feil tabell. Det er én setning, og den beskytter det eneste vi har.

---

# Del 0 – Det korte svaret

Spørsmålet var om 6/6 sikkerhetsheadere, null cookies og null WCAG-feil er det
som overbeviser en rørlegger.

1. **Nei – men ikke fordi teknikken er feil. Fordi den står i feil rekkefølge.**
   Det første en besøkende ser på forsiden vår er ordet «sikkerhetsheadere», i
   1,5 sekund på fullskjerm. Prisen kommer 42 % ned i teksten (del 5.2).
2. **Og vi vet nå hva de faktisk vil se i stedet, med segmentmatchet tall.**
   SMB Group 2024 (n = 738) spurte amerikanske småbedrifter hva leverandører kan
   gjøre for å forbedre kjøpsopplevelsen. For bedrifter med **1 ansatt er
   «vis prisen tydelig på nettsiden» rangert #1 (58 %)**, med 2 ansatte #1
   (56 %), med 5–9 ansatte #1 (63 %). Jo mindre bedriften, jo høyere rangerer
   pris på nettsiden. For 1-ansattbedrifter er **«bedre tilgang til
   telefonstøtte fra siden» #3 (40 %)** (del 7.1).
3. **Teknikken er ekte, men ikke unik.** Av 27 norske byråer målt i dag har 2
   alle seks sikkerhetsheaderne (del 4.2). Vi er blant de beste, ikke alene.
4. **Det som *er* unikt er at vi måler** – og at ingen andre kan, fordi det ikke
   finnes norsk statistikk for segmentet (del 1.2). Vår egen skanning av 38
   håndverker- og klinikksider ligger begravd i en juridisk artikkel.
5. **Vi taper kunden på to ting som ikke har noe med teknikk å gjøre:** null
   leverte kundesider å vise, og null telefonnummer. 15 av 27 konkurrenter har
   telefonnummer på forsiden. Vi har ikke.
6. **Vi fremhever det svakeste av våre to juridiske argumenter.** Brudd på
   cookie-reglene kan straffes med overtredelsesgebyr på **inntil 10 % av
   årsomsetningen i Norge** (ekomloven § 15-12). Brudd på universell utforming
   har gitt **2 iverksatte tvangsmulkter på 11 år** (del 2.3). Vi leder med det
   siste.
7. **Vårt sterkeste salgskort er begravd midtveis på siden.** Prøveperiode (62 %)
   og demo (54 %) er de to øverste avgjørende faktorene i den endelige
   beslutningen (Gartner Digital Markets 2025, n = 3 500). Vi tilbyr noe sterkere
   enn begge — en klikkbar prototype av kundens egen side før han betaler noe —
   og det står som steg 2 i en prosessliste i seksjon 6 av 10 (del 7.3).
8. **Eieren har rett i at ingen finner oss, men det er ikke hele saken.** Nærmeste
   konkurrent har 136 indekserte sider mot våre 27, og 11 bransjesider mot våre 2
   (del 3.4). Men selv med trafikk ville siden tapt kunden på punkt 5.

---

# Del 1 – Kjøperen, og hullet i statistikken

## 1.1 Markedet er mikroforetak

**[VERIFISERT]** SSB tabell **14000**, «Føretak, etter næring og storleik»,
versjon «Føretak med aktivitet», 2023, oppdatert 18.09.2025.

| Størrelse | Foretak med aktivitet | Andel |
|---|---|---|
| 0 sysselsatte / ingen rapportering | 149 303 | 44,7 % |
| 1–4 sysselsatte | 134 764 | 40,4 % |
| 5–9 sysselsatte | 23 706 | 7,1 % |
| Minst 10 sysselsatte | 26 073 | 7,8 % |
| **I alt** | **333 846** | 100 % |

Bygg og anlegg: 59 647 aktive foretak, hvorav 54 143 (90,8 %) under 10.

**[VERIFISERT]** Samme bilde i enheten *virksomheter*: SSB tabell **07091**,
1. januar 2026, 656 492 virksomheter, hvorav **90,2 % har under 10 ansatte** og
**94,9 % under 20**. (Foretak og virksomheter er ikke samme enhet — ikke bland
de to tallene i samme setning.)

**[VERIFISERT]** Enhetsregisteret, live uttrekk 7. oktober 2026:
**464 374 registrerte enkeltpersonforetak** mot 433 320 AS.
`data.brreg.no/enhetsregisteret/api/enheter?organisasjonsform=ENK&size=1`

**Hva det betyr for oss:** kjøperen er nesten alltid én person, ikke en
innkjøpsfunksjon. Han leser ikke siden for å evaluere en leverandør — han leser
den for å avgjøre om det er verdt tjue minutter på telefon.

## 1.2 Hullet i statistikken, som er vår største åpning

SSBs IKT-undersøkelse er EU-regulert etter forordning (EF) nr. 808/2004 og har
**populasjon: foretak med minst 10 sysselsatte**, utvalg ca. 5 000 foretak
**[VERIFISERT]**. Det er 7,8 % av foretakene (del 1.1).

**[VERIFISERT]** Jeg sjekket Eurostat `isoc_ciweb` eksplisitt for
størrelsesklassene `0-1`, `0-9`, `1-4`, `1-9`, `2-9` og `5-9` for Norge.
**Det finnes ingen norske observasjoner.**

**[IKKE FUNNET]** Noen offisiell norsk statistikk på nettsidedekning eller
nettsidetilstand for foretak under 10 ansatte. Søkt i SSBs tabellregister på
`nettside`, `heimeside`, `nettstad`, `Internett-tilgang`, `virksomheter` og
`foretak etter storleik`, og i Eurostat.

**Hva det betyr for oss:** vår skanning i `src/data/maalinger.json` — 45
tilfeldig trukne sider fra håndverker- og klinikkforetak med 1–20 ansatte, 38
svarte — er sannsynligvis **det eneste tallet som finnes for segmentet i Norge.**
Det bør være husets viktigste eiendel, ikke en fotnote.

## 1.3 Hva nettsidene faktisk inneholder — det tallet som selger oppgraderingen

**[VERIFISERT]** Eurostat `isoc_ciweb`, «Websites and functionalities by size
class», Norge, **10–49 ansatte, 2025**. Oppdatert 27.02.2026. Datakilde: SSB.
`https://ec.europa.eu/eurostat/databrowser/view/isoc_ciweb/default/table`

| Funksjon | Andel |
|---|---|
| Har nettside | 85,4 % |
| Beskrivelse av varer/tjenester, prislister | 75,3 % |
| Minst én av 8 målte funksjoner | 81,1 % |
| Minst to av 8 | 62,6 % |
| **Minst tre av 8** | **38,9 %** |
| Utlysning av stillinger | 41,1 % |
| Nettbestilling/reservasjon/booking | 38,1 % |
| Innhold på minst to språk | 22,8 % |
| Personalisert innhold | 11,8 % |
| Chat for kundestøtte | 9,9 % |

EU27 samme år og størrelse, «har nettside»: 76,7 %. Norge ligger ~9
prosentpoeng over.

**[VERIFISERT]** Eurostat `isoc_e_dii`, digital intensitet, 2024 (DII v4):
**19,1 %** av norske foretak med 10–49 ansatte har «very low digital intensity»,
mot **2,9 %** av dem med 50–249. Altså **6,6 ganger** så høy andel blant de små.

**Hva det betyr for oss, og dette er et bedre argument enn «har du nettside»:**
nesten alle *har* en nettside. Bare **38,9 %** har en som gjør mer enn tre ting.
Bare **38,1 %** kan ta en bestilling eller booking. Det er nøyaktig det vi
selger — booking, Vipps, kobling mot regnskap — og det er et hull på 62 %.

**Konkret endring:** bytt argumentet på bransjesidene fra «én av fire mangler
nettside» til «seks av ti nettsider kan ikke ta imot en bestilling». Det andre er
sant for flere, det er mer presist, og det peker direkte på det vi tar penger for.

## 1.4 De små kjøper allerede IKT utenfra

**[VERIFISERT]** SSB tabell **14936**, «IKT-kompetanse», 2025:

| | 10–19 sysselsatte | Alle |
|---|---|---|
| IKT-funksjoner utført av **eksterne aktører** | **58 %** | 65 % |
| Utført av internt ansatte | 44 % | 50 % |
| Rekrutterte / prøvde å rekruttere IKT-spesialister | 4 % | 8 % |

Foretak med 100+ sysselsatte har 78 % internt.

**Hva det betyr for oss:** 58 % kjøper dette utenfra allerede. Vi skal ikke
overbevise dem om å kjøpe — vi skal overbevise dem om å kjøpe av oss. Det er en
helt annen tekst enn den vi har, som bruker plass på å begrunne hvorfor en
nettside er viktig.

## 1.5 Hva norske kilder sier om barrierene — og de peker ikke på pris

**[VERIFISERT]** NIFU-rapport **2025:2**, «Kompetanse og arbeidskraft – Innsikter
frå NHOs Kompetansebarometer 2024», Furholt og Børing, N = 2 170:
- **29 %**: «Dei tilsette i verksemda manglar kompetansen til å ta i bruk
  tilgjengeleg digital teknologi»
- **Nær 1 av 5** opplever høye kostnader som utfordring
- Bare **8 %** sier de mangler forutsetningene for å finne, velge eller innføre
  digital teknologi
- Ordrett: «Verken geografi eller verksemdsstorleik … ser ut til å gjere utslag
  på denne fordelinga.»
- Forbehold: utvalget er NHOs medlemsbedrifter, ikke representativt for norske
  småbedrifter.

**[VERIFISERT]** «Bruk av kunstig intelligens i norsk næringsliv», Rapport
1-2026, Samfunnsøkonomisk Analyse for NHO m.fl., undersøkelse november 2025,
N = 4 294 vektet. Utvalget dekker mikrobedrifter (ingen ansatte n = 1 356,
1–9 ansatte n = 1 860). Barrierer blant dem som **ikke** bruker KI, høyest først:
1. **Manglende innsikt i hvordan KI kan løse virksomhetens utfordringer**
2. Usikkerhet om gevinster
3. **Manglende kompetanse til å forstå, teste eller bruke KI**
4. Usikkerhet om risiko
… «for dyrt eller tidkrevende» er **nest nederst**.
Hovedfunn ordrett: «Blant virksomheter som ikke har tatt i bruk KI, er usikkerhet
om hvordan teknologien kan skape verdi den viktigste barrieren.»

**Hva det betyr for oss:** på to uavhengige norske undersøkelser er barrieren
**forståelse**, ikke pris. Det er en direkte invitasjon til den
posisjoneringen vi alt har — «du ser en klikkbar prototype før du har betalt
noe» — men den må flyttes fram og formuleres som et svar på usikkerhet, ikke som
et steg i en prosessliste.

**[IKKE FUNNET]** En norsk undersøkelse som spør småbedrifter hva de vektlegger
når de kjøper *nettside*. Ikke fra Virke, NHO, SMB Norge, Digdir eller akademia.
Virkes medlemsundersøkelse har ingen prosenttall publisert. Det finnes ikke noe
«DNB SMB-barometer». SMB Norges «99 prosent av norske bedrifter er små» er en
organisasjonspåstand uten undersøkelse, n eller år.

---

# Del 2 – Lovkravene: hva som gjelder, og hvor hardt det slår

Dette er vår uttalte spesialitet, så den må være riktig på millimeteren.
**Hovedfunnet i denne delen er at vi fremhever det svakeste av våre to
juridiske argumenter.**

## 2.1 Cookie-samtykke – og her ligger de virkelige tennene

**[VERIFISERT]** Ny **ekomlov, LOV-2024-12-13-76, i kraft 1. januar 2025**.
Cookie-regelen ligger nå i **§ 3-15**; den gamle § 2-7b er opphevet.
`https://lovdata.no/lov/2024-12-13-76/§3-15`. Samtykket må oppfylle
GDPR-kravene: frivillig, spesifikt, informert, utvetydig, aktiv handling,
dokumenterbart, like lett å trekke tilbake.

**[VERIFISERT]** Datatilsynets veiledning, publisert **3. april 2025**:
forbudt er forhåndsavkryssede bokser, passivt samtykke, cookiewall, ekstra klikk
for å avslå, og å nedtone avslå-valget. Å avslå og å godta skal kreve like stor
innsats. **Ingen overgangsperiode.** Tilsyn: Datatilsynet og Nkom i fellesskap.
Datatilsynet holdt webinar om reglene i 2026 — temaet håndheves aktivt.

**[VERIFISERT] Sanksjonen, og dette er tallet vi ikke bruker:**
ekomloven **§ 15-11** tvangsmulkt og **§ 15-12 overtredelsesgebyr**. Gebyret kan
**ikke overstige 10 prosent av tilbyderens årlige omsetning i Norge**.
`https://lovdata.no/dokument/NL/lov/2024-12-13-76/kap15`

**Hva det betyr for oss:** vår FAQ og `/sikkerhet` siterer § 3-15 og 1. januar
2025 korrekt. Men vi sier ingen steder hva det *koster*. «Inntil 10 prosent av
omsetningen» er et tall en regnskapsfører forstår umiddelbart, og det er
gjeldende norsk rett.

## 2.2 Universell utforming – kravet holder, men teksten vår er upresis på ett punkt

**[VERIFISERT]** Forskrift om universell utforming av ikt-løsninger,
FOR-2013-06-21-732, **§ 4**, ordrett:

> «Private virksomheters nettløsninger skal minst utformes i samsvar med
> standard Web Content Accessibility Guidelines 2.0 (WCAG 2.0)/NS/ISO/IEC
> 40500:2012, på nivå A og AA med unntak for suksesskriteriene 1.2.3, 1.2.4 og
> 1.2.5, eller tilsvarende denne standard.»

Altså **35 suksesskriterier i WCAG 2.0** for private. Offentlige: 48 av 78 i
WCAG 2.1 via EN 301 549 v3.2.1. Uutilsynet ordrett: «Virksomheter i privat
sektor får ingen nye krav, slik at dagens 35 minstekrav gjelder fortsatt.»
**Tilgjengelighetserklæring er ikke pliktig for private.**

**[VERIFISERT] Fristene:** forskriften i kraft 1. juli 2013, nye løsninger fra
1. juli 2014, og **eksisterende løsninger fra 1. januar 2021** — etter den
datoen gjelder kravene uansett nettstedets alder.

**[VERIFISERT] EAA er ikke norsk rett.** Uutilsynet ordrett: «EAA er ikkje
gjennomført i norsk rett og det kjem ikkje til å tre i kraft 28. juni 2025», og
«EAA er ikke teke inn i EØS-avtalen enno». Og når/hvis den kommer: EAA har
**mikrovirksomhetsunntak** — for tjenester gjelder kravene ikke for
virksomheter med under 10 ansatte og omsetning/balanse under 2 mill. euro.
**Det treffer nesten hele kundegruppen vår.**

**Hva det betyr for oss:** vår formulering «Vi bygger etter WCAG 2.2 AA, som er
strengere» er korrekt og ærlig — vi påstår ikke at 2.2 er påkrevd. Behold den.
Men: **ikke bruk 28. juni 2025 som frist**, og ikke antyd at WCAG 2.1 er
lovpålagt for private. Det riktige og sterkere argumentet er at
**1. januar 2021-fristen er passert for alle nettsteder, nye og gamle.**

## 2.3 Hvor hardt det slår – tallene fra tilsynet selv, inkludert det ubehagelige

**[VERIFISERT]** Uutilsynet, «Data frå tilsyn og kontroll», periode 2015–2026.
`uutilsynet.no/innsikt-og-analyse/data-fra-tilsyn-og-kontroll/2052`

| | |
|---|---|
| Ikt-løsninger kontrollert | **92** |
| Med brudd på minstekravene | **90 (98 %)** |
| Utbedret frivillig eller etter pålegg | 68 (75 %) |
| Vedtak om tvangsmulkt | 22 (24 %) |
| **Tvangsmulkt faktisk iverksatt** | **2** |

Mest brutte krav (score 0–100, lav = mange brudd): 2.2.2 pause/stopp **18** ·
1.2.2 teksting **24** · 2.4.2 sidetitler **36** · 4.1.1 parsing **43** ·
3.3.1 identifikasjon av feil **45** · 1.4.3 kontrast **46**.

**[VERIFISERT]** Sektortilsyn helse 2025–2026, «Er digitale helsetenester
tilgjengelege for alle?»: **19 løsninger kontrollert, ingen oppfylte alle
kravene**, 1 080 brudd, alle 19 fikk pålegg, 8 fikk vedtak om tvangsmulkt, **1
fikk mulkt iverksatt**. Blant de kontrollerte private: Aleris, Volvat, Eyr,
Apotek 1, Dr.Dropin, Farmasiet.

Publiserte rapporter: **2026:04 Dr.Dropin AS** — brudd på **8 av 11** testede
krav (tilsyn 8. januar–16. februar 2026) · **2026:02 Farmasiet** — 8 av 10 ·
**2025:13 Apotek 1** — 8 av 9.

**[VERIFISERT]** Hjemmel for reaksjon: forskriften §§ 6 og 7, jf.
likestillings- og diskrimineringsloven § 36. **Det finnes ingen fast sats og
ingen maksbeløp** for brudd på de tekniske kravene. Eneste standardiserte sats
er 5 000 kr per virkedag for manglende tilgjengelighetserklæring — **og den
gjelder bare offentlig sektor.**
**[IKKE BRUK]** Påstanden om at tvangsmulkt «ligger mellom 2 000 og 5 000 kr per
dag» for tekniske brudd. Den finnes ikke i forskriften, loven eller hos
uutilsynet.

**[VERIFISERT]** Ansvaret ligger hos virksomheten, ikke leverandøren. Uutilsynet
ordrett: «Verksemda har ansvaret for å følgje reglane, sjølv om verksemda brukar
tenester frå ein tredjepart… Øvste leiar har ansvaret.»

**Hva det betyr for oss — og dette er den viktigste strategiske innsikten i
rapporten:** vi leder med universell utforming, der straffen i praksis er et
rettepålegg og **to iverksatte mulkter på elleve år**. Vi nevner ikke at
cookie-brudd kan koste **inntil 10 prosent av omsetningen** (del 2.1).
**Rekkefølgen på de to juridiske argumentene våre er omvendt.**

Og: at ansvaret ligger hos *virksomheten*, ikke leverandøren, er både et
salgsargument mot kunden og noe som må stå i vår egen kontrakt.

## 2.4 Og nesten ingen av kundene vet at kravene finnes

**[VERIFISERT]** «Digital inkludering i praksis», Rambøll for Uutilsynet,
publisert 20.11.2024, datainnsamling aug–sep 2024. Private virksomheter med
fire+ ansatte n = 2 534 (8 % svarprosent — lav, må oppgis).

- **Ca. 2 av 10** private kjenner kravene i stor/svært stor grad
- **28 %** av **små** virksomheter kjenner kravene godt, mot **53 %** av store
- Bare **1 av 3** private bruker testverktøy
- Bare **1 av 4** private har besøkt uutilsynet.no
- **3 av 10** private tester og vurderer universell utforming jevnlig

**Hva det betyr for oss:** 8 av 10 i målgruppen vet ikke at kravet finnes. Det er
ikke en innvending vi må overvinne — det er informasjon de ikke har. Det gjør
`/sjekk` til riktig produkt, men det betyr også at teksten må **forklare** før den
**advarer**. Å lede med «ekomloven § 3-15» til noen som ikke vet at det finnes en
regel, er å svare på et spørsmål de ikke har stilt.

## 2.5 Org.nr. og kontaktplikt – hjemmelen vår er riktig, og det er én presisering

**[VERIFISERT]** **Foretaksregisterloven § 10-2** første ledd, ordrett:

> «Et foretaks hjemmesider på Internett, brev og forretningsdokumenter, uavhengig
> av hvilket medium de forefinnes på, skal inneholde foretakets
> organisasjonsnummer og foretaksnavn.»

Nettsider er altså nevnt eksplisitt i lovteksten. Vår artikkel
`/artikler/orgnr-pa-nettsiden` siterer riktig lov.

**[VERIFISERT]** **Ehandelsloven § 8** krever i tillegg navn, adresse,
e-postadresse «og øvrige opplysninger som gjør det mulig å komme i direkte
forbindelse», foretaksregister, org.nr. og mva-status, «enkelt og direkte
tilgjengelig».

**[VERIFISERT]** Forbrukertilsynet presiserer: «det skal være en lenke til
informasjonen på hver side av selgerens nettside — det er ikke tilstrekkelig at
informasjonen bare er tilgjengelig fra hjemmesiden.» Vår `LegalFooter` står på
hver side, så dette er dekket.

**[VERIFISERT]** Vårt eget foretak i Enhetsregisteret: KODEKONSULENTENE
ELKASSMI, ENK, sektorkode 8200 «Personlig næringsdrivende»,
`harRegistrertAntallAnsatte: false`, org.nr. 936374336. Alt stemmer, og `/sjekk`
kan kjøres på oss.

## 2.6 Markedsføringsloven § 15 – hva den utelukker

**[VERIFISERT]** Forbrukertilsynets veiledning om markedsføring via e-post og
SMS: forbudet gjelder **alle fysiske personer**, inkludert en fysisk persons
individuelle jobbadresse, og **også når adressen er registrert som
kontaktadresse til et foretak i Brønnøysundregisteret.**

**Hva det betyr for oss:** kald e-post er i praksis stengt mot primærsegmentet.
464 374 ENK er fysiske personer, og brreg-adressen deres hjelper oss ikke.

De lovlige utadrettede kanalene, og de eneste rapporten anbefaler:
1. **Telefon til foretakets publiserte bedriftsnummer** — § 15 gjelder
   elektronisk markedsføring, ikke oppringning til et foretak.
2. **Fysisk post til foretaksadressen.**
3. **Alt inngående:** søk, Google Bedriftsprofil, omtaler, henvisninger, innhold.

Gratis-skanningen er riktig produkt så lenge brukeren selv ber om den, slik den
er bygget nå. Ikke bygg en versjon som sender rapporter til skrapede adresser.

**[VERIFISERT]** En juridisk presisering så vi ikke overselger i motsatt
retning: **12-månedersgrensen for bindingstid er ekom-/forbrukerlovgivning og
gjelder ikke B2B-nettsideavtaler.** For bedriftsabonnement finnes ingen lovfestet
øvre grense. «Binding er ulovlig» er feil i vårt marked.

---

# Del 3 – Hva de norske konkurrentene gjør

27 aktører hentet direkte fra deres egne sider 7. oktober 2026. Alle priser som
oppgitt av dem.

## 3.1 Prisspennet – og to sanne tall som peker i motsatt retning

**[VERIFISERT]** Hver pris lest på leverandørens egen side.

**De tetteste prispunktene ligger under vår inngang:**

| Leverandør | Laveste pakke |
|---|---|
| Skaatun Web | 4 900 kr |
| Websett | fra 6 000 kr |
| Oppskalert (Oslo) | fra 6 990 kr |
| Moss Webdesign | 7 990 kr |
| Snekkenæs Design (Oslo) | fra 9 900 kr |
| HjemmesideHelten | 9 990 kr |
| Godt Likt Media | 9 990 kr |
| **KodeKonsulentene Start** | **14 900 kr** |

**Vårt segment 15 000–60 000 kr er godt bemannet:** Nordvik Media (Oslo)
15 000 / 25 000 / 45 000 · Websett 15 000 / 20 000 · FrontCode fra 15 000 ·
DevAI (Oslo) fra 18 000 · Godt Likt 18 990 / 24 990 / 49 990 · Snekkenæs 19 900 ·
Skaatun 19 900 · HjemmesideHelten 24 990 / 34 990 · Kodemagisk 25 000–50 000 ·
Håndverkerpakken 29 900 · Acendia 29 990 · Visionmedia fra 29 900 / 49 900 ·
Mementor fra 79 990.

**Abonnement:** WebPack 349 kr/mnd + 3 490 kr · Nettify 399 kr/mnd · Uniweb
472 kr/mnd + 5 592 kr, 12 mnd binding · FrontCode 499 kr/mnd + 3 990 kr ·
Acendia 690–990 kr/mnd · Smartbyrå 799 kr/mnd + mva, ingen binding · Raskweb
1 190 kr/mnd · **Oppskalert 1 290 kr/mnd, 12 mnd binding, deretter 690 kr/mnd** ·
Webagent 1 740 kr/mnd · Mementor 4 990 kr/mnd · Håndverkerpakken 5 900 kr/mnd.

**Og her er det andre tallet, som peker motsatt vei.** De publiserte norske
*prisguidene* ankrer «enkel bedriftsnettside» mye høyere **[VERIFISERT]**:

| Guide | Enkel bedriftsside |
|---|---|
| Digitalspor (14.02.2026) | 15 000–40 000 kr |
| Byråmatch (20.04.2026) | 15 000–40 000 kr |
| Webagent (25.08.2026) | 15 000–40 000 kr |
| Box | 15 000–40 000 kr |
| TEK365 | 10 000–25 000 kr |
| Nettsmed (22.09.2026) | 10 000–40 000 kr (malbasert) |
| Elevera | 5 000–15 000 (mal) / 15 000–40 000 (tilpasset) |
| Innovena | 30 000–80 000 kr |

**[VERIFISERT]** Innovena sier selv at tallene er «veiledende anslag» og «ikke
en dokumentert markedsundersøkelse».
**[IKKE FUNNET]** Noen uavhengig norsk statistikk på hva bedrifter faktisk
betaler. Ikke SSB, ikke Virke, ikke Abelia, ikke Mittanbud eller Tjenestetorget.
Det finnes ingen Byggstart-ekvivalent for web. **Alt er byråmarkedsføring.**

**Hva det betyr for oss — og begge tallene er sanne samtidig:**
- Mot **faktisk publiserte pakkepriser** er vår Start 50 % over det tetteste
  punktet (9 900–9 990).
- Mot **de publiserte prisguidene** ligger 14 900 kr i nedre del av det
  normale (15 000–40 000).
- Vår Bedrift på 29 900 kr er midt i markedet, ikke dyr.
- Vårt abonnement på 1 290–1 990 kr/mnd med 12 mnd binding er i den dyre enden,
  og **vi har ingen nedtrapping** der Oppskalert faller til 690 kr/mnd. Over tre
  år: 46 440 kr hos oss mot 29 220 kr hos dem.

**Det viktigste:** vår sammenligningstabell på `/priser` stiller oss opp mot Wix
(150–180 kr/mnd), AI-byggere, abonnementsbyråer (499–1 740 kr/mnd) og «etablert
byrå fra 80 000 kr». **Den hopper over den ene sammenligningen kjøperen faktisk
gjør:** fastpris 9 990 kr fra et norsk byrå med Trustpilot-merke. Tabellen er
sann, men den sammenligner oss bare med dem vi vinner mot.

**[VERIFISERT]** Det beste innvendingsverktøyet i markedet, brukt av tre norske
aktører: **3-årsformelen.** Byggepris + innhold og migrering + 36 × månedskostnad
+ avtalte ekstra = sammenlignbar totalkostnad. Innovenas eksempel: 60 000 +
10 000 + 1 000 kr/mnd = **106 000 kr over tre år.** Den reframer et billig
abonnement som dyrt — og den er **gratis for oss å ta i bruk**, siden vi er
engangskjøp med lav drift.

## 3.2 Hva nesten alle lover – altså hva som ikke er differensiator

1. **Fastpris, ingen skjulte kostnader.** Nesten ordrett hos Raskweb, Nordvik
   Media, Visionmedia, Kodemagisk, Godt Likt, Moss, HjemmesideHelten, Skaatun.
   Vår «Fast pris» i heroen er inngangsbilletten, ikke et argument.
2. **Fart.** «Klar på 24 timer» (Acendia), «5–7 dager» (Moss), «1–14 dager»
   (Skaatun), «5 til 10 virkedager» (Håndverkerpakken), «Én dag» til ferdig
   forslag (Smartbyrå), «Utkastet klart på 48 timer» (Oppskalert).
   **Vi er saktere:** prototype 72 timer, bygging 2–3 uker.
3. **Gratis utkast før betaling**, ofte som primær CTA: Smartbyrå, Webagent,
   Oppskalert, Nettify, Nordvik, Websett. Vår gratis prototype er likeverdig,
   men ligger som steg 2 i en prosessliste, ikke som tilbud.
4. **«Du eier koden.»** Dette er det vi tror er vår differensiator. Det er det
   ikke. Eksplisitt lovet av HjemmesideHelten («Du eier domenet, koden, designet
   og alt innhold 100 %»), Godt Likt, Oppskalert («Du eier alt»), Nordvik,
   Visionmedia, Kodemagisk («du kan bytte byrå når som helst»), DevAI, Mementor.
   **Vår FAQ bruker førsteplassen på et spørsmål åtte konkurrenter besvarer likt.**
5. **SSL som hele sikkerhetshistorien.**
6. **Svak bevisføring.** Av 23 kartlagte hadde **6 ingen bevis i det hele tatt**.
   Etterprøvbar Google-score med antall fant jeg hos tre: Mementor (5,0 av 9),
   Uniweb (4,7), Nettify (5,0 av 25). Flere viser «5,0» eller «100 % fornøyde
   kunder» uten antall eller kilde.

## 3.3 Hullene – hva vi kan eie

1. **Universell utforming / WCAG: 18 av 23 nevner det ikke med ett ord.** De fem
   som gjør det: Mementor (grundig), Raskweb, Nordvik Media («WCAG-bevisst»),
   Nettify, TEK365 (én setning). **Største hull, og det er vårt.**
2. **Hva du får med deg hvis du slutter å betale.** Kun 6 av 23 nevner det. Og
   **ingen av de rene abonnementsaktørene** — Smartbyrå, Acendia, Raskweb,
   Nettify, Webagent, WebPack, Uniweb, Håndverkerpakken — sier hva du eier etter
   tre år på 799–1 740 kr/mnd. Den eneste som er ærlig er **FrontCode**, som
   skriver at «FrontCode eier koden og infrastrukturen».
3. **Personvern/GDPR som faktisk leveranse:** kun HjemmesideHelten, Raskweb,
   Håndverkerpakken.
4. **Sikkerhet utover SSL:** kun HjemmesideHelten, Mementor, delvis
   Acendia/Skaatun.
5. **Målbar hastighet med tall:** kun 5 av 23.
6. **Hvem som gjør jobben hvis enmannsaktøren slutter.** Flere av de 23 er
   åpenbart enmannsforetak (Gmail-adresse som eneste kontakt hos én, fornavn@ hos
   en annen, «Support fra grunnlegger» hos en tredje). **Ingen sier hva som
   skjer hvis de legger ned.** Vår FAQ svarer uvanlig godt — full dokumentasjon
   innen fem arbeidsdager og to navngitte andre utviklere — og det ligger som
   spørsmål tre, 67 % ned på forsiden.

## 3.4 Nærmeste konkurrenter, og hvor langt foran de er i søk

**Nordvik Media** er nærmest på posisjon: 15 000 / 25 000 / 45 000,
«Skreddersydd webdesign – fastpris og full eierskap», **leveringstid per pakke**
(2–3 / 4–6 / 6–10 uker), «WCAG-bevisst», moderne stack. De har **ingen bevis i
det hele tatt** og Gmail-adresse som eneste e-post.

**Smartbyrå (MedMalin AS)** er farligst i søk. 799 kr/mnd + mva, ingen binding,
ferdig forslag på én dag, 100+ kunder, telefon synlig.

**[VERIFISERT – EGEN MÅLING]** Sitemap-sammenligning:

| | Indekserbare URL-er | Bransjesider | «Spørsmål»-sider |
|---|---|---|---|
| smartbyra.no | **136** | **11** | **8** |
| kodekonsulentene.no | **27** | 2 | 0 (3 juridiske artikler) |

Deres bransjesider: elektrikere, frisører, **regnskapsførere**, tannleger og
klinikker, håndverkere, bilverksteder, fotografer, kafeer og restauranter,
treningssentre. Deres spørsmålssider: `hva-koster-nettside`,
`hva-koster-endring`, `billig-nettside-bedrift`, `bytte-leverandor`,
`lage-selv-eller-fa-bygget`, `redigere-uten-koding`, `fa-nettsiden-pa-google`,
`best-i-test`, pluss `10-sporsmal-for-du-bestiller-nettside`,
`hvor-lang-tid-tar-det-a-fa-nettside` og
`flytte-nettside-fra-wix-eller-wordpress`.

**Observasjon verdt å merke seg:** i flere søk på «hva koster en nettside» og
«nettside pris» var 7–9 av 10 treff fra **samme domene**. «Markedsprisene» norske
kunder møter på nett er i praksis **ett byrås markedsføring**, uten oppgitt
metode. Det er et reelt hull for innhold med etterprøvbare tall.

**Hva det betyr for oss:** vi har bygget 14 interne lab-sider og 3 juridiske
artikler. Konkurrenten har bygget 11 bransjesider og 8 innvendingssider. Våre
artikler svarer på spørsmål kjøperen ikke har stilt ennå; deres svarer på dem han
stiller i kjøpsøyeblikket.

---

# Del 4 – Vår tekniske fordel, målt mot markedet

## 4.1 Metode

7. oktober 2026, 27 norske byråer fra del 3. For hver: én `GET` på forsiden over
HTTPS med `curl -L`; telling av seks svarheadere (`content-security-policy`,
`strict-transport-security`, `x-content-type-options`, `referrer-policy`,
`permissions-policy`, `x-frame-options`); telling av `Set-Cookie`; regex-søk i rå
HTML etter sporingsskript og samtykkeløsninger.

**Forbehold som MÅ følge tallene:** JavaScript kjøres ikke, så cookies satt av
skript etterpå er ikke med — tallet er et minimum. En samtykkeløsning kan lastes
dynamisk og ikke vises i første HTML. Treff på Google Consent Mode beviser ikke
at standardverdien er «denied». Alt målt på forsiden alene.

## 4.2 Sikkerhetsheadere

**[VERIFISERT – EGEN MÅLING]** n = 27.

| Antall av 6 | Byråer |
|---|---|
| 0 | 4 |
| 1 | 8 |
| 2 | 2 |
| 3 | 5 |
| 4 | 1 |
| 5 | 5 |
| **6** | **2** |

Snitt **2,5 av 6**. 12 av 27 har null eller én. **2 av 27 har alle seks.**
KodeKonsulentene har 6 av 6.

## 4.3 Sporing og samtykke

**[VERIFISERT – EGEN MÅLING]** n = 27.

- **19 av 27** laster Google-sporing (GTM, GA, gtag eller doubleclick) i
  forsidekoden
- **5 av 27** laster Meta-piksel
- Av de 19: 10 har en gjenkjennelig samtykkeløsning i koden, 8 har Google Consent
  Mode, og **8 har ingen av dem**
- **8 av 27 laster ingen Google-sporing i det hele tatt.** KodeKonsulentene er
  den niende
- **11 av 27** sender minst én cookie i svarheaderen ved første forespørsel, uten
  at JavaScript har kjørt

**Mest forsiktige lesning:** 8 av 27 byråer laster Google-sporing uten spor av
samtykkehåndtering. Det er *sannsynligvis* sporing før samtykke, altså i strid
med ekomloven § 3-15 — men «sannsynligvis», ikke bevist.

## 4.4 Org.nr. og telefonnummer

**[VERIFISERT – EGEN MÅLING]** 17 av 27 har ingen omtale av organisasjonsnummer
i forsidens HTML. Forbehold: det kan stå på en underside eller settes inn av
JavaScript, og § 10-2 krever ikke forsiden spesifikt.

**[VERIFISERT – EGEN MÅLING]** Klikkbar `href="tel:"` på forsiden:
**15 av 27 byråer har det. KodeKonsulentene har det ikke.** `firma.telefon` er
tom streng i `src/data/firma.ts`, og både `ContactBlock` og `/kontakt` hopper
pent over feltet — men resultatet er at en rørlegger som vil ringe, ikke kan.

## 4.5 Vårt eget husnivå, målt live

**[VERIFISERT – EGEN MÅLING]** 20 forespørsler til `/priser`: median **75 ms**,
min 72 ms, maks 83 ms, alle 200. HTML komprimert: forsiden 27,8 kB, `/priser`
19,4 kB. Ytelsespåstandene holder. Ett avvik observert: én enkelt forespørsel
tidligere på dagen hadde **7,8 s TTFB**, antakelig en maskin som våknet. 20
påfølgende målinger var rene. Verdt å overvåke, ikke verdt å fikse på mistanke.

## 4.6 Unntaket fra anonymiseringen – og det skarpeste salgsargumentet i rapporten

Én aktør kommer like godt ut som oss og bør navngis, fordi det går **mot** vår
interesse å skjule det: **kodemagisk.no** har 6 av 6 sikkerhetsheadere, null
`Set-Cookie` ved første besøk, org.nr. på forsiden, Astro + Sanity i stacken, og
sier «Du eier koden» og «du kan bytte byrå når som helst». De er ikke en
teoretisk konkurrent — de er oss med flere år på kontoen.

**Men:** deres Content-Security-Policy tillater `script-src 'unsafe-inline'` og
navngir `googletagmanager.com`, `google-analytics.com` og
`stats.g.doubleclick.net`. Vår CSP bruker SHA-256-hasher i stedet for
`unsafe-inline`, har `connect-src 'self'`, og navngir ingen analysetjeneste —
bare `cal.com` for booking. Begge headere er hentet og sammenlignet
**[VERIFISERT – EGEN MÅLING]**.

**Hva det betyr for oss:** CSP er en offentlig svarheader. Den lister hver eneste
eksterne tjeneste en side *har lov* til å snakke med. Det er den mest
etterprøvbare tillitserklæringen som finnes på nettet, og den kan ikke jukses.

**Konkret endring:** oversett CSP til kjøperens språk. Ikke «6/6 headere», men:
*«Denne siden har lov til å snakke med nøyaktig én annen tjeneste: kalenderen du
booker i. Det står i en header hvem som helst kan lese. Sjekk din egen — de
fleste lister Google, Facebook og tre annonsenett.»* Samme faktum, oversatt fra
teknikk til tillit.

---

# Del 5 – Vårt eget nettsted sett med kjøperens øyne

## 5.1 Testen: markedets egen fasit på hva kjøperen spør om

**[VERIFISERT]** Smartbyrå publiserer «10 spørsmål før du bestiller nettside».
Det er den beste tilgjengelige norske fasiten på hva kjøperen tenker på, selv om
den er skrevet av en konkurrent. Jeg har scoret oss mot den:

| # | Spørsmålet | Svarer vi? | Hvor |
|---|---|---|---|
| 1 | Hva er totalprisen over tre år? | **NEI** | Ingen steder |
| 2 | Hva er inkludert, og hva koster ekstra? | JA | `/priser`, med «ikke»-liste |
| 3 | Hva koster endringer etter lansering? | JA | FAQ + `loepende` |
| 4 | Hvem eier domenet, og står det i mitt navn? | JA | FAQ, «fra dag én» |
| 5 | Hva får jeg med meg hvis jeg avslutter? | JA | FAQ, «kjørbar eksport» |
| 6 | Bindingstid, og hva koster det å si opp? | DELVIS | 12 mnd oppgitt; oppsigelseskostnad ikke |
| 7 | Hvem lager innholdet – tekst og bilder? | DELVIS | Står i `/handbok`, en footerlenke |
| 8 | Hvor lang tid, og hva trenger dere fra meg når? | DELVIS | «2–3 uker» ja; hva kunden må levere, nei |
| 9 | **Kan jeg se tre nettsider for bedrifter som ligner min?** | **NEI** | Null leverte kundesider |
| 10 | Hva skjer hvis dere forsvinner? | JA, uvanlig godt | FAQ |

**Fem rene ja, tre delvise, to nei.** Bedre enn det meste av markedet. Men
spørsmål 9 er en absolutt sperre, og spørsmål 1 er gratis å fikse.

**[VERIFISERT]** To uavhengige norske kilder peker på samme forsinkelsesårsak i
nettsideprosjekter: **innhold, ikke utvikling.** Hjemmesidehuset ordrett:
«Tidsrammen … er vanligvis 2 til 6 uker fra oppstart til lansering, avhengig av
hvilken pakke som er kjøpt **og levering av innhold/tilbakemelding fra kunden**.»
Vårt `/handbok` er faktisk presis her — «bildebehandling av bilder du sender» er
inkludert, «nye bilder (fotograf), tekstforfatter» er ikke — men det står på en
footerside, ikke der kunden bestemmer seg.

## 5.2 Det første en besøkende faktisk ser

**[VERIFISERT – EGEN MÅLING]** Jeg hentet den live forsiden, strippet skript og
stil, og målte posisjon i den synlige teksten. Total: 11 027 tegn.

| Element | Posisjon | Andel ned |
|---|---|---|
| «6/6 Sikkerhetsheadere / 0 Cookies før samtykke / 0,1 s Svartid» | 0 | **først av alt** |
| «Book 20 min» | 265 | 2 % |
| **14 900 kr** | 4 642 | **42 %** |
| 29 900 kr | 5 090 | 46 % |
| 1 290 kr/mnd | 6 019 | 55 % |
| 950 kr/t | 6 482 | 59 % |
| «Eier jeg koden?» | 7 419 | 67 % |
| «Hva er bindingstiden?» | 7 648 | 69 % |

I tillegg legger `src/components/Apning.astro` et **fullskjermsoverlegg i 1,5
sekunder** ved første besøk i en økt, som viser nøyaktig de tre tallene over.
Teknisk er det pent løst — ren CSS-bortgang, respekterer
`prefers-reduced-motion`, verdiene står ferdig i HTML, én gang per økt — men
effekten er at **det første en rørlegger fra Google ser er ordet
«sikkerhetsheadere» i 1,5 sekunder**, før han ser hva vi selger. Overlegget
dekker innholdet, så det spiser av vårt eget LCP-budsjett på 2,5 s.

**Hva det betyr for oss:** dette er hele eierens spørsmål, besvart av vår egen
kode. Vi har plassert vårt mest interne argument først og kjøperens viktigste
tall 42 % ned — og del 7.1 viser at pris på nettsiden er den **høyest rangerte
forbedringen** småbedrifter ber om.

**Konkret endring:** behold åpningen og mekanikken. Bytt **ordene**, fra tre
målinger av oss til én setning om ham. Tallene finnes verifisert i
`maalinger.json`: 79 % av de 38 skannede sidene satte cookies før samtykke.

## 5.3 Mobil: ingen vedvarende handling

**[VERIFISERT]** `src/components/Topbar.astro`, linje 59:

```css
@media (max-width: 560px) { .topbar__cta { display: none; } }
```

Topbaren er `position: sticky`. Men under 560 px forsvinner «Book 20 min» fra
den, og det finnes ingen annen fast eller klebende CTA på nettstedet. På telefon
har en besøkende som har scrollet forbi heroen **ingen synlig måte å ta kontakt**
før han når bunnen — og han har heller ikke et telefonnummer (del 4.4).

**[VERIFISERT]** Og mobil er ikke der tillitsarbeidet skjer: Klarna/Cint 2020,
norske transaksjonsdata jan–sep 2020 + undersøkelse med >1 000 nordmenn, viste
mobil 52 % / PC 45 %, og den fremste grunnen til å velge PC var **«Jeg får bedre
oversikt og kan lese vilkårene nøye» — 73 %**. Mobilsiden må altså bære
*handlingen*; PC-en bærer *lesningen*. I dag bærer mobilsiden ingen av dem etter
første skjerm.

## 5.4 «Vi» og «utviklermiljø» mot det kjøperen finner i Brønnøysund

Siden sier «Vi er KodeKonsulentene, et utviklermiljø i Oslo» og «Vi kommer fra
dataingeniørfaget». Enhetsregisteret sier ENK, «Personlig næringsdrivende»,
ingen registrerte ansatte **[VERIFISERT]**.

Footeren oppgir org.nr. korrekt, og `/om` og FAQ er ærlige om at du snakker med
utvikleren selv. Informasjonen finnes. Men ordene «vi» og «utviklermiljø» setter
opp en forventning som oppslaget i Brønnøysund river ned — og **[VERIFISERT]**
over halvparten av nordmenn mener en seriøsitetssjekk av en leverandør skal ta
**under 10 minutter** (Opinion for Samarbeid mot svart økonomi, 2019; 8 av 10
sier det er viktig at leverandøren driver lovlig, nærmere 7 av 10 vil bruke
ekstra tid på å sjekke). Et brreg-oppslag tar tjue sekunder.

**Hva det betyr for oss:** dette er dramaturgi, ikke juss. Enmannsforetak er
ikke en svakhet i dette markedet — del 3.3 viser at flere konkurrenter er det og
skjuler det dårligere. Svakheten er sprekken mellom «vi» og oppslaget.

**Konkret endring:** si det selv, først, på `/om`: «KodeKonsulentene er ett
enkeltpersonforetak, registrert 14. oktober 2025. Det betyr at du snakker med den
som koder, og at vi ikke kan ta tjue prosjekter i måneden. Hva som skjer hvis jeg
ikke kan fullføre, står i håndboken.» Alle tre leddene er alt sanne og alt på
siden — de står bare ikke sammen, og ikke først.

## 5.5 «Eks. mva» når vi ikke er mva-registrert

**[VERIFISERT]** `src/data/firma.ts` har `mva: false`. Feltet brukes bare til å
utelate `vatID` fra strukturerte data. Samtidig står «eks. mva» **11 ganger** på
den live `/priser`, i alle pakkekort, i `prisvilkaar` og i salgsvilkårene.

Et foretak som ikke er mva-registrert kan ikke fakturere mva. Reell pris for
Bedrift er **29 900 kr**, ikke 37 375 kr. En kjøper som leser «eks. mva» regner
37 375.

Og det treffer hardest der det koster mest: **[VERIFISERT]**
merverdiavgiftsloven § 3-2 unntar helsetjenester fra avgift, og unntaket gir
**ingen fradragsrett for inngående avgift** (Skatteetatens
Merverdiavgiftshåndbok M-3-2). En klinikk kan ikke trekke fra mva. For nøyaktig
den målgruppen `/bransjer/klinikker` henvender seg til, leses «eks. mva» som
25 % reell merkostnad — på en pris der det ikke engang påløper.

**Konkret endring:** mens `mva: false`, skriv prisene som de er, med én
forklaring: «Prisene er endelige. Foretaket er ikke mva-registrert, så det kommer
ingen mva på toppen.» Det er sant, etterprøvbart i Enhetsregisteret, og gjør oss
25 % billigere i kjøperens hode uten å senke prisen med én krone. Legg inn en
vakt som bytter teksten når `firma.mva` blir `true`.

## 5.6 Navigasjon, caser og sosialt bevis

- **«Priser» er lenke nummer 6 av 7** i hovedmenyen. I et marked der hele
  kjøpsreisen starter med ordet «pris», er det for langt bak.
- **`synligeCaser` inneholder én post**, merket «Ikke et levert oppdrag» / type
  `Demo`. Filtreringen er riktig og ærlig — men vi svarer «nei» på kjøperens
  spørsmål nummer 9.
- **Pilottilbudet finnes allerede**, nederst på `/caser`: «Vi tar inn to til tre
  pilotprosjekter til redusert pris mot at vi får bruke tallene som case.» Det er
  svaret på hele caseproblemet, og det ligger på en side som bare nås fra
  footeren.
- **Null anmeldelser, null kundeutsagn, null logoer, null stjerner** noe sted.
  **[VERIFISERT – EGEN MÅLING]** `ProfessionalService`-schemaet på forsiden har
  verken `aggregateRating`, `review`, `telephone` eller `streetAddress` — så vi
  kan heller ikke få stjerner i søk. Til sammenligning: Uniweb 4,7 på Google,
  Nettify 5,0 av 25 anmeldelser, HjemmesideHelten 4,5 på Trustpilot, Oppskalert
  fire navngitte kundeutsagn.

## 5.7 Ting som er riktig, og som ikke skal røres

- **FAQ-svaret på «hva skjer hvis dere ikke kan fullføre»** er bedre enn noe jeg
  fant hos de 27. Ingen andre svarer på det.
- **`/handbok`, `/vilkar` og `/personvern` i klartekst.** Flere konkurrenter har
  ikke salgsvilkår i det hele tatt.
- **Kontaktskjemaet har fire felt** og hjelpetekst som ber om problemet, ikke
  løsningen. Det er riktig skrevet, og NN/gs anbefaling er 3–5 felt (del 7.4).
- **At `caser.ts` filtrerer bort alt med `TODO`** i stedet for å vise
  plassholdere er den riktige avgjørelsen, selv om konsekvensen er dyr.
- **SSB-tallene på bransjesiden er riktige.** Se advarselen øverst.

---

# Del 6 – To feil i vårt eget materiale som må rettes

Felles årsak: vi publiserer raskere enn vi etterprøver. Det er den ene vanen som
kan ødelegge posisjonen, fordi hele posisjonen er «vi måler, vi påstår ikke».

## 6.1 Kildene i priskalkulatoren

`src/data/markedspriser.ts` mater `/verktoy/priskalkulator` og
sammenligningstabellen på `/priser`. Jeg sjekket hver kilde
**[VERIFISERT – EGEN MÅLING, 07.10.2026]**:

| Tall i filen | Kilde oppgitt | Status |
|---|---|---|
| Abonnement 499–1 740 kr/mnd | `klarosites.no` + acendia + webagent | **`klarosites.no` finnes ikke** — NXDOMAIN. 499 kan ikke etterprøves. Acendia er 690–990. Webagent 1 740 står på en blogg, ikke forsiden. |
| HjemmesideHelten 35 000 median / 42 800 snitt, «50 prosjekter i 2025» | `hjemmesidehelten.no/` | **Finnes ikke på siden i dag.** Siden viser «fra 9 990 kr», «100+ leverte siden 2015», 4,5 på Trustpilot. `sistSjekket` er 2026-10-05 — to dager gammel. |
| Etablerte byråer 80 000–200 000, webapp fra 250 000, timepris 900–1 800 / 600–1 200 | `innovena.no/` | **Tallene er riktige, URL-en er feil.** Ingen priser på forsiden; de står på `innovena.no/artikler/nettside/hvor-mye-koster-en-nettside/`. |
| Webmestern 19 900–39 900 | `webmestern.no/` | **Riktig.** Startpakken 19 900, Standardpakken 39 900. (De har også Mesterpakken 69 900 og drift 390 kr/mnd, som vi utelater.) |

**Konkret endring:** fjern `klarosites.no`-raden eller erstatt 499 med et tall
som finnes (WebPack 349 kr/mnd + 3 490 kr, eller Nettify 399 kr/mnd — begge
verifisert i dag). Fjern HjemmesideHelten-medianen til den kan bekreftes, eller
bytt til deres publiserte 9 990 / 24 990 / 34 990. Rett Innovena-URL-en til
artikkelen. Og **sett en test som feiler bygget hvis en `kilde`-URL ikke svarer
200** — vi har testoppsett alt, og dette er presis den feilen som gjentar seg.

## 6.2 Vårt eget gratisverktøy gir falske lovbrudd

Dette er det alvorligste, fordi `/sjekk` er førstehandlingen på forsiden.

`src/lib/sjekk.ts`, `analyserCookies()`: funksjonen leter etter ti
sporingsskript (`SPORERE`-listen) i HTML-en og setter status `fail` med
detaljteksten «*Google Analytics* lastes uten at samtykke er innhentet» dersom
ett treffer.

**[VERIFISERT]** Funksjonen inneholder **ingen** gjenkjenning av samtykke. Søk
på `consent`, `cookiebot`, `cmp` i filen: null treff.

**[VERIFISERT – EGEN MÅLING]** Av de 19 byråene som laster Google-sporing, har
**11** enten en gjenkjennelig samtykkeløsning eller Google Consent Mode i siden.
Konkret: `smartbyra.no` kjører `gtag('consent', 'default', {...})` rett i
forsidekoden. **Vårt verktøy ville dømt dem for sporing uten samtykke.**

**Hva det betyr for oss:** vi tilbyr gratis en rapport som kan si «lovbrudd» om
en side som håndterer samtykke riktig. Den dagen en prospekts webutvikler ser
det, er «vi måler, vi påstår ikke» borte — og det er det eneste vi har som ikke
kan kopieres. Samme feilklasse som jeg selv nesten begikk øverst i denne
rapporten, bare med vårt navn under.

**Konkret endring:**
1. Kjenn igjen Google Consent Mode (`gtag('consent'`, `'denied'`) og de vanlige
   CMP-ene: Cookiebot, CookieYes, Complianz, OneTrust, Usercentrics, Cookie
   Information, Klaro, Iubenda.
2. Graderingen skal være tre, ikke to: **sporing uten spor av samtykke** (fail) ·
   **sporing med samtykkeløsning til stede — kan ikke avgjøres maskinelt om den
   blokkerer før samtykke** (warn, med forklaringen) · **ingen sporing** (ok).
3. Skriv forbeholdet i rapporten, slik `maalinger.json` alt gjør: JavaScript er
   ikke kjørt, så tallet er et minimum.

Et verktøy som sier «dette kan jeg ikke avgjøre maskinelt» er mer overbevisende
enn et som alltid har en dom — og det er et bedre salgsargument, fordi det peker
rett på en samtale.

---

# Del 7 – Hva som faktisk konverterer, med segmentmatchede tall

**Strukturelt forbehold for hele delen:** nesten all god B2B-kjøpsforskning måler
*store* innkjøp. 6sense-utvalget har medianverdi 200 000–300 000 USD. Gartner
Digital Markets og TrustRadius måler programvarekjøp. **Ingen av dem måler
15–60 000 kr.** De to kildene som faktisk treffer mikrobedrifter — SMB Group og
NN/g — sier delvis noe annet enn de store rapportene. Det er det viktigste
funnet i denne delen.

## 7.1 Pris på nettsiden: det best dokumenterte funnet, og det treffer vårt segment

**[VERIFISERT]** **SMB Group, 2024 SMB Technology Buying Journey.** Metode:
n = 738, webundersøkelse juni 2024, tilfeldig utvalg amerikanske SMB-er,
1–2 500 ansatte, 57 spørsmål.
`https://smb-gr.com/wp-content/uploads/2024/08/2024-SMB-Buying-Journey-Final.pdf`

«Top ways vendors can improve the purchasing experience», samlet:

| | |
|---|---|
| Forklar bedre hvordan løsningen treffer målene | 56 % |
| **Vis mer transparent prisinformasjon på nettsiden** | **46 %** |
| Bruk mer tid på å forstå kravene | 44 % |
| Konsistent opplevelse på tvers av kanaler | 39 % |
| **Bedre tilgang til telefonstøtte fra siden** | **31 %** |

**Brutt ned på størrelse — og dette er vårt segment:**

| Bedriftsstørrelse | Pristransparens på nettsiden |
|---|---|
| **1 ansatt** | **#1, 58 %** |
| **2 ansatte** | **#1, 56 %** |
| **5–9 ansatte** | **#1, 63 %** |

For 1-ansattbedrifter er «bedre tilgang til telefonstøtte fra siden» **#3,
40 %**. Informasjonskilder for 1–2-ansattbedrifter: **websøk 78–82 %**,
leverandørens nettsted 38–42 %. Hvorfor noe havner på kortlisten:
**mest kostnadseffektiv 43 %**, kompatibilitet 34 %, enkel å bruke 33 %,
kundeanmeldelser/referanser 21 %.

**Jo mindre bedriften, jo høyere rangerer pris på nettsiden.** Det er den eneste
segmentmatchede kilden i hele rapporten, og den peker rett på de to tingene vi
har plassert galt: prisen (42 % ned) og telefonnummeret (finnes ikke).

**[VERIFISERT]** NN/g, «B2B Usability» (31.05.2006): 79 deltakere, 179
B2B-nettsteder, USA + UK, 12 fokusgrupper, 55 brukertester, 7 feltbesøk.
Oppgaveløsning på B2B-sider **58 %** mot 66 % på forbruker-netthandel. Ordrett:
**«Prices scored the highest by far (29 % higher than product availability, which
ranked second)».**

**[VERIFISERT]** NN/g, «State the Price to Give B2B Sites a Competitive
Advantage» (01.12.2013): «Participants go to competitors' sites when websites do
not show prices» og «People view companies that hide costs as being evasive and
untrustworthy».

**[VERIFISERT]** NN/g, «Show Prices for Common Scenarios» (Nielsen, 09.04.2006) —
**og dette er den direkte løsningen på «det avhenger»-problemet:** ved kompleks
prising skal man vise **eksempelpriser for typiske scenarier**, ikke en kalkulator
som krever presise input fra brukeren.
`https://www.nngroup.com/articles/show-prices-for-common-scenarios/`

**Hva det betyr for oss konkret:** vår `/verktoy/priskalkulator` er bygget som
nettopp den kalkulatoren NN/g advarer mot — fire spørsmål brukeren må svare på
før han får et tall. Den er ærlig og viser forutsetningene sine, så den skal
ikke bort. Men den bør få tre ferdige eksempler over skyvebryterne:
«Rørlegger, 4 sider, booking: 14 900 kr» · «Klinikk, 6 sider, Vipps og SMS:
29 900 kr» · «Regnskapsfører, kundeportal: fra 60 000 kr». Da får han tallet
uten å jobbe for det, og kalkulatoren står igjen for den som vil regne selv.

**[VERIFISERT]** NN/g, «Trust or Bust» (06.03.1999): fire måter et nettsted
kommuniserer troverdighet, og **nummer to er «up-front disclosure» av kostnader.**
Pristransparens har stått som et *tillitsprinsipp*, ikke et markedsføringsvalg, i
NN/gs rammeverk i 27 år.

**[SITERT]** Demand Gen Report, «2021 B2B Buyer Behavior Survey», n = 257,
feltarbeid mai–juni 2021 (primærkilden gir 403; lest via marketingprofs):
**65 %** oppgir «enkel tilgang til pris- og konkurranseinformasjon» blant sine
tre viktigste kriterier når de besøker en potensiell leverandørs nettsted.

**[VERIFISERT]** TrustRadius 2022 B2B Buying Disconnect, n = 2 185, februar 2022:
**71 %** sa at publisering av pris på nettsiden er det fremste leverandører kan
gjøre for å øke kjøpssannsynligheten. **57 %** oppgir «no software pricing
available on website» blant de tre tingene som gjør dem *mindre* tilbøyelige til
å kjøpe. (Primærdomenet svarer 403; verifisert via to uavhengige sekundærkilder.)
2026-utgaven (n = 1 862, januar 2026): **45 %** oppgir transparent prising som
fremste ønske — **fjerde år på rad.**

**[VERIFISERT]** Gartner Digital Markets 2025 Tech Trends Survey, n = 3 500,
august 2024, ni land (**ingen nordiske**): kjøpere stoler **mer på leverandørens
egen side (59 %) enn på anmeldelsessider (41 %)** for prisinformasjon, TCO,
sikkerhet, integrasjoner og funksjoner. Og: **59 % angrer minst ett
programvarekjøp siste 18 måneder**; blant de 2 081 som angret er økte kostnader
fremste konsekvens (49 %). Rapportens egen anbefaling, ordrett: «The total
software investment being more expensive than expected is the top product-related
factor in purchase regret. Vendors need to be upfront about hidden or unexpected
costs … including costs for things such as **setup, customization and
maintenance**.»

**[VERIFISERT]** Ett faktisk A/B-eksperiment: iProspect via Convert.com,
22 000 besøkende over 4 uker, 95,26 % signifikans, test januar 2018. Kontroll
uten pris mot «lav startpris» og «høy startpris». **+15 % konverteringsrate på
skjemainnsending** for lavprisvarianten. **Begge** prisvarianter slo kontrollen.

**Ærlig motvekt [ANEKDOTISK]:** én praktikerrapport (Goyette, 16.05.2025) oppgir
at en pristabell ved siden av skjemaet ga −8,7 % leadvolum men +21,4 %
lead-til-opportunity, netto pipeline flat. **Ingen n, ingen signifikanstest,
forfatterens eget arbeid.** Retningen er logisk — pris filtrerer — men det er
ikke bevis.

**Svaret på spørsmålet eieren stilte:** det finnes ingen studie som direkte måler
«flere eller færre henvendelser når du viser pris på en norsk tjenesteside». Det
som finnes er (a) sterkt dokumentert, gjentatt, **segmentmatchet** etterspørsel
etter pris på nettsiden, sterkest hos de aller minste, og (b) ett ordentlig
A/B-eksperiment som viste +15 % skjemakonvertering med pris. **Ingen kilde viser
at pris reduserer antall henvendelser.**

## 7.2 Hvor langt kjøperen er kommet før kontakt — de kjente tallene er feil for oss

**[VERIFISERT]** SMB Group 2024, n = 738 — den eneste kilden som måler
småbedrifter. Andel av prosessen fullført før de kontakter en leverandør:

| Fullført | Andel |
|---|---|
| Under 25 % | 13 % |
| 25–49 % | ~33 % |
| 50–75 % | ~33 % |
| **Over 75 %** | **17 %** |

Og: «SMBs with less than 50 employees are more likely to complete more than 75 %
of the process than larger ones.»

**[VERIFISERT]** 6sense 2025 B2B Buyer Experience Report, n ≈ 3 744, **median
kjøpsverdi 200 000–300 000 USD**: 61 % gjennom reisen ved første kontakt (ned fra
69 %), kjøpssyklus 10,1 måneder, 79 % tar kontakt selv, 95 % av tiden er
vinneren på kortlisten alt på dag 1.

**[SITERT]** Gartners berømte «17 % av kjøpstiden med leverandørers salgsteam»:
n = 750 B2B-kunder i **komplekse løsningskjøp**, pre-covid (ca. 2019).
Gartner.com svarer 403 på all henting; tallet er ikke lest hos Gartner selv.
**Oppgi det som Gartner 2019, n = 750, komplekse løsningskjøp — ikke som en
universell sannhet.**

**Hva det betyr for oss:** de berømte tallene gjelder kjøp på 200 000 USD med
elleve personer i kjøpsgruppen. For småbedrifter er bildet motsatt: **bare 17 %
er mer enn tre fjerdedeler ferdige før de tar kontakt, og 46 % er under
halvveis.** Nettsiden vår møter altså kjøperen **midt i vurderingen**, ikke på
slutten — og den kan fortsatt forme hva han mener han trenger. Det er et argument
for å forklare, ikke bare å konvertere, og det passer med de norske
barrierefunnene i del 1.5.

## 7.3 Hva som faktisk avgjør – og vårt sterkeste kort er begravd

**[VERIFISERT]** Gartner Digital Markets 2025, n = 3 500. Hva som er avgjørende i
den **endelige** beslutningen:

| | |
|---|---|
| **Prøveperiode / trial** | **62 %** |
| Leverandørens kundeservice | 57 % |
| **Demo** | **54 %** |
| Leverandørens selger | 51 % |

Og hva som får en leverandør på den **første** listen i det hele tatt:
omdømme/bransjeposisjon 53 % · **tidligere erfaring med leverandøren 48 %** ·
anbefalinger fra likemenn 32 % · messe/konferanse 31 % · sosiale medier 29 % ·
annonser 27 % · word of mouth 26 %.

**[VERIFISERT]** SMB Group 2024, n = 738: supportpreferanse ved problemer er
telefon 51 % / live chat 46 %, og **bedrifter under 20 ansatte rangerer telefon
som #1**.

**[SITERT]** Gartner 2022 B2B Buyer Survey, som nyanse mot «fjern selgeren»:
selvbetjent digitalt kjøp ga **43 % høy kjøpsanger mot 26 % ved selgerledet
kjøp** — 1,65 ganger høyere. (Gartner.com svarer 403; ikke lest hos Gartner selv.)

**Hva det betyr for oss, og det er to ting:**

For det første: **prøveperiode og demo er de to øverste avgjørende faktorene, og
vi har noe bedre enn begge.** «Du ser en klikkbar prototype av forsiden din før du
har betalt noe. Sier du nei der, koster det ingenting» er et sterkere tilbud enn
en trial — det er en demo av *hans* side, ikke vår. Og den ligger som steg 2 i en
prosessliste i seksjon 6 av 10 på forsiden. Konkurrentene roper «gratis utkast» i
heroen (del 3.2). Vi hvisker det midtveis.

For det andre: listen over hvordan man kommer på førstelisten — omdømme 53 %,
tidligere erfaring 48 %, anbefalinger 32 % — er **presis den listen vi scorer null
på**, og det er «ingen finner oss»-problemet tallfestet. Det er også grunnen til
at pilottilbudet (del 8, tiltak 1) ikke kan vente: de tre øverste postene er alle ting
bare en levert kunde skaffer.

## 7.4 Hva som bygger tillit – og telefonnummeret igjen

**[VERIFISERT]** NN/g, «Contact Us Page Guidelines» (18.08.2019): kvalitativ
brukertest, **20 forretningsfolk, 40 bedriftsnettsteder**. Brukerne forventer
telefonnummer, fysisk adresse med postnummer, e-postadresse og åpningstider.
**Flertallet foretrekker telefon over e-post, skjema og chat.** Deltakersitat
ordrett: *«There are companies that don't even give you a phone number anymore. I
don't like it at all… It makes them seem suspicious.»* Å skjule telefonnummer
skader omdømmet. **Skjemaet bør ha maks 3–5 felt.**

**[VERIFISERT]** NN/g, «'About Us' Information on Corporate Websites»
(26.05.2019): 70+ brukere over tre runder, 100 nettsteder gjennomgått. Tillit
bygges av realistisk fotografi (ikke stockbilder), historiefortelling, klart
språk og flere veier til **et ekte menneske**. **Ordet «reviews» kom opp over 40
ganger i sesjonene.** Deltakersitat: *«I would not look at just the website. I
would look at blogs and review sites.»*

**[VERIFISERT]** NN/g, «What B2B Designers Can Learn from B2C About Building
Trust» (01.09.2019): «The first site to show a price can anchor users'
expectations.» Å skjule pris signaliserer at det er uoverkommelig dyrt.
Attester overbeviser mest når de inneholder innledende skepsis som blir snudd, og
**stillingstittel og sted på den som uttaler seg betyr mye.**

**[VERIFISERT]** Stanford Web Credibility Project, B.J. Fogg, mai 2002, bygget på
tre års forskning med **over 4 500 deltakere**. Retningslinjer ordrett i utdrag:
«Show that there's a real organization behind your site», «Make it easy to
contact you», «Show that honest and trustworthy people stand behind your site»,
«Avoid errors of all types, no matter how small they seem».

**[VERIFISERT]** Fogg / Consumer WebWatch (29.10.2002), **n = 2 684**, 100
nettsteder: **46,1 % av kommentarene handlet om «design look»** — det klart
hyppigste troverdighetskriteriet. (Merk: sekundærkilder oppgir n som både 2 684
og 2 864; Consumer Reports' egen side sier 2 684.)

## 7.5 Den norske tillitskilden — og den er sterkere enn jeg håpet

**[VERIFISERT]** NorSIS med Opinion AS, «Nordmenn og digital sikkerhetskultur
2024», juni 2024, **n = 1 001**, landsrepresentativt 18 år+.
`https://norsis.no/content/uploads/2024/10/Nordmenn-og-digital-sikkerhetskultur-2024.pdf`

| Tall | Hva det måler |
|---|---|
| **78 %** | undersøker om en nettside er trygg **før** de bruker den |
| **59 %** | har **latt være å bruke en nettjeneste** av frykt for noe kriminelt/ubehagelig |
| **54 %** | av disse har unngått **å handle i en nettbutikk** |
| 30 % | er usikre på om de klarer å vurdere hva som er trygt på nett |
| 80 % | mener KI gjør dem ekstra utsatt for svindel (opp fra 70 % i 2023) |

Forbehold: nytt svaralternativ i 2024 gjør 78 %-tallet ikke direkte
sammenlignbart med tidligere år.

**[VERIFISERT]** SSB tabell **12756**, «Opplevde problemer i forbindelse med
netthandel siste 12 måneder», 2025, begge kjønn 16–79 år: **31 % har opplevd
teknisk svikt ved nettsiden under bestilling eller betaling**, og **25 % har hatt
problemer med å finne informasjon om garantier e.l.**

**Hva det betyr for oss, og dette er gullet i del 7:** vi har lett etter et norsk
tall som rettferdiggjør at sikkerhet og teknisk kvalitet er et *salgsargument*
mot sluttkunden, ikke bare mot oss selv. **78 % av nordmenn sjekker om en
nettside er trygg før de bruker den. 59 % har droppet en nettjeneste av frykt.
31 % har opplevd at nettsiden sviktet under bestilling eller betaling.**

Det er argumentet som oversetter «6/6 sikkerhetsheadere» til noe rørleggeren
bryr seg om: **ikke at han blir bøtelagt, men at hans kunder ikke tør bestille.**

**Konkret endring:** dette er setningen som skal erstatte de tekniske tallene
øverst på forsiden og på bransjesidene: *«78 % av nordmenn sjekker om en nettside
er trygg før de bruker den. 59 % har latt være å bruke en nettjeneste de ikke
stolte på.»* Med kilde, år og n. Det er sikkerhet som omsetning, ikke sikkerhet
som compliance.

## 7.6 Skjemaet: bransjevisdommen holder ikke, og det er godt nytt for oss

**[VERIFISERT]** Zuko / Formisimo, det største datasettet som finnes:
**739 skjemaer, 20 000 merkede felt, 93 millioner skjemavisninger, 60 millioner
skjemastarter, 38 millioner fullføringer.** Overskrift ordrett:
**«The number of form fields has no effect on conversion rate»**, og videre:
*«the trend line is almost flat… This goes against the common wisdom that "the
shorter the form the better" … the number of inputs within the form are not an
important factor in how well the form converts — it's everything else.»*
(Siden mangler dato og forfatter — oppgi den som udatert.)

Den mest direkte benchmarken vi har: **under 10 % (9,09 %) av dem som ser et
kontaktskjema sender det inn** — laveste av alle skjematyper Zuko sporer. 34 % av
dem som *starter* et skjema fullfører ikke.

**[VERIFISERT]** Zuko, felttyper, n = 1 362 skjemaer over 12 måneder, telefonfelt
i 1 028 av dem. Snittfrafall: passord 10,50 % · e-post 6,41 % · **telefon
6,28 %** · navn 5,27 % · postnummer 4,82 %. **Standardavviket (8,25 %) er større
enn forskjellen mellom telefon og e-post.** Påstanden om at telefonfelt dreper
konvertering er ikke støttet av de største dataene som finnes.

**[VERIFISERT]** Seckler, Heinz, Bargas-Avila, Opwis og Tuch, CHI 2014,
kontrollert eyetracking-eksperiment, **N = 65**, 20 retningslinjer anvendt på
skjemaer fra ekte bedriftsnettsteder: **78 % fullførte på første forsøk når
retningslinjene var fulgt, mot 42 % når de ble brutt.**

**Hva det betyr for oss:** vårt firefeltsskjema er riktig, men ikke fordi det er
kort — fordi det er godt skrevet og enkeltspaltet. Og vi kan trygt legge til et
telefonfelt om vi vil: det koster 6,28 % frafall, ikke 30.

## 7.7 Hastighet: det ærlige tallet, og det som peker mot oss

**[VERIFISERT]** Deloitte/Google/Fifty-Five, «Milliseconds Make Millions»
(2020): **37 merkevarer, 30 millioner brukersesjoner**, 4 ukers timesdata fra
slutten av 2019, logaritmisk regresjon med krav om 95 % signifikans per
koeffisient.
- Ved **0,1 sekund raskere mobilside**: Retail **+8,4 % konvertering** og
  **+9,2 % ordreverdi**. Travel +10,1 % konvertering.

**Det kritiske forbeholdet ingen siterer, og som gjelder nøyaktig vår
kundetype:** i **Lead Generation**-vertikalen (6 merker, bare 505 000 sesjoner)
står det ordrett: *«Conversion rates on both mobile and desktop **decreased**
when site speed was seen to improve.»* Bare delprogresjonen inne i skjemaet gikk
opp (+21,6 %). Rapporten er dessuten **korrelasjon, ikke eksperiment**:
«Fluctuations in speed all occurred naturally and were not artificially created.»

**[VERIFISERT]** Vodafone (web.dev, 17.03.2021) — ekte A/B-test, 50/50,
~34 000 besøk per dag per variant: **LCP 8,3 s → 5,7 s (31 % bedre) → +8 % salg,
+15 % lead-to-visit, +11 % cart-to-visit.** Merk at selv den optimaliserte siden
lå på 5,7 s LCP, langt over 2,5 s-grensen. Dette er lavthengende frukt, ikke
finpuss.

**[VERIFISERT]** Rakuten 24 (web.dev, 24.08.2022) — én måneds A/B-test, 50/50:
CLS +92,7 %, FCP +8,5 %, TTFB +18,0 % → **+33,1 % konverteringsrate, +53,4 %
omsetning per besøkende.**

**[IKKE BRUK] «53 % forlater sider som tar over 3 sekunder.»** Proveniensen er
fastslått: Google Ad Manager-bloggen 8. september 2016, opprinnelig ordlyd *«53 %
of visits are **likely to be** abandoned if pages take longer than 3 seconds to
load»*, metodelinje i Think with Googles benchmark-PDF (2017): *«Google Data,
Global, n = 3 700 aggregated, anonymized Google Analytics data from a sample of
mWeb sites **opted into sharing benchmark data**, Mar. 2016.»*
Fem grunner til ikke å bruke det: (1) det er **ikke** SOASTA — den attribusjonen
gjelder andre tall i samme dokument; (2) ordlyden er forsterket over tid, fra
«likely to be abandoned» til «leave a page»; (3) n og dato spriker mellom Googles
egne kilder; (4) selvselektert utvalg; (5) ti år gammelt, 3G-tid, mobilsider
generelt — ikke B2B-tjenestesider, og det måler forlatelse, ikke konvertering.
**Bruk Deloitte 2020 og Vodafone/Rakuten i stedet.**

**[SITERT]** Én norsk akademisk kilde eksisterer: Ali Vindenes Fetouni,
«Evaluating the correlation between site speed and its effect on conversion rates
for Norwegian Air Shuttle ASA», masteroppgave NMBU 2018, 116 sider,
`http://hdl.handle.net/11250/2572361`. Logistisk regresjon på Dynatrace
RUM-data fra norwegian.com. Sammendraget åpner treffende: *«The matter of how
speed correlates with conversion rates is a field that is built up by many
commercials testimonies. Many of these testimonies are based on statements that
have little to no root sources.»* Konklusjon: «strong relationship» — **men uten
tall i sammendraget, og nedlasting krever autentisering.** Noen må hente PDF-en
manuelt for å få koeffisientene. Utover dette finnes ingen nordisk
hastighets/konverteringsdata.

**Hva det betyr for oss:** vi skal fortsatt være raske, men vi skal **slutte å
selge hastighet som konverteringsargument**. Den eneste vertikalen i det beste
datasettet som ligner vår kundetype — leadgenerering — gikk motsatt vei. Det
ærlige argumentet for hastighet er lokal SEO og at siden ikke svikter under
bestilling (SSB: 31 %), ikke «+8,4 % konvertering».

## 7.8 Sosialt bevis: solid internasjonalt, tomt i Norge

**[VERIFISERT]** Gartner Digital Markets 2025, n = 3 500: **kundeanmeldelser er
den mest innflytelsesrike kilden når kortlisten lages — 41 %**, foran
bransjeeksperter 39 %, Google/søk 38 %, sammenlignings- og anmeldelsessider 35 %,
leverandørens nettsted 35 %, kundereferanser 33 %, ChatGPT/generativ AI 27 %.

**[VERIFISERT]** G2 Buyer Behavior Report 2024, n = 1 940 B2B-beslutningstakere,
mars 2024, NA/EMEA/APAC: **31 %** oppgir offentlige produktanmeldelsessider som
mest konsulterte kilde — «up from 23 % in 2023, 18 % in 2022, and 13 % in 2021».
Og: **9 %** oppgir «vendor websites are unreliable sources of information» som
største hindring — **opp 6 prosentpoeng fra 3 %.** 2026-utgaven (n = 1 038, juni
2026): 38 % oppgir anmeldelsessider som toppkilde for kortlisten.

**[VERIFISERT]** BrightLocal Local Consumer Review Survey, utgave 2026, publisert
11.02.2026, **n = 1 002, kun USA**, forbrukere ikke B2B. **Norge er ikke med.**
De to mest brukbare tallene: **54 % besøker bedriftens nettside etter positive
anmeldelser** (opp fra 32 % i 2019) og **74 % bryr seg bare om anmeldelser fra
siste tre måneder**. Videre: 97 % leser anmeldelser, 68 % krever minst 4 stjerner,
47 % vil ikke bruke en bedrift med under 20 anmeldelser, 83 % skriver en
anmeldelse hvis de blir bedt om det. **Med USA-forbeholdet påklistret hver gang.**

**[VERIFISERT] Og den ene norske kilden peker motsatt vei.** Forbrukerrådet, «Lei
av å bli lurt» (2022), YouGov, **n = 2 008 webintervju, 24. aug–6. sept 2022,
landsrepresentativt, veid på kjønn, alder og geografi**:
**61 % «opplever ofte eller noen ganger falsk kundeaktivitet»**, 33 % synes det
er manipulerende, **28 % «stoler ikke på informasjonen»**.
**Presisering som må med:** «falsk kundeaktivitet» betyr i rapporten
fabrikkerte aktivitetssignaler («12 personer ser på denne nå»), **ikke
kundeanmeldelser.** Det er altså ikke bevis for at nordmenn leser anmeldelser —
det er bevis for at **61 % av nordmenn gjenkjenner og 28 % mistror fabrikkert
sosialt bevis.**

**[IKKE FUNNET]** Noen norsk studie som viser at nettanmeldelser påvirker
B2B-kjøp. Ikke Forbrukerrådet, Trustpilot, Kantar, Ipsos eller akademia. Alt
norskspråklig innhold om temaet er byråblogger som resirkulerer BrightLocal uten
kilde. **Norsk Kundebarometer (BI)** måler kundetilfredshet per selskap og kan
**ikke** brukes som mål på tillit til nettsider.

**[VERIFISERT]** Og én plattformopplysning som støtter samme konklusjon:
Trustpilots egen Transparency Report 2021 oppgir at de fjernet **2 209 230 falske
anmeldelser i 2020 — 5,7 % av alle innsendte.**

**Hva det betyr for oss:** vi skal ha sosialt bevis, men **navngitt, datert og
etterprøvbart** — ikke stjerner og badges. Den norske kilden sier at 28 % mistror
fabrikkert sosialt bevis, og NN/g sier at stillingstittel og sted på den som
uttaler seg betyr mye. Fire navngitte kundeutsagn slår «5,0 ★» uten antall. Det
passer dessuten vår stemme bedre.

## 7.9 Tall som sirkulerer og som vi aldri skal bruke

| Påstand | Hva det faktisk er |
|---|---|
| «11 → 4 felt = +120 % konvertering» | **[IKKE BRUK]** Primærkilden funnet og lest: Imaginary Landscape LLC, juni 2008. Faktisk tabell: takkeside-visninger gikk **fra 10 til 26**. Ikke A/B-test — to perioder seks måneder fra hverandre, ingen kontrollgruppe, ingen signifikanstest, et webbyrås egen markedsføring. Tallet er ikke oppdiktet; beviset er verdiløst. |
| «HubSpot, 40 000 landingssider: 3 felt = 25,1 %» | **[IKKE BRUK]** Utvalget er ekte, men HubSpots egne poster har **fire diagrammer uten tallverdier på aksene**. De sirkulerende prosentene er tredjeparts avlesninger av umerkede grafer. Zarrellas egen konklusjon er mye svakere: om feltantall skriver han «conversion rates decrease slightly, but not as steeply as I expected». |
| «4 → 3 felt = +50 %» | **[IKKE BRUK]** Spores til Quicksprout, en blogg. Ingen primærkilde. |
| «Unbounce sier X om skjemafelt» | **[IKKE BRUK]** Unbounce Conversion Benchmark Report (siste utgave 2024, n = 41 000+ landingssider) **inneholder ingenting om antall skjemafelt**. En påstått «Unbounce 2026-rapport basert på 1,4 mill. skjemaer» finnes ikke. |
| «Telefonfelt dropper konvertering 30–48 %» | **[IKKE BRUK]** Oppdiktet eller feilattribuert. Zuko-artikkelen inneholder det ikke; den sier 6,28 %. |
| Kalenderbooking-tall fra Chili Piper / Calendly | **[IKKE BRUK]** Chili Pipers «66,7 %» er fra deres egen kundebase, sammenlignet mot en «industry average» **uten oppgitt kilde**. Calendlys Forrester TEI er bestilt og betalt av Calendly, bygget på intervjuer med **fire** kunder slått sammen til en fiktiv «composite organization», og måler kostnadsbesparelse — ingen konverteringsdata. |
| «Flerstegsskjema +743 %» | **[IKKE BRUK]** Venture Harbour, ca. 2014. Ingen n, ingen varighet, ingen A/B-test; artikkelen innrømmer at funnet ble oppdaget «by accident». |
| «Forbrukerrådets Digital Consumer Report 2024: 82 % leser minst fem anmeldelser» | **[IKKE BRUK]** Ser oppdiktet ut. Kilden var en SEO-side som selger Google-anmeldelser. **Det finnes ingen slik rapport.** |
| «Over 40 % av nordmenn har tatt dårlige kjøpsvalg basert på misvisende anmeldelser — Forbrukerrådet» | **[IKKE BRUK]** Påstått i en norsk bransjeartikkel (09.07.2026) uten lenke, rapportnavn eller årstall. Søk på forbrukerradet.no gir ingen slik figur. |
| «70 % av nordmenn har mistet tillit til nettanmeldelser» | **[IKKE BRUK]** Kilden er **Icelandair**, om **reiseanmeldelser**, 2019. Kommersiell PR, feil vertikal. |
| «30 % av forbrukere utelukker bedrifter uten nettside» | **[IKKE BRUK]** Amerikansk (YP & LSA), referert via norske byråblogger. Ikke norsk. |
| «37 % av SMB har mobiltilpasset nettside» | **[IKKE BRUK]** Tilskrevet Eniro SMB-barometer 2014. Primærkilden ikke funnet. 12 år gammelt. |
| «Tvangsmulkt 2 000–5 000 kr per dag» for WCAG-brudd | **[IKKE BRUK]** Finnes ikke i forskriften, loven eller hos uutilsynet. |
| «WCAG 2.1 AA er lovpålagt for norske private bedrifter» | **[IKKE BRUK]** Feil. Private: WCAG 2.0 A+AA minus 1.2.3, 1.2.4, 1.2.5 = 35 krav. |
| «EAA gir krav fra 28. juni 2025 i Norge» | **[IKKE BRUK]** EAA er ikke tatt inn i EØS-avtalen og ikke gjennomført i norsk rett. |

---

# Del 8 – Rangering: de fem endringene som flytter mest

Rangert etter hvor mye de øker sjansen for at en norsk småbedrift tar kontakt,
verste mangel først. Holdt til ting som kan gjøres uten nye kunder og uten å lyve.

---

## 1. Ett bevis fra en ekte kunde, og et telefonnummer

**Hvorfor den er verst:** dette er de to eneste punktene der vi er under
markedets gulv, ikke bare bak de beste.

- Kjøperens spørsmål nummer 9 — «kan jeg se tre nettsider dere har laget for
  bedrifter som ligner min» — får svaret **nei** (del 5.1, 5.6).
- **15 av 27** konkurrenter har klikkbart telefonnummer på forsiden. Vi har null
  (del 4.4).
- **[VERIFISERT]** For 1-ansattbedrifter er «bedre tilgang til telefonstøtte fra
  siden» rangert **#3 (40 %)** blant forbedringer de ber om (SMB Group 2024,
  n = 738).
- **[VERIFISERT]** NN/g, 20 forretningsfolk: flertallet foretrekker telefon, og
  et manglende nummer *«makes them seem suspicious»*.
- **[VERIFISERT]** Kundeanmeldelser er den mest innflytelsesrike kilden når
  kortlisten lages — 41 % (Gartner Digital Markets 2025, n = 3 500).

Ingen mengde sikkerhetsheadere kompenserer for at det ikke finnes én annen person
som sier at vi leverte.

**Hva som gjøres:**
- Flytt **pilottilbudet** fra bunnen av `/caser` til forsiden og `/priser`. Det
  finnes alt, ordrett: *to–tre pilotprosjekter til redusert pris mot at tallene
  blir case.* Si at vi er nye. Det er en bedre historie enn tomhet.
- Sett inn et telefonnummer. `firma.telefon` er tom, og hele infrastrukturen
  rundt står klar.
- Sett `telephone` og reell `streetAddress` i `ProfessionalService`-schemaet, og
  legg `aggregateRating` inn **først** når den første ekte omtalen finnes.
- Ta hånd om adressen: Enhetsregisteret publiserer alt foretaksadressen
  **[VERIFISERT]**, så å utelate den beskytter ingenting, mens ehandelsloven § 8
  krever geografisk adresse. Postboks eller kontoradresse løser personvern og
  lovkrav i samme grep — og åpner for Google Bedriftsprofil, som vi selger andre.
- Når bevisene kommer: **navngitt, datert, med stillingstittel og sted**, ikke
  stjerner. 28 % av nordmenn mistror fabrikkert sosialt bevis (del 7.8).

**Hva det ikke er:** det er ikke å finne på caser. `synligeCaser`-filteret skal stå.

---

## 2. Flytt prisen fram, og bytt førsteinntrykket fra vår teknikk til hans problem

**Hvorfor den er nummer to:** dette er endringen med det sterkeste og mest
segmentmatchede beviset i hele rapporten.

- **[VERIFISERT]** For bedrifter med 1 / 2 / 5–9 ansatte er **«vis prisen
  tydelig på nettsiden» rangert #1** blant alt leverandører kan forbedre —
  58 % / 56 % / 63 % (SMB Group 2024, n = 738). Jo mindre bedriften, jo høyere.
- **[VERIFISERT]** «Prices scored the highest by far — 29 % higher than the
  second-ranked need» (NN/g, 79 deltakere, 179 B2B-nettsteder).
- **[VERIFISERT]** 71 % sa pris på nettsiden er det fremste som øker
  kjøpssannsynligheten (TrustRadius 2022, n = 2 185); 45 % oppgir det fjerde år
  på rad (2026, n = 1 862).
- **[VERIFISERT]** Det ene ordentlige A/B-eksperimentet: **+15 %
  skjemakonvertering** med pris, 22 000 besøkende, 95,26 % signifikans.
- **Hos oss står prisen 42 % ned i teksten**, og det første en besøkende ser er
  ordet «sikkerhetsheadere» i 1,5 sekund på fullskjerm (del 5.2).
- Og på telefon **forsvinner den eneste vedvarende CTA-en under 560 px**
  (del 5.3), så en mobilbruker som har scrollet forbi heroen kan ikke handle.

**Hva som gjøres:**
- **Prisanker i heroen.** «Fast pris» er en påstand alle gjør; «fra 14 900 kr» er
  et tall han kan handle på.
- **Behold åpningen, bytt ordene.** Mekanikken er godt bygget. Men i stedet for
  tre målinger av oss: *«78 % av nordmenn sjekker om en nettside er trygg før de
  bruker den. 59 % har latt være å bruke en de ikke stolte på.»* (NorSIS/Opinion
  2024, n = 1 001 — **[VERIFISERT]**, del 7.5.) Det er sikkerhet som omsetning,
  ikke sikkerhet som compliance, og det er det eneste norske tallet som gjør vår
  spesialitet til hans problem.
- **Fjern** `@media (max-width: 560px) { .topbar__cta { display: none; } }`,
  eller erstatt med en klebende handlingslinje i bunnen på telefon.
- **Flytt «Priser» fram i hovedmenyen.** Den står som nummer 6 av 7 i et marked
  der hele kjøpsreisen starter med ordet «pris».
- **Legg 9 990-segmentet inn i sammenligningstabellen** på `/priser`. Tabellen
  vår utelater i dag den ene sammenligningen kjøperen faktisk gjør (del 3.1).
  Og legg inn **3-årsformelen** — den er markedets eget beste
  innvendingsverktøy, og den favoriserer oss.
- **Løft den gratis prototypen til heroen.** **[VERIFISERT]** Prøveperiode (62 %)
  og demo (54 %) er de to øverste avgjørende faktorene i den endelige
  beslutningen (Gartner Digital Markets 2025, n = 3 500), og vi har noe sterkere
  enn begge: en klikkbar prototype av *hans* side før han har betalt noe. I dag
  ligger den som steg 2 i en prosessliste i seksjon 6 av 10, mens konkurrentene
  roper «gratis utkast» i heroen (del 3.2, 7.3).
- **Gi priskalkulatoren tre ferdige eksempler** over skyvebryterne. **[VERIFISERT]**
  NN/g: ved kompleks prising skal man vise eksempelpriser for typiske scenarier,
  ikke en kalkulator som krever presise input (del 7.1).
- **Svar på spørsmål 1:** totalpris over tre år. Vi svarer det ikke noe sted.
- **Rett «eks. mva»** mens `mva: false` (del 5.5). Det gjør oss 25 % billigere i
  kjøperens hode uten å senke prisen med én krone, og det treffer klinikkene —
  som ikke har fradragsrett **[VERIFISERT]**.

---

## 3. Rett de to feilene i vårt eget materiale, og bygg vakten som stopper neste

**Hvorfor den er nummer tre:** fordi den er den eneste som kan gjøre alt det
andre verdiløst. Hele posisjonen er «vi måler, vi påstår ikke, og du kan
etterprøve oss».

- `markedspriser.ts` har én priskilde som er et **dødt domene** (`klarosites.no`,
  NXDOMAIN) og ett tall som **ikke står hos kilden** (del 6.1). En kjøper som
  klikker én lenke finner det.
- `/sjekk` kan **dømme en lovlydig side for lovbrudd**, fordi
  `analyserCookies()` ikke kjenner Google Consent Mode eller noen CMP. **11 av de
  19** byråene som laster Google-sporing ville blitt feilbedømt (del 6.2).

Og: **jeg begikk selv samme feilklasse i første utkast av denne rapporten** ved å
lese den gamle SSB-tabellen i stedet for den nye. Det er ikke en engangsfeil, det
er en vane som må ha en mekanisme imot seg.

**Hva som gjøres:** del 6.1 og 6.2. Og tre mekanismer:
1. En test som **feiler bygget** hvis en `kilde`-URL i `markedspriser.ts` ikke
   svarer 200.
2. Krav om **tabellnummer og oppdateringsdato** på hvert eksternt tall — slik
   `maalinger.json` alt gjør for våre egne. Start med SSB tabell 14933 på
   bransjesiden.
3. `/sjekk` skal ha **tre grader, ikke to**, og si «dette kan jeg ikke avgjøre
   maskinelt» der det er sant. Det er mer overbevisende enn en dom, og det peker
   rett på en samtale.

---

## 4. Gjør vår egen skanning til hovedhistorien, og bytt om på de to juridiske argumentene

**Hvorfor den er nummer fire:** her ligger både vår eneste ukopierbare eiendel og
vår mest feilplasserte vektlegging.

**Eiendelen.** SSBs IKT-statistikk dekker bare foretak med minst 10 sysselsatte,
altså 7,8 % av norske foretak **[VERIFISERT]**. For de 92,2 % som er mindre
finnes **ingen offisiell norsk statistikk** — jeg sjekket både SSB og Eurostat
(del 1.2). Vår skanning av 38 sider er dermed sannsynligvis det eneste tallet som
finnes for segmentet. I dag er den en fotnote i en juridisk artikkel med én
innlenke.

**Feilvektleggingen.** Vi leder med universell utforming, der straffen i praksis
er et rettepålegg og **2 iverksatte tvangsmulkter på 11 år**. Vi nevner ikke at
cookie-brudd kan koste **inntil 10 % av årsomsetningen i Norge** (ekomloven
§ 15-12). **Rekkefølgen er omvendt** (del 2.1, 2.3).

**Hva som gjøres:**
- **Egen side for skanningen**, tittel på kjøperens språk, med forbeholdene
  stående — de er alt skrevet i `maalinger.json`, og de gjør tallet sterkere.
- Si i klartekst at **SSB ikke måler segmentet**. Det forvandler «vi målte 38
  sider» fra et lite utvalg til det eneste utvalget.
- Legg myndighetens egne tall ved siden av: **90 av 92 ikt-løsninger måtte rettes
  etter tilsyn (98 %)**, 19 helseløsninger kontrollert og **ingen** oppfylte
  kravene, og **Dr.Dropin 2026:04 med brudd på 8 av 11 testede krav**
  **[VERIFISERT]**. (Vurderingen om navngiving: husregelen gjelder sider som
  kommer dårlig ut i *vår* skanning. Dette er offentlige tilsynsrapporter
  myndigheten selv har publisert med navn. Jeg mener det er innenfor, men det er
  eierens kall.)
- **Bytt rekkefølgen:** cookies og ekomlovens 10 %-gebyr først, universell
  utforming deretter.
- Men **forklar før du advarer**: bare **ca. 2 av 10** private kjenner
  UU-kravene, og **28 %** av de små **[VERIFISERT]**. Å lede med «ekomloven
  § 3-15» til noen som ikke vet at regelen finnes, er å svare på et spørsmål han
  ikke har stilt. Og **17 %** — ikke 70 % — er mer enn tre fjerdedeler ferdige før
  de tar kontakt (del 7.2), så siden møter ham midt i vurderingen og kan fortsatt
  forklare.
- **Bytt argumentet på bransjesidene** fra «har du nettside» til «kan nettsiden
  din ta imot en bestilling»: bare **38,1 %** av norske foretak med 10–49 ansatte
  har booking eller nettbestilling, og bare **38,9 %** har tre av åtte funksjoner
  **[VERIFISERT]** (del 1.3).
- **Oversett CSP til tillit** (del 4.6): «Denne siden har lov til å snakke med
  nøyaktig én annen tjeneste. Det står i en header hvem som helst kan lese.»
- **Slutt å selge hastighet som konverteringsargument.** Den eneste vertikalen i
  Deloittes datasett som ligner vår kundetype — leadgenerering — gikk motsatt vei
  **[VERIFISERT]** (del 7.7). Selg hastighet som lokal SEO og som «siden svikter
  ikke under bestilling» (SSB: 31 % har opplevd nettopp det).

---

## 5. Fem sider som svarer på det kjøperen googler

**Hvorfor den er sist av fem, men ikke uviktig:** eieren har rett i at vi er to
døgn gamle, og ingen av de fire over hjelper hvis ingen kommer. Men nærmeste
konkurrent har **136** indekserte sider mot våre **27**, og **11** bransjesider
og **8** innvendingssider mot våre 2 og 0 (del 3.4). Og
**[VERIFISERT]** websøk er informasjonskilde nummer én for 1–2-ansattbedrifter,
**78–82 %** (SMB Group 2024). Dette er den eneste av de fem som tar måneder å
virke, og derfor den som skal startes nå, ikke rangeres først.

**Fem sider, ikke en ny lab:**
1. **«Hvorfor koster en nettside mellom 5 000 og 80 000 kr?»** Med tabellen fra
   del 3.1 og alle åtte kildene. I flere søk på «hva koster en nettside» var 7–9
   av 10 treff fra **samme domene**, uten oppgitt metode. Vi er i en uvanlig god
   posisjon til å skrive den siden, fordi vi har sjekket kildene.
2. **«Kan jeg bytte fra WordPress eller Wix uten å miste Google-plasseringen?»**
   Konkurrenten har siden; vi har lovsjekk-pakken på 7 900 kr som er svaret.
3. **«Hva koster en nettside i drift per år?»** Svarer på kjøperens spørsmål
   nummer 1 — totalpris over tre år — som vi i dag ikke svarer på noe sted. Og
   **[VERIFISERT]** uventede kostnader er den fremste produktrelaterte årsaken
   til kjøpsanger (Gartner Digital Markets 2025, n = 3 500).
4. **Bransjeside: regnskapsførere.**
5. **Bransjeside: elektrikere.** Begge ligger i NACE-kodene vi alt har skannet, så
   begge kan åpne med et eget tall i stedet for en påstand.

Og mens de rangerer: de lovlige utadrettede kanalene er **telefon til foretakets
publiserte nummer, fysisk post, og inngående søk.** Kald e-post er stengt mot ENK
fordi markedsføringsloven § 15 gjelder fysiske personer også når adressen står i
Brønnøysundregisteret **[VERIFISERT]** (del 2.6).

---

# Appendiks – alt vi lette etter og ikke fant

Står her for at ingen skal bruke tid på det igjen.

- **Norsk undersøkelse om hva småbedrifter vektlegger når de kjøper nettside.**
  Ikke fra Virke, NHO, SMB Norge, Digdir eller akademia. **Ikke funnet.**
- **Uavhengig norsk statistikk på hva bedrifter betaler for nettside.** Ikke SSB,
  Virke, Abelia, Mittanbud eller Tjenestetorget. Ingen Byggstart-ekvivalent for
  web. **Ikke funnet.** Alt er byråmarkedsføring.
- **Norsk eller nordisk forskning på pristransparens, skjemalengde eller synlig
  telefonnummer mot konverteringsrate.** **Ikke funnet.**
- **SSB- eller Eurostat-tall på nettsidedekning for foretak under 10 ansatte.**
  **Ikke funnet** — begge har populasjonsgrense på 10.
- **Norsk statistikk på om nettsider er mobilvennlige eller oppdaterte.**
  Finnes ikke i Norge.
- **Norsk undersøkelse som tallfester hvor mange som sjekker en bedrift på nett
  før de tar *kontakt*** (ikke kjøp). **Ikke funnet.**
- **Norsk studie som viser at nettanmeldelser påvirker B2B-kjøp.**
  **Ikke funnet.**
- **Faktisk ilagt tvangsmulkt mot en privat virksomhet for manglende universell
  utforming, med kronebeløp.** Hjemmelen og trusselen er verifisert, og 22 av 92
  har fått *vedtak*, men **2** er iverksatt. Et navngitt vedtak med beløp fant
  jeg ikke. **Ikke skriv at det har skjedd.**
- **Oppdatert anslag på hvor mange norske virksomheter som er omfattet av
  UU-forskriften.** Siste estimat er Difi 2014 (58 000–78 000, minimum fire
  ansatte) og «mer enn 80 000» i et statsrådsvar fra 2021. **Ikke funnet.**
- **Statusmåling av norske nettsteder etter 2018.** Serien er avsluttet; det
  finnes bare 2014 og 2018.
- **`klarosites.no`**, oppgitt som kilde i `markedspriser.ts`. **Domenet
  eksisterer ikke** (NXDOMAIN, 7. oktober 2026).
- **SIFO-rapport 12-2018 om brukeranmeldelser** (den eneste norske akademiske
  undersøkelsen på temaet): handle-lenken er død og arkivdomenene svarer ikke.
  Noen må hente PDF-en fra OsloMet før den kan siteres.
- **Fetounis masteroppgave (NMBU 2018)** om hastighet og konvertering for
  Norwegian: nedlasting krever autentisering. Noen må hente den manuelt.

## Kilder

**Norske offentlige:**
[SSB tabell 14933 – heimeside etter SN2025, 2026](https://www.ssb.no/statbank/table/14933) ·
[SSB tabell 10975 – heimeside etter SN2007](https://www.ssb.no/statbank/table/10975) ·
[SSB tabell 14000 – foretak etter storleik](https://www.ssb.no/statbank/table/14000) ·
[SSB tabell 07091 – bedrifter etter ansatte](https://www.ssb.no/statbank/table/07091) ·
[SSB tabell 14936 – IKT-kompetanse](https://www.ssb.no/statbank/table/14936) ·
[SSB tabell 12756 – problemer ved netthandel](https://www.ssb.no/statbank/table/12756) ·
[SSB: Bruk av IKT i næringslivet](https://www.ssb.no/teknologi-og-innovasjon/informasjons-og-kommunikasjonsteknologi-ikt/statistikk/bruk-av-ikt-i-naeringslivet) ·
[Eurostat isoc_ciweb](https://ec.europa.eu/eurostat/databrowser/view/isoc_ciweb/default/table) ·
[Eurostat isoc_e_dii](https://ec.europa.eu/eurostat/databrowser/view/isoc_e_dii/default/table) ·
[Enhetsregisteret, 936374336](https://data.brreg.no/enhetsregisteret/api/enheter/936374336)

**Norsk regelverk og tilsyn:**
[Ekomloven § 3-15](https://lovdata.no/lov/2024-12-13-76/%C2%A73-15) ·
[Ekomloven kap. 15 – sanksjoner](https://lovdata.no/dokument/NL/lov/2024-12-13-76/kap15) ·
[Foretaksregisterloven § 10-2](https://lovdata.no/lov/1985-06-21-78/%C2%A710-2) ·
[Ehandelsloven](https://lovdata.no/dokument/NL/lov/2003-05-23-35) ·
[Forskrift om universell utforming av IKT](https://lovdata.no/dokument/SF/forskrift/2013-06-21-732) ·
[Datatilsynet: cookie-veiledning (03.04.2025)](https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bruk-av-informasjonskapsler-og-andre-sporingsteknologier/) ·
[Datatilsynet: nye cookie-regler](https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2024/nye-cookie-regler-fra-1.-januar/) ·
[Nkom: informasjonskapsler](https://nkom.no/internett/informasjonskapsler-cookies) ·
[Uutilsynet: kva seier forskrifta](https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153) ·
[Uutilsynet: data frå tilsyn og kontroll](https://www.uutilsynet.no/innsikt-og-analyse/data-fra-tilsyn-og-kontroll/2052) ·
[Uutilsynet: digitale helsetenester](https://www.uutilsynet.no/innsikt-og-analyse/digitale-helsetenester-er-ikkje-tilgjengelege-alle/3232) ·
[Tilsynsrapport Dr.Dropin AS (2026:04)](https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167) ·
[Tilsynsrapport Farmasiet (2026:02)](https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-farmasietno-farmasiet/3161) ·
[Uutilsynet/Rambøll: Digital inkludering i praksis (2024)](https://www.uutilsynet.no/kartlegginger/digital-inkludering-i-praksis-en-kartlegging-av-norske-virksomheters-arbeid-med-universell-utforming/2609) ·
[Uutilsynet om EAA](https://www.uutilsynet.no/uubloggen/kva-skjer-med-tilgjengelegheitsdirektivet-eaa/2802) ·
[Forbrukertilsynet: markedsføring via e-post og SMS](https://www.forbrukertilsynet.no/lov-og-rett/veiledninger-og-retningslinjer/forbrukertilsynets-veiledning-markedsforing-via-e-post-sms-o-l) ·
[Skatteetaten: mval. § 3-2](https://www.skatteetaten.no/rettskilder/type/handboker/merverdiavgiftshandboken/2023/M-3/M-3-2/M-3-2.2/)

**Norske undersøkelser:**
[NorSIS/Opinion: Nordmenn og digital sikkerhetskultur 2024](https://norsis.no/content/uploads/2024/10/Nordmenn-og-digital-sikkerhetskultur-2024.pdf) ·
[Forbrukerrådet/YouGov: Lei av å bli lurt (2022)](https://storage02.forbrukerradet.no/media/2022/11/rapport-lei-av-a-bli-lurt-1.pdf) ·
[NIFU 2025:2 – NHOs Kompetansebarometer 2024](https://www.nho.no/contentassets/78484b7562254cf5a2dfe4621b615a64/kompetansebarometeret-2024.pdf) ·
[NHO/SØA: Bruk av KI i norsk næringsliv (2026)](https://www.nho.no/contentassets/0c161f2827a5433da3dbd68ed68961d4/rapport_endelig_1.pdf) ·
[SMSØ/Opinion 2019: seriøsitetssjekk](https://www.skatteetaten.no/nn/presse/nyhenderommet/det-ma-bli-raskt-og-enkelt-a-sjekke-om-en-leverandor-er-serios/) ·
[Digdir: Rikets digitale tilstand](https://www.digdir.no/rikets-digitale-tilstand/sikre-en-fremtidsrettet-digital-kompetanse-kap-35/7441)

**Internasjonal forskning:**
[SMB Group: 2024 SMB Technology Buying Journey](https://smb-gr.com/wp-content/uploads/2024/08/2024-SMB-Buying-Journey-Final.pdf) ·
[NN/g: B2B Usability](https://www.nngroup.com/articles/b2b-usability/) ·
[NN/g: State the Price](https://www.nngroup.com/articles/show-price/) ·
[NN/g: Show Prices for Common Scenarios](https://www.nngroup.com/articles/show-prices-for-common-scenarios/) ·
[NN/g: Trust or Bust (1999)](https://www.nngroup.com/articles/communicating-trustworthiness/) ·
[NN/g: Website Forms Usability](https://www.nngroup.com/articles/web-form-design/) ·
[NN/g: Hierarchy of Trust](https://www.nngroup.com/articles/commitment-levels/) ·
[Demand Gen Report 2021 via MarketingProfs](https://www.marketingprofs.com/charts/2021/45409/what-b2b-buyers-want-from-vendor-websites) ·
[MIT/Oldroyd: Lead Response Management](https://www.mortech.com/hs-fs/hub/25649/file-13535879-pdf/docs/mit_study.pdf) ·
[Baymard: cart abandonment](https://baymard.com/lists/cart-abandonment-rate) ·
[NN/g: Contact Us Page Guidelines](https://www.nngroup.com/articles/contact-us-pages/) ·
[NN/g: About Us Information](https://www.nngroup.com/articles/about-us-information-on-websites/) ·
[NN/g: B2B Trust from B2C](https://www.nngroup.com/articles/b2b-trust-from-b2c/) ·
[Stanford Web Credibility Guidelines](https://credibility.stanford.edu/guidelines/index.html) ·
[Fogg/Consumer WebWatch 2002](https://advocacy.consumerreports.org/research/how-do-people-evaluate-a-web-sites-credibility) ·
[Zuko: om datagrunnlaget](https://zuko.io/benchmarking/about-the-data) ·
[Zuko: feltantall har ingen effekt](https://zuko.io/blog/8-surprising-insights-from-zukos-benchmarking-data) ·
[Zuko: felttyper og frafall](https://zuko.io/blog/which-form-fields-cause-the-biggest-ux-problems) ·
[Seckler et al., CHI 2014](https://research.google/pubs/designing-usable-web-forms-empirical-evaluation-of-web-form-improvement-guidelines/) ·
[Deloitte/Google: Milliseconds Make Millions](https://www.deloitte.com/content/dam/assets-zone2/ie/en/docs/services/consulting/2023/Milliseconds_Make_Millions_report.pdf) ·
[web.dev: Vodafone](https://web.dev/case-studies/vodafone) ·
[web.dev: Rakuten 24](https://web.dev/case-studies/rakuten) ·
[Gartner Digital Markets 2025 Tech Trends](https://cdn-static.bizzabo.com/bizzabo.file.upload/yVkIqwmWRDKbEhqeE3aQ_Gartner-Digital-Markets_2025-Report_Making-The-List.pdf) ·
[6sense 2025 Buyer Experience Report](https://6sense.com/report/buyer-experience/) ·
[G2 Buyer Behavior Report 2024](https://research.g2.com/hubfs/2024-buyer-behavior-report.pdf) ·
[BrightLocal Local Consumer Review Survey](https://www.brightlocal.com/research/local-consumer-review-survey/) ·
[Convert/iProspect A/B-test på pris](https://www.convert.com/case-studies/iprospect/) ·
[Google: The need for mobile speed (2016)](https://blog.google/products/admanager/the-need-for-mobile-speed/)

**Konkurrenter (alle hentet 7. oktober 2026):**
[smartbyra.no/priser](https://smartbyra.no/priser) ·
[smartbyra.no: 10 spørsmål](https://smartbyra.no/nettside-for-bedriften/10-sporsmal-for-du-bestiller-nettside) ·
[hjemmesidehelten.no](https://www.hjemmesidehelten.no/nettside-bedrift/) ·
[godtlikt.no/pris-nettside](https://www.godtlikt.no/pris-nettside) ·
[acendia.no](https://acendia.no/) ·
[websett.no](https://websett.no/) ·
[raskweb.no](https://raskweb.no/) ·
[uniweb.no/priser](https://www.uniweb.no/priser/) ·
[mosswebdesign.no](https://mosswebdesign.no/) ·
[webpack.no](https://www.webpack.no/nettside-nettbutikk-epost-pakker-priser.html) ·
[webagent.no: prisguide](https://webagent.no/blog/hva-koster-nettside-2026) ·
[nettify.no](https://nettify.no/) ·
[webaas.no/nettside-pris](https://webaas.no/nettside-pris/) ·
[snekkenesdesign.no](https://www.snekkenesdesign.no/) ·
[nordvikmedia.no](https://nordvikmedia.no/tjenester/webdesign-byra-oslo) ·
[oppskalert.no](https://oppskalert.no/) ·
[haandverkerpakken.no](https://www.haandverkerpakken.no/) ·
[mementor.no](https://mementor.no/tjenester/webdesign/) ·
[skaatunweb.no](https://skaatunweb.no/) ·
[frontcode.no/nettside-pris](https://www.frontcode.no/nettside-pris) ·
[devai.no](https://devai.no/byer/webbyra-oslo) ·
[visionmedia.no](https://visionmedia.no/tjenester/webbyra-oslo) ·
[kodemagisk.no](https://kodemagisk.no/) ·
[tek365.no](https://tek365.no/lage-nettside-oslo-2/) ·
[nettsmed.no](https://nettsmed.no/nettside-pris-2026/) ·
[box.no](https://box.no/innsikt/pris-hjemmeside) ·
[elevera.no](https://elevera.no/blogg/nettside-bedrift-pris) ·
[digitalspor.no](https://digitalspor.no/innsikt/hva-koster-en-nettside) ·
[innovena.no: prisartikkel](https://www.innovena.no/artikler/nettside/hvor-mye-koster-en-nettside/) ·
[webmestern.no](https://webmestern.no/)
