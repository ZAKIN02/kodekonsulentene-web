# Akseptkriterier for redesignet

Skrevet av dirigenten i fase 0, fra briefens del 17 og funnene i bølge 0.2.
Grunnlag: docs/design/kartlegging.md, docs/design/referanser.md,
docs/design/rapporter/f0-revisor-utgangsmaaling.md.

## Utgangspunktet som skal slås, ikke brytes

Dagens produksjon (målt 8. oktober 2026, median av tre):

| Mål | I dag | Krav etter redesign |
|---|---|---|
| Lighthouse mobil, alle fire kategorier | ≥ 95 på alle fem målte sider | ≥ 95, fortsatt |
| LCP | 1,5–1,6 s | ≤ 2,5 s, og video er aldri LCP-elementet |
| CLS | ≤ 0,057 | < 0,1, og scenen gir ikke ny CLS |
| TBT | 0 ms | INP < 200 ms der det kan måles |
| Vekt første innlasting | 120–143 kB | ≤ 700 kB |
| Egen JavaScript (gzip) | ≤ 14,6 kB | ≤ 20 kB uten GSAP, ≤ 70 kB med |
| Fontfiler | 2 | maks to familier, selvhostet woff2 |
| Tredjepartskall / cookies | 0 / 0 | 0 / 0 |
| Sikkerhetsheadere | 6/6 | 6/6, CSP med `media-src 'self'` |

## Ferdig når (del 17, uforkortet)

- [ ] Byttetesten består på forsiden og tre undersider, vurdert av `kritiker`.
- [ ] AI-preg-sjekken har ingen åpne treff, verken i skjermbilder eller filmstriper.
- [ ] Første skjerm har én handling (adressefeltet), og scenen er sidens ene store øyeblikk.
- [ ] Scene-testene i del 8 er grønne i CI, på mobil- og desktopprofil.
- [ ] Hvert klipp har bestått kontrollen i del 9, og `assets/LICENSES.md` er komplett.
- [ ] Videofilene holder målene i del 9, finnes som både mp4 og webm, og lastes først nær skjermen.
- [ ] Alle bilder og videoer på siden er minst 1080p på korteste side, målt av `revisor`.
- [ ] Med redusert bevegelse og uten JavaScript sier siden det samme.
- [ ] Minst tre ekte bilder eller opptak av ekte arbeid på forsiden, eller merkede plassholdere som eier vet om.
- [ ] Ingen setning, tall eller løfte står mer enn én gang på forsiden.
- [ ] Lighthouse mobil ≥ 95 i alle fire kategorier på forsiden, `/priser`, `/om` og `/sjekk`.
- [ ] 0 WCAG A- og AA-brudd i automatisk test, og manuell tastaturgjennomgang er gjort.
- [ ] 0 tredjepartskall, 0 cookies, sikkerhetsheadere 6/6.
- [ ] Maks to fontfamilier, selvhostet.
- [ ] Alle gamle URL-er svarer 200 eller 301 (lista: docs/design/url-liste.txt, 27 adresser).
- [ ] Scenen er prøvd på en ekte iPhone og en ekte Android-telefon av eier.
- [ ] `docs/design/designsystem-v2.md` er skrevet, og v1-reglene som er opphevet er listet.
- [ ] Tavla viser alle oppdrag som FERDIG, og åpne punkter står i PR-en.
- [ ] Eier har skrevet GODKJENT ved port 0, 1, 2 og 3.

## Tillegg fra funnene i fase 0

- [ ] Kontrasten på `.small.muted` rettes: i dag 4,04:1 på /nettsider og 3,93:1 på /priser. Kravet er ≥ 4,5:1.
- [ ] Gjentakelsene fra del 4 er fjernet: prototype-løftet (3 steder), mva-setningen (4 steder + pakkekort),
  NorSIS-tallene (2 steder), URL-sjekken (2 steder), nøkkeltallene fra bevis.ts (/ og /om). Fil og linje
  står i kartlegging.md seksjon 5.
- [ ] Død kode ryddes i samme omgang som forsiden bygges om: SceneFilm og HeroFilm (importeres ikke),
  /historie fjernes fra Lighthouse-konfigene, `frame-src cal.com` i CSP vurderes fjernet.
- [ ] De 14 /lab/-sidene er utenfor redesignet og utenfor URL-lista. De skal ikke lenkes fra ny meny.

## Presiseringer

- «Alle gamle URL-er» betyr de 27 i url-liste.txt. /lab/-sidene står i robots.txt men ikke i sitemapet,
  og holdes utenfor.
- INP kan ikke måles uten ekte brukere; `revisor` måler lange oppgaver på throttlet mobilprofil i stedet.
- Kursivord-grepet fra del 4 finnes ikke lenger i koden (site.css setter font-style: normal med aksentfarge);
  grepet som faktisk skal bort er aksentfarget ord i h1.
