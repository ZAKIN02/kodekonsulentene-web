# wow-r8-B1: tjeneste- og bransjesidene over i wow-drakten

Gren `redesign/wow`, 24. nov. 2026. Ikke committet. Målt mot `astro dev --port 4730 --ignore-lock` (ikke mot bygg; dirigenten kjører `verify`). Skills lastet: frontend-design, wai-implementation, emil-design-eng.

## Resultat

Seks sider er flyttet fra `Base` til `MalWow` med `bevegelse="film"`, og tre komponenter er portert. Ingen av dem bruker v1-komponenter, `scener.css` eller `tokens.css` lenger.

| Side | Toppdel | Rekkefølge etter toppen |
|---|---|---|
| `/nettsider` | Kapittel 1, skrubb | KodeBygg, fire krav (to med måling og dato fra `historie.ts`), ekte skjermbilder, Prosess, Prisliste (Start, Bedrift), kontakt |
| `/systemer` | Kapittel 2, skrubb | «Hvordan det ser ut i praksis» (tekst, ekte skjermbilder, Flyt), «Det vi kobler oftest» (rader med teknisk linje og kilde), Prisliste (System), kontakt |
| `/apper-og-ai` | Kapittel 3, skrubb | «To flater, én kobling», «Tre ting en app løser», «Fire steg» (nummerert, ekte rekkefølge), «AI som gjør en jobb», de fem reglene, AiTekst, kontakt |
| `/sikkerhet` | SideHode stor med Rapportark | SamtykkeSekvens, «Verktøyet tok oss selv» med Opptak, «Seks ting», «Fire krav», Lovsjekk-pakken med pris og UrlFelt, kontakt |
| `/bransjer/handverkere` | Kapittel 3, still | SSB-tallene med kilde og forbehold, Flyt, demo (`#demo`), «Det du allerede betaler for», UrlFelt, kontakt med egen tittel |
| `/bransjer/klinikker` | Kapittel 2, still | «Tre tall dere kjenner igjen» (tomme rader), Flyt, demo (`#demo`), «Medlemmer, ikke bare timer», UrlFelt, kontakt med egen tittel |

Porteringer i `src/components/wow/tjeneste/` (v1-filene står urørt, lab-sidene bruker dem fortsatt):

- `KodeBygg.astro` og `KodeEksempel.astro`: leser fortsatt den ekte fila fra disk ved bygg og stopper bygget hvis et anker mangler. Tidene regnes av `--wow-tid-*`.
- `AiTekst.astro`: samme skjema, id-er, data-attributter, kall mot `/api/ai-tekst`, feiltekster og lenken `/personvern#ai`. Skriptet er det samme, med nye klassenavn.
- `SamtykkeSekvens.astro`: samme innhold og samme data. Spiller nå når figuren kommer i syne (den står under toppdelen), ikke ved innlasting.
- `Rader.astro` (ny): rader i samme tegning som `Kravrader`, med teknisk linje, kildelenke, lenke først i teksten og en nummerert variant.

## Målt

| | nettsider | systemer | apper-og-ai | sikkerhet | handverkere | klinikker |
|---|---|---|---|---|---|---|
| title, description, canonical, robots, `og:*`, `twitter:*`, JSON-LD mot v1-bygget (20 felt) | likt | likt | likt | likt | likt | likt |
| Lenker i `<main>` som er borte | 0 | 0 | 0 | 0 | 0 | 0 |
| Skjemaer (`action`) før og etter | like | like | like | like | like | like |
| axe WCAG 2.0–2.2 A/AA ved 390 og 1440 | 0 | 0 | 0 | 0 | 0 | 0 |
| Sidelengs overflyt ved 390 og 1440 | 0 | 0 | 0 | 0 | 0 | 0 |
| Én H1, første Tab «Hopp til innhold» | ja | ja | ja | ja | ja | ja |
| Uten JS: skjult tekst | ingen | ingen | ingen | ingen | ingen | ingen |

- Ved 320 px: axe 0 på alle seks, overflyt 0 på fem. `/bransjer/klinikker` har 12 px overflyt ved 320 px: «rett i behandlerens timebok» i `Flyt` (`.wow-flyt__detalj`) får ikke plass i høyre spalte. Det er felleskomponenten `side/Flyt.astro`, som jeg ikke eier; se åpent punkt 10. Overflyt ved 320 px på systemer og apper (5 og 21 px, rutenett uten `minmax(0, 1fr)`) er rettet og målt til 0.
- Nytt i lenkesettet: `/bransjer/klinikker` på `/nettsider` (skjermbildet lenker dit).
- `npx astro check`: 0 feil, 0 advarsler.
- `npm run test`: 339 av 342. De tre røde ligger utenfor mine filer: `public/media/wow/.DS_Store` har kommet tilbake (grunnmurens avvik 9), `/verktoy/cookie-sjekk spoler fortsatt opptaket` (leser `dist/`, grunnmurens side) og `test/sjekk-sekvens.test.ts` «statusordene …» (`/sjekk`, B2). Typekontrolltesten var rød på mine to feil underveis og er rettet.
- Ikke målt: Lighthouse, LCP og sidevekt (krever bygg). Ingen side er åpnet i Safari eller Firefox.
- AI-demoen er bare prøvd med etterlignet svar fra `/api/ai-tekst` (sondering og strøm). Ekte kall er ikke kjørt.
- Bilder: `.skudd/wow/r8/B1/<side>/{390,1440}.png` (helside), `{390,1440}-topp.png`, og biter i `del-*.png`. Full bevegelse i `.skudd/wow/r8/B1/bevegelse/` (toppskjerm, kapittelet midtveis, sekvensene midtveis og ferdig, AI-svaret). Skript samme sted: `skudd-b1.mjs`, `maal-b1.mjs`, `hode.py`, `overflyt.mjs`, `bevegelse-b1.mjs`.

## Rettet etter selvkontrollen

- Radene i det grønne sporet i SamtykkeSekvens hadde rødlig bunn: fargeblandingen var regnet på figuren, ikke på raden.
- «0 , 3 1 s» og «3 cookies , 2 sporere»: tabelltall gir luft rundt komma i Schibsted. Fjernet der det står komma.
- «79 / %» brøt over to linjer i bildeteksten på mobil. Hardt mellomrom.
- Overflyt ved 320 px på systemer og apper (se over).
- To typefeil: `historie.ts` har statusen «mangler», lampa heter «brudd».

## AI-preg (del 12)

Ingen etiketter over overskrifter, ingen `// 01`, ingen «→», ingen midtprikk som pynt. Monospace bare på kode, filsti, cookienavn, vertsnavn, feltnavn fra skanneren og rådata fra modellen. Ingen kort i rutenett: rader med strek. Nummer bare på «Fire steg» og de fem AI-reglene, som er rekkefølger. Ingen inntoning ved rulling utover det malen gjør med H2; KodeBygg og SamtykkeSekvens spiller én gang og forklarer noe. To paneler side om side i SamtykkeSekvens og to flater i AiTekst er sammenligninger, ikke fyll.

## Tekst som er endret eller borte

Alt annet er ordrett. Tekstforfatter bør se på disse:

1. **Midtprikker er blitt komma eller kolon** i SamtykkeSekvens («førstepart, 730 dager», «3 cookies, 2 sporere», «uberørt, 0 klikk»), AiTekst («Før: din tekst», «Etter: forslag fra Claude», statuslinja) og stakken under app-casene.
2. **KodeEksempel:** «// MÅLT 2026-10-06» er blitt «Målt 6. oktober 2026».
3. **Kapittelplatene** på de tre tjenestesidene bruker `tjenester.*.problem` og `.losning` fra `historie.ts` slik de står i dag («Bakeriet. Kunden står utenfor …»). Lab-siden hadde eldre ordlyd.
4. **/sikkerhet, ingressen:** lenken på «vi målte» er borte fordi `SideHode` tar ren tekst. `/sjekk` står som knappen «Kjør den på din side» (teksten fra v1-rapporten).
5. **/sikkerhet, målingene:** rapportarket viser de fire målingene fra 18. nov. (`historie.ts`). V1-rapporten fra 6. okt. er borte, med raden «Ytelse 133 ms», de fem forklaringene og «Samlet: 90 av 100 …».
6. **/sikkerhet:** terminalutsnittet står som én setning (utsnittets skjermlesertekst). Storflate «Det sto åpent.» med teksten er borte.
7. **/nettsider:** borte er Snitt, Storflate «Fra skjelett til ferdig.», opptaket av lagstabelen med bildetekst og hele «Hva det er bygget av». Prosess bruker forsidens tekst med datoer, ikke `data/prosess.ts`.
8. **/apper-og-ai:** de fem reglene har fått stor forbokstav. `aksent`-ordene og merkelappene over H1 er borte på alle sidene.
9. **/bransjer/handverkere:** seksjonen «Slik ser de ut før noen har sett på dem» med avsnittet «Sju forespørsler i uka …» er borte sammen med det genererte bildet den beskrev. Nytt: to etiketter ved tallene, «Bygg og anlegg, 10–19 ansatte» og «Alle foretak med minst ti ansatte».
10. **/bransjer/klinikker:** terminalutsnittet («mest kveld og helg», «dere selger når kundene ikke kjøper») er borte. Det var påstander som ikke er målt.
11. **Terminalutsnittene** på systemer og handverkere er borte (planen).

## Avvik fra planen

- **/sikkerhet, Lovsjekk** er en vanlig seksjon med `Prisrader` og `UrlFelt`, ikke refleksfelt. `Refleksfelt` har ingen overskrift, og H2-en «Rydd opp i den siden du har» ville blitt et avsnitt.
- **/sikkerhet, «Fire krav»** bruker `Rader`, ikke `Kravrader`, for å beholde lenken til Lovdata.
- **Rapportarket på /sikkerhet** står ferdig ved innlasting. Planen ville at radene låser seg én etter én; komponenten har ikke det.
- **Andre handling i kapitlene** er sidens egen fra v1 («Se hva som kan kobles», «Hva en app løser», «Se befaringsflyten», «Se bookingflyten»), ikke «Sjekk siden du har i dag» overalt. Ellers hadde ankerlenkene forsvunnet.
- **Ingen `Sporsmal`** på tjenestesidene. Jeg har ikke gått gjennom `faq.ts` for å se om 3–5 svar passer hver tjeneste.
- **Ingress i kapittelet** er hele v1-ingressen (to setninger, fire linjer på mobil), ikke «maks to linjer».
- **Egen Vite-cache for dev-serveren.** Fem dev-servere delte `node_modules/.vite` og ga hverandre 504 på GSAP og Lenis. Jeg kjørte min med `.skudd/wow/r8/B1/astro.b1.config.mjs` (samme konfigurasjon, `cacheDir: node_modules/.vite-b1`). Ingen låst fil er endret.

## Filer endret

- Skrevet om: `src/pages/nettsider.astro`, `systemer.astro`, `apper-og-ai.astro`, `sikkerhet.astro`, `bransjer/handverkere.astro`, `bransjer/klinikker.astro`
- Nye: `src/components/wow/tjeneste/{KodeBygg,KodeEksempel,AiTekst,SamtykkeSekvens,Rader}.astro`, `docs/design/rapporter/wow-r8-B1.md`
- Utenfor git (ignorert): skript, bilder og midlertidig konfigurasjon i `.skudd/wow/r8/B1/`

## Kilder

Ingen eksterne kilder hentet. Internt: `docs/design/rapporter/wow-r8-grunnmur.md`, `docs/design/wow-undersider.md` del 1.2–1.4, 2 og 4, `src/pages/priser.astro`, `src/pages/lab/kapittel/[side].astro`, og v1-bygget i `dist/` (24. nov. 16:10) som sammenligningsgrunnlag.

## Åpne spørsmål og antakelser

1. **«2 vår» på /bransjer/handverkere.** Første steg i demoen har tidsangivelsen «2 vår» i v1. Den står nå som stor dato over steget. Det ser ut som en skrivefeil, men jeg vet ikke hva det skulle stått. Eier eller tekstforfatter må gi riktig tekst.
2. **To datoer på /sikkerhet.** Rapportarket er målt 18. nov., SamtykkeSekvens og KodeEksempel leser `maalinger.json` fra 6. okt. Begge er ekte, men de står rett under hverandre. En ny kjøring av `.skudd/maaling-egen.mjs` ville samlet dem.
3. **«Hva det er bygget av» på /nettsider** er ikke rendret (planens åpne punkt 3: «Hosting Cloudflare» og «0 kB JS på forsiden» stemmer ikke med nettstedet). Faktasjekker avgjør om den skal tilbake.
4. **Skjermbildene i `public/media/wow/ekte/` viser v1** i lyst tema, og opptaket av terminalen viser v1. Nye må tas når alle sidene er flyttet (bølge C).
5. **H1 på /apper-og-ai bryter med «FÅ» alene på første linje** ved 1440. Det styres av `Kapittel` (bevegelse eier den).
6. **Prisliste med én pakke** (/systemer) viser en radioknapp med ett valg. Den kunne hatt en variant uten velger (`seksjoner/Priser.astro`, ikke min fil).
7. **Felles ønsker:** `SideHode` med slot for ingress (lenke i ingressen), og `Kravrader` med lenke i teksten. Da kan `Rader` forenkles.
8. Antakelse: «Book 20 minutter» i kapitlene peker til `bookUrl` (Cal.com) som i v1, ikke til `#kontakt`.
9. `tests/wow/sider-tjenester.spec.ts` (nevnt i planen) er ikke skrevet. `tests/wow/kapittel.spec.ts` er ikke kjørt.
10. **`Flyt` ved 320 px:** detaljteksten bryter ikke lange ord, og gir 12 px sidelengs rulling på /bransjer/klinikker. Forslag: `overflow-wrap: anywhere` på `.wow-flyt__detalj` i `side/Flyt.astro`.

## Neste steg

1. Dirigenten: `npm run verify`, så Lighthouse og sidevekt på de seks sidene. Åpent punkt 10 hos den som eier `side/Flyt.astro`.
2. `kritiker`: toppen på /sikkerhet (rapportark og sekvens tett på hverandre) og mobilvisningen av KodeBygg (koden brytes og blir lang).
3. `tekstforfatter`: lista «Tekst som er endret eller borte», og åpent punkt 1.
4. `faktasjekker`: åpent punkt 2 og 3.
5. `bevegelse`: åpent punkt 5, og om rapportarket på /sikkerhet skal låse seg rad for rad.
6. Bølge C: nye skjermbilder og opptak, og sletting av v1-komponentene når lab-sidene er flyttet.
