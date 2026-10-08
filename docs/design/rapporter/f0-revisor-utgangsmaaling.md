# f0-revisor-utgangsmaaling: produksjon kodekonsulentene.no, 2026-10-08

Målt mot produksjon. Ingenting rettet. Lighthouse 13.5.0 (mobilprofil, standard struping), Chrome for Testing fra Playwright, tre kjøringer per side, median oppgitt. Rådata: `.design/arbeid/revisor/lh/`. Skillene `accessibility-review`, `core-web-vitals` m.fl. ble ikke lastet (finnes ikke under de navnene); målingen bruker Lighthouse/axe og Playwright.

## 1. Lighthouse mobil (median av 3)
| Side | Ytelse | Tilgj. | Beste praksis | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 100 | 100 | 1,58 s | 0,057 | 0 ms (58/0/0) |
| /nettsider | 99 | 97 | 100 | 100 | 1,59 s | 0,057 | 0 ms |
| /priser | 100 | 97 | 100 | 100 | 1,52 s | 0,057 (0,057/0/0,057) | 0 ms |
| /om | 100 (99/100/100) | 100 | 100 | 100 | 1,60 s | 0 (0,057/0/0) | 0 ms |
| /sjekk | 99 (100/99/99) | 100 | 100 | 100 | 1,60 s | 0,057 (0/0,057/0,057) | 0 ms |

Grenser (del 12): alle fire kategorier >= 95, LCP <= 2,5 s, CLS < 0,1. Alle fem sider består. INP: ikke målt, krever ekte brukere.
Funn å vite om: fargekontrast feiler på /nettsider (4,04:1, #6e767f på #101318, 14 px, `.small.muted`, 5 elementer) og /priser (3,93:1, #6a7179 på #0b0d10, 14 og 16 px, 7 elementer). Det er brudd mot 4,5:1 selv om kategoriscoren er 97. CLS 0,057 kommer fra `section.scene.scene--lav` på forsiden og /nettsider.

## 2. Vekt, JavaScript, CSS, fonter (mobilviewport, networkidle)
| Side | Overført (br) | Forespørsler | Ekstern JS gzip | Inline JS gzip | Inline CSS gzip | Eksterne CSS-filer |
|---|---|---|---|---|---|---|
| / | 135,9 kB (LH 139) | 10 | 9,8 kB | 3,9 kB | 16,3 kB | 0 |
| /nettsider | 133,9 kB (LH 137) | 10 | 8,9 kB | 2,6 kB | 14,8 kB | 0 |
| /priser | 119,6 kB (LH 122) | 10 | 10,2 kB | 1,7 kB | 12,8 kB | 0 |
| /om | 138,7 kB (LH 141) | 9 | 8,9 kB | 3,3 kB | 14,0 kB | 0 |
| /sjekk | 140,2 kB (LH 143) | 10 | 10,7 kB | 2,5 kB | 15,0 kB | 0 |

- Sidevekt <= 700 kB: bestått (maks 143 kB). Egen JS <= 20 kB gzip uten GSAP: bestått (ekstern + inline maks 14,6 kB, /sjekk). Ingen GSAP lastet.
- CSS ligger inline i HTML (66,9 til 90,0 kB rå per side), ingen CSS-filer. Det betyr 12,8 til 16,3 kB gzip CSS gjentatt i hver HTML-fil.
- Fonter: 2 filer woff2, begge selvhostet: `schibsted-grotesk-700_800-latin.woff2` (47 kB) og `jetbrains-mono-400_600-latin.woff2` (31 kB). To familier, bestått (maks to). Merk at JetBrains Mono er i bruk, og at brief-AI-preg-sjekken kritiserer mono utenfor kode.
- Lazy-lastet innhold under brettet er ikke med i vekt-tallet utover det som lastes ved networkidle uten rulling.

## 3. Tredjepart, cookies, headere
| Krav | Grense | Målt | Bestått |
|---|---|---|---|
| Tredjepartskall | 0 | Alle forespørsler på alle fem sider går til kodekonsulentene.no. Ingen andre verter. CSP tillater `frame-src` cal.com og app.cal.com, men ingen av de fem sidene kaller dem ved innlasting. | ja |
| Cookies | 0 | 0 cookies på alle fem. localStorage tom. sessionStorage `kk-apning` settes på forsiden. | ja |
| Sikkerhetsheadere | 6/6 | CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options til stede på alle fem sider. I tillegg COOP same-origin og X-DNS-Prefetch-Control off. | ja |
| CSP `media-src 'self'` | til stede | Til stede i dag (`media-src 'self'`). | ja |
| Skriftkilde | selvhostet | `font-src 'self'`, ingen Google Fonts-kall | ja |

CSP har `style-src 'unsafe-inline'` og 26 script-hasher. Ikke et krav i briefen, men verdt å vite før script og CSS endres.

## 4. URL-liste
`docs/design/url-liste.txt`: 27 URL-er fra `sitemap-0.xml` (via `sitemap-index.xml`). Alle svarer 200. robots.txt oppgir 41 sider totalt, hvorav 14 under `/lab/` er holdt utenfor sitemap og er ikke med. Er de «gamle URL-er» som skal svare 200/301, må dirigenten avgjøre om `/lab/*` skal inn.

## 5. Skjermbilder
154 PNG i `.design/00-for/`, tatt med `scripts/skjermbilder.mjs` (mobil 390x844 @2x og desktop 1440x900, lyst og mørkt, redusert bevegelse, opp til 8 utsnitt). Loggen `.design/arbeid/revisor/skjermbilder.log` viser ingen feil. Bildene er ikke vurdert.

## Ikke målt
- INP (krever ekte brukere).
- Lighthouse desktop, WCAG-gjennomgang utover Lighthouse/axe, tastaturgjennomgang og Range/video: ikke del av utgangsmålingen (siden har ingen video i dag, ikke undersøkt videre).

## Hjelpeskript
`.design/arbeid/revisor/ressurser.mjs`, `gzip.mjs`. Lighthouse-feil: ett forsøk (/priser, kjøring 1) feilet med NO_NAVSTART og ble kjørt på nytt.
