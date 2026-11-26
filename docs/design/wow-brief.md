# WOW-briefen: forsiden på nytt (gren `redesign/wow`)

Skrevet 18. nov 2026 av dirigenten. Gjelder foran `retning.md`, `designsystem-v2.md` og
`bevegelse.md` der de er uenige. Eier: «Regler kan oppheves. Du skal skape wow-opplevelse.»

## Hvorfor dagens redesign feilet (sett i opptakene, `.skudd/sammenligning/`)

1. **Første skjerm er en tekstblokk på grå bunn.** Ingen bilde, ingen bevegelse, ingen dybde.
   Syntaxstudio åpner med intro, fargeteppe og video som fyller skjermen.
2. **Navigasjonen er standard blå lenker med understrek.** Ser uferdig ut.
3. **Ett KI-bilde av en maskinvarestabel gjentas over ~2000 px rulling**, med små bokser med tekst.
   Mørkt på mørkt, ingen skala, ingen rytme. Leseren ser det samme bildet fem ganger.
4. **12 synlige «MANGLER»-plassholdere.** Siden ser ut som en wireframe.
5. **Ingen typografisk skala.** Syntax bruker store, smale versaler som fyller halve skjermen. Vi har
   én stor overskrift og så små dokumenter.
6. **Ingen rytme mellom seksjoner.** Syntax veksler stor tittel + tekst + bildemosaikk i hver blokk,
   og hver blokk har noe som beveger seg inn.

## Retningen: «Natt i verkstedet»

Mørk, filmatisk, presis. Vi er ikke et kreativbyrå som selger film; vi selger at ting virker.
Wow-en skal komme fra **presisjon i bevegelse**: ting som låser seg på plass, måles og blir grønne.

- **Bunn:** nesten svart `#0A0B0C`. Tekst `#F2F2EE`. Én aksent: refleks `#C8F24A` (beholdes fra logoen).
  Én sekundær for lenker/målelinjer: `#8FA2FF`. Rød bare for feil i rapporten.
  Legg fargene inn som tokens i `src/styles/tokens-wow.css`. Ingen hardkodede farger i komponentene.
- **Typografi:** Archivo variabel (finnes allerede selvhostet, se `fonter-v2.css`). Overskrifter i
  VERSALER, bredde ~75–85 (smal), vekt 800–900, `clamp(3.5rem, 11vw, 11rem)`, tett linjeavstand 0.88.
  Brødtekst Schibsted Grotesk 400, 18–20 px.
- **Rutenett:** 12 kolonner, store marger, mye luft. Seksjoner minst 100vh der det er bevegelse.

## Forsiden, i rekkefølge

Tekst hentes fra `docs/design/tekst/forside.md` og kortes ned der den er for lang for den nye skalaen.
Priser fra `src/data/priser.ts`, fakta fra `src/data/firma.ts`. **Ingen oppdiktede tall.**

| # | Blokk | Hva skjer |
|---|---|---|
| 0 | Intro | Første besøk i økta: logo tegnes inn (SplitText på bokstaver), så sveiper et refleks-teppe opp og avdekker heroen. Maks 1,6 s. Klikk/tast hopper over. `sessionStorage` husker. Ikke ved redusert bevegelse. |
| 1 | Hero | Video i full bredde (Higgsfield, se under), mørkt slør. Gigantisk overskrift i versaler, linjene glir opp bak masker. Under: ingress + URL-feltet for befaring + «Book 20 minutter» (magnetiske knapper). Liten «rull»-indikator. |
| 2 | Tallrad | 4 tall som teller opp (number-flow) når de kommer inn. **Bare sanne tall**: pris fra priser.ts, «30 sek» rapport, «72 t» prototype, Lighthouse-tall for egen side *bare hvis målt*. |
| 3 | Befaringen | Festet seksjon (ScrollTrigger pin). Mens du ruller: en URL skrives inn, rapportens rader fylles ut en etter en, målelinjer trekkes, og fastprisen lander til slutt i refleksfelt. Dette er siden sitt signaturøyeblikk. |
| 4 | Det vi bygger | Tre store redaksjonelle rader som syntax: GIGANTISK tittel (Nettsider / Systemer / Apper og AI), to linjer tekst, og et bilde/klipp som avdekkes med clip-path og har parallakse. Hover på desktop: bildet følger pekeren litt. |
| 5 | Arbeid | Horisontal rad man kan dra i (Embla). Bare caser med ekte innhold. Har vi bare egen side: vis den som case med målte tall. **Aldri «MANGLER» i HTML-en** – mangler data, rendres ikke kortet. |
| 6 | Garantien | Refleksfelt i full bredde, svart tekst i versaler, rulles inn med skalering 0.92→1. |
| 7 | Priser | Typografisk prisliste. Prisvelgeren beholdes, men tallet ruller med number-flow. |
| 8 | Slik går det | Fire steg med ekte datoer, en linje tegnes gjennom dem mens du ruller (scrub). |
| 9 | Spørsmål | Accordion, myk høydeanimasjon. |
| 10 | Kontakt + footer | Enormt ordmerke «KODEKONSULENTENE» over hele bredden i footeren, bokstavene løftes inn. Lovpålagt footer-innhold uendret. |

«Hvem jeg er» rendres ikke før eier har levert portrett og navn.

## Global bevegelse (eies av `bevegelse`)

Bibliotek (installert): `lenis`, `gsap` (ScrollTrigger, SplitText), `number-flow`, `embla-carousel`,
`@lucide/astro`. Ikke skriv egne animasjonsmotorer.

Kontrakten mellom markup og bevegelse er **data-attributter**. Byggeren setter dem, bevegelse
gjør dem levende. Ingen av dem må vite noe mer om den andre.

| Attributt | Effekt |
|---|---|
| `data-split="lines"` / `"chars"` | SplitText med maske; linjer/bokstaver glir opp når elementet kommer inn. Ekte tekst bevares for skjermlesere (`aria-label` eller SplitText sin `aria`-støtte). |
| `data-reveal="clip"` | Bilde/video avdekkes med clip-path fra bunnen, skalering 1.15→1 inni. |
| `data-reveal="fade"` | Opp 40 px + opasitet. `data-stagger` på forelder forskyver barna. |
| `data-parallax="0.2"` | Flytter seg med faktor mot rullingen (scrub). |
| `data-magnetic` | Knapp trekkes mot pekeren (gsap.quickTo), bare `pointer: fine`. |
| `data-count="14900"` | number-flow teller opp når synlig. Formatet `nb-NO`. |
| `data-marquee` | Uendelig løpebånd, retning følger rulleretningen. |
| `data-pin="befaring"` | Seksjonen festes; tidslinjen for befaringen styres av rullingen. |
| `data-scale-in` | 0.92→1 og hjørneradius 32→0 mens den rulles inn. |
| `data-draw` | SVG-linje tegnes med rullingen (stroke-dashoffset). |

Pluss: Lenis på hele siden (koblet til ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`
og `gsap.ticker`), egen peker på desktop (liten prikk som blir stor over lenker/medier), og intro.

**Redusert bevegelse:** `gsap.matchMedia()` – ved `prefers-reduced-motion: reduce` er Lenis av,
intro av, alt står ferdig, ingen pin. Siden skal være fullt lesbar uten JS.

## Medier (eies av `produsent`)

Higgsfield via API (`scripts/scene.mjs` / produsentens skript). Stil: filmatisk, natt, praktisk lys,
grunn dybdeskarphet, kald blå + refleksgrønn aksent, ingen tekst i bildet, ingen ansikter som ser i kamera.
Bestilling (kreditter innenfor rammen på 500 totalt, ~82 brukt):

1. **Hero-sløyfe** 16:9 og 9:16, 6–8 s, sømløs: nattlig verksted/kontor i Oslo, skjermlys som speiler i
   glass, hender på tastatur i uskarphet, regn på vindu, kamera glir sakte. Ferdig som H.264 + AV1/WebM,
   desktop ≤ 3 MB, mobil ≤ 1,5 MB, pluss poster-bilde (AVIF/WebP).
2. **Tre tjenestebilder** (+ gjerne korte klipp 4 s): Nettsider (telefon i hånd på en kafé i Oslo om
   kvelden, skjermen lyser), Systemer (kabler og lys i et serverskap, presist og ryddig), Apper og AI
   (nærbilde av en hånd som trykker på en app på telefon, refleksgrønt lys).
3. Merk alt KI-generert med liten tekst «Illustrasjon laget med KI» der det vises (beholdes fra før).

## Runde 2: scroll-world-hero (eier 18. nov 2026)

Skill: `.claude/skills/scroll-world/` (oso95/scroll-world, MIT). Referanse for teknikken: midudev/mcp-higgsfield-landing
(Astro 7 + GSAP + Lenis + Higgsfield; ingen lisens, så bare teknikken brukes, ikke koden).

- **Verden:** Oslo-gate i miniatyr i skumring. Kameraet dykker inn i småbedrifter (bakeri → nettsider,
  frisør/klinikk → booking og systemer, rørleggerbil → app) og ender i verkstedet vårt (befaring + bestilling).
- **Kreditter:** opptil 700 for runden. Kalibrer med ett bilde og ett klipp før resten.
- **Mobil = samme kvalitet som desktop.** Egen 9:16-kjede komponert for telefon, 1080×1920, samme modell,
  samme innstillinger og samme sømkontroll. Ingen nedskalering til 720 og ingen beskjæring av desktopfilmen.
- Utkast (billig modell, 720p) vises eier før endelig render.

## Runde 3: kameraturen skal fortelle en historie (eier 18. nov 2026)

Eier: «Den er animert, men det er ikke sammenhengende. Den må fortelle en historie.»
Kritiker r3 #10 sier det samme: filmen viser ingen måling, så den kunne vært hvem som helst sin.

**Den røde tråden: grønt lys betyr at det virker.** Alle grønne lys i klippene finnes allerede
(skjermen i bakeriet, kalenderen på kontoret, telefonen til rørleggeren, hakene og skiltet i verkstedet).
Filmen går fra «ingen vet hva som virker» til «alt lyser grønt – hva med din side?».

**Hvert kapittel har samme form: problem → vi gjør noe → grønt.** Teksten bytter innhold på én plate
(ingen overlapp), og en liten statuslampe ved teksten går fra grå til grønn i det kameraet når det grønne
lyset i klippet. En teller øverst i filmen følger historien: «0 av 3 grønne» → «3 av 3 grønne».
Telleren er historiens tilstand, ikke en statistikk, og skal aldri se ut som et måltall.

| # | Klipp | Problemet (lampe grå) | Det vi gjør (lampe grønn) | Lenke |
|---|---|---|---|---|
| 0 | Gata | En vanlig gate i Oslo. Tre bedrifter, tre nettsider. Ingen vet hvilke som virker. | – (teller 0 av 3) | – |
| 1 | Bakeriet | Kunden vil bestille på mobilen, men siden henger. | Rask nettside som er enkel å bestille fra. | /nettsider |
| 2 | Kontoret | Timeboken, betalingen og regnskapet er tre ulike systemer. | Vi kobler dem sammen, så ingen skriver av samme tall to ganger. | /systemer |
| 3 | Rørleggeren | Jobbene står på lapper i bilen. | En app med dagens jobber i lomma. | /apper-og-ai |
| 4 | Verkstedet | Her sitter vi. Vi måler før vi foreslår noe. | De fire målingene (Cookies, Sikkerhetsheadere, Universell utforming, Org.nr.) låser seg en etter en på skjermen i verkstedet, telleren blir «3 av 3 grønne», og filmen glir rett over i befaringsrapporten, allerede utfylt for kodekonsulentene.no. Overskrift: «Hva med din side?» + URL-feltet. | #rapport |

Regler: ingen tall om de oppdiktede bedriftene (de er illustrasjon, merket KI). Målingene i kapittel 4 er
de ekte for kodekonsulentene.no fra sjekken 18. nov. Kapittel 0 er heroen: H1 i spalte 1–7, slør bare fra
venstre, heroteksten tones ut etter ca. 25vh så gata får skjermen.

Feil fra kritiker r3 som rettes samtidig: tekstplate uten overlapp (#1), hard kutt i sømmene i stedet for
krysstoning (#2, sømmene er 35–38 dB), skinnen viser riktig kapittel (#5), ingen sperrede «01 BAKERIET»-
etiketter (#6), ingen gjentakelser på første skjerm (#8), rapporten etter filmen er fylt ut fra start (#9).

## Runde 4: historien «Lampa» (eier 19. nov 2026)

Eier valgte behandling C «Lampa» i docs/design/historie-manus.md – den er nå fasit for hele forsiden.
Eier har godkjent at forsiden sier rett ut «Gata står på pulten vår. Vi laget den med KI. Bakeriet finnes ikke.»,
og at stolen i verkstedet får en leirfigur (N3) i kontaktscenen til ekte portrett finnes.

- **Én lampe, ikke en teller.** Hul ring = ikke målt. Fylt grønn med dato = målt. Fargene i bildet viser hva vi
  bygger; lampa viser hva som er bevist. Lampa tennes første gang når de fire ekte målingene låser seg på pulten.
- **Nye scener (ca. 36–40 kreditter):** N1 pulten med modellene, N2 kameraet fra pulten inn i gata (spilles
  baklengs, starter på dive-0 ramme 0), N3 leirfigur i stolen.
- **Typografiregel for hele forsiden:** bare garantien og ordmerket i footeren står i gigantiske versaler.
  Alle andre overskrifter i setningsform, maks 4,5rem, og hver seksjon åpner på sin egen måte (ikke samme
  overskrift-ingress-oppsett hver gang). Én wow-topp (pulten + lampa), resten er støttescener.

## Ferdig når

- Kritikeren (som ikke ser koden) sammenligner med syntaxstudio og sier at vi er på samme nivå eller over.
- Lighthouse mobil: ytelse ≥ 90, resten ≥ 95. LCP ≤ 2,5 s. CLS < 0,1.
- Null «MANGLER» synlig i HTML. Null hardkodede farger utenom tokens-filen.
- Fungerer uten JS, med redusert bevegelse og med tastatur.
- `npm run verify` grønn.
