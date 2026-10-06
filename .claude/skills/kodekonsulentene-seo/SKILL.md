---
name: kodekonsulentene-seo
description: Bruk når du planlegger, skriver, reviderer eller publiserer artikler, landingssider eller gratisverktøy for KodeKonsulentene, eller vurderer søkeord, strukturert data, interne lenker og lenkebygging for det norske markedet. Dekker artikkelstrukturen som er påbudt i dette repoet, hvilke søk som er verdt å gå etter, hva som faktisk virker mot AI-søk, og hvilke tall som ikke skal siteres.
---

# SEO for KodeKonsulentene

Målet er ikke trafikk. Målet er at noen som har et konkret problem — cookies som
settes før samtykke, en nettside som ikke består lovkravene, en integrasjon mot
Fiken — finner oss, bruker et verktøy som gir dem et svar, og husker hvem som ga
det. Trafikk uten det er bare kostnad.

## Fire prinsipper

1. **Verktøy før artikler.** Hvert innholdsområde skal ha et verktøy som gir et
   konkret svar: en sjekk, en kalkulator, en generator. En artikkel uten et
   verktøy er lettere å erstatte med et AI-svar enn en artikkel med.
2. **Nisje før bredde.** Lovkrav, integrasjoner og bransje + by før «nettside pris».
   De brede prissøkene er mettet, og å vinne der krever lenkekraft vi ikke har ennå.
3. **Unikhet.** Hver side må ha egen data, eget skjermbilde, egen kode eller et
   ekte erfaringspunkt. Ingen tynne mal-sider.
4. **Ærlighet.** Ingen oppdiktede tall, søkevolum eller caser. Skriv «data mangler»
   og hvordan det skaffes. Dette er ikke bare etikk: posisjoneringen vår er at vi
   måler i stedet for å påstå, og ett oppdiktet tall velter hele den påstanden.

## Hva som faktisk er dokumentert om AI-søk

Dette feltet er fullt av råd uten grunnlag. Hold deg til dette:

- **Det finnes ingen egen «AI-optimalisering».** Google skriver selv at vanlig SEO
  gjelder for AI Overviews og AI Mode, at det ikke trengs noen spesiell
  schema-markup, og at trafikk derfra telles i Search Console. Konsekvensen:
  sider som ikke rangerer organisk, blir heller ikke sitert i AI-svarene.
  *Kilde: Googles «AI features and your website». Sist sjekket: data mangler — verifiser mot developers.google.com før du siterer den.*
- **Klikkene forsvinner fra rene informasjonssøk.** Pew Research Center (22. juli
  2025, 68 879 søk fra over 900 amerikanske voksne i mars 2025) fant at brukere
  klikket på et vanlig resultat i 8 % av besøkene når et AI-sammendrag vises, mot
  15 % uten, og at 1 % klikket på kildelenkene i sammendraget. Dette er amerikanske
  tall. **Vi har ingen norske.**
- **llms.txt har ingen dokumentert effekt.** SE Ranking undersøkte nesten 300 000
  domener (7. november 2025) og fant 10,13 % utbredelse — og modellen deres for
  AI-sitering ble *mer* presis når llms.txt ble fjernet som variabel. Vi har en
  fil. Bruk ikke mer tid på den.
- **Masseproduserte sider straffes.** Googles policy mot «scaled content abuse»
  (mars 2024) rammer mange sider laget først og fremst for å manipulere rangering,
  uansett om et menneske eller en modell skrev dem. Bransje × by-sider er bare
  trygge med unike data per side.

Praktisk konsekvens: satsingen på verktøy og egne målinger er ikke en stilart.
Det er det eneste som ikke kan oppsummeres bort av et AI-svar.

## Påbudt artikkelstruktur

Avvik fra denne krever en grunn du skriver ned i PR-en.

1. **H1** med målsøkeordet, og årstall bare der det er naturlig.
2. **Kort svar, 40–60 ord**, øverst. Konkret tall eller ja/nei, med lovhenvisning.
   Dette er avsnittet som blir sitert.
3. **Verktøyet** innebygd eller lenket over folden.
4. **Faktatabell** med kjernefakta: priser, krav eller sammenligning.
5. **H2-er som speiler reelle spørsmål.** Hvert avsnitt starter med svaret.
6. **Egen data:** skjermbilde, måling, kode eller «vi testet X».
7. **FAQ**, 3–6 spørsmål. `FAQPage`-schema bare når FAQ-en faktisk vises.
8. **Forfatterboks** med fagbakgrunn og lenke til `/om`.
9. **Kildeliste** med «sist sjekket»-dato.
10. **«Oppdatert»-dato** i synlig tekst og i `dateModified`.
11. **3–5 interne lenker:** pilarside, verktøy, tjenesteside.

## Søkelandskapet

Vurderingene under bygger på observerte søkeresultater, ikke på målte volumer.
**Norske søkevolum er nesten aldri offentlige.** Hent egne tall fra Google Keyword
Planner (Norge, norsk) før du prioriterer, og skriv aldri et volumtall uten verktøy
og dato.

| Område | Konkurranse | Vurdering |
|---|---|---|
| Lovkrav: cookies, UU, org.nr. | Middels | Vinnes med en *sjekk*, ikke med tekst. Her er vi sterkest. |
| Integrasjoner: Vipps, Fiken, Tripletex, BankID | Lav | Tydelig hull. Kode, pris og fallgruver. |
| Bransje + by | Middels | Krever egne data per side, ellers er det en mal-side. |
| Sammenligninger og totalkostnad | Middels | Kalkulator med synlige antakelser. |
| «Hva koster en nettside», «nettside pris» | Svært høy | Minst ti norske guider fra 2026. Krever måneder og mange lenker. |

Realistisk tidshorisont er en vurdering, ikke et løfte: smale tekniske søk kan nås
på uker, lovkrav og bransje + by på måneder, de brede prissøkene på 6–18 måneder
eller aldri uten lenkearbeid.

## Teknisk

- **Strukturert data:** `Organization`, `LocalBusiness`, `Article`, `BreadcrumbList`.
  `FAQPage` kun når FAQ-en er synlig på siden. Ingen «AI-schema» — den finnes ikke.
- **Lighthouse ≥ 95** på alle fire kategorier, mobil. Ingen tredjepartsskript.
- **Interne lenker:** hver artikkel → pilar + verktøy + tjenesteside.
- **Indeksering:** `erUferdig` i `src/data/firma.ts` styrer `noindex` og `robots.txt`.
  Siden åpner seg selv for søk når foretaksdataene er ekte. Ikke overstyr den porten.
- **Én `h1` per side.** `Section` tar `nivaa={1}` på øverste seksjon.
  `test/bygget-html.test.ts` håndhever det.

## Lovkilder

Sjekk alltid mot primærkilden, aldri mot en konkurrents oppsummering.

| Tema | Hjemmel | Kilde |
|---|---|---|
| Cookies og samtykke | ekomloven § 3-15, fra 1. januar 2025 | Lovdata, Nkom, Datatilsynet |
| Kontaktinformasjon | ehandelsloven § 8 | Lovdata |
| Universell utforming | 35 krav, WCAG 2.0 A/AA for private | Uutilsynet |
| E-postmarkedsføring | markedsføringsloven § 15 | Forbrukertilsynet |
| Foretaksnavn for ENK | foretaksnavnloven § 2-2 | Lovdata |
| Foretaksdata | Enhetsregisteret, åpent API uten nøkkel | data.brreg.no |

**E-post, viktig:** markedsføringsloven § 15 krever forhåndssamtykke for
e-postmarkedsføring til *fysiske personer*. Generiske foretaksadresser som `post@`
er tillatt. **Et enkeltpersonforetak er en fysisk person**, og en stor del av
målgruppen vår er ENK-er. Kald e-post til `navn@bedrift.no` eller til en ENK-eier
er derfor utenfor. Bruk «hent rapporten selv»-skjema i stedet.

## Tall som ikke skal siteres

- **«86 % av norske nettsteder har ugyldig cookie-banner.»** Kommer fra en
  leverandør som selger cookie-skanning. Ikke uavhengig verifisert. Vil du bruke
  et slikt tall, må vi måle det selv og publisere metoden.
- **Whitesparks vekting av lokale rangeringsfaktorer.** Det er ekspertvurderinger
  fra en bransjeundersøkelse, ikke tall fra Google. Si det hvis du refererer dem.
- **Trafikktall for amerikanske gratisverktøy** (HubSpot, Gusto, Shopify) er
  tredjeparts estimater fra et annet marked. Brukbare som retning, ikke som fakta.
- **Alt søkevolum uten verktøy og dato.**

## Lenkebygging i Norge

Det som faktisk gir lenker herfra: regnskapsførere og deres partnerprogrammer,
bransjeforeninger for håndverk og klinikker, kode24, lokale medier når vi har egne
tall å kommentere, studentmiljøer, og badges fra nettsidesjekken som kunder limer
inn på sine egne sider.

GitHub gir **synlighet, ikke lenkekraft**: eksterne lenker i README-er på
github.com er `nofollow`. Effekten er indirekte — omtale som gir lenker fra andres
domener.

## Måling

Search Console (inkluderer AI-trafikk), Bing Webmaster Tools, Plausible-hendelser
per verktøy, og den manuelle AI-synlighetsloggen i `docs/ai-synlighet.md`: 20 faste
spørsmål i ChatGPT, Perplexity og Google AI Mode, én gang i måneden.

## Se også

`kodekonsulentene-tekst` for stemmen. `kodekonsulentene-lovsjekk` for paragrafene.
`docs/roadmap.md` for rekkefølgen. `docs/metode-skanning.md` før du skanner noe.
