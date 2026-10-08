# Rapport f1-bygger-a: prototype for retning A «Befaring»

Oppdrag f1-bygger-a, 2026-10-08. Skills lastet: `frontend-design`, `wai-implementation`.
`emil-design-eng` finnes ikke i skillisten – fortsatte uten.

## Levert

- `src/pages/retning/a.astro` – frittstående side (egen HTML, egne stiler, noindex, `lang="nb"`).
  Første skjerm med H1 «Gratis befaring av nettsiden din», adressefelt som hovedhandling
  (`method="get" action="/sjekk"`, `name="url"` – virker uten JavaScript), refleksknapp med 1 px
  blekk-kant, hint og booklenke. Scenen stikker 64 px opp over folden, som i skissen.
- `src/components/retning-a/Rapport.astro` – befaringsrapporten som papirark i A4-proporsjon
  (`#rapport`, målet for scenens hopplenke). Fem utfylte rader, tre tomme linjerte rader
  (dit besøkendes sjekk fylles «linje for linje»), fastprisfelt i refleks og «Book 20 minutter».
- `<Scene navn="test">` brukt uendret, med de fire stegene fra manuset og kolofonen
  «Illustrasjon laget med KI» rett under. Tekst ordrett fra `docs/design/tekst/retning-a.md`.
  Pris og prisenhet leses fra `src/data/priser.ts`, menyen fra `src/data/navigasjon.ts`.
- Farger, fonter og mål som tokens i sida, fra retning A i `docs/design/retning.md`. Mørkt tema
  via `prefers-color-scheme`: blekk bunn, papir tekst, lenker `#8FA2FF`; arket forblir papir.

## Målt

- Scenen følger rullingen: `--framdrift` 0,60 ga videotid 3,56 s av 6 s på mobil og desktop;
  mobil fikk `test-mobil.mp4`, desktop `test-1080.mp4`. Serveren svarte 206 på Range.
- Uten JavaScript: alle 7 nøkkeltekster til stede som tekst, `video.src` er null, `preload="none"`.
- Tastatur: Tab-rekkefølge logo → 7 menylenker → felt → knapp → booklenke → «Hopp over
  animasjonen». Synlig fokus via `:focus-visible` (2 px omriss i lenkefargen).
- Vekt (ukomprimert fra dev-server): HTML 20,0 kB, Schibsted-font 46,9 kB (+ latin-ext ved behov),
  logo-SVG 16,7 kB, poster.avif 33,0 kB. Egen JavaScript: bare Scene-skriptet (inline, ~2 kB).
- Kontraster er de beregnede parene i retning.md; `revisor` måler.
- 18 skjermbilder i `.design/arbeid/bygger-a/runde-02/` (mobil/desktop × lyst/mørkt), pluss
  `aktiv-scene--{mobil,desktop}.png` og `uten-js--mobil.png` i runde-01. Ingen konsollfeil.

## Rettet etter selvkontroll (runde 1 → 2)

1. «0,1 s» fikk rar spredning av `tabular-nums` på komma – fjernet fra radverdiene.
2. Arket hadde et stort tomrom mellom radene og fastprisen – byttet til tre tomme, linjerte
   skjemalinjer, så arket leser som et halvutfylt skjema i stedet for et hull.
3. Fra første utkast: `main` omsluttet bare heroen – restrukturert så hero, scene og rapport
   ligger i `main`; feilfarge i mørkt tema byttet fra lenkeblå til `#FF8A73` (fra retning.md).

## AI-preg-sjekken (del 12)

Ingen etiketter over overskrifter, ingen nummerering, ingen monospace, ingen sperrede versaler,
ingen piler/midtprikker, ingen kort, ingen inntoninger, én stor ting per skjermhøyde.
To treff som begrunnes: (1) «Book 20 minutter» står to ganger – hero.booklenke og rapport.knapp
er begge definert i manuset; rapportknappen er blekk, ikke refleks, så bare handlingen gjentas.
(2) «MANGLER:» i versaler er den påbudte markøren for manglende innhold, ikke typografi.
Byttetesten avgjøres av `kritiker` på skjermbildene.

## Åpne punkter

1. Archivo (karakterfonten) er ikke selvhostet; hero bruker selvhostet Schibsted Grotesk 800 som
   nærmeste erstatning uten tredjepartskall. Trenger Archivo variabel som woff2.
2. Schibsted Grotesk finnes bare som 700–800; brødtekst bruker systemfont til 400-fila finnes.
3. Ytelsesraden i rapporten står som «MANGLER: målt ytelsestall» til `revisor` har målt.
4. `rapport.status` («Befaringen pågår …») hører til koblingen mot den ekte sjekken og er ikke
   bygget inn i prototypen. Tema-knappen [◐] fra skissen er heller ikke bygget; tema følger
   `prefers-color-scheme`.
5. Stegteksten i scenen ligger lyst over videoen (fra Scene-komponenten); testklippet er lyst, så
   kontrast over video må kontrolleres mot de ekte, mørke hero-klippene når de kommer.
