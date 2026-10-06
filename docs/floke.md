# «floke» – scenen for /systemer

Bygget etter `docs/akt.md`, som er researchen mot Higgsfield-, Kling- og
fal.ai-dokumentasjonen. Ingenting her er en ny teori: de sju punktene var
allerede funnet, og denne scenen er den andre som skrives *etter* dem i stedet
for mot dem.

```bash
set -a; . ~/.config/kodekonsulentene/higgsfield.env; set +a
node scripts/scene.mjs floke --fil assets/prompter/floke.json --kun-bilder
python3 .skudd/stor-maal.py .skudd/floke-rammer/*.png
node scripts/scene.mjs floke --fil assets/prompter/floke.json
python3 .skudd/klipp-maal.py public/scener/floke-1920.mp4
```

## Hva den skal si

`/systemer` selger integrasjoner: Kunde, Booking, Vipps, Fiken, SMS. Fem ledd.
Derfor **fem** kabler og **fem** linjer – tallet er ikke pynt, det er innholdet.

Dekker du teksten ved siden av, skal en rørlegger se «rot ble ryddig». Subjekt
(kablene), verb (de strammes), resultat (fem rene linjer som lyser).

## Keyframene: tre navngitte tidsrom, ikke prosa

Dette er grepet eieren ba om, og det er det eneste som har flyttet toppunktet
vårt. `docs/akt.md` punkt 4: `stor.json` styrte tempo med setningen *«one single
continuous movement … that completes around the middle of the clip»*. Kling
leste den som **«vær ferdig til midten»**, og `stor-sveip` la 78 % av all
endring i første fjerdedel. `akt-tetting` byttet prosa mot sekundmarkører og
flyttet toppunktet fra 6 % til 44 %.

| tidsrom | hva som skjer | rolle |
|---|---|---|
| **0.–2. sekund** | kablene henger tungt i slakken og rører bare så vidt på seg: spenningen begynner å bygge seg inn fra begge skinner, de nederste løkkene kryper litt opp | utgangstilstand |
| **3.–5. sekund** | slakken trekkes ut av alle fem samtidig, løkkene flates ut og glir fra hverandre, hver kabel strammes til en rett linje – ved 5. sekund er alle fem rette og parallelle | **hendelsen, midt i klippet** |
| **6.–8. sekund** | kablene står stille mens limegrønt lys stiger i dem ved begge skinner og brer seg innover langs alle fem linjene, fortsatt tiltakende i siste sekund | ny tilstand |

Hvert tidsrom har **én** handling. Veed-veiledningen advarer mot å overlesse ett
skudd med sammensatte handlinger; sekundmarkører gir samme tredeling uten at vi
må ta `multi_shots` og dermed klipp mellom skudd.

Teksten sier ingenting om hva bildet *viser* – modellen ser allerede første
ramme, og `docs/akt.md` punkt 1 slår fast at å gjenta bildet er nettopp det som
gir statisk klipp.

## Klippet skal stå i full styrke

Dette er ikke bakgrunn på 42 % opasitet. Konsekvenser som er bygget inn:

- **Komposisjonen bærer seg selv.** Venstre halvdel er tom nær-svart, ikke
  maskert. Målingen under viser at verste piksel i venstre tredel er praktisk
  talt lik snittet – det finnes ikke én lys kant der typografien skal stå.
- **CRF ett hakk strammere** enn `akt-tetting`: 19 / 18 / 19 mot 20 / 19 / 19.
  Motivet er nær-svart med tynne lysende linjer, og det er der banding i mørke
  flater synes først.
- **Sett på native piksler.** Flettemønsteret i kabelstrømpen leser gjennom
  gløden, ferrulene ved soklene er skarpe, fasene er rene. Ingen artefakter å
  skjule.

## Oppløsning: hva endepunktet faktisk tar

Verifisert mot api-reference 6. oktober, fordi vi aldri hadde sjekket det:

`kling-video/v3.0/4k/image-to-video` tar `prompt`, `image_url`,
`last_image_url`, `duration` (3–15), `cfg_scale` (0–1, standard 0,5), `sound`,
`multi_shots`, `multi_prompt` og `elements`. **Det finnes ingen parameter for
oppløsning, størrelse, kvalitet, bildeformat, bildefrekvens eller negativ
prompt.** 4K ligger i selve stien. Vi lar altså ikke kvalitet stå ubrukt på
videoendepunktet – all styring vi har, ligger i CRF og i nøkkelbildetettheten
`scene.mjs` setter.

Bildeleddene sender `resolution: "2k"` – kontrollert i `scripts/scene.mjs` både
for `qwen-image-3/text-to-image` og `qwen-image-3/edit`, og bekreftet ved at alle
fire rammene kom tilbake som **2048 × 1152**, ikke 1280 × 720.

## Hvordan prompten følger researchen

| Funn i `docs/akt.md` | Hva `floke.json` gjør |
|---|---|
| Beskriv handlingen, ikke bildet | `bevegelse` åpner på «tension travels in from both rails …». Ikke ett ord om hva bildet viser. |
| Ingen «Avoid:»-liste i den positive prompten | Kling-prompten har null forbudsord. Qwen-kallene har `negative_prompt` som egen parameter – den er riktig sted for dem. |
| Ingen «completes around the middle» | Sekundmarkører 0–3 / 4 / 5–8, og eksplisitt «still brightening in the final second». |
| `cfg_scale` er en parameter | `cfg: 0.75`, ikke 0,5. Prompten er en handlingsplan, så den skal følges. |
| Objektet som beveger seg må finnes i grunnbildet | Floken **er** i grunnbildet: fem kabler med egne kanter, egne skygger og synlige plugger i begge ender. |
| Qwen klarer én endring per redigering | `slutt` er en lenke: først formendringen (kablene strammes), så lysendringen (linjene tennes). |
| Ingen geometrisk selvmotsigelse | Se under. |

### Geometrien, kontrollert mot morf-fella

Kablene er **fleksible** og festet i faste sokler i begge ender. Å stramme dem
er en sammenhengende deformasjon av det samme objektet – ingen kabel må gjennom
massivt materiale, og ingen nye objekter trengs. Floken er uttrykkelig **ikke
knyttet eller flettet**, bare løst lagt over seg selv; en ekte knute kan ikke
rettes ut uten at noe passerer gjennom noe, og det er nettopp da Kling tegner et
nytt objekt.

Kling-prompten er 1 417 tegn, godt under grensen på 2 500.

## To ting gikk galt, og hva de kostet

**Antallet drev til åtte.** Første rammesett ga seks–åtte kabler og åtte sokler
per skinne, selv om «exactly five» sto i hver prompt. For `/systemer` er det et
innholdsbrudd, ikke en skjønnhetsfeil. Rettingen var ikke å gjenta «exactly
five» hardere, men å gjøre antallet **tellelig**: soklene er plassert «like the
five fingers of a hand» med posisjon for hver enkelt, kablene er navngitt én for
én (top, second, middle, fourth, bottom), de er beskrevet som tykke, og det står
hvor høy den bare skinnen mellom to sokler er. Andre forsøk ga fem, fem og fem.

**Panelet sto i venstre tredel.** Første grunnbilde la panelkanten på ~33 % av
bredden. Snittkontrasten var fortsatt 19,9:1, men verste piksel i venstre tredel
var 1,6 – altså en lys kant akkurat der typografien skal stå. Rettet ved å si
hvor panelet begynner (~40 % av bredden) i stedet for «filling the right two
thirds».

**Basisprompten ble for lang.** 3 325 tegn ga `Generation took too long to
complete`. 3 135 tegn gikk gjennom. Vi har ikke en dokumentert grense for
Qwen-endepunktet, så dette er en observasjon, ikke et tall å stole på.

## Rammene, målt

`python3 .skudd/stor-maal.py` på de tre låste rammene. Kravet for venstre tredel
er over 15:1 og 0 % lime; tidligere forsøk strøk på 2,0:1.

| ramme | venstre snitt | venstre verst | venstre lime | lime i bildet |
|---|---|---|---|---|
| floke (akt 1) | **19,9:1** | 19,8 | **0,0 %** | 0,0 % |
| strammet (akt 2) | **19,9:1** | 19,8 | **0,0 %** | 0,0 % |
| tent (akt 3) | **20,1:1** | 20,0 | **0,0 %** | 1,0 % |

Verste piksel er praktisk talt lik snittet, altså finnes det ikke én lys flekk i
venstre tredel i noen av rammene. Det er bedre enn `akt-tetting` (20,4–20,6:1,
men ikke målt på verste piksel i den rapporten).

**Sett på rammeparet:** fem sokler per skinne i alle tre rammene, fem kabler
plugget i, samme skinneposisjon, samme panelstørrelse, samme kamera. Ingen morf
mellom rammene.

## Klippet, målt

Én bestilling. Rammene lå i `.skudd/scene-tmp/`, så kreditten gikk bare til
klippet.

```
klipp                   sek    sum    topp  drift  ledd
floke-1920.mp4          8.0  13.68     38%   3,2px   3,99  5,73  3,40  0,57
akt-tetting-1920.mp4    8.0  16,75     38%   1,0px   3,21  5,43  5,25  2,86
stor-sveip-1920.mp4     8.0  14,69     12%   0,0px  10,25  1,84  1,38  1,22
```

Med ni rammer: **sum 18,15, toppunkt 44 %, drift 3,2 px** – «tydelig,
midtstilt». Men terskelen på 18 er kalibrert på fem rammer, og der lander den
på **13,68**. Den er altså under referansen, og under `akt-tetting`.

| krav | resultat | |
|---|---|---|
| toppunkt 35–65 % | **38 %** (44 % på ni rammer) | ✅ |
| kameradrift under ~5 px | **3,2 px** | ✅ |
| sum nær eller over 18 | **13,68** på fem rammer | ❌ |
| venstre tredel over 15:1, 0 % lime | **20,4–20,6:1**, verste piksel 20,0–20,4, **0,0 %** | ✅ |

Venstre tredel er det sterkeste tallet her: verste piksel er praktisk talt lik
snittet gjennom hele klippet, altså et jevnt svart felt uten én lys kant.
Tidligere forsøk strøk på 2,0:1.

**Geometrien står stille.** Panelet dekker 38,6 %–94,3 % av bredden i *alle* ni
rammene, på tiendedels prosent. Ingen pust, ingen zoom, ingen morf, ingen nye
objekter, fem kabler hele veien.

**Masteren er ekte 4K:** 3840 × 2160, 24 fps, 6,2 Mbit/s, yuv420p.
Web: 2560 × 1440 (5,2 MB, 5,28 Mbit/s), 1920 × 1080 (3,8 MB, 3,83 Mbit/s),
1280 × 720 (1,5 MB, 1,52 Mbit/s).

### Hva filmstripen viser

Ni rammer, `.skudd/floke-filmstripe.png`:

0–2 s floken ligger og rører så vidt på seg. Ved 2,6 s er den fortsatt
sammenfiltret. Ved 3,0 s er kablene nesten rette, med én gjenværende slakk bunt
hengende på den øverste – det leser som den siste slakken som trekkes ut, og det
er et fint slag. Ved 3,4 s er alle fem rette, og den nederste begynner å lyse.
Fra 4 s og ut: fem rette, lysende linjer.

Lest uten tekst ved siden av: en floke av snorer blir fem rene parallelle
linjer, og så lyser de. Det er subjekt, verb og resultat, og det er utvetydig.

### Og her er feilen

**Keyframene holdt ikke helt.** Jeg bestilte 0–2 / 3–5 / 6–8. Kling kjørte
hendelsen på **2,6–3,4 s** og tente lyset på **3,4 s** i stedet for 6 s. De tre
aktene kollapser inn i hverandre, og **de siste tre sekundene står nesten
stille**: leddene over ni rammer ender på 0,69 / 0,42 / 0,55.

Sekundmarkørene flyttet toppunktet – det virket – men de fikk ikke Kling til å
*vente*. Det er en ny og mer presis versjon av funnet i `docs/akt.md` punkt 4:
modellen følger rekkefølgen, ikke klokka.

En kontrollmåling gjør det tydeligere. I stedet for snitt av differansen, andel
av bildet som endrer seg mer enn 4 av 255:

```
floke         sum 46,5 %   ledd 24,9  13,9   6,5   1,2
akt-tetting   sum 43,4 %   ledd  8,1   8,7  17,3   9,3
stor-sveip    sum 27,5 %   ledd 10,6   6,2   5,8   4,9
```

Målt i *areal* flytter `floke` mer enn begge – men den gjør det **forrest**, og
siste fjerdedel endrer 1,2 % av bildet. `akt-tetting` fordeler seg jevnt. At den
offisielle målingen likevel setter toppunktet på 38 %, skyldes at den grønne
tenningen er et stort *lysstyrke*-hopp midt i klippet. Dramaturgien er altså
delvis båret av lyset, ikke av bevegelsen jeg planla.

Det forklarer også hvorfor `sum` er lav: motivet som flytter seg mest er mørke
kabler mot et mørkt panel, og `klipp-maal.py` måler lysstyrkeendring. Det er en
forklaring, ikke en innvending – terskelen er terskelen, og den er ikke nådd.

### Et gratis grep som ikke løser nok

Å klippe halen av koster ingen kreditt. Målt på masteren:

| lengde | sum | topp |
|---|---|---|
| 5,0 s | 14,82 | 88 % (baklastet) |
| **5,5 s** | **14,92** | **62 %** |
| 6,0 s | 14,73 | 62 % |
| 8,0 s (levert) | 13,68 | 38 % |

5,5 sekunder fjerner den frosne halen og holder toppunktet innenfor, men løfter
`sum` fra 13,68 til 14,92 – fortsatt under 18. Halen er et symptom, ikke
årsaken. Testfilene ligger i `.skudd/floke-test-*.mp4`; **ingenting er byttet
ut**, det leverte klippet er de fulle åtte sekundene.

## Slår den «ingenting»?

Brandboken rangerer: 1) opptak av verktøyet i bruk, 2) diagram med ekte navn,
3) **ingenting**. Generert materiale står ikke på lista.

**På mening: ja.** Dekk til teksten. En floke av snorer blir fem rene parallelle
linjer, og så lyser de. Det er subjekt, verb og resultat uten én setning
forklaring, og tallet fem er innhold, ikke pynt. Dette er det klareste «rot ble
ryddig» vi har laget.

**På utførelse i full styrke: ikke helt.** Klippet skal stå kant til kant uten
maske. Da er de siste tre sekundene – der 1,2 % av bildet endrer seg – synlige
som at filmen stopper. Det er ikke en artefakt, men det er en svakhet en leser
som har klaget på at plater «rister» vil legge merke til.

**Min anbefaling:** den holder som motiv, men ikke i åtte sekunder. Enten
leveres den på 5,5 sekunder, eller så bestilles den på nytt med hendelsen skjøvet
senere – for eksempel 0–4 s utgangstilstand med synlig uro i floken, 4–6 s
strammingen, 6–8 s tenningen – nå som vi vet at Kling kjører cirka ett og et
halvt sekund foran den bestilte klokka. Jeg har **ikke** gjort noen av delene.
Begge koster noe: den første et sekund av fortellingen, den andre kreditt.

**Og uansett:** fem linjer sier ikke *Vipps*, *Fiken* eller *SMS*. Det er en
metafor for orden, ikke informasjon om hva vi faktisk kobler sammen. Et diagram
med de fem ekte navnene ville sagt mer og vært ærligere, og brandboken rangerer
det over dette.

Filene er **ikke koblet inn noe sted**, og ingenting er committet. Den
koblingen er en redaksjonell avgjørelse.
