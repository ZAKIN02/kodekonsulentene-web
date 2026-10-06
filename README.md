# kodekonsulentene-web

Nettsiden til KodeKonsulentene – nettsider, systemer og apper for norske småbedrifter.
Astro 7, Node 22, Fly.io i Amsterdam.

Siden er sitt eget første case: Lighthouse-budsjett, WCAG 2.2 AA, seks sikkerhetsheadere
og null cookies. Den inneholder også **nettsidesjekken** på `/sjekk`, som er byråets
leadmagnet: skriv inn en adresse og få ytelse, sikkerhetsheadere, cookies før samtykke,
WCAG-feil og lovpålagt informasjon tilbake på under et minutt.

## Kom i gang

```bash
npm install
cp .env.example .env     # valgfritt – uten nøkler går alt, men med redusert funksjon
npm run dev              # http://localhost:4321
```

Uten `PAGESPEED_API_KEY` får ytelsesraden i sjekken status «Ikke sjekket».
Uten `RESEND_API_KEY` sendes ingen e-post. Begge deler er riktig oppførsel, ikke en feil.

## Kommandoer

| | |
|---|---|
| `npm run dev` | utviklingsserver |
| `npm run verify` | tester + typesjekk + bygg |
| `npm run test` | bare testene |
| `npm start` | kjør det bygde, som i produksjon |
| `npm run deploy` | `fly deploy` |
| `npm run dns:plan` | se DNS-endringer uten å skrive noe |

## Struktur

```
src/
  components/   11 komponenter fra designsystemet, portert til Astro
  data/         firma, priser, tjenester, caser, FAQ – all sannhet om innhold
  lib/sjekk.ts  analysemotoren bak nettsidesjekken (rene funksjoner, testet)
  lib/hent.ts   henting av fremmede sider, med SSRF-vern
  pages/        16 sider + 2 API-ruter
  styles/       tokens.css, components.css, site.css
sikkerhet.mjs   sikkerhetsheadere og temaskript – delt av server, middleware og tester
server.mjs      HTTP-serveren i drift
scripts/        dns-godaddy.mjs
docs/           brandbok, sidemønstre, prisliste, avtaler, sjekklister, drift
.claude/skills/ åtte skills for tilbud, tekst, design, lovsjekk, sikkerhet, lansering
```

## Deploy

```bash
fly deploy
```

DNS, sertifikat og hemmeligheter: `docs/domene-og-drift.md`.
Full pre-flight: `docs/sjekklister/lansering.md`.

## Før første lansering

`npm run test` er **rød med vilje** til `src/data/firma.ts` har ekte org.nr. og
telefonnummer. Siden rapporterer brudd hos andre når org.nr. mangler – den kan ikke
lanseres uten sitt eget.

## Lisens og forbehold

Koden er MIT-lisensiert, se `LICENSE`. Det gjelder også sjekkmotoren, CLI-en og
GitHub Action-en – de er ment å brukes av andre.

Dokumentene under `docs/` er åpne med vilje: håndboken, prislisten og metoden bak
skanningene står der fordi åpenhet er en del av hvordan vi selger. `docs/avtale-b2b.md`
og `docs/tilbud-mal.md` er våre egne arbeidsmaler, ikke juridisk rådgivning, og de er
ikke kvalitetssikret av advokat. Bruker du dem, gjør du det for egen regning.

Innholdet på selve nettsiden – tekst, logo og designsystem – er ikke dekket av
MIT-lisensen.
