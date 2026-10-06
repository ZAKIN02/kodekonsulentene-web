# E-postmaler

To maler i `src/lib/epostmal.ts`, sendt via Resend fra `src/lib/epost.ts`:

- **Rapporten** fra «Sjekk nettsiden din». Går til kunden, ofte første inntrykk.
- **Henvendelsen** fra kontaktskjemaet. Går til oss.

Begge har `html` og `text`. En e-post uten tekstdel havner oftere i søppelpost,
og tekstdelen er det eneste som er garantert lesbart i alle klienter.

## Blokkerende: domenet er ikke verifisert i Resend

`kodekonsulentene.no` er **ikke** lagt til i Resend. Målt 6. oktober 2026:

```
POST /emails  from: rapport@kodekonsulentene.no  ->  403
POST /emails  from: hei@kodekonsulentene.no      ->  403
{"message":"The kodekonsulentene.no domain is not verified."}
```

Eneste verifiserte domene på kontoen er `firmainnsikt.com`, som hører til et
annet prosjekt.

**Følgen i produksjon:** kontaktskjemaet og rapport-på-e-post virker ikke, uansett
om `RESEND_API_KEY` er satt. Koden degraderer ærlig – `sendHenvendelse` svarer
`false`, brukeren havner på `/kontakt?feil=2` og får beskjed om å sende e-post
direkte – men funksjonen er død til domenet er verifisert.

Verifisering krever TXT- og MX-poster i DNS fra Resend. Merk at domenet samtidig
er midt i en flytting fra Google Workspace til Microsoft 365; Resend-postene er
uavhengige av den flyttingen og kan legges inn uten å røre MX for innkommende
post.

## Lys mal, ikke mørk

Nettstedet er mørkt som standard. E-posten er lys, med vilje.

Den farlige retningen er mørk mal: Gmail og Outlook kan invertere en mørk
bakgrunn til lys og samtidig la lys tekst stå lys, og da forsvinner teksten.
En lys mal inverterer derimot som en helhet – både flate og tekst snur – og
forblir lesbar.

Testet ved å rendre malen med `filter: invert(1) hue-rotate(180deg)` over hele
dokumentet. Alt innhold overlevde; se `.skudd/epost-rapport-morkt.png`.

Malen ber uttrykkelig om lys med `color-scheme: light` og
`supported-color-schemes: light`, så Apple Mail lar den være.

## Logoen er tekst, ikke bilde

Første versjon brukte en PNG av lockupen i 2x. Den ble forkastet etter måling:

1. **Outlook og Gmail blokkerer eksterne bilder som standard.** En bilde-only
   logo betyr at mange mottakere ser en ødelagt plassholder som det første i
   e-posten.
2. **Under tvungen invertering ble PNG-en en svart klistrelapp.** Klienten
   inverterte båndet til lyst, men lot bildet stå mørkt. Se den forkastede
   varianten i historikken til `.skudd/epost-rapport-morkt.png`.

Logoen er nå «KK» i en limefarget tabellcelle pluss ordmerket som tekst.
Den inverterer sammen med alt annet, og den vises uansett bildeinnstillinger.
`bgcolor`-attributtet står ved siden av inline `style` fordi eldre Outlook og
flere mørk modus-implementasjoner respekterer attributtet når de overstyrer CSS.

**Malen har null `<img>`.** Det er en egenskap verdt å beholde.

## Statusfargene er de LYSE variantene

Brandboken sier at terminal- og rapportblokker er mørke i begge temaer. Den
regelen gjelder ikke her: i e-post har vi en lys flate, og da må statusfargene
være de lyse variantene fra `tokens.css`.

Å bruke de mørke temafargene på en lys flate er nøyaktig feilen som lå på vår
egen forside – terminalflaten er mørk i begge temaer, men `--ok`, `--warn` og
`--fail` byttet med temaet, så lyst tema malte mørk tekst på mørk flate ned i
2,96:1.

Målt kontrast i malen, krav 4,5:1:

| | |
|---|---|
| Bestått `#0b7a6b` på `#d6f5ee` | 4,53:1 |
| Bør fikses `#8a5b00` på `#fdf0d2` | 5,19:1 |
| Brudd `#b42318` på `#fde3e1` | 5,40:1 |
| Ikke sjekket `#4f5861` på `#e9ecef` | 6,10:1 |
| Brødtekst `#4f5861` på hvit | 7,24:1 |
| Overskrift og mono-verdi | 17,98:1 |
| «KK» mørk blekk på lime | 13,92:1 |

Status står alltid med **ord**, ikke bare farge – samme regel som på siden.

## Brukerinnhold escapes

`esc()` i `epostmal.ts` kjører over alt som kommer fra skjemaet og fra
nettadresser vi ikke eier. Uten det kan en melding med `<` bryte markupen, og en
e-postklient som tolker noe av HTML-en er en reell angrepsflate.

Verifisert visuelt: en testmelding med `<script>alert(1)</script>` og `&`
rendres som lesbar tekst i `.skudd/epost-henvendelse-lys.png`.

## Markedsføringsloven § 15

Rapporten er en tjeneste brukeren selv ba om, og er derfor ikke uoppfordret
markedsføring. For at den skal forbli det:

- **Ingen salgspåtrykk.** Én nøytral setning om at man kan svare, og en lenke til
  prissiden. Ingen hastverk, ingen rabatt, ingen gjentatt oppfordring.
- **Vi sender bare denne ene.** Det står i bunnteksten. Derfor ingen
  avmeldingslenke, som ville antydet at det finnes en liste.

Sender vi noen gang mer enn det ene svaret, må avmelding inn – og da er det
ikke lenger § 15-trygt uten samtykke, siden et enkeltpersonforetak er en
fysisk person.

## Verktøy

```
node .skudd/epost-bygg.mjs [domene]   # bygger begge malene fra ekte API-data
node .skudd/epost-se.mjs              # rendrer lys, mørk og mobil til .skudd/
node .skudd/epost-send.mjs            # sender via Resend og henter dem tilbake
```

`epost-bygg.mjs` henter rapportdata fra produksjons-API-et i stedet for å dikte
opp tall, så malen testes mot virkelige verdier – inkludert rader som ender på
«Ikke sjekket», som er de vanskeligste å få til å se riktige ut.
