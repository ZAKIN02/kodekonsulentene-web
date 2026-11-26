# wow-r8-B2: verktøysidene over i wow-drakten

Gren `redesign/wow`, 24. nov. 2026. Ikke committet. Dev på 4740 (`astro dev --port 4740 --ignore-lock`), stoppet etterpå. Ikke kjørt `build` eller `verify`. Skills lastet: frontend-design, wai-implementation, emil-design-eng.

## Resultat

Fem sider er flyttet fra `Base` til `MalWow` med `bevegelse="rolig"`: `/sjekk`, `/verktoy`, `/verktoy/uu-sjekk`, `/verktoy/dmarc` og `/verktoy/priskalkulator`. `ForOgEtter` og `Snitt` er portert til `src/components/wow/verktoy/`. V1-komponentene står urørt, fordi `nettsider.astro` og `lab/svg.astro` fortsatt importerer dem.

**Verktøyene virker som før.** Samme id-er (`#url-sjekk`, `#url-uu`, `#domene`, `#dkim`, `#dmarc-skjema`, `#kalk`, `#svar`, `#sider`, `#cms`, `#app`, `#r-epost`, `#resultat`, `#markedet`), samme feltnavn, samme POST-kropper og samme feiltekster. Prøvd i nettleseren med etterlignede svar ved 390 og 1440:

| | Venter | Resultat | Feil fra API (503) | Nettfeil | `?param=` |
|---|---|---|---|---|---|
| /sjekk | fem rader «Venter» | rapportark, fokus på tittelen, `?url=` i adressen | én rad «Ikke sjekket» med årsaken | «Fikk ikke svar fra serveren …» | sender `{"url":"eksempel.no"}` av seg selv |
| /verktoy/uu-sjekk | to rader | rapportark + tabell + to `<details>` (forbehold åpen) | som over, pluss «At sjekken ikke kjørte …» | som over | sender `{"url":…}` |
| /verktoy/dmarc | tre rader | SPF, DKIM, DMARC som målinger | én rad «Ikke sjekket» | som over | sender `{"domene":…}` |

- E-post på /sjekk: sender `{"url","epost"}`, svarer «Sendt. Sjekk innboksen …».
- Priskalkulatoren: `beregn()` er uendret. 12 sider, alle integrasjoner og app gir «System-pakken, 299 400 kr–396 300 kr, endelig pris – gulv, ikke tak». Alle beløp kommer fra `priskalkyle.ts`, `priser.ts` og `markedspriser.ts`.
- `tests/sjekk-url.spec.ts`: 4 av 4 grønne, uendret (kjørt mot dev; dirigenten bør kjøre den mot bygget).

**Æresregelen.** Statusen fra API-et går uendret gjennom `fraSjekk`. En sjekk som ikke kjørte, vises som «Ikke sjekket» med årsaken, aldri «Brudd» eller «Bestått». «Må testes manuelt» på UU-siden er alltid «Ikke sjekket». DKIM uten selektor er «Ikke sjekket» med setningen fra API-et.

**SEO.** `<title>`, description, canonical, alle `og:*` og `twitter:*` og all JSON-LD er tegn for tegn like før og etter på alle fem sidene (0 avvik). Ingen interne lenker er borte.

## Målt

| | /sjekk | /verktoy | uu-sjekk | dmarc | priskalkulator |
|---|---|---|---|---|---|
| axe WCAG 2.0–2.2 A/AA, 390 og 1440, tom tilstand | 0 | 0 | 0 | 0 | 0 |
| axe i venter, resultat og feil | 0 | – | 0 | 0 | 0 (alt huket av) |
| Sidelengs overflyt ved 320, 390, 1440 | 0 | 0 | 0 | 0 | 0 |
| Antall H1, første Tab | 1, «Hopp til innhold» | 1, ja | 1, ja | 1, ja | 1, ja |
| Feltets underkant ved 390 × 844 | 479 px | – | 485 px | 484 px | 486 px |
| Uten JS: skjult tekst, noscript | ingen, 1 | ingen, 0 | ingen, 1 | ingen, 1 | ingen, 1 |
| Konsollfeil | 0 | 0 | 0 | 0 | 0 |

- `npx astro check`: 0 feil i mine filer. 2 feil i `nettsider.astro` og `sikkerhet.astro` (B1: status `"mangler"` finnes ikke i `LampeStatus`).
- `npm run test`: 338 av 342. De fire røde står under åpne punkter. To av dem gjelder dette oppdraget.
- Lighthouse og sidevekt er ikke målt (krever bygg).
- Bilder i `.skudd/wow/r8/B2/`: `{sjekk,oversikt,uu,dmarc,kalk}-{m,d}-{topp,hel}.png`, tilstander `{sjekk,uu,dmarc}-{m,d}-{venter,resultat,feil,nettfeil}.png`, `kalk-{m,d}-{valgt,app}.png`, uten JS `utenjs_*.png`. Skript samme sted: `b2.mjs`, `ett.mjs`, `smal.mjs`.

## Rettet etter selvkontrollen

- Kildelenkene i markedstabellen var 21,8 px høye på mobil (axe `target-size`). Nå 28 px.
- Tabellen i UU-resultatet rullet sidelengs uten å kunne nås med tastatur (axe `scrollable-region-focusable`). `MalWow` merker bare tabeller ved innlasting, så skriptet setter samme merke når resultatet kommer.
- DMARC-resultatet sto som «-all · 3/10 OPPSLAG» og «P=NONE». DNS-verdier står nå bokstavrett, i én størrelse, uten versaler.
- `<legend>` i kalkulatoren ble tegnet oppå streken over spørsmålet. Rettet.
- «Gjelder»-kolonnen i markedstabellen ble ti linjer høy på mobil. Den har nå lesebredde, og tabellen ruller.
- «Metode.38 forsider» manglet mellomrom.
- H1 på dmarc og raden på /verktoy delte seg «E-» / «POST». Hard bindestrek (U+2011) i den synlige overskriften; `<title>` er uendret.
- Lampa «Din side: ikke målt» er av på dmarc. Der sjekkes et domene, ikke en side.
- Kodeblokken på dmarc gikk over hele bredden. Den følger nå lesebredden.

## AI-preg (del 12)

Ingen etiketter over overskrifter, ingen nummer, ingen «→». Monospace bare i `<code>` (`p=none`, `dig`-kommandoen, axe-regelnavn). Midtprikkene mine er byttet med komma eller tankestrek. Ingen kort: rader med strek. Ingen inntoning ved rulling; resultatet tones inn på 280 ms som svar på handling. Opptellingen av summen i kalkulatoren er fjernet.

Står igjen: «35 krav i WCAG 2.0» står to ganger på /sjekk (notatet og raden i `ForOgEtter`), som i v1. SPF-verdien fra `dns.ts` har midtprikk («-all · 3/10 oppslag»); den kommer fra API-et.

## Filer endret

- Flyttet over: `src/pages/sjekk.astro`, `src/pages/verktoy/index.astro`, `src/pages/verktoy/uu-sjekk.astro`, `src/pages/verktoy/dmarc.astro`, `src/pages/verktoy/priskalkulator.astro`
- Nye: `src/components/wow/verktoy/ForOgEtter.astro`, `src/components/wow/verktoy/Snitt.astro`, `src/components/wow/verktoy/Verktoystil.astro` (felles global stil for resultatområdet, ingen markup), `docs/design/rapporter/wow-r8-B2.md`
- Ikke rørt: `sjekk.ts`, `hent.ts`, API-rutene, `wow.css`, `tokens-wow.css`, `MalWow.astro`, `side/*`, tester, v1-komponentene.

## Kilder

Ingen eksterne kilder hentet. Internt: `docs/design/rapporter/wow-r8-grunnmur.md`, `docs/design/wow-undersider.md` del 1.8, 3 og 4, `src/pages/verktoy/cookie-sjekk.astro` (mønster), v1-sidene fra arbeidstreet som sammenligningsgrunnlag for `<head>` og lenker.

## Åpne spørsmål og antakelser

**Røde tester som følger av flyttingen (trenger avgjørelse, jeg eier ikke testene):**

1. `test/sjekk-sekvens.test.ts:138` leter etter `ok: "Bestått"` i `sjekk.astro`. Ordene ligger nå i `statusOrd`/`fraSjekk` i `side/maaling.ts`, og `SjekkSekvens` står ikke på siden lenger. Testen bør lese `maaling.ts`, eller slettes sammen med `SjekkSekvens`. Jeg la ikke inn en død konstant for å få den grønn.
2. `test/bygget-html.test.ts:258` krever `data-demo-spill` (v1 `Demo`) på de fem verktøysidene. Den er rød på cookie-sjekk allerede og blir rød på mine fire etter neste bygg. `Opptak` bruker `data-opptak`.
3. Ikke mine: `.DS_Store` i `public/media/wow/` er tilbake, og typefeilen hos B1.

**Avvik fra v1 som bør ses på:**

4. **/verktoy: «Motoren er åpen kildekode» er ute** (`npx kodekonsulentene sjekk`, GitHub Action). Planen sier at den bare rendres med eiers bekreftelse.
5. **/verktoy: de tre punktene per verktøy er ute** (planen: rader med navn og én linje). Setningen «Kortene uten lenke er under arbeid» er også ute; alle fem har lenke.
6. **/verktoy: opptaket er `opptak.dmarc`** med bildeteksten fra `opptak.json`. V1 brukte `/historie/verktoy-*.mp4` med en lengre tekst skrevet i siden. `Opptak` tar bare nøkler fra `opptak.json`. Filene i `public/historie/verktoy-*` er nå uten referanse.
7. **/sjekk: `SjekkSekvens` er ute** (spilte av seg selv; «rolig» har ingen bevegelse uten handling, og planen lister den som ut).
8. **Terminalutsnittene** er blitt lister med de samme ordene. `dig`-kommandoen står som kode. Siste linje på UU-siden er setningen fra utsnittets skjermlesertekst.
9. **dmarc: snittet er flyttet** fra over feltet til forklaringen, der det erstatter lista SPF/DKIM/DMARC. Bildeteksten til snittet er skjult, fordi avsnittet under sier det samme. Feltet har nå `pattern` og feilteksten «Det ser ikke ut som en nettadresse» fra `UrlFelt`.
10. **`?url=` og `?domene=` leses nå fra adressen** på uu-sjekk og dmarc også i bygget. I v1 virket det bare i dev.
11. **Lampa ved feltet bytter ikke til samlet status** etter en sjekk (planen del 1.8). Det mangler tekst for det, og mønstersiden gjør det ikke.
12. Midtprikker byttet: «endelig pris · gulv, ikke tak» er «endelig pris – gulv, ikke tak»; «timer · anslag» er «timer, anslag».

**Felles endringer jeg ikke kunne gjøre:**

13. `Brodsmuler` bryter på mobil med skråstreken først på ny linje når tittelen er lang (dmarc, priskalkulator).
14. `MalWow` merker rullende tabeller bare ved innlasting. Cookie-sjekken har trolig samme axe-brudd i resultatet på 390. En `MutationObserver` i `MalWow` ville løst det for alle.
15. `Verktoystil.astro` bør inn i `wow.css`, og cookie-sjekken bør bruke den.
16. `delVerdi()` passer ikke på fritekstverdier. Jeg overstyrer stilen på dmarc-siden; en `verdiStil: "ordrett"` i `maalingHtml()` ville vært ryddigere.
17. Opptakene viser v1-drakten (kjent fra grunnmuren).

## Neste steg

1. Dirigenten: avgjør de to røde testene (punkt 1 og 2) før `verify`.
2. Eier: bekreft eller avkreft «åpen kildekode»-påstanden (punkt 4).
3. `revisor`: Lighthouse og sidevekt mot bygget, og `tests/sjekk-url.spec.ts` mot bygget.
4. `kritiker`: /verktoy-oversikten og resultatet i priskalkulatoren ved 1440.
5. `tekstforfatter`: punkt 5, 6, 8 og 11.
6. Bygger med `side/*`: punkt 13–16.
