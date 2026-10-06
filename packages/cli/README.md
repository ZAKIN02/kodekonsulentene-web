# kodekonsulentene

Sjekk en norsk nettside fra terminalen: cookies før samtykke, sikkerhetsheadere,
universell utforming, organisasjonsnummer og e-postsikkerhet.

```bash
npx kodekonsulentene sjekk dinbedrift.no
npx kodekonsulentene epost dinbedrift.no --dkim google
```

Null avhengigheter. Krever Node 18 eller nyere.

## Hva den sjekker

`sjekk` gir fem rader, i denne rekkefølgen:

| Rad | Hva den måler |
|---|---|
| Ytelse | Lighthouse-score på mobil når PageSpeed er tilgjengelig, ellers svartid og blokkerende ressurser |
| Sikkerhetsheadere | CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy og rammevern |
| Cookies før samtykke | Cookies og kjente sporere som lastes uten at noen har klikket (ekomloven § 3-15) |
| Universell utforming | De maskinelt testbare av de 35 WCAG 2.0-kravene for private virksomheter |
| Lovpålagt informasjon | Organisasjonsnummer, verifisert mot Enhetsregisteret, pluss kontaktinfo (ehandelsloven § 8) |

`epost` gir tre rader: SPF, DKIM og DMARC.

## Valg

```
--json              rå JSON i stedet for tabell
--dkim <selektor>   DKIM-selektor, bare for «epost»
--terskel <0-100>   laveste godtatte score før exit-kode 1 (standard 70)
--lokal             kjør mot http://localhost:4321
--hjelp             hjelpetekst
```

## Exit-koder

| Kode | Betyr |
|---|---|
| 0 | Score lik eller over terskelen, og ingen rad har status «BRUDD» |
| 1 | Score under terskelen, eller minst én rad er «BRUDD» |
| 2 | Sjekken kunne ikke kjøres: ugyldig adresse, nettverksfeil, ukjent valg |

En rad med status «BRUDD» gir alltid exit-kode 1, uansett hva totalen er. Et
lovbrudd skal ikke kunne forsvinne i et gjennomsnitt.

## Hvorfor den kaller et API

Verktøyet sender adressen til `kodekonsulentene.no/api/sjekk` i stedet for å kjøre
analysen lokalt. Det er et bevisst valg, med en reell ulempe:

**Fordelen.** Det finnes én motor. Terminalen, nettsiden og GitHub Action-en gir
nøyaktig samme svar, og en rettelse i analysen virker overalt samtidig – uten at
noen må oppgradere en pakke. Pakken er på én fil uten avhengigheter, og det er
ingenting å bygge.

**Ulempen.** Du er avhengig av at tjenesten er oppe, og vi ser hvilke adresser som
sjekkes. Vi lagrer dem ikke, men vi ser dem i trafikken. Trenger du en sjekk som
kjører helt uten nettverk ut av din egen maskin, er ikke dette verktøyet riktig
for deg ennå.

`--lokal` peker mot `http://localhost:4321`, og `KODEKONSULENTENE_API` overstyrer
adressen helt, om du vil kjøre mot din egen kopi.

## I et skript

```bash
#!/usr/bin/env bash
set -e
npx kodekonsulentene sjekk "$1" --terskel 90
```

Eller hent enkeltverdier:

```bash
npx kodekonsulentene sjekk dinbedrift.no --json \
  | jq -r '.rader[] | select(.status == "fail") | "\(.name): \(.note)"'
```

## I CI

Se [`norsk-lovsjekk`](../norsk-lovsjekk-action) – samme sjekk som en GitHub Action.

## Lisens

MIT. Se [LICENSE](./LICENSE).

Sjekken er et teknisk hjelpemiddel, ikke juridisk rådgivning. Den rapporterer bare
det den har målt; det som ikke kan måles maskinelt, står som «ikke sjekket».
