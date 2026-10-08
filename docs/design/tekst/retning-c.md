# Tekstmanus – retning C «Prislista»

Oppdrag f1-tekst-retninger, 2026-10-08. Dekker første skjerm (pris og pakkevalg), neste seksjon (hva som er med, og vilkårene) og scenen for prototypen `/retning/c`. Rekkefølgen følger retningsplanen: scenen kommer først etter prislista.
Stemme: «jeg» (avgjort av eier). Skills lastet: `kodekonsulentene-tekst`, `ux-copy`.
Alle beløp er lest fra `src/data/priser.ts` 2026-10-08: Start 14 900 kr, Bedrift 29 900 kr, System fra 60 000 kr, Lovsjekk-pakke 7 900 kr, Timepris 950 kr/t.
Menyen beholder dagens punkter fra `src/data/navigasjon.ts` og omfattes ikke av dette manuset.

## Title, meta description og H1

| Felt | Dagens verdi | Ny verdi |
|---|---|---|
| Title | KodeKonsulentene – nettsider og systemer i Oslo | Beholdes uendret. |
| Meta description | For norske småbedrifter som har vokst ut av Wix-siden: nettsider og systemer som henger sammen med booking, Vipps og regnskap – sikkert, raskt og til fast pris. | Nettside til fast pris: 14 900 kr, endelig pris. Du ser en klikkbar prototype før du betaler. Nettsider og systemer for norske småbedrifter i Oslo. |
| H1 | Nettsider og systemer som jobber for bedriften din (ordet «systemer» i aksentfarge) | Nettside 14 900 kr. Du ser den før du betaler. |

Om H1: ordlyden er fastsatt i briefen del 6 (retning C), med prisen lest fra `priser.ts`. Tallet i H1 byttes når besøkende velger pakke; uten JavaScript viser overskriften Start-prisen. «System» viser prefikset «fra» foran beløpet.

## Tekstelementer i rekkefølge

### Første skjerm

| Id | Tekst | Kilde |
|---|---|---|
| hero.overskrift | Nettside 14 900 kr. Du ser den før du betaler. | eier (briefen del 6) + `priser.ts` |
| hero.prisenhet (liten linje rett under overskriften) | Endelig pris – foretaket er ikke mva-registrert, så det kommer ingen mva på toppen. | dagens side (`priser.ts`) |
| hero.velger.ledetekst (gruppeetikett for radioknappene) | Velg pakke | ny |
| hero.velger.start | Start — 14 900 kr — 1–3 sider, skrevet ferdig | dagens side (`priser.ts`) |
| hero.velger.bedrift | Bedrift — 29 900 kr — 5–8 sider med CMS du redigerer selv | dagens side (`priser.ts`) |
| hero.velger.system | System — fra 60 000 kr — booking, kundeportal eller intern app | dagens side (`priser.ts`) |
| hero.knapp | Book 20 minutter | dagens side |
| hero.sjekklenke | Eller sjekk nettsiden din gratis | dagens side |

### Hva som er med (neste seksjon, anker `#med`)

Prislista her gjentar ikke beløpene fra første skjerm. Den viser hva hver pakke inneholder, og vilkårene. Punktlistene er ordrett fra `priser.ts`.

| Id | Tekst | Kilde |
|---|---|---|
| med.tittel | Det som er med i prisen | ny |
| med.start.tittel | Start | dagens side |
| med.start.punkter | 1–3 sider, skrevet ferdig · Booking eller kontaktskjema · Grunnleggende SEO og Google Bedriftsprofil · Lovsjekk: org.nr., cookies, universell utforming · Du eier koden og domenet | dagens side (`priser.ts`) |
| med.start.ikke | Ikke med: CMS – jeg endrer teksten for deg · Lokal SEO per bydel | dagens side (`priser.ts`, «vi» endret til «jeg») |
| med.bedrift.tittel | Bedrift | dagens side |
| med.bedrift.punkter | 5–8 sider med CMS du kan redigere selv · Lokal SEO per tjeneste og bydel · Cookieløs analyse – ingen banner · Lovsjekk og sikkerhetsheadere · To revisjonsrunder · Du eier koden og domenet | dagens side (`priser.ts`) |
| med.system.tittel | System | dagens side |
| med.system.punkter | Booking, kundeportal eller intern app · Vipps- eller Stripe-betaling · Integrasjon mot Tripletex, Fiken eller PowerOffice · BankID-innlogging ved behov · Sikkerhetsgjennomgang før lansering · Du eier koden og databasen | dagens side (`priser.ts`) |
| med.vilkaar.1 | 40 % faktureres ved oppstart, resten ved lansering. | dagens side (`priser.ts`) |
| med.vilkaar.2 | To revisjonsrunder er inkludert. Flere runder er timepris, 950 kr/t. | dagens side (`priser.ts`) |
| med.vilkaar.3 | Du eier koden, innholdet og domenet – også hvis du sier opp. | dagens side (`priser.ts`) |

### Scenen (etter prislista)

Komponent `<Scene>`, `hoppTil="arbeid"` (antakelse: neste seksjon er casene – `bygger` setter riktig anker). Scenen stopper ved pakken som er valgt på første skjerm.

| Id | Tekst | Kilde |
|---|---|---|
| scene.etikett (aria-label) | Det jeg bygger i hver pakke | ny |
| scene.hopplenke | Hopp over animasjonen | ny |
| scene.steg1.tittel | Hver pakke er samme bygg | ny |
| scene.steg1.tekst | Design, kode, sikkerhet og integrasjoner. Spørsmålet er hvor mye du trenger. | ny |
| scene.steg2.tittel | Start | dagens side |
| scene.steg2.tekst | De to første lagene: en side som står støtt og består lovkravene. | ny |
| scene.steg3.tittel | Bedrift | dagens side |
| scene.steg3.tekst | Flere rom: tekster du endrer selv, kunder som finner deg i nabolaget, og analyse uten cookie-banner. | ny |
| scene.steg4.tittel | System | dagens side |
| scene.steg4.tekst | Hele bygget: booking, Vipps-betaling og kobling rett inn i regnskapet. | ny |
| scene.kolofon (bildetekst under scenen) | Illustrasjon laget med KI | ny (påbudt av briefen del 6, punkt 12) |

## Alt-tekster og KI-merking

- Første skjerm har med vilje ingen bilder – det er retningens poeng. Ingen alt-tekster trengs der.
- Scenens posterbilde ligger i en flate med `aria-hidden="true"` og har tom alt-tekst (`alt=""`), slik referansekoden i briefen del 8 krever. Stegteksten leses som vanlig tekst uten JavaScript.
- «Illustrasjon laget med KI» står som bildetekst rett under scenen (id `scene.kolofon` over).
- Casene i C vises som stillbilder lenger ned og er [MANGLER: skjermbilder av appene]. Portrett er fortsatt [MANGLER: portrett av eier]. Ingen av delene står i seksjonene dette manuset dekker.

## Fjernet fordi det sto flere ganger

1. Prisene sto to steder i første utkast av retningen (første skjerm og prisliste). Beløpene står nå bare på første skjerm; prislista under viser bare innhold og vilkår.
2. Mva-setningen sto fire ganger på forsiden, og `prisvilkaar` i `priser.ts` har den som første punkt. Den står nå bare som `hero.prisenhet` rett under prisen; vilkårslista i seksjonen under begynner derfor på punkt to.
3. Prototype-løftet sto tre ganger (hero, prosess-ingress, prosess-steg 2). I C bærer H1 («Du ser den før du betaler») løftet alene, og garantifeltet fra retning A utgår.
4. «To revisjonsrunder» sto både i Bedrift-pakkens punktliste og i vilkårene. Begge beholdes fordi de svarer på to ulike spørsmål (hva som er med i pakken, og hva som gjelder alle kjøp) – men vilkårspunktet har fått timeprisen, så timepris-raden fra `loepende` ikke må gjentas som egen linje.
5. Terminalen, hero-live-teksten, prisankeret og URL-feltet fra dagens hero er tatt ut av første skjerm; sjekken er en lenke, ikke et felt.
6. NorSIS-tallene og de fire nøkkeltallene står ikke i disse seksjonene; de kan stå ett sted lenger ned på siden.
