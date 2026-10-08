# f3-bevegelse-oyeblikk: øyeblikk 2, 3 og 6

## Hva som er gjort

- **Loft.astro** (øyeblikk 2): overskrift løftes inn linje for linje med CSS-maske
  (overflow-klipp per linje) og `transform`, én gang, ved 20 % synlighet. `--tid-inn`
  og `--ut` fra tokens, forsinkelse `--tid-inn-trinn` per linje. Ingen GSAP (ikke
  installert, kortets ramme). Etter animasjonen settes ren tekst tilbake; under
  animasjonen bærer `aria-label` hele teksten for skjermlesere.
- **CaseVideo.astro** (øyeblikk 3): `<video muted playsinline loop preload="none">`
  med poster. Ingen `src` før peker/fokus (desktop, `hover: hover`) eller 40 %
  synlighet (mobil). Mangler fil på disk: plassholder «MANGLER: skjermopptak».
- **Reel.astro** (øyeblikk 6): `<dialog>` med `<video controls>`, `src` settes først
  ved klikk. Åpnes på `--tid-svar-lang`/`--ut` (opacity + scale). Lukkeknapp får
  fokus, Esc/klikk utenfor lukker, video pauses, fokus tilbake. Uten JS er knappen
  en lenke rett til fila. Samme plassholderregel.
- Kontrakten i `docs/design/bevegelse.md` har nå alle fire komponentene (hva, props,
  eksempel, uten JS, redusert bevegelse).
- Testside `tests/bevegelse/lag-testside-oyeblikk.mjs` (komponentkode ordrett,
  typene fjernet med esbuild) + 12 nye tester i `tests/bevegelse/oyeblikk.spec.ts`.

## Endringer utenfor de nye filene (begrunnet)

- `tests/bevegelse/server.mjs`: serverer også `/oyeblikk.html`, genererer begge sider.
- `tests/bevegelse/lag-testside.mjs`: transpilerer scenens skript med esbuild (TS → JS).
- `Scene.astro`: én linje, `querySelectorAll<HTMLElement>` – rettet 2 eksisterende
  `astro check`-feil. Ingen endring i oppførsel; alle scene-testene fortsatt grønne.
- `astro check`: 0 feil i hele repoet etter endringene (var 10, alle i bevegelse/).

## Målt

- Tester: **27 av 27 grønne** (15 scene + 12 øyeblikk), inkl. redusert bevegelse,
  uten JavaScript, mobil og «ingen konsollfeil». Range-svar 206 kontrollert.
- Egen JavaScript, minifisert + gzip: Scene 1 088 B, Loft 730 B, CaseVideo 499 B,
  Reel 400 B. **Sum 2,65 kB gzip** – godt innenfor 20 kB-budsjettet uten GSAP.
- Filmstriper (desktop + VISNING=mobil) i `.design/arbeid/bevegelse/stripe-oyeblikk-*`:
  tekst lesbar i alle ruter, overskriftene ender som ren, synlig tekst, case-video
  spiller bare ved peker/synlighet, plassholder tydelig på mørk flate. Selve løftet
  (560 ms) er kortere enn stripeintervallet; bevegelsen er dokumentert i opptak.webm
  og av testene («deles i linjer og løftes inn med forsinkelse per linje»).

## Skills

`emil-design-eng`, `find-animation-opportunities`, `review-animations`, `gsap-*`
finnes ikke i miljøet. Fortsatte uten; GSAP var uansett utelukket av kortet.

## Åpne punkter

- iOS er ikke testet her (gjelder Scene-endringen og videoavspilling generelt);
  må prøves på ekte iPhone.
- Ekte skjermopptak fra eier mangler for øyeblikk 3 og 6 – komponentene viser
  «MANGLER: skjermopptak» til filene ligger i `public/`.
- Øyeblikk 4 (sideoverganger) og 5 (prisvelger) er ikke del av dette kortet.
- Plassholderen avgjøres ved bygging (fil på disk); i Playwright-testsiden speiles
  den logikken i generatoren, ikke i Astro-frontmatteren selv.
