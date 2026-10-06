# Hvorfor vi ikke rangerer på vårt eget navn

Målt 6. oktober 2026.

## Funnet

Søk på «kodekonsulentene» gir GitHub-repoet som første treff. Nettstedet er ikke
i topp ti. `site:kodekonsulentene.no` gir null treff.

## Diagnosen: nettstedet er for nytt, og det er hele forklaringen

`erUferdig` i `src/data/firma.ts` tvang `noindex` og `robots.txt Disallow: /` helt
til ekte org.nr. var på plass. Porten åpnet **5. oktober 2026 kl. 21:32** – under
et døgn før målingen. Google har ikke rukket å kravle noe.

Alt teknisk er verifisert rent. 31 av 31 sitemap-URLer med Googlebots brukeragent:

| | |
|---|---|
| HTTP 200 | 31 av 31 |
| Kanonisk URL peker rett | 31 av 31 |
| `lang="nb-NO"` | 31 av 31 |
| Nøyaktig én `h1` | 31 av 31 |
| Innhold i rå HTML uten JS | 31 av 31 |
| `X-Robots-Tag` | ingen |
| TTFB som Googlebot | 78–92 ms |

Eneste avvik: åtte `/lab/*`-sider er `noindex` og står likevel i sitemap. Det er
rettet i arbeidstreet, men ikke deployet.

**Det finnes ingen teknisk blokkering igjen.** Siden mangler tid og eksterne
signaler, ikke kode.

## Navnet kolliderer med et yrkesbegrep

«Kodekonsulent» er en etablert stilling i norsk helsevesen – medisinsk koding ved
sykehus. Søk på ordet treffer stillingsutlysninger fra Sørlandet sykehus, Helse
Stavanger og Kompetanseenhet for medisinsk koding.

Det betyr at merkevaresignalene må være sterkere enn for et særpreget navn, og at
vi aldri kommer til å eie entallsformen. Det er greit: folk som søker vårt navn,
søker flertallsformen.

Lagt inn i `src/data/schema.ts`:

- `alternateName` med skrivemåtene folk faktisk bruker
- `sameAs` mot Enhetsregisteret og GitHub-repoet – begge verifisert med HTTP 200
  og inneholder navnet. Ingen oppdiktede profiler.
- `identifier` som knytter org.nr. 936374336 eksplisitt til Enhetsregisteret

## Det kunden må gjøre selv

Dette kan ikke gjøres fra kode. Rekkefølgen er etter effekt.

1. **Google Search Console.** Gå til <https://search.google.com/search-console>,
   velg «Domene», skriv `kodekonsulentene.no`. Google gir deg en TXT-post – send
   den til meg, så legger jeg den inn via GoDaddy-API-et. Når domenet er
   verifisert: «Sitemaps» → lim inn `sitemap-index.xml` → Send. Deretter
   «URL-inspeksjon» → lim inn `https://kodekonsulentene.no/` → «Be om
   indeksering». Dette er det enkelttiltaket som flytter mest.

2. **Hjemmeside i Enhetsregisteret.** Oppføringen på org.nr. 936374336 har
   **tomt** hjemmesidefelt. Logg inn på <https://www.altinn.no> → «Samordnet
   registermelding» → legg inn `https://kodekonsulentene.no`. Det er en lenke fra
   et statlig register, og den knytter navnet til domenet på den sterkeste måten
   som finnes i Norge.

3. **Bing Webmaster Tools.** <https://www.bing.com/webmasters> – kan importere
   direkte fra Search Console når den er satt opp.

4. **Google Business Profile.** Krever en adresse vi kan oppgi. `firma.adresse`
   står som «Oslo» uten gateadresse, og hjemmeadressen skal ikke publiseres.
   Dette venter på postboks eller kontoradresse – samme mangel som
   ehandelsloven § 8 peker på.

## Det som kan kjøres fra kode

`node .skudd/seo-indexnow.mjs` sender alle sitemap-URLer til IndexNow, som Bing,
DuckDuckGo og Yandex bruker. Google støtter det ikke, og deprekerte sitemap-ping
i 2023 – der finnes ingen vei utenom Search Console.

Nøkkelfila må være deployet først, ellers avvises hele settet.
