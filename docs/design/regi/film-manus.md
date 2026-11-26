# Filmmanus: forsidefilmen i seks lange tagninger

Skrevet 24. nov. 2026 av manusforfatter og fotograf. Gjelder gren `redesign/wow`. Dette er manus og prompter.
Ingenting er generert, og 0 kreditter er brukt. Historien og de 28 fortellerlinjene i
`docs/design/historie-manus.md` (behandling C «Lampa», del 5 og 7) står fast. Dette dokumentet bytter bildene
som bærer dem.

> **Oppdatert 24. nov. 2026:** etter prøveproduksjonen gjelder `docs/design/regi/film-manus-v3.md` for
> tagninger, nøkkelbilder, sømmer, kommandoer og kostnad (del 5–9 her er erstattet). Del 1–4 her står: hvorfor
> de gamle klippene er flate, historien, den visuelle løsningen og stilbibelen. Promptene som gjelder, har
> `-v3` i filnavnet.

Promptene ligger ordrett i `assets/higgsfield/regi/prompter/`. Rammene fra de gamle klippene ligger i
`.design/arbeid/regi/gamle-ark-1.jpg`, `gamle-ark-2.jpg` og `gamle-ark-m.jpg`.

---

## 1. Hvorfor de gamle klippene er flate

Sett på hver 24. ramme i alle ti klippene (16:9) og tre av mobilklippene.

1. **Alle dykk er samme bevegelse.** Fem ganger på rad: høy skråvinkel utenfra, sakte rett fram og litt ned.
   Promptene sier «slowly glides forward and descends» i alle fem. Etter det andre dykket har øyet lært
   mønsteret.
2. **Kameraet har ingen grunn til å flytte seg.** Det følger ingen, ser ikke etter noe og avslører ingenting.
   Det nærmer seg bare.
3. **Ingenting skjer i bildet.** Promptene ber om det: «the figures stay where they are», «the shapes stay
   solid». Kunden står stille med mobilen i fem sekunder. Trikken står. Det er et stillbilde med zoom.
4. **Ingen dybde.** Hver scene er en øy i helt svart tomrom, sett i isometrisk fugleperspektiv. Det finnes
   ingen forgrunn som passerer linsa og ingen bakgrunn bak motivet, så det blir ingen parallakse.
5. **Samme linse og høyde hele veien.** Aldri i hoftehøyde, aldri rett ovenfra, aldri tett på en gjenstand.
6. **Overgangene er generiske.** `konn.txt` er én prompt brukt fire ganger: opp i lufta, fram, ned. To av dem
   ender i uskarpe tak og tomme gater.
7. **Fem sekunder er for kort.** Ingen bevegelse rekker å ha en start, en vending og en landing. Flere dykk
   har dessuten en død hale på opptil 1,5 s (loggen 18. nov.).
8. **Lyset er jevnt.** Alt er like skarpt og like opplyst. Det grønne ligger strødd på brosteinen i gata, så
   det mister betydning før historien trenger det.

Kort sagt: ti like innzoominger mot leketøy i mørke. Det nye manuset har seks tagninger på til sammen 95
sekunder. Hver av dem har en person med et mål, et hinder og en endring, og alle seks er én historie.

---

## 2. Historien bildene forteller (én side)

Eier 24. nov.: «Den må fortelle en historie.» Fortellerlinjene står fast, men bildene skal bære en historie
også uten tekst. Dette er den.

**Logline.** En kveld går én bestilling gjennom en gate, fra en mobil utenfor bakeriet, opp til kontoret
over og ned til rørleggeren i bakgården. Et sykkelbud bærer den på en gul lapp. På hvert sted svikter
papiret, og noe som virker tar over. Så stanser budet midt i steget, for gata er en modell på pulten vår.

**Personene og hva de vil**

| Person | Vil | Hinder | Endring |
|---|---|---|---|
| **Budet** (gul lue, sykkel, gul lapp). Går igjen i T2–T6 | Få lappen fram til neste hus før kvelden er over | Lappen er alltid ett steg bak: den må skrives av, den blåser bort | I bakgården lyser telefonen før lappen hans er teipet opp. Han sykler ut i gata, og fryser |
| **Kunden** (brun jakke), T3 | Bestille brød før bakeriet stenger | Siden på mobilen laster ikke. Hun gir opp og snur seg for å gå | Mobilen lyser opp, hun snur, går inn og får posen |
| **Kontordama**, T4 | Få ført dagens bilag og gå hjem | Den samme lappen må tastes inn to ganger, i to apparater | Skjermene blir til én kalender. Hun legger lappen bort og lener seg tilbake |
| **Rørleggeren**, T5 | Vite hva neste jobb er | Vinden tar en lapp fra bilen. Han griper i lufta | Jobben står på telefonen. Skuldrene senker seg, han lukker døra |
| **Vi** (pulten, tom stol), T1 og T6 | Vise noe som er sant | Alt over er noe vi har laget | Kameraet trekker seg ut og viser pulten. Det eneste ekte er de to hakene |

**Buen**

1. **Åpning (hero, T1).** To grønne haker på en skjerm i et ekte rom. Tom stol. Kameraet kaster seg bort fra
   dem. Vi vet ikke hva de betyr.
2. **Oppbygging (T2–T5).** Én årsakskjede, ikke tre episoder. Kunden får bestilt, *derfor* skriver bakeren en
   lapp til budet. Budet bærer den opp til kontoret, *men* der må den tastes inn to ganger. Kontoret får
   orden og legger en jobb i kalenderen, *derfor* går budet ned i gården med en ny lapp. Rørleggeren teiper
   den opp, *men* vinden tar den. Telefonen hans har allerede jobben. Hver gang er papiret tregere enn
   skjermen, og hver gang ender scenen på noe som lyser grønt.
3. **Vendepunkt (T6).** Budet sykler ut i gata, og kameraet løfter seg til samme bilde som gata ble
   presentert i. Trikken stanser. Budet fryser midt i steget. Kameraet går forbi kanten av verden.
4. **Topp (pulten).** Gata er en modell på en ekte pult. På pulten ligger en ekte, blank gul lapp ved siden
   av modellen. Kameraet finner de to hakene. Her låser målingene seg i panelet, og lampa tennes.
5. **Slutten speiler starten.** Siste bilde zoomer inn til nøyaktig herobildet: samme to haker, samme tomme
   stol. Første gang var de en påstand. Nå har vi sett hva som er modell og hva som ikke er det.

**Det som går igjen**

- **Den gule lappen** er papiret, det gamle. Gult finnes bare på lappene og på lua til budet.
- **Lime-grønt** er skjermene som «virker». Det finnes på fire steder (se stilbibelen).
- **Den varme skiva** over gata er pultlampa. Den er der i hvert vide bilde.
- **Budet** er den som binder husene sammen. Kameraet følger ham inn i gata og ut av den.

**Kameraet tjener historien.** Følgekameraet går etter budet og kunden fordi vi er med på ærendet deres.
Kameraet stiger rett ovenfra over kontorpulten fordi vi skal se at lappen flyttes og tastes to ganger.
Zoomen i varebilen går til hullet i rekka fordi den ene lappen som mangler, avgjør scenen. Kranen ut av gata
følger budet, og fortsetter når han har stanset.

**Forholdet til fortellerlinjene.** Bildene viser at det virker. Fortelleren sier at det ikke er målt. Den
spenningen er hele behandling C, og den blir sterkere når bildene faktisk overbeviser.

---

## 3. Den visuelle løsningen: én modell på en ekte pult

**Forslag.** Verden er ikke lenger fem øyer i svart. Den er **én sammenhengende håndlaget modell av et
kvartal** (leire og malt tre, ca. 60 cm bred) som står på en **fotorealistisk arbeidspult**. Inne i modellen
filmer vi som om den var en ekte gate: makrolinse i figurenes hoftehøyde, figurer som beveger seg, trikk som
går. Ute av modellen er pulten ekte: tre, tastatur, kaffekopp, to skjermer, tom stol.

**Hvorfor det er sterkere enn dagens løsning (leire i leire):**

- **Avsløringen blir et sprang i virkelighet, ikke bare i avstand.** I dag trekker kameraet seg ut fra en
  leiregate til et leirerom. Nå går det fra leire til et ekte rom. Linja «Gata står på pulten vår» får et
  bilde som ikke kan misforstås, og «det eneste her som finnes» er det eneste i filmen som ser ekte ut.
- **Lange tagninger blir mulige.** Ett kvartal gir kameraet en vei å gå: fra gata, inn i bakeriet, opp
  gjennom taket til kontoret, ut vinduet og ned i bakgården, opp over takene. Øyene i svart hadde ingen vei
  mellom seg.
- **Tre ledetråder kan plantes i bildet.** (1) «Månen» over gata er en stor, myk, varm skive. I avsløringen
  viser den seg å være pultlampa. (2) Kameraet går rett gjennom taket mellom bakeriet og kontoret. Taket er en
  tynn treplate. (3) Piskpanoreringen i prologen går fra skjermene og ned mot venstre, altså fysisk bort til
  modellen på pulten. Seeren skjønner det først andre gang.
- **Frysen får en grunn.** Når fortelleren sier «Her må vi innrømme noe», stanser trikken og figurene fryser
  midt i steget. De blir det de er: figurer i en modell. Ruller du opp igjen, våkner de.

**Det som må holdes:** figurene er leirefigurer med glatte, enkle ansikter, og de sees mest bakfra. Pulten er
tom for mennesker. Bildene er KI-laget og merket som i dag, og kolofonen står.

**Geografien i modellen (gjelder alle bilder):** fra venstre mot høyre: brosteinsgate med trikkeskinner og blå
trikk, tre smale bygårder, hjørnebakeri i rød tegl med stripete markise, kontor i etasjen over bakeriet,
bakgård bak bakeriet med gult trehus og hvit varebil. På pulten står modellen til venstre og skjermene til
høyre.

---

## 4. Stilbibel

### Linser, høyde og fokus

| Hva | Verdi |
|---|---|
| Linse inne i modellen (uttrykk i figurskala) | 24 mm i etableringer og kranbevegelser, 35 mm i følgetagninger, 50 mm på detaljer |
| Linse på pulten | 35 mm, øyehøyde for en som sitter |
| Standard kamerahøyde i modellen | Figurenes hoftehøyde. Kameraet ser litt opp på figurene, aldri ned på dem som leker |
| Unntak | Kran til takhøyde (T2, T5, T6), rett ovenfra over kontorpulten (T4), ned fra vinduet (T4, T5) |
| Fokus | Kort dybdeskarphet hele veien (makro). Fokus ligger på den vi følger. Én fokusflytting i hele filmen: fra gata til rommet i T6 |
| Tre plan | Alltid noe tett på linsa (lykt, sykkelhjul, brød, vinduskarm, blyant), motivet i midten og lys i bakgrunnen |

### Lys og farge

- **Bare praktisk lys.** Vinduer, gatelykter, hengelamper, skjermer, lyset inne i varebilen, pultlampa.
- **To farger bærer bildet:** varm rav (lampene) mot dyp blå skumring. Tegl, oker og tre i modellen.
- **Lime-grønn #C8F24A finnes på nøyaktig fire steder i hele filmen:** skjermen bak disken i bakeriet (linje
  9), telefonen til rørleggeren (linje 15) og de to hakene på pulten (linje 1 og 21). Ingen grønne lys på
  brosteinen, i vinduene eller i kalenderen. Historien handler om at grønt i bildet ikke er bevis, og da må
  seeren kunne telle de grønne tingene.
- **Gult finnes bare på papiret:** de gule lappene og lua til budet. Gult er det gamle, lime-grønt er skjermen.
- **Problemet vises i handling og lys, i tillegg til motorens gråtone:** kunden gir opp og snur seg, mobilen
  er blek og matt. Lappen tastes inn to ganger, skjermene har hver sin farge. Lappen blåser ut av bilen.
- **Ingen raske lysskift.** En skjerm som lyser opp, bruker minst 1,5 s. Ingen blink, ingen flimmer.
- **«Månen»:** én stor, myk, varm skive høyt i bakgrunnen i alle vide bilder av gata. Det er pultlampa.

### Bevegelsesvokabular

| Bevegelse | Brukes i | Motivasjon |
|---|---|---|
| Piskpanorering over 1,5 s | T1 | Fortelleren spoler tilbake. Kameraet kaster seg fra skjermene til gata |
| Kran ned fra tak til gateplan | T2, T5 | Vi går inn i gata, ned til rørleggeren |
| Følgetagning i hoftehøyde (Steadicam) | T2, T3 | Vi er med på ærendet: budet langs fasadene, kunden inn døra |
| Forgrunn som skjærer gjennom bildet | T2 (trikken), T3 (brød, lampe), T6 (blyant, kopp) | Dybde, og en naturlig visker |
| Sakte innskyv over skulderen | T3, T5 | Vi ser det personen ser: en mobil |
| Dolly sidelengs langs disken | T3 | Vi går langs disken med kunden |
| Sakte film på én gest | T3 (posen rekkes over), T5 (skyvedøra lukkes) | Øyeblikket der det virker. Her står motoren i «ro» og viser H2 |
| Kran rett opp gjennom taket | T4 | Bak skjermen er det en etasje til. Ledetråd: taket er en tynn plate |
| Rett ovenfra («Guds øye») | T4 | Vi må se at samme lapp flyttes og tastes inn to ganger |
| Rask zoom over 1 s | T5 | Hullet i rekka av lapper avgjør scenen: den ene er borte |
| Kran opp til fugleperspektiv | T5 | Vi følger budet ut av gården, og gata ligger der som i starten |
| Frys | T6 | Innrømmelsen. Figurene blir modell |
| Uttrekk med fokusflytting | T6 | Avsløringen: gata står på pulten |

### Forbudt

- «Slow glide forward» uten noen å følge eller noe å finne.
- Stillestående figurer (unntatt frysen i T6, som er poenget).
- Svart tomrom rundt motivet. Bakgrunnen er alltid skumring med lys i.
- Lesbar tekst, tall, logoer, skilt. Skjermer viser former og farge. Lapper er blanke.
- Nærbilder av ansikter. Ekte mennesker.
- Grønt utenfor de fire stedene over.
- Røyk, damp, væske som renner og ting som faller. De ser feil ut når filmen spoles baklengs. Ett unntak:
  lappen som blåser ut av varebilen i T5. Baklengs flyr den tilbake på plass, og det leses riktig.
- Kutt inni en tagning, strobe, flimmer og raske lysskift. Filmen skal ikke hakke når man ruller.
- Bevegelser som er over på under ett sekund. Piskpanoreringen bruker 1,5 s og zoomen i T5 1 s, så de blir
  en bevegelse og ikke ett hopp når leseren ruller forbi.
- Lydavhengige poeng. Alle klipp lages med `generate_audio false`.
- Regissørnavn, filmtitler og varemerker i promptene (gir `ip_detected`).

### Regler for spoling

Filmen spoles av rullingen, i ujevn fart og begge veier. Derfor:

- **Hver tagning lages i den retningen den spilles.** T1 og T6 erstatter de to segmentene som i dag spilles
  baklengs (`dive-4` og `pult-inn` med `retning: -1`). De nye er laget forover. `bevegelse` kan enten sette
  `retning: 1` på de to segmentene, eller produsenten kan snu filene med ffmpeg (`reverse`) så motoren er
  urørt. Det første er ryddigst.
- **Gester er valgt fordi de kan snus:** løfte og senke en mobil, åpne og lukke en dør, rekke fram og ta
  tilbake en pose, en trikk som går, en skjerm som lyser opp. Baklengs blir de den motsatte gesten.
- **Gange baklengs** vises bare når leseren selv ruller oppover. Da vet leseren at filmen spoles.
- **Hver takt lander mykt.** Kameraet bremser til nesten stille i 0,5–1 s mellom taktene, så et stopp i
  rullingen gir et rolig bilde, og linja kan leses. Det stopper aldri brått og starter aldri med et rykk.
- **Én sammenhengende bevegelse per tagning.** Ingen kutt inni, ingen hopp i lys.

---

## 5. Tagningene: oversikt

**Seks tagninger, 95 sekunder per format** (ønsket ramme: 60–120 s). I dag: ti klipp på 5 s.

| # | Navn | Varighet | Rulling (skjermhøyder) | Linjer | Hvem vi følger | Start → slutt | Erstatter |
|---|---|---|---|---|---|---|---|
| T1 | Piskpanoreringen | 5 s | 0,4 | 3 | Vi | N1 pult tett → N2 gata vid | `dive-4` baklengs |
| T2 | Gata | 15 s | 1,2 | 4, 5, 6 | Budet | N2 → N3 utenfor bakeriet | `dive-0`, `conn-0` |
| T3 | Bakeriet | 20 s | 1,6 | 7, 8, 9 | Kunden | N3 → N4 skjermen bak disken | `dive-1`, `conn-1` |
| T4 | Kontoret | 20 s | 1,6 | 10, 11, 12 | Kontordama | N4 → N5 bakgården fra vinduet | `dive-2`, `conn-2` |
| T5 | Rørleggeren | 20 s | 1,6 | 13, 14, 15 | Rørleggeren, så budet | N5 → N2 gata vid | `dive-3` |
| T6 | Innrømmelsen | 15 s | 1,2 | 16, 17 | Budet, så oss | N2 → N6 pulten vid | `pult-inn` baklengs |
| | **Sum film** | **95 s** | **7,6** | | | | |

**Rullelengde.** Med stillbildene i tillegg (hero og prolog 0,9, pulten med målingene 2,3) blir filmen 10,8
skjermhøyder mot 9,0 i dag. Begrunnelse: hver fortellerlinje trenger ca. 0,4 skjermhøyder for å kunne leses,
og T3–T5 har tre linjer hver pluss en H2. Det gir ca. 12,5 s film per skjermhøyde i alle tagningene, så
farten i bildet er lik fra kapittel til kapittel. Skal filmen holdes på 9,0, kortes T3–T5 til 1,3 og T2 og
T6 til 0,95. Da går bildet raskere, men linjene får samme plass som i dag.

Rulleandelene under i dokumentet følger beat-arket i historiemanuset (9,0 skjermhøyder), så de kan
sammenlignes med det. `bevegelse` regner dem om hvis lengdene endres.

Heroen og prologen (0–12 %, linje 1–2) er stillbildet N1. Pulten etter avsløringen (74–100 %, linje 18–22 og
målingene) er stillbildet N6 med zoom i CSS inn mot utsnittet N1. Linje 23–28 hører til resten av siden.

### Nøkkelbilder og sømmer

Seks nøkkelbilder per format, pluss ett modellark. Siste ramme i en tagning er samme bildefil som første
ramme i neste (`--end-image` og `--start-image` peker på samme fil).

| Bilde | Fil (16:9, og `-9x16`) | Hva | Promptfil | Brukes som |
|---|---|---|---|---|
| N0 | `nokkel/n0-modellark-16x9.png` | Hele modellen som produktbilde. Bare referanse | `k0-modellark-16x9.txt` | Referanse i alle bilder og alle tagninger |
| N6 | `nokkel/n6-pult-16x9.png` | Pulten vid: modellen og en blank gul lapp til venstre, to skjermer med haker og tom stol til høyre | `t6-slutt-*.txt` | Slutt T6. Stillbildet `pult` |
| N1 | `nokkel/n1-hero-16x9.png` | Pulten tett: bare skjermene, lampa og stolen | Utsnitt av N6. Reserve: `t1-start-*.txt` | Start T1. `hero` og LCP-bildet |
| N2 | `nokkel/n2-gata-16x9.png` | Gata vid fra takhøyde, trikk, budet med sykkelen, alle vinduer lyser, «månen» | `t1-slutt-*.txt` | Slutt T1, start T2, slutt T5, start T6 |
| N3 | `nokkel/n3-bakeri-ute-16x9.png` | Bak kunden utenfor bakeriet, blek mobil | `t2-slutt-*.txt` | Slutt T2, start T3 |
| N4 | `nokkel/n4-skjerm-16x9.png` | Tett på den grønne skjermen bak disken | `t3-slutt-*.txt` | Slutt T3, start T4 |
| N5 | `nokkel/n5-bakgard-16x9.png` | Ned i bakgården fra kontorvinduet: varebil, rørlegger, budet på vei inn | `t4-slutt-*.txt` | Slutt T4, start T5 |

Alle stier er under `assets/higgsfield/regi/`.

**N1 er et utsnitt av N6, ikke et eget bilde.** Da er «Samme to haker som i starten» (linje 21) bokstavelig
sant: sluttbildet zoomer inn til nøyaktig herobildet. N6 lages i 4k så utsnittet holder 1920 px i bredden.
16:9: høyre 55 % av N6. 9:16: øvre 55 %. Kommando under. Hvis utsnittet ikke lar seg komponere, brukes
reserveprompten `t1-start-*.txt` (redigering av N6).

**N2 er det viktigste bildet.** Det er bildet leseren skal kjenne igjen når avsløringen starter. Fire sømmer
går gjennom det.

**Kontroll av sømmene:** som før, PSNR mellom siste ramme i ett klipp og første ramme i neste, målt på rå
klipp. Mål: over 34 dB. Under det: lag tagningen på nytt, eller legg nøkkelbildet inn som første og siste
ramme ved koding.

### Rekkefølge for nøkkelbildene

```bash
cd /Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web
P=assets/higgsfield/regi/prompter; N=assets/higgsfield/regi/nokkel

# N0 modellark (ingen referanse)
higgsfield generate create gpt_image_2_6 --prompt "$(cat $P/k0-modellark-16x9.txt)" \
  --aspect_ratio 16:9 --resolution 2k --quality high --wait        # lagres som $N/n0-modellark-16x9.png

# N6 pulten, 4k fordi N1 klippes ut av den
higgsfield generate create gpt_image_2_6 --prompt "$(cat $P/t6-slutt-16x9.txt)" \
  --image-references $N/n0-modellark-16x9.png --aspect_ratio 16:9 --resolution 4k --quality high --wait
higgsfield generate create gpt_image_2_6 --prompt "$(cat $P/t6-slutt-9x16.txt)" \
  --image-references $N/n0-modellark-16x9.png --aspect_ratio 9:16 --resolution 4k --quality high --wait

# N1 hero = utsnitt av N6 (0 kreditter)
ffmpeg -i $N/n6-pult-16x9.png -vf "crop=iw*0.55:ih*0.55:iw*0.45:ih*0.20" $N/n1-hero-16x9.png
ffmpeg -i $N/n6-pult-9x16.png -vf "crop=iw*0.55:ih*0.55:iw*0.225:0"       $N/n1-hero-9x16.png

# N2 gata, N3, N4, N5 (referanser: modellarket og, fra N3, gata)
higgsfield generate create gpt_image_2_6 --prompt "$(cat $P/t1-slutt-16x9.txt)" \
  --image-references $N/n0-modellark-16x9.png --image-references $N/n6-pult-16x9.png \
  --aspect_ratio 16:9 --resolution 2k --quality high --wait
for par in "t2-slutt n3-bakeri-ute" "t3-slutt n4-skjerm" "t4-slutt n5-bakgard"; do set -- $par
  higgsfield generate create gpt_image_2_6 --prompt "$(cat $P/$1-16x9.txt)" \
    --image-references $N/n0-modellark-16x9.png --image-references $N/n2-gata-16x9.png \
    --aspect_ratio 16:9 --resolution 2k --quality high --wait      # lagres som $N/$2-16x9.png
done
# 9:16: samme kommandoer med -9x16.txt, --aspect_ratio 9:16, og 16:9-bildet av samme motiv som ekstra referanse
```

Utsnittstallene i ffmpeg-linjene er utgangspunkt. Produsenten ser på N6 og flytter utsnittet så begge
skjermene og stolryggen er med, og modellen er ute.

Hvert bilde sjekkes med Read før det brukes: ingen tekst, ingen logo, grønt bare der det skal være, stolen
tom, figurene uten detaljerte ansikter.

---

## 6. Opptaksmanus

Felles for alle tagninger: Seedance 2.5, `--mode omni_reference`, `--generate_audio false`, start- og
sluttbilde, modellarket N0 som referanse. Utkast med `--draft true`. Tidene under er tagningens egne
sekunder. «Ved» er andelen av segmentet som `bevegelse` kan sette i `historie.ts`.

Kommandoene bruker `P=assets/higgsfield/regi/prompter` og `N=assets/higgsfield/regi/nokkel`.

**Endelig versjon** av en tagning: samme kommando uten `--draft true`, med `--resolution 1080p`. Om
`--draft_job_id <utkastets jobb-id>` gir samme bevegelse i full kvalitet, testes på første tagning (se del 8).

---

### T1. Piskpanoreringen (5 s)

**Bærer:** linje 3, «Så vi spoler tilbake til der det begynte.» Rulleandel 12–16 %. Rulling: 0,4 skjermhøyder.
**Historien:** vi forlater det eneste ekte i filmen uten å si at det er det.
**Start:** N1 (pulten tett, to haker, tom stol). **Slutt:** N2 (gata vid).
**Idé:** kameraet forlater skjermene og kaster seg mot venstre og ned. Uskarpheten skjuler at vi går fra et
ekte rom og inn i modellen. Det er sant geografisk: modellen står der på pulten.

| Tid | Kamera | I bildet |
|---|---|---|
| 0,0–1,0 | 35 mm, øyehøyde sittende. Sakte innskyv mot skjermene, ca. 5 % | Hakene lyser. Stolryggen står mørk i forgrunnen |
| 1,0–2,0 | Innskyvet fortsetter og bremser, som om kameraet nøler | Lampelyset ligger varmt i venstre kant |
| 2,0–2,6 | Piskpanorering mot venstre og ned, myk akselerasjon. Hele panoreringen varer 1,5 s | Skjermene trekkes ut til grønne og blå striper |
| 2,6–3,5 | Full bevegelsesuskarphet. Rav og blått i striper, jevn lysstyrke | Ingenting er lesbart. Her bytter verden |
| 3,5–4,3 | Panoreringen bremser. 24 mm, takhøyde over gata | Takene og trikken trer fram av stripene |
| 4,3–5,0 | Kameraet lander og står | Trikken ruller sakte, to figurer går. «Månen» står høyt i bildet |

**Lys:** pultlampa og skjermene først, så gatelykter og vinduer. Den varme skiva i N2 er samme lampe.
**Tre plan (slutt):** gatelykt tett på linsa, trikken og fasadene, skumring med skive.
**Søm inn:** fra stillbildet `hero` (N1), som har stått siden 0 %. **Søm ut:** N2 til T2.
**9:16:** piskbevegelsen går rett ned (tilt), ikke sidelengs. I N1 står skjermene i øvre del, i N2 går gata
i lengderetningen fra bunnen og opp. Trikken kommer mot oss.
**Baklengs (leseren ruller opp):** fra gata piskes kameraet opp til skjermene. Leses like godt.

```bash
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t1-16x9.txt)" \
  --start-image $N/n1-hero-16x9.png --end-image $N/n2-gata-16x9.png --image-references $N/n0-modellark-16x9.png \
  --duration 5 --aspect_ratio 16:9 --draft true --generate_audio false --wait
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t1-9x16.txt)" \
  --start-image $N/n1-hero-9x16.png --end-image $N/n2-gata-9x16.png --image-references $N/n0-modellark-16x9.png \
  --duration 5 --aspect_ratio 9:16 --draft true --generate_audio false --wait
```

---

### T2. Gata (15 s)

**Bærer:** linje 4 (ved 0), linje 5 med puls i lampa (ved 0,40), linje 6 (ved 0,70). Rulleandel 16–28 %.
Rulling: 1,2 skjermhøyder.
**Start:** N2. **Slutt:** N3 (bak kunden utenfor bakeriet).
**Historien:** vi møter budet. **Vil:** levere den gule lappen i bakeriet. **Hinder:** trikken sperrer veien,
og gata er full av folk. **Endring:** han kommer fram og går inn. Kameraet blir stående hos den som ikke
kommer videre: kunden med mobilen.
**Hvorfor kameraet gjør det:** kranen går ned fordi vi skal inn i gata. Det følger budet fordi han er den som
binder husene sammen. Det slipper ham ved døra fordi neste scene er hennes.

| Tid | Kamera | I bildet |
|---|---|---|
| 0–2 | 24 mm, takhøyde. Kran ned, jevnt | Hele gata. Trikken kommer mot kameraet fra venstre. Budet står og venter på at den skal passere |
| 2–4 | Kranen lander i hoftehøyde over skinnene | Trikken sklir forbi tett på linsa og visker bildet fra venstre mot høyre |
| 4–5 | 35 mm. Kameraet bremser et halvt sekund, så starter følgetagningen | Bak trikken: budet med gul lue, sykkelen og en gul lapp i hånda. Linje 4 står |
| 5–8 | Følger budet sidelengs i hoftehøyde, gangfart | Vinduene glir forbi i myk uskarphet, alle lyser rav. To figurer krysser forgrunnen, han svinger unna |
| 8–10 | Samme følging, kameraet faller litt bak ham | En gatelykt passerer tett på linsa. Linje 5: «Lys i et vindu sier ingenting om siden» |
| 10–12 | Kameraet bremser med ham | Han setter sykkelen ved hjørnebakeriet og går inn døra med lappen. Linje 6 |
| 12–14 | Kameraet blir ute. Sakte innskyv | Kunden står utenfor med ryggen til og ser ned på en mobil. Hun har ikke flyttet seg |
| 14–15 | Lander over skulderen hennes | Mobilen er blek. Sykkelhjulet til budet i forgrunnen. = N3 |

**Lys:** rav fra vinduene som sidelys på figurene, blå skumring ovenfra. Mobilen er det eneste kalde, bleke.
**Tre plan:** trikk, lykt og sykkelhjul tett på linsa. Budet og kunden. Fasader og skumring.
**Søm inn:** N2 fra T1. **Søm ut:** N3 til T3.
**9:16:** kameraet følger budet **bakfra, rett innover i gata**, ikke sidelengs. Vinduene reiser seg på
begge sider. Trikken kommer mot linsa og passerer til venstre. Kunden står midt i bildet til slutt, markisen
over. Nederste tredel er mørk brostein, der platen ligger.
**Baklengs:** kameraet trekker seg fra kunden, budet kommer ut av bakeriet, og kameraet stiger til taket. Trikken visker
motsatt vei.

```bash
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t2-16x9.txt)" \
  --start-image $N/n2-gata-16x9.png --end-image $N/n3-bakeri-ute-16x9.png --image-references $N/n0-modellark-16x9.png \
  --duration 15 --aspect_ratio 16:9 --draft true --generate_audio false --wait
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t2-9x16.txt)" \
  --start-image $N/n2-gata-9x16.png --end-image $N/n3-bakeri-ute-9x16.png --image-references $N/n0-modellark-16x9.png \
  --duration 15 --aspect_ratio 9:16 --draft true --generate_audio false --wait
```

---

### T3. Bakeriet (20 s)

**Bærer:** linje 7 (ved 0, gråtone), H2 og linje 8 (ved 0,30, fargen tilbake, `gronnVed` 0,30, «ro» rundt
0,58–0,68), linje 9 (ved 0,76). Rulleandel 28–41 %. Rulling: 1,6 skjermhøyder.
**Start:** N3. **Slutt:** N4 (tett på den grønne skjermen bak disken).
**Historien:** kundens scene. **Vil:** bestille brød før bakeriet stenger. **Hinder:** siden laster ikke. Vi
ser henne trykke, vente, gi opp og snu seg for å gå. **Endring:** mobilen lyser opp, hun snur, går inn og får
posen. *Derfor* skriver bakeren en gul lapp og gir den til budet, som har ventet ved disken.
**Hvorfor kameraet gjør det:** over skulderen fordi vi skal se det hun ser. Det følger henne inn fordi vi er
med på ærendet. Det går videre til skjermen bak disken fordi fortelleren skal peke på den.

| Tid | Kamera | I bildet |
|---|---|---|
| 0–2 | 35 mm over skulderen, hoftehøyde. Sakte innskyv | Mobilen er blek og matt. Hun trykker på den. Linje 7 |
| 2–4 | Innskyvet fortsetter til mobilen fyller en tredel | Hun venter. Inne i bakeriet lyser det varmt, og bakeren ser mot døra |
| 4–5 | Kameraet bremser | **Problemet skjer:** hun gir opp, senker mobilen og snur seg halvt bort for å gå |
| 5–6,5 | Kameraet står nesten stille | Mobilen i hånda lyser sakte opp i varme fargeflater (1,5 s). Hun ser ned. Her slipper motoren gråtonen |
| 6,5–9 | Kameraet rygger et halvt skritt, så følger det henne | Hun snur tilbake, åpner døra og går inn. Dørkarmen passerer tett på linsa |
| 9–12 | Dolly sidelengs langs disken, 35 mm | Brød i forgrunnen glir forbi, en hengelampe passerer over linsa. Budet står ved enden av disken |
| 12–14 | Farten faller til nesten stille. **Sakte film** | Bakeren rekker en papirpose over disken, hun tar imot. H2 og linje 8 står. «Ro» |
| 14–15 | Kameraet glir videre | Bakeren river av en gul lapp og gir den til budet. Han går mot bakdøra |
| 15–19 | 50 mm. Sakte innskyv mot den lille skjermen bak disken | Skjermen lyser lime-grønt med enkle former. Linje 9 |
| 19–20 | Bremser til stille | = N4. Taket på modellen synes over skjermen |

**Lys:** blek mobil mot rav bakeri i første del. Inne: hengelamper, varmt sidelys. Skjermen er det eneste
grønne og det eneste kalde.
**Tre plan:** sykkelhjul, dørkarm, brød og lampe. Kunden, bakeren og budet. Hyller og vindu mot blå gate.
**Søm inn:** N3 fra T2. **Søm ut:** N4 til T4.
**9:16:** mobilen holdes midt i bildet. Døra er rett fram, og kameraet går **inn i dybden** mot disken, ikke
sidelengs. Posen rekkes ned over disken mot oss. Kameraet stiger over disken til skjermen. Nederste tredel
er disk og gulv i mørkt tre.
**Baklengs:** fra skjermen, tilbake langs disken, posen går tilbake til bakeren, hun går ut døra, og mobilen blekner.
Det er historien om bakeriet baklengs, og den leses riktig: uten siden ingen handel.

```bash
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t3-16x9.txt)" \
  --start-image $N/n3-bakeri-ute-16x9.png --end-image $N/n4-skjerm-16x9.png --image-references $N/n0-modellark-16x9.png \
  --duration 20 --aspect_ratio 16:9 --draft true --generate_audio false --wait
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t3-9x16.txt)" \
  --start-image $N/n3-bakeri-ute-9x16.png --end-image $N/n4-skjerm-9x16.png --image-references $N/n0-modellark-16x9.png \
  --duration 20 --aspect_ratio 9:16 --draft true --generate_audio false --wait
```

---

### T4. Kontoret (20 s)

**Bærer:** linje 10 (ved 0,20, gråtone fra 0,20), H2 og linje 11 (ved 0,48, `gronnVed` 0,48, «ro» rundt
0,60–0,68), linje 12 (ved 0,68). Rulleandel 41–53 %. Rulling: 1,6 skjermhøyder.
**Start:** N4. **Slutt:** N5 (ned i bakgården fra kontorvinduet).
**Historien:** kontordamas scene. **Vil:** få ført dagens bilag og gå hjem. **Hinder:** lappen fra bakeriet må
tastes inn to ganger, først i ett apparat og så i det neste. **Endring:** skjermene blir til én kalender,
hun legger lappen bort og lener seg tilbake. En ny blokk faller inn i kalenderen: en jobb. *Derfor* går
budet ned i gården.
**Hvorfor kameraet gjør det:** rett opp gjennom taket fordi lappen går samme vei. Rett ovenfra fordi bare
derfra ser vi at det er samme lapp og samme håndbevegelse to ganger. Ut vinduet fordi jobben hun nettopp la
inn, står der nede.

| Tid | Kamera | I bildet |
|---|---|---|
| 0–1,5 | 50 mm på skjermen. Kran rett opp, myk start | Den grønne skjermen synker ut i bunnen |
| 1,5–3 | Kameraet går gjennom taket | En tynn treplate i snitt passerer linsa. Ledetråd nummer to |
| 3–4 | Lander i hoftehøyde bak en kvinne ved en pult, 35 mm | Budet legger den gule lappen på pulten hennes og går. Gråtonen starter. Linje 10 |
| 4–6,5 | Kranen fortsetter opp og tilter ned | Pulten dreier seg under oss |
| 6,5–9 | **Rett ovenfra**, 24 mm, nesten stille | **Problemet skjer:** hun taster fra lappen inn i den bærbare, skyver lappen bort til nettbrettet og taster det samme en gang til. Hver skjerm har sin farge |
| 9–12 | Sakte bue ned til over skulderen | Fargene samler seg sakte i én kalender med fargeblokker. Gråtonen slipper |
| 12–13,5 | Bremser. Hun legger lappen i skuffen og lener seg tilbake | H2 og linje 11. «Ro» |
| 13,5–15 | Sakte innskyv mot kalenderen, 50 mm | En ny blokk faller på plass. Linje 12: «Kalenderen fylles opp» |
| 15–17,5 | Panorerer høyre til vinduet og kjører ut over karmen | Vinduskarmen passerer tett på linsa |
| 17,5–20 | Tilter ned i bakgården og bremser til stille | Hvit varebil med åpen dør og lys inni, rørlegger ved døra, budet triller sykkelen inn i gården. = N5 |

**Lys:** bordlampa er nøkkellyset. Skjermene farger hendene hennes i hver sin farge ovenfra. Når de blir
én, blir lyset på pulten ett. Overgangen bruker 3 s. Ingen av fargene er lime-grønn. Lappen er det eneste gule.
**Tre plan:** takplata, bordlampa og vinduskarmen. Kvinnen og pulten. Vindu mot skumring.
**Søm inn:** N4 fra T3. **Søm ut:** N5 til T5.
**9:16:** kranen opp er laget for høydeformat og beholdes. Rett ovenfra står apparatene **under
hverandre** langs høyden, og lappen skyves nedover. Utgangen går opp til vinduet og bratt ned i gården.
**Baklengs:** fra gården inn vinduet, kalenderen deler seg, lappen kommer fram igjen, og kameraet synker
gjennom gulvet til skjermen. Riktig historie baklengs.

```bash
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t4-16x9.txt)" \
  --start-image $N/n4-skjerm-16x9.png --end-image $N/n5-bakgard-16x9.png --image-references $N/n0-modellark-16x9.png \
  --duration 20 --aspect_ratio 16:9 --draft true --generate_audio false --wait
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t4-9x16.txt)" \
  --start-image $N/n4-skjerm-9x16.png --end-image $N/n5-bakgard-9x16.png --image-references $N/n0-modellark-16x9.png \
  --duration 20 --aspect_ratio 9:16 --draft true --generate_audio false --wait
```

---

### T5. Rørleggeren (20 s)

**Bærer:** linje 13 (ved 0,15, gråtone fra 0,15), H2 og linje 14 (ved 0,42, `gronnVed` 0,45, «ro» rundt
0,58–0,68), linje 15 (ved 0,70). Rulleandel 53–64 %. Rulling: 1,6 skjermhøyder.
**Start:** N5. **Slutt:** N2 (gata vid, samme bilde som T2 startet på).
**Historien:** rørleggerens scene, og slutten på budets runde. **Vil:** vite hva neste jobb er. **Hinder:**
jobbene står på lapper i bilen. Budet gir ham en ny, han teiper den opp, og vinden tar en. Han griper i
lufta. **Endring:** telefonen lyser. Jobben står der allerede. Skuldrene senker seg, han lukker døra. Budet
har ingen flere lapper. Han setter seg på sykkelen og triller ut.
**Hvorfor kameraet gjør det:** ned fra vinduet fordi jobben fra kontoret havner her. Zoomen går til hullet i
rekka fordi den ene lappen som mangler, avgjør scenen. Kranen opp følger budet ut, og leseren får se hele gata
én gang til før den stanser.

| Tid | Kamera | I bildet |
|---|---|---|
| 0–2 | 28 mm fra vinduet. Kran ned | Gården kommer opp mot oss. Budet går bort til rørleggeren ved skyvedøra |
| 2–4 | Lander i hoftehøyde bak dem, 35 mm | Budet gir ham en gul lapp. Han teiper den opp ved siden av de andre inne i bilen. Gråtonen starter. Linje 13 |
| 4–5 | Kameraet bremser | **Problemet skjer:** et vindkast løfter én lapp. Den flagrer ut forbi linsa |
| 5–6 | **Rask zoom** forbi skulderen hans, 1 s, myk start og landing | Rekka av gule lapper, og ett hull med avrevet teip |
| 6–8 | 50 mm, nesten stille på hullet | Han griper i lufta etter lappen og bommer. Hånda blir hengende |
| 8–11 | Trekker seg ut til 35 mm og går i sakte bue rundt ham, kvart sirkel | Han løfter en telefon. Skjermen lyser lime-grønt med enkle stolper. Gråtonen slipper |
| 11–14 | Buen bremser. **Sakte film** | Skuldrene senker seg. Han skyver døra igjen med den andre hånda. H2 og linje 14. «Ro». Linje 15 mot slutten |
| 14–16 | Kameraet dreier fra ham til budet | Budet setter seg på sykkelen og triller ut av gården |
| 16–18 | Kran opp og bakover, følger budet | Gården synker, takene kommer inn nedenfra, budet svinger ut i gata |
| 18–20 | 24 mm, takhøyde. Bremser til stille | Hele gata, trikken går, budet triller sykkelen, «månen» høyt i bildet. = N2 |

**Lys:** lyset inne i bilen er nøkkellyset fra siden, gatelykta er kantlys. Telefonen gir grønt gjenskinn på
jakka. Det er det sterkeste grønne i filmen før pulten.
**Tre plan:** vinduskarm, dørkant, skulder og lappen som flagrer forbi. Rørleggeren og budet. Det gule huset
og skumringen.
**Søm inn:** N5 fra T4. **Søm ut:** N2 til T6.
**9:16:** lappene henger i en **kolonne**, ikke en rekke, så hullet synes i høydeformat. Telefonen løftes til
midten av bildet med innskyv i stedet for bue. Kranen går rett opp og tilter til gata sett i lengderetningen.
**Baklengs:** kameraet synker fra takene, budet triller inn i gården, døra åpnes, telefonen senkes, og lappen
flyr tilbake på plass. Det leses som at papiret var der først.

```bash
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t5-16x9.txt)" \
  --start-image $N/n5-bakgard-16x9.png --end-image $N/n2-gata-16x9.png --image-references $N/n0-modellark-16x9.png \
  --duration 20 --aspect_ratio 16:9 --draft true --generate_audio false --wait
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t5-9x16.txt)" \
  --start-image $N/n5-bakgard-9x16.png --end-image $N/n2-gata-9x16.png --image-references $N/n0-modellark-16x9.png \
  --duration 20 --aspect_ratio 9:16 --draft true --generate_audio false --wait
```

---

### T6. Innrømmelsen (15 s)

**Bærer:** linje 16 (ved 0), linje 17 (ved 0,18). Rulleandel 64–74 %. Rulling: 1,2 skjermhøyder. Filmens
vendepunkt, og toppen begynner her.
**Historien:** budets runde er ferdig, og han triller hjem. Så stanser han midt i steget. **Vil (vi):** vise
noe som er sant. **Hinder:** alt vi har vist, har vi laget selv. **Endring:** vi viser pulten. På den ligger en
ekte, blank gul lapp ved siden av modellen, og bak den står de to hakene fra første bilde.
**Hvorfor kameraet gjør det:** det står stille først, fordi det er verden som stanser, ikke kameraet. Så
fortsetter det kranen fra T5 forbi kanten av verden, fordi det er det innrømmelsen er.
**Start:** N2. **Slutt:** N6 (pulten vid).
| Tid | Kamera | I bildet |
|---|---|---|
| 0–1 | 24 mm, takhøyde. Står helt stille | Trikken ruller de siste centimeterne. Linje 16: «Her må vi innrømme noe.» |
| 1–2 | Står | **Frys:** trikken stanser. Budet stopper midt i steget, med ett bein løftet. Alle figurene står |
| 2–4 | Kran opp og bakover, sakte start | Gata blir mindre. Kanten av sokkelen i tre glir inn nederst |
| 4–6 | Uttrekket øker farten | Treverket i pulten rundt modellen. Linje 17: «Gata står på pulten vår.» |
| 6–7 | Samme bevegelse | En blank gul lapp, en blyant og kanten av en kaffekopp passerer enorme og uskarpe tett på linsa. Lappen er like gul som budets |
| 7–9 | 35 mm. **Fokus flyttes** fra gata til rommet | Den varme skiva blir skjermen på en pultlampe |
| 9–12 | Uttrekket bremser og dreier svakt mot høyre | Tastatur, to skjermer med lime-grønne haker, tom stol. Modellen er liten og uskarp til venstre |
| 12–15 | Lander og står helt stille | = N6. Vinduet bak har ekte skumring |

**Lys:** det samme lyset hele veien. Det er poenget: pultlampa har lyst på gata hele filmen. Vinduet bak
pulten er den blå skumringen.
**Tre plan:** gul lapp, blyant og kopp. Modellen og skjermene. Vinduet.
**Søm inn:** N2 fra T5, uten hopp, kranen fortsetter. **Søm ut:** stillbildet `pult` (N6), som zoomes i CSS
inn mot utsnittet N1 mens linje 19 «siden du leser nå» står, og målingene låser seg.
**9:16:** kranen går **rett opp** med tilt bakover. Sokkelen kommer inn fra bunnen. Modellen blir liggende i
nedre halvdel, skjermene og stolen fyller øvre halvdel. Det er N6 i høydeformat.
**Baklengs:** kameraet dykker fra pulten inn i modellen, og figurene våkner. Det er slik dagens `pult-inn` er
laget, så den retningen er kjent og virker.
**Reserve:** hvis frysen ikke lar seg styre i modellen, lages T6 uten takten 0–2 s (13 s), og frysen legges
i motoren som et hold på første ramme.

```bash
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t6-16x9.txt)" \
  --start-image $N/n2-gata-16x9.png --end-image $N/n6-pult-16x9.png --image-references $N/n0-modellark-16x9.png \
  --duration 15 --aspect_ratio 16:9 --draft true --generate_audio false --wait
higgsfield generate create seedance_2_5 --mode omni_reference --prompt "$(cat $P/t6-9x16.txt)" \
  --start-image $N/n2-gata-9x16.png --end-image $N/n6-pult-9x16.png --image-references $N/n0-modellark-16x9.png \
  --duration 15 --aspect_ratio 9:16 --draft true --generate_audio false --wait
```

---

## 7. Hva dette betyr for motoren og filene

Dette er notater til `bevegelse` og `produsent`. Ingenting i `src/` eller `public/` er endret.

- **Segmentene i `film` (historie.ts) blir færre.** `dive-0` + `conn-0` blir ett segment (T2), `dive-1` +
  `conn-1` ett (T3), og så videre. Lengdene summeres. Linjenes `ved` står i hver tagning over.
- **Rulling per tagning:** T1 0,4 · T2 1,2 · T3 1,6 · T4 1,6 · T5 1,6 · T6 1,2 skjermhøyder (sum 7,6).
- **Jevn spoling.** Ingen tagning har kutt, blink eller raske lysskift, og de to raske bevegelsene varer 1,5 s
  (T1) og 1 s (T5). Ved 12,5 s film per skjermhøyde tilsvarer det ca. 0,12 og 0,08 skjermhøyder rulling.
- **Lineær spoling holder.** Taktene er lagt så de treffer rulleandelene i beat-arket innenfor ett
  prosentpoeng uten omregning av tiden.
- **Gråtonen** bør starte etter at kameraet har kommet inn i rommet i T4 (0,20) og T5 (0,15), ellers blir den
  grønne skjermen og bakgården grå i selve sømmen.
- **`retning: -1`** trengs ikke lenger for prologen og avsløringen (se «Regler for spoling»).
- **Stillbilder som må lages av de nye nøkkelbildene:** `hero` (N1), `pult` (N6), `poster-0..3` (første ramme
  i T2, T3, T4 og T5), `byen` (reserven: N2).
- **Sidevekt.** 95 s per format mot ca. 50 s i dag. Med samme koding (crf 28, GOP 8) blir det anslagsvis
  dobbelt så mange megabyte. Det er et anslag, ikke en måling. Revisor må måle, og `bevegelse` må vurdere
  lasting per kapittel.
- **N3 (figur i stolen ved kontakt)** er ikke dekket her. Med fotorealistisk pult kan den ikke være en
  leirefigur i samme bilde uten videre. Se åpne spørsmål.

---

## 8. Kostnad og rekkefølge

Alle tall er hentet med `higgsfield generate cost` 24. nov. 2026, med `--mode omni_reference`, start- og
sluttbilde og `--generate_audio false`. Kontoen: Ultra, 5564 kreditter.

**Satser (målt):** utkast 3 kreditter per sekund uansett oppløsning og format. 720p 7 per sekund. 1080p 16
per sekund. 16:9 og 9:16 koster likt. Lyd av eller på og `bitrate_mode high` endrer ikke prisen. Varighet:
4–30 s, hele sekunder (3 og 31 avvises).

| Tagning | Varighet | Utkast | 720p | 1080p |
|---|---|---|---|---|
| T1 Piskpanoreringen | 5 s | 15 | 35 | 80 |
| T2 Gata | 15 s | 45 | 105 | 240 |
| T3 Bakeriet | 20 s | 60 | 140 | 320 |
| T4 Kontoret | 20 s | 60 | 140 | 320 |
| T5 Rørleggeren | 20 s | 60 | 140 | 320 |
| T6 Innrømmelsen | 15 s | 45 | 105 | 240 |
| **Sum per format** | 95 s | **285** | **665** | **1520** |
| **Sum begge formater** | 190 s | **570** | **1330** | **3040** |

**Nøkkelbilder** (`gpt_image_2_6`, kvalitet high): 2 kreditter i 2k, 3,25 i 4k, samme med referansebilde.
Ett modellark, to i 4k (N6) og åtte i 2k: 24,5 kreditter. Med to kandidater av hvert: ca. 50.

| Løp | Kreditter | Igjen av 5564 |
|---|---|---|
| Nøkkelbilder, to kandidater | ca. 50 | |
| Utkast av alt, begge formater | 570 | |
| Endelig 1080p, begge formater | 3040 | |
| **Sum A: alt i 1080p** | **ca. 3660** | ca. 1900 til nye forsøk |
| Sum B: 16:9 i 1080p, 9:16 i 720p | ca. 2805 | ca. 2760 |

**Ukjent:** om et godkjent utkast kan gjøres ferdig med `--draft_job_id` til lavere pris. Overslaget med en
ugyldig id ga full pris (320 for 20 s i 1080p), så regn med full pris. Det er heller ikke bekreftet at
ferdigstilling beholder bevegelsen fra utkastet. Begge deler testes på første tagning.

**Avvik å kjenne til:** `higgsfield model get seedance_2_5` lister `4k`, og overslaget svarer 28 per sekund.
Dokumentasjonen sier at 2.5 stopper på 1080p. Planen bruker 1080p.

### Foreslått rekkefølge

1. **Bildene N0, N6 og N2** i 16:9 (ca. 15 kreditter med to kandidater). Eier ser på tre stillbilder: modellen,
   pulten og gata. Sitter ikke uttrykket her, endres promptene før det lages video.
2. **Utkast av T6 i 16:9 (45 kreditter).** Det er tagningen hele ideen står på: frysen og spranget fra leire
   til ekte pult. Den trenger bare de tre bildene fra steg 1.
3. **Bildene N3 og N4, og utkast av T3 i 16:9 (ca. 8 + 60 kreditter).** Det er tagningen som viser om
   følgekameraet, dybden og handlingen sitter.
4. **Stopp. Eier ser T6 og T3.** Brukt så langt: ca. 130 kreditter.
5. Ved ja: ferdigstill T6 i 1080p (240) og test `--draft_job_id` samtidig. Så resten av utkastene i 16:9,
   så 9:16, så endelige.
6. Ved nei: endre stilbibelen og promptene for T6 og T3 og lag de to utkastene på nytt (105).

---

## 9. Åpne spørsmål til eier

1. **Fotorealistisk pult.** Godtar du at pulten ser ekte ut, og at modellen er det eneste som er leire?
   Det endrer herobildet. Alternativet er å holde alt i leire som i dag, med svakere avsløring.
2. **Figurene beveger seg, og fryser i innrømmelsen.** Er det riktig tone, eller skal figurene være stille
   modellfigurer hele veien? Uten bevegelse mister vi følgetagningene.
3. **Kontoret ligger over bakeriet, og kameraet går gjennom taket.** Greit, eller skal de tre bedriftene være
   tydelig hver for seg?
4. **Budet og den gule lappen** som rød tråd. Er det riktig figur, eller skal en annen binde gata sammen?
   Historien viser én bestilling som går gjennom tre bedrifter. Det er illustrasjon, ikke en påstand om kunder.
5. **Grønt på bare fire steder.** Da forsvinner de små grønne lysene i gata fra dagens klipp. Loglinja sier
   «en gate full av grønne lys». Skal linja eller bildet vike?
6. **Oppløsning.** Alt i 1080p (ca. 3660 kreditter), eller mobil i 720p (ca. 2805)?
7. **Stolen ved kontakt (N3).** Med ekte pult kan vi ikke sette en leirefigur i stolen. Skal stolen stå tom
   til det ekte portrettet finnes, slik manusets alternative linje 28 sier?
8. **Sidevekt.** 95 s film er om lag dobbelt så mye video som i dag. Er det greit om kapitlene lastes ett om
   gangen, og hva er taket?
9. **Prologen.** Heroen blir N1, et utsnitt av pulten uten modellen i bildet. Er det greit at modellen først
   vises i avsløringen, selv om den «står der» hele tiden?
10. **Rullelengde.** Filmen blir 10,8 skjermhøyder mot 9,0 i dag hvis hver linje skal ha plass. Greit, eller
    skal den holdes på 9,0?

## Antakelser

- Platen med fortellerlinjene ligger nederst til venstre på skjerm og nederst på mobil. Derfor er nedre
  tredel i 9:16-bildene rolig og mørk. Ikke målt i nettleser.
- Seedance 2.5 treffer start- og sluttbilde godt nok til harde kutt (over 34 dB). Kling gjorde det med
  36–39 dB. Ikke testet med Seedance.
- Promptene for T3–T5 er 140–160 ord, like ved grensen på ca. 200 tokens. Gir de forvrengning, kuttes
  stilsetningen på slutten først.
- Seedance kan holde en leirefigur stabil gjennom 20 s, og kan spille fire handlingstakter i én tagning
  (T3–T5 har mest handling). Ikke testet. T3 i utkast svarer på det. Reserve: del handlingen i to tagninger
  på 10 s med et nøkkelbilde i midten.
