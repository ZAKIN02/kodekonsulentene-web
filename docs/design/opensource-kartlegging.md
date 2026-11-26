# Åpen kildekode for kodekonsulentene.no – kartlegging

Skrevet 2026-11-18. Ingen kode i repoet er endret. Alle stjerner, datoer og størrelser
under kommer fra kommandoer kjørt 2026-11-18 (gh api, npm view, esbuild-måling i
scratchpad). Der et tall ikke er målt, står det «ikke målt».

## Kort oppsummert

- Repoet har i dag **4 kjøretidsavhengigheter** (`astro`, `@astrojs/node`,
  `@astrojs/sitemap`, `@anthropic-ai/sdk`) og **ingen** animasjons-, UI-, ikon- eller
  fontpakker. `src/components` har 51 filer på toppnivå pluss 18 i `bevegelse/`,
  `forside/` og `retning-a/`.
- Et tidligere notat (`docs/research-animasjon.md`, 6. oktober 2026) avviste alle
  animasjonsbibliotek fordi hele det håndskrevne interaksjonslaget veide 5,39 kB gzip.
  Den vurderingen bygde på at vekt var viktigst. Eieren har nå sagt at kvaliteten på
  bevegelsen er viktigere. Denne rapporten måler på nytt og lar eieren velge.
- **Referansesiden syntaxstudio.no er målt.** HTML-en laster 13 JS-filer fra
  `/_next/` (Next.js + React). Til sammen er de 684 kB rå og 205 115 B gzip. I koden er
  det 21 treff på `lenis` og 5 på `data-lenis`. Det er **ingen** spor etter GSAP
  (`_gsap`), Framer Motion (`whileInView`, `AnimatePresence`, `layoutId`,
  `MotionValue`) eller WebGL. Resten er `requestAnimationFrame` (12), `lerp` (14) og
  `IntersectionObserver` (6), og videoene har `preload="none"`. Det profesjonelle
  inntrykket kommer altså av **Lenis + godt avstemt timing + video**, ikke av et stort
  animasjonsbibliotek. Det er den viktigste opplysningen i denne rapporten.
- **CSP:** `sikkerhet.mjs` har `script-src 'self'` + hasher og **ikke**
  `'unsafe-inline'`. Inline-skript tillates bare gjennom SHA-256-hasher som
  `inlineSkriptHasher()` leser ut av bygget ved oppstart. npm-pakker som importeres i
  `<script>` i Astro, havner i `/_astro/*.js` under `'self'`, og da trengs **ingen
  CSP-endring**. Det finnes tre unntak: WebAssembly (Lottie, Rive) krever
  `'wasm-unsafe-eval'` i `script-src`. Analyse på eget underdomene krever at
  `script-src` og `connect-src` utvides. En Cal.com-innbygging med skript krever
  `app.cal.com` i `script-src`, og den avvises. `style-src` har allerede
  `'unsafe-inline'`, så biblioteker som setter `element.style` virker.

---

## 1. Behovsliste

Kilder: `docs/sidemonstre.md` (blokk 01–10 + footer), `docs/design/bevegelse.md`
(øyeblikk 1, 2, 3, 5, 6), `docs/design/retning.md` (øyeblikk 4 = sideoverganger), og en
gjennomgang av `src/components`.

| # | Behov | Dagens fil(er) | Hva mangler / hvorfor vurdere bibliotek |
|---|---|---|---|
| 1 | Scroll-styrt scene med video som spoles (øyeblikk 1) | `src/components/bevegelse/Scene.astro` (257 l.), `SceneFilm.astro` (172 l.) | Egen `scroll`/`resize`-lytter og `requestAnimationFrame`. Ingen myk interpolering mellom rullesteg, og derfor «hakker» spolingen på hjul. Dette er ScrollTrigger (`scrub`) eller Motion `scroll()` sin kjerneoppgave. |
| 2 | Myk rulling (global følelse) | Finnes ikke | Referansesiden bruker Lenis. Brandboken forbyr scroll-jacking, og derfor er det aldri prøvd. |
| 3 | Overskrift linje for linje / split text (øyeblikk 2) | `bevegelse/Loft.astro` (124 l.), `Mega.astro`, `StorTekst.astro` | Egen linjedeling. Den deler ikke på nytt ved endret bredde etter animasjon, og den har ikke ord- eller tegnnivå. GSAP SplitText (`autoSplit`, `mask: "lines"`) eller anime.js `splitText` dekker dette. |
| 4 | Avdekking ved rulling | `Avslor.astro` (164 l.), `Tusjstrek.astro` (216 l.) | `IntersectionObserver` + CSS. Det virker, men easing og stagger er håndlaget. Motion `inView` er 0,48 kB, og GSAP ScrollTrigger dekker det samme. |
| 5 | Vannrett seksjon ved vertikal rulling | `Horisont.astro` (292 l.) | ScrollTrigger med `pin` + `scrub`. |
| 6 | Case-video ved hover og i syne (øyeblikk 3) | `bevegelse/CaseVideo.astro` | Fungerer. Trenger ikke bibliotek. Lazy-video er allerede `preload="none"`. |
| 7 | Sideoverganger (øyeblikk 4) | `src/styles/site.css` linje 6: `@view-transition { navigation: auto; }` | Bare krysstoning. Ingen delte elementer mellom sider. Kandidater: CSS `view-transition-name` (0 kB), Astro `<ClientRouter />`, Swup. Merk at 8 komponenter og 2 globale skript binder seg én gang (`docs/research-astro.md`), og at de må legges om for ClientRouter og Swup. |
| 8 | Prisvelger med pris som skifter (øyeblikk 5) | `bevegelse/Prisvelger.astro` (308 l.), `Prisvelger.astro` (426 l.), `forside/Prisliste.astro` | Prisen bytter tekst brått. number-flow gir rullende sifre. Radiogruppen er native og trenger ikke bibliotek. |
| 9 | Reel i dialog (øyeblikk 6) | `bevegelse/Reel.astro` | Native `<dialog>` + `<video controls>`. Virker. media-chrome kan gi egne kontroller, men det koster 42 kB. |
| 10 | Tall som teller | `Nokkeltall.astro` (279 l.) | countup.js (2,15 kB) eller number-flow (5,09 kB). |
| 11 | Karusell/slider for caser | `forside/Arbeid.astro` (ingen karusell i dag) | Bare aktuelt hvis det kommer mer enn 3–4 caser i blokk 04. Embla. |
| 12 | Marquee/logo-rad | Finnes ikke | Ingen blokk i `sidemonstre.md` har plass til den. Behovet er derfor **ikke** til stede (husregel: ingen komponent uten blokk). Ren CSS holder om det kommer. |
| 13 | Accordion/FAQ | `forside/Sporsmal.astro`, `Faq.astro` | Native `<details>`/`<summary>`. Høyden kan animeres med CSS `interpolate-size`/`::details-content`. Et bibliotek gir lite. |
| 14 | Pekereffekter / «magnetiske» knapper | `Pekerkort.astro` (187 l.), `Rontgen.astro` (264 l.) | Søk 50 ga 0 treff på etablerte bibliotek. GSAP `quickTo` gjør det på få linjer om GSAP tas inn. |
| 15 | Bildeoptimalisering | `Stillbilde.astro` + `scripts/stillbilde.mjs` + `src/data/bilder*.json` | Egen AVIF/WebP-kjede med målte dimensjoner. Astro `<Picture />` (innebygd) gjør det samme. |
| 16 | Ikoner | `Ikon.astro` (banedata kopiert fra Lucide 6. okt. 2026) | Må kopieres for hånd ved hvert nytt ikon. `@lucide/astro` er ren byggetid. |
| 17 | Selvhostede fonter | `src/styles/fonter-v2.css`, `public/fonts/*.woff2` (7 filer), fontTools-subsetting for hånd, `wawoff2` | Astro 7 har innebygd `fonts`-konfig og `<Font />` (bekreftet i `node_modules/astro/components/Font.astro` og config-skjemaet). Fontsource har Schibsted Grotesk og Archivo. |
| 18 | Kodeutheving | `KodeBygg.astro` (egen highlighter med «fem regler», linje 77), `KodeEksempel.astro`, `Terminal.astro` | Astro `<Code />` (Shiki) er innebygd og gir 0 kB JS. |
| 19 | Skjema og validering | `forside/Kontakt.astro`, `ContactBlock.astro`, `/api/kontakt` | Native HTML-validering + server. Trenger ikke bibliotek. |
| 20 | Kalender/booking | Cal.com som `<iframe>` (`frame-src https://cal.com https://app.cal.com` i `sikkerhet.mjs`) | Iframe-løsningen holder. Skript-innbyggingen henter `embed.js` fra app.cal.com og bryter regelen om tredjepartsskript. |
| 21 | Cookieløs analyse | Finnes ikke (sidemonstre krever «Plausible eller PostHog uten cookies») | Umami (MIT, selvhostet) eller Plausible-trackeren (MIT) med server. |
| 22 | OG-bilder | `scripts/og.mjs` med `satori` + `@resvg/resvg-js` | Allerede bibliotek. Ingen endring. |
| 23 | Lottie/Rive | Finnes ikke | Ingen blokk krever dem. WASM på 357–536 kB gzip er tungt. Bare aktuelt for én illustrasjon, og da lastet ved interaksjon. |
| 24 | SEO-metadata | `src/layouts/Base.astro`, `MalV2.astro`, `src/data/schema` | Håndskrevet head. `astro-seo` er et alternativ, men gevinsten er liten. |
| 25 | Token-system / CSS-rammeverk | `src/styles/tokens.css`, `tokens-v2.css` | Egne tokens er en husregel. Open Props kan gi easing- og animasjonstokens. Tailwind v4 eller Starwind/fulldev krever at `@theme` kobles til tokens. |
| 26 | Komponentbibliotek for Astro | Finnes ikke | accessible-astro-components (ingen Tailwind), Starwind UI og fulldev/ui (begge Tailwind v4), @data-slot (vanilla-primitiver). |
| 27 | Tilgjengelighets- og ytelsestest | `@axe-core/playwright`, `@playwright/test`, skriptet `lhci` (men `@lhci/cli` står ikke i `devDependencies`) | pa11y-ci som tillegg. `@lhci/cli` bør legges inn eksplisitt. |
| 28 | Startmal for byrå/portefølje | Ingen (alt håndskrevet) | codrops/interlude og codrops/isle-thorne-collective er Astro 7 + GSAP + Lenis og egner seg som studieobjekter. ScrewFast og AstroWind er fullstendige maler. |

---

## 2. Søkelogg

Alle søk ble kjørt 2026-11-18 med `gh api -X GET search/repositories -f q='<spørring>' -f sort=stars -f per_page=12`.
Antall treff er `total_count` fra API-et. Det ble kjørt **50 søk**, og **49 lyktes**.
Søk nr. 30 feilet med HTTP 422. Åtte søk traff API-taket på 30 per minutt (HTTP 403),
og de er ikke regnet med. Sju av dem ble kjørt på nytt og står i loggen som nr. 31–37.

| # | Spørring (`q=`) | Treff |
|---|---|---|
| 1 | `gsap astro in:name,description,readme language:Astro pushed:>2025-11-18 archived:false` | 3303 |
| 2 | `topic:astro topic:gsap pushed:>2025-11-18 archived:false` | 230 |
| 3 | `topic:astro-theme topic:portfolio stars:>50 pushed:>2025-11-18 archived:false` | 3 |
| 4 | `topic:astro-theme agency stars:>20 pushed:>2025-11-18 archived:false` | 2 |
| 5 | `topic:smooth-scrolling stars:>500 pushed:>2025-11-18 archived:false` | 9 |
| 6 | `topic:split-text stars:>100 pushed:>2025-11-18 archived:false` | 1 |
| 7 | `topic:page-transitions stars:>500 pushed:>2025-11-18 archived:false` | 1 |
| 8 | `topic:carousel language:TypeScript stars:>1000 pushed:>2025-11-18 archived:false` | 12 |
| 9 | `topic:astro topic:components stars:>100 pushed:>2025-11-18 archived:false` | 7 |
| 10 | `topic:astro topic:accessibility stars:>50 pushed:>2025-11-18 archived:false` | 9 |
| 11 | `lenis in:name smooth scroll stars:>500 pushed:>2025-11-18 archived:false` | 0 |
| 12 | `motion animation library in:name,description language:TypeScript stars:>5000 pushed:>2025-11-18 archived:false` | 1 |
| 13 | `topic:icons topic:svg stars:>5000 pushed:>2025-11-18 archived:false` | 7 |
| 14 | `topic:lottie stars:>500 pushed:>2025-11-18 archived:false` | 15 |
| 15 | `rive runtime web in:name,description stars:>200 pushed:>2025-11-18 archived:false` | 1 |
| 16 | `topic:analytics topic:privacy stars:>3000 pushed:>2025-11-18 archived:false` | 7 |
| 17 | `lenis in:name stars:>200 pushed:>2025-11-18 archived:false` | 1 |
| 18 | `umami in:name analytics stars:>1000 pushed:>2025-11-18 archived:false` | 0 |
| 19 | `topic:gsap stars:>1000 pushed:>2025-11-18 archived:false` | 11 |
| 20 | `topic:view-transitions stars:>100 pushed:>2025-11-18 archived:false` | 8 |
| 21 | `topic:fonts topic:self-hosted stars:>100 pushed:>2025-11-18 archived:false` | 1 |
| 22 | `astro tailwind starter in:name,description topic:astro stars:>1000 pushed:>2025-11-18 archived:false` | 2 |
| 23 | `umami-software in:name stars:>1000 pushed:>2025-11-18 archived:false` | 1 |
| 24 | `topic:shiki stars:>500 pushed:>2025-11-18 archived:false` | 6 |
| 25 | `topic:astro topic:seo stars:>100 pushed:>2025-11-18 archived:false` | 9 |
| 26 | `topic:css-framework topic:design-tokens stars:>500 pushed:>2025-11-18 archived:false` | 0 |
| 27 | `topic:axe-core stars:>200 pushed:>2025-11-18 archived:false` | 1 |
| 28 | `topic:astro-integration stars:>200 pushed:>2025-11-18 archived:false` | 6 |
| 29 | `topic:range-slider language:TypeScript stars:>300 pushed:>2025-11-18 archived:false` | 1 |
| 30 | `topic:count-up OR topic:countup stars:>300 pushed:>2025-11-18 archived:false` | FEILET (HTTP 422: OR mellom bare kvalifikatorer) |
| 31 | `topic:countup stars:>300 pushed:>2025-11-18 archived:false` | 1 |
| 32 | `lenis gsap astro in:readme pushed:>2025-11-18 archived:false` | 2752 |
| 33 | `fontsource in:name stars:>500 pushed:>2025-11-18 archived:false` | 2 |
| 34 | `topic:animation language:JavaScript stars:>10000 pushed:>2025-11-18 archived:false` | 5 |
| 35 | `topic:tailwindcss topic:astro topic:ui stars:>100 pushed:>2025-11-18 archived:false` | 2 |
| 36 | `topic:accessibility topic:testing stars:>1000 pushed:>2025-11-18 archived:false` | 3 |
| 37 | `cal.com embed in:name,description stars:>50 pushed:>2025-11-18 archived:false` | 0 |
| 38 | `user:codrops astro pushed:>2025-11-18` | 3 |
| 39 | `topic:awwwards stars:>100 pushed:>2025-11-18 archived:false` | 4 |
| 40 | `open-props in:name stars:>1000 pushed:>2025-11-18 archived:false` | 1 |
| 41 | `topic:marquee stars:>300 pushed:>2025-11-18 archived:false` | 4 |
| 42 | `topic:astro topic:portfolio topic:animation stars:>20 pushed:>2025-11-18 archived:false` | 1 |
| 43 | `topic:astro topic:template stars:>500 pushed:>2025-11-18 archived:false` | 10 |
| 44 | `astro-icon in:name stars:>500 pushed:>2025-11-18 archived:false` | 1 |
| 45 | `topic:headless-ui topic:vanilla-js stars:>50 pushed:>2025-11-18 archived:false` | 1 |
| 46 | `number-flow in:name stars:>500 pushed:>2025-11-18 archived:false` | 1 |
| 47 | `topic:scroll-driven-animations stars:>50 pushed:>2025-11-18 archived:false` | 2 |
| 48 | `topic:web-components topic:ui-components language:TypeScript stars:>2000 pushed:>2025-11-18 archived:false` | 1 |
| 49 | `topic:astro topic:view-transitions stars:>20 pushed:>2025-11-18 archived:false` | 2 |
| 50 | `topic:magnetic-button OR magnetic cursor in:name,description stars:>100 pushed:>2025-11-18 archived:false` | 0 |

**Andre kommandoer som ble kjørt** (alle 2026-11-18):

- `gh api repos/OWNER/REPO --jq '…license.spdx_id, stargazers_count, pushed_at, archived, size'` for 69 repoer. Tallene står i tabell 3 og 5.
- `npm view <pakke> license version time.modified repository.url dist.unpackedSize` og `npm view <pakke> dependencies` for 82 pakker, pluss `peerDependencies` for 9 Astro-pakker.
- `npm pack --dry-run --json @fontsource-variable/schibsted-grotesk`
- Størrelsesmåling i scratchpad (ikke i prosjektmappen): `npm install --ignore-scripts`, deretter `esbuild 0.28.2 --bundle --minify --format=esm` med en importlinje per realistisk bruk, deretter `gzip -9`. WASM-filene ble målt med `gzip -9` direkte.
- `curl https://www.syntaxstudio.no/` + de 13 JS-filene den laster, med grep etter bibliotekssignaturer.
- Lesing av `node_modules/astro` i prosjektet, kun lesing: versjon 7.3.5, `components/Font.astro`, `ClientRouter.astro`, `Code.astro`, `Picture.astro`, og config-skjemaet med `fonts` og `security.csp`.

---

## 3. Godkjente kandidater (46 rader)

Forklaring av kolonnene:
- **Siste push** er `pushed_at` fra GitHub. Det er siste push til en hvilken som helst gren, ikke nødvendigvis til hovedgrenen.
- **Størrelse:** «gzip» er det som sendes til nettleseren, målt med esbuild + gzip -9. «upakket» er `dist.unpackedSize` fra npm og er ikke det nettleseren laster. «repo» er GitHub `size` i KB.
- **Avh.** er antall direkte `dependencies` i npm.
- **Husregel** gjelder forbudene i CLAUDE.md: WebGL, 3D, scroll-jacking, glassmorphism, bento og mesh-gradient.

### 3a. Bevegelse og animasjon

| Navn | Repo | Lisens | Lisensrisiko | Stjerner | Siste push | Størrelse | Avh. | Brukes i | Husregel |
|---|---|---|---|---|---|---|---|---|---|
| GSAP 3.15.1 (kjerne) | https://github.com/greensock/GSAP | «Standard no charge license» (gsap.com/standard-license) | **Middels**: gratis også kommersielt, alle plugins inkludert, men ikke åpen kildekode. Webflow eier vilkårene og kan endre dem, og lisensen har en klausul om forbudt bruk i konkurrerende animasjonsverktøy. | 30867 | 2026-11-04 | 27,12 kB gzip | 0 | Felles `src/scripts/bevegelse.ts` (ny) | Nei |
| GSAP ScrollTrigger | samme | samme | Middels | – | – | 44,19 kB gzip (kjerne + ScrollTrigger) | 0 | Erstatter scroll-logikken i `bevegelse/Scene.astro`, `SceneFilm.astro`, `Horisont.astro` og `Avslor.astro` | Nei. **Ja** hvis `ScrollSmoother` tas i bruk (scroll-jacking). |
| GSAP SplitText | samme | samme | Middels | – | – | 3,52 kB gzip alene; 47,27 kB gzip for kjerne + ScrollTrigger + SplitText | 0 | Erstatter linjedelingen i `bevegelse/Loft.astro`. Kan også brukes i `Mega.astro`. | Nei |
| Motion 14.14.0 | https://github.com/motiondivision/motion | MIT | Lav | 35324 | 2026-11-18 | `inView` 0,48 kB; `scroll` 3,82 kB; `motion/mini` animate 3,25 kB; full `animate` 25,83 kB; animate+scroll+inView+stagger 28,95 kB (alle gzip) | 2 | `Avslor.astro` (inView), `bevegelse/Scene.astro` (scroll) | Nei |
| Lenis 1.3.27 | https://github.com/darkroomengineering/lenis | MIT | Lav | 17345 | 2026-11-13 | 5,28 kB gzip | 0 | Ny `src/scripts/myk-rulling.ts`, lastet fra `src/layouts/MalV2.astro` og `Base.astro` | **Ja**: myk rulling regnes som scroll-jacking etter dagens brandbok |
| anime.js 4.5.0 | https://github.com/juliangarnier/anime | MIT | Lav | 74870 | 2026-11-02 | `animate` 12,40 kB; animate+onScroll+splitText 19,30 kB (gzip) | 0 | Alternativ til GSAP for `Loft.astro` og `Avslor.astro` | Nei |
| number-flow 0.6.2 | https://github.com/barvian/number-flow | MIT | Lav | 7822 | 2026-09-20 | 5,09 kB gzip (web component `<number-flow>`) | 1 | `bevegelse/Prisvelger.astro` (prisen skifter), `Nokkeltall.astro` | Nei |
| countUp.js 2.10.1 | https://github.com/inorganik/countUp.js | MIT | Lav | 8150 | 2026-10-17 | 2,15 kB gzip | 0 | `Nokkeltall.astro` | Nei |
| AutoAnimate 0.10.2 | https://github.com/formkit/auto-animate | MIT | Lav | 13977 | 2026-11-07 | 3,38 kB gzip | 0 | Resultatlister i `AiTekst.astro` og `CheckReport.astro` (rader som kommer inn) | Nei |
| Embla Carousel 8.6.0 | https://github.com/davidjerleke/embla-carousel | MIT | Lav | 8481 | 2026-11-01 | 7,45 kB gzip (8,20 kB med autoplay) | 0 | `forside/Arbeid.astro`, blokk 04 Caser | Nei. Karusellen må holde seg innenfor blokk 04. |
| dotLottie web 0.83.2 | https://github.com/LottieFiles/dotlottie-web | MIT | Lav | 951 | 2026-11-18 | JS 12,65 kB gzip + WASM 480–536 kB gzip | 0 | Ny komponent, bare ved interaksjon | Nei, men WASM-filen må selvhostes (standard er jsDelivr/unpkg) og CSP trenger `'wasm-unsafe-eval'` |
| Rive canvas-lite 2.51.0 | https://github.com/rive-app/rive-wasm | MIT | Lav | 1029 | 2026-11-18 | JS 62,05 kB gzip + WASM 357 kB gzip | 0 | Ny komponent, bare ved interaksjon | Nei for canvas-lite (Canvas 2D). **Ja** for `@rive-app/webgl*`. Samme CDN- og CSP-merknad som Lottie. |
| media-chrome 4.19.5 | https://github.com/muxinc/media-chrome | MIT | Lav | 2771 | 2026-11-12 | 42,15 kB gzip | 1 | `bevegelse/Reel.astro` (egne videokontroller) | Nei |

### 3b. Sideoverganger

| Navn | Repo | Lisens | Lisensrisiko | Stjerner | Siste push | Størrelse | Avh. | Brukes i | Husregel |
|---|---|---|---|---|---|---|---|---|---|
| Swup 4.10.0 | https://github.com/swup/swup | MIT | Lav | 5252 | 2026-11-03 | 7,35 kB gzip; 10,12 kB med preload-plugin + fade-theme | 2 | Øyeblikk 4: erstatter `@view-transition` i `src/styles/site.css`, init i `MalV2.astro` | Nei |
| @swup/astro 1.8.0 | https://github.com/swup/astro | MIT (npm; GitHub viser ingen lisens) | Lav (bekreft LICENSE-fila) | 156 | 2026-08-08 | 46 753 B upakket (integrasjon) | 17 | `astro.config.mjs` | Nei |
| Astro `<ClientRouter />` (innebygd i astro 7.3.5) | https://github.com/withastro/astro | MIT (npm; GitHub: NOASSERTION) | Lav | 64032 | 2026-11-18 | ikke målt | 0 ekstra | `MalV2.astro` | Nei |
| astro-vtbot 3.1.0 | https://github.com/martrapp/astro-vtbot | ISC | Lav | 365 | 2026-09-09 | 143 591 B upakket | 5 | Sammen med ClientRouter i `MalV2.astro` | Nei |
| view-transitions-toolkit | https://github.com/GoogleChromeLabs/view-transitions-toolkit | Apache-2.0 | Lav | 192 | 2026-06-10 | ikke målt | ikke målt | Hjelpere for `@view-transition` i `site.css` | Nei |

### 3c. UI-komponenter, CSS og tokens

| Navn | Repo | Lisens | Lisensrisiko | Stjerner | Siste push | Størrelse | Avh. | Brukes i | Husregel |
|---|---|---|---|---|---|---|---|---|---|
| @data-slot (bejamas) 1.1.3 | https://github.com/bejamas/data-slot | MIT | Lav | 72 | 2026-11-12 | accordion 5,12; slider 4,49; carousel 5,16; dialog 6,53; tabs 3,67 kB gzip | 1 per pakke | Vanilla-primitiver uten rammeverk. Aktuelt for `Snarveikart.astro` (dialog) og `Slepesammenligning.astro` (slider). | Nei |
| accessible-astro-components 5.8.1 | https://github.com/incluud/accessible-astro-components | MIT | Lav | 580 | 2026-11-16 | 289 012 B upakket | 0 (peer `astro ^7`) | `forside/Sporsmal.astro`, `Hode.astro` (skiplink, meny) | Nei |
| Starwind UI 3.6.0 (CLI) | https://github.com/starwind-ui/starwind-ui | MIT | Lav | 766 | 2026-11-14 | CLI 5 345 017 B upakket. Kopierer kildekode inn i repoet. | 9 (CLI) | Nye UI-komponenter. Krever Tailwind v4. | Nei. Men den bryter «alle verdier gjennom tokens.css» med mindre `@theme` kobles til tokens. |
| fulldev/ui | https://github.com/fulldotdev/ui | MIT | Lav | 620 | 2026-11-09 | ikke målt (shadcn-registry) | 0 i rotpakken | Som Starwind. Tailwind v4 + @data-slot. | Nei (samme tokens-merknad) |
| Tailwind CSS 4.3.5 | https://github.com/tailwindlabs/tailwindcss | MIT | Lav | 98778 | 2026-11-17 | CSS, ikke målt; `tailwindcss` 787 200 B upakket | 3 (`@tailwindcss/vite`) | `src/styles/*` | Nei (samme tokens-merknad) |
| Open Props 1.7.23 | https://github.com/argyleink/open-props | MIT | Lav | 5578 | 2026-10-11 | 1 287 011 B upakket; importer bare `easings` og `animations` | 0 | `src/styles/tokens-v2.css` (easing-kurver) | Nei |

### 3d. Fonter, ikoner, bilder og kode

| Navn | Repo | Lisens | Lisensrisiko | Stjerner | Siste push | Størrelse | Avh. | Brukes i | Husregel |
|---|---|---|---|---|---|---|---|---|---|
| Astro Fonts API (`fonts` + `<Font />`, innebygd) | https://github.com/withastro/astro | MIT | Lav | 64032 | 2026-11-18 | 0 kB JS | 0 ekstra | Erstatter `src/styles/fonter-v2.css` og preload-linjene i `MalV2.astro` | Nei |
| Fontsource Schibsted Grotesk (variable) 5.3.0 | https://github.com/fontsource/fontsource | Repo MIT, font OFL-1.1 | Lav | 6289 | 2026-11-09 | latin-wght-woff2: 46 752 B (vår egen: 46 068 B) | 0 | `public/fonts/schibsted-grotesk-var-*.woff2` | Nei |
| Fontsource Archivo (variable) 5.3.0 | samme | OFL-1.1 | Lav | – | – | 1 084 229 B upakket (alle filer). Om bredde-aksen er med, er ikke kontrollert. | 0 | `public/fonts/archivo-var-latin.woff2` | Nei |
| @lucide/astro 1.75.0 | https://github.com/lucide-icons/lucide | ISC (npm; GitHub: NOASSERTION) | Lav | 25833 | 2026-11-18 | 3 874 880 B upakket; 0 kB JS (inlinet SVG) | 0 | Erstatter `src/components/Ikon.astro` | Nei |
| astro-icon 1.2.0 + @iconify-json/lucide | https://github.com/natemoo-re/astro-icon | MIT (npm; GitHub: NOASSERTION) | Lav | 1450 | 2026-08-25 | 27 527 + 687 985 B upakket; 0 kB JS | 3 | `Ikon.astro` (alternativ) | Nei |
| Tabler Icons 3.52.0 | https://github.com/tabler/tabler-icons | MIT | Lav | 22709 | 2026-11-16 | 12 059 039 B upakket; 0 kB JS | 0 | `Ikon.astro` (alternativt sett) | Nei |
| Phosphor core 2.1.1 | https://github.com/phosphor-icons/core | MIT | Lav | 402 | 2026-01-06 | 6 476 685 B upakket; 0 kB JS | 0 | `Ikon.astro` (alternativt sett). Siste npm-utgivelse er fra 2024-03. | Nei |
| Astro `<Picture />` / `<Image />` (innebygd) | https://github.com/withastro/astro | MIT | Lav | 64032 | 2026-11-18 | 0 kB JS | 0 ekstra | Erstatter `Stillbilde.astro` + `scripts/stillbilde.mjs` | Nei |
| Shiki 4.6.0 via Astro `<Code />` | https://github.com/shikijs/shiki | MIT | Lav | 13936 | 2026-11-02 | 0 kB JS (byggetid); 601 994 B upakket | 8 | Erstatter den egne highlighteren i `KodeBygg.astro` og `KodeEksempel.astro` | Nei |

### 3e. SEO, analyse og drift

| Navn | Repo | Lisens | Lisensrisiko | Stjerner | Siste push | Størrelse | Avh. | Brukes i | Husregel |
|---|---|---|---|---|---|---|---|---|---|
| Umami (selvhostet server) | https://github.com/umami-software/umami | MIT | Lav | 40214 | 2026-11-18 | Sporingsskriptet er ikke målt; repo 33 645 KB | ikke målt (server) | Egen Fly-app + Postgres; skript i `MalV2.astro`/`Base.astro` | Nei |
| @plausible-analytics/tracker 0.4.7 | https://github.com/plausible/analytics | Tracker: MIT (npm). Server: AGPL-3.0 (GitHub). | Lav for trackeren. **Middels** for selvhostet server (AGPL, men koden kjører på egen server og sendes ikke til nettleseren). | 29877 | 2026-11-18 | 2,53 kB gzip | 0 | `MalV2.astro` | Nei |
| astro-seo 1.2.0 | https://github.com/jonasmerlin/astro-seo | MIT | Lav | 1425 | 2026-08-28 | 25 270 B upakket; 0 kB JS | 0 | `<head>` i `Base.astro`/`MalV2.astro` | Nei |
| Astro `security.csp` (innebygd) | https://github.com/withastro/astro | MIT | Lav | 64032 | 2026-11-18 | 0 kB | 0 | Kan erstatte `inlineSkriptHasher()` i `sikkerhet.mjs`. **Ikke testet.** Meta-CSP kan ikke bære `frame-ancestors`, så headerne i `server.mjs` må bli. | Nei |

### 3f. Test og kvalitet (bare utviklerverktøy)

| Navn | Repo | Lisens | Lisensrisiko | Stjerner | Siste push | Størrelse | Avh. | Brukes i | Husregel |
|---|---|---|---|---|---|---|---|---|---|
| @axe-core/playwright 4.14.0 | https://github.com/dequelabs/axe-core-npm | MPL-2.0 | Middels, men bare som utviklerverktøy og allerede i bruk | 737 | 2026-11-16 | sendes ikke | 1 | `tests/` (allerede i bruk) | Nei |
| @lhci/cli 0.16.1 | https://github.com/GoogleChrome/lighthouse-ci | Apache-2.0 | Lav | 7154 | 2026-11-17 | sendes ikke | 14 | `package.json` (skriptet `lhci` finnes, men pakken mangler i `devDependencies`) | Nei |
| pa11y-ci 5.0.0 | https://github.com/pa11y/pa11y | LGPL-3.0 | Middels, men bare som utviklerverktøy | 4602 | 2026-11-16 | sendes ikke | 10 | Ny `test/pa11y` eller CI-steg | Nei |
| @playwright/test 1.65.1 | https://github.com/microsoft/playwright | Apache-2.0 | Lav | ikke målt | ikke målt | sendes ikke | 1 | Allerede i bruk (1.63.0). Kan oppgraderes. | Nei |

### 3g. Maler og studieobjekter (Astro + GSAP/Lenis)

| Navn | Repo | Lisens | Lisensrisiko | Stjerner | Siste push | Størrelse | Stack (fra package.json) | Brukes i | Husregel |
|---|---|---|---|---|---|---|---|---|---|
| codrops/interlude | https://github.com/codrops/interlude | MIT | Lav | 56 | 2026-11-04 | repo 4914 KB | astro ^7.3.5, gsap ^3.15.0, lenis ^1.3.26, three, Fontsource | Studie for `Scene.astro` og `Loft.astro` (ScrollTrigger + Lenis i Astro 7) | **Ja** (three.js = WebGL) |
| codrops/isle-thorne-collective | https://github.com/codrops/isle-thorne-collective | MIT | Lav | 20 | 2026-11-04 | repo 13 285 KB | astro ^7.3.5, Tailwind 4, gsap, lenis, embla-carousel, three | Studie for `forside/Arbeid.astro` (Embla) og overgangene | **Ja** (three.js) |
| ScrewFast | https://github.com/mearashadowfax/ScrewFast | MIT | Lav | 1441 | 2026-11-18 | repo 11 315 KB | astro ^7.4.12, Tailwind 4, gsap, lenis, preline, astro-vtbot | Studie for hvordan GSAP, Lenis og ClientRouter lever sammen | Ikke vurdert visuelt |
| AstroWind | https://github.com/arthelokyo/astrowind | MIT | Lav | 6142 | 2026-09-12 | repo 18 540 KB | astro ^7.3.1, Tailwind, astro-icon, astro-seo | Studie for strukturen i `<head>`, SEO og ikoner | Ikke vurdert visuelt |
| accessible-astro-starter | https://github.com/incluud/accessible-astro-starter | MIT | Lav | 1197 | 2026-11-16 | repo 5609 KB | Tailwind 4, accessible-astro-components, astro-seo | Studie for tilgjengelighetsmønstre | Nei |

---

## 4. Kortliste: de 10 beste, rangert etter gevinst per innsats

Tidsanslagene er grove og gjelder én utvikler med agentene i repoet.

### 1. Lenis: myk rulling (5,28 kB gzip, MIT)
- **Hvorfor:** Dette er det referansesiden faktisk bruker (målt: 21 treff på `lenis`, ingen GSAP eller Framer Motion). Det er den billigste enkeltendringen som gir siden «byråfølelse», og scroll-spolingen i `Scene.astro` blir jevn fordi rulleposisjonen interpoleres.
- **Erstatter:** Ingen fil. Lenis er nytt globalt lag. Gjør den egne rAF-utjevningen i `Scene.astro` overflødig.
- **Integrasjonsplan:**
  1. `npm i lenis`.
  2. Lag `src/scripts/myk-rulling.ts`: `new Lenis({ autoRaf: true, anchors: true })`. Hopp over oppstarten ved `prefers-reduced-motion: reduce` og ved Save-Data, slik Scene allerede gjør.
  3. Importer skriptet i `src/layouts/MalV2.astro` og `Base.astro`, og importer `lenis/dist/lenis.css`.
  4. CSP: ingen endring (bundles til `/_astro/`).
  5. Test i `tests/bevegelse/`: PageDown, Space og piltaster ruller fortsatt. «Hopp over animasjonen» i Scene lander på `#hoppTil`. Med redusert bevegelse finnes ikke klassen `lenis` på `<html>`. INP < 200 ms i Lighthouse.
  6. Tid: 0,5–1 dag.
- **Risiko:** Bryter dagens husregel mot scroll-jacking, så eieren må oppheve den. Myk rulling kan oppleves som treg på styreplate og gi kvalme hos noen. Derfor er reduced-motion-unntaket obligatorisk.

### 2. GSAP + ScrollTrigger + SplitText (47,27 kB gzip samlet, egen lisens)
- **Hvorfor:** Dette er bransjestandarden for nettopp øyeblikk 1, 2 og 5. `scrub` med utjevning, `pin`, `SplitText` med `autoSplit` og linjemasker, `gsap.matchMedia()` for redusert bevegelse og `quickTo` for pekereffekter. Fem håndskrevne filer på til sammen omtrent 1050 linjer kan bli korte oppsett-skript.
- **Erstatter:** `bevegelse/Loft.astro` (124 l.), skriptdelen av `bevegelse/Scene.astro` (257 l.), `Avslor.astro` (164 l.), `Horisont.astro` (292 l.), `Tusjstrek.astro` (216 l.) og eventuelt pekerlogikken i `Pekerkort.astro`.
- **Integrasjonsplan:**
  1. `npm i gsap`. Registrer ScrollTrigger og SplitText i `src/scripts/bevegelse.ts`.
  2. Last skriptet med dynamisk `import()` etter første maling, bare på sider med bevegelse. Da påvirkes ikke LCP.
  3. Skriv om én komponent om gangen og begynn med `Loft.astro`. Behold props-kontrakten i `docs/design/bevegelse.md` uendret, så `bygger` ikke må endre noe.
  4. CSP: ingen endring.
  5. Test: de eksisterende Playwright-testene i `tests/bevegelse/` (37 + 27 grønne ifølge commit-loggen) skal være grønne uendret. Legg til en test som sjekker at SplitText-markup fjernes etter animasjonen (tilgjengelig tekst).
  6. Tid: 3–5 dager.
- **Risiko:** Siden blir 47 kB tyngre, mot 5,39 kB for hele interaksjonslaget i oktober. Lisensen eies av Webflow, som konkurrerer i nettsidemarkedet (se tabell 3a). `ScrollSmoother` må ikke brukes uten at husregelen oppheves. Velg **enten** GSAP **eller** Motion (nr. 10), ikke begge.

### 3. number-flow: prisen ruller når pakken byttes (5,09 kB gzip, MIT)
- **Hvorfor:** Øyeblikk 5 er nesten ferdig, men prisen bytter tekst brått. Rullende sifre er en liten detalj med stor effekt, og akkurat den typen polish eieren savner.
- **Erstatter:** Tekstbyttet i `bevegelse/Prisvelger.astro` og telleren i `Nokkeltall.astro`.
- **Integrasjonsplan:**
  1. `npm i number-flow`.
  2. I `bevegelse/Prisvelger.astro`: bytt prisspennet til `<number-flow>` og sett `.update(verdi)` ved valg. Formatet `nb-NO` tas fra `Intl`, og tallet kommer fortsatt fra `src/data/priser.ts`.
  3. Uten JavaScript skal den ferdig formaterte prisen stå som tekst (progressiv forbedring).
  4. CSP: ingen endring. Komponenten bruker shadow DOM, og stiler er tillatt med `'unsafe-inline'`.
  5. Test: skjermleseren skal lese hele prisen, ikke siffer for siffer. Det er **ikke verifisert** og må testes med axe og VoiceOver. Med redusert bevegelse skal prisen hoppe direkte.
  6. Tid: 0,5 dag.
- **Risiko:** Lav. Hovedrisikoen er at tilgjengelighetsnavnet ikke er godt nok.

### 4. Astro `<Code />` (Shiki): ekte kodeutheving (0 kB JS, MIT)
- **Hvorfor:** `KodeBygg.astro` har en egen highlighter med «fem regler» (linje 77), og den sier selv at den er en erstatning for highlight.js. Shiki er allerede med i Astro, kjører ved bygging og bruker VS Code-grammatikk.
- **Erstatter:** Uthevingslogikken i `KodeBygg.astro` og `KodeEksempel.astro`.
- **Integrasjonsplan:**
  1. Ingen ny pakke: `import { Code } from 'astro:components'`.
  2. Lag et tema som peker på CSS-variabler fra `tokens-v2.css` (Shiki har `css-variables`-tema), så husregelen om tokens holder.
  3. Behold animasjonen linje for linje i KodeBygg ved å animere `span.line` fra Shiki-utdataene.
  4. CSP: ingen endring (inline `style` er tillatt).
  5. Test: snapshot av bygget HTML i `test/bygget-html.test.ts` og kontrast ≥ 4,5:1 på alle tokenfarger.
  6. Tid: 0,5 dag.
- **Risiko:** Lav. KodeBygg sin linje-for-linje-animasjon må verifiseres mot den nye markupen.

### 5. @lucide/astro: ikoner uten håndkopiering (0 kB JS, ISC)
- **Hvorfor:** `Ikon.astro` kopierer Lucide-baner for hånd. Den offisielle Astro-pakken gir den samme inlinede SVG-en, men da er det npm som holder ikonene oppdatert.
- **Erstatter:** Innholdet i `src/components/Ikon.astro`. Behold filen som en tynn innpakning, så ingen kallsteder endres.
- **Integrasjonsplan:**
  1. `npm i @lucide/astro`.
  2. `Ikon.astro` importerer de navngitte ikonene og setter `stroke-width={1.5}` og `size={20}` som standard (brandboken).
  3. Behold `aria-hidden`/`tittel`-logikken.
  4. CSP: ingen endring.
  5. Test: bygget HTML skal ha samme antall `<svg>` som før, og kontroller at ingen `<script>` er lagt til.
  6. Tid: 1–2 timer.
- **Risiko:** Lav. Pakken er 3,9 MB i `node_modules`, men det kostet nettopp noe slikt da `astro-icon` ble avvist i oktober. Kjøretidskostnaden er 0.

### 6. Astro Fonts API + Fontsource (0 kB JS, MIT + OFL)
- **Hvorfor:** I dag subsettes fontene for hånd med fontTools og `wawoff2`, og deklarasjonene skrives for hånd i `fonter-v2.css`. Astro 7.3.5 har innebygd `fonts` med automatisk preload og reservefont-metrikk (mindre CLS).
- **Erstatter:** `src/styles/fonter-v2.css`, `src/styles/fonter.css`, `public/fonts/*.woff2`, preload-linjene i layoutene og devDependency `wawoff2`.
- **Integrasjonsplan:**
  1. `npm i @fontsource-variable/schibsted-grotesk @fontsource-variable/archivo` (eller bruk den lokale leverandøren i Fonts API med dagens filer).
  2. Legg `fonts: [...]` inn i `astro.config.mjs` og `<Font cssVariable=… preload />` i `MalV2.astro`.
  3. Kontroller at Archivo-filen har bredde-aksen (62–125), som retning A krever. **Ikke kontrollert.**
  4. CSP: ingen endring (`font-src 'self'`).
  5. Test: Lighthouse CLS < 0,1 og fontvekt ≤ i dag. Schibsted latin er 46 752 B mot 46 068 B i dag.
  6. Tid: 0,5–1 dag.
- **Risiko:** Middels. Dagens filer er instansiert med begrensede akser. Fontsource-filene kan bli større hvis de har flere akser enn vi bruker.

### 7. Umami: cookieløs analyse (MIT, selvhostet)
- **Hvorfor:** `sidemonstre.md` krever cookieløs analyse, og i dag finnes ingen. Uten tall kan ingen av designvalgene måles.
- **Erstatter:** Ingen fil (nytt).
- **Integrasjonsplan:**
  1. Kjør Umami som egen Fly-app med Postgres, eller velg Plausible Cloud med `@plausible-analytics/tracker` (2,53 kB gzip, MIT).
  2. Proxy skriptet og `/api/send` gjennom `server.mjs` på eget domene, så CSP kan beholde `'self'`. Alternativet er å legge analysedomenet inn i `script-src` og `connect-src` i `sikkerhet.mjs`.
  3. Last skriptet i `MalV2.astro`/`Base.astro` med `defer`.
  4. Test: Playwright sjekker at `document.cookie` er tom og at det ikke finnes `Set-Cookie` fra analysen. `test/samtykke.test.ts` skal være grønn.
  5. Tid: 1 dag + drift.
- **Risiko:** Middels. Én ekstra tjeneste å drifte og ta sikkerhetskopi av. Personvernerklæringen må oppdateres.

### 8. Swup + @swup/astro: ekte sideoverganger, øyeblikk 4 (10,12 kB gzip, MIT)
- **Hvorfor:** I dag finnes bare krysstoning via `@view-transition`. Swup gir overganger med delte elementer, forhåndslasting og a11y-plugin som flytter fokus og annonserer ny side.
- **Erstatter:** `@view-transition`-blokken i `src/styles/site.css` linje 6–11.
- **Integrasjonsplan:**
  1. **Først, uten bibliotek:** sett `view-transition-name` på logo, tittel og case-bilde i CSS (0 kB). Det kan være nok.
  2. Hvis ikke: `npm i swup @swup/astro`, og legg integrasjonen inn i `astro.config.mjs`.
  3. Legg om de 8 komponentene og 2 globale skriptene som binder én gang (`Demo`, `Horisont`, `Lagstabel`, `Pekerkort`, `Rontgen`, `SceneFilm`, `public/terminal.js` og `public/hero-live.js`, se `docs/research-astro.md`). De må binde på nytt ved `page:view`.
  4. CSP: Swup henter sider med `fetch` (`connect-src 'self'` holder). Nye inline-skript må fortsatt ha hash.
  5. Test: Playwright navigerer forside → /priser → tilbake og sjekker at Scene, prisvelger og tema-bryter fortsatt virker. Fokus skal stå på `<h1>`.
  6. Tid: 2–4 dager.
- **Risiko:** Høy innsats. Alt interaktivt må gjøres idempotent. Astro `<ClientRouter />` har samme omleggingskostnad.

### 9. Embla Carousel: case-rad med dra (7,45 kB gzip, MIT)
- **Hvorfor:** Liten, avhengighetsfri og tilgjengelig. Codrops-malen for Astro 7 bruker den. Gir dra og fysikk som håndlaget kode sjelden får til.
- **Erstatter:** Ingen fil i dag. Brukes i `forside/Arbeid.astro` når det finnes mer enn 3–4 caser.
- **Integrasjonsplan:**
  1. `npm i embla-carousel`.
  2. Markup i `Arbeid.astro` som vanlig liste. Embla legges på i et `<script>`, og uten JavaScript ruller lista vannrett med `scroll-snap`.
  3. Knapper med `aria-label` og `aria-roledescription="karusell"`.
  4. CSP: ingen endring.
  5. Test: axe, tastaturnavigering og at det ikke er vannrett rulling på siden under 480 px.
  6. Tid: 0,5–1 dag.
- **Risiko:** Lav teknisk. Blokk 04 i `sidemonstre.md` må godta karusell, og med 2–4 caser trengs den kanskje ikke.

### 10. Motion: MIT-alternativet til GSAP (0,48–28,95 kB gzip)
- **Hvorfor:** Velg dette **i stedet for nr. 2** hvis eieren ikke vil ha GSAP-lisensen. Modulene kan plukkes: `inView` (0,48 kB) erstatter `Avslor.astro`, og `scroll` (3,82 kB) driver Scene. Full `animate` er 25,83 kB.
- **Erstatter:** `Avslor.astro`, skriptdelen av `bevegelse/Scene.astro` og `Horisont.astro`. Motion har ingen SplitText, så `Loft.astro` beholdes eller kombineres med anime.js `splitText`.
- **Integrasjonsplan:**
  1. `npm i motion`.
  2. Begynn med `inView` i `Avslor.astro` (laveste risiko).
  3. Deretter `scroll()` i `Scene.astro`. Behold intensjonslogikken for video.
  4. CSP: ingen endring.
  5. Test: samme Playwright-suite som for nr. 2.
  6. Tid: 2–3 dager.
- **Risiko:** Lav lisensrisiko. Mindre ferdig for tekst-effekter enn GSAP.

---

## 5. Avviste

| Navn | Grunn |
|---|---|
| SplitType (lukePeavey/SplitType) | Inaktiv: siste push 2023-12-03, siste npm-endring 2023-10-22. GitHub viser ingen lisens (npm: ISC). GSAP SplitText dekker behovet. |
| Splitting (shshaw/Splitting) | Inaktiv: siste push 2024-06-19. |
| Splide (Splidejs/splide) | Inaktiv: siste push 2024-07-08, siste npm-endring 2022-11-09. |
| scroll-timeline-polyfill (flackr/scroll-timeline) | Inaktiv: siste push 2024-08-26. Virket heller ikke da den ble testet i repoet i oktober (`docs/research-animasjon.md`). |
| keen-slider | Siste npm-utgivelse 2023-07-05 (GitHub-push 2026-01-22). 5,95 kB gzip. Embla dekker det samme og er aktiv. |
| Swiper 14.4.0 | For tungt: 20,50 kB gzip, nesten 3 ganger Embla, for det samme behovet. |
| Locomotive Scroll 5.1.1 | Dobbelt opp: avhenger av `lenis` 1.3.27 og veier 9,66 kB gzip mot 5,28 kB for Lenis direkte. Scroll-jacking. |
| ScrollReveal | Lisens GPL-3.0 (npm). Kode som sendes til nettleseren gir **høy** risiko. Siste npm-endring 2022-06-26. |
| Matomo | GPL-3.0 og tung server. Umami og Plausible dekker behovet. |
| Openpanel | AGPL-3.0. Ikke vurdert videre. |
| Astroship (surjithctly/astroship) | GPL-3.0, høy risiko for en mal som blir selve siden. |
| hansdash/Ryze | GPL-3.0. |
| midudev/mcp-higgsfield-landing, midudev/spiderman-brand-new-day, louisescher/spectre, meSingh/git.wtf | Ingen lisens = høy risiko. Kan bare studeres, ikke kopieres. |
| Musab-Hassan/musabhassan.com | Personlig porteføljeside under MPL-2.0 (filvis copyleft) og ikke laget som mal. Ikke undersøkt videre. |
| Ladvace/astro-bento-portfolio | Bento-rutenett (husregel) og tungt: Solid + Svelte + three + Rive + GSAP + Motion + Lenis i samme prosjekt. |
| darkroomengineering/satus | Inkompatibel: Next.js + React + three.js (Lenis-teamets egen mal). |
| Cal.com-innbygging (`@calcom/embed-snippet` 1.3.3) | Lisens «SEE LICENSE IN LICENSE». Henter `embed.js` fra `app.cal.com` og bryter regelen om ingen tredjepartsskript. Behold dagens `<iframe>`. Repoet heter nå `calcom/cal.diy` (GitHub-omdirigering). |
| @playform/compress | npm-lisens «SEE LICENSE IN LICENSE» (GitHub: CC0), 14 avhengigheter, og den dupliserer brotli/gzip i `server.mjs`. |
| @astrojs/partytown | Siden har ingen tredjepartsskript å flytte. |
| astro-og-canvas | Vurdert og forkastet før (`docs/research-astro.md`). `satori` er i bruk. GitHub viser ingen lisens (npm: MIT). |
| @data-slot/accordion til FAQ | 5,12 kB gzip for noe native `<details>` gjør for 0 kB. (De andre @data-slot-primitivene er godkjent.) |
| playwright-lighthouse | Inaktiv: siste npm-endring 2024-01-15. Bruk `@lhci/cli`. |
| astro-robots-txt | Inaktiv: siste npm-endring 2023-09-08. Repoet har allerede `robots.txt.ts`. |
| @studio-freight/lenis | Gammelt pakkenavn (siste endring 2025-04-25). Bruk `lenis`. |
| dialog-polyfill | Inaktiv: siste npm-endring 2022-06-15. Native `<dialog>` holder. |
| Rive `@rive-app/webgl*` og three.js | WebGL/3D. Kolliderer med husregelen. three.js er med i begge Codrops-malene. |
| GSAP ScrollSmoother | Ikke avvist på lisens. Det er scroll-jacking, og eieren må oppheve regelen før det kan brukes. |

---

## 6. Åpne spørsmål til eieren

1. **Scroll-jacking-regelen.** Referansesiden bruker Lenis. Skal forbudet mot scroll-jacking
   oppheves for myk rulling med obligatorisk unntak ved redusert bevegelse? Kortliste nr. 1
   står og faller på dette.
2. **GSAP eller Motion?** GSAP gir mest ferdig verktøy (SplitText, ScrollTrigger), men
   lisensen eies av Webflow og kan endres. Motion er MIT og mindre, men har ikke
   SplitText. Ett av dem, ikke begge.
3. **Vektbudsjettet.** Oktober-notatet satte i praksis taket ved omtrent 5 kB for hele
   interaksjonslaget. GSAP + Lenis gir omtrent 52 kB gzip. Lighthouse ≥ 95 er sannsynligvis
   oppnåelig med dynamisk import etter første maling, men det er **ikke målt**. Godtar du
   at budsjettet flyttes fra «kB» til «Lighthouse-score»?
4. **WebGL/3D.** Begge Codrops-malene for Astro 7 bruker three.js. Skal forbudet stå?
   (Anbefaling: ja. Referansesiden bruker ikke WebGL.)
5. **Tailwind.** Starwind, fulldev/ui, ScrewFast og AstroWind forutsetter Tailwind v4.
   Skal regelen «alle verdier gjennom `tokens.css`» tolkes slik at Tailwind er lov når
   `@theme` peker på tokens? Hvis ikke, er accessible-astro-components og @data-slot de
   eneste komponentbibliotekene som passer.
6. **Karusell.** Har blokk 04 Caser plass til en karusell, eller blir det 2–4 caser uten?
7. **Analyse.** Selvhostet Umami (gratis, men én tjeneste til å drifte) eller Plausible
   Cloud (betalt, MIT-tracker)?
8. **Sideoverganger.** Holder det med CSS `view-transition-name` (0 kB, en halv dag), eller
   vil du ha Swup eller ClientRouter (2–4 dager fordi 10 filer må legges om)?

## Antakelser

- «Siste commit» er tolket som `pushed_at` fra GitHub API-et.
- gzip-tallene gjelder én realistisk import per pakke, minifisert av esbuild 0.28.2 og
  komprimert med gzip -9. I bygget fra Vite/Astro kan tallene avvike litt. Brotli fra
  `server.mjs` gir vanligvis noe mindre, men det er ikke målt.
- Analysen av referansesiden bygger på strengsøk i minifisert kode. Biblioteker som
  ikke etterlater seg kjente navn, kan ha blitt oversett.
- Astro `security.csp`, Fonts API og `<ClientRouter />` er bekreftet å finnes i astro
  7.3.5 i `node_modules`, men ingen av dem er prøvd i dette repoet.
