# Designsystem v2: «Befaring»

Oppdrag: f2-designleder-system. Skrevet 2026-10-08 av `designleder`.
Grunnlag: briefen del 2, 4, 6, 8 og 12, `retning.md` (retning A), `rapporter/f1-kritiker-retninger.md`, `rapporter/f1-revisor-maaling.md`, `kartlegging.md`.
Avgjort ved PORT 1: retning A med den typografiske prislista fra C, lyst som standard, «jeg», myk rulling av, peker-etikett av.

Dette dokumentet erstatter `kodekonsulentene-design` (v1), `docs/brandbok.md` og blokkreglene i `docs/sidemonstre.md` der de er uenige. Det som er opphevet, står i del 11.

Alle kontrasttall er **beregnet** med WCAG-formelen for relativ luminans. `revisor` måler dem. Luminansverdiene står i vedlegget nederst, så regnestykket kan kontrolleres.

---

## 1. Fem regler som styrer resten

1. **Dokumentet er grensesnittet.** Det som er resultat (rapport, prisliste, prosess), står på papir. Det som er handling, står på refleks. Det som er bevis, står i scenen.
2. **Refleks er felt, ikke lys.** Lime er bare flate felt med blekk på. Aldri glød, aldri strek, aldri tekstfarge.
3. **Hver påskrift peker på noe målt.** Målelinjer i snorblå går til en verdi som faktisk er målt. Ikke målt betyr ingen påskrift.
4. **Én tekstfarge per bunn.** Det finnes ingen dempet grå. Hierarki lages med størrelse, vekt og luft. Eneste unntak er plassholderteksten i felt, som har sin egen token og bare brukes der.
5. **Tekst ligger aldri direkte på video.** All tekst i scenen står i tittelfeltet, en tett plate. Da er kontrasten den samme uansett klipp.

---

## 2. Farger

### 2.1 Råfarger

Råfargene brukes bare i `tokens.css`. Komponentene bruker rolletokens (2.2).

| Token | Hex | Navn og opphav |
|---|---|---|
| `--betong` | `#E9EAE6` | Sidebunn, lyst tema. Kjølig betonggrå. |
| `--papir` | `#FBFBF9` | Ark: rapport, prisliste, prosess, footer. Tekst i scenen og i mørkt tema. |
| `--blekk` | `#111315` | All tekst i lyst tema. Kant på refleksflater. |
| `--refleks` | `#C8F24A` | Logoens lime. Bare flate felt. |
| `--refleks-trykk` | `#B4DC3A` | Refleksknapp når pekeren er over eller den trykkes. |
| `--snorbla` | `#2443E0` | Lenker, målelinjer og fokus i lyst tema. Blått kritt i slagsnora. |
| `--mangelrod` | `#B3301B` | Mangler og feil i lyst tema. |
| `--plass-lys` | `#565B61` | Bare plassholdertekst i felt, lyst tema. |
| `--scene` | `#080809` | Bunnen i scenen. **Målt** i de ekte klippene (ikke `#0b0d10`). Brukes i begge temaer. |
| `--blakopi` | `#12285C` | Sidebunn, mørkt tema. Blåkopien av en arbeidstegning. |
| `--blakopi-ark` | `#1B3672` | Ark og felt i mørkt tema. |
| `--krittbla` | `#A8B8FF` | Lenker, målelinjer og fokus i mørkt tema og i scenen. |
| `--signalrod` | `#FF9B85` | Mangler og feil i mørkt tema. |
| `--plass-mork` | `#B4BCD6` | Bare plassholdertekst i felt, mørkt tema. |

**Mørkt tema er endret fra retningsplanen.** Kritikeren fant at mørkt tema i A var nesten svart med én lime-knapp, altså formspråket del 4 forkaster. Mørkt tema er nå blåkopi: en tydelig blå bunn, hentet fra arbeidstegningen, ikke fra utviklerverktøy. Scenen (`#080809`) blir fortsatt et mørkere rom inne i den mørke siden.

### 2.2 Rolletokens

| Token | Lyst (standard) | Mørkt | Bruk |
|---|---|---|---|
| `--bunn` | `--betong` | `--blakopi` | Sidebunn |
| `--ark` | `--papir` | `--blakopi-ark` | Rapport, prisliste, prosess, footer, spørsmål |
| `--tekst` | `--blekk` | `--papir` | All tekst på `--bunn` og `--ark` |
| `--lenke` | `--snorbla` | `--krittbla` | Lenker |
| `--maalelinje` | `--snorbla` | `--krittbla` | Målelinjer og påskrifter |
| `--fokus` | `--snorbla` | `--krittbla` | Fokusring |
| `--mangel` | `--mangelrod` | `--signalrod` | «Mangler», overstreking, feilmeldinger, feilkant |
| `--felt` | `--papir` | `--blakopi-ark` | Fyll i tekstfelt |
| `--tekst-plass` | `--plass-lys` | `--plass-mork` | Bare `::placeholder` |
| `--kant-kontroll` | `--blekk` | `--papir` | Kant på felt, radioknapper og sekundærknapp |
| `--refleksflate` | `--refleks` | `--refleks` | Hovedknapp, garantifelt, fastprisfelt, valgt pakke, merkelapp |
| `--refleksflate-trykk` | `--refleks-trykk` | `--refleks-trykk` | Hovedknapp, pekt på og aktiv |
| `--tekst-pa-refleks` | `--blekk` | `--blekk` | Tekst og lenker på refleks |
| `--kant-refleks` | `--blekk` | `--blekk` | Kant på refleksflater som er kontroller |
| `--scene-bunn` | `--scene` | `--scene` | Scene, tittelfelt, reel-dialog |
| `--scene-tekst` | `--papir` | `--papir` | Tekst i tittelfeltet |
| `--scene-lenke` | `--krittbla` | `--krittbla` | Hopp-lenke og lenker i scenen, fokus i scenen |

Refleks er det samme i begge temaer. Scenen er den samme i begge temaer.

### 2.3 Kontrast per par (beregnet)

Krav: tekst ≥ 4,5:1, kontroller og grafikk som bærer mening ≥ 3:1 (del 12).

**Lyst tema**

| Forgrunn | Bakgrunn | Forhold | Bruk | Krav |
|---|---|---|---|---|
| blekk | papir | 17,97:1 | tekst på ark | ok |
| blekk | betong | 15,40:1 | tekst på sidebunn, footer | ok |
| blekk | refleks | 14,41:1 | knappetekst, garantifelt, merkelapp, lenke på refleks | ok |
| blekk | refleks-trykk | 11,74:1 | knappetekst, pekt på og aktiv | ok |
| snorblå | papir | 6,86:1 | lenker og påskrifter på ark | ok |
| snorblå | betong | 5,88:1 | lenker på sidebunn | ok |
| mangelrød | papir | 6,04:1 | «Mangler», feilmelding i ark | ok |
| mangelrød | betong | 5,18:1 | feilmelding under adressefeltet | ok |
| plass-lys | papir | 6,61:1 | plassholder i felt | ok |
| blekk (kant) | betong | 15,40:1 | kant på felt og refleksknapp | ok (≥ 3) |
| blekk (kant) | papir | 17,97:1 | kant på radioknapper i prislista | ok (≥ 3) |
| snorblå (fokusring) | betong / papir | 5,88 / 6,86:1 | fokus | ok (≥ 3) |
| mangelrød (feilkant) | betong | 5,18:1 | felt med feil | ok (≥ 3) |
| refleks (flate) | betong | 1,07:1 | **ikke nok alene**, derfor kant i blekk | se 2.4 |
| refleks (flate) | papir | 1,26:1 | **ikke nok alene**, derfor kant i blekk | se 2.4 |

**Mørkt tema**

| Forgrunn | Bakgrunn | Forhold | Bruk | Krav |
|---|---|---|---|---|
| papir | blåkopi | 13,66:1 | tekst på sidebunn, footer | ok |
| papir | blåkopi-ark | 11,15:1 | tekst på ark og i felt | ok |
| krittblå | blåkopi | 7,39:1 | lenker | ok |
| krittblå | blåkopi-ark | 6,03:1 | lenker og påskrifter på ark | ok |
| signalrød | blåkopi | 6,93:1 | feilmelding under adressefeltet | ok |
| signalrød | blåkopi-ark | 5,66:1 | «Mangler» i rapporten | ok |
| plass-mørk | blåkopi-ark | 6,11:1 | plassholder i felt | ok |
| blekk | refleks | 14,41:1 | knappetekst | ok |
| papir (kant) | blåkopi | 13,66:1 | kant på felt og radioknapper | ok (≥ 3) |
| refleks (flate) | blåkopi | 10,96:1 | refleksknapp som kontroll | ok (≥ 3) |
| refleks (flate) | blåkopi-ark | 8,95:1 | valgt pakke i prislista | ok (≥ 3) |
| krittblå (fokusring) | blåkopi / blåkopi-ark | 7,39 / 6,03:1 | fokus | ok (≥ 3) |

**Scenen (begge temaer)**

| Forgrunn | Bakgrunn | Forhold | Bruk | Krav |
|---|---|---|---|---|
| papir | scene | 19,32:1 | tekst i tittelfeltet | ok |
| krittblå | scene | 10,45:1 | hopp-lenke, fokus i scenen | ok |
| refleks (flate) | scene | 15,50:1 | «Spill av» og knapper i scenen | ok (≥ 3) |

### 2.4 Kant på kontroller (funn 5): justert

Retningsplanen sa 1 px kant i blekk på refleksflater. Regelen er justert til dette:

- **Alle kontroller har 2 px kant** (`--kant-2`). Det gjelder adressefeltet, hovedknappen, sekundærknappen, radioknapper og valgt pakke. Feltet og knappen står side om side og skal lese som én enhet, og 2 px forsvinner ikke ved delvis zoom på skjermer med 1x tetthet.
- **Refleksflater som er kontroller** har kant i `--kant-refleks`, som er blekk **i begge temaer**. I lyst tema er det kanten som gir 3:1 (15,40:1 mot betong). I mørkt tema og i scenen gir selve flaten 3:1 (10,96 og 15,50:1), og blekkanten er en del av flaten, slik at knappen ser lik ut overalt.
- **Felt, radioknapper og sekundærknapp** har kant i `--kant-kontroll`: blekk i lyst, papir i mørkt. Det retter funnet om at feltet mistet kanten i mørkt tema (blekk mot blåkopi er bare 1,32:1, beregnet).
- Refleksflater som ikke er kontroller (garantifeltet, merkelapp, fastprisfeltet), har ingen kant. De er ikke noe man klikker på.

### 2.5 Tekst over video (funn 1)

Målt uten plate: 1,02–1,19:1. Regelen som garanterer ≥ 4,5:1 uansett klipp:

**All tekst i scenen står i tittelfeltet: én tett plate i `--scene-bunn` med opasitet 1.** Ingen tekst står direkte på videoen, og platen er aldri halvgjennomsiktig. Da er kontrasten 19,32:1 (beregnet) i hvert bilde i hvert klipp, og ingen måling av det lyseste punktet i klippet trengs.

Tittelfeltet er lånt fra arbeidstegningen, der tittelfeltet i hjørnet sier hva tegningen viser. Det er **ett** felt som bytter innhold per steg, ikke ett kort per steg. Det unngår funnet om fire like kort i B.

Avvist: slør (gradient). Et slør med opasitet 0,75 gir 9,15:1 mot en helt hvit piksel (beregnet), men regelen blir da avhengig av at teksten holder seg innenfor sonen der sløret er tettest. Platen kan ikke gå galt.

### 2.6 Tema

- Lyst er standard. Mørkt velges med temaknappen og lagres i `localStorage` (`kk-tema`, slik i dag).
- Uten lagret valg vises lyst, også når systemet ber om mørkt. Begrunnelse: betong, papir og refleks er identiteten, og eier valgte lyst som standard. Se ÅPNE PUNKTER.
- `theme-color` i `<head>`: `#E9EAE6` i lyst, `#12285C` i mørkt.
- `::selection`: `--refleksflate` med `--tekst-pa-refleks` (14,41:1).

---

## 3. Typografi

### 3.1 Fonter bygger skal skaffe (funn 6)

To familier, begge SIL OFL 1.1, begge selvhostet som woff2 i `public/fonts/`. Ingen kall til Google Fonts, heller ikke `preconnect`. Last ned kildene fra prosjektenes egne GitHub-utgivelser eller Google Fonts-arkivet ved bygging, aldri ved kjøring.

| Fil | Familie og akser | Subset | Forhåndslast |
|---|---|---|---|
| `public/fonts/schibsted-grotesk-var-latin.woff2` | Schibsted Grotesk, variabel, roman, `wght` instansiert til **400–700** | latin (Google-standarden: U+0000–00FF, U+0131, U+0152–0153, U+02BB–02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000–206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD) | ja |
| `public/fonts/schibsted-grotesk-var-latin-ext.woff2` | samme akser | latin-ext | nei, bare via `unicode-range` |
| `public/fonts/archivo-var-latin.woff2` | Archivo, variabel, roman, `wght` instansiert til **700–800**, `wdth` instansiert til **75–112** | latin, samme område | ja |

Vekter og bredder som brukes:

| Familie | Innstilling | Bruk |
|---|---|---|
| Schibsted Grotesk | 400 | Brødtekst, ingress, footer |
| Schibsted Grotesk | 500 | Knapper, tittelfeltet i scenen, påskrifter, merkelapp, feilmeldinger |
| Schibsted Grotesk | 700 | h2, h3, pakkenavn, «Mangler», statusord i rapporten |
| Archivo | `wght` 800, `wdth` 112 | h1 (bare én per side) |
| Archivo | `wght` 700, `wdth` 75, `tnum` | Priser i prislista og fastprisfeltet |
| Archivo | `wght` 800, `wdth` 100, `tnum` | Store tall, maks ett per skjermhøyde |

- Ingen kursiv-fil. Siden har ingen kursiv. Sitater og titler i brødtekst bruker anførselstegn.
- JetBrains Mono slettes. Ekte kode: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, bare i `<code>` og `<pre>`.
- `font-display: swap` på alle tre. Reservefonter får metrikker justert med `size-adjust`, `ascent-override` og `descent-override` slik at byttet ikke gir CLS. `bygger` regner ut verdiene fra filene (ÅPNE PUNKTER).
- Kontroller at Archivo-fila har `tnum` og æ, ø, å etter instansiering. Mangler `tnum`, settes prisene i Schibsted Grotesk 700 med `tnum`.

### 3.2 Typeskala

Rem er 16 px. Flytende størrelser går fra 390 px til 1440 px skjermbredde.

| Token | Størrelse | Linjehøyde | Familie og vekt | Bruk |
|---|---|---|---|---|
| `--tekst-liten` | `0.9375rem` (15 px) | 1.45 | Schibsted 400/500 | Footer, bildetekst, feilmelding, merkelapp, påskrift |
| `--tekst-brod` | `1.125rem` (18 px) | 1.55 | Schibsted 400 | Brødtekst, felt, knapper |
| `--tekst-ingress` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)` (20–24 px) | 1.4 | Schibsted 400 | Ingress under h1 og h2 |
| `--tekst-h3` | `1.3125rem` (21 px) | 1.25 | Schibsted 700 | h3, pakkenavn |
| `--tekst-h2` | `clamp(1.75rem, 1.2rem + 2.2vw, 2.75rem)` (28–44 px) | 1.1 | Schibsted 700 | h2 |
| `--tekst-pris` | `clamp(1.75rem, 1.3rem + 1.8vw, 3rem)` (28–48 px) | 1.0 | Archivo 700, bredde 75 | Priser |
| `--tekst-tall` | `clamp(3rem, 2rem + 4vw, 6rem)` (48–96 px) | 0.95 | Archivo 800, bredde 100 | Store tall |
| `--tekst-display` | `clamp(2.75rem, 1rem + 7.5vw, 8.5rem)` (45–136 px, 124 px ved 1440) | 0.92 | Archivo 800, bredde 112 | h1 |

- Sperring: `-0.01em` på `--tekst-display` og `--tekst-tall`, `0` ellers. Ingen versaler med sperring noe sted.
- Linjelengde: brødtekst maks `--maal-brod: 66ch`, ingress maks `--maal-ingress: 34ch`.
- h1 går over hele innholdsbredden på desktop (funn fra kritikeren: A brukte bare venstre halvdel). Bruk `text-wrap: balance` på h1 og h2.
- Ingen etikett over overskrifter. Ingen ord i en overskrift får annen farge, vekt eller stil.
- Tall før adjektiver, tusenskille med smalt hardt mellomrom (U+202F): «14 900 kr».

---

## 4. Rom, rutenett, kanter og radius

### 4.1 Avstander

| Token | Verdi | Token | Verdi |
|---|---|---|---|
| `--rom-1` | 4 px | `--rom-6` | 32 px |
| `--rom-2` | 8 px | `--rom-7` | 48 px |
| `--rom-3` | 12 px | `--rom-8` | 64 px |
| `--rom-4` | 16 px | `--rom-9` | 96 px |
| `--rom-5` | 24 px | `--rom-10` | 160 px |

Seksjonsrytme. Seksjonene skal ikke dele mal (del 6 punkt 13), så hver seksjon velger én av tre:

| Token | Mobil | Desktop | Bruk |
|---|---|---|---|
| `--rytme-tett` | 48 px | 64 px | Garantifeltet, spørsmål |
| `--rytme-vanlig` | 64 px | 96 px | De fleste |
| `--rytme-pause` | 96 px | 160 px | Rett etter scenen og før «Hvem jeg er» |

Regel: to seksjoner som ligger etter hverandre, deler ikke både bunn og rytme.

### 4.2 Rutenett

| Token | Verdi |
|---|---|
| `--sidekant` | `clamp(20px, 5vw, 72px)`. Én venstrekant for logo, h1, felt, ark og tittelfelt (funn om spriker i B og stegtekst ved 24 px i A). |
| `--bredde-side` | `1296px` (innhold), sentrert |
| `--spalteluke` | 24 px mobil og nettbrett, 32 px desktop |

Brytpunkter: mobil under 768 px (4 spalter, scenen bruker 9:16-fila), nettbrett 768–1023 px (8 spalter), desktop fra 1024 px (12 spalter).

Plassering på desktop:
- h1: spalte 1–12. Adressefelt spalte 1–6, knapp 7–9.
- Rapporten: arket i spalte 1–7, påskriftene i spalte 8–12 med målelinjer som peker inn på radene. Det fyller høyre halvdel med innhold i stedet for luft.
- Prislista: arket i spalte 1–8. Spalte 9–12 viser objektet fra scenen som stillbilde eller video for valgt pakke.

### 4.3 Kanter

| Token | Verdi | Bruk |
|---|---|---|
| `--kant-1` | 1 px | Linjer mellom rader i rapport og prisliste (i `--tekst`), toppkant på footer |
| `--kant-2` | 2 px | Alle kontroller (se 2.4), fokusring |
| `--kant-tusj` | 3 px | Overstreking av mangler, i `--mangel` |
| `--fokus-avstand` | 2 px | `outline-offset` |
| `--maalelinje-bredde` | 1,5 px | Målelinjer i SVG, i fargen `--maalelinje` |
| `--maalelinje-hylse` | 1 px | Hylse i `--ark` på hver side av målelinjen over skjermbilder |

Ingen skygger i systemet. Dybde lages med bunnfarge (betong, papir, scene), ikke med `box-shadow`.

### 4.4 Radius

| Token | Verdi | Bruk |
|---|---|---|
| `--radius-0` | 0 | Garantifeltet og andre fullbreddeflater |
| `--radius-ark` | 2 px | Ark, felt, knapper, merkelapp. Klipt papir, ikke kort. |
| `--radius-scene` | 24 px | Bare scenen og reel-dialogen. Scenen er det eneste avrundede rommet. |
| `--radius-rund` | 50 % | Radioknappens ring og prikk |

---

## 5. Bevegelsestokens

Navnene `--ut` og `--inn-ut` står som i briefen del 8, så `bevegelse` og testene kan bruke dem uendret.

| Token | Verdi | Bruk |
|---|---|---|
| `--ut` | `cubic-bezier(0.16, 1, 0.3, 1)` | Ting som kommer inn: overskriftslinjer, svar i rapporten, dialog som åpnes |
| `--inn-ut` | `cubic-bezier(0.65, 0, 0.35, 1)` | Ting som flytter seg: prisvelgerens stopp, sideovergang, overstreking |
| `--tid-svar` | 160 ms | Pekt på, trykk, fokus, radiovalg (innenfor 120–250) |
| `--tid-svar-lang` | 240 ms | Dialog, spørsmål som åpnes, overstreking tegnes (innenfor 120–250) |
| `--tid-inn` | 560 ms | Én overskriftslinje løftes inn (innenfor 400–700) |
| `--tid-inn-trinn` | 70 ms | Forsinkelse mellom linjene i samme overskrift |
| `--tid-side` | 320 ms | Sideovergang med View Transitions (innenfor 250–400) |

- Bevegelse som følger rullingen (scenen) har ingen varighet og ingen kurve.
- Bare `transform`, `opacity` og `clip-path` animeres.
- `prefers-reduced-motion: reduce` og Save-Data: alle `--tid-*` settes til `0ms`, scenen viser posteren, overskriftene står stille.
- Fast inntoning bare på h1 og h2, én gang, når de kommer i syne. Brødtekst, ark, rader, bilder og kort står stille.
- Unntak som svarer på handling: radene i rapporten fylles ut når svaret kommer (se 7.6). Det forklarer hva som endret seg, og er ikke inntoning ved rulling.

---

## 6. Bilder og video

1. **Minst 1080p.** Korteste side er minst 1080 px i kilden og i den største varianten som leveres. Mindre varianter i `srcset` er lov for små skjermer. Ingenting skaleres opp. Kontroller med `ffprobe` (video) og bildets egne mål (stillbilder) før fila legges i `public/`.
2. **Scenevideo:** 16:9 i 1920 × 1080 og 9:16 i 1080 × 1920, både `mp4` (H.264) og `webm`. Poster er første ramme som `avif` i samme mål. Kanten i klippet skal være `#080809`, så videoen går i ett med `--scene-bunn`.
3. **Stillbilder:** `<picture>` med `avif` og `webp`, `width` og `height` alltid satt, `loading="lazy"` utenom første skjerm, `decoding="async"`.
4. **Skjermbilder** er ekte og tatt i 2x. Desktop minst 1920 × 1080, mobil minst 1080 px bred. De beskjæres ikke inn i falske enhetsrammer.
5. **Arbeidstegning over skjermbilder:** målelinjen (`--maalelinje`, 1,5 px) og målepunktet kan gå inn i bildet, med 1 px hylse i `--ark` på hver side, så linjen synes mot både lyse og mørke partier. **Påskriftteksten står alltid utenfor bildet**, på ark eller bunn, i `--tekst-liten` 500 og `--maalelinje`-fargen. Påskrifter peker bare på målte verdier.
6. **Portrett** på «Hvem jeg er»: ekte foto fra eier, minst 1080 px på korteste side, uten filter. Til det finnes: `MANGLER: portrett`. Ingen KI-ansikter.
7. **KI-bilder** bare i scenen, prisvelgeren, reelen og ett nærbilde øverst på hver tjenesteside. Aldri som skjermbilde, person eller kundearbeid. Bildetekst eller kolofon: «Illustrasjon laget med KI».
8. **Case-video** (øyeblikk 3): `<video muted playsinline loop preload="none">` med poster, ekte skjermopptak fra eier. Til det finnes: `MANGLER: skjermopptak`.
9. **Ingen video hentes ved innlasting.** Målingen viste 2 890 kB første innlasting i A fordi scenen ligger 64 px under folden. Regel: scenevideoen hentes først etter brukerens første rulling, og bare når scenen er nær skjermen. Til da vises posteren. Det holder 700 kB-budsjettet med scenekanten synlig over folden.

---

## 7. Komponenter med tilstander

Tilstandene er vanlig, pekt på, fokus, aktiv, deaktivert og feil. «Finnes ikke» betyr at komponenten aldri er i den tilstanden. Det er et valg, ikke noe som er glemt.

Fokus er likt overalt med mindre noe annet står: `outline: var(--kant-2) solid var(--fokus); outline-offset: var(--fokus-avstand)`. I scenen brukes `--scene-lenke` som fokusfarge. Fokus dekkes aldri av noe annet.

Alle klikkmål er minst 24 × 24 px. Knapper og felt er 56 px høye.

### 7.1 Tekstlenke

| Tilstand | Utseende |
|---|---|
| Vanlig | `--lenke`, understrek 1 px, `text-underline-offset: 0.2em`. Ingen pil. |
| Pekt på | Understrek blir `--kant-2` tykk. |
| Fokus | Fokusring. |
| Aktiv | Som pekt på. |
| Deaktivert | Finnes ikke. En lenke som ikke virker, er tekst. |
| Feil | Finnes ikke. |

På refleks: `--tekst-pa-refleks` med understrek.

### 7.2 Hovedknapp (refleks)

Brukes til «Start befaringen» og «Book 20 minutter». Maks én per skjermhøyde.

| Tilstand | Utseende |
|---|---|
| Vanlig | Fyll `--refleksflate`, kant `--kant-2` i `--kant-refleks`, tekst `--tekst-pa-refleks` Schibsted 500 `--tekst-brod`, `--radius-ark`, 56 px høy, `padding-inline: var(--rom-6)`. |
| Pekt på | Fyll `--refleksflate-trykk` (11,74:1), `--tid-svar`, `--ut`. |
| Fokus | Fokusring utenfor kanten. |
| Aktiv | Fyll `--refleksflate-trykk`, `transform: translateY(1px)`. |
| Deaktivert | Brukes ikke. Knappen sjekker ved innsending i stedet. Trengs det likevel: fyll `--ark`, stiplet kant `--kant-2` i `--kant-kontroll`, tekst `--tekst` (17,97:1), `aria-disabled="true"`. Ingen grå. |
| Feil | Finnes ikke på knappen. Feilen vises ved feltet. |
| Arbeider | Tekst byttes til en verbform av samme handling (for eksempel «Befarer …»), `aria-busy="true"`. Ingen spinner. |

### 7.3 Sekundærknapp

Brukes til «Spill av» (reel) og «Meny».

| Tilstand | Utseende |
|---|---|
| Vanlig | Ingen fyll, kant `--kant-2` i `--kant-kontroll`, tekst `--tekst` Schibsted 500. I scenen: kant og tekst `--scene-tekst`. |
| Pekt på | Fyll `--ark`. I scenen: fyll `--refleksflate`, tekst `--tekst-pa-refleks`. |
| Fokus | Fokusring. |
| Aktiv | `translateY(1px)`. |
| Deaktivert | Finnes ikke. |
| Feil | Finnes ikke. |

### 7.4 Adressefelt og sjekk-skjema

Første skjerm. Felt og knapp er én enhet: mobil under hverandre, desktop side om side.

Oppbygging: synlig `<label>` over feltet (Schibsted 500, `--tekst-brod`), `<input type="text" inputmode="url" autocomplete="url">`, hovedknapp, og et feilområde under med `aria-live="polite"`. Uten JavaScript sender skjemaet en vanlig GET til `/sjekk` med samme parameter som dagens `UrlCheck`. Med JavaScript går svaret til befaringsrapporten (7.6), og siden ruller dit.

| Tilstand | Utseende |
|---|---|
| Vanlig | Fyll `--felt`, kant `--kant-2` i `--kant-kontroll`, `--radius-ark`, 56 px høy, tekst `--tekst`. Plassholder i `--tekst-plass` (6,61 / 6,11:1), for eksempel «dinbedrift.no». |
| Pekt på | Ingen endring utenom tekstpeker. Feltet er allerede tydelig. |
| Fokus | Fokusring. Plassholderen blir stående til noe skrives. |
| Aktiv (sender) | Feltet får `readonly`, knappen viser arbeidstilstand, rapporten tar over. |
| Deaktivert | Finnes ikke. |
| Feil | Kant i `--mangel`, `aria-invalid="true"`, `aria-describedby` til feilmeldingen. Meldingen står under feltet i `--mangel`, Schibsted 500 `--tekst-liten`, og sier hva som er galt og hvordan det rettes. Ordlyden eies av `tekstforfatter`. |

### 7.5 Fastprisfelt

Nederst i befaringsrapporten. Refleksflate uten kant (den er ikke en kontroll), `--radius-0` innenfor arket. Pris i `--tekst-pris`, lest fra `src/data/priser.ts`. Hovedknappen «Book 20 minutter» står i feltet, og her får den sin blekkant mot refleks (14,41:1). Ingen tilstander utover knappens.

### 7.6 Befaringsrapporten

Et ark i A4-proporsjon (1 : 1,414 på desktop, fri høyde på mobil). Forhåndsutfylt med målingen av kodekonsulentene.no. Når besøkende kjører sjekken, fylles det ut på nytt med deres svar.

Oppbygging: hode (adressen som er befart og datoen), rader, fastprisfelt. Hver rad: hva som er sjekket (Schibsted 700), statusord, målt verdi, og eventuelt én setning. Rader skilles med `--kant-1` i `--tekst`. Raden er en `<li>` i en `<ol>`, for rekkefølgen er sjekkens rekkefølge. Ingen nummer vises.

Status vises alltid med ord, aldri bare med farge:

| Radtilstand | Utseende |
|---|---|
| Venter | «Fylles ut når du kjører befaringen.» i `--tekst`. Ingen tomme linjer (funn fra kritikeren). |
| Arbeider | «Sjekker …» i `--tekst`, arket har `aria-busy="true"`. |
| Bestått | Statusordet «Bestått» i `--tekst` 700 og den målte verdien. På desktop peker en påskrift i spalte 8–12 på verdien. |
| Mangler | Det forventede står overstreket med `--kant-tusj` i `--mangel`, og ordet «Mangler» i `--mangel` 700. Streken tegnes med `clip-path` fra venstre til høyre på `--tid-svar-lang`, `--inn-ut`. |
| Ikke sjekket | «Ikke sjekket» i `--tekst` 700 og én setning om hvorfor (æresregelen). Aldri vist som bestått. |
| Feil (hele sjekken) | Hodet sier at befaringen ikke ble fullført og hvorfor. Radene står som «Ikke sjekket». Ingen gamle svar blir stående. |

Mens svarene kommer, får hver rad sin nye tekst med `opacity` 0→1 på `--tid-svar` og `--ut`. Svarene annonseres samlet når arket er ferdig, ikke rad for rad. Pekt på, fokus, aktiv og deaktivert finnes ikke på arket. Lenker i det følger 7.1.

### 7.7 Scenen

Bygges med `<Scene>` fra del 8. Det eneste avrundede rommet: `--scene-bunn`, `--radius-scene`, åpner seg til full bredde mens du ruller. På mobil fyller den `100svh` (funn fra kritikeren).

Tittelfeltet: én tett plate i `--scene-bunn`, opasitet 1, `--radius-ark`, 1 px kant i `--scene-tekst`, nederst til venstre ved `--sidekant`. Tekst i `--scene-tekst`, steg-tittel Schibsted 700 `--tekst-h3`, steg-tekst Schibsted 500 `--tekst-brod`. Maks bredde 36ch. Teksten slutter før flaten slipper skjermen. Uten JavaScript, med redusert bevegelse eller Save-Data, står stegene som en vanlig liste under posteren, med samme venstrekant og `--tekst-h2` som resten av siden (funn fra kritikeren).

| Tilstand | Utseende |
|---|---|
| Vanlig (poster) | Posteren vises. Ingen video er hentet. |
| Pekt på | Finnes ikke. Scenen er ikke en kontroll. |
| Fokus | Hopp-lenken «Hopp over animasjonen» er første Tab-stopp i scenen og blir synlig ved fokus, i `--scene-lenke`. |
| Aktiv (følger rullingen) | Videoen følger rullingen, tittelfeltet bytter innhold per steg. |
| Deaktivert (redusert bevegelse, Save-Data, uten JS) | Poster og stegliste, ingen video hentet. |
| Feil (videoen laster ikke) | Posteren blir stående, tittelfeltet virker som før. Ingen feilmelding. |

### 7.8 Prislista og prisvelgeren

Prislista fra C, flyttet inn i A. **Prislista er prisvelgeren**: hver rad er en radioknapp, så hver pris står bare én gang på siden (funnet om gjentakelser i C).

Ark i `--ark`, spalte 1–8 på desktop. Rad: radioknapp, pakkenavn (`--tekst-h3`), pris (`--tekst-pris`, høyrejustert med `tnum`, så kronebeløpene står under hverandre), én linje om hva som er med. Rader skilles med `--kant-1`. Ingen prikkelinjer. Under rader: vilkårslinja med mva-setningen fra `priser.ts`. Det er det eneste stedet den står på forsiden. Det som ikke er med i en pakke, står som «Ikke med» i `--tekst`, aldri i rødt.

| Tilstand | Utseende |
|---|---|
| Vanlig | Ring 24 px, `--kant-2` i `--kant-kontroll`, ingen prikk. Raden på `--ark`. |
| Pekt på | Raden får `--kant-2` venstrekant i `--tekst`. Ingen halvgjennomsiktig prikk i ringen. |
| Fokus | Fokusring rundt hele raden. |
| Aktiv (valgt) | Raden fylles med `--refleksflate`, kant `--kant-2` i `--kant-refleks`. Ring og prikk i `--blekk` **i begge temaer** (funnet om hvit ring på lime i C). Scenens objekt spoles til pakkens stoppunkt (`--inn-ut`). |
| Deaktivert | Finnes ikke. |
| Feil | Finnes ikke. Ett valg er alltid gjort: Start er valgt ved innlasting. |

Uten JavaScript er det en vanlig prisliste med Start valgt.

### 7.9 Garantifeltet

Står én gang, i full bredde. `--refleksflate`, `--radius-0`, `--rytme-tett`, tekst `--tekst-pa-refleks` i `--tekst-h2`. Ingen kant, ingen knapp. Ingen tilstander.

### 7.10 Merkelapp

Ærlige merkelapper: «Ikke et levert oppdrag», «Konsept, ikke oppdrag», «Illustrasjon laget med KI». `--refleksflate`, tekst `--tekst-pa-refleks` Schibsted 500 `--tekst-liten`, `--radius-ark`, `padding: var(--rom-1) var(--rom-2)`. Vanlig skrift, ikke versaler. Ingen kant (ikke kontroll). Ingen tilstander.

### 7.11 Case (Arbeid)

Ekte arbeid i store flater, ikke rutenett av like kort. Hver case: skjermopptak eller skjermbilde, tittel (`--tekst-h2`), én setning, tall eier kan dokumentere, merkelapp der den gjelder. Hele casen er én lenke.

| Tilstand | Utseende |
|---|---|
| Vanlig | Poster. |
| Pekt på (desktop) | Skjermopptaket spiller. Tittelen får understrek. Ingen peker-etikett (avgjort ved PORT 1). |
| Fokus | Fokusring rundt casen. Opptaket spiller, som ved pekt på. |
| Aktiv | Følger lenken. |
| Deaktivert | Finnes ikke. |
| Feil | Opptaket laster ikke: posteren står. |

På mobil spiller opptaket når casen er i syne. Redusert bevegelse: bare poster.

### 7.12 Tjenestelenker («Det jeg bygger»)

Tre store tekstlenker i `--tekst-h2`, ikke kort og ikke nummerert. Under hver: én linje i `--tekst-brod`. Tilstandene følger 7.1.

### 7.13 «Slik går det»

Ekte datoer regnet fra dagens dato. Ark i full bredde. Datoen er rekkefølgen, så ingen nummer. Dato i Schibsted 700, hva som skjer i 400. Ingen tilstander.

### 7.14 Spørsmål

`<details>` og `<summary>`. Spørsmålet i Schibsted 700 `--tekst-h3`, svaret i `--tekst-brod`.

| Tilstand | Utseende |
|---|---|
| Vanlig | Lukket, `--kant-1` under. Et pluss tegnet i SVG til høyre. |
| Pekt på | Spørsmålet får understrek. |
| Fokus | Fokusring rundt `<summary>`. |
| Aktiv (åpen) | Pluss roteres 45° på `--tid-svar-lang`, `--inn-ut`. Svaret vises uten inntoning. |
| Deaktivert | Finnes ikke. |
| Feil | Finnes ikke. |

### 7.15 Toppmeny og temaknapp

Logo, «Meny»-knapp på mobil (sekundærknapp), lenker på desktop, temaknapp. Tilstander som 7.1 og 7.3. Gjeldende side: understrek `--kant-2` og `aria-current="page"`. Temaknappen er en `<button aria-pressed>` med navnet «Mørkt tema». Logoen får `view-transition-name: kk-logo` og glir over på `--tid-side` med `--inn-ut`.

Logoen: `kk-lockup-light.svg` i lyst tema og `kk-lockup-dark.svg` i mørkt, som i v1. KK-flisen i lime mot betong er 1,07:1. Logoer er unntatt kontrastkravet, men se ÅPNE PUNKTER.

### 7.16 Footer (lovpålagt)

Siste blokk på hver side, på `--ark`, med `--kant-1` i `--tekst` som toppkant. Alt fra `src/data/firma.ts`, ingenting skrevet av.

Innhold, i denne rekkefølgen:
1. Registrert foretaksnavn (foretaksnavnloven § 2-2). Det eneste stedet navnet står.
2. Org.nr.
3. Adresse.
4. E-post som `mailto:`-lenke.
5. Lenker: Personvern (`/personvern`) og Vilkår (`/vilkar`).
6. «Denne siden bruker ikke cookies» (`firma.cookieNote`).
7. Kolofon: «Illustrasjoner i scenene er laget med KI.»

Tekst `--tekst-liten` 400 i `--tekst` (15,40:1 lyst, 11,15:1 mørkt). Ingen grå. Lenkene bryter over flere linjer med `flex-wrap`, så det aldri blir vannrett rulling ved 320 px (funnet om WCAG 1.4.10 i C). Hver lenke har minst 24 px klikkhøyde. Lenketilstander som 7.1. Footeren har ingen deaktivert- eller feiltilstand.

### 7.17 Reel-dialog

`<dialog>` med `<video controls>` som lastes først ved klikk på «Spill av». `--scene-bunn`, `--radius-scene`. Åpnes med `opacity` og `transform: scale(0.98)` → 1 på `--tid-svar-lang`, `--ut`. Lukkeknapp er sekundærknapp i scenevariant og får fokus når dialogen åpnes. Esc lukker. Fokus går tilbake til «Spill av».

### 7.18 Hopp til innhold

Første Tab-stopp på hver side. Skjult til fokus, da `--refleksflate` med `--kant-refleks` øverst til venstre ved `--sidekant`.

---

## 8. Forsidens bunner og rytme

| Blokk | Bunn | Rytme |
|---|---|---|
| Tilbudet (h1, adressefelt) | `--bunn` | vanlig |
| Scenen | `--scene-bunn` | ingen, scenen styrer selv |
| Rapporten | `--bunn` med ark | pause |
| Arbeid | `--ark` i full bredde | vanlig |
| Garantien | `--refleksflate` i full bredde | tett |
| Det jeg bygger | `--bunn` | pause |
| Prislista | `--bunn` med ark | vanlig |
| Slik går det | `--ark` i full bredde | vanlig |
| Hvem jeg er | `--bunn` | pause |
| Spørsmål | `--ark` i full bredde | tett |
| Kontakt | `--bunn` | vanlig |
| Footer | `--ark` | tett |

---

## 9. Tokens slik `bygger` skriver dem

Bare dette står i `src/styles/tokens.css`. Komponentene bruker rolletokens og skalaene, aldri råfargene eller hex.

```css
:root {
  /* Råfarger. Brukes bare i denne fila. */
  --betong: #E9EAE6;
  --papir: #FBFBF9;
  --blekk: #111315;
  --refleks: #C8F24A;
  --refleks-trykk: #B4DC3A;
  --snorbla: #2443E0;
  --mangelrod: #B3301B;
  --plass-lys: #565B61;
  --scene: #080809;
  --blakopi: #12285C;
  --blakopi-ark: #1B3672;
  --krittbla: #A8B8FF;
  --signalrod: #FF9B85;
  --plass-mork: #B4BCD6;

  /* Roller, lyst tema (standard) */
  --bunn: var(--betong);
  --ark: var(--papir);
  --tekst: var(--blekk);
  --lenke: var(--snorbla);
  --maalelinje: var(--snorbla);
  --fokus: var(--snorbla);
  --mangel: var(--mangelrod);
  --felt: var(--papir);
  --tekst-plass: var(--plass-lys);
  --kant-kontroll: var(--blekk);

  /* Roller, like i begge temaer */
  --refleksflate: var(--refleks);
  --refleksflate-trykk: var(--refleks-trykk);
  --tekst-pa-refleks: var(--blekk);
  --kant-refleks: var(--blekk);
  --scene-bunn: var(--scene);
  --scene-tekst: var(--papir);
  --scene-lenke: var(--krittbla);

  /* Fonter */
  --font-tekst: "Schibsted Grotesk", "Schibsted Grotesk reserve", system-ui, sans-serif;
  --font-karakter: "Archivo", "Archivo reserve", "Arial Narrow", sans-serif;
  --font-kode: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* Typeskala */
  --tekst-liten: 0.9375rem;
  --tekst-brod: 1.125rem;
  --tekst-ingress: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
  --tekst-h3: 1.3125rem;
  --tekst-h2: clamp(1.75rem, 1.2rem + 2.2vw, 2.75rem);
  --tekst-pris: clamp(1.75rem, 1.3rem + 1.8vw, 3rem);
  --tekst-tall: clamp(3rem, 2rem + 4vw, 6rem);
  --tekst-display: clamp(2.75rem, 1rem + 7.5vw, 8.5rem);
  --maal-brod: 66ch;
  --maal-ingress: 34ch;

  /* Rom */
  --rom-1: 4px;  --rom-2: 8px;  --rom-3: 12px; --rom-4: 16px; --rom-5: 24px;
  --rom-6: 32px; --rom-7: 48px; --rom-8: 64px; --rom-9: 96px; --rom-10: 160px;
  --rytme-tett: 48px;
  --rytme-vanlig: 64px;
  --rytme-pause: 96px;
  --sidekant: clamp(20px, 5vw, 72px);
  --bredde-side: 1296px;
  --spalteluke: 24px;

  /* Kanter og radius */
  --kant-1: 1px;
  --kant-2: 2px;
  --kant-tusj: 3px;
  --fokus-avstand: 2px;
  --maalelinje-bredde: 1.5px;
  --maalelinje-hylse: 1px;
  --radius-0: 0;
  --radius-ark: 2px;
  --radius-scene: 24px;
  --radius-rund: 50%;

  /* Bevegelse (navn som i briefen del 8) */
  --ut: cubic-bezier(0.16, 1, 0.3, 1);
  --inn-ut: cubic-bezier(0.65, 0, 0.35, 1);
  --tid-svar: 160ms;
  --tid-svar-lang: 240ms;
  --tid-inn: 560ms;
  --tid-inn-trinn: 70ms;
  --tid-side: 320ms;
}

@media (min-width: 1024px) {
  :root {
    --rytme-tett: 64px;
    --rytme-vanlig: 96px;
    --rytme-pause: 160px;
    --spalteluke: 32px;
  }
}

[data-tema="mork"] {
  --bunn: var(--blakopi);
  --ark: var(--blakopi-ark);
  --tekst: var(--papir);
  --lenke: var(--krittbla);
  --maalelinje: var(--krittbla);
  --fokus: var(--krittbla);
  --mangel: var(--signalrod);
  --felt: var(--blakopi-ark);
  --tekst-plass: var(--plass-mork);
  --kant-kontroll: var(--papir);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --tid-svar: 0ms;
    --tid-svar-lang: 0ms;
    --tid-inn: 0ms;
    --tid-inn-trinn: 0ms;
    --tid-side: 0ms;
  }
}
```

Temaattributtet: hvis dagens temaskript bruker et annet attributt eller en annen klasse, beholder `bygger` det og bytter bare selektoren. Save-Data kan ikke leses i CSS. `bevegelse` setter `data-spar="1"` på `<html>` og gjentar de samme `0ms`-verdiene under den selektoren.

---

## 10. Byttetest

Dekk til logoen: betong og papir med blekk, refleksfelt med blekkant, snorblå målelinjer som peker på målte verdier, en befaringsrapport i A4 og et tittelfelt fra arbeidstegningen. Mørkt tema er en blåkopi, ikke et nesten svart utviklertema. Alt kommer fra befaringen som arbeidsgang. Bestått på papiret. `kritiker` avgjør på skjermbildene.

---

## 11. Opphevet fra v1

Fra briefen del 12, og det som følger av dem i repoet (kartlegging del 4):

| v1-regel | Hvor den bor i dag | Erstattes av |
|---|---|---|
| Nummerert eyebrow (`// 03`) over hver blokk | `Eyebrow.astro`, `Scene.astro:43`, `Section.astro:21`, `ContactBlock.astro:22`, `docs/brandbok.md:19`, `docs/sidemonstre.md:21,44` | Ingen etikett over overskrifter |
| Mono-etiketter i versaler (`.mono-label`, `.mega-blokk__merke` m.fl.) | `tokens.css:82-84`, `typo.css`, `components.css:11` | Schibsted 500, vanlig skrift |
| Mono til tall og priser, JetBrains Mono som webfont | `docs/brandbok.md:56`, `fonter.css` | Archivo med `tnum`. Mono bare i ekte kode, systemfont |
| «→» etter lenketekst | `Button.astro:20,29`, `ServiceCard.astro:17`, `Pekerkort.astro:49` m.fl. | Understreket lenke uten tegn |
| Ett uthevet ord i overskrifter | `index.astro:84`, `site.css:347`, `Mega.astro:23,52`, `typo.css:130-132` | Hele overskriften i én farge og ett snitt |
| Fast blokkoppsett på alle sider, samme 96 px luft | `docs/sidemonstre.md`, `scener.css:12,109-114` | Tre rytmer og vekslende bunner (del 4 og 8) |
| Mørkt som påtvunget standard (`#0b0d10` og lime) | `tokens.css:2-25`, `Base.astro:121` | Lyst standard, mørkt som blåkopi |
| Forbud mot video | v1-skillen | Video i scener og case, regler i del 6 |
| Forbud mot bevegelse utover mikrointeraksjoner | v1-skillen | De seks øyeblikkene og del 5 her |
| Forbud mot KI-bilder | v1-skillen, `CLAUDE.md` | Tillatt bare i scener, merket |
| Tjenestekort nummerert 01–03 | `tjenester.ts:8,16,24`, `ServiceCard.astro` | Store tekstlenker uten nummer |
| «eks. mva» ved priser | v1-skillen | Mva-setningen fra `priser.ts`, én gang |
| `preconnect` til Google Fonts | v1-skillen | Selvhostet woff2, del 3.1 |
| Status med `-soft`-toner og fargekoder `ok`/`warn`/`fail` | `docs/brandbok.md:40` | Statusord i rapporten, 7.6 |
| Åpningsoverlegget | `Apning.astro`, `Base.astro:69,135` | Fjernes. Ingen innlastingsskjerm |

Gjelder fortsatt: logoen, lovkravene i footeren, ytelsesbudsjettet, forbudet mot bento, mesh-gradienter, glassmorphism, stockfoto, 3D, WebGL og scroll-jacking.

---

## ÅPNE PUNKTER

1. **Tema uten lagret valg:** systemet viser lyst også når OS ber om mørkt. Eier bekrefter, eller det byttes til å følge `prefers-color-scheme`.
2. **Reservefont-metrikker** (`size-adjust` m.fl.) og om Archivo-fila har `tnum`, æ, ø og å etter instansiering: `bygger` måler i fila. Fontlisensene (OFL 1.1) føres i `assets/LICENSES.md`.
3. **Videohenting etter første rulling** (6.9) er en endring i `<Scene>`, som `bevegelse` eier. Uten den brytes 700 kB-budsjettet (målt 2 890 kB i A).
4. **Logo på betong:** KK-flisen i lime er 1,07:1 mot betong. Unntatt kravet, men den kan forsvinne. `kritiker` vurderer på skjermbildene om lockup-light trenger en blekkant rundt flisen.
5. **`docs/sidemonstre.md` og `CLAUDE.md`** krever fortsatt eyebrow på hver blokk og forbyr KI-bilder. De må oppdateres av den som eier dem, ellers følger agenter v1.

---

## Vedlegg: relativ luminans (beregnet)

| Farge | L | Farge | L |
|---|---|---|---|
| betong `#E9EAE6` | 0,8188 | blåkopi `#12285C` | 0,0242 |
| papir `#FBFBF9` | 0,9634 | blåkopi-ark `#1B3672` | 0,0409 |
| blekk `#111315` | 0,0064 | krittblå `#A8B8FF` | 0,4983 |
| refleks `#C8F24A` | 0,7628 | signalrød `#FF9B85` | 0,4640 |
| refleks-trykk `#B4DC3A` | 0,6120 | plass-mørk `#B4BCD6` | 0,5052 |
| snorblå `#2443E0` | 0,0977 | scene `#080809` | 0,0025 |
| mangelrød `#B3301B` | 0,1178 | plass-lys `#565B61` | 0,1032 |

Forhold = (L lysest + 0,05) / (L mørkest + 0,05).
