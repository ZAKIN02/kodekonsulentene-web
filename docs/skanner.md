# Skannertjenesten

Cookie-sjekken og UU-sjekken trenger noe den vanlige nettsidesjekken ikke har:
en **ekte nettleser**. `/sjekk` leser bare HTML-en slik den kommer fra serveren,
og det holder for sikkerhetsheadere og org.nr. Men hva som settes av cookies, og
hva axe-core finner, avgjøres først når JavaScript har kjørt.

Derfor finnes `services/skanner` – en egen Fly-app med Playwright og Chromium.

## Hvorfor en egen app

Chromium bruker flere hundre megabyte per skanning. Nettsiden kjører på en maskin
med 512 MB og én alltid våken instans, fordi ingen besøkende skal betale
oppstartstiden. Legger vi skanningen der, kan én tung skanning ta ned forsiden.

Skanneren står derfor alene, med 1 GB minne og null våkne maskiner. Den sover til
noen bruker et verktøy, og våkner på første forespørsel. De sekundene koster
ingenting i et verktøy som uansett bruker 15–30 sekunder på en skanning.

## Sikkerhet

Tjenesten er **ikke åpen for verden**. Alt utenom `/helse` krever den delte
hemmeligheten i headeren `x-skanner-nokkel`. Er `SKANNER_NOKKEL` ikke satt,
svarer tjenesten 503 på alt – den skal ikke kunne stå åpen ved et uhell.

Nøkkelen sammenlignes tidskonstant, så den ikke kan gjettes byte for byte.

### SSRF – den viktigste detaljen

Skanneren åpner en nettleser mot en adresse en fremmed har skrevet inn. Uten vern
kan den lures til å hente `http://169.254.169.254/`, som på de fleste skyer er
metadata-endepunktet med tilgangsnøkler.

Vernet står på **forespørselsnivå**, ikke bare på adressen brukeren skrev. Hver
eneste forespørsel nettleseren gjør – også etter omdirigeringer, og også for
bilder og skript – går gjennom `erTillattVert()` og avbrytes hvis verten er
intern. Offentlige nettsider henter aldri fra `10.0.0.0/8`.

> **⚠ Hold i synk:** `services/skanner/ssrf.mjs` er en kopi av logikken i
> `src/lib/sjekk.ts`. Tjenesten er en egen app med egen `package.json` og kan
> ikke importere fra Astro-appen. Endrer du reglene ett sted, må du endre dem
> begge. `test/skanner.test.ts` kjører begge implementasjonene mot de samme
> vertene og blir rød hvis de spriker.

## Endepunkter

| Metode | Sti | Hva den gjør |
|---|---|---|
| `GET` | `/helse` | 200 uten nøkkel. Brukes av Flys helsesjekk. |
| `POST` | `/cookie` | Laster siden med tom profil, klikker aldri, rapporterer cookies, lagring, tredjepartskall – og `samtykke`, med dom, grunnlag og hva som ikke kunne avgjøres. |
| `POST` | `/uu` | Kjører axe-core mot WCAG 2.0 A og AA. |

Begge tar `{ "url": "dinbedrift.no" }` og krever `x-skanner-nokkel`.

Én skanning om gangen per maskin. Kommer det en til mens den første kjører, får
den `503` med `Retry-After` – et ærlig «opptatt» i stedet for to halve rapporter
og en maskin som dør av minnemangel.

## Oppsett første gang

```bash
# 1. Opprett appen
fly apps create kodekonsulentene-skanner --org personal

# 2. Lag en hemmelighet og sett den begge steder
NOKKEL=$(openssl rand -hex 32)
fly secrets set SKANNER_NOKKEL="$NOKKEL" -a kodekonsulentene-skanner
fly secrets set SKANNER_NOKKEL="$NOKKEL" SKANNER_URL="https://kodekonsulentene-skanner.fly.dev" -a kodekonsulentene

# 3. Deploy skanneren
fly deploy services/skanner

# 4. Sjekk at den lever
curl -s https://kodekonsulentene-skanner.fly.dev/helse

# 5. Deploy nettsiden på nytt, så den får SKANNER_URL
fly deploy
```

Hemmeligheten skal **aldri** i `services/skanner/fly.toml` eller i repoet.

## Lokal kjøring

```bash
cd services/skanner
npm install
npx playwright install chromium     # bare lokalt – Docker-bildet har den ferdig
SKANNER_NOKKEL=lokal-nokkel npm start
```

Og i rotmappa, i `.env`:

```
SKANNER_URL=http://127.0.0.1:8080
SKANNER_NOKKEL=lokal-nokkel
```

Test direkte:

```bash
curl -s -X POST http://127.0.0.1:8080/cookie \
  -H 'content-type: application/json' \
  -H 'x-skanner-nokkel: lokal-nokkel' \
  -d '{"url":"https://www.vg.no"}' | python3 -m json.tool
```

## Når skanneren er nede

Klienten i `src/lib/skanner.ts` returnerer `null` – aldri et kast, og aldri en
tom rapport som ser ut som et rent resultat. Verktøysiden sier da at skanningen
ikke kunne kjøres, og legger til at **det ikke er det samme som at siden er i
orden**. Det er regelen fra brandboken: vi påstår aldri mer enn vi har målt.

Nettsiden skal aldri gi 500 fordi skanneren sover.

## Versjonen som må følges

`services/skanner/Dockerfile` bruker `mcr.microsoft.com/playwright:v1.63.0-noble`.
Tallet **må** stemme med `playwright`-versjonen i `services/skanner/package.json`.
Spriker de, laster Playwright ned en nettleser som ikke finnes i bildet, og
tjenesten feiler først ved første skanning – ikke ved oppstart.

Oppgraderer du Playwright, oppgrader begge i samme commit.

## Samtykkedeteksjon

`services/skanner/samtykke.mjs` er filen som gjør at skanneren ikke anklager
uskyldige. Den ble skrevet 7. oktober 2026, etter at vi målte at den ikke fantes.

### Feilen som ble rettet

Fram til da meldte både `/sjekk` og cookie-sjekken brudd på ekomloven § 3-15 så
snart et sporingsdomene var kontaktet. `analyserCookies()` i `src/lib/sjekk.ts`
skrev ordrett «Det bryter ekomloven § 3-15» hvis `googletagmanager.com` sto i
markupen, og `cookieStatus()` i `src/lib/skanner.ts` ga `fail` hvis skanneren
hadde sett et sporingsdomene i nettverkstrafikken.

Ingen av dem kjente Google Consent Mode. Ingen av dem kjente en eneste CMP. Søk
på `consent`, `cookiebot` eller `cmp` i begge filene ga null treff.

**Hva vi målte før vi rettet** (7. oktober 2026, egen måling, rådata utenfor
repoet):

| Måling | n | Resultat |
|---|---|---|
| Nettleserskanning + rå HTML av samme side | 24 | — |
| Verifisert `gtag('consent','default', …)`-kall i nettleseren | 16 | **3** viste kallet i servergjengitt HTML. **13 gjorde det ikke.** |
| Gjenkjennelig samtykkeløsning i nettleseren | 20 | **9** viste løsningens skriptvert i HTML-en. **11 gjorde det ikke.** |
| Sider med `Set-Cookie` på første svar | 15 av 38 | **0** sendte en cookie vi kan dokumentere som sporing |
| Gamle logikken: `fail` på sider med samtykkehåndtering | 4 av 20 | alle fire gjorde det riktig eller delvis riktig |
| Nye logikken, samme sider | 0 av 38 | ingen `fail` på en side med samtykkehåndtering |

Tre av nettstedene lastet Google Tag Manager, satte **null** sporingscookies, og
hadde `ad_storage` og `analytics_storage` på `denied` som standard. De fikk
«bryter ekomloven § 3-15» av vårt eget gratisverktøy.

### Hva loven faktisk sier

Riktig lov er **LOV-2024-12-13-76** (ekomloven 2024), i kraft 1. januar 2025.
Ikke LOV-2024-06-21-41 – det er finanstilsynsloven.

§ 3-15 første ledd forbyr å «lagre eller å skaffe seg tilgang til opplysninger i
sluttbrukers eller brukers **kommunikasjonsutstyr**» uten informasjon og
samtykke, og krever at samtykket oppfyller personvernforordningen.

Merk ordet: **kommunikasjonsutstyr**. «Terminalutstyr» er EU-direktivets og EDPBs
begrep, ikke den norske lovtekstens. Vi hadde «terminalutstyr» i et tidlig utkast
av koden.

Tre konsekvenser for skanneren:

1. **Paragrafen gjelder lagring og tilgang, ikke nedlasting.** At nettleseren
   hentet `gtm.js` er en HTTP-forespørsel, ikke lagring. Derfor er «sporingsvert
   kontaktet» nedgradert fra bevis til indisium.
2. **Den er teknologinøytral.** Nkoms egen cookie-erklæring fører `localStorage`
   og `sessionStorage` under § 3-15. Vi klassifiserer lagringsnøkler på samme måte
   som cookies.
3. **Ingen norsk myndighet har publisert en liste over hva som er «strengt
   nødvendig».** Datatilsynet gjengir lovens to unntak og viser videre til Nkom;
   Nkom gir ingen liste. Klassifiseringen vår bygger på leverandørenes egen
   dokumentasjon og på WP29 Opinion 04/2012 (WP194). Den er vår tekniske lesning,
   ikke en myndighetsgodkjent liste, og rapporten sier det.

Håndhevingen er delt (FOR-2024-12-20-3413 punkt 12): Nkom avgjør om løsningen er
omfattet og om unntakene gjelder, Datatilsynet vurderer samtykket – og kan først
fatte vedtak etter at Nkoms avgjørelse foreligger. Selv tilsynene konkluderer i to
trinn. Et skanneverktøy har ingen grunn til å gjøre det i ett.

### Den viktigste falske positiven

Google Consent Mode har to moduser. I **basic** blokkeres taggene til brukeren har
svart, og ingen forespørsel går til Google. I **advanced** lastes taggene med
standard `denied`, og Google mottar cookieløse pings *før* samtykke.

Et korrekt oppsett i advanced mode ser derfor ut som sporing for en skanner som
teller forespørsler. Regelen er: **nettverkskall til Google uten at `_ga` settes,
og med standardtilstand `denied`, er riktig implementasjon – ikke et brudd.**

### Signalene vi leser

| Signal | Hvor | Styrke |
|---|---|---|
| `window.google_tag_data.ics` | nettleser | sterkt, men **udokumentert av Google** |
| `gtag('consent','default', …)` i `dataLayer` | nettleser | sterkt |
| CMP-ens egen `window`-global | nettleser | sterkt |
| CMP-ens skriptvert | nettleser og HTML | sterkt |
| `__tcfapi` / `__gpp` / `__tcfapiLocator`-iframe | nettleser | sterkt |
| CMP-ens egen cookie eller lagringsnøkkel | nettleser | svakere |
| `consent`/`denied` som tekst i markup | HTML | svakest |

> **⚠ `google_tag_data.ics` er ikke dokumentert av Google.** Objektet finnes, vi
> har verifisert formen på 36 norske nettsteder, men det er internt og uten
> API-garanti. Den dokumenterte veien er `gcs`- og `gcd`-parameterne på utgående
> forespørsler. Derfor returnerer `tolkConsentMode()` **`null`** og ikke `false`
> når signalet mangler: forsvinner `ics` i en GTM-oppdatering, blir alle dommer
> «vet ikke». Det er den trygge retningen å svikte i.

Vi søker **aldri** på ord. `datatilsynet.no` skriver om samtykke og fikk treff på
ordet «samtykke» i en tidlig utgave av deteksjonen. Bare vertsnavn, globaler og
cookienavn teller.

`window.CookieConsent` deles av Cookiebot, Cookie Information og den åpne
`vanilla-cookieconsent`. Den navngir derfor **ingen** leverandør – den gir treff på
«en samtykkeløsning, leverandør ikke identifisert». Et norsk nettsted ble meldt som
«Cookiebot» i et tidlig utkast, og brukte noe helt annet.

### Graderingen

Tre klasser per cookie: `teknisk`, `samtykkelager`, `krever-samtykke` – og
`ukjent`, som er et gyldig svar. I tillegg har hver klassifisering en **sikkerhet**:

- `dokumentert` – `kilde` peker på leverandørens egen beskrivelse av formålet
- `antatt` – vi kjenner navnet igjen fra egen måling, men har ikke leverandørens ord

**Sikkerheten er den eneste porten inn til `fail`.** Er alt vi har vår egen
gjenkjenning av et prefiks, blir dommen `warn` og teksten sier at klassifiseringen
er vår lesning. Det er grunnen til at et norsk nettsted med bare `ai_user` og
`ai_session` (Application Insights, ingen leverandørdokumentasjon funnet) får
«bør ses på» og ikke «brudd».

Dommen i `vurderSamtykke()`:

| Situasjon | Dom |
|---|---|
| Dokumentert sporingscookie lagret, ingen samtykkeløsning | `fail` |
| Antatt sporingscookie lagret, ingen samtykkeløsning | `warn` |
| Sporingscookie lagret **tross** samtykkeløsning | `warn` – et menneske må se på det |
| Sporing lastet, Consent Mode `denied`, ingenting lagret | `ok` |
| Sporing lastet, Consent Mode med en samtykkekategori `granted` | `warn` |
| Sporing lastet, ingen samtykkeløsning funnet, ingenting lagret | `neutral` – kan ikke avgjøres maskinelt |
| Bare tekniske cookies eller samtykkeløsningens egen | `warn` med navn, aldri brudd |
| Ingenting | `ok` |

Bare de fire annonse- og analysekategoriene i Consent Mode v2 teller mot dommen
(`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`).
`functionality_storage`, `personalization_storage` og `security_storage` er holdt
utenfor: de dekker brukerens egne valg og sikkerhetstilstand, settes rutinemessig
til `granted` i helt normale oppsett, og tok vi dem med, ville et korrekt oppsett
blitt nedgradert for noe som ikke er sporing. Vi så det skje i utprøvingen.

### `/sjekk` kan ikke dømme, og skal ikke prøve

`/sjekk` henter HTML med `fetch` og kjører ikke JavaScript. Målingen over viser hva
det koster: 13 av 16 samtykkeoppsett er usynlige der.

**Cookie-raden på `/sjekk` kan derfor ikke gi `fail`.** Mulige utfall er `ok`
(ingenting funnet), `warn` (sporing uten spor av samtykke, eller cookies satt ved
første besøk) og `neutral` (sporing *og* samtykkehåndtering funnet – kan ikke
avgjøres maskinelt). Testen `HTML-veien kan aldri gi fail` i
`test/samtykke.test.ts` holder det fast.

Ordene «bryter», «ulovlig» og «lovbrudd» forekommer ikke i noen dom, fra noen vei,
med noen inndata. Det er en egen test.

### Ingen norsk samtykkeløsning finnes

Vi gikk gjennom IABs offisielle CMP-register (271 leverandører per 7. oktober
2026) og fant ingen norsk. De nordiske er danske (Cookie Information,
Cookiebot/Cybot, Conzent), finske (Gravito, Alma Media) og svenske (Webbhuset).
Det som markedsføres som «norsk» er internasjonale produkter med norsk språkdrakt,
eller norske byråer som installerer andres løsning. Lista har derfor ingen «norsk»
bolk – det ville vært å dikte opp en kategori.

I vår egen måling var **Cookie Information** den klart mest brukte (10 av 36
norske nettsteder) – flere enn Cookiebot og OneTrust til sammen.

> **⚠ Hold i synk:** `src/lib/sjekk.ts` har en **forkortet** kopi av
> samtykkevertene og en kort liste over tekniske cookienavn, fordi `services/`
> står i `.dockerignore` og Astro-appen ikke kan importere derfra. Samme situasjon
> som `ssrf.mjs`. `test/samtykke.test.ts` kjører begge mot de samme vertene og
> navnene, og ble rød første gang de spriket – `klaro.org` sto i HTML-veien etter
> at skanneren var rettet til `cdn.kiprotect.com`.

### Hva maskinen fortsatt ikke kan avgjøre

Dette står i hver rapport, og skal stå der:

- Om en konkret cookie er **strengt nødvendig**. Det er en juridisk vurdering.
- Hva som skjer **etter** et klikk i banneret. Vi klikker aldri.
- Om «nekt» er like lett som «godta», om knappene er likeverdige, om samtykket kan
  trekkes tilbake. Datatilsynet har ordrette krav til alt dette – og ingen av dem
  kan måles ved å laste forsiden én gang.
- Om informasjonskravet i § 3-15 første ledd er oppfylt (hvilke opplysninger,
  formål, hvem som behandler).
- Om et skript som ikke lagret noe i det øyeblikket vi så, gjør det senere.
- Om en ukjent førstepartscookie er drift eller sporing. Den blir `ukjent`.

## Juridiske grenser i rapportene

Begge verktøyene sier det samme på hver eneste kjøring, og det er med vilje:

- **Cookie-sjekken** rapporterer en teknisk observasjon, ikke en juridisk
  vurdering. Ekomloven § 3-15 unntar lagring som er *strengt nødvendig* for
  tjenesten, og hva som er strengt nødvendig kan ingen maskin avgjøre. Verktøyet
  sier hva som ble lagret – ikke om noe er lovlig.
- **UU-sjekken** dekker bare en del av de 35 kravene i WCAG 2.0 A og AA.
  Tastaturflyt, skjermleserrekkefølge, om alt-teksten faktisk beskriver bildet,
  teksting av video og forståelig språk må testes av mennesker. En grønn rapport
  er ikke et bevis på at kravene er oppfylt, og rapporten sier det.

Ingen av sidene skal noen gang love at en bestått sjekk betyr at man er lovlig.

## Sporerlisten

`services/skanner/sporere.mjs` er data, ikke en regex gjemt i koden. Hver
oppføring har kilde og dato, fordi listen råtner: domener byttes ut, tjenester
legges ned, nye dukker opp.

Gjenkjenningen treffer bare på eksakt domene eller ekte underdomene – aldri på
delstreng. `notgoogle-analytics.com` skal ikke gi treff. Å melde noen for sporing
de ikke driver med er en påstand om lovbrudd, og den skal være riktig.

Legger du til en sporer, legg til en test i `test/skanner.test.ts` samtidig.

Samme regel gjelder `SAMTYKKELOSNINGER` og `COOKIE_KLASSER` i `samtykke.mjs`:
hver oppføring har `kilde` og `sjekket`, mønstrene er ankret mot hele cookienavnet
(`^…$`), og `test/samtykke.test.ts` håndhever begge kravene. Legger du til en
samtykkeløsning, må globalen også inn i `GLOBALER_SOM_LESES` – ellers blir halve
endringen usynlig i produksjon, og den testen er rød til du gjør det.

Å klassifisere en cookie som `krever-samtykke` er en påstand om at noe krever
samtykke. Finner du ikke leverandørens egen beskrivelse av formålet, skriv
«Egen måling» i `kilde`. Da blir klassifiseringen `antatt`, dommen kan ikke bli
`fail`, og rapporten sier at det er vår lesning. Det er meningen.
