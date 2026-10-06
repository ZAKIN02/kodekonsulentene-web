# Målinger: typisk småbedriftsside mot vår egen

Nettstedet forklarte lenge hva vi gjør med bilder av materiale. En aluminiumsstabel
sier ingenting til en rørlegger. Et tall han kan etterprøve gjør det.

Dette dokumentet er metoden bak `src/components/ForOgEtter.astro`. Regelen fra
`docs/metode-skanning.md` gjelder: **publiser metoden sammen med tallene. Et tall
uten metode er det samme som konkurrentenes tall vi selv nekter å sitere.**

## Hva som ble målt

| | Typisk side | Denne siden |
|---|---|---|
| Sikkerhetsheadere | 1 av 6 | 6 av 6 |
| Cookies før samtykke | 1 | 0 |
| Universell utforming | 1 feil | se under |
| Org.nr. på siden | mangler hos 66 % | står der |
| Svartid (TTFB) | 264 ms | 127 ms |
| Sum | 30 av 100 | 90 av 100 |

Andeler i utvalget:

- **100 %** mangler minst én sikkerhetsheader. Ingen hadde alle seks.
- **79 %** setter minst én cookie før samtykke.
- **63 %** laster en sporer før noen har sagt ja.
- **66 %** mangler organisasjonsnummer på siden.
- **68 %** har minst én maskinelt påvisbar WCAG-feil.

## Utvalget

Trukket fra **Enhetsregisteret**, ikke håndplukket. Et håndplukket utvalg beviser
bare at man klarte å finne dårlige sider.

- Næringskoder: rørlegger (43.221), elektriker (43.210), snekker (43.320),
  tannhelse (86.230).
- Filter: **1–20 ansatte** registrert i Enhetsregisteret, ikke konkurs, ikke under
  avvikling, og med registrert hjemmeside.
- Størrelsesfilteret kom til etter første kjøring, der bemanningsbyråer og
  kiosk-kjeder havnet i utvalget. De er ikke dem vi selger til.
- Trekningen er **deterministisk**: kandidatene sorteres på organisasjonsnummer og
  det tas hver n-te. Samme kjøring gir samme utvalg.
- 80 unike domener, 45 trukket, **38 målt**. Én side stengte oss i `robots.txt`,
  seks svarte ikke.

Hvert domene telles én gang, og bare forsiden hentes.

## Slik ble det kjørt

```
node .skudd/maaling-skann.mjs --antall 45   # bransjen → src/data/maalinger.json
node .skudd/maaling-egen.mjs                # vår egen side → samme fil, under «oss»
```

Begge bruker **samme analysemotor** som verktøyet kundene selv kjører
(`src/lib/sjekk.ts`). Det er hele poenget: skriver man inn sine egne tall for
hånd, sammenligner man en måling med en påstand.

Skanningen følger `docs/metode-skanning.md`: `robots.txt` respekteres, User-Agent
sier hvem vi er og hvor man klager, og det går minst 1,1 sekund mellom hvert treff.

## Hvorfor «svarte ikke» er skilt fra «stengt av robots»

Første versjon meldte begge som «robots.txt kunne ikke hentes». Det var feil: DNS
som ikke slår opp, eller en vert som ikke svarer, er noe helt annet enn en side som
nekter oss adgang. Nå telles de hver for seg, og begge tallene står i rapporten.

## Rådata lagres aldri i repoet

Repoet er offentlig. `docs/metode-skanning.md` sier at vi **aldri navngir en bedrift
med dårlig resultat** — ikke i rapporter, ikke på LinkedIn, ikke noe sted. Derfor:

- `src/data/maalinger.json` inneholder **bare aggregerte tall**. Ingen domenenavn.
- Rådata med domenenavn skrives til `$TMPDIR`, utenfor repoet, og er ment å slettes.

## Vår egen uu-score er sperret

`analyserUu` leser statisk HTML. Den kan **ikke se kontrast**. Vår egen forside
strøk nylig på ni kontrastbrudd mens den statiske sjekken sa null — altså er «0 feil»
derfra ikke et bevis på noe.

`maaling-egen.mjs` kjører derfor **axe i ekte nettleser**, i begge temaer, med
`prefers-reduced-motion` på (ellers måler axe midt i en inntoning og rapporterer
mellomfarger som brudd). Feltet `oss.bestaar` er `true` bare når **begge**
målingene er enige, og komponenten viser oss som rene bare da.

**Status 6. oktober 2026:** produksjon har **4 kontrastbrudd** i terminalblokken
(`.kk-ok`, `.kk-warn`, `.kk-fail` mot `#060708` i lyst tema). Rettingen er committet
og det lokale bygget er rent — den er bare ikke deployet. Komponenten viser derfor
«4 feil» om oss selv, i rødt, med forklaring. Når rettingen er ute, kjør
`maaling-egen.mjs` på nytt, så snur raden av seg selv.

Det er meningen at det skal gjøre vondt å se. Alternativet er å vise et nulltall vi
ikke har dekning for, på siden som selger etterlevelse.

## Forbehold som står i komponenten

- Forsiden hentes én gang, uten å kjøre JavaScript. Cookies som settes av skript
  etterpå er ikke med, så tallet er et **minimum**.
- Kontrast, tastaturnavigasjon og skjermleserflyt kan ikke måles maskinelt av den
  statiske sjekken.
- Utvalget er foretak som **har registrert hjemmeside** i Enhetsregisteret. Foretak
  uten registrert adresse er ikke med, og utvalget er derfor ikke representativt for
  bransjen som helhet.
- Sider som stengte oss eller ikke svarte, teller ikke.

## Hvor komponenten hører hjemme

Jeg eier ingen sidefiler, så den er ikke plassert. Anbefalt rekkefølge:

1. **`/sjekk`** — sterkest. Siden selger nettopp denne sjekken, og tallene er
   resultatet av å kjøre den. Komponenten hører rett over eller under
   `Slepesammenligning`, som viser det samme for én enkelt side.
2. **Forsiden**, i seksjonen som i dag argumenterer for hvorfor dette er et problem.
   Fire målte andeler gjør jobben bedre enn en påstand.
3. **`/sikkerhet`** — der headerraden og cookieraden er mest relevante.

Den passer **ikke** på `/priser` eller `/om`, som handler om noe annet.

## Når tallene bør måles på nytt

Datoen står i komponenten, så et gammelt tall avslører seg selv. Kjør skanningen på
nytt hvert halvår, eller når noen spør om tallene fortsatt stemmer. Kjør
`maaling-egen.mjs` etter hver deploy som rører farger, headere eller cookies.
