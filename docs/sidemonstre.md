# Sidemønstre

Slik settes komponentene sammen til sider. Rekkefølgen på forsiden er fast; undersider gjenbruker de samme blokkene.

## Forsiden, i rekkefølge

| # | Blokk | Komponenter | Regel |
|---|---|---|---|
| 01 | Hero | `display-xl`, `body-lg`, `Button primary`, `UrlCheck` | Ett konkret løfte, én ingress på maks to linjer, to CTA-er: menneskelig («Book 20 minutter») og selvbetjent (`UrlCheck`). Visuelt: ett ekte skjermbilde eller `Terminal` – aldri illustrasjon. |
| 02 | Bevis | `ProofStrip` | Fire–fem målbare påstander med tall i `mono-stat`. Tallene skal være sanne og helst live. |
| 03 | Tjenester | `Eyebrow`, `ServiceCard` ×3 | Nettsider · Systemer og integrasjoner · Apper og AI. Hvert kort lenker til egen underside. |
| 04 | Caser | `Eyebrow`, `heading`, skjermbilde, `Terminal` (valgfritt) | 2–4 caser: problem → løsning → resultat med tall. Egne apper teller som caser. |
| 05 | Verktøy | `UrlCheck`, `CheckReport` | «Sjekk nettsiden din» i full bredde med et eksempel på rapport. |
| 06 | Prosess | `ProcessSteps` | Samtale → Prototype på 72 t → Bygging → Lansering og drift. |
| 07 | Priser | `PriceCard` ×3 + abonnement + «system fra» | Åpne priser, alltid med prisenheten fra `priser.ts` synlig. Én pakke merket «Anbefalt». |
| 08 | Om | portrett, `body` | Ansikt, kort historie, hvorfor solo er en styrke. Du-form. |
| 09 | FAQ | `heading` som `<summary>`, `body` | Eierskap, binding, sykdom, GDPR, universell utforming. |
| 10 | Kontakt | innebygd kalender, skjema med 3–5 felt | Ingen felt som ikke trengs for å svare. |
| – | Footer | `LegalFooter` | Lovpålagt informasjon, se under. |

Avstanden mellom blokkene er `space-9` på desktop og `space-8` på mobil. Hver blokk begynner med `Eyebrow` nummerert som i tabellen, deretter tittel i `display-lg`.

## Hero

- Overskrift i `display-xl`, maks 8 ord, i `ink`. Ett ord eller tall kan stå i `accent-text` – ikke flere.
- Ingress i `body-lg`, `ink-muted`, maks 60 tegn per linje og to linjer.
- Knapperad: `Button primary` først, så `UrlCheck` på samme linje på desktop og under på mobil.
- Visuell side (desktop, 5 av 12 kolonner): `Terminal` som kjører en ekte sjekk, eller ett skjermbilde med `hairline` kant.
- Ingen gradient, ingen 3D, ingen video. Hero skal være ferdig malt under 1 s (LCP ≤ 2,5 s på mobil er kravet, målet er under 1 s).

## Priser

- Tre `PriceCard` i bredden, den midterste `recommended`. Under kortene: én rad for abonnement og én for «System fra» i `mono`.
- Prisen i `mono-stat`, prisenheten i `small` rett under, aldri skjult i en fotnote. Enheten skrives
  ikke inn – den kommer fra `prisenhet` i `src/data/priser.ts`, som er «endelig pris» så lenge
  foretaket ikke er mva-registrert og «eks. mva» når det blir det. Se docs/prisliste.md.
- Innholdslisten bruker hake-ikon i `ok` for inkludert og strek i `ink-faint` for ikke inkludert. Aldri kryss i `fail` – det er ikke en feil at Start-pakken mangler CMS.
- Timepris og bindingstid står i klartekst ved siden av pakkene.

## Undersider

`/nettsider`, `/systemer`, `/apper-og-ai`, `/sikkerhet`, `/bransjer/<bransje>`, `/priser`, `/caser`, `/om`, `/kontakt`, `/personvern`, `/vilkar`, `/status`.

Hver underside åpner med `Eyebrow` + `display-lg` + `body-lg`, har én `Button primary` over folden, og slutter med samme kontaktblokk som forsiden. Bransjesider har i tillegg én demo som kan klikkes i (bookingsystem, tilbudsgenerator) – en demo slår et avsnitt.

Demoblokken på `/nettsider` er `KodeBygg`, rett etter heroen: ekte kode fra repoet til venstre, den samme komponenten rendret til høyre, bygget linje for linje. Den hører til fordi nettsider er det eneste vi selger der selve arbeidet kan vises direkte, og den står ett sted – blir den gjenbrukt på flere sider, er den ikke lenger et bevis, bare en effekt.

## Rapport fra «Sjekk nettsiden din»

`CheckReport` viser fem rader i fast rekkefølge: Ytelse (Lighthouse-score), Sikkerhetsheadere (CSP, HSTS, X-Frame-Options), Cookies før samtykke (antall), Universell utforming (antall WCAG-feil funnet), Lovpålagt informasjon (org.nr. funnet ja/nei). Hver rad har `StatusBadge`, en verdi i `mono` og én setning i `small` som sier hva det betyr for bedriften, ikke for utvikleren: «3 cookies settes før samtykke. Det bryter ekomloven § 3-15.»

Rapporten sendes også på e-post; e-postversjonen bruker samme rekkefølge og ordlyd.

## Lovpålagt informasjon

`LegalFooter` skal alltid inneholde: foretaksnavn og organisasjonsnummer (med «MVA» etter nummeret når foretaket er mva-registrert), geografisk adresse, e-post og telefon, og lenker til personvernerklæring, cookie-innstillinger (eller teksten «Denne siden bruker ikke cookies» når det er sant) og salgsvilkår. Org.nr. settes i `mono`. Dette er ikke valgfritt innhold; komponenten rendrer ikke uten org.nr.

## Ytelses- og tilgjengelighetsbudsjett

- Lighthouse ≥ 95 på alle fire kategorier, mobil. LCP ≤ 2,5 s, CLS < 0,1, INP < 200 ms.
- Maks to webfonter (Schibsted Grotesk 700–800, JetBrains Mono 400–600), subsettet til latin, `font-display: swap`.
- Ingen tredjepartsskript før samtykke. Analyse er cookieløs (Plausible eller PostHog uten cookies), så siden trenger ikke banner.
- WCAG 2.2 AA: alle tekstpar ≥ 4,5:1, alle kontroller ≥ 3:1 mot grunnen, synlig fokus (`focus`), alle interaktive mål ≥ 24×24px, alt kan nås med tastatur.
- Sikkerhetsheadere på egen side: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Siden selger dette og skal selv bestå sin egen sjekk.
