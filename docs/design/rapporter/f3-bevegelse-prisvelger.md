# f3-bevegelse-prisvelger: øyeblikk 5

## Hva som er gjort

- **Prisvelger.astro**: egen komponent, ikke en utvidelse av Scene. Begrunnelse:
  Scene er rullestyrt og holder skjermen fast (sticky, --framdrift), prisvelgeren
  er valgstyrt og fester ingenting – felles er bare filkonvensjonen under
  `public/scener/<navn>/`, som er dokumentert i kontrakten.
- Prislista ER velgeren (designsystem 7.8): fieldset med legend, hver rad en
  `<label>` med ekte radioknapp. Første pakke valgt ved innlasting. Tilstandene
  fra 7.8: valgt rad fylles `--refleksflate` med ring/prikk i `--blekk` i begge
  temaer, pekt-på gir venstrekant, fokusring rundt raden, pris med `tnum`.
- Valg spoler videoen mykt til pakkens stoppunkt (props, f.eks. 0/3/6 s):
  rAF-drevet `currentTime`-interpolasjon med easeInOutCubic (tilnærmet
  `--inn-ut`) over `--tid-inn` lest fra CSS. Aldri `play()`, aldri lyd.
- Preload-strategien fra Scene: ingen henting før nærhet (IO 150 %) OG intensjon
  (rulling/berøring/tastatur/valg). Lastes videoen først ved et valg, hoppes det
  rett til stoppunktet uten myk spoling.
- Redusert bevegelse/Save-Data: skriptet trekker seg helt – radioknappene virker,
  posterbildet er stillrammen, ingen video hentes. Uten JavaScript: vanlig
  prisliste med Start valgt og poster.
- `role="status"`-linje leses opp ved valg («Valgt: {navn}…», mal som prop).
- Priser og tekster kommer fra bygger (`src/data/priser.ts`) – komponenten og
  testsiden inneholder ingen beløp (testsiden bruker «PLASSHOLDER kr»).
- Kontrakt lagt til i `docs/design/bevegelse.md` (props, eksempel mot den
  faktiske `pakker`-eksporten i priser.ts, uten JS, redusert bevegelse).
- Testside `lag-testside-prisvelger.mjs` (komponentkode ordrett via esbuild) og
  10 nye tester i `tests/bevegelse/prisvelger.spec.ts`. `server.mjs` genererer
  nå også denne siden.

## Målt

- Tester: **37 av 37 grønne** (15 scene + 12 øyeblikk + 10 prisvelger), inkl.
  valg → stoppunkt (0/3/5,95 s), myk spoling gjennom mellomliggende verdier,
  tastaturvalg med piltast, uten JavaScript, redusert bevegelse, mobil 9:16 og
  ingen vannrett rulling, ingen konsollfeil. Range-svar 206 kontrollert.
- `astro check`: 0 feil.
- Egen JavaScript, minifisert + gzip: Prisvelger **1 073 B**; alle fem
  bevegelseskomponentene til sammen **3,70 kB gzip** (budsjett 20 kB uten GSAP).
- Selvkontroll i `.design/arbeid/bevegelse/`: filmstriper
  `stripe-prisvelger-desktop/` og `stripe-prisvelger-mobil/` + stillbilder
  `valg-start/bedrift/system.png`. Kontrollert visuelt: Start viser tid 0,000,
  System viser 5,917 (slutten), valgt rad er fylt med lesbar tekst, mobilen
  legger prisen under navnet uten vannrett rulling.

## Rettet underveis

- Mobilbrudd (WCAG 1.4.10): prisraden var bredere enn 390 px; under 480 px
  legger prisen seg nå under pakkenavnet. Testen dekker det.

## Åpne punkter

- iOS ikke testet her: spoling krever én berøring først (samme lås som Scene);
  må prøves på ekte iPhone.
- Stoppunktene 0/3/6 er kortets eksempler; eier/kritiker bør se dem mot den
  ekte hero-videoen (A→B) og flytte dem hvis midtpunktet ikke treffer «Bedrift».
- GSAP-skillene og review-animations finnes ikke i miljøet; GSAP er uansett
  ikke installert, og kortet valgte ren CSS/JS.
