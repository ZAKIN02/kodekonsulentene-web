---
name: kodekonsulentene-lansering
description: Bruk før kodekonsulentene.no eller en kundeside settes i drift. Full pre-flight: plassholdere, Lighthouse, WCAG, sikkerhetsheadere, DNS, sertifikat og hemmeligheter på Fly.io.
---

# Pre-flight før lansering

Full liste med avkryssing: `docs/sjekklister/lansering.md`. Dette er rekkefølgen.

## 1. Plassholdere – `npm run test` er porten

Testfilen `test/lansering.test.ts` er rød så lenge `src/data/firma.ts` har
plassholder-org.nr. eller plassholder-telefon. Det er med vilje: siden selger en sjekk
som rapporterer brudd når org.nr. mangler, og kan derfor ikke lanseres uten sitt eget.

Fyll inn i `src/data/firma.ts`:

- `orgnr` – ni siffer fra Brønnøysundregistrene (må bestå mod 11)
- `mva` – `true` når foretaket er mva-registrert (omsetning over 50 000 kr / 12 mnd)
- `foretaksnavn`, `adresse`, `telefon`, `epost`
- `cal` – Cal.com-brukernavnet

Søk opp resten: `grep -rn "TODO\|PLASSHOLDER" src/ docs/`
Gjelder særlig `src/data/caser.ts` (app-navn og resultattall) og portrettfotoet på `/om`.

## 2. Verifiser

```bash
npm run verify        # test + astro check + build
```

Alle tre skal være grønne. `npm run verify` stopper på første feil.

## 3. Mål det siden lover

- Lighthouse mobil ≥ 95 på alle fire kategorier. Tallet står i footeren – det skal være sant.
- LCP ≤ 2,5 s, CLS < 0,1, INP < 200 ms.
- WCAG 2.2 AA. Maskinelt først, så manuelt: kontrast, tastaturnavigasjon, fokusrekkefølge, skjermleser.
- Terminalmodus (`~`) skal kunne lukkes med Esc og gi fokus tilbake.
- Siden skal virke uten JavaScript: skjemaet poster, `/sjekk` forteller hva som må til.

## 4. Sikkerhetsheadere

```bash
curl -sI https://kodekonsulentene.no | grep -i -E 'content-security|strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame'
```

Seks treff. Deretter: kjør `/sjekk` mot din egen side og bekreft 6/6.
Se `kodekonsulentene-sikkerhetssjekk` for resten.

## 5. Hemmeligheter på Fly

```bash
fly secrets set PAGESPEED_API_KEY=... -a kodekonsulentene
fly secrets set RESEND_API_KEY=... RAPPORT_FRA=rapport@kodekonsulentene.no -a kodekonsulentene
fly secrets list -a kodekonsulentene
```

Uten `PAGESPEED_API_KEY` får ytelsesraden status «Ikke sjekket». Det er riktig oppførsel,
men et dårligere produkt – sett den.

## 6. Deploy

```bash
fly deploy
fly logs -a kodekonsulentene
fly status -a kodekonsulentene
```

## 7. DNS og sertifikat

Full framgangsmåte, inkludert forbeholdet om GoDaddys API-tilgang:
`docs/domene-og-drift.md`.

```bash
fly ips list -a kodekonsulentene
export FLY_IPV4=... FLY_IPV6=...
node scripts/dns-godaddy.mjs plan      # alltid plan før apply
node scripts/dns-godaddy.mjs apply
fly certs add kodekonsulentene.no -a kodekonsulentene
fly certs add www.kodekonsulentene.no -a kodekonsulentene
fly certs show kodekonsulentene.no -a kodekonsulentene
```

Husk: dagens A-oppføring peker på GoDaddy WebsiteBuilder og må erstattes.
MX-oppføringer skal stå urørt – skriptet rører dem ikke.

## 8. Etter lansering

- `dig +short kodekonsulentene.no` viser Fly-IP-en
- Google Bedriftsprofil opprettet med Oslo-adresse eller tjenesteområde
- Sitemap sendt inn i Search Console
- `/status` svarer 200 (Fly bruker den som helsesjekk)
- Kjør `/sjekk` mot din egen side én siste gang, og ta skjermbilde av 6/6 til `/sikkerhet`
