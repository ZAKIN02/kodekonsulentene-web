# Tekstrettelser etter runde 8 (wow-r8-tekst)

Gren `redesign/wow`, 24. nov. 2026. Dette er forslag. Ingen side er endret.
Stemme: bokmål, du-form, «vi». Skills lastet: `kodekonsulentene-tekst`, `design:ux-copy`.

Jeg har ikke skall i denne økta. `git log` og `git blame` er derfor ikke kjørt, og v1-teksten
er bare lest der den fortsatt står i arbeidstreet. Det gjelder punkt 5 og 6 og er merket der.

Merking: **EIER MÅ GODKJENNE** = lovpålagt tekst eller en påstand bare eier kan bekrefte.
`[MANGLER: …]` = finnes ikke i repoet. `PLASSHOLDER` = skal ikke rendres før det er fylt inn.

---

## 1. Personvern og Hukommelse. EIER MÅ GODKJENNE

Filer: `src/pages/personvern.astro`, `src/components/wow/les/Hukommelse.astro`.
Erklæringen har selv et forbehold om at den ikke er kvalitetssikret av advokat. Det gjelder
også forslagene under.

### 1.0 Hva siden faktisk lagrer i dag (lest i koden)

| Hva | Hvor i koden | Hvilke sider | Status |
|---|---|---|---|
| `sessionStorage` `wow-inngang` = `"1"` | `src/components/wow/Intro.astro:29`, lastes av `MalWow.astro:139` når `forside` | Forsiden, første visning i fanen. Også `/lab/scroll-world` og `/lab/wow-bevegelse` | **Lagres i dag** |
| `localStorage` `kk-prisvalg` | `src/components/Prisvelger.astro:248,348` | Bare `/lab/lek` | Lagres i dag, på en intern side |
| `localStorage` `kk-tema` | Slettes i `MalWow.astro:158` og `Base.astro:161` | Alle | Lagres ikke. Ryddes bort |
| `sessionStorage` `kk-apning` | `src/components/Apning.astro:103` via `Base.astro:130` (bare når stien er `/`) | Ingen. Forsiden bruker `MalWow` | Død kode |
| Cookies | Ingen skriving funnet i `src/`, `public/`, `server.mjs`, `sikkerhet.mjs` | – | Ingen |

To ting følger av dette:

1. **Det stemmer ikke at ingenting lagres.** Forsiden skriver `wow-inngang` i øktlageret for å
   vise åpningen én gang. Sidens egen cookie-sjekk sier at øktlager teller som lagring etter
   ekomloven § 3-15 (`src/pages/verktoy/cookie-sjekk.astro:242`). Byggernes måling «ingen
   `localStorage` og ingen cookies» så ikke i `sessionStorage`.
2. **Hukommelse måler bare `localStorage` og cookies.** «Ting lagret i din nettleser: 0» står
   altså også når `wow-inngang` ligger i fanen.

Derfor to varianter. **Jeg anbefaler A.** B gjør at siden ikke lenger kan si «ikke noe å
samtykke til» uten en juridisk vurdering.

- **Variant A:** bevegelse fjerner `wow-inngang` (åpningen styres uten lagring), og `/lab/lek`
  slutter å skrive `kk-prisvalg` eller slettes (bølge C). Da stemmer teksten under.
- **Variant B:** `wow-inngang` blir stående. Da må den stå i erklæringen og i tabellen, og
  Hukommelse må lese `sessionStorage`.

### 1.1 Avsnittet under «Cookies» (`personvern.astro:74–78`)

Nå:

> Ett unntak, som ikke er en cookie: velger du lyst eller mørkt tema, lagres valget i
> nettleserens eget lager (`localStorage`) på din maskin. Det sendes aldri til serveren, og vi
> kan ikke lese det.

Variant A:

> Siden lagrer heller ikke noe annet i nettleseren din. En tidligere utgave lagret valget
> mellom lyst og mørkt tema i nettleserens eget lager (`localStorage`). Har du det liggende fra
> et tidligere besøk, slettes det neste gang du åpner en side her.

Variant B:

> Ett unntak, som ikke er en cookie: første gang du åpner forsiden i en fane, lagres en
> markering (`wow-inngang`) i nettleserens øktlager (`sessionStorage`), slik at åpningen bare
> vises én gang. Markeringen inneholder ingen opplysninger om deg, sendes aldri til serveren
> og slettes når du lukker fanen. En tidligere utgave lagret valget mellom lyst og mørkt tema.
> Har du det liggende, slettes det neste gang du åpner en side her.
>
> `[MANGLER: juridisk vurdering av om markeringen er «strengt nødvendig» etter ekomloven § 3-15]`

Begrunnelse: temavalget finnes ikke lenger. Setningen om rydding er sann i dag
(`MalWow.astro:158`). «Vi kan ikke lese det» er tatt ut, fordi et skript på siden leser
verdien.

### 1.2 Radene i tabellen (`Hukommelse.astro:35–46`)

Nå:

| Nøkkel | Hva | Hvorfor |
|---|---|---|
| `kk-tema` | Om du valgte lyst eller mørkt tema | Så siden ikke blinker hvitt neste gang du kommer. |
| `kk-prisvalg` | Valgene dine i prisvelgeren | Så du ikke må huke av Vipps og regnskap på nytt. |

Forslag (begge varianter). Radene beholdes som rester, ellers vises de som «Ikke dokumentert i
denne tabellen» hos besøkende som har dem fra før:

| Nøkkel | Hva | Hvorfor |
|---|---|---|
| `kk-tema` | Valget mellom lyst og mørkt tema fra en tidligere utgave av siden | Lagres ikke lenger. Slettes av seg selv når du åpner en side her. |
| `kk-prisvalg` | Valgene dine i den gamle prisvelgeren | Lagres ikke lenger. Ligger den her, er den fra et tidligere besøk. Knappen under sletter den. |

Tillegg i variant B, én rad:

| Nøkkel | Hva | Hvorfor |
|---|---|---|
| `wow-inngang` | At du har sett åpningen på forsiden i denne fanen | Så den bare vises én gang. Ligger i øktlageret og slettes når du lukker fanen. |

Tabelltittelen «Hva vi lagrer, og hvorfor» foreslås endret til **«Det som kan ligge i
nettleseren din»**, fordi radene i variant A er rester og ikke noe siden lagrer.

Til bygger: `KJENTE` i skriptet beholder `kk-tema` og `kk-prisvalg`. Raden `kk-prisvalg` er
bare sann når `/lab/lek` ikke skriver nøkkelen lenger. I variant B må skriptet lese, telle og
slette `sessionStorage` også.

### 1.3 Siste avsnitt i Hukommelse (`Hukommelse.astro:105–109`)

Nå:

> Det finnes ingen samtykkedialog på dette nettstedet, fordi det ikke er noe å samtykke til.
> `localStorage` brukt til ren bekvemmelighet er ikke sporing, og ekomloven § 3-15 krever
> samtykke for lagring som ikke er nødvendig for tjenesten.

Variant A:

> Det finnes ingen samtykkedialog på dette nettstedet, fordi det ikke er noe å samtykke til:
> siden setter ingen cookies og lagrer ingenting i nettleseren din. Ekomloven § 3-15 krever
> samtykke for lagring som ikke er nødvendig for tjenesten.

Variant B: `[MANGLER: avsnittet kan ikke skrives før vurderingen i 1.1 er gjort]`. Med en
markering som bare styrer en animasjon kan vi ikke stå inne for «ikke noe å samtykke til».

Begrunnelse: dagens midtsetning forsvarer en lagring som ikke finnes lenger, og den sier imot
setningen etter.

### 1.4 Følgeendringer

- «Sist oppdatert 5. oktober 2026» (`personvern.astro:15`): settes til datoen eier godkjenner.
  `[MANGLER: dato]`
- `SamtykkeSekvens.astro:61`, «ingen lagring / localStorage: 0», og `/sikkerhet` «null cookies,
  null lagring, null tredjeparter» er bare sanne i variant A.

### 1.5 Funn utenfor punktet, ikke rettet

`personvern.astro:69`: «Besøksstatistikken er cookieløs og teller sidevisninger …». Jeg finner
ingen statistikkode i `src/`, `public/*.js`, `server.mjs` eller `sikkerhet.mjs`, og CSP har
`connect-src 'self'`. `/nettsider` sier også «Vi bruker cookieløs analyse». Eier må si hva som
teller besøk. Finnes det ikke, må begge setningene skrives om.

---

## 2. Overskrift på FAQ i artiklene, og på Hukommelse

### 2.1 Synlig FAQ

Fil: `<Sporsmal liste={sporsmaal} id="sporsmal" storrelse="les" innfelt />` i hver artikkel.
Det gjelder fire artikler, ikke tre: cookie-artikkelen ble flyttet i grunnmuren.

Nå, alle fire: «Det folk spør om først» (standarden i `seksjoner/Sporsmal.astro:38`).

| Artikkel | Fil og linje | Ny `tittel` |
|---|---|---|
| 35 WCAG-krav | `artikler/35-wcag-krav.astro:200` | Spørsmål og svar om WCAG-kravene |
| Cookies før samtykke | `artikler/cookies-for-samtykke.astro:212` | Spørsmål og svar om cookies og samtykke |
| Org.nr. på nettsiden | `artikler/orgnr-pa-nettsiden.astro:216` | Spørsmål og svar om org.nr. på nettsiden |
| WCAG i registeret | `artikler/wcag-i-registeret.astro:308` | Spørsmål og svar om tallene i registeret |

Begrunnelse: «Det folk spør om først» er en påstand om rekkefølge vi ikke har belegg for, og
den er skrevet for forsiden. I en artikkel skal overskriften si hva spørsmålene handler om, med
artikkelens søkeord. Spørsmål og svar er ikke rørt.

### 2.2 Hukommelse (`personvern.astro:183`)

Nå: ingen overskrift. De tre målingene begynner rett etter «Endringer».

Forslag, H2: **Se selv hva siden har lagret hos deg**
Samme tekst i innholdslista, med id `lagret`.

Begrunnelse: flaten er en måling leseren gjør i sin egen nettleser. Overskriften sier det, og
den skiller målingen fra den juridiske teksten over.

---

## 3. /caser og /om

### 3.1 Nettside-casen «denne siden» (`src/data/caser.ts`, vises av `src/pages/caser.astro`)

Nå: finnes ikke.

Forslag. Alt er hentet fra `src/data/historie.ts` og fra teksten som står på `/sikkerhet` i dag:

| Felt | Tekst | Kilde |
|---|---|---|
| `type` | Nettside | ny |
| `kunde` (merket) | Eget nettsted | ny |
| `tittel` | Siden du leser nå | `historie.ts`, linja «siden du leser nå.» |
| `problem` | Vi selger en sjekk av andres nettsider. Da må vår egen bestå den. 6. oktober 2026 kjørte vi cookie-skanningen mot vår egen forside, og den fant to tredjepartskall vi ikke visste om: fontene lå hos Google. | `/sikkerhet`, «Verktøyet tok oss selv» |
| `losning` | Fontene ligger nå på vår egen server, og siden måles med den samme sjekken som du kan kjøre på din. | `/sikkerhet`, samme seksjon |
| `resultat` 1 | **0** cookies før samtykke | `historie.ts` |
| `resultat` 2 | **6/6** sikkerhetsheadere | `historie.ts` |
| `resultat` 3 | **0 feil** universell utforming. Maskinelt testbare feil. Kontrast og tastatur testes manuelt. | `historie.ts`, forbeholdet skal stå |
| `resultat` 4 | **Org.nr. bekreftet** lovpålagt informasjon | `historie.ts` |
| Linje under tallene | Målt 18. nov. 2026 med nettsidesjekken, mot kodekonsulentene.no. | `historie.ts` (`maltDato`, `maltAdresse`) |
| `stack` | Astro, Node, Fly.io | `package.json`, `docs/design/kartlegging.md:30` |
| Knapp | Kjør sjekken selv (til `/sjekk`) | ny |
| Bilde | PLASSHOLDER: skjermbilde av forsiden i ny drakt. Alt: «Skjermbilde av forsiden på kodekonsulentene.no.» | bildene i repoet viser v1 |

Står som PLASSHOLDER, fordi det ikke finnes målt i repoet: leveringstid, timer, besøk,
henvendelser, Lighthouse-tall og lastetid.

Forbehold:
- Målingen 18. nov. er av siden som lå ute da, før den nye drakten. Casen bør ikke vises før
  sjekken er kjørt på nytt etter lansering. Da byttes dato og verdier i `historie.ts`.
- `maalinger.json` har også «133 ms svartid» og «90 av 100» fra 6. okt. De er ikke tatt med,
  fordi de har en annen dato og en annen metode enn de fire radene.
- Til bygger: `Case` har ikke felt for dato eller knappetekst. Knappen heter «Se mer» i dag,
  som ikke sier hva som skjer.

### 3.2 Platen i kapittelet på /om (`om.astro:46–47`)

Nå:
- `problem`: «Her måler vi. Vi foreslår ingenting før tallene er klare.»
- `losning`: «Fire målinger av denne siden, med samme sjekk som du får.»

Forslag:
- `problem`: «Pulten. Tegninger kan ikke måles, så vi målte siden du leser nå.»
- `losning`: uendret.

Begrunnelse: «Vi foreslår ingenting før tallene er klare» er et løfte som ikke står noe annet
sted og ikke kan belegges. Den nye linja er satt sammen av filmens egne linjer i `historie.ts`
(«Tegninger kan ikke måles. Så vi målte det eneste her som finnes:» og «siden du leser nå.») og
følger mønsteret fra de andre platene: sted først. Løsningslinja stemmer med seksjonen lenger
ned.

### 3.3 Ingressen i kapittelet på /om (`om.astro:41`)

Nå (fire linjer på mobil, komponenten ber om to):

> Det er hele forskjellen mellom oss og et byrå. Det er også grunnen til at vi ikke kan ta inn
> tjue prosjekter i måneden.

Forslag:

> Det er hele forskjellen mellom oss og et byrå.

Den andre setningen flyttes til avsnittet «Hvorfor ingen mellomledd» (`om.astro:60–64`), sist:

> … Du får svar innen 24 timer. Det er også grunnen til at vi ikke kan ta inn tjue prosjekter
> i måneden.

Begrunnelse: ingenting forsvinner, og toppen får to linjer. Svartiden hentes fortsatt fra
`firma.svartid`. Title, meta description og H1 er uendret.

### 3.4 Overskriften «Målt, ikke anslått» (`om.astro:117`)

Nå: «Målt, ikke anslått»

Forslag: **Det sjekken fant hos oss**
Alternativ: behold dagens.

Begrunnelse: seksjonen viser fire rader fra nettsidesjekken, med adresse og dato. Den nye
overskriften sier hva som står der. «Fire målinger av denne siden» ville gjentatt platen
ordrett. Dagens overskrift er ikke feil, men den er et slagord, og /caser bruker samme
motsetning i «Tall vi har målt».

---

## 4. /terminal (`src/pages/terminal.astro`). Eier velger

### 4.1 Ingressen (linje 77)

Nå:

> Trykk tilde (~) på et tastatur, så åpner den seg hvor som helst på siden. Den er ikke pynt –
> den kjører de samme sjekkene som verktøyene, mot ekte nettsider, og skriver svaret rett i
> vinduet. På berøringsskjerm er den av, siden den krever tastatur.

**Tilfelle A, terminalen på siden kan skrives i (slik den er bygget nå):**

> Trykk tilde (~) på et tastatur, så åpner den seg hvor som helst på siden. Den er ikke pynt –
> den kjører de samme sjekkene som verktøyene, mot ekte nettsider, og skriver svaret rett i
> vinduet. Har du ikke tastatur, kan du skrive i terminalen lenger ned på denne siden.

**Tilfelle B, stillestående utsnitt (attributtet og feltet fjernes):**

> Trykk tilde (~) på et tastatur, så åpner den seg hvor som helst på siden. Den er ikke pynt –
> den kjører de samme sjekkene som verktøyene, mot ekte nettsider, og skriver svaret rett i
> vinduet. På berøringsskjerm er den av, siden den krever tastatur. Utsnittet under viser hva
> den svarer.

Begrunnelse: i A er siste setning usann på en telefon, der feltet virker. Bare snarveien
krever tastatur.

### 4.2 Siste linje i utsnittet (linje 62)

Nå: «Ingen brudd, 1 bør fikses, 1 ikke sjekket. Samlet: 67/100.»

Terminalen skriver i dag, for de samme radene (`public/terminal.js:106–116`, advarsel teller
som noe å fikse): **«1 å fikse. Samlet: 67/100.»** med varselfarge (`kk-warn`).

Forslag i begge tilfeller: **«1 å fikse. Samlet: 67/100.»**

Begrunnelse: utsnittet gir seg ut for å være det terminalen svarer, og i A står det rett over
et felt der leseren kan kjøre samme kommando.

Til eier og bygger: terminalen nevner ikke raden som ikke er sjekket når noe annet må fikses.
Det er svakere enn æresregelen. Endres `terminal.js` til å ta med begge, blir linja
**«1 å fikse, 1 ikke sjekket. Samlet: 67/100.»** Det er en kodeendring, ikke en tekstendring.

### 4.3 Notatet under utsnittet (linje 114–119)

Nå:

> Utsnittet er vårt eget domene, kjørt 7. oktober 2026. Kjør `dmarc kodekonsulentene.no` i
> terminalen over, så får du det samme svaret fra DNS – og ser samtidig at vår egen DMARC står
> i overvåkningsmodus.

Tilfelle A:

> Utsnittet er vårt eget domene, kjørt 7. oktober 2026. Kjør `dmarc kodekonsulentene.no` i
> terminalen over, så får du svaret fra DNS slik det er i dag.

Tilfelle B:

> Utsnittet er vårt eget domene, kjørt 7. oktober 2026. Trykk ~ og kjør
> `dmarc kodekonsulentene.no`, så får du svaret fra DNS slik det er i dag.

Begrunnelse: «det samme svaret» og «står i overvåkningsmodus» er bare sant til DNS endres.
Utsnittet viser `p=none` med dato, og det holder. I B finnes ingen «terminalen over».
Plassholderen «krever JavaScript» i feltet gjelder bare A.

`[MANGLER: ny kjøring av dmarc mot kodekonsulentene.no. Verdiene er fra 7. okt., jeg har ikke nett.]`

---

## 5. /bransjer/handverkere: «2 vår» (`handverkere.astro:32`)

Nå: `{ navn: "Kunden fyller ut", naar: "2 vår", … }`

Forslag: **«2 min»**

Hva det trolig skulle bety: «2 min», altså to minutter. Mest sannsynlig årsak er et
søk-og-erstatt fra «min» til «vår» da siden ble lagt om fra jeg-form til vi-form. Belegg:

- De tre andre stegene har en varighet eller et tidspunkt: «Straks», «1 klikk», «Samme dag».
- Et søk etter tall fulgt av «vår» i hele `src/` gir bare dette ene treffet.
- `src/data/firma.ts` dokumenterer at siden er lagt om til vi-form.

Ikke bekreftet: jeg har ikke kunnet kjøre `git log -S "2 vår"` eller `git blame`. Dirigenten
kan bekrefte med `git log -S"2 min" -- src/pages/bransjer/handverkere.astro`.

**Spørsmål til eier:** «2 min» er en påstand om hvor lang tid skjemaet tar, og flyten er en
demo som ikke er målt. Vil eier ikke stå for tallet, foreslår jeg **«Fra telefonen»**. Det
står allerede i stegets tekst («tre bilder fra telefonen») og påstår ingenting om tid.

---

## 6. /nettsider: «Hva det er bygget av» (ikke rendret i dag)

V1-teksten står ikke lenger i arbeidstreet, og jeg har ikke git. De to påstandene som er
gjengitt i planen, er kontrollert. Resten er skrevet opp fra det repoet viser.

| Påstand | Holder? | Belegg |
|---|---|---|
| «Hosting Cloudflare» (v1) | **Nei** | Fly.io, region Amsterdam: `docs/design/kartlegging.md:30` (`fly.toml`), `personvern.astro:158`, `package.json` `"deploy": "fly deploy"` |
| «0 kB JS på forsiden» (v1) | **Nei** | `package.json` har `gsap`, `lenis`, `embla-carousel`, `number-flow`. Planen oppgir ca. 63 kB. Ikke målt i runde 8 |
| Astro 7 | Ja | `package.json`: `astro ^7.3.5` |
| Egen Node-server | Ja | `@astrojs/node ^11.1.6`, `server.mjs` |
| Fonter på eget domene, to familier | Ja | `MalWow.astro:121–122` (`/fonts/archivo-var-latin.woff2`, `/fonts/schibsted-grotesk-var-latin.woff2`) |
| Sikkerhetsheadere 6/6 | Ja, med dato | `historie.ts`, målt 18. nov. 2026 |
| 0 cookies | Ja, med dato | `historie.ts`. Står allerede på siden under «Uten cookie-banner» |
| Ingen database bak nettstedet | Ja | Ingen databaseklient i `package.json` |
| «Cookieløs analyse» | **Ikke funnet** | Se 1.5 |

Forslag hvis seksjonen skal tilbake, som `<dl>`:

- Tittel: **Hva det er bygget av**
- Ingress: «Dette er oppsettet bak siden du leser nå.»

| Navn | Tekst |
|---|---|
| Bygget med | Astro 7. De fleste sidene lages ferdig på forhånd og sendes som vanlig HTML. |
| Drift | Fly.io i Amsterdam, med vår egen server foran. |
| Skrifter | To skriftfamilier, lagret på vår egen server. Ingen kall til Google. |
| Sikkerhetsheadere | 6/6, målt 18. nov. 2026. |
| JavaScript | `[MANGLER: målt størrelse på forsiden, fra revisor]` |

**Anbefaling:** la seksjonen bli ute av `/nettsider`. Leseren er en håndverker, og
`kodekonsulentene-tekst` sier at teknologi hører hjemme i case-detaljene. Stakken står i
nettside-casen i 3.1. Cookies er tatt ut av lista fordi tallet allerede står på siden.

---

## 7. /sikkerhet: to måledatoer (`src/pages/sikkerhet.astro`)

Nå står dette rett under hverandre:
- Rapportarket: «kodekonsulentene.no, Målt 18. nov. 2026» (`historie.ts`).
- SamtykkeSekvens, høyre spor: «målt 6. oktober 2026» (`maalinger.json`, `oss.maalt`).

Det er to ulike målinger, ikke samme måling med to datoer. 18. nov. er nettsidesjekken
(`/api/sjekk`, fire rader). 6. okt. er cookie-skanningen i ekte nettleser, kjørt samme dag som
de 38 sidene. Teksten bør si det.

**Forslag 1, hintet i høyre spor (`SamtykkeSekvens.astro:130`):**
Nå: «målt 6. oktober 2026». Nytt: **«cookie-skanning 6. oktober 2026»**

**Forslag 2, ett notat mellom rapportarket og sekvensen (ny tekst):**

> Rapporten over er nettsidesjekken, kjørt 18. november 2026. Sekvensen under bygger på
> cookie-skanningen i ekte nettleser, kjørt 6. oktober 2026. Derfor to datoer.

**Forslag 3, ingressen (`sikkerhet.astro:105`):**
Nå: «… Her er bruddet vi fant på 79 % av de 38 sidene vi målte, spilt av i sanntid – og den
samme sjekken kjørt på vår egen side.»
Nytt: «… Her er bruddet vi fant på 79 % av de 38 sidene vi målte, vist steg for steg – og det
sjekken fant på vår egen side.»

Begrunnelse for 3: venstre spor er en rekonstruksjon med oppdiktet domene, ikke et opptak i
sanntid. «Den samme sjekken» stemmer ikke når rapportarket og skanningen er to verktøy.
Tallene hentes fortsatt fra `maalinger.json`.

**Varig løsning:** kjør begge målingene på nytt samme dag etter lansering
(`.skudd/maaling-egen.mjs` og `/api/sjekk`). Da er det én dato, og notatet i forslag 2 kan
fjernes. Begge dagens målinger er av siden før den nye drakten.

**Til faktasjekker, ikke rettet:**
- Høyre spor viser «localStorage: 0», «sporere: 0» og «ukjenteTredjeparter: 0». `oss` i
  `maalinger.json` har bare `cookiesForSamtykke: 0`. De tre andre verdiene finner jeg ikke i
  datafila.
- Seksjonen «Verktøyet tok oss selv» sier at skanningen 6. oktober fant to tredjepartskall.
  Høyre spor sier «ingen tredjepart», også datert 6. oktober. Begge kan være sanne hvis
  målingen er tatt etter rettingen samme dag. Det står ikke noe sted.

---

## 8. /verktoy: «Motoren er åpen kildekode» (`src/pages/verktoy/index.astro`, ikke rendret)

Funnet i repoet:

| Hva | Finnes? | Belegg |
|---|---|---|
| Kommandolinjeverktøy | Ja, som kode | `packages/cli/package.json`: pakken `kodekonsulentene` 1.0.0, `bin`, MIT, ingen avhengigheter. Kommandoene er `sjekk <url>` og `epost <domene>` |
| GitHub Action | Ja, som kode | `packages/norsk-lovsjekk-action/action.yml`, «Norsk lovsjekk», MIT. README: `uses: kodekonsulentene/norsk-lovsjekk@v1` |
| Lisens på repoet | MIT | `LICENSE` i rota |
| `bin` i rotas `package.json` | Nei | `"private": true`. CLI-et er en egen pakke |
| Repoet er offentlig | Sagt, ikke kontrollert | `maalinger.json` `_om`, `docs/ai-tekst.md:24`, `.github/workflows/overvaak.yml:8` |
| Pakken ligger på npm | **Ikke kontrollert** | Uten det virker ikke `npx kodekonsulentene` |
| `kodekonsulentene/norsk-lovsjekk` finnes med merket `v1` | **Ikke kontrollert** | Action-en ligger i en undermappe her. `uses:` krever et eget repo med `action.yml` i rota |

En ting holder ikke uansett: **verktøyene kjører ikke motoren hos deg.** Både CLI-et og
Action-en sender adressen til `kodekonsulentene.no/api/sjekk`
(`packages/cli/README.md`, «Hvorfor den kaller et API»). Overskriften «Motoren er åpen
kildekode» sammen med en `npx`-kommando får leseren til å tro noe annet.

**Forslag når eier har bekreftet npm og GitHub:**

- H2: **Samme sjekk fra kommandolinjen**
- Ingress: «Har du en utvikler, kan sjekken kjøres fra terminalen og i GitHub Actions. Begge
  spør den samme tjenesten som denne siden, så svaret er likt.»
- Kode 1: `npx kodekonsulentene sjekk dinbedrift.no`
- Kode 2: `- uses: kodekonsulentene/norsk-lovsjekk@v1` med `url: https://dinbedrift.no`
- Notat: «Koden er åpen under MIT-lisens. Verktøyene sender adressen til kodekonsulentene.no
  og kjører ikke analysen på din maskin. Adressen lagres ikke.»
- Lenke: `[MANGLER: adresse til det offentlige repoet]`

**Hvis bare repoet er offentlig (npm eller Action mangler):** én setning med lenke, uten
kommandoer: «Koden bak sjekken ligger åpent på GitHub under MIT-lisens.»

**Hvis ingenting er bekreftet:** seksjonen blir ute, som i dag.

«Adressen lagres ikke» stemmer med `/personvern` («Adressen og rapporten lagres ikke»).

---

## Fjernet fordi det sto flere ganger

- `/om`: «Fire målinger av denne siden» er ikke brukt som overskrift. Den står på platen.
- `/nettsider`, «Hva det er bygget av»: raden om cookies er ute. Tallet står under «Uten
  cookie-banner».
- `/om`: andre setning i ingressen er flyttet, ikke doblet.
- `/terminal`: «står i overvåkningsmodus» er ute av notatet. Utsnittet viser `p=none`.

---

## Resultat

Åtte punkter har forslag med nåværende tekst, ny tekst og begrunnelse. Ingen sidefil er
endret. Punkt 1, 4, 5 og 8 kan ikke lukkes uten eier. Viktigste funn: forsiden lagrer
`wow-inngang` i øktlageret, så «ingenting lagres» er ikke sant ennå.

## Filer endret

- Ny: `docs/design/tekst/r8-rettelser.md`

## Kilder

Ingen eksterne. Internt, lest 24. nov. 2026: `CLAUDE.md`; `docs/design/redesign-brief.md` del
2–6; `docs/design/rapporter/wow-r8-{B1,B2,B3,B4,grunnmur}.md`; `docs/design/wow-undersider.md`
(linje 308, 509, 672); `docs/design/kartlegging.md` del 1; `src/data/{firma,historie,caser}.ts`;
`src/data/maalinger.json`; `package.json`; `packages/cli/`; `packages/norsk-lovsjekk-action/`;
`LICENSE`; `public/terminal.js`; `src/layouts/MalWow.astro`; `src/components/wow/Intro.astro`;
`src/components/wow/les/Hukommelse.astro`; `src/components/wow/tjeneste/SamtykkeSekvens.astro`;
`src/components/wow/seksjoner/Sporsmal.astro`; sidene nevnt under hvert punkt.

## Åpne spørsmål og antakelser

1. Variant A eller B i punkt 1. Antakelse i A: `wow-inngang` fjernes, og `/lab/lek` slutter å
   skrive `kk-prisvalg`.
2. Hva teller besøk på siden? (1.5)
3. Skal terminalen på `/terminal` kunne skrives i? (4)
4. «2 min» eller «Fra telefonen»? (5)
5. Ligger `kodekonsulentene` på npm, finnes `kodekonsulentene/norsk-lovsjekk@v1`, og er
   repoet offentlig? (8)
6. Ikke kontrollert: `git`-historikk, npm, GitHub og dagens DNS. Jeg har verken skall eller
   nett.
7. Utenfor de åtte punktene, sett underveis: meta description på `/caser` lover «Egne
   iOS-apper», men app-casene er skjult. `/nettsider` sier «Vi viser tallet for vår egen side
   i footeren». Jeg har ikke kontrollert at den nye bunnen gjør det.

## Neste steg

1. Dirigenten: legg spørsmål 1–5 fram for eier. Bekreft punkt 5 med `git log -S`.
2. `bevegelse`: vurder åpningen uten `sessionStorage` (variant A).
3. `bygger`: når eier har svart, før inn punkt 1–5 og 7. Ta `sessionStorage` med i
   Hukommelse uansett variant, så en lekkasje vises.
4. `faktasjekker`: de to funnene nederst i punkt 7, og 1.5.
5. `revisor`: mål JavaScript på forsiden (punkt 6), og kjør begge egenmålingene på nytt etter
   lansering (punkt 3.1 og 7).
