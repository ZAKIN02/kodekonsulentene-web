# wow-r8-samling: opprydding etter flyttingen, og tekstrettelsene fra eier

Gren `redesign/wow`, 24. nov. 2026. Ikke committet. Målt mot bygget med `PORT=4770 node ./server.mjs` (stoppet etterpå). `npm start` i `package.json` peker på `dist/server/entry.mjs`; jeg brukte `server.mjs`, som er serveren i drift og den som setter sikkerhetsheaderne. Skills lastet: frontend-design, wai-implementation, emil-design-eng.

## Resultat

`npm run verify` er grønn: 345 av 345 tester, `astro check` 0 feil og 0 advarsler, bygg fullført. Alle 28 sider har axe 0, sidelengs overflyt 0, én H1 og ingen konsollfeil ved 320, 390 og 1440. Alle 27 interne lenker svarer 200.

### 1. Felleskomponenter

| Punkt | Hva som er gjort | Fil |
|---|---|---|
| `Flyt` ved 320 (12 px på /bransjer/klinikker) | Under 360 px deler boksen og detaljteksten bredden likt, og teksten får brytes. Målt 0. | `side/Flyt.astro` |
| Lange ord i H1 og H2 | Spaltene i `SideHode` og `Seksjon` har `minmax(0, 1fr)`, og alle overskriftsklasser har `overflow-wrap: break-word`. Ingen overskrift kan lenger gi sidelengs rulling. | `side/SideHode.astro`, `side/Seksjon.astro`, `wow.css` |
| Mykt bindestrek | Beholdt på «Personvernerklæring» og lagt til på «Ytelsesbudsjettet». Se avvik 1. Sidestilen på /status er fjernet. | `personvern.astro`, `status.astro` |
| `.wow-knapp` ved 320 | Knapper i `<main>` er aldri bredere enn spalten, og under 480 px får teksten gå over to linjer. Toppfeltet er ikke med. Sidestilene i de tre artiklene er fjernet. | `wow.css` |
| `Sporsmal` ved 320 | Spørsmålsteksten kan krympe og brytes; under 360 px deles lange ord etter ordboka. | `wow.css` |
| `Brodsmuler` | Skråstreken står etter leddet, så den aldri står først på en ny linje. Lang sidetittel brytes inne i sitt eget ledd. | `side/Brodsmuler.astro` |
| Tabeller fra verktøyskriptene | `MalWow` merker rullende tabeller på nytt hver gang noe settes inn i `<main>` (`MutationObserver`). Den lokale lappen i uu-sjekk er fjernet. Målt i resultat-tilstanden: axe 0 på cookie-sjekk, uu-sjekk og dmarc ved alle tre bredder, og alle rullende tabeller har `tabindex="0"`. | `MalWow.astro`, `uu-sjekk.astro` |
| `Verktoystil` | Flyttet inn i `wow.css` («verktøysidene»), komponenten er slettet. Cookie-sjekken bruker de samme klassene, og kopien av reglene der er fjernet. | `wow.css`, fem verktøysider |
| `Kontaktblokk` | E-postadressen i feilmeldingen får brytes. Sidestilen i `kontakt.astro` er fjernet. | `wow.css` |
| Datohjulet, 2,44:1 | Svakeste synlige opasitet er nå tokenet `--wow-hjul-svakest: 0.5`, som gir 4,85:1. Datoer som er rullet helt ut av vinduet, skjules i stedet for å tones ned. | `tokens-wow.css`, `scripts/wow/seksjoner/prosess.ts` |
| Linjenummer i `KodeBygg` | Var 4,04:1 mens linja lyste opp. Bruker `--wow-tekst-dempet` nå. | `tjeneste/KodeBygg.astro` |

### 2. Testene

| Test | Hva den vernet | Hva den gjør nå |
|---|---|---|
| `sjekk-sekvens.test.ts` «statusordene …» | At sekvensen og rapporten bruker samme ord. | Sammenligner `ORD` mot `statusOrd[fraSjekk[…]]` i `maaling.ts` direkte. Ny test i tillegg: /sjekk og de tre verktøyene skal tegne resultatet med `maaling.ts`, oversette med `fraSjekk` og ikke ha egen ordliste. |
| `bygget-html.test.ts` `data-demo-spill` | At opptakene av verktøyene spiller i løkke og ikke spoles av rullingen. | Samme krav mot `Opptak.astro`: `loop`, `play()`, ingen `currentTime =`, ingen rullelytter, og alle fem verktøysidene i bygget har opptak med videofil og knapp. |
| `uuregister.test.ts` Lagstabel/Utenskript på /om | At en figur som ber leseren dra, har en stilsatt setning for dem uten JavaScript. | Kravet er fortsatt gyldig og er flyttet til `/lab/interaksjon`, der figuren står. /om har fått det omvendte kravet: ingen bruksanvisning til en figur som ikke er der. Kommer figuren tilbake, slår det opprinnelige kravet inn igjen. |
| «stolpen er merket aria-hidden» | At tallet ikke leses to ganger. | Krever `aria-hidden` på hver `wow-regstolper__spor`, og minst 12 av dem. |
| «stolpene kan ikke bli stående halvvokste» | At rulleboks og rulleanimasjon ikke kombineres (målt feil i v1). | V1-fila er slettet. Tre tester holder wow-løsningen fast: ingen animasjon eller overgang, aldri rulleboks, ingen linje som starter på null. |
| `ai-tekst.test.ts` | Ingen nøkkel i klientkoden, bare eget endepunkt, virker uten JavaScript, ingen cookies. | Leste den døde v1-fila. Leser nå `wow/tjeneste/AiTekst.astro`, som er den som ligger ute. |

To av de omskrevne testene er motprøvd: de blir røde når jeg endrer et statusord i `maaling.ts` og når jeg fjerner `loop` i `Opptak.astro`. `test/sjekk.test.ts` er ikke rørt.

`public/media/wow/.DS_Store` er slettet. `.DS_Store` sto allerede i `.gitignore`.

### 3. Død kode som er slettet

- 21 v1-komponenter ingen side eller komponent importerer: `AiTekst`, `CheckReport`, `ContactBlock`, `Demo`, `Faq`, `ForOgEtter`, `HeroFilm`, `KodeBygg`, `KodeEksempel`, `PriceCard`, `Registerstolper`, `SamtykkeSekvens`, `Scene`, `SceneFilm`, `ServiceCard`, `StatusBadge`, `Stillbilde`, `StorTekst`, `Terminal`, `Tusjstrek`, `UrlCheck`, og `src/styles/kodebygg.css`. Kontrollert med en importgraf fra alle sidene, pluss søk i `test/`, `tests/` og `scripts/`.
- Lyst tema: blokkene `[data-theme="light"]` i `tokens.css`, `components.css`, `scener.css` og `site.css`, den lyse logoen i `Topbar`, og stilen til temaknappen (`.iconbtn`). Ingenting setter `data-theme` lenger.
- `Base.astro` står: 14 lab-sider bruker den.

### 4. Tekstrettelsene (tillegg fra dirigenten, etter `docs/design/tekst/r8-rettelser.md`)

| Punkt | Gjort |
|---|---|
| 1, variant A | `Intro.astro` verken leser eller skriver `sessionStorage`. Inngangen spilles når du kommer til forsiden utenfra, og ikke ved ny innlasting, tilbake i loggen eller fra en annen side her (navigasjonstype og `document.referrer`). |
| 1.1–1.4 | Avsnittet under «Cookies», de to radene, tabelltittelen og siste avsnitt i `Hukommelse` følger manuset ordrett. «Sist oppdatert 24. november 2026». |
| 1, lekkasjetesten | `Hukommelse` leser, teller og sletter nå `sessionStorage` også. Alt som ligger der, vises som «Ikke dokumentert i denne tabellen.». |
| 2.1 | De fire FAQ-overskriftene. |
| 2.2 | H2 «Se selv hva siden har lagret hos deg», id `lagret`, også i innholdslista. |
| 3.2–3.4 | Platen, ingressen (andre setning flyttet til «Hvorfor ingen mellomledd») og overskriften «Det sjekken fant hos oss» på /om. |
| 4, tilfelle A | Ingressen, siste linje i utsnittet («1 å fikse. Samlet: 67/100.» med varselfarge, som `terminal.js` skriver) og notatet på /terminal. |
| 5 | «2 vår» er «Fra telefonen». |
| 7 | Hintet «cookie-skanning 6. oktober 2026», notatet om de to datoene og ny ingress på /sikkerhet. |
| 3.1, 6, 8 | Ikke rørt. /caser-casen og «åpen kildekode» venter på eier; «Hva det er bygget av» blir ute etter manusets anbefaling. |

## Målt

| | Resultat |
|---|---|
| `npm run verify` | 345 av 345, `astro check` 0 feil, 0 advarsler, 3 hint, bygg fullført |
| axe WCAG 2.0–2.2 A/AA, 28 sider × 320, 390, 1440 | 0 brudd i alle 84 |
| Sidelengs overflyt, samme 84 | 0 |
| Én H1, konsollfeil, svar ≥ 400 | 1, 0, 0 (bortsett fra 404-siden selv) |
| Interne lenker | 27 av 27 svarer 200 |
| Verktøyene i resultat og feil (etterlignet API-svar), 3 × 3 bredder | axe 0, overflyt 0, fokus på rapportens tittel |
| Før rettingene (samme sveip) | forsiden 1 kontrastbrudd, /bransjer/klinikker 12 px og /handbok 1 px ved 320 |
| Playwright `tests/wow` og `tests/sjekk-url.spec.ts`, desktop, mot bygget | 82 grønne, 33 røde, 1 hoppet over. Se under. |

De 33 røde er ikke fra dette arbeidet: 25 i `tests/ruter.spec.ts` stopper fordi Playwrights egen Chromium ikke er lastet ned (testene i `tests/wow` bruker `channel: "chrome"`), og 8 i `tests/wow/kapittel.spec.ts` leter etter kildefiler (`rolig.ts`, `fetch` av moduler) som bare finnes mot dev-serveren. Testen «inngangen: filmen toner inn fra svart første gang i økta, ikke neste gang» er grønn med den nye løsningen uten lagring.

Ikke målt: Lighthouse, LCP og sidevekt. Mobilprosjektet i Playwright. Safari og Firefox.

Skript og bilder i `.skudd/wow/r8/samling/`: `sveip.mjs` (resultat i `sveip.txt` og `sveip-kjoring.log`), `tilstander.mjs`, `utsnitt.mjs`, `utsnitt2.mjs`; helsidebilder i `<side>/{320,390,1440}.png`, utsnitt og kontaktark i `utsnitt/`, verktøytilstander i `tilstander/`, Playwright-logg i `playwright-desktop.log`.

## Rettet etter selvkontrollen

- Første forsøk brukte `hyphens: auto` på overskrifter. Chrome delte «PERSONVER-NERKLÆRING», og spørsmål i FAQ-en ble delt ved 390 px uten at det trengtes. Byttet til sikkerhetsnett pluss mykt bindestrek der ordet er kjent.
- «Timebestilling» ble delt midt i ordet uten bindestrek i `Flyt` ved 320 px. Deles nå etter ordboka på de smaleste skjermene.
- Min første utgave av testen for målelinjene slo ut på `min-width: 0`. Rettet uttrykket.
- Sveipet målte kontrast midt i inntoninger (SamtykkeSekvens, KodeBygg). Det venter nå til engangsanimasjoner er ferdige.

AI-preg (del 12): ingen nye etiketter, numre, piler eller kort. Ingen ny bevegelse.

## Avvik og valg som trenger et blikk

1. **Mykt bindestrek er beholdt, ikke fjernet.** Uten det deler sikkerhetsnettet «Personvernerklæring» midt i en stavelse, og ordboka deler feil. Det er nå to: /personvern og /status. Nye lange ord i overskrifter gir ikke overflyt, men bør få et mykt bindestrek for å deles pent.
2. **`scripts/og.mjs` er endret** (tre linjer). Den lette etter `[data-theme="light"]` i `tokens.css` for å finne slutten på fargeblokken. Den leser nå til første `}`. `npm run og` er ikke kjørt.
3. **`src/scripts/wow/seksjoner/prosess.ts` er endret** (fire linjer), fordi opasiteten i datohjulet settes der. Midt i en rulling er nabodatoen litt lysere enn før (0,75 mot 0,65).
4. **To setninger er mine, fordi manuset ikke hadde ordlyd:** «Vi har ingen besøksstatistikk på siden i dag.» på /personvern, og «Vi setter ingen cookies.» som første setning under «Uten cookie-banner» på /nettsider. Meta description på /personvern slutter nå «Ingen cookies og ingen sporing.» (var «Cookieløs analyse – ingen sporing før samtykke.»). Tekstforfatter og eier bør godkjenne alle tre.
5. **Testen for `data-loope` i `SceneFilm` er slettet** sammen med komponenten. Ingen side brukte den, og wow har ingen tilsvarende løkkeflate i mine filer.
6. **Opptakene spiller ikke av seg selv med mus.** De spiller ved hover og fokus, og i syne på berøringsskjerm. V1-testen krevde bare en avspillingsgren; det er uendret, men oppførselen er en annen enn i v1.
7. **`SjekkSekvens.astro` og `src/data/sjekk-sekvens.ts` står**, selv om ingen side bruker dem. Testene i `sjekk-sekvens.test.ts` kjører analysemotoren mot `maalinger.json`, og jeg ville ikke slette dem uten avgjørelse.
8. **De to datoene i notatet på /sikkerhet er skrevet inn** (manuset ordrett), ikke hentet fra `historie.ts` og `maalinger.json`. Måles det på nytt, må notatet bort eller rettes.

## Filer endret

- Felles: `src/layouts/MalWow.astro`, `src/styles/wow.css`, `src/styles/tokens-wow.css`, `src/components/wow/side/{Flyt,SideHode,Seksjon,Brodsmuler}.astro`, `src/components/wow/side/{maaling,tittel}.ts`, `src/components/wow/Intro.astro`, `src/components/wow/les/Hukommelse.astro`, `src/components/wow/tjeneste/{KodeBygg,SamtykkeSekvens}.astro`, `src/scripts/wow/seksjoner/prosess.ts`
- Sider: `personvern`, `status`, `kontakt`, `om`, `terminal`, `sikkerhet`, `nettsider`, `sjekk`, `bransjer/handverkere`, `artikler/{35-wcag-krav,cookies-for-samtykke,orgnr-pa-nettsiden,wcag-i-registeret}`, `verktoy/{index,cookie-sjekk,uu-sjekk,dmarc,priskalkulator}`
- Tester: `test/{sjekk-sekvens,bygget-html,uuregister,ai-tekst}.test.ts`
- V1: `src/styles/{tokens,components,scener,site}.css`, `src/components/Topbar.astro`, `src/lib/ai-tekst.ts` (kommentar), `scripts/og.mjs`
- Slettet: de 21 komponentene og `kodebygg.css` over, `src/components/wow/verktoy/Verktoystil.astro`, `public/media/wow/.DS_Store`
- Ny: `docs/design/rapporter/wow-r8-samling.md`; arbeidsfiler i `.skudd/wow/r8/samling/`

## Kilder

Ingen eksterne. Internt, lest 24. nov. 2026: `CLAUDE.md`, `docs/design/redesign-brief.md` del 2 og 12, rapportene `wow-r8-{grunnmur,B1,B2,B3,B4}.md`, `docs/design/tekst/r8-rettelser.md`, `public/terminal.js` (`skrivRapport`).

## Åpne spørsmål og antakelser

1. **`/lab/lek` skriver fortsatt `kk-prisvalg`** (v1 `Prisvelger`). Det er eneste lagring igjen i `src/`. Personvernteksten sier at siden ikke lagrer noe; det stemmer for alle sider utenom den lab-siden. Slett lab-siden eller lagringen før lansering.
2. **«Cookieløs analyse» står fortsatt tre steder** utenfor det dirigenten ba om: FAQ-en på forsiden (`index.astro:86`), meta description på /nettsider og pakkeinnholdet i `seksjoner/Priser.astro:98`. De beskriver det kunden får, men eier har sagt at ingen statistikk finnes i dag.
3. **Testene i `tests/wow` setter fortsatt `sessionStorage` `wow-inngang`** for å hoppe over inngangen. Det har ingen virkning lenger. De er grønne likevel, men den som eier dem, bør bytte til `page.goto(url, { referer })` med samme opphav.
4. **Lab-sidene holder liv i resten av v1:** `Base.astro`, 26 komponenter og `tokens.css`, `site.css`, `components.css`, `scener.css`, `typo.css`, `interaksjon.css`, `rontgen.css`. `MalV2.astro`, `src/components/bevegelse/`, `src/components/forside/` og `tokens-v2.css` brukes bare av `tests/bevegelse`. `wow/seksjoner/Hero.astro` og `Tjenester.astro` importeres ikke av noe. Ikke rørt.
5. **`Apning.astro` skriver `kk-apning` bare når stien er `/`**, og `Base` brukes aldri der. Død kode som går bort med `Base`.
6. Fra byggernes lister, ikke tatt: `verdiStil: "ordrett"` i `maalingHtml()` (B2 16), slot for ingress i `SideHode` og lenke i `Kravrader` (B1 7), `Prisliste` uten velger når det er én pakke (B1 6), standardingressen i `Kontaktblokk` (B3 4, tekst).
7. Antakelse: «minst 4,5:1» for datohjulet gjelder mens datoen er synlig. Utenfor vinduet er den skjult, ikke dempet.

## Neste steg

1. Dirigenten: les avvik 4 og 7 og åpent punkt 1 og 2, og legg dem fram for eier og tekstforfatter.
2. `revisor`: Lighthouse og sidevekt mot bygget, og Playwright med nettleserne lastet ned (`npx playwright install`), også mobilprosjektet.
3. `bevegelse`: åpent punkt 3, og et blikk på datohjulet midt i en rulling (avvik 3).
4. `kritiker`: brødsmulene og knappene ved 320 px (`.skudd/wow/r8/samling/utsnitt/ark2.png`).
5. Bølge C: lab-sidene, så resten av v1 (åpent punkt 4 og 5).
