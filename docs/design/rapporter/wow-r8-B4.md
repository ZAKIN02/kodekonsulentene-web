# wow-r8-B4: caser, om, kontakt, status og 404 i wow-drakten

Gren `redesign/wow`, 24. nov. 2026. Ikke committet. Målt mot `astro dev --port 4760 --ignore-lock` (stoppet). Ikke målt mot bygget: Lighthouse, sidevekt og JS-størrelse står igjen til dirigentens verify. Skills lastet: frontend-design, emil-design-eng, wai-implementation.

**Status: DELVIS.** De fem sidene er flyttet og overflyten på forsiden er rettet. To ting krever endring i filer jeg ikke eier: to tester i `test/uuregister.test.ts` blir røde i bygget (punkt 1 under «Trenger avgjørelse»), og kontrastbruddet på forsiden kommer fra en annen komponent enn oppdraget oppga (punkt 2).

## Resultat

1. **/caser** (film): `SideHode` stor, casene fra `synligeCaser` sortert etter kapitlene i filmen, «Derfor er listen kort» som `Tekstrader` uten nummer, `Kontaktblokk` med pilottilbudet ordrett. Én case vises (booking-demoen), med merkene «Demo» og «Ikke et levert oppdrag», ekte skjermbilde i `Ramme`, og setningen om at det ikke finnes målte tall. Resultatlista rendres bare når `resultat` finnes.
2. **/om** (film): `Kapittel` 4 (verkstedet, skrubb) med forhåndslasting, «Hvorfor det er bygget slik» med registertallet fra `uu-register.json` og det ekte opptaket `flyt` ved siden, «Hva vi ikke gjør» som `Tekstrader`, de fire målingene fra `historie.ts` som `Rapportark` med adresse og dato, `Kontaktblokk`.
3. **/kontakt** (rolig, `prerender = false`): `Kontaktblokk niva={1} fakta="full"` er hele toppdelen, med `tilstand` fra `?sendt=1`, `?feil=1` og `?feil=2`. Deretter «Kjør sjekken først». `noindex` ved kvittering og feil som før.
4. **/status** (rolig): tre `Maaling`-rader («Bestått», samme ord som v1-merket), forbeholdet om oppetid, budsjettet som åtte rader uten lampe, avviksløpet som `Steg`, og «Du trenger ikke melde fra» med de to lenkene. Ingen egne skript, ingen bilder. Svarer 200.
5. **/404** (rolig, `noindex`): `SideHode`, gjettet først, innfelt terminal i spalte 1–7 og «Sider som finnes» i spalte 8–12 med «Til forsiden». Feltet er `disabled` i HTML-en til skriptet slår det på.
6. **Mentedu** er portert til `src/components/wow/info/Mentedu.astro`: samme skript, kandidatliste og terskel, klassene heter `wow-mentedu…`, stilen bruker bare `--wow-*`, stien står i vanlig skrift. V1-fila er ikke rørt (bølge C).
7. **Forsidens kontaktdel:** sidelengs overflyt er borte. Årsak: `wow-glir-inn` forskjøv selve rammen 8 % mot høyre, og `clip-path` fjerner ikke en forskjøvet boks fra rulleområdet. Nå avdekkes rammen med `clip-path` alene, og forskyvningen ligger på bildet inne i rammen (`overflow: clip`). Bare blokken «Bildet glir inn fra høyre» i `wow.css` er endret. `Kontakt.astro` er ikke rørt.

## Målt (dev-server)

| | /caser | /om | /kontakt | /status | /404 |
|---|---|---|---|---|---|
| axe WCAG 2.0–2.2 A/AA ved 390, 1440, 320 | 0 | 0 | 0 (også `?sendt=1`, `?feil=2`) | 0 | 0 |
| Sidelengs overflyt ved 390, 1440, 320 | 0 | 0 | 0 | 0 | 0 |
| Én H1, første Tab «Hopp til innhold» | ja | ja | ja | ja | ja |
| Uten JS: skjult tekst | ingen | ingen | ingen | ingen | ingen |
| `localStorage`, cookies | ingen | ingen | ingen | ingen | ingen |
| Statuskode | 200 | 200 | 200 | 200 | 404 |

- **SEO-felt:** `<title>`, description, robots, canonical, alle `og:*`/`twitter:*` og JSON-LD er like før og etter på alle fem sider og de tre kontakt-tilstandene (`.skudd/wow/r8/B4/hode-for.json` mot `hode-etter.json`).
- **Lenker i `<main>`:** ingen borte, bortsett fra `/terminal` på 404 (sto i v1-snarveikartet, som nå ligger i `MalWow`; lenken står også i bunnen). /om har to nye: `#kontakt` og `/sjekk` i kapittelet.
- **Kontaktskjemaet, etterlignet svar** (POST fanget i nettleseren, ingen e-post sendt), med og uten JS: sender `navn`, `epost`, `nettside`, `melding` som `application/x-www-form-urlencoded`. Svar 303 til `?sendt=1` gir grønn lampe og «Takk – meldingen kom fram», `?feil=1` og `?feil=2` gir rød lampe og v1-tekstene ordrett, alle med `role="status"` og `noindex`. Tomt skjema stoppes av `required`.
- **Ekte API lokalt:** ugyldig innsending gir 303 til `/kontakt?feil=1`; fremmed `Origin` gir 403. `src/pages/api/` og `src/lib/` er urørt.
- **Forsiden, kontaktdelen:** overflyt før 66 px (1440), 8 px (390), 2 px (320); etter 0 ved alle tre, også midt i animasjonen og med redusert bevegelse.
- **/om, kapittelet:** ingen video hentes ved innlasting; `kapittel-4.mp4` (mobil: `-m`) hentes først ved rulling. 0 overflyt under rullingen.
- **`npx astro check`:** 2 feil, begge i B1 sine filer (`nettsider.astro:107`, `sikkerhet.astro:111`, statusen `"mangler"` passer ikke `LampeStatus`). 0 i mine.
- **`npm run test`:** 338 av 342. De fire røde er ikke fra mine filer: `public/media/wow/.DS_Store` er tilbake, `astro check` (B1 over), `/verktoy/cookie-sjekk` mangler `data-demo-spill` i `dist/`, og `sjekk-sekvens.test.ts` (statusordene på /sjekk).

Bilder: `.skudd/wow/r8/B4/{caser,om,kontakt,kontakt-sendt,kontakt-feil1,kontakt-feil2,status,404}/{m,d}-{topp,hel}.png`, `om/film-*.png` og `caser/film-*.png` (full bevegelse under rulling), `skjema-*.png`, `forside-kontakt-{for,etter}-{m,d,s}.png`. Skript samme sted.

## Rettet etter selvkontrollen

- /status ved 320 px: «Ytelsesbudsjettet» var bredere enn spalten (34 px overflyt). Overskriften får krympe og dele ordet under 1024 px.
- /kontakt `?feil=2` ved 320 px: e-postadressen sprengte meldingsboksen (9 px). Rettet med en sideregel i `kontakt.astro`; den hører hjemme i `Kontaktblokk`.
- /status: budsjettet sto først som `Prisrader` i displayskrift. «≥» og «≤» kom fra reserveskriften og ble dobbelt så store. Nå en enkel `<dl>` i vanlig skrift, i åtte spalter.
- `tabular-nums` ga «2 , 5 s» og «2 . 2 AA». Fjernet (samme fallgruve som i grunnmuren).
- /caser: skjermbildet hadde en lys stripe nederst. Rammen er 16:9 fra toppen, så stripa kuttes. `sizes` var for lav og ga uskarpt bilde på desktop; rettet til `94vw`.
- Skjermbildeskriptet kuttet `=1` i `?sendt=1`, så de første bildene av kvitteringen viste siden uten. Rettet i min kopi (`B4/skudd.mjs`); originalen i `r8/` har samme feil.

## AI-preg (del 12)

Ingen etiketter over overskrifter, ingen nummer på krav og avslag, ingen «→», teknologilista på casen står med komma i vanlig skrift. Monospace bare i den ekte terminalen på 404. Budsjettallene sto to ganger i v1 (store tall og liste) og står nå én gang. Ingen inntoning på de rolige sidene. Gjenstår: H1 på /om og standardtittelen i kontaktblokken er nesten samme setning («Du snakker med den som koder» / «Snakk med den som koder»), som i v1.

## Avvik og valg

1. **/caser viser bare det `caser.ts` har.** Planen vil ha «denne siden» som nettside-case med målingene. Den teksten finnes ikke, og jeg har ikke skrevet den.
2. **Alt-teksten på case-bildet er min:** «Skjermbilde av bookingflyten på siden for klinikker: fire steg fra bestilling til oppgjør.» Eneste setning jeg har skrevet.
3. **Platen i kapittelet på /om** bruker linjene fra `/lab/kapittel/om`: «Her måler vi. Vi foreslår ingenting før tallene er klare.» og «Fire målinger av denne siden, med samme sjekk som du får.» `historie[4]` har ikke lenger en løsningslinje. Ingressen er hele v1-ingressen og går over fire linjer på mobil (komponenten ber om to).
4. **Overskriften «Målt, ikke anslått»** er fra planen (`wow-undersider.md` del 1.6), ikke fra tekstmanus. Seksjonen viser de fire målingene fra `historie.ts`, ikke `bevis.ts`: «0,1 s svartid» er udokumentert, og «24 t» er et løfte som står i teksten.
5. **Tatt ut etter planen:** `Lagstabel` med bildetekstene på /om, terminalutsnittet på /kontakt (prisspenn på telefonen, skriftlig tilbud innen to dager, ingen binding), `Nokkeltall` på /status. Terminalutsnittet på /status står som et notat med utsnittets skjermlesertekst ordrett; der står «utvikleren», ikke «vi».
6. **/kontakt følger `Kontaktblokk` sin ordlyd,** som avviker fra v1: «Book direkte» (var «Book et kvarter»), «Book 20 minutter» (var «Åpne kalenderen»), «Send meldingen» (var «Send»). Borte: «Fire felt. Ikke flere enn det som trengs for å svare deg.», plassholderen `dinbedrift.no` og hintet under meldingsfeltet. Feltnavn, `required`, `type` og `action` er like. Ingressen er v1 sin, gitt som prop.
7. **Mentedu ligger i `src/components/wow/info/`** (mappa planen gir B4), ikke i `side/`.

## Filer endret

- Flyttet over: `src/pages/caser.astro`, `om.astro`, `kontakt.astro`, `status.astro`, `404.astro`
- Ny: `src/components/wow/info/Mentedu.astro`, `docs/design/rapporter/wow-r8-B4.md`
- `src/styles/wow.css`: bare blokken «Bildet glir inn fra høyre» (`.wow-kontakt__bilde-ramme`, `wow-glir-inn`, ny `wow-glir-inn-bilde`)
- Arbeidsfiler: `.skudd/wow/r8/B4/`

## Kilder

Ingen eksterne. Internt: `docs/design/rapporter/wow-r8-grunnmur.md`, `docs/design/wow-undersider.md` del 1.6, 1.9, 2.1, 3, 4 og 6, `docs/design/redesign-brief.md` del 12, `src/pages/lab/kapittel/[side].astro`, `src/data/historie.ts`, `src/data/caser.ts`.

## Åpne spørsmål og antakelser

**Trenger avgjørelse**

1. **To tester blir røde i bygget.** `test/uuregister.test.ts` linje 367–385 krever at /om inneholder `utenskript__med`, «Dra i stabelen», «Uten JavaScript står lagene fra hverandre» og `@media (scripting: …)`. Planen tar `Lagstabel` og `Utenskript` ut av /om. Testene må slettes eller flyttes til en side som fortsatt har figuren. Jeg har ikke rørt dem.
2. **Kontrastbruddet på forsiden er ikke fra `.wow-kontakt__bilde-ramme`.** axe gir ett brudd ved 390 og 1440: `.wow-hjul__verdi:nth-child(2)` («25. november» med `opacity: 0.3` i datohjulet i Prosess), 2,44:1 mot krav 3:1. Det ligger utenfor unntaket mitt og er ikke rettet. Kontaktdelen alene har 0 brudd, før og etter.

**Åpne punkter**

3. Case-bildet (`klinikker-flyt`) og opptaket `flyt` viser v1-drakten, med «// 03 DEMO». Nye bilder må tas når B1 er ferdig.
4. `Kontaktblokk` bør få `overflow-wrap: anywhere` på meldingsteksten selv, og `Seksjon` tåler ikke et ord på 17 tegn ved 320 px. Begge er løst med sideregler nå.
5. Tekstforfatter: nettside-casen på /caser, platen og ingressen i kapittelet på /om, overskriften «Målt, ikke anslått», og om løftene fra terminalutsnittet på /kontakt skal tilbake som tekst.
6. Antakelse: «Bestått» på /status er riktig ord (v1 viste det). Planen sier «svarer».
7. Portrett og «Hvem jeg er» på /om mangler fra eier, som før.

## Neste steg

1. Dirigenten: avgjør punkt 1 og 2 før verify. Gi punkt 2 til den som eier Prosess.
2. `revisor`: mål de fem sidene i bygget (Lighthouse, vekt, JS) og forsiden på nytt.
3. `kritiker`: se på /caser (ett stort v1-skjermbilde) og /om på mobil (ingress over fire linjer).
4. `tekstforfatter`: punkt 5.
5. `produsent` eller bygger: nye skjermbilder og opptak etter B1 (punkt 3).
