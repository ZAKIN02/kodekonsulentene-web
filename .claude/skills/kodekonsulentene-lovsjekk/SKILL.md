---
name: kodekonsulentene-lovsjekk
description: Bruk når du skal vurdere om en norsk nettside oppfyller lovkravene – org.nr., ehandelsloven § 8, cookie-samtykke etter ekomloven § 3-15 og universell utforming etter WCAG. Gir sjekkliste og rapportmal for lovsjekk-pakken.
---

# Lovsjekk av norsk nettside

Fire krav som er konkrete, testbare og som svært mange småbedriftssider bryter minst
ett av. Det er derfor dette selger: det er ikke en smakssak.

**Dette er ikke juridisk rådgivning.** Rapporten skal si det selv, hver gang.

## 1. Foretaksnavn og organisasjonsnummer

- Registrert foretaksnavn og org.nr. skal stå på nettsiden.
- Er foretaket mva-registrert, skal «MVA» stå etter nummeret.
- Mva-registrering er påkrevd når omsetningen passerer 50 000 kr i løpet av 12 måneder.
- **Test:** søk i sidekilden etter ni siffer og kjør mod 11-kontroll. `erGyldigOrgnr()` i `src/lib/sjekk.ts` gjør dette, og luker ut telefonnumre som ligner.

## 2. Kontaktinformasjon (ehandelsloven § 8)

Skal være lett tilgjengelig, direkte og vedvarende:

- geografisk adresse (ikke bare postboks)
- e-postadresse
- et nummer eller en kanal kunden faktisk når deg på

Et kontaktskjema alene er **ikke** nok. Dette er det vanligste avviket etter org.nr.

## 3. Cookie-samtykke (ekomloven § 3-15)

Fra 1. januar 2025 må samtykke oppfylle GDPR-kravene:

- ingen forhåndsavkryssede valg
- «avvis» skal være like lett tilgjengelig som «godta» – samme nivå, samme synlighet
- ingen sporing før samtykke er gitt
- samtykket skal kunne trekkes tilbake like enkelt

**Den enkleste måten å overholde kravet er å ikke sette cookies.** Cookieløs analyse
(Plausible, eller PostHog uten cookies) fjerner hele problemet og banneret med det.
Det er også det KodeKonsulentene selger videre.

**Test:** last forsiden med tom nettleserprofil og se hva som settes før du har klikket
på noe. `analyserCookies()` i `src/lib/sjekk.ts` gjør et nedre anslag ut fra
svarheadere og kjente sporerskript.

## 4. Universell utforming

- **Private virksomheter:** 35 krav i WCAG 2.0 nivå A og AA.
- **Offentlig sektor:** 48 krav i WCAG 2.1.
- KodeKonsulentene bygger etter **WCAG 2.2 AA**, som dekker begge, og kan derfor love «UU-sikker» til kunder som leverer til det offentlige.

Maskinelt testbart fra HTML alene (ca. en tredjedel av kravene):
`lang` på `<html>`, `<title>`, alt-tekst på bilder, ledetekst på skjemafelt, én `h1`,
lenker med tekst, ingen `user-scalable=no`.

Må testes manuelt: kontrast, tastaturnavigasjon, skjermleserflyt, fokusrekkefølge,
tidsbegrensninger. **Rapporten skal si eksplisitt at disse ikke er vurdert.**

EUs tilgjengelighetsdirektiv kan utvide kravene for enkelte private tjenester
(nettbutikk, bank, billettsalg). Sjekk hos uutilsynet før du lover en kunde noe om det.

## Rapportmal

Fem rader, i denne rekkefølgen – samme rekkefølge som nettsidesjekken og
e-postversjonen, hver gang:

| Punkt | Status | Verdi | Hva det betyr |
|---|---|---|---|
| Ytelse | Bestått / Bør fikses / Brudd | Lighthouse-score | én setning |
| Sikkerhetsheadere | … | n/6 | én setning |
| Cookies før samtykke | … | antall | én setning med paragrafhenvisning |
| Universell utforming | … | antall feil | én setning |
| Lovpålagt informasjon | … | org.nr. funnet ja/nei | én setning |

«Hva det betyr» skrives for bedriften, ikke for utvikleren:
«3 cookies settes før samtykke. Det bryter ekomloven § 3-15.» – ikke «manglende CMP».

Avslutt alltid med forbeholdene fra `byggRapport()` i `src/lib/sjekk.ts`.

## Pris

Lovsjekk-pakken står i `src/data/priser.ts` (`loepende`). Den dekker revisjon og
utbedring til fast pris, også på WordPress-sider. Kunden trenger ikke ny nettside
for å bli lovlig – si det, selv når det betyr et mindre salg.
