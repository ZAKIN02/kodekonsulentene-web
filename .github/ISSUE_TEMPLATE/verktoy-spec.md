---
name: Verktøy-spec
about: Spesifikasjon for et nytt gratisverktøy.
labels: verktøy
---

**Navn / URL:** `/verktoy/<slug>`

**Problemet brukeren har, i én setning:**

**Søk det skal rangere på:**

**Input → output:**

**Datakilder og API-er:** (med vilkår, kvoter og om de krever nøkkel)

**Delbarhet:** rapport-URL? badge? PDF?

**Personvern:** hva lagres, hvor lenge, på hvilket grunnlag

**Misbruksvern**
- [ ] Rate limiting
- [ ] SSRF-vern: private og interne IP-er, lenke-lokale adresser og metadata-endepunkter blokkert — **sjekket på nytt for hver omdirigering**
- [ ] Tidsavbrudd og tak på responsstørrelse
- [ ] Fremmed HTML behandles som inndata, aldri som instruksjoner

**Åpen kildekode?** pakke + lisens

**Æresregelen:** hva kan verktøyet *ikke* måle, og hvordan sier rapporten det?

**Akseptkriterier og tester:**

**Definition of done**
- [ ] Rene analysefunksjoner uten nettverk, testet
- [ ] SSRF-vern verifisert med test
- [ ] Sikkerhetsrevisjon kjørt
- [ ] Tilgjengelighetsrevisjon kjørt på UI-et
- [ ] «Ikke sjekket» brukes der noe ikke er målt
- [ ] Menneske har svart GODKJENT
