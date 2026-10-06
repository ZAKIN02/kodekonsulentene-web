# Opptak av egne verktøy

## Hvorfor

En visuell gjennomgang (`docs/syn2.md`) fant at **19 av 21 medieelementer viser
det samme genererte objektet** – en stabel aluminiumsplater på nesten svart.
Hvert bilde er godt for seg, men gjentatt nitten ganger slutter det å si noe:
bytter du underside, skifter teksten, mens bildet ser likt ut.

Brandboken rangerer dessuten ekte materiale høyest. Prinsipp 1 er «Vis, ikke
påstå … ekte skjermbilder, et verktøy som faktisk kjører», og det eneste
materialet på nettstedet som virkelig overbeviser er opptaket av sjekken som
kjører mot nkom.no på `/verktoy`.

Dette er mer av det.

## Hva som ble laget

| Opptak | Varighet | 1920 | Hva det beviser |
|---|---|---|---|
| `rontgen` | 8 s | 2,01 MB · 2,11 Mbit/s | At vi faktisk kan lese hva som ligger under en side |
| `priskalkulator` | 9 s | 5,25 MB · 4,89 Mbit/s | At prisen er en utregning med poster, ikke et forhandlingsutspill |
| `dmarc` | 9 s | 6,02 MB · 5,61 Mbit/s | At verktøyet gjør et reelt DNS-oppslag |

Alle i 1920, 1280 og 960 med AVIF-plakat. CRF 19 og `-g 8`, som de genererte
scenene. Dimensjonene i `src/data/opptak.json` er målt med `ffprobe` etter at
filene er laget – aldri skrevet for hånd, fordi en håndskrevet dimensjon på
logoen ga CLS 0,145 i produksjon.

## Hvorfor bildesekvens og ikke `recordVideo`

1. Klippene spoles av scroll. Brukeren stopper på enkeltrammer og leser dem som
   stillbilder, så stillbildekrav gjelder. `recordVideo` gir variabel
   bildefrekvens og ujevn tidsakse.
2. Pekerposisjon og avkryssing settes **per ramme**, så opptaket er
   determenistisk og kan kjøres om igjen med identisk resultat.
3. Vi tar opp på dobbel pikseltetthet (3200×1800) og skalerer ned. Det gir
   merkbart skarpere skjermtekst enn en 1:1-innspilling.

## Hvor de bør plasseres

Jeg eier ikke sidefilene, så dette er anbefalinger:

- **`rontgen` → `/sikkerhet`.** Den er sidens signaturinteraksjon og viser
  bokstavelig talt det siden selger. `Rontgen.astro` har aldri blitt plassert
  utenfor `/lab`; et opptak virker også der komponenten ikke passer inn.
- **`priskalkulator` → `/priser`**, over prislisten. Den viser at prisen er en
  utregning med poster, før leseren ser tallene.
- **`dmarc` → `/verktoy/dmarc`**, og eventuelt `/sikkerhet`. Den er det korteste
  beviset på at verktøyene gjør reelle oppslag.

Bruk `Demo.astro`, ikke `SceneFilm`. `Demo` rammer opptaket med hårlinje og
radius, slik brandboken krever for skjermbilder, og har bildetekst med kildedato.
`SceneFilm` toner video ned som bakgrunn – det leser som tapet, ikke som bevis.
Komponenten tar `smal`, `bred`, `plakat`, `tekst` og `kilde`; verdiene ligger
ferdig i `src/data/opptak.json`.

`Demo` støtter i dag bare `smal` og `bred`. 1920-filene blir liggende ubrukt til
komponenten får et `stor`-trinn, slik `SceneFilm` og `HeroFilm` har fått.

## To feil som ble funnet ved å se på resultatet

**DMARC-opptaket slo først opp feil domene.** Tidsaksen skrev `n = floor((a /
0,45) × lengde)` og sendte ved `a ≥ 0,45`, så siste tegn ble aldri skrevet.
Oppslaget gikk mot `nkom.n`, et domene som ikke finnes, og rapporten viste «SPF:
BRUDD, mangler». Bildeteksten ville påstått et ekte oppslag mot nkom.no. Hele
strengen skrives nå ferdig, og verdien verifiseres før Enter.

**To bildetekster overdrev.** Den første for kalkulatoren sa at tallet er «den
samme utregningen du får i et tilbud» – mens siden selv sier «Et estimat er et
spenn. Et tilbud er et tall». Den for røntgen slo sammen sikkerhetsheadere (ekte
svar fra serveren) og WCAG-punkter (kravene siden måles mot) som om begge var
funn på siden. Begge er rettet.

## Kjøring

```
node scripts/opptak.mjs --liste
node scripts/opptak.mjs rontgen                  # mot lokal server på 4493
node scripts/opptak.mjs dmarc --base https://kodekonsulentene.no
node scripts/opptak.mjs rontgen --behold         # behold rammene for feilsøk
```

Opptak som avhenger av skanner-tjenesten (`uu-sjekk`, `cookie-sjekk`) er ikke
laget. Lokalt degraderer de ærlig til «Skanneren er ikke satt opp ennå», og det
er riktig oppførsel, men det er ikke materiale som selger. De bør tas opp mot
produksjon når tjenesten svarer.
