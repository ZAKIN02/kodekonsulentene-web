---
name: kodekonsulentene-nettsidesjekk
description: Bruk når du skal kjøre nettsidesjekken mot en nettside, tolke rapporten, eller følge opp funnene. Dekker verktøyet på /sjekk, hvordan funnene formuleres for en bedriftseier, og når det er lov å ta kontakt på e-post (markedsføringsloven § 15 – et enkeltpersonforetak er en fysisk person).
---

# Nettsidesjekken

Sidens viktigste salgsargument og leadmagnet. Motoren er `src/lib/sjekk.ts`,
endepunktet `src/pages/api/sjekk.ts`, siden `src/pages/sjekk.astro`.

## Kjør den

```bash
# lokalt
npm run dev
curl -s -X POST http://localhost:4321/api/sjekk \
  -H 'content-type: application/json' \
  -d '{"url":"dinbedrift.no"}' | jq

# i drift
curl -s "https://kodekonsulentene.no/api/sjekk?url=dinbedrift.no" | jq
```

Legg til `"epost"` i kroppen for å få rapporten sendt (krever `RESEND_API_KEY`).

## De fem radene – alltid i denne rekkefølgen

1. **Ytelse** – Lighthouse mobil via PageSpeed. Uten `PAGESPEED_API_KEY` blir status «Ikke sjekket», og rapporten sier det.
2. **Sikkerhetsheadere** – n av 6.
3. **Cookies før samtykke** – antall, med henvisning til ekomloven § 3-15.
4. **Universell utforming** – maskinelt testbare WCAG-feil.
5. **Lovpålagt informasjon** – org.nr. funnet eller ikke.

Rekkefølgen er lik på siden, i e-posten og i den skrevne rapporten. `test/sjekk.test.ts`
feiler hvis noen endrer den.

## Æresregelen

**Verktøyet skal aldri påstå mer enn det har målt.** Det som ikke er sjekket, får status
«Ikke sjekket» og en setning om hvorfor. En falsk «Bestått» er verre enn ingen sjekk –
det er hele grunnlaget for å selge dette.

Det sjekken ikke ser, og som alltid står i forbeholdene:

- JavaScript kjøres ikke, så cookies satt etter innlasting telles ikke. Tallet er et minimum.
- Kontrast, tastaturnavigasjon og skjermleserflyt kan ikke måles maskinelt.
- Bare forsiden hentes, ikke hele nettstedet.
- Det er ikke juridisk rådgivning.

## Tolk rapporten

Oversett alltid til konsekvens for bedriften, ikke for utvikleren:

| Funn | Si dette | Ikke dette |
|---|---|---|
| 3 cookies før samtykke | «Google Analytics laster før noen har sagt ja. Det bryter ekomloven § 3-15.» | «Manglende CMP-integrasjon» |
| Ytelse 54 | «Besøkende på mobil venter over tre sekunder før de ser noe. Google ser det samme.» | «LCP er 3,4 s» |
| Org.nr. mangler | «Det er det første en kunde ser etter når de skal sjekke om du er et ekte foretak.» | «Brudd på foretaksregisterloven» |
| 2/6 headere | «Siden kan misbrukes til å lure dine egne kunder.» | «CSP og HSTS ikke satt» |

## Oppfølging med funnene

### Først: har du lov til å sende e-posten?

Markedsføringsloven § 15 forbyr markedsføring på e-post til **fysiske personer**
uten forhåndssamtykke. Juridiske personer (AS, kommuner, foreninger) kan kontaktes
på generiske adresser.

Fellen i vår målgruppe: **et enkeltpersonforetak er en fysisk person.** Det er den
vanligste selskapsformen blant håndverkere og små klinikker, altså nettopp dem vi
retter oss mot. En e-post til `ola@olasrorlegger.no` der Ola driver ENK, er
markedsføring til en fysisk person.

Sjekk selskapsformen før du sender. Enhetsregisteret er åpent og gratis:

```
https://data.brreg.no/enhetsregisteret/api/enheter?navn=<firmanavn>
```

Feltet `organisasjonsform.kode` gir `ENK`, `AS`, `ANS` og så videre.

| Mottaker | Adresse | Lov å sende kaldt? |
|---|---|---|
| AS, kommune, forening | `post@`, `firmapost@`, `kontakt@` | Ja |
| AS, kommune, forening | `fornavn@` | Nei uten samtykke – personlig adresse |
| **Enkeltpersonforetak** | **enhver adresse** | **Nei uten samtykke** |
| Hvem som helst | de ba selv om rapporten | Ja – det er samtykket |

Er du i tvil, ikke send. Dette er ikke juridisk rådgivning.

### Den trygge veien: la dem be om rapporten

Verktøyet på `/sjekk` er bygget for dette. Brukeren skriver inn adressen sin og
ber selv om rapporten på e-post. Da er samtykket gitt, det er dokumentert, og
oppfølging er uproblematisk. Legg kruttet i å få folk til verktøyet – ikke i å
sende e-post til folk som ikke har spurt.

Lovlige veier til oppmerksomhet: LinkedIn-innlegg med funn fra egne skanninger
(aggregert, aldri navngitt), innlegg i bransjegrupper, partnerskap med
regnskapsførere som har kunderelasjonen fra før, og telefon – som § 15 ikke
regulerer på samme måte, men der Reservasjonsregisteret gjelder.

### Når du først har lov: malen

Verdi først. Under 120 ord.

> Emne: Tre ting vi fant på [domene]
>
> Hei,
>
> Vi kjørte en rask sjekk av [domene] og fant tre ting dere antagelig vil vite om:
> [funn 1 i klartekst]. [funn 2]. [funn 3].
>
> Det første bryter ekomloven § 3-15, som har gjeldt siden 1. januar 2025.
> De to andre koster dere antagelig kunder på mobil.
>
> Hele rapporten ligger vedlagt. Vil dere at vi fikser det, koster det
> [lovsjekk-prisen fra src/data/priser.ts] eks. mva. Vil dere ikke, er rapporten
> deres uansett – den sier hva som må gjøres.
>
> KodeKonsulentene
> Svar «nei takk», så hører dere ikke fra oss igjen.

Regler: aldri overdriv funnene, aldri påstå noe sjekken ikke målte, alltid avmelding,
og aldri send til en ENK uten samtykke. Se `kodekonsulentene-tekst` for stemmen og
`kodekonsulentene-lovsjekk` for paragrafene.

## Når du endrer motoren

Legg til en test i `test/sjekk.test.ts` i samme omgang. Rekkefølgen på radene,
forbeholdene og «Ikke sjekket» i stedet for falsk «Bestått» er dekket av tester
fordi det er de tre tingene som gjør verktøyet til noe annet enn markedsføring.
