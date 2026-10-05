# Prisliste

**Sannheten står i `src/data/priser.ts`.** Dette dokumentet forklarer hvorfor prisene
er som de er. Endrer du en pris, endrer du den i koden – nettsiden, tilbudsmalen og
`kodekonsulentene-tilbud`-skillen leser derfra.

Alle priser er eks. mva.

## Pakker

| Pakke | Pris | For hvem |
|---|---|---|
| Start | 14 900 kr | Trenger å finnes, bli ringt og bestå lovkravene |
| Bedrift | 29 900 kr | Skal rangere lokalt og endre teksten selv |
| System | fra 60 000 kr | Trenger booking, betaling og regnskap som henger sammen |

## Løpende

| | Pris | Binding |
|---|---|---|
| Abonnement | 1 290–1 990 kr/mnd | 12 mnd |
| Drift og vedlikehold | 590–1 490 kr/mnd | Ingen |
| Lovsjekk-pakke | 7 900 kr | Engangs |
| Timepris | 950 kr/t | – |

## Hvorfor disse tallene

Markedet er priset i tre lag:

1. **Abonnement uten oppstartskostnad, 399–1 740 kr/mnd.** Malbasert, levert raskt, lite skreddersøm.
2. **Fastpris-frilansere og små byråer.** En norsk leverandør oppgir median 35 000 kr og snitt 42 800 kr på 50 prosjekter i 2025.
3. **Byråer: 80 000–200 000 kr** for en standard bedriftsside, webapplikasjoner fra 250 000 kr.

Hullet ligger mellom lag 1 og lag 3: **systemer og integrasjoner til SMB-pris.**
Det er der KodeKonsulentene ligger.

Timepriser i markedet: norske byråer tar typisk 900–1 800 kr/t, frilansere 600–1 200 kr/t.
950 kr/t er realistisk i starten og lar seg heve når casene finnes.

> **Forbehold om tallene.** Prisdataene over er hentet fra leverandørenes egne nettsider
> høsten 2026. De har kommersielle interesser og bruker ulike definisjoner av «enkel
> nettside» – spennet går fra 9 990 kr til 80 000 kr for det samme ordet. Bruk dem som
> markedssignal, ikke som fasit. Mediantallet bygger på én leverandørs eget utvalg.

## Prinsipper

- **Prisene står åpent på nettsiden.** Norske konkurrenter på SMB-nivå gjør det. Uten priser blir du sammenlignet med dem som har dem, og taper sammenligningen uten å være til stede.
- **Ikke konkurrer på pris mot 499 kr/mnd.** Du taper, og du tiltrekker kunder som bytter neste år. Legg deg høyere og forsvar det med systemer og sikkerhet.
- **Abonnement krever binding.** Byggekostnaden ligger i de første månedene. Si det tydelig i stedet for å skjule det.
- **Hev aldri prisen for en kunde midt i et oppdrag.** Hev den for neste kunde.
- **For lav startpris er en felle.** Den tiltrekker feil kunder og gjør det vanskelig å heve senere.

## Mva

Som ENK må du registrere deg i Merverdiavgiftsregisteret når omsetningen passerer
**50 000 kr i løpet av 12 måneder**. Vis priser «eks. mva» konsekvent fra dag én, så
slipper du å endre alle tall den dagen du passerer grensen. Når du er registrert, skal
«MVA» stå etter org.nr. i footeren – sett `mva: true` i `src/data/firma.ts`.
