# Sjekkliste: lansering

Kort versjon i `.claude/skills/kodekonsulentene-lansering/SKILL.md`.

## Plassholdere

- [ ] `src/data/firma.ts`: `orgnr` (ekte, består mod 11)
- [ ] `src/data/firma.ts`: `mva` satt riktig
- [ ] `src/data/firma.ts`: `foretaksnavn`, `adresse`, `telefon`, `epost`
- [ ] `src/data/firma.ts`: `cal` – Cal.com-brukernavn
- [ ] `src/data/caser.ts`: ekte app-navn og resultattall, ingen TODO
- [ ] `src/data/bevis.ts`: tallene i bevis-stripen er sanne og etterprøvbare
- [ ] Portrettfoto på `/om` (4:5, ekte bilde)
- [ ] Demoene på de to bransjesidene, eller fjern avsnittene
- [ ] `grep -rn "TODO\|PLASSHOLDER" src/ docs/` gir ingen treff som skal ut

## Kode

- [ ] `npm run test` grønn (lanseringstestene er røde til org.nr. er ekte)
- [ ] `npm run check` – 0 feil
- [ ] `npm run build` uten advarsler

## Innhold

- [ ] Hver side har unik `tittel` og `beskrivelse`
- [ ] Rekkefølgen på forsiden følger `docs/sidemonstre.md`
- [ ] Eyebrow-numrene stemmer med rekkefølgen
- [ ] Ingen emoji, ingen utropstegn, ingen floskler
- [ ] Alle priser står med prisenheten fra `priser.ts` synlig – «endelig pris» så lenge
      `firma.mva` er `false`, aldri «eks. mva» skrevet inn for hånd
- [ ] `/personvern` og `/vilkar` kvalitetssikret juridisk

## Ytelse og tilgjengelighet

- [ ] Lighthouse mobil ≥ 95 på alle fire kategorier
- [ ] LCP ≤ 2,5 s, CLS < 0,1, INP < 200 ms
- [ ] WCAG 2.2 AA – maskinelt og manuelt
- [ ] Kontrast testet i både mørkt og lyst tema
- [ ] Tastaturnavigasjon hele veien gjennom, synlig fokus
- [ ] Terminalmodus lukkes med Esc og gir fokus tilbake
- [ ] Siden virker uten JavaScript
- [ ] Testet på ekte mobil, ikke bare i nettleserens mobilvisning

## Sikkerhet

- [ ] Seks sikkerhetsheadere, verifisert med `curl -sI`
- [ ] `/sjekk` kjørt mot egen side: 6/6
- [ ] `npm audit` ren
- [ ] Ingen hemmeligheter i Git-historikken

## Drift

- [ ] `fly secrets list` viser `PAGESPEED_API_KEY` og `RESEND_API_KEY`
- [ ] `fly deploy` uten feil
- [ ] `/status` svarer 200
- [ ] DNS peker på Fly (`dig +short kodekonsulentene.no`)
- [ ] Sertifikat utstedt for både apex og `www`
- [ ] Gammel A-oppføring mot GoDaddy WebsiteBuilder fjernet
- [ ] MX-oppføringer urørt og e-post virker fortsatt

## Etter

- [ ] Google Bedriftsprofil opprettet
- [ ] Sitemap sendt inn i Search Console
- [ ] Kontaktskjemaet testet ende til ende
- [ ] Nettsidesjekken testet med e-postutsending
- [ ] Skjermbilde av 6/6 lagt inn på `/sikkerhet`
