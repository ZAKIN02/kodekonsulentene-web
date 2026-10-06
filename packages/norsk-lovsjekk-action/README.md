# norsk-lovsjekk

GitHub Action som sjekker en nettside mot norske lovkrav og feiler bygget når den
ikke holder mål.

```yaml
- uses: kodekonsulentene/norsk-lovsjekk@v1
  with:
    url: https://dinbedrift.no
```

## Hva den sjekker

| Krav | Hjemmel |
|---|---|
| Cookies og sporere som settes før samtykke | Ekomloven § 3-15, gjeldende fra 1. januar 2025 |
| Universell utforming, det som kan testes maskinelt | 35 krav i WCAG 2.0 nivå A og AA for private virksomheter |
| Organisasjonsnummer på siden, verifisert mot Enhetsregisteret | Ehandelsloven § 8 |
| Kontaktinformasjon: adresse, e-post, telefon | Ehandelsloven § 8 |
| Sikkerhetsheadere: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, rammevern | Ikke lovpålagt, men avgjørende for om siden kan misbrukes |
| Ytelse | Lighthouse på mobil når tilgjengelig, ellers svartid |

Valgfritt: SPF, DKIM og DMARC på domenet.

## Inndata

| Navn | Standard | Beskrivelse |
|---|---|---|
| `url` | *(påkrevd)* | Adressen som skal sjekkes |
| `terskel` | `70` | Laveste godtatte samlede score, 0–100 |
| `tillat-brudd` | `false` | `true` lar jobben passere selv om en rad er brudd |
| `epost` | `false` | `true` kjører i tillegg SPF-, DKIM- og DMARC-sjekk |
| `dkim` | `""` | DKIM-selektor, brukes bare når `epost: true` |
| `api` | `https://kodekonsulentene.no` | Overstyr tjenesten sjekken kjøres mot |

## Utdata

| Navn | Beskrivelse |
|---|---|
| `score` | Samlet score, 0–100 |
| `brudd` | Antall rader med status brudd |
| `rapport` | Hele rapporten som JSON |

## Når feiler den?

Jobben feiler hvis **minst én rad har status brudd**, eller hvis **samlet score er
under terskelen**. Et brudd stopper bygget uansett hva totalen er – et lovbrudd
skal ikke kunne forsvinne i et gjennomsnitt. Vil du ha en ren terskel, sett
`tillat-brudd: true`.

E-postsjekken feiler aldri bygget. Et DNS-oppsett er sjelden noe en PR endrer, så
funnene kommer som advarsler.

## Eksempler

### Sjekk produksjon hver natt

```yaml
name: Lovsjekk
on:
  schedule: [{ cron: "0 5 * * *" }]
  workflow_dispatch:

jobs:
  lovsjekk:
    runs-on: ubuntu-latest
    steps:
      - uses: kodekonsulentene/norsk-lovsjekk@v1
        with:
          url: https://dinbedrift.no
          terskel: "90"
          epost: "true"
          dkim: google
```

### Sjekk en forhåndsvisning i en PR

```yaml
- uses: kodekonsulentene/norsk-lovsjekk@v1
  id: lovsjekk
  continue-on-error: true
  with:
    url: ${{ steps.deploy.outputs.preview-url }}

- name: Kommenter i PR-en
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const r = JSON.parse(`${{ steps.lovsjekk.outputs.rapport }}`);
      const rader = r.rader.map(x => `| ${x.name} | ${x.status} | ${x.note} |`).join("\n");
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `## Lovsjekk: ${r.totalt}/100\n\n| Sjekk | Status | Merknad |\n|---|---|---|\n${rader}`,
      });
```

### Bruk scoren videre

```yaml
- uses: kodekonsulentene/norsk-lovsjekk@v1
  id: lovsjekk
  with: { url: https://dinbedrift.no }

- run: echo "Score ble ${{ steps.lovsjekk.outputs.score }}"
```

## Badge

Når du kjører sjekken i en egen workflow, gir GitHub deg et merke:

```markdown
[![Lovsjekk](https://github.com/BRUKER/REPO/actions/workflows/lovsjekk.yml/badge.svg)](https://github.com/BRUKER/REPO/actions/workflows/lovsjekk.yml)
```

## Hvordan den virker

Action-en er en composite action uten avhengigheter utover `python3`, som allerede
finnes på alle GitHub-kjørere. Den sender adressen til
`kodekonsulentene.no/api/sjekk` og oversetter svaret til
`::error`- og `::warning`-meldinger, et jobbsammendrag og utdata.

Det betyr at det finnes én motor: terminalen, nettsiden og denne action-en gir
samme svar, og en rettelse i analysen virker overalt uten at du må oppgradere noe.
Ulempen er at sjekken trenger nettverk ut av kjøreren, og at vi ser hvilke adresser
som sjekkes. Vi lagrer dem ikke. Vil du kjøre mot din egen kopi, sett `api`.

Samme sjekk fra terminalen: [`npx kodekonsulentene`](../cli).

## Lisens

MIT. Se [LICENSE](./LICENSE).

Sjekken er et teknisk hjelpemiddel, ikke juridisk rådgivning. Automatiske tester
fanger bare en del av kravene til universell utforming; kontrast, tastaturbruk og
skjermleserflyt må testes manuelt.
