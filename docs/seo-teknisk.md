# Teknisk SEO

Målt og endret 6. oktober 2026. Alle tall her er målt, ikke anslått.

## Det som ble rettet

### Sitemap inviterte Google til sider vi ber den la være

Åtte av 31 URL-er i sitemap var `/lab/*` – interne demosider for komponenter og
teknikker. Alle åtte er merket `noindex`.

Det er ikke en skjønnhetsfeil. Google rapporterer kombinasjonen som feilen
**«Innsendt URL er merket noindex»** i Search Console: vi ber om indeksering og
nekter den i samme åndedrag. Sitemap filtrerer dem nå bort, og `robots.txt`
stenger `/lab/` helt, så de heller ikke spiser kravlebudsjett.

**31 → 23 URL-er. Null lab-sider igjen.**

### Sitemap hadde ingen prioritering

Alle sider sto likt. Nå er de rangert etter hva de faktisk er verdt for oss:

| Prioritet | Sider |
|---|---|
| 1,0 | `/` |
| 0,9 | tjenestesidene, `/priser`, `/sjekk`, alle `/verktoy/*` |
| 0,8 | bransjesidene |
| 0,7 | `/kontakt` |
| 0,6 | `/caser`, `/om`, `/handbok`, `/historie` |
| 0,4 | `/status`, `/terminal` |
| 0,3 | `/personvern`, `/vilkar` |

Verktøyene ligger likt med tjenestesidene med vilje. De er gratis, krever ingen
innlogging og svarer på det folk faktisk søker etter – de er de beste
inngangsportene vi har.

Prioritet er et hint om hvor ofte Google bør komme tilbake. Det er **ikke** en
rangeringsfaktor, og ingen bør vente at tallet alene flytter noe.

### Strukturerte data var én løsrevet node per side

Før: `ProfessionalService` gjentatt på hver side, uten `@id`. Google så ett nytt
foretak per side og kunne ikke vite at det var samme virksomhet.

Nå bygges alt i `src/data/schema.ts`, av de samme tallene som står i teksten:

- **`ProfessionalService`** med fast `@id` (`/#foretak`). Alle andre noder peker
  hit i stedet for å gjenta foretaket.
- **`WebSite`** som binder sidene til én utgiver.
- **`BreadcrumbList`**, utledet av stien. Google viser den i resultatlisten i
  stedet for rå URL. Særlig verdt det for `/verktoy/dmarc`, der stien forteller
  hvor man er.
- **`Service`**, **`WebApplication`**, **`FAQPage`** og tilbud som hjelpere.

Prisene leses fra `priser.ts`, så markup og brødtekst ikke kan komme ut av synk.
Tilbudene er merket `valueAddedTaxIncluded: !firma.mva`. Så lenge foretaket ikke er
mva-registrert er pakkeprisen det kjøperen faktisk betaler, og feltet skal være `true`.
Det sto hardkodet `false` til 7. oktober 2026 og fortalte Google at 29 900 var et
nettobeløp – samme feil som «eks. mva» gjorde mot leseren. Sier vi ingenting, antar
Google inkludert; derfor står feltet, og derfor er det utledet og ikke skrevet inn.

Sider merket `noindex` får ingen strukturerte data i det hele tatt. Verifisert:
`/kontakt?sendt=1` har 0 blokker, `/kontakt` har 3.

**Validering:** 69 JSON-LD-blokker fra bygget, og hjelperne som ennå ikke er
koblet inn, er sjekket mot schema.org sitt eget vokabular (3256 noder, hentet
fra `schema.org/version/latest`). Null ukjente typer, null properties på feil
type. Verktøyet står i `.skudd/seo-valider-ubrukt.mjs`.

## Det som IKKE kan fylles ut sannferdig

### Gateadresse

`firma.ts` har `adresse: "Oslo"` uten gateadresse, med en åpen TODO om at
ehandelsloven § 8 krever den, og at hjemmeadressen ikke skal publiseres.

`PostalAddress` står derfor med `addressLocality: "Oslo"` og
`addressRegion: "Oslo"`, uten `streetAddress`. Markupen er **gyldig** slik, men:

> Foretaket kan ikke kvalifisere til alle lokale søkeresultater før en ekte
> gateadresse finnes.

En oppdiktet gateadresse ville vært både løgn og brudd på Googles
retningslinjer. Dette er en innholdsmangel, ikke en teknisk en – den løses med
en postboks eller kontoradresse, ikke med kode.

### Omtaler og vurderinger

`aggregateRating` og `review` finnes ikke i markupen, fordi vi ikke har
kundeomtaler. Google behandler oppdiktede vurderinger som spam. `/caser` sier
det samme om oss selv: *«Et anslag presentert som en måling er en løgn med
desimaler.»*

### SearchAction

`WebSite` har bevisst **ingen** `SearchAction`. Den forteller Google at
nettstedet har et søkefelt som tar en fritekst-spørring. `/sjekk` analyserer en
*annen* nettside og er ikke et søk i vårt innhold – å merke den opp som søk ville
sendt brukere til en side som ikke svarer på det de spurte om.

### hreflang

Ikke lagt til, og det er riktig. `hreflang` peker på alternative språk- eller
regionversjoner. Vi har én versjon på norsk. En selvrefererende `hreflang` på et
enspråklig nettsted tilfører ingenting.

`i18n`-blokken i `astro.config.mjs` deklarerer `xmlns:xhtml` i sitemap, men
sender ingen `<xhtml:link>`-elementer, nettopp fordi det bare finnes én locale.
Den kan fjernes uten tap.

## To funn utenfor det som ble endret

### CSP-headeren doblet seg, og den trenger ikke å gjøre det

`sikkerhet.mjs` høster hasher med
`/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g`, som også treffer
`<script type="application/ld+json">`.

Siden strukturerte data gikk fra 1–2 til 3–4 blokker per side, og brødsmulene er
unike per side, vokste headeren:

| | Før | Etter |
|---|---|---|
| CSP-header på `/` | 1591 byte, 23 hasher | **2887 byte, 47 hasher** |

Det er ~1,3 kB lagt til **hvert eneste HTTP-svar** på nettstedet.

Hashene er unødvendige. CSP sin `script-src` gjelder skript nettleseren
**kjører**; `application/ld+json` er en datablokk med en type nettleseren ikke
kan kjøre. Verifisert empirisk i stedet for antatt – `.skudd/seo-csp-ldjson.mjs`
serverer `/verktoy/dmarc` med en CSP som bevisst utelater de tre
ld+json-hashene:

```
ld+json-blokker på siden: 3
hasher i CSP (bare kjørbare): 6
CSP-brudd rapportert: 0
tema-skript kjørte: true
```

**Null brudd**, og inline-skriptene virker fortsatt. Fiksen er å utelate
`type="application/ld+json"` når hashene høstes. `sikkerhet.mjs` var ikke min
fil å endre.

### Intern lenking: to sider er foreldreløse

Målt over bygget HTML, `/lab/*` holdt utenfor:

| Side | Innlenker |
|---|---|
| `/bransjer/handverkere` | **0** |
| `/verktoy/dmarc` | 1 (bare fra `/verktoy`) |
| `/verktoy/priskalkulator` | 1 (bare fra `/verktoy`) |
| `/verktoy/cookie-sjekk` | 2 |
| `/verktoy/uu-sjekk` | 2 |
| `/bransjer/klinikker` | 3 |
| alle andre | 22 |

De 22 er meny og footer. Sidene som ikke står der, henger i løse lufta.

`/bransjer/handverkere` lenkes **ikke fra én eneste indekserbar side** – bare fra
`/lab/svg`, som nå er stengt for søk. `/bransjer/klinikker` lenkes fra `/`,
`/systemer` og `/caser`; håndverkersiden har ingen av dem.

De fire verktøy-undersidene er begravd bak `/verktoy`. De er gratis verktøy som
svarer på konkrete søk, og de burde vært lenket fra tjenestesidene de hører til:
cookie-sjekk og uu-sjekk fra `/nettsider` og `/sikkerhet`, DMARC fra
`/sikkerhet`, priskalkulatoren fra `/priser`.

Dette er sannsynligvis den største uutnyttede gevinsten på nettstedet, og den
krever redigering av sidefiler.

## Titler og beskrivelser

Målt på bygget HTML. To problemer, og det minste av dem er det som ble meldt.

**Kuttes i resultatlisten (over 60 tegn):**

| Side | Tegn |
|---|---|
| `/verktoy/priskalkulator` | 69 |
| `/` | 68 |

**Men det større problemet er titlene som er for korte.** Malen er
`{tittel} – KodeKonsulentene`, og halvparten av sidene oppgir bare et
enkeltord:

| Side | Tittel | Tegn |
|---|---|---|
| `/om` | «Om – KodeKonsulentene» | 21 |
| `/caser` | «Caser – KodeKonsulentene» | 24 |
| `/priser` | «Priser – KodeKonsulentene» | 25 |
| `/handbok` | «Håndbok – KodeKonsulentene» | 26 |
| `/sikkerhet` | «Sikkerhet – KodeKonsulentene» | 28 |
| `/nettsider` | «Nettsider – KodeKonsulentene» | 28 |

Google gir omtrent 60 tegn. «Om» bruker 2 av dem. Disse sidene konkurrerer ikke
om noe søk i det hele tatt.

**Beskrivelser under 120 tegn** (utnytter ikke plassen): `/status` 105,
`/systemer` 113, `/caser` 114, `/om` 119.

Titler og beskrivelser ligger i sidefilene. De ble ikke endret her.
