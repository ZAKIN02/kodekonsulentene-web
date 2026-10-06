## Hva og hvorfor

<!-- Én setning om hva som endres, og hvorfor. Lenk til issue. -->

## Sjekkliste

**Alltid**
- [ ] `npm run verify` er grønn lokalt (tester, `astro check`, bygg)
- [ ] Ingen hardkodede farger, avstander eller radier — alt gjennom tokens
- [ ] Alle priser fra `src/data/priser.ts`, alle foretaksfakta fra `src/data/firma.ts`
- [ ] Ingen oppdiktede tall, caser eller sitater. Manglende data står som «data mangler»
- [ ] Ingen hemmeligheter i koden eller i historikken

**Endret analysemotoren (`src/lib/sjekk.ts`)**
- [ ] Ny test i samme PR
- [ ] Æresregelen holder: ingenting rapporteres som bestått uten å være målt

**Endret UI**
- [ ] `docs/brandbok.md` fulgt
- [ ] Komponenten finnes i en blokk i `docs/sidemonstre.md`
- [ ] Riktig i både mørkt og lyst tema
- [ ] `test/bygget-html.test.ts` grønn: én `h1` per side, ingen tomme lenker, alt-tekst på bilder

**Endret noe som henter en fremmed URL**
- [ ] SSRF-vernet gjelder også etter omdirigeringer
- [ ] Tidsavbrudd og størrelsestak på plass

**Før lansering**
- [ ] `test/lansering.test.ts` grønn — ingen plassholdere publisert
