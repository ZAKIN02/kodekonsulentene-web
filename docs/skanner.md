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
| `POST` | `/cookie` | Laster siden med tom profil, klikker aldri, rapporterer cookies, lagring og tredjepartskall. |
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
fly deploy -c fly.skanner.toml

# 4. Sjekk at den lever
curl -s https://kodekonsulentene-skanner.fly.dev/helse

# 5. Deploy nettsiden på nytt, så den får SKANNER_URL
fly deploy
```

Hemmeligheten skal **aldri** i `fly.skanner.toml` eller i repoet.

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

## Juridiske grenser i rapportene

Begge verktøyene sier det samme på hver eneste kjøring, og det er med vilje:

- **Cookie-sjekken** rapporterer en teknisk observasjon, ikke en juridisk
  vurdering. Ekomloven § 3-15 unntar informasjonskapsler som er *strengt
  nødvendige* for tjenesten, og hva som er strengt nødvendig kan ingen maskin
  avgjøre. Verktøyet sier hva som ble satt – ikke om noen er lovlig.
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
