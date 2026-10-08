# Tekstmanus – retning A «Befaring»

Oppdrag f1-tekst-retninger, 2026-10-08. Dekker første skjerm, scenen og neste seksjon (rapporten) for prototypen `/retning/a`.
Stemme: «jeg» (avgjort av eier). Skills lastet: `kodekonsulentene-tekst`, `ux-copy`.
Kilder: `src/pages/index.astro`, `src/data/{bevis,priser,firma}.ts`, `docs/design/retning.md`, briefen del 6 og 8.
Menyen beholder dagens punkter fra `src/data/navigasjon.ts` og omfattes ikke av dette manuset.

## Title, meta description og H1

| Felt | Dagens verdi | Ny verdi |
|---|---|---|
| Title | KodeKonsulentene – nettsider og systemer i Oslo | Beholdes uendret. Søkeordene nettsider, systemer og Oslo står. |
| Meta description | For norske småbedrifter som har vokst ut av Wix-siden: nettsider og systemer som henger sammen med booking, Vipps og regnskap – sikkert, raskt og til fast pris. | Gratis befaring av nettsiden din: rapport på 30 sekunder. Nettsider og systemer for norske småbedrifter i Oslo, til fast pris. |
| H1 | Nettsider og systemer som jobber for bedriften din (ordet «systemer» i aksentfarge) | Gratis befaring av nettsiden din |

Om H1-ordlyden: jeg prøvde «Jeg befarer nettsiden din gratis» og «Få nettsiden din befart». Begge setter handlingen foran tilbudet. «Gratis befaring av nettsiden din» leder med det kunden får, bruker et ord fra kundens eget fag, og «gratis» står først der blikket lander. Den beholdes som briefen foreslår.

## Tekstelementer i rekkefølge

### Første skjerm

| Id | Tekst | Kilde |
|---|---|---|
| hero.overskrift | Gratis befaring av nettsiden din | ny |
| hero.ingress | Rapport på 30 sekunder: cookies, sikkerhet, fart og om org.nr. står på siden. | dagens side |
| hero.felt.ledetekst (skjult for øyet, leses av skjermleser) | Nettadresse | dagens side |
| hero.felt.plasshold | dinbedrift.no | dagens side |
| hero.felt.hint | Ingen innlogging. Du velger selv om rapporten skal sendes på e-post. | dagens side |
| hero.felt.feil | Det ser ikke ut som en nettadresse. Prøv formen dinbedrift.no. | ny |
| hero.knapp | Start befaringen | ny |
| hero.booklenke | Eller book 20 minutter | dagens side |

### Scenen

Komponent `<Scene>`, `hoppTil="rapport"`.

| Id | Tekst | Kilde |
|---|---|---|
| scene.etikett (aria-label) | Slik befarer jeg en nettside | ny |
| scene.hopplenke | Hopp over animasjonen | ny |
| scene.steg1.tittel | Dette er nettsiden din | ny |
| scene.steg1.tekst | Fire lag og fem kabler. Utenfra ser du bare det øverste laget. | ny |
| scene.steg2.tittel | Jeg tar den fra hverandre | ny |
| scene.steg2.tekst | Lag for lag: design, kode, sikkerhet og integrasjoner. | ny |
| scene.steg3.tittel | Hvert lag blir målt | ny |
| scene.steg3.tekst | Laster siden raskt? Er den trygg? Henger booking, betaling og regnskap sammen? | ny |
| scene.steg4.tittel | Alt settes sammen igjen | ny |
| scene.steg4.tekst | Du får rapporten under – med det som er i orden, og det som mangler. | ny |
| scene.kolofon (bildetekst under scenen) | Illustrasjon laget med KI | ny (påbudt av briefen del 6, punkt 12) |

### Rapporten (neste seksjon, anker `#rapport`)

| Id | Tekst | Kilde |
|---|---|---|
| rapport.tittel | Befaringsrapport | ny |
| rapport.emne (forhåndsutfylt adresselinje i skjemaet) | kodekonsulentene.no | ny |
| rapport.ingress | Forhåndsutfylt for min egen side. Kjører du befaringen øverst, fylles den ut for din – linje for linje. | ny |
| rapport.status (vises mens sjekken kjører) | Befaringen pågår. Rapporten fylles ut linje for linje. | ny |
| rapport.rad.cookies | Cookies før samtykke — 0 | dagens side (`bevis.ts`) |
| rapport.rad.headere | Sikkerhetsheadere — 6 av 6 | dagens side (`bevis.ts`) |
| rapport.rad.svartid | Svartid, målt fra Oslo — 0,1 s | dagens side (`bevis.ts`) |
| rapport.rad.orgnr | Org.nr. på siden — Funnet | dagens side (står i footeren) |
| rapport.rad.ytelse | Ytelse — [MANGLER: målt ytelsestall for kodekonsulentene.no; revisor må måle før raden kan stå] | – |
| rapport.mangelord (merkelappen på overstrøkne rader når besøkendes sjekk finner feil) | Mangler | dagens side (begrep fra `/sjekk`) |
| rapport.fastpris | Fast pris på utbedring: 7 900 kr, endelig pris. Dekker cookie-samtykke, universell utforming, org.nr. og personvernerklæring. | dagens side (`priser.ts`, Lovsjekk-pakke) |
| rapport.knapp | Book 20 minutter | dagens side |

## Alt-tekster og KI-merking

- Scenens posterbilde ligger i en flate med `aria-hidden="true"` og har tom alt-tekst (`alt=""`), slik referansekoden i briefen del 8 krever. Innholdet bæres av stegteksten, som leses som vanlig tekst uten JavaScript.
- «Illustrasjon laget med KI» står som bildetekst rett under scenen (id `scene.kolofon` over).
- Det finnes ingen ekte fotografier eller skjermbilder i de tre seksjonene dette manuset dekker. Portrett og appopptak hører til seksjoner lenger ned og er fortsatt [MANGLER: portrett av eier] og [MANGLER: skjermopptak av appene].

## Fjernet fordi det sto flere ganger

1. Prototype-løftet sto tre ganger (hero, prosess-ingress, prosess-steg 2). Det står ikke i disse seksjonene; i retning A hører det hjemme i garantifeltet lenger ned, én gang.
2. Mva-setningen sto fire ganger på forsiden. Her står bare enheten «endelig pris» i rapportens fastprislinje; hele setningen hører hjemme i prislista, én gang.
3. URL-sjekken sto to ganger (hero og seksjon 05). Nå står feltet bare i heroen; rapporten er resultatet av sjekken, ikke et nytt felt.
4. Prisankeret i heroen (tre priser pluss «Hele prislisten») er fjernet fra første skjerm; prisene hører hjemme i prislista.
5. Terminalen, «Skriv inn adressen, så kjører sjekken i terminalen her …» og hero-live-teksten er tatt ut av første skjerm; terminalen beholdes som skjult ekstra.
6. De fire nøkkeltallene sto som egen bevisstripe og på /om. Tre av dem (0 cookies, 6 av 6 headere, 0,1 s) står nå som målte rader i rapporten – ett sted. «24 t svar» er ikke med i disse seksjonene.
7. NorSIS-tallene sto to ganger (åpningsoverlegg og seksjon 05). Åpningsoverlegget fjernes i alle retninger; tallene er ikke brukt i disse seksjonene og kan stå ett sted lenger ned.
