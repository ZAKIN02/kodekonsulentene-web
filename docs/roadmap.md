# Roadmap

Rekkefølgen her bygger på én innsikt: **verktøy tåler AI-svar bedre enn artikler.**
Et AI-sammendrag kan gjengi en guide. Det kan ikke kjøre en sjekk på din nettside og
gi deg et tall. Derfor bygges verktøyet først, og artikkelen skrives rundt det.

## Forbehold, les først

- **KPI-ene under er mål vi har satt oss. De er ikke prognoser.** Ingen kan love en
  rangering, og tidslinjene er vurderinger basert på observert konkurranse — ikke
  dokumenterte fakta.
- **Norske søkevolum er nesten aldri offentlige.** Prioriteringen er en kvalifisert
  vurdering til vi har hentet egne tall fra Google Keyword Planner. Gjør det tidlig.
- Tallene for utenlandske gratisverktøy som brukes som forbilder, er tredjeparts
  estimater fra et annet marked.

## 0–30 dager

| Bygg | Skriv | Annet |
|---|---|---|
| Nettsidesjekken utvidet med verifisering mot Enhetsregisteret | Cookies før samtykke (ekomloven § 3-15) | Search Console og Bing Webmaster Tools |
| Cookie-sjekker som laster siden uten samtykke | De 35 UU-kravene for private | Google Bedriftsprofil med riktig primærkategori |
| CI med Lighthouse-budsjett | Org.nr.-kravet i ehandelsloven § 8 | Konsistent navn og adresse på Proff, Gulesider, 1881 |

**Mål:** alle sider indeksert · 3–4 artikler · 2 verktøy live.

## 31–60 dager

| Bygg | Skriv | Annet |
|---|---|---|
| Priskalkulator med åpne, daterte data | Vipps på nettsiden, med kode | Pitch til kode24 om cookie-sjekkeren |
| DMARC-, SPF- og DKIM-sjekk | Fiken API | «Show HN» når verktøyet er stabilt |
| `norsk-lovsjekk` som GitHub Action og CLI | Tripletex-integrasjon | Kontakt tre regnskapsførere om partnerskap |

**Mål:** 10 artikler · første topp 10 på et nisjesøk · verktøyene brukt utenfor eget nettverk.

## 61–90 dager

| Bygg | Skriv | Annet |
|---|---|---|
| UU-hurtigsjekk | Nettside for håndverkere, med egne data | Start datainnsamling til tilstandsrapporten |
| Delbar rapport-URL og badge | Wix mot skreddersydd, totalkostnad over 3 år | LinkedIn to ganger i uken |
| Vipps-gebyrkalkulator | Bookingsystem for klinikk og treningssenter | |

**Mål:** 16–18 artikler · noen søk i topp 3 · leads som kommer fra verktøyene, ikke fra nettverket.

## Kvartal 2

Tilstandsrapport for norske småbedrifters nettsider, med PDF og pressemelding.
Opt-in-ledertavle. Bransje + by-sider med egne data.

**Les `docs/metode-skanning.md` før én eneste fremmed side skannes.**

## Neste steg som ikke er satt opp ennå

- **`claude.yml`** — Claude Code GitHub Action som svarer på `@claude` i issues og
  PR-er. Krever Claude GitHub-appen og `ANTHROPIC_API_KEY` eller
  `CLAUDE_CODE_OAUTH_TOKEN` som repo-secret, pluss rettighetene
  `contents: write`, `pull-requests: write`, `issues: write` og `actions: read`.
  Ikke lagt inn, fordi secretene ikke er satt. Legg den til når de er på plass.
- **Egne søkevolum.** Google Keyword Planner, Norge og norsk. Uten disse er
  prioriteringen over en vurdering.
- **Lenkeplan.** Regnskapsførere, bransjeforeninger, kode24. Se `docs/kanaler.md`.
