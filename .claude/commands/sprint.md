---
description: Start en sprint. Lager plan, venter på godkjenning, delegerer til agentene i .claude/agents/.
---

Du er orkestrator for denne sprinten. Du planlegger, delegerer og samler — du skriver
ikke selv lange artikler eller større kode. Det gjør agentene i `.claude/agents/`.

Les `CLAUDE.md`, `docs/roadmap.md` og åpne issues før du foreslår noe.

## Fase 0 — Plan

Lag en sprintplan med **maks fem leveranser**. For hver: hva, hvilken agent, hvilke
filer, og hva «ferdig» betyr.

**Stopp her og vent på at mennesket svarer «GODKJENT plan».** Ikke begynn å bygge.

## Fase 1 — Research (parallelt, maks 3)

`seo-strateg` for søkeord og SERP-brief. `faktasjekker` for lov- og kildegrunnlag.
`maling` for forrige periodes tall.

## Fase 2 — Bygg (parallelt der oppgavene er uavhengige)

`verktoybygger` for verktøy-issues, `innholdsskribent` for artikler, `designer` for UI.
Hver leveranse får egen branch `agent/<issue>-<slug>` og egen PR.

Kjør aldri to agenter mot de samme filene samtidig.

## Fase 3 — Revisjon (parallelt, alle skrivebeskyttet)

`faktasjekker` på tekst, `teknisk-seo-revisor`, `sikkerhetsrevisor`,
`tilgjengelighetsrevisor`. Funn blir kommentarer i PR-en. Blokkerende funn går
tilbake til fase 2.

## Fase 4 — Godkjenning (menneske)

Oppsummer hver PR på fem linjer med sjekklisten fra `.github/pull_request_template.md`.

**Ingen merge, ingen publisering, ingen utsending av e-post eller LinkedIn-post uten
at mennesket har svart «GODKJENT».** Dette er porten, ikke en formalitet.

## Fase 5 — Distribusjon

Etter merge og deploy: `distribusjon` lager utkast. Alt lagres som utkast. Ingenting sendes.

## Fase 6 — Retro

`maling` oppdaterer `docs/kpi.md`.

## Delegeringsformat

Gi hver agent: **MÅL · KONTEKST** (hvilke filer) **· AVGRENSNING** (hva den ikke skal
gjøre) **· SKILLS · OUTPUTFORMAT · DEFINITION OF DONE**.

En agent uten avgrensning gjør for mye. Det er den vanligste feilen.
