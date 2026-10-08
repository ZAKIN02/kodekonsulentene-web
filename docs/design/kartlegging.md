# Kartlegging av repoet (f0-kartlegger-repo)

Grenen er `redesign/befaring`. Mappen `kodekonsulentene-redesign-startpakke/` er holdt utenfor. Alt er lest, ingenting er kjørt (ingen build, ingen server, ingen tester). Alle linjenumre er mot arbeidstreet slik det står nå.

## Avvik fra briefen og CLAUDE.md (les først)

1. **Briefens del 4 beskriver en eldre forside.** Forsiden har i dag video-flater, ikke bare logoen: `src/pages/index.astro:355-363` (`<Storflate>` med `/scener/floke-*.mp4`) og `src/components/Apning.astro` (åpningsoverlegg, vises på `/` via `src/layouts/Base.astro:69,135`). Heroen har et pris-anker (`index.astro:107-114`) som del 4 ikke nevner.
2. **Kursivordet er ikke kursivt.** `<em>systemer</em>` står i `index.astro:84`, men `src/styles/site.css:347` setter `.hero h1 em { font-style: normal; color: var(--accent-text); }`. Det er aksentfarge, ikke kursiv. Det finnes ingen `font-style: italic` i `src/styles/` (grep, ingen treff). Den ene `<em>` i en overskrift er denne.
3. **Flere API-ruter enn CLAUDE.md sier.** CLAUDE.md:«Bare `/api/sjekk`, `/api/kontakt` og `/kontakt` har `prerender = false`». Faktisk har seks API-ruter og `/kontakt` det: `src/pages/api/ai-tekst.ts:41`, `cookie-sjekk.ts:16`, `dmarc.ts:13`, `kontakt.ts:13`, `sjekk.ts:18`, `uu-sjekk.ts:16`, og `src/pages/kontakt.astro:15`.
4. **`/historie` finnes ikke som side.** Fila er slettet (siste commit på `src/pages/historie.astro`: `0513d46`). `server.mjs:295-297` svarer 301 til `/nettsider`. Likevel står `/historie` i begge Lighthouse-konfigene (`lighthouserc.json:13`, `lighthouserc.desktop.json:13`).
5. **Kommentarer i `index.astro` beskriver film som ikke finnes i markupen.** `index.astro:154-172` sier at ett klipp spoler gjennom tre seksjoner via `SceneFilm`, men `<div class="scenefilm-ramme">` (`:173-195`) inneholder ingen `SceneFilm`. `SceneFilm.astro` og `HeroFilm.astro` importeres av ingen side (grep, 0 treff). `index.astro:345-346` har en tom `<Avslor trinn={1}>`. Akt 2-kommentaren (`:326-344`) beskriver en flate som ikke er der.
6. **CSP tillater `frame-src https://cal.com https://app.cal.com`** (`sikkerhet.mjs:51-52`, kommentar: «Cal.com-innbyggingen på /kontakt»), men det finnes ingen `<iframe>` i `src/` (grep). Booking er en vanlig lenke: `bookUrl` i `src/data/firma.ts:78`, brukt på `kontakt.astro:88`. Døde tillatelser.
7. **`npm run se`, `kontrast` og `ytelse` peker på `.skudd/*.mjs`** (`package.json:scripts`). `.skudd/` er gitignorert (`.gitignore`), så scriptene finnes bare lokalt. Filene finnes i dag (`.skudd/filmstripe.mjs`, `herokontrast.mjs`, `lh.mjs`). Briefens `scripts/filmstripe.mjs` finnes også.
8. **CLAUDE.md sier `test/lansering.test.ts` er rød så lenge org.nr. er plassholder.** `src/data/firma.ts:36` har `orgnr: "936374336"`. Ikke kjørt, så jeg vet ikke om testen er grønn nå.
9. `src/pages/robots.txt.ts:7-8` sier 43 .astro-sider. Jeg teller 42 (tabellen under).

## 1. Rammeverk, kommandoer, hosting, headere

| Punkt | Verdi | Kilde |
|---|---|---|
| Rammeverk | Astro 7.3.5, `@astrojs/node` 11.1.6, `@astrojs/sitemap` ^3.7.4, TypeScript ^5.9.3, ESM (`"type": "module"`) | `node_modules/astro/package.json:3`, `node_modules/@astrojs/node/package.json:4`, `package.json` |
| Rendering | Statisk som standard, adapter `node({ mode: "middleware" })`, `build.inlineStylesheets: "always"`, `security.checkOrigin: false` (opphavskontroll i `src/lib/opphav.ts`), prefetch `hover` | `astro.config.mjs:63-95` |
| Server i drift | `server.mjs` (rå Node `createServer`): setter headere, serverer `dist/client` med brotli/gzip, Range og ETag, sender resten til Astro | `server.mjs:1-12`, `:299-338` |
| Dev | `npm run dev` = `astro dev`. Går ikke gjennom `server.mjs`, bruker `src/middleware.ts` | `package.json`, `src/middleware.ts:1-8` |
| Bygg | `npm run build` = `astro build` | `package.json` |
| Test | `npm run test` = `node --test "test/**/*.test.ts"`. `npm run check` = `astro check`. `npm run verify` = test, check, build | `package.json` |
| Visuell test | `npm run visuell` = `playwright test` (bygger og starter `server.mjs` på 4399) | `playwright.config.ts:49` |
| Start | `npm start` = `node ./dist/server/entry.mjs` (**merk:** ikke `server.mjs`). Docker og Lighthouse bruker `node server.mjs` | `package.json`, `Dockerfile:42`, `lighthouserc.json:4` |
| Andre scripts | `deploy` (fly deploy), `lhci`, `og`, `bilde`, `scene`, `dns:list/plan/apply` | `package.json` |
| Hosting | Fly.io, app `kodekonsulentene`, region `ams`, `shared-cpu-1x` 512 MB, `min_machines_running = 1`, helsesjekk `GET /status` hvert 30. s | `fly.toml:5-6,24,33-38,40-43` |
| Container | `node:22-alpine`, tre trinn, kjører som `node`, `CMD ["node","server.mjs"]` | `Dockerfile:4,17,23,35,42` |
| Domene/DNS | GoDaddy, skript `scripts/dns-godaddy.mjs` | `CLAUDE.md`, `package.json` |
| Sikkerhetsheadere (kilde) | `sikkerhet.mjs`: `SIKKERHETSHEADERE` (`:107-117`), CSP `CSP_BASIS` (`:37-55`), `PERMISSIONS` (`:57-62`), temaskript `TEMA_SCRIPT` (`:21-26`) med hash (`:28`) | `sikkerhet.mjs` |
| Hvor de settes | `server.mjs:36` (`lagSikkerhetsheadere(SKRIPTHASHER)`), `:70-72` (`settHeadere`), `:300` (på hvert svar). SSR-HTML får CSP regnet av eget innhold: `:250-275`. Hasher for inline-skript leses fra `dist` ved oppstart: `sikkerhet.mjs:75-99` | `server.mjs` |
| Middleware | Setter alle headere unntatt CSP (`src/middleware.ts:15,22`). Kun for dev og Astro-rendrede svar | `src/middleware.ts` |
| CSP i korte trekk | `script-src 'self'` + sha256-hasher, **ingen** `unsafe-inline` for script. `style-src 'self' 'unsafe-inline'` (pga. inlinet CSS). `img-src 'self' data:`, `media-src 'self'`, `font-src 'self'`, `connect-src 'self'`, `frame-ancestors 'none'` | `sikkerhet.mjs:37-55` |
| Cache | `/_astro/` og `/fonts/`: `public, max-age=31536000, immutable`. HTML: `public, max-age=0, must-revalidate` | `server.mjs:115-128` |
| Omdirigering | `/historie` til `/nettsider` (301) | `server.mjs:295-297,305-309` |
| Hemmeligheter | `fly secrets set`; nøkler: `PAGESPEED_API_KEY`, `RESEND_API_KEY`, `RAPPORT_FRA`, `RAPPORT_KOPI`, `SKANNER_URL`, `SKANNER_NOKKEL`, `ANTHROPIC_API_KEY`, `CLAUDE_MODELL` | `src/env.d.ts:4-16`, `.env.example`, `src/lib/env.ts` |
| Egen tjeneste | `services/skanner/` (Chromium-skanner, egen Fly-app, krever `x-skanner-nokkel`) | `services/skanner/server.mjs:1-10`, `services/skanner/fly.toml` |
| Sitemap | `@astrojs/sitemap`, `/lab/*` filtrert bort, prioritet per sti | `astro.config.mjs:73-86` |

## 2. Alle sider

Mal: alle sider bruker én layout, `src/layouts/Base.astro` (importert på linje 2 eller tilsvarende i hver fil; `Base` er den eneste fila i `src/layouts/`). Kolonnen «Innhold» viser byggeklossene i siden, fra tellinger i filen.

| URL | Fil | Mal / oppbygging |
|---|---|---|
| `/` | `src/pages/index.astro` | Base + egen hero (`<section class="hero">` `:81`) + `Scene` ×7 (n=3..9) + `ContactBlock n=10`. Åpning (`Apning`) bare her |
| `/nettsider` | `src/pages/nettsider.astro` | Base + `Mega` h1 + `Scene` ×6 + `ContactBlock` |
| `/systemer` | `src/pages/systemer.astro` | Base + `Mega` + `Scene` ×4 + `ContactBlock` |
| `/apper-og-ai` | `src/pages/apper-og-ai.astro` | Base + `Mega` ×2 + `Scene` ×5 + `ContactBlock` |
| `/sikkerhet` | `src/pages/sikkerhet.astro` | Base + `Mega` + `Scene` ×5 + `ContactBlock` |
| `/priser` | `src/pages/priser.astro` | Base + `Mega` + `Scene` ×5 + `Prisvelger` (`:156`) + `ContactBlock` |
| `/caser` | `src/pages/caser.astro` | Base + `Mega` + `Scene` + `ContactBlock` |
| `/om` | `src/pages/om.astro` | Base + `Mega` + `Scene` ×3 + `ProofStrip` (`:152`) + `ContactBlock` |
| `/kontakt` | `src/pages/kontakt.astro` | Base + `Mega` + `Scene` ×2 + eget skjema. **SSR** (`prerender = false`, `:15`). Ingen `ContactBlock` |
| `/handbok` | `src/pages/handbok.astro` | Base + `Mega` + `Scene` ×2 + `ContactBlock` |
| `/sjekk` | `src/pages/sjekk.astro` | Base + `Mega` + `Scene` + `Section` ×3 + `ContactBlock` |
| `/status` | `src/pages/status.astro` | Base + `Mega` + `Scene` ×3. Er også helsesjekken for Fly (`fly.toml:38`) |
| `/terminal` | `src/pages/terminal.astro` | Base + `Section` |
| `/personvern` | `src/pages/personvern.astro` | Base + `Section` |
| `/vilkar` | `src/pages/vilkar.astro` | Base + `Section` |
| `/verktoy` | `src/pages/verktoy/index.astro` | Base + `Mega` + `Scene` ×3 + `ContactBlock` |
| `/verktoy/cookie-sjekk` | `src/pages/verktoy/cookie-sjekk.astro` | Base + `Mega` + `Scene` ×3 + `ContactBlock` |
| `/verktoy/dmarc` | `src/pages/verktoy/dmarc.astro` | som over |
| `/verktoy/priskalkulator` | `src/pages/verktoy/priskalkulator.astro` | som over |
| `/verktoy/uu-sjekk` | `src/pages/verktoy/uu-sjekk.astro` | som over |
| `/bransjer/handverkere` | `src/pages/bransjer/handverkere.astro` | Base + `Mega` + `Scene` ×5 + `ContactBlock` |
| `/bransjer/klinikker` | `src/pages/bransjer/klinikker.astro` | som over |
| `/artikler` | `src/pages/artikler/index.astro` | Base + `Section` + `ContactBlock` |
| `/artikler/35-wcag-krav` | `src/pages/artikler/35-wcag-krav.astro` | Base + `Section` + `ContactBlock` (artikkelmal, `artikkel`-prop i Base `:30`) |
| `/artikler/cookies-for-samtykke` | `src/pages/artikler/cookies-for-samtykke.astro` | som over |
| `/artikler/orgnr-pa-nettsiden` | `src/pages/artikler/orgnr-pa-nettsiden.astro` | som over |
| `/artikler/wcag-i-registeret` | `src/pages/artikler/wcag-i-registeret.astro` | som over |
| `/404` (rendres ved ukjent URL) | `src/pages/404.astro` | Base + `Section`, `noindex` (`:26`) |
| `/robots.txt` | `src/pages/robots.txt.ts` | Genereres ved bygg |
| `/lab/bevegelse`, `/lab/bibliotek`, `/lab/form`, `/lab/ikoner`, `/lab/interaksjon`, `/lab/lek`, `/lab/mening`, `/lab/og`, `/lab/rontgen`, `/lab/storflate`, `/lab/sveip`, `/lab/svg`, `/lab/teknikker`, `/lab/typo` | `src/pages/lab/<navn>.astro` (14 filer) | Base, alle `noindex`, ikke i sitemap (`astro.config.mjs:78`) |
| `POST /api/sjekk`, `/api/kontakt`, `/api/ai-tekst`, `/api/cookie-sjekk`, `/api/dmarc`, `/api/uu-sjekk` | `src/pages/api/<navn>.ts` | SSR-endepunkter (se avvik 3) |
| `/historie` | ingen fil | 301 til `/nettsider` i `server.mjs:295-297` |

Totalt 42 `.astro`-sider (16 i roten, 5 artikler, 2 bransjer, 5 verktøy, 14 lab), 1 `.ts`-side, 6 API-ruter. `docs/sidemonstre.md` og `src/data/navigasjon.ts` (hovedmeny `:3-11`, footer `:28-47`) styrer rekkefølge og lenker.

## 3. Felles filer (kandidater til «låste filer»)

**Maler og konfigurasjon**
- `src/layouts/Base.astro` (eneste layout; `<head>` `:79-132`, fontpreload `:118-119`, temaskript `:128`, tema-knapp `:163-172`, scroller-skript `:174-212`, `/apning.js` `:216`, `/terminal.js` `:217`, `/hero-live.js` `:218`, `<Snarveikart>` `:223`)
- `src/middleware.ts`, `sikkerhet.mjs`, `sikkerhet.d.ts`, `server.mjs`
- `astro.config.mjs`, `tsconfig.json`, `package.json`, `package-lock.json`, `Dockerfile`, `fly.toml`, `playwright.config.ts`, `lighthouserc.json`, `lighthouserc.desktop.json`, `.github/lighthouse-budsjett.json`, `.github/workflows/*`
- `src/pages/robots.txt.ts`

**Global CSS og tokens** (Base importerer i denne rekkefølgen: `fonter.css`, `tokens.css`, `components.css`, `site.css`, `Base.astro:3,5,6,7`)
- `src/styles/tokens.css` (136 linjer): farger mørk `:2-25`, lys `:27-50`, `.flate--varm` `:111-136`, spacing `--space-1..9` (4 til 96 px), radius, `--font-display/--font-sans/--font-mono` `:70-72`, typografiklasser `.display-xl … .mono-label` `:74-84`. `src/data/tokens.json` er en egen JSON-fil (brukes ikke av `tokens.css`; ikke undersøkt videre)
- `src/styles/fonter.css` (41 linjer)
- `src/styles/components.css` (603), `src/styles/site.css` (1029)
- Komponent-/sidespesifikke CSS som lastes via import: `typo.css` (importeres av `Mega`, `Nokkeltall`, `Horisont`), `interaksjon.css` (`Avslor`, `Hukommelse`, `Mentedu`, `Slepesammenligning`, `Prisvelger`, `Lagstabel`, `Snarveikart`), `scener.css` (importeres direkte av 19 sider utenom lab), `kodebygg.css` (`KodeBygg`), `rontgen.css` (`Rontgen`)
- `.flate--aksent` er definert i `src/pages/index.astro:640` (kommentar i `tokens.css:96` sier `.flate--lys` og `.flate--aksent` bor der). Endring der treffer andre sider.

**Fonter**: selvhostet woff2 i `public/fonts/` (JetBrains Mono 400-600 og Schibsted Grotesk 700-800, hver i `latin` og `latin-ext`), deklarert i `src/styles/fonter.css:7-41` med `font-display: swap` og `unicode-range`. Latin-subsettene forhåndslastes i `Base.astro:118-119`. Brødtekst er systemfont (`tokens.css:71`, `--font-sans: system-ui…`). Fonter får `immutable`-cache (`server.mjs:115-118`). Tegnet `→` finnes ikke i woff2-filene og faller til systemskrift (`components.css:33-37`). OG-bilder bruker egne TTF-er i `assets/fonts-og/`.

**Komponenter brukt på flere sider** (importtelling i `src/`, sider alene): `Button` 25 sider, `ContactBlock` 22, `Avslor` 21, `Mega` 20, `Scene` 19, `Terminal` 16, `Section` 15, `Demo` 9, `UrlCheck` 7, `Flyt` 7, `Pekerkort` 6, `Horisont` 6, `Nokkeltall` 5, `Storflate` 4, `ProcessSteps` 4, `Snitt` 3, `Lagstabel` 3. Brukt via andre komponenter eller Base: `Topbar`, `LegalFooter`, `Apning`, `Snarveikart`, `Eyebrow` (5 komponentbrukere), `StorTekst` (via `Scene`), `Ikon`. Ubrukt av sider: `SceneFilm`, `HeroFilm`, `KodeEksempel` (kun importert av en annen komponent).
Toppnavigasjon: `src/components/Topbar.astro` (398 linjer). Footer: `LegalFooter.astro`. Data som styrer flere sider: `src/data/{firma,priser,navigasjon,bevis,prosess,tjenester,faq,flyter,caser}.ts`.

## 4. Hvor grepene i del 4 bor

| Grep | Fil og linje |
|---|---|
| Bakgrunn `#0b0d10`, lime `#c8f24a` | `src/styles/tokens.css:2` (`--bg`), `:13,15,23` (`--accent`, `--accent-text`, `--focus`); også `Base.astro:121` (`theme-color`) |
| Nummerert etikett `// 03 Tjenester` | Komponent: `src/components/Eyebrow.astro:6` (to-sifret via `padStart`), `:9` (`//` + nummer). Kalles fra `Scene.astro:43`, `Section.astro:21`, `ContactBlock.astro:22`. CSS: `components.css:11-12` (mono, 12 px, `text-transform: uppercase`, nummer i `--accent-text`) |
| Samme etikett i `Mega` | `src/components/Mega.astro:40,45-46`; CSS `typo.css:157-166` (`.mega-blokk__merke`, uppercase) |
| Forsidens tall 03 til 10 | `index.astro:175,199,270,317,366,414,448,455` (`n={3}` … `<ContactBlock n={10}/>`). 01 og 02 er bare kommentarer (`:80`, `:136`), uten etikett |
| Etiketter på undersider | Nesten alle følger `Mega n={1}` + `Scene n={2..}` + `ContactBlock n={…}`, f.eks. `nettsider.astro:47,74,102,176,213,218,222`, `priser.astro:116,185,327,339,349`, `om.astro:32,39,140,155` |
| Tjenestekort nummerert 01-03 | Data `src/data/tjenester.ts:8,16,24` (`n: 1/2/3`); sendt inn `index.astro:184`; vist `ServiceCard.astro:6,11`; CSS `components.css:64` |
| Prosess-steg 01-04 | `src/components/ProcessSteps.astro:10`; CSS `components.css:147` |
| Mono-etiketter | Klasser `tokens.css:82-84` (`.mono-stat`, `.mono`, `.mono-label`). Versaler: `components.css:11,459`, `typo.css:157-166,225-235,294,390-391` (`.mega-blokk__merke`, `.horisont__merke`, `.horisont__nr`, `.nokkeltall__verdi`), `site.css:387` (`.prose th`), `components.css:90` (`.kk-report th`) |
| «→» på lenker | `Button.astro:20` (`showArrow = arrow ?? variant === "ghost"`) og `:29` (tegnet); `ServiceCard.astro:17`; `Pekerkort.astro:49`; `KodeBygg.astro:135`; `public/hero-live.js:92` («hele rapporten →»); CSS `components.css:38,71,311`. Alle `variant="ghost"`-knapper får pil, f.eks. `index.astro:147,228,304,439` |
| Kursivord i hovedoverskrift | `index.astro:84` (`<em>systemer</em>`); CSS `site.css:347` (normal stil, aksentfarge). Andre overskrifter bruker i stedet ett aksentord via `Mega`: `Mega.astro:23,52` og `typo.css:130-132`, f.eks. `index.astro:373` («her»), `nettsider.astro:47` («funnet»), `priser.astro:116`, `om.astro:32`. Andre `<em>` i `src/` ligger i brødtekst: `SamtykkeSekvens.astro:213` og artiklene (ikke overskrifter) |
| Terminal, `$`-prompt, `~`, Ctrl+K | `index.astro:126-132` (hero-terminal), data `:42-50`; `src/components/Terminal.astro`; modal `public/terminal.js:5` (`~`/Ctrl+K); `Snarveikart.astro:115,164,245-247`; montert i `Base.astro:217,223` |
| Skjult tastesekvens | `public/terminal.js:386` (`SEKVENS`, Konami-kode); dokumentert i `docs/easter-egg.md` |
| g-snarveier | `Snarveikart.astro` (`g` + tast; `:245`), `Base.astro:219-223` |
| Hero som sier alt | `index.astro:81-134`: h1 `:84`, ingress `:97`, pris `:107-114`, mva `:115`, Book-knapp `:118`, URL-felt `:119`, live-tekst `:121`, terminal `:126`. Fire nøkkeltall står i neste seksjon, `index.astro:140` |
| Tre like interaktive ting | Sammenligning `index.astro:301` (`Slepesammenligning`), lagstabel `:442` (`Lagstabel`), terminal `:126` |
| Samme blokkoppsett / 96 px luft | `scener.css:12` (`padding-block: var(--space-8)`), `:109-114` (desktop `min-height: 55svh`, `padding-block: var(--space-9)`, `.scene--lav` nullstiller) |
| Pålegget fra v1-skillen | `.claude/skills/kodekonsulentene-design/SKILL.md` (nevner fontvalg `:38`); `docs/brandbok.md:19` (nummerert eyebrow i `mono-label`, versaler), `docs/sidemonstre.md:21,44` (hver blokk begynner med Eyebrow) |
| Ingen portrett på /om | `src/pages/om.astro` har ingen `<img>`, `<picture>` eller `<video>` (grep, 0 treff) |

## 5. Gjentakelsene i del 4

| Setning/tall | Forekomster på forsiden (fil:linje) | Kommentar |
|---|---|---|
| Prototype-løftet «klikkbar prototype … før du har betalt noe. Sier du nei … koster det ingenting» | 1: `index.astro:98-99` (hero). 2: `index.astro:320` (prosess-ingress). 3: `src/data/prosess.ts:5` (steg 2, rendret av `ProcessSteps` på `index.astro:324`). | Kommentaren `index.astro:94-95` sier at heroteksten er «hentet ordrett fra `prosess.ts`», men ordlyden er ikke identisk (`:98` mot `prosess.ts:5`) |
| Samme løfte andre steder | `src/data/flyter.ts:129,132` (flyt `prosess`, brukt på `handbok.astro:57`), `handbok.astro:50,139`, `vilkar.astro:40-44` | Ikke på forsiden |
| Mva-setningen | 1: `index.astro:115` (`{mvaSetning}`). 2: `index.astro:368` (ingress prisseksjon). 3: `index.astro:407` (`prisvilkaar`, første punkt = `mvaSetning`, `priser.ts:148`). 4: `src/data/faq.ts:30` (FAQ-svar, omskrevet: «…ikke mva-registrert, så det kommer ingen mva på toppen»). I tillegg «endelig pris» som enhet på hvert av tre pakkekort (`priser.ts:44`, vist via `PriceCard`, `index.astro:382`) | Teksten genereres i `src/data/priser.ts:47-49`; `firma.mva = false` i `firma.ts:46` |
| NorSIS-tallene 78 % og 59 % | 1: `src/components/Apning.astro:80-81` (kilde `:84`), vises på `/` (`Base.astro:69,135`). 2: `index.astro:286` (ingress i verktøyseksjon). | Kilden forklart i `Apning.astro:65-75` |
| URL-sjekken | 1: `index.astro:119` (hero, `UrlCheck`). 2: `index.astro:298` (seksjon 05, id `url-seksjon`). I tillegg lenke `index.astro:304` og live-terminal `index.astro:121-124` + `public/hero-live.js:58` | Samme komponent `src/components/UrlCheck.astro` |
| De fire nøkkeltallene (6/6, 0, 0,1 s, 24 t) | Data: `src/data/bevis.ts:12-15`. Forsiden: `index.astro:140` (`Nokkeltall`). `/om`: `om.astro:152` (`ProofStrip items={bevis}`) | Én datakilde, to visninger |
| Pristall i hero og prisseksjon | Hero `index.astro:107-113` (leser `pakker`, `ankerPakker` `:70-72`), prisseksjon `index.astro:376-393`. Begge fra `src/data/priser.ts` | Ikke nevnt i briefen, men samme type gjentakelse |
| Pilotprosjekt-tilbudet | `index.astro:259-261`; ordrett også på `caser.astro` (kommentar `index.astro:254-255`) og `caser.astro:99` | |

## 6. Tester, CI og Lighthouse-budsjett

**Enhetstester** (`node --test`, `test/*.test.ts`, 11 filer, 311 `test(`-kall talt med grep, ikke kjørt): `ai-tekst` 27, `bygget-html` 17 (leser `dist/`, kjører `astro check` via `execSync` `:171`), `dns` 27, `kilder` 15, `lansering` 14 (`describe` på `:18`, «skal feile til ekte verdier er fylt inn»), `priskalkyle` 26, `samtykke` 44, `sjekk-sekvens` 14, `sjekk` 65, `skanner` 27, `uuregister` 35.
**Nettlesertester** (Playwright, `tests/`): `visuell.spec.ts` (10 tester), `ruter.spec.ts` (3 tester, ruter leses fra `navigasjon.ts`), hjelpere `hjelpere.ts`. Prosjekter: `desktop` 1440x900 og `mobil` (Pixel 7), mørk `colorScheme`, 1 retry i CI (`playwright.config.ts:37-40,25`). Rutene leses fra meny og footer (`ruter.spec.ts:5-12`).
**CI** (`.github/workflows/`):
- `ci.yml`: ved push til `main` og alle PR. Node 22. `npm ci`, `check`, `build`, `test` (`:22-34`)
- `lighthouse.yml`: PR. Bygger, starter `npm start` på 8080, `treosh/lighthouse-ci-action@v12` mot `/`, `/priser`, `/sjekk` med `.github/lighthouse-budsjett.json`
- `visuell.yml`: PR og push til `main`. Playwright med Chromium
- `overvaak.yml`: cron `17,47 * * * *`. Playwright `--grep @overvaak` mot produksjon, oppretter issue ved feil
- `links.yml`: PR og mandager 06:00 UTC. Lychee

**Lighthouse-budsjett (tre filer, tre nivåer):**
| Fil | URL-er | Terskler |
|---|---|---|
| `.github/lighthouse-budsjett.json` (CI) | 3 (via workflow) | `performance`, `accessibility`, `best-practices`, `seo` >= 0,95 (`:5-8`), 1 kjøring |
| `lighthouserc.json` (mobil, `npm run lhci`) | 11 (`:6-18`, inkl. `/historie`) | De fire kategoriene >= 0,95 (`:41-64`), LCP <= 2500 ms (`:65-70`), CLS <= 0,1 (`:71-76`), TBT <= 200 ms (`:77-82`), 3 kjøringer, mobil 390x844 (`:28-35`) |
| `lighthouserc.desktop.json` | samme 11 | samme terskler, desktop 1440x900, 10 Mbit/s, RTT 40 ms, ingen CPU-nedbremsing (`:28-41`) |
Budsjettet er også publisert på `/status` (`src/pages/status.astro:23-34,49-52`: LCP ≤ 2,5 s, CLS < 0,1). `fly.toml:20-21` nevner «LCP under 2,5 s».

## 7. Tredjepartskall og cookies

**Fra nettleseren (besøkende):** ingen eksterne kall funnet i `src/` eller `public/*.js`. Alle `fetch` går til egne ruter (`/api/sjekk` m.fl.: `sjekk.astro:294,314`, `uu-sjekk.astro:344`, `cookie-sjekk.astro:373`, `dmarc.astro:314`, `AiTekst.astro:295,431`, `hero-live.js:58`, `terminal.js:84,147,185,217`). CSP tvinger det: `connect-src 'self'`, `font-src 'self'`, `img-src 'self' data:` (`sikkerhet.mjs:43-50`). Fonter er selvhostet (`fonter.css:1-5`). Eneste tredjepart i CSP er `frame-src https://cal.com https://app.cal.com` (`sikkerhet.mjs:52`), som ikke brukes (avvik 6). Utgående lenke til `https://cal.com/kodekonsulentene/20min` (`firma.ts:59,78`) er en vanlig `<a>`.

**Fra serveren (kall for besøkende sin skyld):**
| Tjeneste | Hvor | Formål |
|---|---|---|
| Google PageSpeed Insights | `src/lib/hent.ts:81,88` (nøkkel `PAGESPEED_API_KEY`) | Ytelsesrad i `/api/sjekk` |
| Brønnøysund (Enhetsregisteret) | `src/lib/hent.ts:129` | Org.nr.-sjekk |
| Cloudflare DoH og Google DNS | `src/lib/dns.ts:286-287`, `fetch` `:292` | SPF/DMARC-oppslag |
| Resend | `src/lib/epost.ts:48` (nøkkel `RESEND_API_KEY`) | Rapport og kontaktskjema på e-post |
| Anthropic (Claude) | `src/pages/api/ai-tekst.ts:26,161` (nøkkel `ANTHROPIC_API_KEY`) | AI-omskriver på `/apper-og-ai` |
| Egen skannertjeneste | `src/lib/skanner.ts:173-180` (`SKANNER_URL`) | Ekte nettleser-skanning |
| Brukerens oppgitte URL | `src/lib/hent.ts:30`, `src/lib/skanner.ts:180` | Henter siden som sjekkes (SSRF-vern i `hent.ts`, `services/skanner/ssrf.mjs`) |

**Cookies:** ingen `document.cookie`-skriving eller `Set-Cookie` fra egen kode (grep; treffene på «set-cookie» i `src/lib/sjekk.ts:277` og `src/data/sjekk-sekvens.ts:131` leser/viser andres headere). Footerteksten sier «Denne siden bruker ikke cookies» (`firma.cookieNote`, brukt `Base.astro:152`).
**Lagring i nettleseren:**
- `localStorage` `kk-tema` (tema): `Base.astro:170`, `sikkerhet.mjs:22`, `public/terminal.js:261`
- `localStorage` `kk-prisvalg` (prisvelger): `src/components/Prisvelger.astro:248,347-385`
- `sessionStorage` `kk-apning` (åpning vist én gang per økt): `src/components/Apning.astro:102-103`
- `Hukommelse.astro:160-260` leser og viser lagringen for besøkende (viser, skriver ikke).
`src/pages/personvern.astro:43` omtaler `localStorage`.

## Åpne spørsmål til dirigenten

- Skal `index.astro`-kommentarene om `SceneFilm`/akt 2 (avvik 5) regnes som uferdig arbeid eller rester? Jeg har ikke vurdert det.
- `src/data/tokens.json` er ikke undersøkt (brukes den av noen? ikke grepet).
- Ingenting er målt i nettleser: sidevekt, Lighthouse-score og faktiske headere er ikke verifisert.
