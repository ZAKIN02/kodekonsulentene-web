# Sjekkliste: sikkerhet

Utfyllende versjon i `.claude/skills/kodekonsulentene-sikkerhetssjekk/SKILL.md`.
Gjennomgås før hver lansering, også på kundeprosjekter.

## Headere

- [ ] `Content-Security-Policy` satt, uten `unsafe-inline` og `unsafe-eval` i `script-src`
- [ ] `Strict-Transport-Security` med `max-age` ≥ 6 måneder
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy`
- [ ] `Permissions-Policy` som slår av det som ikke brukes
- [ ] `X-Frame-Options` eller CSP `frame-ancestors`
- [ ] Headerne gjelder også statiske filer, ikke bare SSR-ruter

## Avhengigheter

- [ ] `npm audit` ren
- [ ] Automatisk sårbarhetsvarsling er på
- [ ] Ingen pakke er med «bare i tilfelle»

## Hemmeligheter

- [ ] Ingen nøkler i kode
- [ ] Ingen nøkler i Git-historikken (sjekk historikken, ikke bare arbeidskopien)
- [ ] Alt i plattformens hemmelighetslager
- [ ] Egne nøkler per tjeneste og per kunde
- [ ] `.env` i `.gitignore`, `.env.example` uten verdier

## Data og tilgang

- [ ] Radnivå-sikkerhet på alle tabeller med persondata
- [ ] Plattformens sikkerhetsrådgiver kjørt
- [ ] Minste nødvendige rettighet
- [ ] Alle kontoer i kundens navn
- [ ] Databehandleravtale der det behandles personopplysninger

## Inngående data

- [ ] All inndata validert på serveren
- [ ] SSRF-vern der systemet henter adresser brukeren har oppgitt
- [ ] Tak på størrelse og tidsavbrudd på utgående kall
- [ ] Feilmeldinger er setninger, ikke stack traces
- [ ] Ingen brukerstyrt HTML settes inn uten rensing

## Sikkerhetskopi

- [ ] Daglig sikkerhetskopi
- [ ] Gjenoppretting testet denne måneden
- [ ] Tiden det tok er notert

## Dokumentasjon

- [ ] Kunden har fått en kort, lesbar rapport
- [ ] Rapporten sier hva som **ikke** er testet
