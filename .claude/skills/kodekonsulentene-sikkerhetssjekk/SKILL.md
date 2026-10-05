---
name: kodekonsulentene-sikkerhetssjekk
description: Bruk før en leveranse settes i drift, eller når du skal vurdere sikkerheten i en nettside eller et system – sikkerhetsheadere, avhengigheter, hemmeligheter, databasetilgang og sikkerhetskopi.
---

# Sikkerhetssjekk før lansering

Sikkerhet er en del av prisen hos KodeKonsulentene, ikke et tillegg. Denne listen er
det som faktisk gjøres, og den gjennomgås før hver lansering.
Full liste: `docs/sjekklister/sikkerhet.md`.

## 1. Sikkerhetsheadere

Seks stykker. Nettsidesjekken teller nøyaktig disse, så en leveranse som ikke har dem,
ville fått stryk av vårt eget verktøy:

| Header | Hva den gjør |
|---|---|
| `Content-Security-Policy` | hindrer at innsprøytet skript kjører |
| `Strict-Transport-Security` | min. seks måneders `max-age`; tvinger HTTPS |
| `X-Content-Type-Options: nosniff` | hindrer at nettleseren gjetter filtype |
| `Referrer-Policy` | lekker ikke adresser til tredjepart |
| `Permissions-Policy` | slår av kamera, mikrofon, posisjon som ikke brukes |
| `X-Frame-Options` eller CSP `frame-ancestors` | hindrer klikkjacking |

For dette repoet står de i `sikkerhet.mjs` og settes av `server.mjs` på **alle** svar,
også de prerendrede HTML-filene. `test/lansering.test.ts` feiler hvis en forsvinner,
hvis `script-src` får `unsafe-inline`, eller hvis HSTS blir for kortvarig.

Pass på: `script-src` skal aldri ha `'unsafe-inline'` eller `'unsafe-eval'`. Trenger du
et innebygd skript, legg teksten i én delt konstant og regn hashen av den – slik
`TEMA_SCRIPT` i `sikkerhet.mjs` gjør. Da kan de to ikke drive fra hverandre.

## 2. Avhengigheter

- `npm audit` skal være ren før lansering.
- Automatisk varsling på nye sårbarheter (Dependabot eller tilsvarende).
- Kjent sårbarhet lappes innen fem arbeidsdager på kunder med driftsavtale.
- Færrest mulig avhengigheter. Hver pakke er noen andres kode som kjører hos kunden din.

## 3. Hemmeligheter

- Ingen nøkler i kode eller i Git-historikk. Sjekk historikken, ikke bare arbeidskopien.
- Alt i plattformens hemmelighetslager: `fly secrets set NAVN=verdi`.
- Egne nøkler per tjeneste og per kunde. Ingen delte innlogginger.
- Nøkler roteres når noen slutter eller en avtale avsluttes.
- `.env` er i `.gitignore`. `.env.example` viser hvilke nøkler som finnes, aldri verdiene.

## 4. Tilgang og data

- Minste nødvendige rettighet, alltid.
- Radnivå-sikkerhet (RLS) på alle tabeller med persondata. Ikke «vi filtrerer i koden» – det er ikke sikkerhet, det er en forhåpning.
- Kjør plattformens egen sikkerhetsrådgiver før lansering der den finnes.
- Alle kontoer står i kundens navn med kunden som eier. Utvikleren er lagt til som bruker.

## 5. Inngående data

- Valider alt som kommer utenfra. Serveren, ikke bare skjemaet.
- Henter systemet en adresse brukeren har skrevet, må det ha SSRF-vern: ingen loopback, ingen private nett, ingen metadatatjeneste, og kontroll på hver omdirigering. Se `erTillattVert()` i `src/lib/sjekk.ts` og `src/lib/hent.ts`.
- Sett tak på størrelse og tid på alt som hentes utenfra.
- Feilmeldinger til brukeren skal være setninger, aldri stack traces.

## 6. Sikkerhetskopi

- Daglig sikkerhetskopi.
- Test gjenoppretting hver måned. **En backup du ikke har lest tilbake, er ikke en backup.**
- Skriv ned hvor lang tid gjenoppretting faktisk tok, og fortell kunden tallet.

## 7. Rapport til kunden

Kort, lesbar uten utviklerbakgrunn, og den sier hva som **ikke** er testet.
Det er den delen som gjør rapporten troverdig.

## Verifiser

```bash
npm run test                  # headertestene og analysemotoren
npm run build
curl -sI https://kodekonsulentene.no | grep -i -E 'content-security|strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame'
```

Siden skal bestå sin egen sjekk på `/sjekk` med 6/6. Gjør den ikke det, er produktet usant.
