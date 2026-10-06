# Gratisverktøyene

Verktøyene er sidens viktigste salgsargument. De viser at vi kan jobben i stedet
for å påstå det, og de gir folk en grunn til å lenke hit.

Regelen fra `src/lib/sjekk.ts` gjelder alle sammen: **et verktøy skal aldri påstå
mer enn det har målt.** Det som ikke er sjekket, får status «ikke sjekket» og en
setning om hvorfor. En falsk «bestått» er verre enn ingen sjekk.

## Oversikt

| Verktøy | URL | Motor | Status |
|---|---|---|---|
| Nettsidesjekk | `/sjekk` | `src/lib/sjekk.ts` + `src/lib/hent.ts` | Live |
| Priskalkulator | `/verktoy/priskalkulator` | `src/lib/priskalkyle.ts` | Live |
| E-postsikkerhet | `/verktoy/dmarc` | `src/lib/dns.ts` | Live |
| Cookie-sjekk | `/verktoy/cookie-sjekk` | Egen skannertjeneste | Under arbeid |
| Universell utforming | `/verktoy/uu-sjekk` | Egen skannertjeneste | Under arbeid |

Samlesiden `/verktoy` lenker bare til dem som faktisk virker. Et kort uten lenke
er et verktøy som ikke er ferdig.

## Priskalkulator

**Hva den gjør.** Fire spørsmål – sider, CMS, integrasjoner, app – gir et prisspenn
med hver linje synlig.

**Hvorfor den er bygget sånn.** SERP-en for «hva koster en nettside» er full av
tabeller fra byråer. Det eneste som skiller oss er at forutsetningene er synlige:
hvilken pakke, hvilke timeanslag, hvilken timepris, og hva som ikke er med.

To ting som ikke må skli:

1. **Prisene leses fra `src/data/priser.ts`.** De skrives aldri inn på nytt i
   kalkulatoren. `test/priskalkyle.test.ts` sjekker at pakkeprisene følger
   prislisten, så en endring ett sted ikke kan gi to forskjellige tall.
2. **Timeanslagene er anslag, ikke målinger.** De står merket som det overalt de
   vises. Får vi ekte tall fra leverte prosjekter, erstatter vi anslagene og
   fjerner merkingen – ikke før.

**Markedstallene** ligger i `src/data/markedspriser.ts`, hver med kilde-URL og
«sist sjekket»-dato. De er andres priser og merket som det. Gjennomgå dem
kvartalsvis: et markedstall uten fersk dato er verdiløst i en kalkulator.

## E-postsikkerhet (SPF, DKIM, DMARC)

**Hva den gjør.** Tre DNS-oppslag over DNS-over-HTTPS. Ingen e-post sendes.

**Det viktigste designvalget:** `p=none` er en advarsel, ikke en bestått sjekk.
Det er den vanligste feilen – DMARC-posten finnes, så alt *ser* riktig ut, men
falsk e-post i bedriftens navn blir levert som normalt. Et verktøy som bare
sjekker om posten finnes, gir folk falsk trygghet.

**Oversettelsen er poenget.** «DMARC p=none» betyr ingenting for en bedriftseier.
«Noen kan sende faktura i ditt navn, og du får ikke beskjed» gjør det.

**Status på vårt eget domene per 6. oktober 2026:** SPF er på plass med `~all`,
DMARC mangler helt, og DKIM er ikke publisert på `google`-selektoren. Vi selger
denne sjekken, så den bør ordnes før den markedsføres. Se `docs/sjekklister/lansering.md`.

## CLI og GitHub Action

`packages/cli` og `packages/norsk-lovsjekk-action` kaller det publiserte API-et i
stedet for å pakke med analysen.

**Begrunnelsen:** det finnes én motor. Terminal, nettside og CI gir samme svar, og
en rettelse virker overalt uten at noen oppgraderer en pakke.

**Kostnaden:** verktøyene trenger nettverk ut til oss, og vi ser hvilke adresser
som sjekkes. Det står i begge README-ene – ikke skjul det.

Begge er MIT-lisensiert og skal kunne brukes av andre enn oss. Det er hele poenget:
en utvikler som legger `norsk-lovsjekk` inn i sitt eget bygg, er en lenke og en
omtale vi ikke betalte for.

## Når du legger til et verktøy

1. Logikken som rene funksjoner i `src/lib/`, uten nettverk og uten DOM.
2. Tester på grensetilfellene først. Et verktøy som gir feil svar er verre enn
   ingen verktøy, fordi folk handler på svaret.
3. Nettverk og sammenstilling i `src/pages/api/`.
4. Siden som en Astro-øy etter mønsteret i `src/pages/sjekk.astro`.
5. Forbehold i rapporten: hva sjekken *ikke* ser.
6. Legg kortet til i `src/pages/verktoy/index.astro` med `klar: false` til det virker.
7. Oppdater denne filen.
