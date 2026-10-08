# Rapport: f2-bygger-tokens

Skrevet 2026-10-08 av `bygger`.

## Hva som er gjort

1. **`src/styles/tokens-v2.css`** (ny): alle tokens fra designsystem v2 del 9 – råfarger, rolletokens lyst og mørkt, typeskala, rom, rytmer, rutenett, kanter, radius og bevegelse (`--ut`, `--inn-ut`, `--tid-*`). Avvik fra v2 §9, pålagt i kortet: mørkt tema ligger under `@media (prefers-color-scheme: dark)`, ikke `[data-tema="mork"]`. Lyst på `:root`. `[data-spar="1"]` nuller `--tid-*` (Save-Data, settes av `bevegelse`).
2. **Fonter** i `public/fonts/` (der kartleggingen sier fonter bor; `public/fonter/` finnes ikke):
   - `schibsted-grotesk-var-latin.woff2` 46 068 B, `schibsted-grotesk-var-latin-ext.woff2` 18 392 B, `archivo-var-latin.woff2` 59 208 B.
   - Kilde: `SchibstedGrotesk[wght].ttf` og `Archivo[wdth,wght].ttf` fra github.com/google/fonts (curl, bygg-tid). Instansiert (Schibsted wght 400–700; Archivo wght 700–800, wdth 75–112) og subsettet til Googles latin/latin-ext-områder med fontTools 4.51, alle OpenType-funksjoner beholdt. Til sammenligning: Googles egne filer med fulle akser er 46,9 / 20,8 / 90,1 kB – vår Archivo er 31 kB mindre.
   - Gamle filer (JetBrains Mono, Schibsted 700–800) står urørt; `fonter.css` og `Base.astro` bruker dem fortsatt.
3. **`src/styles/fonter-v2.css`** (ny): `@font-face` med `font-display: swap`, `unicode-range` (latin-ext bare via range), `font-stretch: 75% 112%` for Archivo, og reservefonter med beregnede metrikker.
4. **Slettet:** `src/pages/retning/b.astro`, `src/pages/retning/c.astro`, `src/components/retning-b/`, `src/components/retning-c/`. Ingen andre filer refererte dem (grep). Prototype A beholdt.
5. **`assets/LICENSES.md`:** to nye rader for de tre v2-fontfilene, SIL OFL 1.1, kilde og dato.

## Målt

- **Kontroll i Archivo-fila (metode: fontTools, programmatisk – cmap og GSUB/GPOS FeatureList – pluss visuell kontroll på testsiden):** `tnum` finnes: ja. æ, ø, å, Æ, Ø, Å finnes: ja (alle i cmap etter instansiering). Sifre 0–9: ja. Akser etter instansiering: wght 700–800, wdth 75–112 (lest fra fvar).
- Schibsted latin: `tnum` ja, æøåÆØÅ ja, akse wght 400–700.
- **U+202F (smalt hardt mellomrom) finnes ikke i noen av kildefontene.** Nettleseren faller til systemfont for det ene tegnet; det tegner som smalt mellomrom og brekker ikke. Se åpne punkter.
- Reservefont-metrikker (beregnet fra filene med fontTools, snittbredde over a–å/A–Å/0–9/tegnsetting): Schibsted mot lokal Arial: size-adjust 101,15 %, ascent 96,55 %, descent 25,49 %, line-gap 0 %. Archivo mot lokal Arial Narrow Bold: size-adjust 124,37 %, ascent 70,60 %, descent 16,89 %, line-gap 0 %.
- Testside og 12 skjermbilder i `.design/arbeid/bygger-tokens/` (mobil/desktop × lyst/mørkt): vekter 400/500/700 tydelig adskilt, prisene med `tnum` står rett under hverandre (og synlig forskjellig fra radene uten `tnum`), latin-ext-tegn (Š Ž Ő Ę Č) i samme familie, mørkt tema er blåkopi, scenen `#080809`, refleksflate med blekkant.
- Dev-server 4337: `/retning/a` 200, `/retning/b` og `/retning/c` 404, `/fonts/archivo-var-latin.woff2` 200.

## Selvkontroll (del 12)

Gjennomgått mot skjermbildene. Ett treff: en midtprikk som pynt mellom fargeprøvene på testsiden – rettet til «og». Ellers ingen etiketter, nummerering, mono, versaler, piler, kort-repetisjon eller inntoning (testsiden er statisk). Skillene `frontend-design` og `wai-implementation` lastet; `emil-design-eng` finnes ikke i skill-lista.

## Åpne punkter

1. **U+202F mangler i fontene.** Priser som «14 900 kr» får mellomrommet fra systemfont. Alternativ: bruk U+00A0 (finnes) med `letter-spacing`, eller godta fallback. Den som bygger prislista bør vite det.
2. Forhåndslast av `schibsted-grotesk-var-latin.woff2` og `archivo-var-latin.woff2` skjer i malen (`Base.astro` eller ny v2-mal) – låst fil, eies av forside-byggeren.
3. Gamle fontfiler og `fonter.css` kan først slettes når de gamle sidene er lagt om (v2 §3.1 sier JetBrains Mono skal bort).
4. `scripts/skjermbilder.mjs` kjørte testsiden fra `file://`; fontstiene i selve `fonter-v2.css` (`/fonts/…`) er derfor verifisert via dev-serveren (200), tegningen via en identisk shim i testsiden.
