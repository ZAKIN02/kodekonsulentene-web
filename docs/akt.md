# Higgsfield-prompting: hva veiledningen sier, og hva vi faktisk gjorde

Eieren sa at det er **promptene** som er feil, ikke videoen vi får ut. Dette
dokumentet er researchen som sjekker den påstanden, og den holder. Vi har hele
tiden rettet symptomer våre egne målinger fant – morf, ingen bevegelse,
frontlastet bevegelse – uten å ha lest veiledningen for modellen vi betaler for.

## Kilder

- Kling 3.0 4K image-to-video, parameterliste:
  [open.higgsfield.ai](https://open.higgsfield.ai/models/kling-video/v3.0/4k/image-to-video/api-reference)
- Kling 3.0 Turbo image-to-video (tegngrense):
  [docs.higgsfield.ai](https://docs.higgsfield.ai/docs/models/kling-3/turbo-image-to-video)
- Kling VIDEO 3.0 brukerveiledning (flerskudd, sekundmarkører):
  [kling.ai](https://kling.ai/quickstart/klingai-video-3-model-user-guide)
- Kling 3.0 image-to-video-veiledning (promptformelen, hva som gir statisk klipp):
  [apidot.ai](https://apidot.ai/blog/kling-3-0-image-to-video-guide)
- Kling 3.0 promptveiledning (negative prompter, overlessing):
  [veed.io](https://www.veed.io/learn/kling-3-0-prompts)
- `cfg_scale`-semantikk:
  [fal.ai](https://fal.ai/models/fal-ai/kling-video/v1/standard/image-to-video/api)

## Målingen som startet det

`python3 .skudd/klipp-maal.py <fil>` henter fem rammer med jevnt mellomrom,
måler snittdifferansen mellom nabo-rammer (0–255), og måler i tillegg global
forskyvning med fasekorrelasjon, slik at **kameradrift skilles fra bevegelse i
motivet**. Begge trengs: `_bevegelse` forbyr kamerabevegelse, så drift er en
feil, ikke en kvalitet.

| klipp | sum | topp | drift | dom |
|---|---|---|---|---|
| `priser` | 49,70 | 62 % | **92 px** | tydelig, men kameradrift |
| `nettsider` | 48,17 | 38 % | **181 px** | tydelig, men kameradrift |
| `sikkerhet` | 18,53 | 62 % | **74 px** | tydelig, men kameradrift |
| `steg` | 17,69 | 12 % | 2 px | svak, frontlastet |
| `stor-sveip` | 14,69 | 12 % | 0 px | svak, frontlastet |
| `lev-om` | 12,51 | 12 % | 1 px | svak, frontlastet |
| `hist2-apne` | 11,41 | 62 % | 14 px | svak |
| `apper` | 10,41 | 12 % | 13 px | svak, frontlastet |
| `systemer` | 8,73 | 12 % | 12 px | nær stillbilde |
| `sjekk-scan` | 6,61 | 12 % | 1 px | nær stillbilde |
| `lev-caser` | 4,66 | 12 % | 2 px | nær stillbilde |
| `lev-status` | 3,73 | 12 % | 0 px | nær stillbilde |

**Av tolv ferdige klipp er det ikke ett som har tydelig bevegelse uten at
kameraet samtidig driver.** Alle klipp uten drift er frontlastet: toppen ligger
på 12 % av tidslinjen, altså er alt over før første fjerdedel.

Det er verdt å merke seg at `nettsider` står i `docs/videofeil.md` som «nesten
ingen bevegelse», og samtidig måler 48 av 255. Begge deler er riktig – motivet
står stille, det er kameraet som vandrer 181 piksler. Uten drift-kolonnen ville
målingen belønnet nettopp den feilen.

## Vi gjør X, veiledningen sier Y

**1. Vi fyller prompten med beskrivelse av bildet. Veiledningen sier at nettopp
det gir statisk klipp.**
Formelen er `[handling] + [kamera] + [miljøbevegelse] + [tempo] + [det som skal
stå stille]`, og veiledningen setter opp årsak og virkning rett ut: *«Prompt only
describes the image»* → *«Clip looks static»*. Modellen ser allerede første
ramme; å gjenta innholdet er bortkastet. Våre `bevegelse`-tekster gjentok
motivet i detalj.

**2. Vi skriver en «Avoid:»-liste i prompten. Endepunktet har ingen
negative\_prompt.**
`kling-video/v3.0/4k/image-to-video` tar `image_url`, `last_image_url`, `prompt`,
`duration`, `cfg_scale`, `sound`, `multi_shots`, `multi_prompt`, `elements` – og
**ingen** negativ prompt. Lista vår havnet dermed i den *positive* prompten.
Hver eneste scene navnga mellom 27 og 40 forbudte begreper, deriblant «zoom,
pan, dolly, morphing, motion blur». Veed-veiledningen anbefaler en egen negativ
prompt og behandler ikke «avoid» i positiv prompt som en teknikk i det hele tatt.

De tre klippene med verst kameradrift – `nettsider` 181 px, `priser` 92 px,
`sikkerhet` 74 px – kommer alle fra `under.json`, der ordene «zoom» og «pan»
står **to ganger hver** i den positive prompten. Det er en sammenheng, ikke et
bevis: alle promptfilene våre har en slik liste, så jeg kan ikke skille den fra
andre forskjeller uten en kontrollert kjøring. Men retningen er feil ifølge
veiledningen, og det koster ingenting å la være.

**3. Vi la fellesteksten først og handlingen sist.**
`scene.mjs` sendte `_bevegelse` (733–1130 tegn generelle forbud) etterfulgt av
scenens `bevegelse`. Handlingsplanen lå altså bakerst, etter nesten tusen tegn
om hva som *ikke* skal skje. Rekkefølgen er nå snudd.

**4. Vi styrte tempo med prosa. Kling tar eksplisitte sekundmarkører.**
Brukerveiledningen viser `«At the 4th second, the camera accelerates …»`.
`stor.json` prøvde i stedet formuleringen *«one single continuous movement at
constant speed that completes around the middle of the clip»*. Den var ment å
treffe prosjektets 50 %-regel. Kling leser den som **«vær ferdig til midten»**.
`stor.json` er den eneste promptfila med den setningen, og `stor-sveip` er det
mest frontlastede klippet vi har: leddene er 10,25 / 1,84 / 1,38 / 1,22, altså
**78 % av all endring i første fjerdedel**.

**5. Vi lot `cfg_scale` stå på 0,5 mot en prompt som ba om stillstand.**
Høyere `cfg_scale` = lavere frihet, sterkere troskap mot prompten. Vår prompt sa
i hovedsak «ikke beveg deg, ikke endre form, ikke bytt antall». Modellen fikk
altså beskjed om å stå stille, og halv-fulgte den. Det er ikke en modellsvakhet.

**6. Vi har aldri brukt `multi_shots`, `multi_prompt` eller `elements`.**
`multi_shots` finnes på endepunktet vårt. Veed-veiledningen advarer mot å
«overloade» ett skudd med sammensatte handlinger og anbefaler flerskudd med én
hovedhandling per skudd. For vårt bruk er flerskudd likevel **feil verktøy**:
det gir klipp mellom skudd, og vi vil ha ett sammenhengende produktskudd.
Sekundmarkører i ett skudd gir samme tredeling uten snitt. `multi_prompt` og
`elements` er udokumenterte og uprøvde.

**7. Tegngrensen er 2 500. Vi lå under, men uten å vite det.**
Turbo-dokumentasjonen oppgir maks 2 500 tegn, lengre innhold kuttes. Lengste
eksisterende prompt var 2 089 tegn. Trunkering er altså **ikke** forklaringen på
noe av dette – det var en hypotese jeg målte og forkastet.

## Det redigeringsmodellen ikke klarer

Første forsøk med ny prompt ba sluttbildet om to endringer i én instruksjon:
flisen senket ned i hullet, *og* rutenettet tent. Qwen utførte lysendringen, lot
flisen bli stående der den var, tegnet et **nytt** lite objekt i hullet, og la om
hele rutenettet. Altså både manglende bevegelse og morf, fra én for ambisiøs
instruksjon.

`scene.mjs` tar derfor nå `slutt` som en **liste** av instruksjoner med én
endring hver, kjedet slik at hver arver geometrien fra den forrige. En streng
oppfører seg som før. Dette er `_felle8` i `akt.json`.

Første forsøk hadde dessuten en geometrisk selvmotsigelse i selve grunnbildet:
den svevende platen var omtrent dobbelt så stor som åpningen den skulle falle ned
i. «Seats flush» var umulig, og modellen løste det ved å finne opp et nytt objekt
– `_felle1`, men denne gangen plantet i grunnbildet og ikke i bevegelsesprompten.
Motivet er skrevet om slik at hullet **er** den manglende flisen, så delen og
hullet er like store per konstruksjon.

## Resultatet: `akt-tetting`

Scenen er bygget etter funnene over – handlingen først, sekundmarkører 0–3 / 4 /
5–8, ingen «Avoid:»-liste, `cfg_scale` 0,75, og `slutt` som to kjedede
redigeringer med én endring hver.

**Historien, lest av filmstripen:** et rutenett av like fliser med én flis
borte, og hullet lyser grønt – noe mangler, og det synes. Den løse flisen daler
ned og setter seg i hullet ved sekund 4. Først *da* tenner alle skjøtene i hele
flaten seg grønt. Altså: et åpent hull lekker, et tettet system lyser.

**Målt mot forgjengeren:**

| | `akt-tetting` | `stor-sveip` |
|---|---|---|
| total endring (5 rammer) | 16,75 | 14,69 |
| ledd | 3,21 · 5,43 · 5,25 · 2,86 | 10,25 · 1,84 · 1,38 · 1,22 |
| toppunkt | **38 %** | 12 % |
| ledd (9 rammer) | 2,34 · 2,46 · 2,89 · 3,79 · 1,85 · 3,62 · 2,10 · 0,99 | 12,44 · 3,06 · 1,18 · 1,01 · 0,81 · 0,92 · 0,77 · 0,85 |
| toppunkt (9 rammer) | **44 %** | 6 % |
| kameradrift | **1,0 px** | 0,0 px |
| venstre tredel gjennom hele klippet | **20,4–20,6:1, 0 % lime** | 19,7:1 |

**Frontlastingen er borte.** Det skjer noe i hvert eneste ledd, toppen ligger på
44 % – altså der prosjektregelen sier poenget skal ligge – og klippet endrer seg
fortsatt i siste ledd. `stor-sveip` la 59 % av all endring i første åttedel.
Kameraet står stille: 1,0 piksel drift, mot 74–181 piksler på de gamle klippene
som så livlige ut.

**Dette er første gang rørledningen holder geometrien gjennom en
tilstandsendring i to trinn.** Samme rutenett, samme flisstørrelse, samme antall,
samme kamera i alle tre rammene. Ingen morf.

**Det som ikke ble bra:** flisen vipper litt mens den faller, selv om prompten
ba om at den skulle holde seg vannrett, og den lysner fra mørk gunmetal til
nesten sølv på vei ned. Og aksenten blir aldri det *store, mettede feltet*
`stor.md` ba om – det er fortsatt tynne skjøter, 1,8 % lime på det meste. Denne
scenen løser fortellingen, ikke fargeflaten.

## Er den god nok? Nei, ikke til å erstatte noe.

Brandboken rangerer bilder: 1) opptak av verktøyet i bruk, 2) diagram med ekte
navn, 3) **ingenting**. Generert materiale står ikke på listen i det hele tatt,
bortsett fra som bakgrunnstekstur.

Dekk til teksten ved siden av og spør hva en rørlegger ser: et rutenett der én
rute mangler, ruta faller på plass, alt lyser grønt. Det leser som «noe var
ufullstendig, det ble fullført, nå er det i orden». Det er første gang et generert
motiv hos oss har et subjekt, et verb og et resultat – de fjorten som strøk på
denne prøven hadde bare et subjekt. Men det sier fortsatt ikke *nettside*, og det
sier ikke *sikkerhet*. Det er en metafor, ikke informasjon.

**Anbefaling:** bruk den som bakgrunnstekstur under tekst, der brandboken
tillater generert materiale – og ikke der et skjermopptak av nettsidesjekken
eller et diagram med ekte navn kunne stått. Den slår «ingenting» som atmosfære.
Den slår ikke et opptak, og den skal ikke fortrenge ett.

Filene er bygget, loggført i `assets/lisenser/akt-tetting.md`, og **ikke koblet
inn noe sted**. Den koblingen er en redaksjonell avgjørelse, ikke en teknisk.

## Rutinen, som nå har et ledd til

```bash
set -a; . ~/.config/kodekonsulentene/higgsfield.env; set +a
node scripts/scene.mjs <id> --fil <fil> --kun-bilder   # 1 rammer først
./.skudd/stor-ark.sh <id>                              # 2 se på paret
python3 .skudd/stor-maal.py .skudd/stor/<id>-*.png     # 3 mål rammene
node scripts/scene.mjs <id> --fil <fil>                # 4 så 4K
python3 .skudd/klipp-maal.py public/scener/<id>-1920.mp4   # 5 MÅL KLIPPET
```

**Ledd 5 er nytt og er ikke valgfritt.** Et verifisert rammepar garanterer ikke
bevegelse: `stor-sveip` hadde identisk geometri og lime 7,1 % → 11,6 %, og Kling
leverte likevel nær stillbilde. Terskler: `sum` under 10 er nær stillbilde og
skal forkastes, 10–18 er svak, 18 og over er tydelig – men bare hvis
drift-kolonnen er lav. Topp mellom 35 % og 65 % er godkjent dramaturgi.

Og ledd 6, som ikke kan automatiseres: **se på filmstripen.** Dekk til teksten
ved siden av, og spør om en rørlegger skjønner hva klippet handler om.
Brandboken rangerer opptak av verktøyet over diagram over *ingenting*, og
generert materiale står ikke på listen i det hele tatt bortsett fra som
bakgrunnstekstur. Teknisk kvalitet er ikke terskelen. Mening er.
