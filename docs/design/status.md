# Status for redesignet

Oppdatert: 8. oktober 2026
Fase 0, bølge 0.2 pågår. Venter på: kartlegger ×2 og revisor

## Beslutninger fra eier
- 8. okt: Higgsfield kjøres via API-et, ikke CLI-en. Nøkkel i ~/.config/kodekonsulentene/higgsfield.env,
  forhåndsbetalt saldo (fylt på 7. okt). Rørledningen er scripts/scene.mjs + @higgsfield/client,
  prøvd i drift med tre publiserte klipp. Briefens del 9-prompter brukes, men gjennom denne veien.

## Kreditter
Ramme: ikke satt. Brukt: 0. Saldo sist: ukjent – higgsfield-CLI er ikke installert ennå.

## Oppdrag
| ID | Agent | Oppdrag | Status | Rapport |
|---|---|---|---|---|
| f0-kartlegger-repo | kartlegger | Kartlegg repoet | PÅGÅR | docs/design/kartlegging.md |
| f0-kartlegger-referanser | kartlegger | Referansestudien | PÅGÅR | docs/design/referanser.md |
| f0-revisor-utgangsmaaling | revisor | Utgangsmåling av produksjon | PÅGÅR | docs/design/rapporter/f0-revisor-utgangsmaaling.md |
| f0-produsent-saldo | produsent | Modell- og saldosjekk via API | VENTER | – |

## Låste filer
- (fylles fra kartlegging.md)

## Skills som finnes
- frontend-design (som `frontend-design:frontend-design`)
- kodekonsulentene-design, kodekonsulentene-tekst, kodekonsulentene-tilbud (prefiks `anthropic-skills:`)
- ux-copy, design-critique, accessibility-review, design-system, design-handoff (prefiks `design:`)
- wai-requirements-planning, wai-implementation, wai-testing, wai-pr-review (prefiks `wai-suite:`)
- Tredjeparts-skills fra del 11 (Higgsfield, GSAP, Emil, Impeccable/Taste, Web Quality): IKKE installert. Krever ja fra eier.

## Åpne punkter
- API-saldoen lar seg ikke lese maskinelt (krediteringsendepunktet ga 405 i går). Logging skjer
  per generering i assets/higgsfield/logg.md; eksakt saldo leses av eier i console.higgsfield.ai.
- Produsentens oppdragskort tilpasses API-veien: scene.mjs i stedet for `higgsfield generate`.
  Lærdommene i docs/akt.md (sekundmarkører, ingen forbudsord, geometri i piksler, Kling ~1,5 s
  foran klokka) gjelder SAMMEN med briefens prompter.
- Omstart gjort: alle åtte agenttyper er lastet og bekreftet tilgjengelige.
- Repoets CLAUDE.md/brandbok (v1) forbyr KI-bilder og video; briefen del 12 opphever disse reglene for dette arbeidet. Designsystem v2 erstatter v1 i fase 2.
- Playwright finnes allerede (1.63.0) – ingen installasjon nødvendig.
- Gårsdagens hovedarbeid ligger committet på main; grenen er laget fra ren main.
