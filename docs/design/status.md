# Status for redesignet

Oppdatert: 8. oktober 2026
Fase 3, bølge 3.1 pågår. Venter på: produsent (C/klipp B/sløyfe/nærbilder, ramme 150),
bevegelse (øyeblikk 2/3/6) og bygger (forsiden)

- 8. okt (delegert): tema følger prefers-color-scheme; lyst er standard uten systempreferanse.

## PORT 1 (delegert avgjørelse, dirigenten, 8. okt)
- GODKJENT retning A «Befaring», med C sin typografiske prisliste (inngår i A-planen).
  Grunnlag: kritiker (A vinner mobil, B sist), måling (B bryter vektbudsjettet hardest som video-hero),
  brief del 6 (A anbefalt), del 3 (kunden leser på mobil).
- Lyst som standard. «Jeg». Myk rulling: AV. Peker-etikett: AV. Kredittramme resten: opp til 500 totalt.
- Hero i fase 1 har bare klipp A→B. Bilde C, klipp B, sløyfe og nærbilder bestilles i fase 3 med ny taktikk
  (C som redigering av A: «rydd bunken til én flukt plate»).
- Strukturfunn til fase 2/3: videolasting utsettes til første rulling (700 kB-budsjettet), plate/slør-regel
  for tekst over video, CLS fra scene__tekst reserveres bort, scenebakgrunn settes til målt #080809,
  lovpålagt footer på alle nye sider, Archivo + Schibsted 400 selvhostes som woff2.

## Beslutninger fra eier
- 8. okt PORT 0: GODKJENT – «Fortsett med alle fasene, ikke kom tilbake før alt er komplett.»
  Kredittramme: 100 i fase 1, hard stopp ved 500 totalt (briefens forslag, eier ga ikke eget tall).
  Qwen Image 3 som bildemodell: JA, «men den må være av bra kvalitet».
  Produsenten lager eget produksjonsskript: JA.
  Portvalgene (retning, lys/mørk, jeg/vi, myk rulling, peker-etikett) er delegert til dirigenten.
  Saldo ikke oppgitt; logges per generering, eier leser console.higgsfield.ai.
  Merge/publisering krever fortsatt eksplisitt GODKJENT ved PORT 3.
- 8. okt (delegert avgjørelse, dirigenten): siden snakker som «jeg», navn kan stå i brødtekst.
  Briefens del 6/12 går foran CLAUDE.md v1 for dette arbeidet. Portrett = merket plassholder til eier leverer.
  Det registrerte foretaksnavnet står fortsatt bare i footeren (lovkrav).
- 8. okt: Higgsfield kjøres via API-et, ikke CLI-en. Nøkkel i ~/.config/kodekonsulentene/higgsfield.env,
  forhåndsbetalt saldo (fylt på 7. okt). Rørledningen er scripts/scene.mjs + @higgsfield/client,
  prøvd i drift med tre publiserte klipp. Briefens del 9-prompter brukes, men gjennom denne veien.

## Kreditter
Ramme: ikke satt. Brukt: 0. Saldo sist: ukjent – higgsfield-CLI er ikke installert ennå.

## Oppdrag
| ID | Agent | Oppdrag | Status | Rapport |
|---|---|---|---|---|
| f0-kartlegger-repo | kartlegger | Kartlegg repoet | FERDIG | docs/design/kartlegging.md |
| f0-kartlegger-referanser | kartlegger | Referansestudien | DELVIS, godtatt | docs/design/referanser.md |
| f0-revisor-utgangsmaaling | revisor | Utgangsmåling av produksjon | FERDIG, 10/10 krav | docs/design/rapporter/f0-revisor-utgangsmaaling.md |
| f0-produsent-saldo | produsent | Modell- og saldosjekk via API | FERDIG | docs/design/rapporter/f0-produsent-saldo.md |
| f1-produsent-utkast | produsent | Bilder og klipp til hero-scenen | DELVIS, oppfølging pågår (ny redigeringsmodell) | docs/design/rapporter/f1-produsent-utkast.md |
| f1-designleder-retninger | designleder | Retningsplaner A/B/C | FERDIG | docs/design/retning.md |
| f1-bevegelse-scene | bevegelse | Scene.astro + 12 tester | FERDIG | docs/design/rapporter/f1-bevegelse-scene.md |
| f1-tekst-retninger | tekstforfatter | Manus for A/B/C | FERDIG | docs/design/tekst/ |
| f1-bygger-a | bygger | Prototype retning A | PÅGÅR | docs/design/rapporter/f1-bygger-a.md |
| f1-bygger-b | bygger | Prototype retning B | PÅGÅR | docs/design/rapporter/f1-bygger-b.md |
| f1-bygger-c | bygger | Prototype retning C | PÅGÅR | docs/design/rapporter/f1-bygger-c.md |

## Låste filer
- (fylles fra kartlegging.md)

## Skills som finnes
- frontend-design (som `frontend-design:frontend-design`)
- kodekonsulentene-design, kodekonsulentene-tekst, kodekonsulentene-tilbud (prefiks `anthropic-skills:`)
- ux-copy, design-critique, accessibility-review, design-system, design-handoff (prefiks `design:`)
- wai-requirements-planning, wai-implementation, wai-testing, wai-pr-review (prefiks `wai-suite:`)
- Tredjeparts-skills fra del 11 (Higgsfield, GSAP, Emil, Impeccable/Taste, Web Quality): IKKE installert. Krever ja fra eier.

## Åpne punkter
- Higgsfield-API: Nano Banana finnes ikke i katalogen – nærmeste bildemodell er Qwen Image 3 (bare 1k/2k).
  `pro`/`std` er egne Kling-endepunkt uten aspect_ratio-felt (formatet følger startbildet), og om `pro` gir
  1080p må måles på første klipp. Saldo kan ikke leses via API (405) – eier leser console.higgsfield.ai.
  Målte prisanslag (med 50 % rabatt): Kling std 4,0 / pro 5,4 / 4k 20,2, Qwen edit 1,2 kreditter per klipp/bilde.
- scripts/scene.mjs dekker ikke del 9 som den står (hardkodet Qwen + Kling 4K, laster ikke ned, andre stier).
  Produsenten har foreslått et eget produksjonsskript – venter på ja fra eier ved PORT 0.
- Referansestudien (DELVIS): heydays mobil og kundeliste ikke sett, variants håndbok/lønn/priser ikke sett,
  opptak.webm ikke avspilt (bevegelse utledet av bildedifferanser), epic.nets showreel viste feilmelding.
  Godtatt av dirigenten – prinsippene som trengs for retningsplanene er dekket.
- Utgangsmåling: kontrast under 4,5:1 på `.small.muted` på /nettsider (4,04:1) og /priser (3,93:1).
  CLS 0,057 fra dagens scene-komponent. Rettes i redesignet.
- Kartlegging: død kode (SceneFilm/HeroFilm importeres ikke), /historie står igjen i Lighthouse-konfigene,
  CSP tillater frame-src cal.com uten at noen iframe finnes.
- API-saldoen lar seg ikke lese maskinelt (krediteringsendepunktet ga 405 i går). Logging skjer
  per generering i assets/higgsfield/logg.md; eksakt saldo leses av eier i console.higgsfield.ai.
- Produsentens oppdragskort tilpasses API-veien: scene.mjs i stedet for `higgsfield generate`.
  Lærdommene i docs/akt.md (sekundmarkører, ingen forbudsord, geometri i piksler, Kling ~1,5 s
  foran klokka) gjelder SAMMEN med briefens prompter.
- Omstart gjort: alle åtte agenttyper er lastet og bekreftet tilgjengelige.
- Repoets CLAUDE.md/brandbok (v1) forbyr KI-bilder og video; briefen del 12 opphever disse reglene for dette arbeidet. Designsystem v2 erstatter v1 i fase 2.
- Playwright finnes allerede (1.63.0) – ingen installasjon nødvendig.
- Gårsdagens hovedarbeid ligger committet på main; grenen er laget fra ren main.
