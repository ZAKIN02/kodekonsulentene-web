# Rapport: f3-bygger-forside

Ny forside etter retning A, designsystem v2 og tekstmanuset. 2026-10-08.

## Hva som er bygget

- `src/layouts/MalV2.astro` – ny mal. Teknisk hode kopiert fra Base (meta, OG, canonical, foretak/nettsted/brødsmule-schema), men med `fonter-v2.css` + `tokens-v2.css`, forhåndslast av `schibsted-grotesk-var-latin.woff2` og `archivo-var-latin.woff2`, `theme-color` per tema (`#E9EAE6`/`#12285C`) og `color-scheme: light dark`. Ingen temaskript (tema følger `prefers-color-scheme`, avgjort ved f2), ingen Apning/terminal.js/hero-live.js/Snarveikart. Grunnstiler, knapp/merkelapp/plassholder-klasser og scene-tilpasninger (tittelfeltet, 7.7) ligger som global CSS i malen – Scene-komponenten er ikke rørt, bare stylet utenfra.
- `src/components/forside/`: `Hode`, `Tilbud`, `Rapport`, `Arbeid`, `Garanti`, `Tjenester`, `Prisliste`, `Prosess`, `Hvem`, `Sporsmal`, `Kontakt`, `Bunn`.
- `src/pages/index.astro` – erstattet helt. Rekkefølge per del 6: Tilbudet → Scenen (`navn="hero"`, `prioritet`, `bakgrunn="#080809"`, steg-variant «A→B alene», kolofon «Illustrasjon laget med KI») → Rapporten (`#rapport`) → Arbeid → Garantien → Det jeg bygger → Prisliste → Slik går det → Hvem jeg er → Spørsmål → Kontakt → Footer.
- Adressefeltet sender GET til `/sjekk?url=` (samme parameter som dagens UrlCheck), kontakt­skjemaet POST til `/api/kontakt` (svarer med 303-omdirigering) – begge virker uten JavaScript.
- Datoformlene regnes i frontmatter: prototypedato = i dag + 3 døgn («søndag 11. oktober» ved bygging i dag), lanseringsuke = ISO-uke for i dag + 24 døgn (uke 44). FAQ-lista bygger også FAQPage-markupen, så tekst og strukturerte data deler kilde.
- Priser leses fra `src/data/priser.ts` (pakker, løpende, `prisvilkaar[0..2]`, lovsjekkpris + `prisenhet` i rapporten), fakta fra `firma.ts`/`navigasjon.ts`. Ingen tall skrevet av.
- Rytme og bunner følger v2 del 8 (tett/vanlig/pause, betong/papir/refleks/scene). Prisvelgeren er radioknapper med Start valgt (ren CSS `:has`-markering); kobling til video og aria-live-status kommer i bølge 3.2.

## Målt og kontrollert

- `npx astro check`: 0 feil, 0 advarsler (165 filer).
- Uten JavaScript (Playwright, JS av): alle 13 kontrollsetninger fra hero til footer finnes i brødteksten; scenen leses som liste under posteren. Skjermbilde `uten-js--mobil.png`.
- Aktiv scene: `data-aktiv` satt på mobil og desktop, video spoles, tittelfeltet er tett plate med 19,3:1-kontrast (`scene-aktiv--mobil/desktop.png`).
- Skjermbilder: 54 utsnitt i `.design/arbeid/bygger-forside/` (mobil/desktop × lys/mørk, 14 utsnitt), pluss `rettet/` etter selvkontroll. Mørkt tema er blåkopi, ikke svart.
- Vekt (dev, veiledende): HTML 77 kB, fonter 46+59 kB, hero-poster 19 kB. Endelig sidevekt og Lighthouse måles av revisor i bygget.

## Selvkontroll og AI-preg-sjekken (del 12)

- Rettet etter skjermbildene: `font-variant-numeric: tabular-nums` på rapportens emne og verdier ga «kodekonsulentene . no» og «0 , 1 s» – fjernet, tnum beholdes bare i Archivo-prisene.
- Ingen etiketter over overskrifter, ingen nummerering, ingen mono, ingen versaler med sperring, ingen «→»/midtprikker, ingen inntoning (overskriftsinntoning hører til bevegelses-øyeblikkene i 3.2), maks én stor ting per skjermhøyde.
- Begrunnede gjentakelser: «Book 20 minutter» ×3 er kontrolltekst (samme handling, samme navn – manusets note); «Illustrasjon laget med KI» ×2 er påbudt merking; påskriftene ved rapporten gjentar radverdiene på desktop fordi v2 4.2/7.6 pålegger målelinjer som peker på verdien (aria-hidden, vises bare ≥1024 px).
- Byttetesten: befaringsrapport i A4 med målelinjer, refleksfelt med blekkant og blåkopi-mørkt tema – består på skjermbildene. `kritiker` avgjør.

## Åpne punkter

1. Ytelse-raden i rapporten står som `MANGLER` til revisor har målt (manusets krav).
2. Arbeid og Hvem venter på eier: appnavn/tekst/tall, skjermopptak, portrett og navn (grå plassholdere nå).
3. Bølge 3.2: radio→video i prisvelgeren (med aria-live-status), levende rapportutfylling fra adressefeltet, øyeblikk 2/3/5/6 og overskriftsinntoning.
4. MalV2 laster ikke terminal.js/Snarveikart; /terminal er fortsatt lenket i footeren. Dirigenten avgjør om snarveiene skal inn i v2-malen i fase 4.
5. Footer-kolofonen «Illustrasjoner i scenene er laget med KI.» (v2 7.16 pkt. 7) er utelatt fordi tekstmanusets footer-tabell ikke har den; merkingen står ved scenen og prisvelgeren. Si fra om den skal inn.

Skillen `emil-design-eng` finnes ikke i oppsettet; `frontend-design` og `wai-implementation` ble lastet.
