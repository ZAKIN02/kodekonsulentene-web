# Rapport f1-bygger-b: prototype for retning B «Verkstedet om natta»

Oppdrag f1-bygger-b, 2026-10-08. Skills lastet: `frontend-design`, `wai-implementation`.
`emil-design-eng` finnes ikke i skill-lista og er derfor ikke brukt.

## Hva som er bygget

- `src/pages/retning/b.astro` – frittstående side på `/retning/b` med `noindex`, egne
  tokens fra retning B i `docs/design/retning.md` (natt, benk, kritt, refleks, signalrød;
  lyst tema: kritt bunn, natt tekst) og kurvene/varighetene fra briefen del 8
  (`--ut`, `--inn-ut`, `--svar: 160ms`). Mørkt er standard, lyst via `prefers-color-scheme`.
- `src/components/retning-b/Hode.astro` – logo (lockup, temavariant via `<picture>`) og
  dagens meny fra `src/data/navigasjon.ts` (lest, ikke endret).
- `src/components/retning-b/Sjekk.astro` – sjekkseksjonen som ark i benk, skjema som
  poster til `/sjekk?url=` uten JavaScript; manusets feilmelding settes med
  `setCustomValidity` som ren forbedring.
- `src/components/retning-b/Reel.astro` – «Spill av filmen» som `<details>` med grå
  plassholder (virker uten JavaScript); byttes til `<dialog>` + `<video controls>` når
  opptak finnes.
- Scenen: `<Scene navn="test" prioritet hoppTil="sjekk">` med manusets fire steg.
  Komponenten er ikke endret; stegplatene (kritt på benk, beregnet 13,03:1) er stylet fra
  sidens egen globale stil. All tekst ordrett fra `docs/design/tekst/retning-b.md`.

## Målt

- Aktiv scene (`.design/arbeid/bygger-b/aktiv-test.mjs`): halvveis rulling ga
  `--framdrift: 0.5000` og video på 2,975 s av 6 s (nøyaktig halvveis). Rulling låses ikke.
- Første Tab-rekke når «Hopp over animasjonen»; Enter ga `#sjekk` med seksjonen i syne.
- Uten JavaScript/med redusert bevegelse: all tekst i HTML (kontrollert med curl og
  skjermbilder tatt med `reducedMotion: reduce`); poster + steg leses som vanlig innhold.
- Serveren svarte 206 på Range før bygging. 26 skjermbilder i
  `.design/arbeid/bygger-b/runde-01` og `runde-02` (mobil/desktop × lyst/mørkt).
- Sidevekt og Lighthouse: ikke målt (bygger kjører ikke `build`; `revisor` måler).

## Selvkontroll og AI-preg-sjekken (del 12)

Rettet etter runde 1: H1 brakk i tre linjer på desktop (maks-bredde økt til 24ch → to
linjer), inaktiv scene lå kant til kant (nå avrundet kort med luft når `data-aktiv`
mangler), mobilmenyen kuttet tre punkter (overflow byttet til brytning).

Ingen etiketter over overskrifter, ingen nummerering, ingen monospace, ingen «→» eller
midtprikker, ingen inntoning på kort/avsnitt, bare scenen beveger seg, ett tall (78 %)
og hvert løfte står én gang, én stor ting per skjermhøyde (setningen hører til scenen).
Begrunnes: H1 i versaler er sjablonggrepet fra retningsplanen, uten sperring og ikke
småtekst. Stegplatene deler oppsett ×4, men er sekvensens steg i én komponent – i aktiv
modus vises én per skjermhøyde. Byttetesten kan ikke bestås med testklippet
(SMPTE-striper); den avgjøres av hero-klippene fra `produsent` – samme forbehold som
retningsplanen selv tar.

## Åpne punkter

1. Big Shoulders Stencil er ikke selvhostet; H1 bruker systemstack (Arial Narrow m.fl.).
2. Schibsted Grotesk finnes bare som 700–800-fil; brødtekst bruker systemfont til den
   variable 400–800-fila er selvhostet.
3. Scenen bruker `navn="test"` til hero-klippene fra `produsent` er klare.
4. Reel-innholdet mangler: `[MANGLER: skjermopptak fra eier til reelen – 20–30 sekunder
   klippet sammen med scenene]` vises som grå plassholder.
5. Temaveksleren [◐] fra skissen er utelatt; temaet følger `prefers-color-scheme`.
   I lyst tema får refleksknappen 1 px natt-kant (refleks mot kritt gir ellers under 3:1),
   etter samme regel som retning A. `designleder` bør bekrefte.
