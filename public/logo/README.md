# Logo

Monogrammet «KK» er satt i Schibsted Grotesk 800 med −0,06em sperring, konvertert til baner, så filene trenger ingen font. Tegningen er bygget av bokstavenes egne former; ingen ekstra symbol.

- `kk-mark.svg` – hovedmerket: `ink` (lys-temaets verdi, `#14171b`) på en flis i `accent` med hjørne på 1/8 av siden (8px ved 64px). Fungerer på begge grunner. Minste størrelse 24px.
- `kk-mark-inverse.svg` – flis i `ink` med bokstaver i `accent`. Til mørke app-ikonkontekster og der limegrønn flate blir for dominerende.
- `kk-mark-mono-dark.svg` / `kk-mark-mono-light.svg` – bare bokstavene, én farge: `#e9ecef` (ink i mørkt tema) og `#14171b` (ink i lyst tema). Enfarget SVG arver ikke farge via `<img>`, derfor to filer.
- `kk-wordmark-dark.svg` / `kk-wordmark-light.svg` – «KodeKonsulentene» som baner, 28px kapitélhøyde-basert i 40px høyde, −0,03em sperring. Samme to blekkfarger.
- `kk-lockup-dark.svg` / `kk-lockup-light.svg` – merke (40px) + 12px mellomrom + ordmerke. Standard i header og footer.
- `kk-app-icon-1024.png` – `kk-mark.svg` rastrert til 1024×1024 for App Store, favicon-generering og sosiale profiler.

Regler: friareal rundt merket er minst bredden på K-ens stamme (ca. 1/8 av flisen). Ikke roter, skaler ulikt, legg til skygge eller gradient, eller sett merket på en annen farge enn `bg`, `bg-raised` eller `terminal`. I `Terminal` og i footerens metalinje kan navnet fortsatt skrives som `~/kodekonsulentene` i `mono` – det er ikke en logo, men en signatur.
