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

### Drift-kolonnen lyver her – det er målt, ikke antatt

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

## Det som ikke ble bra

**1. Slåen vokser 16 % i høyde når den går i inngrep.** Mellom 3 s og 4 s går
slåens høyde fra 16,1 % til 18,7 % av bildehøyden – omtrent 14 piksler lagt til
over og under ved 1080p. Målt på fast kolonne, så det er ikke perspektiv.

Feilen er **ikke** Klings. Den lå allerede i nøkkelrammene: Qwen tegnet slåen
16,1 % høy i startbildet og 18,7 % høy – altså kanalens fulle høyde – da den ble
flyttet inn i spalten. Kling interpolerte trofast mellom to rammer som ikke var
enige om størrelsen.

Det er den samme klassen feil som `_felle1`, og jeg lot den passere i
rammekontrollen fordi jeg målte det *lyse båndet* (slå + kanalramme) i stedet for
*slåen*. Båndet var identisk i alle tre rammene, så kontrollen så grønn ut.
**Lærdom: mål objektet som skal bevege seg, ikke sonen det ligger i.**

**2. Limelinja er asymmetrisk.** Ved 8 s løper topplinja sammenhengende over
53,9 % av bredden – hele kanalen – mens bunnlinja bare dekker 31,9 %. Prompten ba
om to like lange linjer. Samlet lime er 0,36 % av bildet, altså godt innenfor
stilkortets 3 %, men asymmetrien er synlig når klippet står i full bredde.

**3. Den tømte kanalen kan leses som «fortsatt åpen».** I sluttbildet er venstre
halvdel av kanalen en tom fordypning. Den har synlig gulv og en lys bunnfas, så
den er tydelig ikke et hull – det åpne hullet ved 0 s er helsvart, fordypningen
ved 8 s er mellomgrå. Men en skeptisk leser kan si at hullet «flyttet seg til
venstre» i stedet for at det ble lukket. Historien hadde vært renere om slåen
forsvant inn i et hus i stedet for å etterlate et spor.

**Det som derimot tåler nærsyn:** fasene. Ved 4K-utsnitt på selve inngrepet er
faseskinnet en enkelt skarp linje både under glidningen og etter, kantene er
rene, og slåens endeflate møter kanalenden i én rett kontaktlinje. Ingen
dobbeltkanter, ingen flimmer, ingen oppfunne objekter. Det var inngrepet som
måtte tåle nærsyn, og overflatene gjør det.

## Dom

**Fortellingen leser.** Dekker du teksten: et helsvart hull står åpent i en
maskinert flate, en tung slå glir vannrett over det og stanser mot et anslag,
hullet er borte, og en grønn hårlinje tenner langs skjøten. Subjekt, verb,
resultat. Det er den andre scenen hos oss som har alle tre.

**Teknisk er dette det beste klippet vi har målt:** sum 18,37 er over referansen,
toppunkt 44 % er midt i tidslinjen, kameraet står på 0 piksler drift, venstre
tredel holder 20,5:1 med 0 % aksent i hver ramme, og masteren er ekte 3840×2160.
Alle tolv klippene i `docs/akt.md` strøk på minst ett av disse punktene.

**Men den skal ikke stå i full bredde og full styrke uten at feil 1 er nevnt.**
En 16 % høydeendring på det objektet øyet følger, i det sekundet øyet lander, på
et motiv som vises kant til kant uten maske – det er nøyaktig den typen detalj
eieren fanget da han sa at platene «rister». Jeg vil ikke påstå at den passerer
en kritisk kikk bare fordi tallene er grønne.

Feilen er rettbar, og rettelsen er kjent: nøkkelrammene må gi slåen samme høyde i
begge posisjoner. Det krever én ny bildekjede og én ny bestilling. **Jeg bestiller
ikke på nytt uten beskjed.**

Brandboken rangerer opptak av verktøyet over diagram over *ingenting*. Dette er
en metafor, ikke informasjon – den sier ikke *nettside*, og den sier ikke
*sikkerhetsheader*. Den sier «det var åpent, nå er det lukket», tydeligere enn
noe annet vi har laget. Om det slår «ingenting» på /sikkerhet er en redaksjonell
avgjørelse, ikke en teknisk, og den er ikke tatt her.

**Ikke koblet inn noe sted. Ikke committet. Ikke deployet.**

