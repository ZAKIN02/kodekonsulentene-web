# Rapport f1-bygger-c: prototype for retning C «Prislista»

Oppdrag f1-bygger-c, 2026-10-08. Skills lastet: `frontend-design`, `wai-implementation`.
`emil-design-eng` finnes ikke i skill-lista og er ikke lastet.

## Hva som er bygget

- `src/pages/retning/c.astro` – frittstående side (egen HTML, egne stiler, noindex):
  topp med meny fra `navigasjon.ts`, første skjerm (H1 med pris og løfte, prisenhet,
  pakkevelger, «Book 20 minutter», sjekklenke), `<Scene navn="test">` etter prislista
  med kolofonen «Illustrasjon laget med KI», grå plassholder for casene (`#arbeid`),
  footer med fakta fra `firma.ts`. Lyst og mørkt tema via `prefers-color-scheme`.
- `src/components/retning-c/PrisVelger.astro` – tre radioknapprader (48 px/56 px),
  valgt rad får refleksfelt med 2 px kant. Egentegnet radio i `currentColor`, 24 px.
- `src/components/retning-c/Prisliste.astro` – `#med` «Det som er med i prisen»:
  innhold og vilkår, ingen beløp (manusets regel), «Ikke med» i mangelrød.
- Liten skript: tallet i H1 byttes ved pakkevalg («fra»-prefiks for System).
  Uten JavaScript viser H1 Start-prisen og radene står som vanlig prisliste.
- All tekst ordrett fra `docs/design/tekst/retning-c.md`. Farger, skala og kurver
  fra retning C i `docs/design/retning.md`, som CSS-variabler i egne filer.

## Målt (kontrollskript i `.design/arbeid/bygger-c/kontroll*.mjs`)

- H1 ved valg: Start «14 900 kr.», Bedrift «29 900 kr.», System «fra 60 000 kr.».
- Første Tab treffer «Til innholdet» (hopplenke).
- Uten JavaScript: H1 og alle 4 scene-steg leses som tekst, `<video>` uten `src`.
- Scene: framdrift 0,50 ved halvveis rulling ga videotid 2,98 s av 6,00 s.
- `npx astro check`: 0 feil i mine filer. 2 kjente typefeil i `Scene.astro` (låst fil,
  fantes før oppdraget).
- Sidevekt og Lighthouse: ikke målt – krever bygget side, det er `revisor` sitt.

## Selvkontroll (24→22 skjermbilder i `.design/arbeid/bygger-c/`, sett på mobil først)

Rettet etter første runde:
1. `font-variant-numeric: tabular-nums` lå på hele H1, så punktum fikk tallbredde
   («kr .»). Flyttet til selve pris-spennet.
2. Første skjerm gikk under folden: skala senket (topp ca. 108 px i stedet for 120,
   mobil ca. 48 i stedet for 56) og luft strammet. Nå står alt over folden på
   390×844 og 1440×900, som i retningsplanens skisser.
3. Footer hadde midtprikker som skilletegn (AI-preg-treff). Byttet til komma og rene lenker.
4. Scenen lå inne i sidens innrykk; fikk negativ marg så den åpner seg til full bredde.
5. Radioknappens eget mål økt til 24 px (WCAG 2.2).

AI-preg-sjekken, begrunnede ikke-rettinger (resten: ingen treff):
- «14 900 kr» står i H1 og i Start-raden: samme tall, én kilde – H1 speiler valgt rad
  og oppdateres av velgeren. Oppsettet er fastsatt i retningsplanen og briefen del 6.
- «To revisjonsrunder» står i Bedrift-lista og i vilkårene: begrunnet i manuset
  («Fjernet fordi det sto flere ganger», punkt 4).
- Tre pakkegrupper i `#med` deler oppsett, men er ren listetypografi uten kort,
  ramme eller bakgrunn – pakkene er en reell parallellstruktur.

## Åpne punkter

1. Schibsted Grotesk finnes bare som 700–800 selvhostet; brødtekst (400) bruker
   systemfont. Planen vil ha én familie til alt – trenger variabel fil 400–800.
2. Scenen stopper ikke ved valgt pakke (øyeblikk 5): `Scene` har ingen egenskap for
   stoppunkt, og komponenten er låst. Trenger avgjørelse/`bevegelse`.
3. Tematoggelen [◐] fra skissen er ikke bygget; tema følger `prefers-color-scheme`.
4. Sideoverganger (øyeblikk 4) gir ikke mening på én enkelt prototypeside; ikke bygget.
5. Caser etter scenen: grå plassholder «MANGLER: skjermbilder av appene (caser)».
