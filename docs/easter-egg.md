# Skjulte detaljer

Epic.net har et 404-videospill og «Rabbit»-stier i footeren. Det som gjør slike
sider minneverdige er ikke bevegelse, men at de **svarer på deg** – og at det
finnes noe å finne for den som leter. Dette dokumentet er fasiten, slik at
detaljene ikke blir borte ved neste omskriving.

Alt under er progressiv forbedring: siden fungerer uten noe av det, og
ingenting kjører før en bruker utløser det.

## 1. Terminalmodus

**Åpnes med `~` (eller `¨` på norsk tastatur) eller Ctrl/Cmd + K**, hvor som
helst på siden. Modal med `role="dialog"`, `aria-modal`, Esc lukker og fokus går
tilbake dit det var.

Filen er `public/terminal.js`. Den lastes `defer` og bygger ingenting før første
tastetrykk.

### Kommandoer

| Kommando | Gjør |
|---|---|
| `help` | Lister alle synlige kommandoer. Alias: `hjelp`, `?` |
| `ls` | Lister sidene. Alias: `dir` |
| `cat <side>` | Henter siden og skriver ut tittel og de tre første avsnittene |
| `open <side>` | Navigerer dit. Alias: `cd` |
| `sjekk <url>` | **Kjører den ekte nettsidesjekken** mot `/api/sjekk` og skriver radene ut i terminalen. Navigerer ikke bort |
| `headere <url>` | Bare sikkerhetsheader-raden, med forklaringen |
| `dmarc <domene>` | Kjører `/api/dmarc` – SPF, DKIM og DMARC |
| `pris` | Henter prisene fra `/priser` og lister dem. Alias: `priser` |
| `kontakt` | Går til kontaktsiden. Alias: `book` |
| `tema` | Bytter mørkt og lyst, husker valget |
| `whoami` | Kort om hvem du snakker med |
| `clear` | Tømmer skjermen |
| `exit` | Lukker modalen. Alias: `q` |

**Tab** fullfører kommandonavn (ett treff fyller ut, flere treff listes).
**Piltastene** blar i historikken.

### Viktig om `pris`

Prisene leses fra `/priser` ved å parse `.kk-price`-kortene – de er **ikke**
skrevet inn i `terminal.js`. Det er med vilje: ett sted å endre pris, nemlig
`src/data/priser.ts`. Endrer noen markupen i `PriceCard.astro`, slutter `pris` å
virke og faller tilbake på «open priser». Da er det parsingen som må rettes, ikke
tallene som skal kopieres inn.

### Viktig om oppsummeringen

Rapportene sier «Ingen brudd, men N ikke sjekket» når noe har status `neutral`.
Den må aldri si «Alt bestått» når noe ikke er målt. Hele grunnen til at verktøyet
er verdt noe, er at det ikke påstår mer enn det har sjekket.

## 2. 404-siden er en terminal

`src/pages/404.astro`. I stedet for en blindvei med en lenkeliste er selve siden
en terminal du kan skrive i – samme motor, montert innfelt i stedet for i en
modal. Du kan kjøre `sjekk dinbedrift.no` rett fra en 404-side.

Teknisk: `terminal.js` ser etter `[data-kkterm-innfelt]`. Finnes den, monteres
økten der og `exit` svarer «denne terminalen er siden» i stedet for å lukke noe.

**Uten JavaScript** står feilmeldingen ferdig skrevet i HTML-en og inputfeltet er
`disabled`, slik at ingen får et felt som ikke svarer. Lenkelisten ved siden av
gjør jobben. Skriptet bytter ut plassholderlinjen med den ekte stien når det
kjører – ellers ville den samme feilen stått to ganger.

## 3. Tastesekvensen

`↑ ↑ ↓ ↓ ← → ← → b a` hvor som helst på siden åpner terminalen og låser opp
kommandoen `nordlys`. Den står ikke i `help` før den er funnet, og den svarer
«ukjent kommando» til den er låst opp.

Sekvensen telles **ikke** mens fokus står i et skjemafelt. Piltaster og bokstaver
hører hjemme i feltet, ikke i en snarvei som åpner en modal over det du holder på
med.

`nordlys` er den eneste rene pynten på hele siden. Den ligger bak en sekvens
nettopp derfor – brandboken tillater teknisk humor i terminalen og ingen andre
steder.

## Grenser

- `public/terminal.js` skal holde seg under 8 kB gzip. Den er nå rundt 5,9 kB.
- Ingen nye inline-skript. CSP har streng `script-src` uten `unsafe-inline`, og
  hashene regnes ut fra bygget ved serveroppstart i `sikkerhet.mjs`. Alt nytt må
  ligge i en egen fil under `public/`.
- Terminalen er tastaturdrevet. Hintet nede til høyre vises bare der peker ikke
  er grov, og aldri på 404-siden – der sier siden det selv.
