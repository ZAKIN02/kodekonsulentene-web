# AI-omskriveren på /apper-og-ai

Lim inn teksten fra din egen forside, trykk «Skriv den om», og se et forslag bli
skrevet linje for linje – med en liste over hva som ble endret og hvorfor.

Det er den samme ideen som `/sjekk`: et verktøy som kjører på ekte, med en gang,
uten innlogging. Forskjellen på å påstå at vi lager AI-apper og å vise det.

| Hva | Hvor |
|---|---|
| Grensesnittet | `src/components/AiTekst.astro` |
| Endepunktet | `src/pages/api/ai-tekst.ts` |
| Ren logikk (testbar, uten nettverk) | `src/lib/ai-tekst.ts` |
| Tester | `test/ai-tekst.test.ts` |
| Personvern | `/personvern`, seksjonen «Hva skjer med teksten du limer inn i AI-demoen» |

## Dette må settes før den virker

```bash
fly secrets set ANTHROPIC_API_KEY=sk-ant-... -a kodekonsulentene
```

Nøkkelen hentes på <https://console.anthropic.com> → API keys. Den skal **aldri**
inn i repoet; repoet er offentlig på GitHub. Lokalt legges den i `.env`, som står
i `.gitignore`. `test/ai-tekst.test.ts` har en test som blir rød hvis noen limer
en nøkkel inn i en av filene over.

Uten nøkkelen er funksjonen ikke ødelagt: den svarer med at den ikke er skrudd
på, og sender ingenting noe sted. Det er med vilje – en demo som later som den
har svart er verre enn en demo som sier at den ikke er klar.

Valgfrie, alle med fornuftige standardverdier:

```bash
fly secrets set CLAUDE_MODELL=claude-haiku-4-5 -a kodekonsulentene   # standard
fly secrets set AI_PER_IP=3 AI_IP_DOGN=8 AI_DOGNTAK=50 -a kodekonsulentene
```

## Hva det koster

Modellen er `claude-haiku-4-5`: **1 USD per million tokens inn, 5 USD per million
tokens ut** (listepris, Anthropic API, oktober 2026).

Verste tilfelle for **ett** kall, der noen fyller feltet helt opp:

| | Tokens | Pris |
|---|---|---|
| Systemprompt | ~ 700 | |
| Innlimt tekst (6 000 tegn, taket) | ~ 2 000 | |
| **Inn, til sammen** | **~ 2 700** | ~ 0,0027 USD |
| Ut (taket er `max_tokens: 1000`) | 1 000 | ~ 0,0050 USD |
| **Per kall** | | **~ 0,008 USD ≈ 0,09 NOK** |

Et typisk kall ligger godt under halvparten av dette, fordi svaret er ti korte
linjer og de færreste limer inn 6 000 tegn.

**Taket for hele tjenesten er `AI_DOGNTAK`, som står på 50 kall i døgnet.**
Verste tilfelle er altså **~ 0,40 USD per døgn, ~ 12 USD i måneden** – rundt
130 kroner, hvis noen klarer å fylle taket hver eneste dag med maksimal tekst.
Skru ned `AI_DOGNTAK` for å senke beløpet; det er den ene knappen som avgjør
hvor dyrt dette kan bli.

## Kvoten

Tre lag, i `lagKvote` i `src/lib/ai-tekst.ts`:

1. **3 kall per IP per 10 minutter** – stopper den som sitter og klikker.
2. **8 kall per IP per døgn** – stopper den som kommer tilbake hele dagen.
3. **50 kall totalt per døgn** – beløpsgrensen. Denne kan ikke omgås med nye
   IP-adresser, og det er grunnen til at den finnes.

IP-adressen leses av `finnIp`: `fly-client-ip` først, som Fly-proxyen setter og
klienten ikke kan røre. Finnes den ikke, leses `x-forwarded-for` **bakfra**, der
proxyen skriver – leste vi forfra, kunne hvem som helst sende sin egen header og
få ny kvote per forespørsel.

### Det kvoten ikke dekker, sagt rett ut

Telleren ligger **i minnet til prosessen**. `fly.toml` kjører én maskin
(`min_machines_running = 1`, og `auto_stop_machines = "suspend"` beholder
prosessen), så i praksis er det én teller. Skaleres appen til to maskiner, får
hver sin, og det globale døgntaket blir i verste fall det dobbelte. Telleren
nullstilles også når maskinen starter på nytt – etter en deploy er døgnet
nullstilt.

Det retter seg med et delt lager (Redis, eller Flys eget volum), ikke med en
kommentar som later som problemet ikke finnes. Så lenge taket er 50 kall og
beløpet er tosifret i kroner, er ikke det verdt kompleksiteten.

## Valgene, og hvorfor

**Hvorfor Haiku 4.5 og ikke Sonnet 5.5.** Sonnet skriver bedre norsk. Men Sonnet
5.5 har adaptiv tenking på som standard, og da kommer det *ingenting* på skjermen
før tenkingen er ferdig. Hele poenget med denne funksjonen er at svaret strømmer –
det er beviset for den som ser på at noe faktisk arbeider. Haiku begynner å skrive
med en gang, koster en femdel, og oppgaven er smal nok: ti korte linjer etter et
stramt format.

Vil du bytte: sett `CLAUDE_MODELL=claude-sonnet-5-5` **og** legg til
`thinking: { type: "between_tools" }` i begge kallene i `src/pages/api/ai-tekst.ts`.
Det er ikke gjort, og det er ikke verifisert mot en ekte nøkkel – ikke deploy det
uten å prøve det først.

**Hvorfor ikke GET.** `/api/sjekk` har en GET-variant for curl og feilsøking.
Denne har ikke. Et GET-endepunkt som koster penger per kall kan utløses av enhver
forhåndshenter, lenkeskanner eller prefetch, og nettstedet kjører
`prefetch: { prefetchAll: true }`. POST er det eneste inngangspunktet.

**Hvorfor svaret aldri settes inn som HTML.** Det som går inn i modellen er tekst
en ukjent besøkende limte inn. Det som kommer ut er derfor ikke mer til å stole på
enn det som gikk inn. Hvert felt skrives med `textContent`, og no-JS-siden escaper
alt. Systemprompten sier i tillegg eksplisitt at innholdet mellom `<tekst>` er
data, ikke instruksjoner – det er to lag, ikke ett.

**Hvorfor /apper-og-ai fortsatt er statisk.** Skjemaet kunne postet til siden selv
hvis siden var serverrendret. Da ville hele markedssiden falt ut av den statiske
leveringen, ut av gjennomgangen i `test/bygget-html.test.ts`, og inn i en
langsommere vei for alle som bare leser den. No-JS-svaret er i stedet en komplett
HTML-side fra `/api/ai-tekst`, stylet med de ekte tokenene fra
`src/styles/tokens.css` (lest inn med `?raw`, ikke skrevet av).

## Degradering og tilgjengelighet

- **Uten JavaScript:** `<form method="post" action="/api/ai-tekst">` sender som
  et vanlig skjema og får en hel side tilbake. Verifisert med curl.
- **`prefers-reduced-motion`:** markøren slutter å blinke. Målt i headless
  Chrome: `animation-name` blir `none`. Teksten som kommer inn er ikke en
  animasjon – det er innhold som ankommer, og det står.
- **Skjermleser:** resultatflaten har `aria-live="off"` med vilje. En polite
  live-region som får ny tekst på hvert token leser hele forslaget om igjen for
  hver bit. I stedet kommer én melding i en `role="status"` når svaret er ferdig.
- **CSP:** ingen brudd. Kallet går til `'self'` (`connect-src 'self'`), og
  komponentens skript hoistes av Astro til en fil under `/_astro/`. Verifisert i
  headless Chrome med null CSP-meldinger i konsollen.
- **Cookies:** null. Verifisert ved å telle cookies i nettleserkonteksten etter
  en full kjøring.

## Verifisert slik

Det finnes ingen Claude-nøkkel på maskinen, så hele veien er kjørt mot en falsk
Anthropic-server som svarer i samme SSE-format. Det dekker alt unntatt kvaliteten
på selve modellsvaret.

**Dette er ikke prøvd mot det ekte API-et.** Før det settes i drift bør én kjøring
med en ekte nøkkel bekrefte at `claude-haiku-4-5` godtar forespørselen slik den er
formet, og at svaret kommer i det formatet `tolkSvar` forventer.
