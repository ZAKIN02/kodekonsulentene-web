# Tekstmanus – retning B «Verkstedet om natta»

Oppdrag f1-tekst-retninger, 2026-10-08. Dekker første skjerm (setningen og scenen), og neste seksjon (sjekken) for prototypen `/retning/b`.
Stemme: «jeg» (avgjort av eier). Skills lastet: `kodekonsulentene-tekst`, `ux-copy`.
Kilder: `src/pages/index.astro`, `src/data/{bevis,priser,firma}.ts`, `docs/design/retning.md`, briefen del 6 og 8.
Menyen beholder dagens punkter fra `src/data/navigasjon.ts` og omfattes ikke av dette manuset.

## Title, meta description og H1

| Felt | Dagens verdi | Ny verdi |
|---|---|---|
| Title | KodeKonsulentene – nettsider og systemer i Oslo | Beholdes uendret. |
| Meta description | For norske småbedrifter som har vokst ut av Wix-siden: nettsider og systemer som henger sammen med booking, Vipps og regnskap – sikkert, raskt og til fast pris. | Beholdes uendret. Den beskriver fortsatt siden presist og har søkeordene. |
| H1 | Nettsider og systemer som jobber for bedriften din (ordet «systemer» i aksentfarge) | Slik ser en nettside ut innvendig |

Om H1-ordlyden: setningen er den eneste teksten på første skjerm og settes i sjablongskrift. Den må være kort nok for 2–3 linjer på mobil, og den skal forklare filmen under, ikke konkurrere med den. «Slik ser en nettside ut innvendig» (33 tegn) peker rett inn i scenen og bruker kundens språk. Lengre kandidater («Jeg tar nettsiden din fra hverandre og setter den sammen riktig») ble for lange for sjablongskriften på mobil.

## Tekstelementer i rekkefølge

### Første skjerm: setningen og scenen

Komponent `<Scene>` med `prioritet` (posterbildet er LCP), `hoppTil="sjekk"`.

| Id | Tekst | Kilde |
|---|---|---|
| hero.overskrift | Slik ser en nettside ut innvendig | ny |
| scene.etikett (aria-label) | Nettsiden tatt fra hverandre og satt sammen igjen | ny |
| scene.hopplenke | Hopp over animasjonen | ny |
| scene.steg1.tittel | Fire lag og fem kabler | ny |
| scene.steg1.tekst | Utenpå ser alt greit ut. Rotet ligger inni. | ny |
| scene.steg2.tittel | Hvert lag løftes ut | ny |
| scene.steg2.tekst | Design, kode, sikkerhet og integrasjoner – hver del får navn og mål. | ny |
| scene.steg3.tittel | Hver del får en jobb | ny |
| scene.steg3.tekst | Siden skal laste raskt, være trygg å betale på, og booking skal snakke med regnskapet. | ny |
| scene.steg4.tittel | Så settes alt sammen | ny |
| scene.steg4.tekst | Ett system som henger sammen. Når delene passer, slutter du å være limet. | ny |
| scene.kolofon (bildetekst under scenen) | Illustrasjon laget med KI | ny (påbudt av briefen del 6, punkt 12) |
| reel.knapp | Spill av filmen | ny |
| reel.innhold | [MANGLER: skjermopptak fra eier til reelen – 20–30 sekunder klippet sammen med scenene] | – |

### Sjekken (neste seksjon, anker `#sjekk`)

| Id | Tekst | Kilde |
|---|---|---|
| sjekk.tittel | Sjekk nettsiden din gratis | dagens side |
| sjekk.ingress | 78 % av nordmenn undersøker om en nettside er trygg før de bruker den (NorSIS og Opinion, juni 2024). Skriv inn adressen, så ser du hva de finner på din. | dagens side |
| sjekk.felt.ledetekst (skjult for øyet, leses av skjermleser) | Nettadresse | dagens side |
| sjekk.felt.plasshold | dinbedrift.no | dagens side |
| sjekk.felt.hint | Rapport på 30 sekunder: cookies, sikkerhet, fart og org.nr. Ingen innlogging. | dagens side |
| sjekk.felt.feil | Det ser ikke ut som en nettadresse. Prøv formen dinbedrift.no. | ny |
| sjekk.knapp | Sjekk nettsiden min | ny |
| sjekk.booklenke | Eller book 20 minutter | dagens side |

## Alt-tekster og KI-merking

- Scenens posterbilde ligger i en flate med `aria-hidden="true"` og har tom alt-tekst (`alt=""`), slik referansekoden i briefen del 8 krever. Stegteksten står på tekstplater i benk-fargen og leses som vanlig tekst uten JavaScript – all tekst over video ligger på plate, aldri i filmen.
- «Illustrasjon laget med KI» står som bildetekst rett under scenen (id `scene.kolofon` over). Reelen består av ekte skjermopptak og scener; KI-delene dekkes av samme merking.
- Det finnes ingen ekte fotografier i de to seksjonene dette manuset dekker. Portrett og appopptak hører til seksjoner lenger ned og er fortsatt [MANGLER: portrett av eier] og [MANGLER: skjermopptak av appene].

## Fjernet fordi det sto flere ganger

1. Prototype-løftet sto tre ganger (hero, prosess-ingress, prosess-steg 2). Det står ikke i disse seksjonene; i retning B hører det hjemme i garantifeltet lenger ned, én gang.
2. Mva-setningen sto fire ganger på forsiden. Den står ikke i disse seksjonene; den hører hjemme i prislista, én gang.
3. URL-sjekken sto to ganger (hero og seksjon 05). I B står feltet bare i sjekkseksjonen rett etter scenen – første skjerm har bare setningen og filmen.
4. NorSIS-tallene sto to ganger (åpningsoverlegg og seksjon 05). Åpningsoverlegget fjernes; 78-prosenttallet står nå bare i sjekkens ingress. 59-prosenttallet er tatt helt ut av disse seksjonene – ett tall bærer poenget.
5. Prisankeret i heroen (tre priser pluss «Hele prislisten») og mva-linjen er fjernet fra første skjerm; prisene hører hjemme i prislista.
6. Terminalen, «Skriv inn adressen, så kjører sjekken i terminalen her …» og hero-live-teksten er tatt ut; terminalen beholdes som skjult ekstra.
7. Dagens hint «Gratis. Rapport på 30 sekunder. Ingen innlogging.» og «Gratis sjekk av siden du har i dag. Svar på 30 sekunder.» sa det samme to steder; «gratis» står nå bare i tittelen og «30 sekunder» bare i hintet.
