# wow-a1 felles: MalWow og felleskomponentene for undersidene

Gren `redesign/wow`, dev 4700, ikke committet. Bygget én gang til `node_modules/.a1-dist` (utenfor prosjektet feilet bygget: `piccolore` ble ikke funnet), slettet etterpå. Skills: frontend-design, emil-design-eng, wai-implementation (gren/PR-delen fulgt ikke: kortet sier ingen commit).

## Resultat

- **MalWow:** `bevegelse: "film" | "rolig"`, `artikkel` (og:type=article og datoene), `bookHref`. Rendrer `BevegelseFilm` (index.ts) eller `BevegelseRolig` (A2 sin rolig.ts), aldri begge. Intro bare på `/`; andre film-sider får `FilmKlar` (samme tidlige klasser uten inngangen). Snarveikartet (wow-port), terminalen (hentes ved første `~`, `¨`, Ctrl/Cmd+K eller pil opp; straks der den står innfelt), tabindex-skriptet for sidelengs tabeller. Bunn `rull={false}` på rolig.
- **Hode:** forsiden uendret (`#sw-kapittel-1`, `#priser`). Undersidene: «Tjenester» som `<details>`-panel med løsningslinja fra historie.ts, `/priser`, `aria-current`, Esc og klikk utenfor lukker.
- **Generalisert, ikke kopiert:** Kontakt (`niva`, `idPrefiks`, `tilstand`, `fakta`), Priser (`variant`, `pakker`, `valgt`, `gruppe`, `tittel`, `ingress`, `niva`, `lenkeTilPriser`, `id`), Sporsmal (`tittel`, `id`, `storrelse`, `innfelt`), Prosess (datoer valgfrie, bruker Steg), Garanti (`inngang`, `hoved`, `under`, slot).
- **Nye i `src/components/wow/side/`:** SideHode, Seksjon, Brodsmuler, Lampe, Maaling, Rapportark, UrlFelt, Verktoyramme, Artikkelkropp, Kravrader, Tekstrader, Steg, Opptak, Videre, Flyt, Handlinger, Snarveier, FilmKlar, BevegelseFilm, BevegelseRolig, `maaling.ts`, `prosessdatoer.ts`, `tittel.ts`, `index.ts` (én import med plannavnene). Katalog: `/lab/wow-side`.
- **Tokens:** de åtte fra planen pluss `--wow-maal-innhold`. `wow-terminal.css` (terminal og snarveier).

## Målt

- Forsiden før/etter: `.design/arbeid/a1-felles/{for,etter}/`. Toppskjerm i 8 varianter (mobil/desktop × redusert/full × med/uten JS): 0 ulike piksler. Hel side mobil med JS: 847 piksler, bare datoen i «Slik går det» (dato skiftet 18.→19. nov., `dato-for-etter.png`). Øvrige avvik er bilder som ikke var lastet (lazy) i én av opptakene (`krop-*.png`). HTML-diff uten stil: bare `data-bevegelse`, `data-hode-meny`, dialogen og skriptene lagt til.
- Egen JS gzip i bygget: forsiden 63,4 kB filer + 1,9 kB inline = 65,3 kB (≤ 70). Rolig (`/lab/wow-side`) 1,8 + 2,1 = 3,9 kB, ingen GSAP/Lenis (≤ 20). Med terminal.js ved load var forsiden 71 kB; derfor hentes den ved tastetrykk.
- axe (WCAG 2.2 AA): 0 brudd på `/` og `/lab/wow-side`, 390 og 1440. Én H1, ingen sidelengs overflyt, første Tab = hopp-lenken. Uten JS: 0 skjulte tekstelementer, menyen virker.
- Funksjon: `~`, Ctrl+K, Esc, `?`, `g`-brikken, Tjenester-panel (Esc gir fokus tilbake), Opptak-knapp. Skript: `.design/arbeid/a1-felles/funksjon.mjs`.
- Kontrast nye par: feil på flate 6,49, på flate-hev 5,99; refleks på flate 14,04; kryss på feil 7,05; stiplet ring 4,02 (kant, krav 3). Ingen hex/rgb/ms/px i nye filer utenom mediespørringer.
- `npm run test` 342/342. `npm run check` 0 feil.

## Rettet etter selvkontrollen

Tjenester-panelet arvet `display: flex` fra menyen (vannrett) → egen regel. Lampa sto over navnelinja på desktop → sentrert. SideHode med høyre spalte strakk teksten over hele høyden → `align-content: start`. Forsiden gikk over 70 kB med terminal.js → hentes ved tastetrykk. Krysset i bruddlampa brukte `1px` → `--wow-kant-1`. «Tatt opp» foran opptaksdatoen var egen tekst → fjernet.

## AI-preg (del 12)

Ingen etiketter over overskrifter, ingen «→», ingen nummerering utenom kildelista (en liste) og vilkår. Monospace bare i `<code>`/`<pre>`, terminalen og tastene i snarveikartet. Ingen inntoning. Flyt har fem like bokser, men det er én figur med en rekkefølge, ikke kort.

## Avvik fra planen

- `wow-maaling.ts` og `prosessdatoer.ts` ligger i `side/` (kortet ga meg ikke `src/lib/`); `brodsmuleLedd` er ikke lagt i schema.ts, Brodsmuler leser `brodsmuler()` direkte (samme kilde). Siste ledd heter «Hjem» som i BreadcrumbList, ikke «Forsiden».
- Ingen `tests/wow/felles.spec.ts` (ikke på kortet). View transitions (del 1.2) ikke lagt inn: bevegelse sin.
- Opptak bruker ikke `mobil`-varianten i opptak.json (plakaten kan ikke byttes per skjerm).

## Åpne punkter

1. `tema` i `public/terminal.js` sier fortsatt «bytt mørkt og lyst» og bytter `data-theme` (virkningsløst i wow). Fila er ikke min, og det finnes ingen tekst for «bare mørkt». Forslag: fjern kommandoen når Base.astro er borte (bølge C).
2. Tekster som ikke står i `docs/design/tekst/`: «Venter», «Spill av»/«Pause» (Opptak), «Innhold», «Kilder», «Les videre», «sist sjekket», forfatterlinja (fra planen del 1.7). Tekstforfatter bør godkjenne.
3. Trenger avgjørelse: skal forsiden også få Tjenester-panelet? Nå har den ankerlenken til filmen (uendret).
4. Snarveier.astro er en kopi av v1 Snarveikart (samme liste og skript) til v1 slettes.
5. Forsiden fikk to nye skjulte ting: snarveikartet og terminalen. Synlig er ingenting endret.
