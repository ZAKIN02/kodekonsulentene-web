---
name: kodekonsulentene-nettsidesjekk
description: Bruk når du skal kjøre nettsidesjekken mot en nettside, tolke rapporten, eller skrive en kald e-post med funnene. Dekker både verktøyet på /sjekk og oppfølgingen etterpå.
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

## Kald e-post med funnene

Verdi først. Under 120 ord. Mønster:

> Emne: Tre ting jeg fant på [domene]
>
> Hei [navn],
>
> Jeg kjørte en rask sjekk av [domene] og fant tre ting du antagelig vil vite om:
> [funn 1 i klartekst]. [funn 2]. [funn 3].
>
> Det første bryter ekomloven § 3-15, som har gjeldt siden 1. januar 2025.
> De to andre koster deg antagelig kunder på mobil.
>
> Hele rapporten ligger vedlagt. Vil du at jeg fikser det, tar det en ettermiddag
> og koster [lovsjekk-prisen fra src/data/priser.ts] eks. mva. Vil du ikke, er
> rapporten din uansett – den sier hva som må gjøres.
>
> [navn]
> Svar «nei takk», så hører du ikke fra meg igjen.

Regler: aldri overdriv funnene, aldri påstå noe sjekken ikke målte, alltid avmelding.
Se `kodekonsulentene-tekst` for stemmen og `kodekonsulentene-lovsjekk` for paragrafene.

## Når du endrer motoren

Legg til en test i `test/sjekk.test.ts` i samme omgang. Rekkefølgen på radene,
forbeholdene og «Ikke sjekket» i stedet for falsk «Bestått» er dekket av tester
fordi det er de tre tingene som gjør verktøyet til noe annet enn markedsføring.
