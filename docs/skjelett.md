# `skjelett` – en bar ramme som fylles felt for felt

Dette er scenen som peker direkte på produktet: en nettside bygges fra skjelett
til ferdig flate. Den er bygget etter funnene i [`docs/akt.md`](akt.md), og den
la til to funn til som ikke står der fra før. Begge står under
«[Det som faktisk avgjorde det](#det-som-faktisk-avgjorde-det)».

Filene er bygget og **ikke koblet inn noe sted**. Det er en redaksjonell
avgjørelse, ikke en teknisk.

## Hva klippet viser

Dekk til teksten ved siden av og se på filmstripen:

1. En bar, lys armatur står tom – ett bunnspor og fem tynne ribber som danner
   fire åpne felt. Man ser rett gjennom feltene til tomrommet bak. Over dem
   svever fire like aluminiumsplater i en trapp som stiger mot høyre.
2. Platene senker seg og setter seg **ett etter ett**, felt for felt.
3. Til slutt står det én hel, sammenhengende flate der det var et skjelett, med
   én rett overkant og en hårfin lime-linje rundt ytterkanten.

Subjekt (platene), verb (de senker seg og setter seg), resultat (en hel flate).
En rørlegger som ser dette uten tekst ser «noe tomt ble fylt, og så var det
ferdig». Det er terskelen scenen er bygget mot.

## Målingene

Alt er målt på den leverte fila, ikke på rammeparet – `_felle4`.

```
python3 .skudd/klipp-maal.py public/scener/skjelett-1920.mp4
```

| mål | krav | `skjelett-1920.mp4` |
|---|---|---|
| sum-bevegelse (5 rammer) | ≥ 18 er «tydelig» | **62,80** |
| toppunkt (5 rammer) | 35–65 % | **38 %** |
| sum-bevegelse (9 rammer) | – | **85,07** |
| toppunkt (9 rammer) | 35–65 % | **44 %** |
| ledd (9 rammer) | ingen døde | 8,61 · 14,38 · 10,45 · 17,76 · 10,86 · 6,24 · 11,21 · 5,56 |
| kameradrift | < ~5 px | **3 px** (se under) |
| venstre tredel, snitt | > 15:1 | **20,1:1** i hver eneste ramme |
| venstre tredel, verste piksel | – | 19,2:1 |
| lime i venstre tredel | 0 % | **0,000 %** i hver eneste ramme |
| master | – | ekte 3840×2160, 24 fps, 6,88 Mbit/s |

Til sammenligning er `akt-tetting` på 16,75 og 44 %, og de tolv eldre klippene
lå på 3,7–49,7 der alle med sum over 18 samtidig drev 74–181 piksler.

### Drift-kolonnen lyver på denne scenen – les dette før du forkaster den

`klipp-maal.py` oppgir **535 px drift**. Det er ikke kameradrift, og klippet
skal ikke forkastes på det tallet.

Fasekorrelasjon måler den dominerende globale forskyvningen i bildet. I
`akt-tetting` var det bare én liten flis som flyttet seg, så korrelasjonen låste
på den stillestående bakgrunnen og ga 1,0 px. Her flytter **fire store, lyse
plater seg omtrent 700 piksler oppover**, og de er det dominerende innholdet.
Korrelasjonen låser derfor på platene. Tallet måler motivets egen bevegelse,
altså nøyaktig det vi vil ha.

Kontrollmålingen som faktisk svarer på spørsmålet er motivets ytterkanter per
ramme. Bunnskinnen ligger på y 941–944 gjennom hele klippet – **3 piksler av
1080** – og venstre kant står på 36,0–36,1 % i alle ni rammene. Målt direkte på
4K-masteren er den vertikale forskyvningen av bunnstripen **nøyaktig 0 piksler**
i samtlige rammer. Kameraet står stille.

De vannrette avlesningene i samme kontroll (−642, −1323, −1329 …) er
alias: armaturen er et periodisk mønster av jevnt spredte ribber, og
fasekorrelasjon hopper da et helt antall ribbeavstander. Det er derfor
ytterkantene, ikke korrelasjonen, som er fasiten her.

**Lærdom for neste scene:** drift-kolonnen er gyldig når motivet står nokså
stille og bare en liten del beveger seg. Når motivet selv forflytter seg langt,
må drift verifiseres på en del av bildet som skal stå i ro.

## Det som faktisk avgjorde det

### 1. Kjeden går baklengs, og klippet snus etterpå

Dette er scenens viktigste grep.

Qwen utfører **«løft de fire platene ut av panelet»** pålitelig. Den beholder
armaturens plassering, bredde og ribbeavstand, og den tegner platene i riktig
størrelse – nettopp fordi de er løftet ut av felt som definerer størrelsen.

Den motsatte instruksjonen, **«senk platene ned i feltene»**, ble prøvd i fire
varianter og feilet hver gang på en ny måte:

| forsøk | hva som skjedde |
|---|---|
| 1 | panelet doblet høyden mellom start og slutt |
| 2 | panelet vokste et femte, tomt felt på venstre side |
| 3 | platene fylte bare øverste halvdel av hvert felt |
| 4 | overkanten ble en trapp i stedet for én rett linje |

Løsningen er å bestille klippet i den retningen modellen klarer – ferdig flate,
så plater som løfter seg – og snu den ferdige masteren med `ffmpeg -vf reverse`.
Snudd leser klippet riktig vei. Rekkefølgen i bestillingen er derfor speilvendt
med vilje: høyre plate løftes først, slik at venstre plate lander først når
klippet snus.

`scripts/scene.mjs` er **ikke** endret. Snuingen ligger som et eget ffmpeg-ledd
etterpå og er loggført i `assets/lisenser/skjelett.md`.

### 2. Geometrien må være mulig i selve bilderammen, ikke bare i prosaen

Tre forsøk på rad tegnet de svevende platene omtrent en tredel av feltet de
skulle fylle – samme umulighet som i `akt-tetting`, bare speilvendt. Ordlyden
var ikke problemet. **Proporsjonene var det.**

Hvis panelet er halvparten så høyt som bildet, finnes det ikke plass over det
til en plate som er like høy som et felt. Modellen løser trangboddheten ved å
krympe platen, og vi får en morf der hero-objektet tredobler seg. Grunnbildet
var 62 % av bildehøyden; en feltstor plate får da ikke plass i luften over.

Regelen som faller ut av det: **panelhøyde + platehøyde må få plass i rammen.**
I praksis må panelet være under ~45 % av bildehøyden når platene skal sveve
over det. Et forsøk på å tvinge det med «fire ganger så bred som høy» og
«kvadratiske felt» fikk hele komposisjonen til å falle sammen – overlappende
paneler i ulike størrelser – så formuleringen må være en *plassering* («nederst
til høyre, overkant like under bildemidten»), ikke et *forholdstall*.

### 3. Sekundmarkørene er skjøvet ~1,5 sekund senere med vilje

Fra en parallell scene samme dag: Kling flytter rekkefølgen etter
sekundmarkørene, men **venter ikke**. Modellen løper omtrent halvannet sekund
foran bestilt klokke og bruker ikke halen.

Landingene er derfor bestilt til sekund 4, 5, 6 og 7, og ble levert rundt
2,5–5,5 s. Lime-linjen er hengt på den *siste* landingen i stedet for å ligge
alene i halen, der den ikke ville blitt kjørt.

### 4. Kuttet er gratis, og det flyttet toppunktet

Masteren er 8,0 s. Snudd har den en stillestående hale på drøyt to sekunder –
den ferdige flaten som bare står. Kuttet til **6,0 s** flyttet toppunktet fra
31 % til 44 % på ni rammer, og fra 38 % til 38 % på fem, uten å koste kreditt.
Målt på tre lengder:

| lengde | sum | topp | ledd (5 rammer) |
|---|---|---|---|
| 8,0 s | 90,76 | 38 % | 24,75 · 41,90 · 21,01 · 3,10 |
| 7,0 s | 97,22 | 38 % | 23,78 · 42,71 · 22,30 · 8,43 |
| **6,0 s** | **103,23** | **38 %** | **22,47 · 34,84 · 23,85 · 22,06** |

6,0 s er valgt fordi det er den eneste lengden der alle fire leddene er over 20
– altså der det skjer noe hele veien.

### 5. Forskyvningen som ryddet venstre tredel

Lime-linjen rundt den ferdige flaten lå på 24 % av bildebredden og krøp dermed
**0,34 %** inn i venstre tredel. Motivet er derfor krympet til 0,78 og flyttet
til venstre kant 36,0 %, med ren ffmpeg:

```
scale=iw*0.78:ih*0.78,pad=3840:2160:654:414:color=0x0b0d10
```

Etter det er venstre tredel 20,1:1 og **0,000 % lime i hver eneste ramme**.
Stilkortet krever uansett at minst en tredel av flaten er rolig negativt rom, så
grepet er i tråd med designsystemet og ikke bare med typografiregelen.

## Hva som ikke ble bra

Dette er klippet sett med den strengeste linsen – det skal vises i full styrke,
kant til kant, uten maske, og da blir alt synlig.

1. **Platene vipper mens de faller.** De er tydelig rotert og viser sideflatene
   i luften, og retter seg først opp når de setter seg. Det leser som plater som
   tumler på plass, ikke som plater som glir rett ned. Prompten ba om «staying
   upright and level»; det ble halvveis fulgt.
2. **Platene lysner i luften.** En av dem er nesten hvit mens den svever og
   faller tilbake til middels grå når den sitter. Nøyaktig samme svakhet som
   `akt-tetting` hadde.
3. **Fyllrekkefølgen er 1, 2, 4, 3.** Kling løftet platene i rekkefølgen 3, 4,
   2, 1, så snudd fylles felt 4 før felt 3. Det fylles fortsatt ett etter ett,
   men «venstre mot høyre» brytes på det siste feltet.
4. **Armaturen blir ~1,3 % bredere** mot høyre i løpet av klippet (48 px av
   3840). Ikke kameradrift, men geometrien er ikke helt låst.
5. **Skjelettet er lyst og ribbene blir mørkere** når feltene fylles. Materialet
   er altså ikke helt konsistent mellom tom og full tilstand.

Ingen av disse er en morf i den ødeleggende forstanden: **platetallet holder seg
på fire gjennom hele klippet, ingen gjenstand blir funnet opp eller forsvinner,
kameraet står stille, og sluttilstanden er en ekte sammenhengende flate.** Det
er første gang vi får en flertrinns tilstandsendring med flere bevegelige
objekter uten at antallet skrider.

## Er den god nok?

Brandboken rangerer bilder: 1) opptak av verktøyet i bruk, 2) diagram med ekte
navn, 3) **ingenting**. Generert materiale står ikke på listen.

**Slår den «ingenting»?** Ja. Den har subjekt, verb og resultat, og den peker
direkte på det vi selger – en flate som bygges felt for felt. Det er det eneste
av motivene våre som gjør det. Målingene er de beste vi har: tydelig bevegelse,
toppunkt midt i tidslinjen, levende i hvert eneste ledd, låst kamera og ren
venstre tredel gjennom hele klippet.

**Slår den et skjermopptak av nettsidesjekken?** Nei. Den er fortsatt en metafor
om plater og en ramme, ikke informasjon om en nettside. Vippingen og
lysendringen tåler ikke nærsyn i full bredde like godt som et opptak ville gjort.

**Anbefaling:** den kan stå i full styrke i en Storflate-komponent der
alternativet er ingenting. Den skal ikke fortrenge et skjermopptak eller et
diagram med ekte navn. Og hvis vippingen plager eieren når han ser den stor,
er det den ene feilen som er verdt en ny bestilling – alt annet ved klippet
holder.

## Rutinen for denne scenen

```bash
set -a; . ~/.config/kodekonsulentene/higgsfield.env; set +a
node scripts/scene.mjs skjelett --fil assets/prompter/skjelett.json --kun-bilder  # 1 rammer
python3 .skudd/stor-maal.py .skudd/skjelett/startbilde.png .skudd/skjelett/sluttbilde.png
#    2 SE PÅ RAMMEPARET – åtte av ni forsøk ble stoppet her, ikke av tall
node scripts/scene.mjs skjelett --fil assets/prompter/skjelett.json            # 3 4K, ÉN bestilling
ffmpeg -i assets/mastere/skjelett-master.mp4 -vf reverse ...                   # 4 snu + kutt + forskyv
python3 .skudd/klipp-maal.py public/scener/skjelett-1920.mp4                   # 5 MÅL DET LEVERTE
#    6 SE PÅ FILMSTRIPEN
```

Ledd 2 er det som sparte penger her: **ni rammepar ble bygget og åtte forkastet
før én eneste videokreditt ble brukt.** Bildeleddene koster en brøkdel av et
4K-klipp, og hver feil i rammeparet er en garantert feil i klippet.
