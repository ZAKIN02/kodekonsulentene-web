# Domene og drift

Nettsiden kjører på **Fly.io** i Amsterdam (`ams`). Domenet **kodekonsulentene.no**
ligger hos **GoDaddy**.

## Oversikt

| | |
|---|---|
| App | `kodekonsulentene` |
| Region | `ams` (Amsterdam – nærmeste Fly-region til norske besøkende) |
| Container | `Dockerfile`, Node 22 Alpine, kjører som `node`-bruker |
| Server | `server.mjs` – statiske filer + Astro-handler, headere på alt |
| Helsesjekk | `GET /status` |
| Domeneregistrar | GoDaddy |

## Deploy

```bash
fly deploy                      # bygger Dockerfile og ruller ut
fly logs -a kodekonsulentene
fly status -a kodekonsulentene
fly ssh console -a kodekonsulentene
```

Første gang:

```bash
fly launch --no-deploy --name kodekonsulentene --region ams
fly deploy
```

## Hemmeligheter

Settes som Fly-secrets, aldri i `fly.toml` og aldri i Git:

```bash
fly secrets set PAGESPEED_API_KEY=... -a kodekonsulentene
fly secrets set RESEND_API_KEY=... -a kodekonsulentene
fly secrets set RAPPORT_FRA=rapport@kodekonsulentene.no -a kodekonsulentene
fly secrets set RAPPORT_KOPI=din@epost.no -a kodekonsulentene
fly secrets list -a kodekonsulentene
```

`.env.example` viser hvilke nøkler som finnes. Verdiene står aldri der.

- Uten `PAGESPEED_API_KEY` får ytelsesraden i nettsidesjekken status «Ikke sjekket».
  Det er riktig oppførsel, men et dårligere produkt.
- Uten `RESEND_API_KEY` sendes ingen rapporter og ingen skjemasvar på e-post.
  Skjemaet sier da fra til brukeren i stedet for å late som det gikk bra.

## DNS hos GoDaddy

### ⚠️ Les dette før du regner med API-et

**GoDaddy strammet inn API-tilgangen i 2024.** Tilgang til domene-API-et krever nå
enten minst **10 domener** på kontoen, eller medlemskap i **Discount Domain Club**
(«Domeneklubb med rabatt» i det norske panelet). Menyvalget finnes i kontoen,
men **tilgangen må verifiseres** – svarer API-et `403`, er det dette som er årsaken,
og da gjør du det manuelt i stedet. Det tar fem minutter og gir nøyaktig samme resultat.

`scripts/dns-godaddy.mjs` fanger opp 403 og peker hit.

### Med API

```bash
# 1. Hent Fly-IP-ene
fly ips list -a kodekonsulentene

# 2. Sett miljøvariabler
export GODADDY_API_KEY=...        # https://developer.godaddy.com/keys – velg Production, ikke OTE
export GODADDY_API_SECRET=...
export FLY_IPV4=<v4 fra fly ips list>
export FLY_IPV6=<v6 fra fly ips list>

# 3. Se dagens oppføringer
node scripts/dns-godaddy.mjs list

# 4. Se hva som vil endres – skriver ingenting
node scripts/dns-godaddy.mjs plan

# 5. Skriv
node scripts/dns-godaddy.mjs apply
```

Skriptet rører **aldri** MX-oppføringer. E-post som slutter å virke er verre enn en
nettside som peker feil, og det er lett å ødelegge uten å merke det med én gang.

### Manuelt (fallback hvis API-et svarer 403)

I GoDaddy: **Domene → DNS-oppføringer**.

| Type | Navn | Data | TTL |
|---|---|---|---|
| A | `@` | Fly sin IPv4 fra `fly ips list` | 600 |
| AAAA | `@` | Fly sin IPv6 fra `fly ips list` | 600 |
| CNAME | `www` | `kodekonsulentene.no.` | 1 time |

Viktig om dagens oppsett:

- **A-oppføringen for `@` peker i dag på «WebsiteBuilder Site»** (GoDaddys egen sidebygger).
  Den **må erstattes** med Fly-IP-en, ellers fortsetter GoDaddy å svare på domenet.
- **CNAME `www` → `kodekonsulentene.no.`** finnes allerede og kan stå som den er.
- **CNAME `_domainconnect`** kan bli stående. Den brukes bare av GoDaddys
  «koble til tjeneste»-veiviser og påvirker ikke nettsiden.
- **NS-oppføringene** (`ns81/ns82.domaincontrol.com`) skal ikke røres så lenge GoDaddy
  er navnetjener.
- **MX-oppføringer** skal stå urørt. Flytter du e-post, er det en egen operasjon.

### Sertifikat

Etter at DNS peker riktig:

```bash
fly certs add kodekonsulentene.no -a kodekonsulentene
fly certs add www.kodekonsulentene.no -a kodekonsulentene
fly certs show kodekonsulentene.no -a kodekonsulentene
```

Fly henter Let's Encrypt-sertifikat automatisk når DNS har propagert. Sjekk med:

```bash
dig +short kodekonsulentene.no
dig +short www.kodekonsulentene.no
curl -sI https://kodekonsulentene.no | head -1
```

Propagering tar vanligvis minutter, men TTL på dagens oppføringer er 1 time –
regn med opptil en time før alle ser den nye adressen.

## Skalering og kostnad

`fly.toml` står med én `shared-cpu-1x` med 512 MB og `min_machines_running = 1`.
Den ene maskinen står alltid våken, slik at ingen besøkende betaler oppstartstiden –
ytelsesbudsjettet er LCP under 2,5 sekunder, og en kaldstart spiser hele det budsjettet.

`auto_stop_machines = "suspend"` gjør at maskiner utover den første legger seg ned
når trafikken faller.

## Overvåkning

`/status` brukes av Fly som helsesjekk hvert 30. sekund. Siden er bevisst statisk og
uten avhengigheter: svarer den ikke, er noe virkelig galt.

TODO: koble på ekstern oppetidsovervåkning (Uptime Kuma eller BetterStack) før
`/status` brukes som salgsargument overfor kunder.
