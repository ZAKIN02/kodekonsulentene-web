# f1-produsent-utkast: DELVIS. Skriptet er laget, men ingen bildepar består kontrollen

Dato: 8. oktober 2026. Estimert forbruk: 22,8 av 100 kreditter (alle 22 Qwen-kall à 1,2 kr, to feilet og er trukket fra). Ingen video generert. Saldo kan ikke leses via API. Eier må lese den i console.higgsfield.ai.

## Gjort

- `scripts/produksjon.mjs` finnes og er brukt. Kommandoer: `bilde`, `video`, `sum`, `--kun-estimat`. Den leser nøkkelen selv, kaller `/estimate`, nekter å starte over rammen, laster ned med en gang, måler med ffprobe og skriver loggen. `video` er skrevet, men ikke kjørt.
- Promptfilene fra del 9 ligger ordrett i `assets/higgsfield/prompter/`. Versjonsfiler: `bilde-A-v2/v3`, `bilde-B-v2/v3/v4/v5`, `bilde-A-fra-B7`, `bilde-A-fra-B7-v2`. Originalene er urørt.
- Logg: `assets/higgsfield/logg.md`, med hvert forsøk, hva som ble endret og hvorfor.

## Målt

- Alle bilder er 2048 × 1152 (Qwen, `2k`, 16:9). Over kravet 1920 × 1080.
- Stilkort + bilde-A er 3 550 tegn. Det gikk gjennom uten feil.

## Bilde A: bestått, med forbehold

`A-3.png` (kopiert til `A.png`) har fire plater, fem porter, lyst venstre tredjedel og ingen tekst. Forsøk 1 (ordrett) hadde fem plater, forsøk 2 seks porter. Forbehold: kabelknuten gjør at jeg ikke kan telle fem kabler sikkert. Frem til B består er `A.png` foreløpig.

## Bilde B: ikke bestått etter 12 forsøk

Redigering av A med Qwen Image 3 holder ikke antallet. Tabell over de viktigste trekningene (plater / porter / kabler):

| Fil | Prompt | Resultat |
|---|---|---|
| B-1 | ordrett | 5 / 7 / 6, kablene allerede plugget, løs kontakt på kretskortet |
| B-2 | v2 (tellesetning) | 4 / 6 / 6, keramikkplaten bøyd |
| B-3 | v3 (nummererte porter) | 5 (to kretskort) / 5 / 6 |
| B-4 til B-6 | v2, ny trekning | 6, 5 og 5 plater, 5 til 7 kabler |
| B-7 | v4 (kort prompt) | **4 / 5 / 5**, men bunnplaten er flyttet og 22 % smalere, motivet er sentrert, og venstre tredjedel berøres av keramikkplaten |
| B-8 | v4 | 4 / 6 / 5, kameraet flatt fra siden |
| B-9 til B-12 | v5 (låst posisjon) | 5, 4, 4 og 5 plater, 5 til 6 porter |

B-7 er det eneste bildet med riktig antall. Det består ikke overleggskontrollen mot A-3: bunnplate, utsnitt og vinkel er ikke like. Klipp mellom dem ville fått flyttende bunnplate, som er en feil etter del 9. Jeg har derfor ikke laget B.png, C eller mobilvarianter, og ikke brukt kreditter på video.

Omvendt retning (kaos redigert fra B-7, `A2-1` til `A2-4`) ga rotete stabler med fem plater eller seks porter, og plater som svever i stedet for å ligge.

Qwen ber om seks porter og seks kabler selv når A har fem og prompten sier fem. Dette er samme mønster som `docs/akt.md` regel 8b: modellen komponerer om og teller ikke.

## Feil underveis

Qwen-redigering svarte «temporarily unavailable» på to kall mot slutten (A2-5 og A2-6). Begge er logget som refundert (est=-1,2).

## Ikke gjort

- Ingen video, ingen `lag-scene.sh hero`, ingen `public/scener/hero/`. Kravene 3 og 4 i «FERDIG NÅR» er ikke oppfylt.
- Ikke ført i `assets/LICENSES.md`, fordi ingenting er lagt i `public/`.
- Ikke testet om `pro` gir 1080p.

## Forslag til neste oppdrag (dirigent velger)

1. Bygg B av modellens egne piksler med ffmpeg (akt.md regel 8c): plater klippet ut av A-3 og flyttet loddrett, bunnplaten identisk. Gratis og eksakt, men kablene må løses separat.
2. Be eier godkjenne en annen redigeringsmodell for B og C (Grok Imagine Image 2.0 eller Ideogram 4.0 er i kontoens katalog). Qwen er prøvd 19 ganger uten et brukbart par.
3. Forenkle motivet: færre porter og kabler i alle tre bildene, i tråd med tabellen «Deler bøyer seg» i del 9 («færre kabler»). Det krever en beslutning fra designleder, fordi tallet fem er en del av fortellingen.
4. Skal B-7 brukes, må A bygges rundt det: samme base, plassert med ffmpeg, uten oppskalering.

Restramme: ca. 77 kreditter.
