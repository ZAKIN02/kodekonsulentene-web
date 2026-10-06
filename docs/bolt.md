# `bolt` – slåen som går i inngrep, for /sikkerhet

Scenen er bygget etter funnene i `docs/akt.md`, ikke etter våre egne antakelser.
Promptfila er `assets/prompter/bolt.json`. Bygget med:

```bash
set -a; . ~/.config/kodekonsulentene/higgsfield.env; set +a
node scripts/scene.mjs bolt --fil assets/prompter/bolt.json --kun-bilder
node scripts/scene.mjs bolt --fil assets/prompter/bolt.json
python3 .skudd/klipp-maal.py public/scener/bolt-1920.mp4
```

## Hva scenen skal bety

`/sikkerhet` handler om at noe står **åpent** som ikke skulle stå åpent:
manglende sikkerhetsheadere, informasjonskapsler satt før samtykke. Scenen er
den setningen, ikke en illustrasjon av den:

| akt | tid | hva som skjer |
|---|---|---|
| 1 | 0–2 s | en tung slå står trukket tilbake i venstre halvdel av sporet, og høyre halvdel er en **åpen spalte** rett gjennom platen – du ser svart tomrom bak |
| 2 | 3–5 s | slåen glir vannrett over spalten og stanser metall mot metall mot et fast anslag. Spalten er borte |
| 3 | 6–8 s | slåen står rolig, og **først da** tenner en hårtynn limelinje seg langs skjøten |

Dekker du teksten ved siden av: subjekt (slåen), verb (glir i inngrep), resultat
(spalten er borte, skjøten lyser). Det var åpent, nå er det lukket.

## Hvordan promptene følger researchen

| funn i `docs/akt.md` | hva `bolt.json` gjør |
|---|---|
| 1. prompt som beskriver bildet gir statisk klipp | `bevegelse` sier bare hva som **endrer seg**, aldri hva bildet viser |
| 2. endepunktet har ingen `negative_prompt` | **ingen** «Avoid:»-liste i den positive prompten. 0 forbudte begreper navngitt (tidligere 27–40 per scene) |
| 3. fellesteksten lå først | `scene.mjs` sender scenens handling først, `_bevegelse` som haleledd |
| 4. «completes around the middle» leses som «vær ferdig til midten» | tre **navngitte tidsrom** – 0–2 / 3–5 / 6–8 – pluss egne markører på 4. og 5. sekund. Ingen «gradually», ingen «around the middle» |
| 5. høyere `cfg_scale` = sterkere troskap | `cfg` 0,80, hevet fra `akt-tetting` sine 0,75 |
| 6. `multi_shots` gir klipp mellom skudd | ikke brukt – vi vil ha ett sammenhengende skudd |
| 7. tegngrensen er 2 500 | videoprompten er 2 144 tegn |

## Fellene, kontrollert én for én

- **`_felle3` (objektet må finnes i grunnbildet):** slåen er et eget objekt fra
  første ramme – lys anodisert aluminium `#8a9099` mot mørk gunmetal `#23272e`,
  med egne endeflater og egne faseskinn. Ikke en skygge, ikke et hulrom.
- **`_felle1` (fysisk mulig spor):** kanalen er delt i to like halvdeler. Slåen
  fyller venstre halvdel, spalten **er** høyre halvdel. Slåen glir eksakt sin
  egen lengde og fyller da spalten per konstruksjon. Banen går langs et maskinert
  spor med synlig gulv hele veien – ingen del av den går gjennom massivt
  materiale.
- **`_felle8` (Qwen klarer én endring):** `slutt` er en kjede av to redigeringer
  – først posisjonen, så lyset.

## Tre forsøk på grunnbildet, to forkastet

Dette er grunnen til at bildeleddet skal kjøres med `--kun-bilder` først.

**v1 – forkastet, morf.** Første basisPrompt beskrev en kort slå og en spalte
«like lang som slåen». Qwen tegnet en liten kloss i venstre ende av kanalen og
strakk den deretter til å fylle **hele** kanalen – omtrent åtte ganger
forlengelse. Det er nøyaktig morfen `docs/akt.md` advarer mot, og den ville vært
usynlig i rammeparet hvis jeg ikke hadde sett på det.

Rettelsen var å gjøre størrelsen **umulig å endre**: kanalen deles i to like
halvdeler, slåen fyller den ene, spalten er den andre. Da er «fyller spalten
helt» sant per konstruksjon.

**v2 – forkastet, venstre tredel.** Forsøk på å gjøre kanalen høyere («two
fifths as tall as the frame») flyttet i stedet hele platen mot venstre. Venstre
tredel fikk verste piksel 1,0 mot hvit tekst – altså en lys flekk midt i
tekstsonen. Snittet så fortsatt greit ut (18,9:1); det er verstefall-kolonnen som
fanger feilen.

**v3 – forkastet, mindre kanal.** Ny formulering («tre bånd av lik høyde») ga en
kanal på 15,7 % av bildehøyden, altså **mindre** enn utgangspunktet. Qwen har en
sterk preferanse for en slank spalte og lar seg ikke overtale av ordlyd.

**Valgt sett:** det andre forsøket, med kanal på 18,7 % av bildehøyden.
Bildeleddene kjører med `resolution: "2k"` – rammene er målt til **2048×1152**,
ikke 1280×720.

## Rammeparet, målt

| ramme | venstre tredel snitt | venstre tredel verst | lime venstre | kanal senter | kanal høyde |
|---|---|---|---|---|---|
| start (slå tilbake, spalte åpen) | 20,3:1 | 20,0:1 | 0,0 % | 46,0 % | 18,7 % |
| midt (slå i inngrep) | 20,2:1 | 19,9:1 | 0,0 % | 45,9 % | 18,6 % |
| slutt (limelinje) | 20,2:1 | 20,0:1 | 0,0 % | 45,9 % | 18,7 % |

Kravet var over 15:1 med 0 % aksent i venstre tredel. Verste piksel er 19,9:1 –
det er ikke et snitt som skjuler en lys flekk, det er hele sonen.

Slålengden er identisk i alle tre rammene, og kanalens senter står på 45,9–46,0 %
av bildehøyden i alle tre. Ingen morf, ingen vandring mellom rammene.

## Klippet, målt

```
  klipp                     sek    sum    topp   drift   ledd
  bolt-1920.mp4             8.0  16.53     38%  541 px   2.04  10.79   2.16   1.55
  bolt-2560.mp4             8.0  16.58     38%  541 px   2.05  10.80   2.16   1.56
  bolt-master.mp4 (4K)      8.0  16.78     38%  541 px   2.12  10.92   2.17   1.58
  bolt-1920.mp4 (9 rammer)  8.0  18.37     44%  541 px   0.64 1.75 5.57 6.06 2.02 0.39 0.71 1.23
  akt-tetting-1920.mp4      8.0  16.75     38%  1,0 px   3.21   5.43   5.25   2.86
```

**Sum 18,37 på ni rammer, 16,53 på fem.** Over referansen på 18 på den fine
oppløsningen, like over `akt-tetting` på den grove. Toppunktet er 44 % på ni
rammer og 38 % på fem – begge innenfor 35–65 %.

Siste ledd er 1,23, altså høyere enn de to foran (0,39 og 0,71). Klippet endrer
seg fortsatt i siste sekund, slik `_bevegelse` ber om. Ingen frontlasting:
det er null endring i første fjerdedel som ikke er tilsiktet venting.

## FUNN TIL DEN SOM EIER `klipp-maal.py`: drift-kolonnen gir falsk positiv

`klipp-maal.py` rapporterer **541 px kameradrift**. Det er en falsk positiv, og
jeg har bevist det i stedet for å påstå det:

| ramme | drift, HELE bildet | drift, båndet OVER kanalen | drift, båndet UNDER kanalen | platens venstre kant |
|---|---|---|---|---|
| 0–4 | (0, 0) | (0, 0) | (0, 0) | x = 669 |
| 5–8 | (−541, 1) | **(0, 0)** | **(0, 0)** | **x = 669** |

Platens venstre kant står på nøyaktig x = 669 i alle ni rammene – null piksler
variasjon. Fasekorrelasjon på båndene over og under kanalen, der ingenting
beveger seg, gir (0, 0) i hver eneste ramme. **Kameraet står helt stille.**

Forklaringen: 541 px er 28,2 % av 1920, og slåen flytter seg 28,3 % av bredden.
Fasekorrelasjonen har låst seg på slåen, ikke på kameraet. Metoden finner den
globale forskyvningen som gir best samsvar, og når det eneste kontrastrike i
bildet *er* det bevegelige objektet, blir objektets egen bevegelse den beste
globale forskyvningen. Drift-tallet hopper fra 0 til 541 nøyaktig mellom ramme 4
og 5 – altså i det slåen er ferdig med å gli.

`_felle5` sier «les drift-kolonnen». Det holder for klipp som `nettsider`, der
motivet står stille og kameraet vandrer. Det holder **ikke** motsatt vei: et
klipp med ett stort bevegelig objekt mot en flat bakgrunn får sin egen bevegelse
rapportert som drift. Kontrollen som skiller dem er å kjøre fasekorrelasjonen på
et bånd uten bevegelige deler. `.skudd/klipp-maal.py` eies ikke av denne scenen
og er ikke rørt; dette er en observasjon til den som eier den.

### Oppløsning og bitrate

| fil | oppløsning | fps | størrelse | bitrate |
|---|---|---|---|---|
| `assets/mastere/bolt-master.mp4` | **3840×2160** | 24 | 2,79 MB | 2,91 Mbit/s |
| `public/scener/bolt-2560.mp4` | 2560×1440 | 24 | 2 901 kB | 2,96 Mbit/s |
| `public/scener/bolt-1920.mp4` | 1920×1080 | 24 | 2 187 kB | 2,23 Mbit/s |
| `public/scener/bolt-1280.mp4` | 1280×720 | 24 | 905 kB | 0,92 Mbit/s |

Masteren er ekte 4K, ikke oppskalert 1080p. Bildeleddene kjørte med
`resolution: "2k"` og ga 2048×1152 – ikke 1280×720.

**Videoendepunktet har ingen oppløsnings- eller kvalitetsparameter.** Jeg
kontrollerte parameterlista: `image_url`, `last_image_url`, `prompt`, `duration`
(3–15), `cfg_scale` (0–1), `sound`, `multi_shots`, `multi_prompt`, `elements`.
Oppløsningen ligger i modellstien (`/4k/`), og det finnes ingen `negative_prompt`
– som er hele grunnlaget for `_felle6`. Vi lar altså ingen kvalitet ligge igjen.

### Venstre tredel, gjennom hele klippet

| ramme | snitt | verste piksel | lime |
|---|---|---|---|
| t = 0 s | 20,9:1 | 20,6:1 | 0,00 % |
| t = 4 s | 20,8:1 | 20,5:1 | 0,00 % |
| t = 8 s | 20,8:1 | 20,5:1 | 0,00 % |

Kravet var over 15:1 med 0 % aksent. **Verste piksel er 20,5:1** – det er ikke et
snitt som skjuler en lys flekk, det er hele sonen, i hver ramme.

### Tidslinjen, slik den faktisk ble

Slåens venstre ende, målt i 4K-masteren:

| t | 0 s | 1 s | 2 s | 3 s | 4 s | 5 s | 6 s | 7 s | 8 s |
|---|---|---|---|---|---|---|---|---|---|
| posisjon (% av bredden) | 34,9 | 34,9 | 37,3 | 48,4 | 59,9 | **63,2** | 63,2 | 63,2 | 63,2 |
| slåens lengde (%) | 27,4 | 27,4 | 27,5 | 28,0 | 27,9 | 27,2 | 27,2 | 27,3 | 27,3 |

**Inngrepet lander på 5. sekund, nøyaktig der sekundmarkøren ba om det.** Det er
den eneste gangen vi har truffet et bestemt sekund med vilje. Glidningen starter
rundt 1 s for tidlig (den begynner ved 1–2 s, ikke ved 3 s), men toppunktet
havner likevel midt i tidslinjen.

**Slåens lengde holder seg på 27,2–28,0 % gjennom hele klippet** – 0,8
prosentpoengs variasjon. Ingen morf i lengde. Det var hele poenget med å dele
kanalen i to like halvdeler.

## Runde 2 – rettingen, godkjent av koordinator

Én retting var godkjent: **slåen skal ha identisk høyde i begge nøkkelrammene.**
Alt annet beholdt – komposisjon, faser, typografisone, sekundstruktur.

### Hva feilen faktisk var

`slutt[0]` sa *«filling it completely from wall to wall and end to end»*. Qwen
leste **«wall to wall» i høyderetningen** og trakk slåen ut til kanalens fulle
høyde. Kling interpolerte deretter trofast mellom to rammer som ikke var enige om
størrelsen. Feilen var altså i prompten, ikke i modellen – igjen.

Rettingen: *«covering that opening»* i stedet for *«filling it from wall to
wall»*, pluss en eksplisitt setning om at **skyggespalten over og under slåen
skal bevares**, så det finnes noe å måle mot. Samme setning lagt inn i `slutt[1]`.
Grunnbildet og startbildet ble **ikke** regenerert – bare de to siste leddene i
kjeden. Billigere, og komposisjonen kunne ikke drive.

### Kontrollen som sviktet, og som nå finnes som skript

`.skudd/bolt-hoyde.py` måler objektets egen høyde på en fast kolonne inne i
objektet, med limegrønt maskert bort. Den er kalibrert mot begge runder:

```
runde 1:  startbilde 187 px  →  sluttbilde 214 px   avvik 27 px  FORKASTET
runde 2:  startbilde 187 px  →  sluttbilde 186 px   avvik  3 px  GODKJENT
```

To fallgruver skriptet er bygget for å unngå, begge påtruffet underveis:

1. **Limelinja blåser opp tallet.** Den ligger rett over og under objektet, så en
   ren luminansterskel tar den med. Første måling ga 218 px på sluttbildet og
   ville forkastet en ramme som var i orden.
2. **«Største sammenhengende løp» kutter ved fasen** og måler bare den flate
   forsiden. Den ga 184 px i *begge* runder og ville godkjent runde 1.

### Målt resultat

| | runde 1 | runde 2 |
|---|---|---|
| **slåens høyde gjennom klippet** | 16,2 % → **18,6 %** | **15,97–16,25 %** |
| sum (9 rammer) | 18,37 | **19,76** |
| sum (5 rammer) | 16,53 | **17,75** |
| toppunkt (9 / 5 rammer) | **44 % / 38 %** | 31 % / 38 % |
| limelinje topp / bunn | 53,9 % / 31,9 % | **55,9 % / 55,9 %** |
| ekte kameradrift | 0 px | **1–2 px** |
| venstre tredel, verste piksel | 20,5:1, 0,00 % lime | 20,5:1, 0,00 % lime |
| master | 3840×2160, 2,91 Mbit/s | 3840×2160, **3,58 Mbit/s** |

**Høydefeilen er borte.** Slåen holder 15,97–16,25 % av bildehøyden gjennom alle
åtte sekundene – 0,28 prosentpoengs variasjon, altså 6 piksler i 4K. Runde 1
vokste 2,4 prosentpoeng på ett sekund.

**Limelinja er symmetrisk.** Topp og bunn dekker nå nøyaktig 55,9 % hver, begge
fra 35,0 % til 90,8–90,9 % av bredden. Sammenhengende, hårtynne, 0,59 % av bildet.

**Inngrepet lander fortsatt på 5. sekund**, som bestilt. Slåens venstre ende:
34,9 % (0 s) → 35,0 (1 s) → 41,8 → 49,2 → 56,6 → **60,9 % (5 s)**, og så i ro.

### Drift-funnet er sterkere nå

Fasekorrelasjonen på hele bildet rapporterer 454–539 px. Den **følger slåens
posisjon ramme for ramme**: (0) → (−22) → (−165) → (−310) → (−454) → … Samtidig
står platens venstre kant på x = 669–671 i alle ni rammene, og fasekorrelasjon på
båndene over og under kanalen gir (−1, 0) i hver eneste ramme. Ekte drift er
**1–2 piksler**. Dette er den samme falske positiven som i runde 1, nå med et
forløp som ikke kan forveksles med kameradrift: et kamera som vandret 454 px for
så å stå på −2 ved neste ramme, finnes ikke.

### Oppløsning og bitrate, runde 2

| fil | oppløsning | fps | størrelse | bitrate |
|---|---|---|---|---|
| `assets/mastere/bolt-master.mp4` | **3840×2160** | 24 | 3,40 MB | 3,58 Mbit/s |
| `public/scener/bolt-2560.mp4` | 2560×1440 | 24 | 2,92 MB | 3,08 Mbit/s |
| `public/scener/bolt-1920.mp4` | 1920×1080 | 24 | 2,24 MB | 2,36 Mbit/s |
| `public/scener/bolt-1280.mp4` | 1280×720 | 24 | 884 kB | 0,91 Mbit/s |

## Det som fortsatt ikke er perfekt

**1. Slåen blir 7,3 % lengre underveis.** Lengden går fra 27,4 % av bildebredden
ved 0 s til 29,5 % ved 5 s. Feilen ligger i nøkkelrammene – Qwen tegnet slåen
29,4 % lang i sluttbildet mot 27,4 % i startbildet – og Kling gjengir rammene
nøyaktig.

Jeg byttet altså en høydefeil mot en mindre lengdefeil. **Grunnen til at jeg ikke
fanget den før bestilling: jeg kontrollerte høyden, fordi det var høyden som
sviktet sist.** Lengden var konstant i runde 1, så jeg så ikke etter den. Riktig
kontroll er alle dimensjoner, ikke den som feilet forrige gang.

Hvor synlig er den? 2,0 prosentpoeng er 38 piksler ved 1080p, lagt til bakenden
over fire sekunder – omtrent 10 px/s, mens slåen samtidig forflytter seg 135
px/s. Bakkanten henger altså 7 % etter forkanten. Til sammenligning var runde 1
sin feil 26 piksler loddrett på ett sekund, på et objekt som ellers ikke endret
seg, nøyaktig i sekundet øyet lander. Jeg vurderer den nye feilen som vesentlig
mindre synlig, men den er av samme klasse og skal ikke skjules.

**2. Toppunktet gikk fra 44 % til 31 % på nimålingen.** Bevegelsen er jevnere
fordelt i runde 2, og det flyttet paradoksalt nok toppen tidligere. På
femmålingen er den 38 %, altså innenfor 35–65 %. På nimålingen er den utenfor.

**Trimming hjelper ikke her, og jeg lot være.** Limelinja tenner først ved 7 s
(0,40 %) og er på 0,59 % ved 8 s. Et kutt som flytter toppen mot midten måtte tatt
klippet ned mot 5–6 sekunder, og da forsvinner hele tredje akt. `floke` kunne
trimmes gratis fordi halen var død; vår hale er der poenget ligger. Jeg beholdt
derfor 8 sekunder.

**Om varigheten:** koordinator foreslo å vurdere 6–7 s fordi Kling løper ~1,5 s
foran bestilt klokke. Jeg beholdt 8 s med vilje. Begrunnelse: denne scenen har nå
**to** kjøringer der inngrepet landet på nøyaktig 5. sekund som bestilt, så
strukturen løper ikke foran her. Og trimming er gratis i etterkant, mens en for
kort bestilling ikke kan gjøres om. Rekkefølgen «bestill langt, trim ved behov»
er den billige.

**3. Den tømte kanalen kan fortsatt leses som «fortsatt åpen».** Målt er den 7,3
ganger lysere enn hullet (snitt 45,5 mot 6,3, maks 76 mot 30), og den har synlig
gulv og lys bunnfas. Den er altså tydelig ikke et hull. Men historien hadde vært
renere om slåen forsvant inn i et hus i stedet for å etterlate et spor. Dette er
en motivsvakhet, ikke en feil, og den krever et nytt grunnbilde å rette.

## Dom

**Fortellingen leser, og den leser bedre enn runde 1.** Dekker du teksten: et
helsvart hull står åpent i en maskinert flate, en tung slå glir vannrett over det
og stanser mot et anslag ved 5. sekund, hullet er borte, og to grønne hårlinjer
tenner symmetrisk langs skjøten. Subjekt, verb, resultat.

**Nærsynet på 4K holder.** Fasene er rene i alle tre rammene, slåen sitter inne i
kanalen med synlig skyggespalt over og under hele veien – den rir ikke lenger
oppå kanalen slik runde 1 gjorde – endeflaten møter anslaget i én rett
kontaktlinje, og limelinja er hårtynn og lik i topp og bunn. Ingen dobbeltkanter,
ingen flimmer, ingen oppfunne objekter.

**Den feilen som måtte bort, er borte, og den er målt borte.** 0,28 prosentpoengs
høydevariasjon mot 2,4 i runde 1.

**Jeg mener den tåler full bredde og full styrke**, med det forbeholdet at
lengdeveksten på 7,3 % står i loggen og ikke er bortforklart. Den er ikke
usynlig; den er mindre synlig enn noe annet vi har levert, og den går langs
bevegelsesretningen, ikke på tvers av den.

Brandboken rangerer opptak av verktøyet over diagram over *ingenting*. Dette er
en metafor, ikke informasjon – den sier ikke *nettside*, og den sier ikke
*sikkerhetsheader*. Den sier «det var åpent, nå er det lukket», tydeligere enn
noe annet vi har laget. **Om det slår «ingenting» på /sikkerhet er en redaksjonell
avgjørelse, ikke en teknisk, og den er ikke tatt her.**

**Ikke koblet inn noe sted. Ikke committet. Ikke deployet.**
Runde 1 er tatt vare på i `.skudd/bolt/runde1/` for sammenligning.
