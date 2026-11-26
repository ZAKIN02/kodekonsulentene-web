# Filmmanus v3: ni tagninger etter prøveproduksjonen

Skrevet 24. nov. 2026, etter prøveproduksjonen `wow-r8-prove` (187,5 kreditter, saldo 5376,5). Erstatter
del 5–9 i `docs/design/regi/film-manus.md` (tagninger, nøkkelbilder, kommandoer, kostnad, spørsmål).
Del 1–4 der står fortsatt: hvorfor de gamle klippene er flate, historien på én side, den visuelle løsningen
og stilbibelen. De gamle promptfilene er urørt. Alle nye filer har `-v3` i navnet.

> **Oppdatert etter prøverunde 4:** del 10 nederst («Versjon 6») gjelder foran del 9, del 9 foran del 8, og
> del 8 foran del 1–7. Hvilken promptfil som gjelder for hver tagning og hvert bilde, står i tabellene i del 10.

Sett med egne øyne før dette ble skrevet: `.design/arbeid/regi/prove/t6-utkast-1-ark-1.jpg` og `-ark-2.jpg`,
`t6-utkast-1-sammenlign.jpg`, `t3-utkast-1-ark-1.jpg`, `t3-utkast-2-ark-2.jpg` og nøkkelbildet
`assets/higgsfield/regi/nokkel/n4-skjerm-16x9.png`.

---

## 1. Hva prøven viste

**Det som virker.** Uttrykket sitter: leire, makro, varmt lys mot blå skumring. Uttrekket i T6 forbi
sokkelkanten, lappen og koppen forbi linsa og landingen på pulten er filmens beste 15 sekunder så langt.
Posen over disken og lappen til budet i T3 skjer tydelig. Start- og sluttbildene treffes godt for øyet
(se `t6-utkast-1-sammenlign.jpg`), selv om PSNR er 18–19 dB.

**Det som ikke virker, og hva v3 gjør med det.**

| # | Funn i prøven | Endring i v3 | Hvorfor |
|---|---|---|---|
| 1 | T3: fire takter på 20 s ble ustabilt. Kameraet gikk gjennom murveggen, bakeren skiftet figur | T3 deles i T3a (ute, 10 s) og T3b (inne, 10 s) med nytt nøkkelbilde N3b. Mellom dem er det et ekte kutt i døra | Kameraet skal aldri gjennom en vegg. Et kutt i døra er ærligere enn en bevegelse modellen ikke klarer |
| 1 | Samme risiko i T4 og T5: fire takter hver | T4 deles i T4a (10 s) og T4b (12 s) med N4b rett ovenfra. T5 deles i T5a (10 s) og T5b (12 s) med N5b tett på hullet i rekka | Høyst tre handlinger per tagning. Nøkkelbildet i midten låser geografien |
| 2 | Kunden ga aldri opp | Én fysisk handling: «she drops the hand with the phone to her side and takes one step away from the door» | «Gives up» er en følelse. Modellen trenger en bevegelse |
| 3 | Ansikter forfra i nærbilde ved disken | Alle tagninger: «Figures are seen from behind or in profile, never facing the camera». N3b har bakeren i profil, bøyd over posen | Regelen om ansikter, og figurene er svakest forfra |
| 4 | Kameraet kjørte forbi sluttbildet (T3 utkast 2: 10 dB) | Alle tagninger slutter med «the camera stops and holds still on the end frame for the last two seconds» | «Pushes in exactly on the end frame» ble lest som en bevegelse som fortsetter |
| 5 | T6: frysen leses ikke, for figurene gikk aldri først | «0-1s: the tram rolls and the figures walk. 1-2s: the tram stops and every figure freezes mid-step» | En frys trenger bevegelse foran seg |
| 6 | T6: hakene spratt på ved 10,5 s | «the two monitors already show the lime-green check shapes when they enter the frame, the screens never switch on» | Hakene skal ha stått der hele tiden. Det er poenget med prologen |
| 7 | N6: damp fra koppen, neongrønne haker, budet sykler, gul blyant | Ny N6: tom kopp i stille luft, matt lime #C8F24A, budet triller sykkelen som i N2, blyant i tre. N2 er referanse | Damp beveger seg og kan ikke spoles. Budet må være likt i N2 og N6 |
| 7 | Skiva i himmelen ble ikke pultlampa | Ny N2: skiva står oppe til venstre, der lampa henger i N6. Forgrunnstaket og treet i N2 er fjernet | Skiva sto til høyre og lampa til venstre. Taket og treet fantes ikke på modellen |
| 8 | N4: butikk med markise i vinduet, skjermen lignet et bildeikon | Ny N4: bare mørk blå gate og trikken i vinduet, abstrakte stolper og prikker på skjermen | Geografien inne og ute skal stemme |
| 9 | Budet fikk gul veske, kunden laksrød kåpe | Nytt modellark N0: «no yellow except his cap and the paper slip», kunden i brun jakke, budet i grått, huset i gården er kremhvitt | Gult er papiret. Mer gult vanner ut tråden |
| | T3 utkast 1: lyskuler svevde ved mobilen | Produsentens v2-setning er beholdt: «the picture on the phone screen slowly changes from dull grey to warm colours, the light stays inside the screen» | Den virket i utkast 2 |
| | Sømmene: PSNR 18–19 dB mot mål 34 | Ny sømplan uten PSNR-krav, se del 2 | Utkast i 854 × 480 rammer inn litt annerledes enn nøkkelbildet |

**Forenkling i T4.** Kontorpulten har nå to skjermer og én lapp, ikke tre apparater. Det leses klarere
ovenfra: samme lapp, tastet to ganger. Fortellerlinje 10 nevner tre programmer. Bildet viser to av dem.

---

## 2. Sømmer uten PSNR-krav

Prøven viser at Seedance treffer nøkkelbildene i komposisjon, men ikke piksel for piksel. Et hardt kutt
mellom to nesten like bilder gir et lite hopp. Planen har fire ledd, i denne rekkefølgen:

1. **Stille i begge ender.** Hver tagning holder sluttbildet i to sekunder. Sømmen ligger da mellom to rolige
   bilder, ikke midt i en bevegelse.
2. **Kort krysstoning i motoren.** `bevegelse` legger en krysstoning over sømmen, ca. 0,05 skjermhøyder
   rulling (seks til åtte rammer av hver tagning). Mellom to stille og nesten like bilder leses det som et
   pust, ikke som en overgang. Dette er hovedgrepet, og det gjør at tagningene kan lages hver for seg og i
   vilkårlig rekkefølge.
3. **Kjeding der det ikke holder.** Hvis en søm fortsatt synes etter endelig koding, lages *den neste*
   tagningen på nytt med forrige tagnings faktiske siste ramme som `--start-image`:
   `ffmpeg -sseof -0.1 -i klipp/t2-16x9.mp4 -frames:v 1 -update 1 nokkel/t2-16x9-siste.png`.
   Sluttbildet er fortsatt nøkkelbildet. Kjeding brukes ikke som standard, fordi et nytt forsøk på én tagning
   da tvinger fram nye forsøk på alle etter den.
4. **Ekte kutt der historien har et.** T3a → T3b er et kutt i døra: hånda på håndtaket ute, kunden ved disken
   inne. Der skal bildene være forskjellige, og sømmen er et hardt kutt uten krysstoning.

**Stillbildene mot filmen.** `hero` (N1) møter første ramme i T1, og `pult` (N6) møter siste ramme i T6.
Begge sømmene er mellom et skarpt 4k-bilde og en videoramme. De krysstones på samme måte. Hvis T6 lander
synlig annerledes enn N6, lages N6 på nytt med T6s siste ramme som referanse (ca. 3 kreditter), og N1 klippes
ut av det nye bildet.

**Måling.** PSNR måles fortsatt og loggføres, men som opplysning. Avgjørelsen tas med øynene på en filmstripe
over sømmen i 1080p. Utkast i 480p sier lite om sømmene.

---

## 3. Tagningene: oversikt

**Ni tagninger, 99 sekunder per format** (ramme: 60–120 s).

| # | Navn | Varighet | Rulling (skjermhøyder) | Linjer | Hvem vi følger | Start → slutt | Søm ut |
|---|---|---|---|---|---|---|---|
| T1 | Piskpanoreringen | 5 s | 0,4 | 3 | Vi | N1 → N2 | Krysstoning |
| T2 | Gata | 15 s | 1,2 | 4, 5, 6 | Budet | N2 → N3 | Krysstoning |
| T3a | Bakeriet, ute | 10 s | 0,8 | 7, 8 | Kunden | N3 → (fri slutt ved døra) | **Kutt** |
| T3b | Bakeriet, inne | 10 s | 0,8 | 8, 9 | Kunden, så budet | N3b → N4 | Krysstoning |
| T4a | Kontoret, lappen | 10 s | 0,8 | 10 | Kontordama | N4 → N4b | Krysstoning |
| T4b | Kontoret, kalenderen | 12 s | 0,9 | 11, 12 | Kontordama | N4b → N5 | Krysstoning |
| T5a | Rørleggeren, lappen | 10 s | 0,8 | 13 | Rørleggeren | N5 → N5b | Krysstoning |
| T5b | Rørleggeren, telefonen | 12 s | 0,9 | 14, 15 | Rørleggeren, så budet | N5b → N2 | Krysstoning |
| T6 | Innrømmelsen | 15 s | 1,2 | 16, 17 | Budet, så oss | N2 → N6 | Krysstoning til `pult` |
| | **Sum film** | **99 s** | **7,8** | | | | |

Med stillbildene (hero og prolog 0,9, pulten med målingene 2,3) blir filmen 11,0 skjermhøyder. Farten er ca.
12,5 s film per skjermhøyde i alle tagninger. De to sekundene med stille på slutten av hver tagning er der
linja skifter. `bevegelse` kan kutte i dem hvis rullingen kjennes lang.

### Nøkkelbilder

| Bilde | Hva | Promptfil | Fil (`nokkel/`, og `-9x16`) | Status |
|---|---|---|---|---|
| N0 | Modellark | `k0-modellark-16x9-v3.txt` | `n0-modellark-16x9-v3.png` | **Lages på nytt** (fargeregelen) |
| N2 | Gata vid | `t1-slutt-*-v3.txt` | `n2-gata-16x9-v3.png` | **Lages på nytt** (gul veske, tak og tre i forgrunnen, skiva) |
| N6 | Pulten vid | `t6-slutt-*-v3.txt` | `n6-pult-16x9-v3.png` | **Lages på nytt** (damp, hakefarge, budet, blyant) |
| N1 | Hero | Utsnitt av N6 v3 | `n1-hero-16x9-v3.png` | Klippes ut på nytt, 0 kreditter |
| N3 | Bak kunden ute | `t2-slutt-*.txt` (uendret) | `n3-bakeri-ute-16x9.png` | **Beholdes.** Brun kåpe, sett bakfra, ingen gul veske i bildet |
| N3b | Inne ved disken | `t3b-start-*-v3.txt` | `n3b-bakeri-inne-16x9-v3.png` | **Nytt** |
| N4 | Skjermen bak disken | `t3b-slutt-*-v3.txt` | `n4-skjerm-16x9-v3.png` | **Lages på nytt** (vinduet, skjermen) |
| N4b | Kontorpulten rett ovenfra | `t4a-slutt-*-v3.txt` | `n4b-kontor-ovenfra-16x9-v3.png` | **Nytt** |
| N5 | Bakgården fra vinduet | `t4b-slutt-*-v3.txt` | `n5-bakgard-16x9-v3.png` | Nytt (ble ikke laget i prøven) |
| N5b | Rekka av lapper med hull | `t5a-slutt-*-v3.txt` | `n5b-lapper-16x9-v3.png` | **Nytt** |

16:9: åtte bilder lages (N0, N2, N6, N3b, N4, N4b, N5, N5b). 9:16: åtte bilder (N2, N3, N3b, N4, N4b, N5,
N5b, N6). N0 finnes bare i 16:9.

```bash
cd /Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web
P=assets/higgsfield/regi/prompter; N=assets/higgsfield/regi/nokkel
bilde() { # bilde <promptfil> <format> <oppløsning> <referanse>...
  local f=$1 a=$2 r=$3; shift 3; local ref=(); for x in "$@"; do ref+=(--image-references "$x"); done
  higgsfield generate create gpt_image_2_6 --prompt "$(cat "$P/$f")" "${ref[@]}" \
    --aspect_ratio "$a" --resolution "$r" --quality high --wait
}
bilde k0-modellark-16x9-v3.txt 16:9 2k                                         # -> $N/n0-modellark-16x9-v3.png
bilde t1-slutt-16x9-v3.txt     16:9 2k $N/n0-modellark-16x9-v3.png              # -> $N/n2-gata-16x9-v3.png
bilde t6-slutt-16x9-v3.txt     16:9 4k $N/n0-modellark-16x9-v3.png $N/n2-gata-16x9-v3.png   # -> n6-pult-16x9-v3.png
bilde t3b-start-16x9-v3.txt    16:9 2k $N/n0-modellark-16x9-v3.png $N/n3-bakeri-ute-16x9.png # -> n3b-bakeri-inne-16x9-v3.png
bilde t3b-slutt-16x9-v3.txt    16:9 2k $N/n3b-bakeri-inne-16x9-v3.png           # -> n4-skjerm-16x9-v3.png
bilde t4a-slutt-16x9-v3.txt    16:9 2k $N/n0-modellark-16x9-v3.png              # -> n4b-kontor-ovenfra-16x9-v3.png
bilde t4b-slutt-16x9-v3.txt    16:9 2k $N/n0-modellark-16x9-v3.png $N/n2-gata-16x9-v3.png   # -> n5-bakgard-16x9-v3.png
bilde t5a-slutt-16x9-v3.txt    16:9 2k $N/n0-modellark-16x9-v3.png $N/n5-bakgard-16x9-v3.png # -> n5b-lapper-16x9-v3.png
ffmpeg -i $N/n6-pult-16x9-v3.png -vf "crop=iw*0.55:ih*0.55:iw*0.45:ih*0.20" $N/n1-hero-16x9-v3.png
# 9:16: samme funksjon med -9x16-v3.txt og 9:16, og 16:9-bildet av samme motiv som ekstra referanse.
# N3 i 9:16: bilde t2-slutt-9x16.txt 9:16 2k $N/n0-modellark-16x9-v3.png $N/n3-bakeri-ute-16x9.png
```

Funksjonen er skrevet for zsh og bash uten orddeling av variabler, fordi `set -- $par` i forrige versjon
sendte fire jobber med tom prompt.

Kontroll med Read før et bilde brukes: gult bare på lue og lapp, lime bare på skjermene som skal ha det,
ingen damp, ingen ansikter forfra, ingen tekst, stolen tom, budet triller sykkelen.

---

## 4. Opptaksmanus v3

Felles: Seedance 2.5, `--mode omni_reference`, `--generate_audio false`, N0 v3 som referanse. Alle figurer
sees bakfra eller i profil. Alle tagninger står stille på sluttbildet de to siste sekundene.

```bash
tagning() { # tagning <navn> <format 16x9|9x16> <sekunder> <start> <slutt eller -> [utkast|1080p|720p]
  local t=$1 f=$2 d=$3 s=$4 e=$5 q=${6:-utkast}; local a=${f/x/:}
  local arg=(--mode omni_reference --prompt "$(cat "$P/$t-$f-v3.txt")" --start-image "$s"
             --image-references "$N/n0-modellark-16x9-v3.png" --duration "$d" --aspect_ratio "$a"
             --generate_audio false --wait)
  [ "$e" != "-" ] && arg+=(--end-image "$e")
  [ "$q" = utkast ] && arg+=(--draft true) || arg+=(--resolution "$q")
  higgsfield generate create seedance_2_5 "${arg[@]}"
}
```

Kommandoen under hver tagning er utkastet i 16:9. For 9:16 byttes `16x9` med `9x16` i alle tre argumentene.
For endelig versjon legges `1080p` (eller `720p`) til som siste argument.

### T1. Piskpanoreringen (5 s, 0,4 skjermhøyder, linje 3)

Uendret i innhold. Endret: panoreringen starter ved 1,5 s og er ferdig ved 3 s, så kameraet rekker å stå
stille på gata i to sekunder. Skiva i himmelen står nå oppe til venstre.

| Tid | Kamera | I bildet |
|---|---|---|
| 0–1,5 | Sakte innskyv mot skjermene | Hakene lyser, stolen er tom |
| 1,5–3 | Piskpanorering mot venstre og ned, 1,5 s, jevn lysstyrke | Striper i rav og blått |
| 3–5 | Lander og står | Gata. Trikken ruller, figurene går |

```bash
tagning t1 16x9 5 $N/n1-hero-16x9-v3.png $N/n2-gata-16x9-v3.png
```

### T2. Gata (15 s, 1,2 skjermhøyder, linje 4–6)

Endret: budet følges **bakfra**. Han setter sykkelen mot veggen og går ut av bildet mot døra. Vi ser ham ikke
gå inn. Kameraet står stille bak kunden fra 13 s.

| Tid | Kamera | I bildet |
|---|---|---|
| 0–4 | Kran ned fra takhøyde til brosteinen | Trikken sklir forbi tett på linsa. Linje 4 |
| 4–10 | Følger budet bakfra i hoftehøyde | Gul lue, sykkel, gul lapp i hånda. Figurer krysser forgrunnen. Linje 5 |
| 10–13 | Kameraet glir fra budet til kunden | Han setter sykkelen mot bakeriveggen og går ut av bildet mot døra. Linje 6 |
| 13–15 | Står | Bak kunden med mobilen. = N3 |

```bash
tagning t2 16x9 15 $N/n2-gata-16x9-v3.png $N/n3-bakeri-ute-16x9.png
```

### T3a. Bakeriet, ute (10 s, 0,8 skjermhøyder, linje 7 og H2 med linje 8)

**Vil:** bestille brød. **Hinder:** siden laster ikke. **Endring:** den laster, og hun går mot døra.
Kameraet blir ute hele tagningen. Ingen sluttbilde: tagningen slutter fritt med hånda på håndtaket.

| Tid | Kamera | I bildet | Motor |
|---|---|---|---|
| 0–3 | Sakte innskyv over skulderen | Mobilen er grå. Hun trykker og venter | Linje 7, gråtone |
| 3–5 | Bremser | **Hun slipper hånda med mobilen ned langs siden og tar ett steg bort fra døra** | |
| 5–7 | Står nesten stille | Bildet på mobilen går sakte fra grått til varme farger. Hun stanser og løfter den igjen | Gråtonen slipper (`gronnVed` 0,5) |
| 7–8 | Følger et halvt skritt | Hun går tilbake til døra og legger hånda på håndtaket | H2 og linje 8 |
| 8–10 | Står | Bak henne ved den lukkede døra | «Ro» |

**Søm ut:** hardt kutt til N3b. **Baklengs:** hun slipper håndtaket, går et steg bort, mobilen blir grå.

```bash
tagning t3a 16x9 10 $N/n3-bakeri-ute-16x9.png -
```

### T3b. Bakeriet, inne (10 s, 0,8 skjermhøyder, linje 8 fortsetter, linje 9)

**Start:** N3b: inne, bak kunden ved disken, bakeren i profil bak disken, budet ved enden, hel murvegg mot
gata. **Slutt:** N4 v3.

| Tid | Kamera | I bildet | Motor |
|---|---|---|---|
| 0–4 | Sakte dolly sidelengs langs disken, brød tett på linsa | Bakeren rekker posen over disken i sakte film. Hun tar imot | Linje 8 står |
| 4–6 | Samme bevegelse | Den samme bakeren river av en gul lapp og gir den til budet ved enden av disken | |
| 6–8 | Glir forbi dem, bak disken | Den lille skjermen lyser lime-grønt | Linje 9 |
| 8–10 | Står | = N4 | |

**9:16:** kameraet går inn i dybden mot disken og stiger over den til skjermen.

```bash
tagning t3b 16x9 10 $N/n3b-bakeri-inne-16x9-v3.png $N/n4-skjerm-16x9-v3.png
```

### T4a. Kontoret, lappen (10 s, 0,8 skjermhøyder, linje 10)

**Vil:** få ført bilaget og gå hjem. **Hinder:** samme lapp må tastes inn to ganger. Lappen ligger allerede
på pulten når vi kommer opp. Budet er ikke i bildet (én handling mindre).

| Tid | Kamera | I bildet | Motor |
|---|---|---|---|
| 0–3 | Kran rett opp fra skjermen, gjennom den tynne takplata | Kontoret, bak en kvinne ved en pult. En gul lapp på pulten | Gråtone fra 0,3 |
| 3–5 | Fortsetter opp og tilter rett ned | Pulten dreier seg under oss | Linje 10 |
| 5–8 | Rett ovenfra, nesten stille | **Hun taster fra lappen inn i den bærbare, skyver lappen bort til nettbrettet og taster det samme en gang til** | |
| 8–10 | Står | = N4b | |

```bash
tagning t4a 16x9 10 $N/n4-skjerm-16x9-v3.png $N/n4b-kontor-ovenfra-16x9-v3.png
```

### T4b. Kontoret, kalenderen (12 s, 0,9 skjermhøyder, H2 med linje 11, linje 12)

**Endring:** de to skjermene blir én kalender. Hun legger lappen i skuffen og lener seg tilbake.

| Tid | Kamera | I bildet | Motor |
|---|---|---|---|
| 0–4 | Sakte bue ned fra rett ovenfra til over skulderen | Skjermene går sakte over i én felles kalender med fargeblokker. Hun legger lappen i skuffen | Gråtonen slipper ved 0,15. H2 og linje 11 |
| 4–6 | Bremser | Hun lener seg tilbake. Én ny blokk kommer inn i kalenderen | «Ro». Linje 12 |
| 6–10 | Panorerer til vinduet, ut over karmen, tilter ned | Bakgården: varebilen, rørleggeren, budet på vei inn | |
| 10–12 | Står | = N5 | |

```bash
tagning t4b 16x9 12 $N/n4b-kontor-ovenfra-16x9-v3.png $N/n5-bakgard-16x9-v3.png
```

### T5a. Rørleggeren, lappen (10 s, 0,8 skjermhøyder, linje 13)

**Vil:** vite hva neste jobb er. **Hinder:** vinden tar en lapp.

| Tid | Kamera | I bildet | Motor |
|---|---|---|---|
| 0–3 | Kran ned fra vinduet til hoftehøyde bak rørleggeren | Budet gir ham en gul lapp | Gråtone fra 0,2 |
| 3–5 | Bremser | Han teiper lappen inn i rekka i bilen | Linje 13 |
| 5–8 | Zoom forbi skulderen hans, 1 s, myk start og landing | **Et vindkast løfter én lapp, den flagrer ut forbi linsa. Han griper i lufta og bommer.** Hullet i rekka | |
| 8–10 | Står | = N5b: rekka med hull, hånda hans åpen | |

```bash
tagning t5a 16x9 10 $N/n5-bakgard-16x9-v3.png $N/n5b-lapper-16x9-v3.png
```

### T5b. Rørleggeren, telefonen (12 s, 0,9 skjermhøyder, H2 med linje 14, linje 15)

**Endring:** jobben står på telefonen. Budet triller ut, og kameraet følger ham opp til hele gata.

| Tid | Kamera | I bildet | Motor |
|---|---|---|---|
| 0–4 | Trekker seg ut fra hullet og går i sakte bue bak ham | Han løfter en telefon som lyser lime-grønt med stolper. Skuldrene senker seg | Gråtonen slipper ved 0,15. H2 og linje 14 |
| 4–6 | Bremser. Sakte film | Han skyver bildøra igjen | «Ro». Linje 15 |
| 6–10 | Kran opp, følger budet over takene | Budet triller sykkelen ut av gården. Gata åpner seg | |
| 10–12 | Står | = N2 | |

```bash
tagning t5b 16x9 12 $N/n5b-lapper-16x9-v3.png $N/n2-gata-16x9-v3.png
```

### T6. Innrømmelsen (15 s, 1,2 skjermhøyder, linje 16–17)

Bevegelsen fra utkastet beholdes. Endret: figurene går først og fryser så, hakene står på fra de kommer inn
i bildet, koppen er tom og lufta stille, skiva står der lampa henger, og kameraet står stille fra 13 s.

| Tid | Kamera | I bildet | Motor |
|---|---|---|---|
| 0–1 | Står helt stille | Trikken ruller, figurene går, budet triller sykkelen | Linje 16 |
| 1–2 | Står | **Frys:** trikken stanser, alle stopper midt i steget | |
| 2–7 | Kran opp og bakover | Sokkelkanten, så pulten. Gul lapp, blyant og tom kopp forbi linsa | Linje 17 ved 0,18 |
| 7–13 | Fortsetter, fokus flyttes til rommet | Skiva blir lampeskjermen. Skjermene kommer inn med hakene allerede på. Tom stol | |
| 13–15 | Står | = N6 v3. Figurene står fortsatt | Krysstoning til `pult` |

```bash
tagning t6 16x9 15 $N/n2-gata-16x9-v3.png $N/n6-pult-16x9-v3.png
```

---

## 5. Kostnad

Målt med `higgsfield generate cost` 24. nov. 2026. Saldo: 5376,5 kreditter.

| Tagning | Varighet | Utkast | 720p | 1080p |
|---|---|---|---|---|
| T1 | 5 s | 15 | 35 | 80 |
| T2 | 15 s | 45 | 105 | 240 |
| T3a | 10 s | 30 | 70 | 160 |
| T3b | 10 s | 30 | 70 | 160 |
| T4a | 10 s | 30 | 70 | 160 |
| T4b | 12 s | 36 | 84 | 192 |
| T5a | 10 s | 30 | 70 | 160 |
| T5b | 12 s | 36 | 84 | 192 |
| T6 | 15 s | 45 | 105 | 240 |
| **Sum per format** | 99 s | **297** | **693** | **1584** |
| **Sum begge formater** | 198 s | **594** | **1386** | **3168** |

Nøkkelbilder (`gpt_image_2_6`, high: 2 i 2k, 3,25 i 4k): 16 bilder, hvorav to i 4k, gir 34,5. Med to
kandidater av hvert: 69.

| Løp | Kreditter | Igjen av 5376,5 |
|---|---|---|
| Nøkkelbilder, to kandidater, begge formater | 69 | |
| Utkast av alt, begge formater | 594 | |
| Endelig 1080p, begge formater | 3168 | |
| **Sum A: alt i 1080p** | **3831** | ca. 1545 til nye forsøk |
| Sum B: 16:9 i 1080p, 9:16 i 720p | 2940 | ca. 2435 |
| Sum C: som B, men utkast bare i 16:9 | 2643 | ca. 2730 |

Mot v2 er filmen 4 s lengre (holdene), og utkast og endelig koster 12 og 64 kreditter mer per format.
Prøven brukte 1,5 utkast per godkjent tagning. Med samme rate i endelig kvalitet holder ikke sum A. Derfor
bør hvert utkast være godkjent før tagningen lages i 1080p.

### Neste prøve (ca. 130 kreditter)

1. Bilder i 16:9, to kandidater: N0, N2, N6 (4k), N3b, N4. 22,5 kreditter. Sjekk fargeregelen i N0 før resten.
2. Utkast T6 v3 (45). Spørsmålet: leses frysen, og står hakene på hele veien?
3. Utkast T3a v3 (30). Spørsmålet: slipper hun hånda og tar steget bort?
4. Utkast T3b v3 (30). Spørsmålet: holder veggene, og er det samme baker hele veien?
5. Stopp. Eier ser T6, T3a og T3b etter hverandre, med kuttet i døra.
6. Deretter én tagning i 1080p (T6, 240) for å se hva sømmen mot N6 blir i full oppløsning, og for å teste
   `--draft_job_id`.

---

## 6. Til `bevegelse` og `produsent`

- Ni segmenter, lengder som i tabellen i del 3. T1 og T6 spilles forover.
- Krysstoning i alle sømmer unntatt T3a → T3b, som er et hardt kutt.
- Gråtonen: T3a fra 0 til 0,5. T4a fra 0,3 og ut, T4b til 0,15. T5a fra 0,2 og ut, T5b til 0,15. Gråtonen
  går altså over en søm i kontoret og hos rørleggeren. Det krever at tilstanden følger med over sømmen.
- Stillbilder: `hero` = N1 v3, `pult` = N6 v3, `byen` = N2 v3. Kapittelbildene (uten JS) er N2, N3, N4b
  og N5.
- Produsenten logger PSNR i sømmene som opplysning og lager en filmstripe på 12 rammer over hver søm.

---

## 7. Åpne spørsmål til eier

Spørsmål 1–10 i `film-manus.md` står. Nye etter prøven:

11. **Kutt i døra.** Kameraet går ikke lenger inn i bakeriet. Det klippes fra hånda på håndtaket til disken.
    Det er det ene kuttet i filmen. Greit?
12. **Ni tagninger i stedet for seks.** Tre av de lange er delt i to for at handlingen skal holde. De henger
    sammen i bevegelse (samme kamera fortsetter fra et stillestående bilde). Greit, eller skal vi prøve én
    lang tagning til?
13. **To skjermer på kontoret**, ikke tre. Linje 10 sier «booking, betaling og regnskap». Skal bildet ha tre,
    med større risiko for rot, eller holder to?
14. **To sekunder stille i slutten av hver tagning.** Det gir ro til linjene og trygge sømmer, men 18 av 99
    sekunder er stillstand. Er det for rolig?

## Antakelser

- Krysstoning over seks til åtte rammer skjuler forskjellen mellom to stille og nesten like bilder. Ikke
  testet. `t6-utkast-1-sammenlign.jpg` tyder på at forskjellen er liten nok, men det er 480p.
- Den fysiske gi-opp-handlingen, frysen og «never switch on» virker som skrevet. Ingen av dem er testet.
- Bildepromptene for N0, N2 og N6 er 158–162 ord, litt over anbefalingen på ca. 200 tokens. De første
  bildepromptene var like lange og ga brukbare bilder.
- Linje 8 står over kuttet i døra (slutten av T3a og starten av T3b). Platen holder linja gjennom kuttet.

---

## 8. Versjon 4 (etter prøverunde 2)

Skrevet 24. nov. 2026 etter `wow-r8-prove-2` (127,5 kreditter, saldo 5249). Poeng: T6 15/18, T3a 15/18,
T3b 14/18. Sett med egne øyne: `.design/arbeid/regi/prove-2/t6-v3-utkast-1-ark-1.jpg` og `-ark-2.jpg`,
`t3a-v3-utkast-1-ark-2.jpg`, `t3b-v3-utkast-1-ark-1.jpg` og `t3b-v3-utkast-1-sammenlign-slutt.jpg`.

**Det som nå sitter:** frysen finnes (men er kort), hakene står på fra de kommer inn, ingen damp, kunden er
samme figur gjennom T3a og T3b, veggene i bakeriet holder, samme baker hele veien, lappen går tydelig fra
bakeren til budet, og kameraet står stille på sluttbildet.

### Endringer i v4

| # | Funn i runde 2 | Endring | Hvorfor |
|---|---|---|---|
| 1 | Kunden var korthåret mann i N0, N2 og N6, og kvinne med knute i N3, T3a og N3b | Kunden beskrives likt overalt: «a woman with her dark hair in a bun, a brown coat and a beige tote bag». N0, N2 og N6 lages på nytt. N2 får N3 som ekstra referanse | Én figur per rolle. Avsløringen virker bare hvis figurene på pulten er de vi har fulgt |
| 2 | T3b: bakeren sto forfra mot kamera i 1,5–6,2 s | «The baker stays in profile the whole shot, facing right.» Posen skyves langs disken i stedet for å rekkes over den, og lappen gis mot høyre | Å rekke noe mot kunden snur ham mot kameraet. Å skyve sidelengs gjør det ikke |
| 3 | T3b: dobbelteksponering 5,5–6,6 s. Skjermen hadde hyller bak seg i N3b og vindu bak seg i N4, og byttet ramme | Ny N4 lages med N3b som referanse: samme skjerm med svart ramme, samme sted, hyllene bak, ikke noe vindu. Prompten sier «the counter screen stands in the same place the whole shot» og «everything stays solid and opaque» | Modellen tonet mellom to rom fordi start- og sluttbildet viste to rom |
| 4 | T6: skiva gikk ut av bildet ved 2,5 s, og lampa kom inn ved 11,5 s | **Takten er strøket.** Setningen «the warm disc becomes the shade of a desk lamp» er ute av prompten | Se under |
| 5 | T6: frysen varte 0,6 s, og bevegelsen før var liten | «0-2s: the tram rolls a full tram length, every figure takes several clear walking steps. 2-3s: the tram stops and every figure freezes mid-step, one foot lifted; nothing moves for a full second.» Uttrekket starter ved 3 s | En frys leses bare mot tydelig bevegelse, og den må vare lenge nok til å bli sett når man ruller |
| 6 | N6: linjalen fikk tall-lignende merker i nærbilde | Ingen linjal. Ved modellen ligger bare blyant, tom kopp og gul lapp. Tastaturet har blanke taster | Regelen om tekst og tall |
| 7 | N2: «rooftop height» ga et forgrunnstak som ble en uskarp kloss i T6 | «High wide view looking down at the street», «nothing stands in the foreground», åpen brostein i nedre tredel. Lykta i forgrunnen er også ute | Alt i forgrunnen av N2 må kameraet gjennom i T6 |
| 8 | T3a: hun ble stående, hånda landet på dørkarmen, stille bare siste 0,8 s | «She lowers the phone, turns away from the door to the left and walks two steps toward the tram», «closes her hand around the round brass door handle, the handle clearly visible», «nobody moves; the camera holds completely still for the last two seconds» | Et steg må ha en retning i bildet. Håndtaket må nevnes for å finnes |

**Punkt 4, valget.** Jeg stryker takten der skiva blir lampa. For at skiva skal være i bildet til lampa tar
over, må kameraet holde himmelen i bildet gjennom hele uttrekket. Da kan det ikke gå lavt forbi sokkelkanten
og la lappen, blyanten og koppen passere linsa, og det er de sekundene som fungerer best i begge utkastene.
Skiva blir stående i N2, oppe til venstre, og lampa henger oppe til venstre i N6. Den som ser etter, finner
sammenhengen. Den som ikke gjør det, mister ingenting. Setningen i `film-manus.md` om at «månen er
pultlampa» er dermed en stille ledetråd og ikke en takt i T6.

### Samme lærdom på tagningene som ikke er prøvd

| Tagning | Endring i v4 | Lærdom |
|---|---|---|
| T1 | «Rooftop height» er ute. Ellers uendret | Punkt 7 |
| T2 | Kran ned «from high above the street». Budet følges bakfra. Kunden er «the same woman with the hair bun, brown coat and tote bag» | Punkt 1 og 7 |
| T4a | **Starter inne på kontoret, ikke i bakeriet.** Nytt nøkkelbilde N4a: bak kontordama ved pulten. Kameraet stiger over hodet hennes til rett ovenfra. Sømmen T3b → T4a blir et hardt kutt | Punkt 3: start- og sluttbilde i samme rom. Kranen gjennom taket gikk fra ett rom til et annet og ville gitt samme dobbelteksponering |
| T4a, T4b | Kontordama har kort grått hår og mørkeblå jakke, så hun ikke forveksles med kunden. Blanke taster, «plain colour blocks» | Punkt 1 og 6 |
| T4b | «The window of the same room», kameraet går fram til karmen og tilter ned. N5 lages med N4a som referanse for vinduet | Punkt 3. Dette er tagningen med størst gjenstående risiko: sluttbildet ser ut av rommet. Reserve: T4b slutter fritt ved kalenderen, og T5a starter med hardt kutt |
| T5a | «In one backyard». Budet sees bakfra når han gir lappen. N5b lages med N5 som referanse | Punkt 2 og 3 |
| T5b | Kameraet blir bak rørleggeren (buen rundt ham er ute). Budet triller sykkelen ut, sett bakfra | Punkt 2 |
| Alle | «Everything stays solid and opaque» i stilsetningen | Punkt 3 |

**Kutt i filmen.** Det er nå to harde kutt: i døra (T3a → T3b) og opp til kontoret (T3b → T4a). Ledetråden
med den tynne takplata er dermed ute. Den kan prøves senere som en egen kort tagning hvis eier vil ha den.

### Tagningene i v4

Varigheter og rulling er som i del 3 (99 s, 7,8 skjermhøyder). Det som er endret i takter:

| # | Takter i v4 | Start → slutt | Søm ut |
|---|---|---|---|
| T1 | 0–1,5 innskyv · 1,5–3 piskpanorering · 3–5 stille på gata | N1 → N2 | Krysstoning |
| T2 | 0–4 kran ned, trikken visker · 4–10 følger budet bakfra · 10–13 han setter sykkelen og går ut, kameraet til kunden · 13–15 stille | N2 → N3 | Krysstoning |
| T3a | 0–2 innskyv, hun trykker · 2–4,5 senker mobilen, snur seg og går to steg mot trikken · 4,5–6,5 mobilen får farger, hun stanser · 6,5–8 tilbake til døra, hånda rundt håndtaket · 8–10 helt stille | N3 → fri slutt | **Kutt** |
| T3b | 0–3 bakeren skyver posen langs disken til henne · 3–6 samme baker river av gul lapp og gir den mot høyre til budet, kameraet går mot høyre · 6–8 forbi budets skulder til skjermen · 8–10 stille | N3b → N4 | **Kutt** |
| T4a | 0–3 kran opp over hodet hennes til rett ovenfra · 3–5,5 hun taster på den bærbare, hånda på lappen · 5,5–8 skyver lappen til nettbrettet og taster det samme igjen · 8–10 stille | N4a → N4b | Krysstoning |
| T4b | 0–4 bue ned til skulderen, skjermene viser samme kalender, lappen i skuffen · 4–6 hun lener seg tilbake, ny blokk · 6–10 til vinduet, fram til karmen, ned i gården · 10–12 stille | N4b → N5 | Krysstoning |
| T5a | 0–3 kran ned, budet gir lappen · 3–5 han teiper den opp · 5–8 vinden tar en lapp, han bommer, zoom til hullet · 8–10 stille | N5 → N5b | Krysstoning |
| T5b | 0–4 ut fra hullet, bak ham, telefonen lyser · 4–6 døra skyves igjen · 6–10 budet triller ut, kran opp til hele gata · 10–12 stille | N5b → N2 | Krysstoning |
| T6 | 0–2 trikken ruller en hel trikkelengde, alle går · 2–3 frys, ett sekund · 3–8 kran opp og ut, lapp, blyant og kopp forbi linsa · 8–13 fokus til rommet, hakene står på · 13–15 stille | N2 → N6 | Krysstoning til `pult` |

Motoren: gråtonen i T3a slipper ved 0,55 (mobilen får farger ved 4,5–6,5 s). Linje 16 står gjennom de tre
første sekundene av T6, og linje 17 kommer ved 0,22.

### Nøkkelbilder i v4

| Bilde | Promptfil | Fil (`nokkel/`) | Referanser | Status |
|---|---|---|---|---|
| N0 | `k0-modellark-16x9-v4.txt` | `n0-modellark-16x9-v4.png` | ingen | **Lages på nytt** (kunden) |
| N2 | `t1-slutt-*-v4.txt` | `n2-gata-16x9-v4.png` | N0 v4, N3 | **Lages på nytt** (kunden, forgrunnen) |
| N6 | `t6-slutt-*-v4.txt` | `n6-pult-16x9-v4.png` (4k) | N0 v4, N2 v4 | **Lages på nytt** (kunden, linjalen) |
| N1 | utsnitt av N6 v4 | `n1-hero-16x9-v4.png` | | Klippes ut, 0 kreditter |
| N3 | `t2-slutt-*.txt` | `n3-bakeri-ute-16x9.png` | | **Beholdes** |
| N3b | `t3b-start-*-v3.txt` | `n3b-bakeri-inne-16x9-v3.png` | | **Beholdes** (16:9). Lages i 9:16 |
| N4 | `t3b-slutt-*-v4.txt` | `n4-skjerm-16x9-v4.png` | N3b | **Lages på nytt** (samme skjerm, hyller bak) |
| N4a | `t4a-start-*-v4.txt` | `n4a-kontor-16x9-v4.png` | N0 v4 | **Nytt** |
| N4b | `t4a-slutt-*-v4.txt` | `n4b-kontor-ovenfra-16x9-v4.png` | N4a | Nytt |
| N5 | `t4b-slutt-*-v4.txt` | `n5-bakgard-16x9-v4.png` | N0 v4, N4a | Nytt |
| N5b | `t5a-slutt-*-v4.txt` | `n5b-lapper-16x9-v4.png` | N5 | Nytt |

16:9: åtte bilder lages (N0, N2, N6, N4, N4a, N4b, N5, N5b). 9:16: ni bilder (N2, N3, N3b, N4, N4a, N4b, N5,
N5b, N6), hvert med 16:9-bildet av samme motiv som ekstra referanse.

Rekkefølgen følger referansene: N0 → N2 → N6 → N4 → N4a → N4b og N5 → N5b. Kontroll med Read som før, og i
tillegg: er kunden kvinnen med knute i N0, N2 og N6, og har N4 samme skjerm og hyller som N3b.

### Kommandoer i v4

Funksjonene `bilde` og `tagning` fra del 3 og 4 brukes. `tagning` får versjonen som siste argument, og
referansearket er N0 v4:

```bash
P=assets/higgsfield/regi/prompter; N=assets/higgsfield/regi/nokkel
tagning() { # tagning <navn> <16x9|9x16> <sekunder> <start> <slutt eller -> [utkast|1080p|720p] [versjon]
  local t=$1 f=$2 d=$3 s=$4 e=$5 q=${6:-utkast} v=${7:-v4}; local a=${f/x/:}
  local arg=(--mode omni_reference --prompt "$(cat "$P/$t-$f-$v.txt")" --start-image "$s"
             --image-references "$N/n0-modellark-16x9-v4.png" --duration "$d" --aspect_ratio "$a"
             --generate_audio false --wait)
  [ "$e" != "-" ] && arg+=(--end-image "$e")
  [ "$q" = utkast ] && arg+=(--draft true) || arg+=(--resolution "$q")
  higgsfield generate create seedance_2_5 "${arg[@]}"
}
bilde k0-modellark-16x9-v4.txt 16:9 2k
bilde t1-slutt-16x9-v4.txt  16:9 2k $N/n0-modellark-16x9-v4.png $N/n3-bakeri-ute-16x9.png
bilde t6-slutt-16x9-v4.txt  16:9 4k $N/n0-modellark-16x9-v4.png $N/n2-gata-16x9-v4.png
bilde t3b-slutt-16x9-v4.txt 16:9 2k $N/n3b-bakeri-inne-16x9-v3.png
bilde t4a-start-16x9-v4.txt 16:9 2k $N/n0-modellark-16x9-v4.png
bilde t4a-slutt-16x9-v4.txt 16:9 2k $N/n4a-kontor-16x9-v4.png
bilde t4b-slutt-16x9-v4.txt 16:9 2k $N/n0-modellark-16x9-v4.png $N/n4a-kontor-16x9-v4.png
bilde t5a-slutt-16x9-v4.txt 16:9 2k $N/n5-bakgard-16x9-v4.png
ffmpeg -i $N/n6-pult-16x9-v4.png -vf "crop=iw*0.55:ih*0.55:iw*0.45:ih*0.20" $N/n1-hero-16x9-v4.png

tagning t1  16x9  5 $N/n1-hero-16x9-v4.png          $N/n2-gata-16x9-v4.png
tagning t2  16x9 15 $N/n2-gata-16x9-v4.png          $N/n3-bakeri-ute-16x9.png
tagning t3a 16x9 10 $N/n3-bakeri-ute-16x9.png       -
tagning t3b 16x9 10 $N/n3b-bakeri-inne-16x9-v3.png  $N/n4-skjerm-16x9-v4.png
tagning t4a 16x9 10 $N/n4a-kontor-16x9-v4.png       $N/n4b-kontor-ovenfra-16x9-v4.png
tagning t4b 16x9 12 $N/n4b-kontor-ovenfra-16x9-v4.png $N/n5-bakgard-16x9-v4.png
tagning t5a 16x9 10 $N/n5-bakgard-16x9-v4.png       $N/n5b-lapper-16x9-v4.png
tagning t5b 16x9 12 $N/n5b-lapper-16x9-v4.png       $N/n2-gata-16x9-v4.png
tagning t6  16x9 15 $N/n2-gata-16x9-v4.png          $N/n6-pult-16x9-v4.png
```

9:16: bytt `16x9` med `9x16` i alle tre argumentene (N0 står i 16:9). Endelig: legg til `1080p` eller `720p`.

### Kostnad i v4

Varighetene er uendret, så tabellen per tagning i del 5 står: 297 utkast, 693 i 720p og 1584 i 1080p per
format. Det som endres, er bildene og saldoen (5249).

| Post | Kreditter |
|---|---|
| Nøkkelbilder 16:9: sju i 2k og ett i 4k, to kandidater | 34,5 |
| Nøkkelbilder 9:16: åtte i 2k og ett i 4k, to kandidater | 38,5 |
| Utkast av alt, begge formater | 594 |
| Endelig 1080p, begge formater | 3168 |

| Løp | Kreditter | Igjen av 5249 |
|---|---|---|
| **Sum A: alt i 1080p** | **3835** | ca. 1415 |
| Sum B: 16:9 i 1080p, 9:16 i 720p | 2944 | ca. 2305 |
| Sum C: som B, men utkast bare i 16:9 | 2647 | ca. 2600 |

Brukt på prøver så langt: 315 kreditter på to runder. Tre tagninger er oppe på 14–15 av 18. Seks er ikke
prøvd. Med én runde retting per tagning i utkast (ca. 300 til) anbefaler jeg sum C eller B.

### Neste prøve

1. Bilder i 16:9, to kandidater: N0, N2, N6 (4k), N4. 18,5 kreditter.
2. Utkast v4 av T6 (45), T3a (30) og T3b (30). Sjekk: frysen varer ett sekund, hun går to steg, bakeren står
   i profil, ingen dobbelteksponering.
3. Første utkast av T2 (45). Den trenger bare N2 og N3, og den viser om følgekameraet bak budet holder.
4. Sum: ca. 170 kreditter. Stopp for eier.
5. Neste runde etter det: N4a, N4b, N5, N5b (16) og utkast av T4a, T4b, T5a, T5b (132).

### Åpne spørsmål etter runde 2

15. **To kutt.** Kameraet går ikke lenger gjennom taket til kontoret. Det klippes fra skjermen i bakeriet til
    kontordama bakfra. Greit, eller skal kranen gjennom taket prøves som egen tagning (ca. 30 kreditter per
    forsøk)?
16. **Skiva og lampa** er nå en stille ledetråd og ikke en takt. Greit?
17. **Posen skyves langs disken** i stedet for å rekkes over, for å holde bakeren i profil. Leses det som en
    handel?

### Antakelser i v4

- «Stays in profile the whole shot, facing right» holder bakeren sidelengs. Ikke testet.
- Ny N4 med N3b som referanse gir samme skjerm og hyller. Ikke testet. Hvis ikke: klipp N4 ut av en ramme fra
  T3b-utkastet der skjermen står riktig, og bruk den som referanse.
- T6, T2 og T3a er 150–158 ord i v4, like over grensen på ca. 200 tokens. T6 v3 var 140 ord og ga ingen
  forvrengning. Blir det forvrengning, kuttes stilsetningen først.

---

## 9. Versjon 5 (etter prøverunde 3)

Skrevet 24. nov. 2026 etter `wow-r8-prove-3` (168,5 kreditter, saldo 5080,5). Poeng: T6 16, T3a 16, T3b 14,
T2 12 (første forsøk). Sett med egne øyne: `.design/arbeid/regi/prove-3/t2-v4-utkast-1-ark-1.jpg`,
`t3b-v4-utkast-1-ark-1.jpg`, `t3a-v4-utkast-1-ark-1.jpg` og `t6-v4-utkast-1-frys-1.5-4.5s.jpg`.

**Det som nå sitter:** kunden er samme kvinne i N0, N2, N3, N3b og N6. Ingen linjal, ingen forgrunnskloss,
hakene står på. Håndtaket synes, og hånda lukker seg rundt det. Følgekameraet bak budet i T2 (3–10 s) er
filmens første ekte følgetagning, og den holder. Sømmen T2 → T3a måler 31 dB og er i praksis samme bilde.

### De fire valgene

**1. T2.** Første ramme var ikke N2. Klippet startet rett ovenfra tett på budet, og trikken dekket hele bildet
i 1,5 s, så modellen bygde en ny gate bak den. Endringen er den ene som ble bestilt:
«Start exactly on the start frame … 0-1s: hold the wide view for one second.» Kranen ned går nå 1–4 s.
I tillegg står «black bicycle» og «blank yellow paper slip» i prompten, som er de samme ordene som i alle
andre v5-prompter. Trikken som visker er beholdt. Hvis gata fortsatt blir en annen i neste forsøk, er det
visken som må ut: trikken passerer da bak budet, ikke foran linsa.

**Sykkelen er svart.** N2 har svart sykkel, N3 grønn, og videomodellen laget den svart i hele T2. **N3 lages
på nytt** som en ren redigering av dagens N3: bare sykkelrammen skifter farge. Da beholdes alt T3a har
truffet to ganger: kvinnen, døra, håndtaket og utsnittet. N2 røres ikke, og det er N2 som har flest sømmer.

**2. T3b.** Tre endringer:
- «The baker tears a **blank** yellow paper slip off a pad» og «hands the **blank** slip».
- Bakeren sto forfra da han ga posen til kunden. Nå løfter kunden posen selv fra disken, og bakeren «keeps
  his body turned to the right, in profile, the whole shot». Han har ingen grunn til å snu seg mot henne.
- **N4 lages på nytt, ikke klippet ut av utkastet.** Arket viser hvorfor det dobbelteksponerer: i N3b står
  skjermen skrått, vendt mot bakeren, og i N4 står den rett mot kameraet. Modellen flytter skjermen for å nå
  sluttbildet. En ramme fra utkastet ved 6,5 s viser nettopp den flyttede skjermen, og den er 854 × 480. Ny
  N4 har N3b som referanse: samme skjerm, svart ramme, samme skrå vinkel, budets skulder i høyre kant,
  hyllene bak. Det er bildet kameraet faktisk ser hvis det bare går nærmere.

**3. T3a. Jeg anbefaler å stryke steget.** Det har feilet to ganger, og et eget sluttbilde hjelper ikke på en
handling midt i tagningen. Det som skjer i utkastet, er nok: hun senker mobilen, snur hodet bort mot trikken
og blir stående. Det leses som å gi opp. Tiden som blir fri, går til innskyvet i starten (som manglet) og til
to hele sekunder stille på slutten (det ble 1,3). Ny takt: «she lowers the phone to her side, her shoulders
drop, and she turns her head away toward the tram».

**4. T6. De to som krysser gata, legges inn i N6.** De er det som gjør frysen lesbar: to figurer midt i steget
er tydeligere enn en trikk som står. N6 lages på nytt som redigering av dagens N6 (4k), med N2 som referanse,
så pulten, hakene og utsnittet til herobildet står urørt. N1 klippes ut på nytt.

**Frysen** er fortsatt 0,5–1,0 s. To grep:
- Prompten ber nå om to sekunder: «2-4s: the tram stops and every figure freezes mid-step; the camera stays
  locked off and nothing moves for two full seconds.» «Locked off» står to ganger, fordi kameraet vugget før
  uttrekket.
- **Motoren kan holde frysen så lenge vi vil.** Under frysen står både kamera og figurer stille, så bildet er
  et stillbilde. `bevegelse` kan legge inn et hold på den rammen (for eksempel 0,3 skjermhøyder) uten at det
  synes. Da trenger klippet bare en ren frys på et halvt sekund, og det har det allerede. Dette er den sikre
  løsningen, og linje 16 får stå i ro mens verden står.

### Lærdommer som gjelder alle v5-prompter

1. «Start exactly on the start frame.» står først i hver prompt.
2. Figurer bakfra eller i profil. En figur som rekker noe mot kameraet, snur seg mot kameraet. Derfor rekkes
   ingenting mot kameraet.
3. Én figur per rolle, beskrevet med de samme ordene hver gang.
4. Start- og sluttbilde viser samme rom fra samme side, og gjenstander står i samme vinkel i begge.
5. Høyst tre handlinger. En handling som har feilet to ganger, strykes.
6. Papir er «blank». Taster er «blank keys». Ingen linjaler eller måleverktøy.
7. Sykkelen er svart. Gult er bare lua og lappene. Lime er bare skjermene.
8. Siste to sekunder: «the camera holds completely still on the end frame».

### Tagningene i v5

| # | Takter | Start → slutt | Endret fra v4 |
|---|---|---|---|
| T1 | 0–1,5 innskyv · 1,5–3 piskpanorering · 3–5 stille | N1 → N2 | Startsetningen |
| T2 | 0–1 hold det vide bildet · 1–4 kran ned, trikken visker · 4–10 følger budet bakfra · 10–13 sykkelen mot veggen, kameraet til kunden · 13–15 stille | N2 → N3 v5 | Start og hold, svart sykkel |
| T3a | 0–3 innskyv, hun trykker og venter · 3–4,5 senker mobilen, skuldrene faller, hodet mot trikken · 4,5–6,5 mobilen får farger, hun løfter den · 6,5–8 til døra, hånda rundt håndtaket · 8–10 stille | N3 v5 → fri slutt | Steget er strøket |
| T3b | 0–3 kunden løfter posen selv, bakeren river av en blank lapp · 3–6 lappen mot høyre til budet, kameraet mot høyre · 6–8 nærmere skjermen forbi budets skulder · 8–10 stille | N3b → N4 v5 | Bakeren, blank lapp, ny N4 |
| T4a | 0–3 kran opp over hodet til rett ovenfra · 3–5,5 taster på den bærbare · 5,5–8 skyver lappen til nettbrettet og taster igjen · 8–10 stille | N4a → N4b | Startsetningen, blank lapp |
| T4b | 0–4 ned til skulderen, samme kalender på begge skjermer, lappen i skuffen · 4–6 lener seg tilbake, ny blokk · 6–10 til vinduet, fram til karmen, ned i gården · 10–12 stille | N4b → N5 | Startsetningen, blank lapp |
| T5a | 0–3 kran ned bak rørleggeren, som teiper opp en blank lapp. Budet står ved siden av · 3–6 vinden tar én lapp, han strekker seg og bommer · 6–8 zoom til hullet · 8–10 stille | N5 → N5b | Overrekkelsen er ute (fire handlinger ble tre) |
| T5b | 0–4 ut fra hullet, bak ham, telefonen lyser · 4–6 døra skyves igjen · 6–10 budet triller den svarte sykkelen ut, kran opp til gata · 10–12 stille | N5b → N2 | Startsetningen, svart sykkel |
| T6 | 0–2 trikken ruller, budet triller, de to krysser · 2–4 frys, to sekunder, kameraet låst · 4–9 kran opp og ut, lapp, blyant, kopp · 9–13 fokus til rommet, hakene står på · 13–15 stille | N2 → N6 v5 | Lengre frys, låst kamera, de to i N6 |

I T5a gir budet ikke lenger lappen i bildet. Han kom inn i gården med den i N5, og i første ramme teiper
rørleggeren den opp. Sammenhengen bæres av N5.

### Samlet kjøreplan for neste runde (16:9)

**Nøkkelbilder, to kandidater av hvert:**

| Bilde | Promptfil | Referanser | Lagres som | Kreditter |
|---|---|---|---|---|
| N3 v5 (svart sykkel, redigering) | `t2-slutt-16x9-v5.txt` | N3 | `n3-bakeri-ute-16x9-v5.png` | 4 |
| N6 v5 (de to som krysser, redigering, 4k) | `t6-slutt-16x9-v5.txt` | N6 v4, N2 v4 | `n6-pult-16x9-v5.png` | 6,5 |
| N4 v5 (samme skjermvinkel) | `t3b-slutt-16x9-v5.txt` | N3b | `n4-skjerm-16x9-v5.png` | 4 |
| N4a (kontoret bakfra) | `t4a-start-16x9-v4.txt` | N0 v4 | `n4a-kontor-16x9-v4.png` | 4 |
| N4b (rett ovenfra) | `t4a-slutt-16x9-v4.txt` | N4a | `n4b-kontor-ovenfra-16x9-v4.png` | 4 |
| N5 (gården fra vinduet, svart sykkel) | `t4b-slutt-16x9-v5.txt` | N0 v4, N4a | `n5-bakgard-16x9-v5.png` | 4 |
| N5b (lappene med hull) | `t5a-slutt-16x9-v4.txt` | N5 | `n5b-lapper-16x9-v4.png` | 4 |
| N1 v5 | utsnitt av N6 v5 | | `n1-hero-16x9-v5.png` | 0 |
| **Sum bilder** | | | | **30,5** |

Beholdes: N0 v4, N2 v4, N3b v3.

Kontroll før utkastene: i N3 v5 er bare sykkelen endret. I N6 v5 står pult, haker og stol der de sto. I N4 v5
står skjermen skrått med svart ramme som i N3b. I N4b er det samme kvinne og samme pult som i N4a.

**Utkast (alle ni, v5):**

```bash
P=assets/higgsfield/regi/prompter; N=assets/higgsfield/regi/nokkel
# tagning() fra del 8, med v5 som siste argument
tagning t1  16x9  5 $N/n1-hero-16x9-v5.png            $N/n2-gata-16x9-v4.png            utkast v5
tagning t2  16x9 15 $N/n2-gata-16x9-v4.png            $N/n3-bakeri-ute-16x9-v5.png      utkast v5
tagning t3a 16x9 10 $N/n3-bakeri-ute-16x9-v5.png      -                                 utkast v5
tagning t3b 16x9 10 $N/n3b-bakeri-inne-16x9-v3.png    $N/n4-skjerm-16x9-v5.png          utkast v5
tagning t4a 16x9 10 $N/n4a-kontor-16x9-v4.png         $N/n4b-kontor-ovenfra-16x9-v4.png utkast v5
tagning t4b 16x9 12 $N/n4b-kontor-ovenfra-16x9-v4.png $N/n5-bakgard-16x9-v5.png         utkast v5
tagning t5a 16x9 10 $N/n5-bakgard-16x9-v5.png         $N/n5b-lapper-16x9-v4.png         utkast v5
tagning t5b 16x9 12 $N/n5b-lapper-16x9-v4.png         $N/n2-gata-16x9-v4.png            utkast v5
tagning t6  16x9 15 $N/n2-gata-16x9-v4.png            $N/n6-pult-16x9-v5.png            utkast v5
```

| Utkast | Status | Kreditter |
|---|---|---|
| T2 | Nytt forsøk (12/18) | 45 |
| T3b | Nytt forsøk (14/18) | 30 |
| T3a | Nytt forsøk (16/18), uten steget | 30 |
| T6 | Nytt forsøk (16/18), ny N6 og lengre frys | 45 |
| T1 | Første forsøk | 15 |
| T4a | Første forsøk | 30 |
| T4b | Første forsøk | 36 |
| T5a | Første forsøk | 30 |
| T5b | Første forsøk | 36 |
| **Sum utkast** | | **297** |
| **Sum runden med bilder** | | **327,5** |

Skal runden holdes under 300, er T6 den som kan vente (16/18, og frysen kan løses i motoren): 282,5.

**Etter runden** er saldoen ca. 4753. Da har alle ni tagninger minst ett utkast, og filmen kan klippes sammen
i 480p og vises eier som helhet for første gang. Det som gjenstår etter det: 16:9 i 1080p (1584), nøkkelbilder
og utkast i 9:16 (ca. 335) og 9:16 i 720p (693), til sammen ca. 2612. Da er det ca. 2140 igjen til nye forsøk.

### Åpne spørsmål etter runde 3

18. **Kunden tar ikke lenger et steg bort.** Hun senker mobilen og ser bort. Er det nok som «gir opp»?
19. **Bakeren rekker ikke posen.** Kunden løfter den selv fra disken. Det er minst risiko, men handelen er
    svakere. Greit?
20. **Frysen holdes i motoren** i stedet for i klippet. Greit for `bevegelse`?

### Antakelser i v5

- En redigering med `gpt_image_2_6` og bildet selv som referanse holder alt annet urørt. Det er ikke prøvd i
  denne produksjonen. Hvis N3 eller N6 flytter på seg, velges den kandidaten som ligger nærmest, og T3a og T6
  vurderes på nytt mot den.
- Bakeriet har tredør på hjørnet i N2 og rød dør med messinghåndtak i N3. Det er ikke rettet. Forskjellen
  ligger i sømmen T2 → T3a, som målte 31 dB.
- De lengste promptene (T2, T3b, T6) er 155–165 ord, litt over grensen på ca. 200 tokens. T6 v4 var 158 ord
  og ga ingen forvrengning.
- T4a, T4b, T5a og T5b er aldri prøvd. Størst risiko: T4b (sluttbildet ser ut av rommet) og vindkastet i T5a.

---

## 10. Versjon 6 (etter prøverunde 4 og eiers tilbakemelding)

Skrevet 24. nov. 2026 etter `wow-r8-prove-4` (327,5 kreditter, saldo 4753) og etter at eier har sett
sammenklippet: **«Første delen henger ikke sammen, sykkelen går skjevt, menneskene blir borte.»**

Sett med egne øyne: `.design/arbeid/regi/prove-4/t2-v5-utkast-1-ark-2.jpg`, `t5b-v5-utkast-1-ark-1.jpg`,
`t5a-v5-utkast-1-ark-1.jpg`, `t4b-v5-utkast-1-ark-2.jpg` og `nokkel/n4a-kontor-16x9-v4.png`.

Skills lastet og brukt: `emil-choreograph` (roller, forhold og hva som står stille, per tagning),
`emil-animation-vocabulary` (ordene), `cinematic-ui` (én bærende idé og én tung bevegelse per scene),
`scroll-craft` (følelseskurve, ett toppunkt, ingen død rulling). Åpningsspørsmålene i `cinematic-ui` og
`scroll-craft` er ikke stilt på nytt. Historien, fortelleren og retningen er valgt av eier før dette.

### 10.1 Diagnosen: for mange ting beveget seg, og ingen av dem ledet

Choreograph-skillen sier det rett ut: god koreografi er å **kutte bevegelige deler** og la resten gå
samtidig. T2 gjorde det motsatte. Trikken, to fotgjengere, budet, sykkelen, lappen i hånda, kunden og kameraet
beveget seg alle, og trikken dekket linsa midt i. Da hadde bildet ingen leder, og modellen fikk et skjult kutt
der den kunne dikte opp verden på nytt.

Fire regler for hele filmen, fra de fire skillene:

1. **Én leder per tagning** (choreograph, «cast the elements»). Lederen beveger seg først, lengst og blir
   lengst i bildet. Hvis to ting vil lede, er det bildet som er feil, ikke timingen.
2. **Alt annet står stille eller følger med** (choreograph, «static» og «carry»). Kameraet er aldri en egen
   rolle. Det bærer oss etter lederen.
3. **Ingenting dekker linsa, og ingen kommer inn i eller går ut av bildet.** En figur står i bildet fra første
   til siste ramme. Det eneste unntaket er når kameraet går tett på en detalj. Da står figuren der den sto,
   utenfor utsnittet.
4. **Én tung bevegelse per tagning** (cinematic-ui, «interaction budget»). Resten er underordnet.

Ordene som brukes under (animation-vocabulary): **anticipation** (en liten opptakt før en bevegelse),
**follow-through** (noe faller til ro litt etter hovedbevegelsen), **ease-in-out** (sakte, fort, sakte, for
alt som allerede er i bildet), **continuity transition** (samme ting før og etter, så øyet ikke mister den),
**crossfade** (sømmene), **scroll-driven animation** (hele filmen).

### 10.2 Følelseskurven og toppunktet (scroll-craft)

Én følelse per tagning, og ingen to naboer med samme. Toppunktet har mest rulling, og det er stille foran det.

| Tagning | Følelse | Hva som gir den | Rulling |
|---|---|---|---|
| Hero | Undring | To haker, tom stol, ingen forklaring | 0,9 |
| T1 | Rykk | Kameraet kaster seg bort | 0,4 |
| T2 | Ro | Én syklist i en stille gate. Vi blir med ham | 1,2 |
| T3a | Irritasjon, så lettelse | Mobilen er grå, så lyser den | 0,8 |
| T3b | Varme | Brød, lamper, en lapp som skifter hånd | 0,8 |
| T4a | Slit | Samme lapp, samme tasting, en gang til | 0,8 |
| T4b | Orden | To skjermer blir én. Hun lener seg tilbake | 0,9 |
| T5a | Tap | Lappen blåser bort, hånda henger | 0,8 |
| T5b-1 | Lettelse | Telefonen lyser. Døra går igjen | 0,6 |
| T5b-2 | Stillhet | Bare budet, på vei ut. **Dette er roen før toppen** | 0,6 |
| T6 | Svimmelhet | Sykkelen står oppreist uten å rulle. Verden har en kant | 1,2 |
| Pulten | **Toppunktet: tillit** | Målingene låser seg, lampa tennes | 2,3 |

Toppunktet er pulten med målingene, og det har klart mest rulling. Slutten løser seg og holder: samme to haker
som i første bilde. Setningen en besøkende skal kunne si videre: «Det er siden der gata viser seg å være en
modell på pulten deres, og det eneste ekte er målingen av siden du står på.»

Holdene på to sekunder i slutten av hver tagning er **forfattet stillhet**, der linja skifter. De er ikke død
rulling, og revisor skal ikke telle dem som det.

### 10.3 T2 skrevet om fra bunnen (10 s)

**Hva som er ute:** trikken som visker bildet, de to fotgjengerne, lappen i hånda, sykkelen som trilles, budet
som går ut av bildet, og følgetagningen langs fasadene.

**Hva som er igjen:** to figurer. Budet sykler. Kunden står. Kameraet gjør én bevegelse.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Budet på sykkelen | **Leder** | 1,0 s | 4,5 s | Sykler rett og stødig mot hjørnebakeriet, ease-in-out. Bremser 5,0–6,0 s, setter foten ned 6,0 s | – |
| Kameraet | Bærer | 1,0 s | 6,5 s | Én kran ned og fram til hoftehøyde bak ham, ease-in-out | **Sammen** med budet: samme start, samme kurve |
| Kameraet, landingen | Bærer | 6,0 s | 1,5 s | Glir til ro bak kundens skulder | **Overlapper** bremsen: follow-through. Kameraet lander etter at han står |
| Kunden | Støtte | – | – | Står der fra første ramme og ser på mobilen. Hodet er det eneste som kan røre seg | Står |
| Lappen | Dekor | – | – | Klemt under styret. Følger sykkelen | **Bæres** av lederen |
| Trikken, husene, lyktene | Statisk | – | – | Ingen | – |
| Hold | | 8,0 s | 2,0 s | Ingenting rører seg | Forfattet stillhet |

**Hva som ikke beveger seg, og hvorfor:**
- Trikken: den var et skjult kutt. Nå står den ved holdeplassen langt bak.
- Fotgjengerne: fjernet fra N2. De var støtte uten oppgave, og de forsvant bak trikken.
- Kunden: hun er målet for bevegelsen. Et mål som flytter seg, kan ikke nås.
- Lappen: i hånda tvang den budet til å trille sykkelen skjevt med én hånd. Under styret bæres den.
- Sykkelen etter 6 s: den står under ham. Han blir i bildet, i høyre kant, til tagningen er slutt.

**Det som må ses på opptak (feel check):** rull 5,0–7,5 s rammevis. Leses bremsen og kameraets landing som én
bevegelse, eller som to? Står kunden på samme sted i ramme 0 og ramme 240?

**Rulling:** 1,2 skjermhøyder som før, selv om tagningen er 10 s og ikke 15. Den bærer tre linjer (4, 5, 6),
og følelsen er ro. Bildet går da saktere per skjermhøyde enn i resten av filmen, og det er riktig her.

**Start:** N2 v6. **Slutt:** N3 v6, som T3a starter på. Linje 4 ved 0, linje 5 ved 0,35, linje 6 ved 0,70.

### 10.4 Nøkkelbilder som må lages på nytt

| Bilde | Endring | Hvordan | Følge |
|---|---|---|---|
| **N2 v6** | De to fotgjengerne ut. Budet **sykler**, lappen under styret. Trikken står langt bak | Redigering av N2 v4 | T1, T2, T5b-2 og T6 må ha nytt utkast |
| **N6 v6** | Speiler N2: fotgjengerne ut, budet sykler | Redigering av N6 v5 (4k), N2 v6 som referanse | T6 |
| **N1 v6** | Ingen endring i motivet | Klippes ut av N6 v6 | T1. Nytt `hero` |
| **N3 v6** | Budet står over sykkelen i høyre forgrunn, bakfra, én fot i bakken | Redigering av N3 v5 | T2 og T3a |
| N4a v6 | Det løse tastaturet ut | Redigering av N4a v4 | T4a |
| N5 v6 | Bar vinduskarm. Bilens innside har vegg med lapper | Redigering av N5 v5 | T4b, T5a |
| N5c v6 | Nytt: budet over sykkelen ved porten, bakfra | Nytt bilde, N5 v6 og N2 v6 som referanse | T5b-2 |

Beholdes: N0 v4, N3b v3, N4 v5, N4b v4, N5b v4.

**Dette koster T1, T3a og T6 statusen «klare for 1080p».** De sto til 17, men alle tre starter eller slutter på
et bilde som nå endres. De må ha ett nytt utkast hver før 1080p (90 kreditter til sammen). Promptene deres er
endret så lite som mulig: T1 og T6 nevner ikke lenger fotgjengere, og T3a har én ny setning om at budet står
stille i høyre kant.

**Frysen i T6 bæres nå av budet og trikken.** Det er sterkere enn før: en syklist som står oppreist på en
sykkel som ikke ruller, er umulig i en ekte gate og selvsagt i en modell. Kunden står stille både før og
etter, så hun viser ikke frysen, men hun viser at det er samme gate.

**Tidshopp som godtas:** i T3a står budet ute ved sykkelen. Etter kuttet i døra står han ved disken i T3b.
Kuttet bærer hoppet.

### 10.5 Koreografi for de andre tagningene

Samme oppsett: hvem leder, hva følger, hva står.

**T1, piskpanoreringen (5 s).** Bærende idé: kameraet forlater det ekte.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Kameraet | **Leder** | 0 s | 1,5 s + 1,5 s | Innskyv (anticipation), så piskpanorering ned til venstre | Sekvens: opptakt, så kast |
| Budet | Støtte | 3,0 s | 2,0 s | Sykler sakte | Starter når uskarpheten slipper |
| Kunden, trikken, pulten, hakene | Statisk | | | | |

Ikke i bevegelse: hakene (de skal ha stått der hele tiden), trikken (se T2).

**T3a, bakeriet ute (10 s).** Bærende idé: en skjerm som ikke svarer.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Kunden | **Leder** | 0 s | 8 s | Trykker, senker mobilen, løfter den, går til døra, hånda på håndtaket | – |
| Mobilskjermen | Støtte | 4,5 s | 2,0 s | Fra grå til varme farger | **Sekvens** etter at hun har senket mobilen: årsak og virkning |
| Kameraet | Bærer | 0 s | 3 s, så 6,5–8 s | Innskyv, så et halvt skritt etter henne | **Sammen** med henne |
| Budet i høyre kant | Statisk | | | Står over sykkelen hele tagningen | |
| Trikken, bakeriet | Statisk | | | | |

Ikke i bevegelse: budet (han er ferdig med sin bevegelse i T2), trikken, døra (den åpnes ikke i bildet).

**T3b, bakeriet inne (10 s).** Bærende idé: lappen skifter hånd.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Lappen (bakerens hånd) | **Leder** | 0,5 s | 5 s | Rives av blokka, rekkes mot høyre, tas imot av budet | – |
| Kunden | Støtte | 0 s | 2 s | Løfter posen fra disken og holder den | **Overlapper** starten på lappen, ferdig før overrekkelsen |
| Kameraet | Bærer | 6,0 s | 2 s | Inn mot skjermen forbi budets skulder | **Sekvens**: først etter at lappen er gitt |
| Skjermen, hyllene, lampene | Statisk | | | Skjermen står på samme sted i samme vinkel | |

Ikke i bevegelse: kameraet i 0–6 s (det var innkjøringen midt i overrekkelsen som ga dobbelteksponering),
bakerens hode (aldri mot kameraet), skjermen.

**T4a, kontoret, lappen (10 s).** Bærende idé: samme arbeid to ganger, sett ovenfra.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Kameraet | **Leder** først | 0 s | 3 s | Kran opp over hodet hennes til rett ovenfra | – |
| Hendene hennes | **Leder** etterpå | 3 s | 5 s | Taster, skyver lappen, taster igjen | **Sekvens** etter kranen. Kameraet står da stille |
| Lappen | Bæres | 5,5 s | 1 s | Skyves fra den bærbare til nettbrettet | Bæres av hånda |
| Alt annet på pulten | Statisk | | | | |

Ikke i bevegelse: kameraet etter 3 s (rett ovenfra er et kart, og et kart står stille), hodet og kroppen
hennes, skjermbildene.

**T4b, kontoret, kalenderen (12 s).** Bærende idé: to blir én.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Skjermene | **Leder** | 0 s | 3 s | Går over til samme kalender | – |
| Kameraet | Bærer | 0 s | 4 s | Bue ned til skulderen | **Sammen** med skjermene |
| Hånda med lappen | Støtte | 1,5 s | 2 s | Lappen i skuffen | **Overlapper** skjermene |
| Ny blokk i kalenderen | Dekor | 4,5 s | 0,5 s | Tones inn | Lander når kameraet har landet |
| Kameraet, andre del | Bærer | 6 s | 4 s | Til vinduet, fram til karmen, ned i gården | **Sekvens**: starter når pulten er i ro |

Ikke i bevegelse: figurene i gården når vi ser dem (de står), lampa på pulten.

**T5a, rørleggeren, lappen (10 s).** Bærende idé: ett hull i en rekke.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Kameraet | Bærer | 0 s | 3 s | Kran ned fra vinduet til bak rørleggeren | – |
| Rørleggerens hånd | Støtte | 1 s | 3 s | Teiper opp en lapp | **Overlapper** kranen |
| Én lapp | **Leder** | 3,5 s | 2 s | Løftes av vinden og flagrer ut | **Sekvens**: starter når kameraet har landet |
| Rørleggerens hånd | Støtte | 4,5 s | 1,5 s | Strekker seg etter den, bommer, blir hengende (follow-through) | **Overlapper** lappen |
| Kameraet | Bærer | 6 s | 1 s | Zoom til hullet | **Sekvens** etter at hånda henger |
| Budet, de andre lappene, bilen | Statisk | | | | |

Ikke i bevegelse: budet (står ved siden av), de fire andre lappene, bilen. Lappen flyr ut i siden av bildet,
ikke over linsa.

**T5b-1, telefonen (8 s).** Bærende idé: svaret var der allerede.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Telefonen i hånda hans | **Leder** | 0,5 s | 3 s | Hånda senkes, telefonen løftes og lyser | – |
| Kameraet | Bærer | 0 s | 3,5 s | Trekker seg ut, blir bak ham | **Sammen** med telefonen |
| Bakdøra | Støtte | 3,5 s | 2,5 s | Slås igjen i sakte film | **Sekvens**: etter at telefonen er i lomma |
| Lappene, bilen, gården | Statisk | | | | |

Ikke i bevegelse: bilen (samme bil, samme dør), lappene, kameraet under døra.

**T5b-2, budet ut i gata (8 s).** Bærende idé: stillheten før toppen.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Budet på sykkelen | **Leder** | 0 s | 6 s | Skyver fra, sykler sakte ut porten og videre | – |
| Kameraet | Bærer | 0 s | 6 s | Følger i hoftehøyde, så kran opp og bakover | **Sammen**, én kurve |
| Kunden, trikken, gata | Statisk | | | Kunden står ved bakeriet når gata åpner seg | |

Ikke i bevegelse: alt annet enn budet. Dette er filmens roligste tagning, med vilje.

**T6, innrømmelsen (15 s).** Bærende idé: verden har en kant.

| Element | Rolle | Starter | Varer | Bevegelse | Forhold |
|---|---|---|---|---|---|
| Budet og trikken | **Leder** først | 0 s | 2 s | Sykler, ruller | **Sammen** |
| Frysen | | 2 s | 2 s | Begge stanser i samme ramme. Ingenting rører seg | **Sammen**: ett stopp, ikke to |
| Kameraet | **Leder** etterpå | 4 s | 9 s | Kran opp og ut, ease-in-out | **Sekvens**: starter først når frysen har stått |
| Lapp, blyant, kopp | Dekor | 5 s | 3 s | Glir forbi langs nedre kant | **Bæres** av kameraet. De dekker ikke bildet |
| Fokus | Støtte | 9 s | 2 s | Fra gata til rommet | **Overlapper** uttrekket |
| Hakene, stolen, kunden | Statisk | | | Hakene står på fra de kommer inn | |

Ikke i bevegelse: kameraet i 0–4 s (det er verden som stanser, ikke vi), hakene, figurene etter 2 s.

### 10.6 Øvrige endringer fra runde 4

| Tagning | Funn | Endring |
|---|---|---|
| T5b (11/18) | Bilen byttet dør, dobbelteksponering, ny vinkel, og klipp til modellen på en pult | **Delt i T5b-1 og T5b-2** med hardt kutt mellom. «The tram rolling» er strøket. «The street stays a full-size street the whole shot» er lagt til. Døra er «the rear door», bilen «stays the same van» |
| T3b (15) | Bakeren halvt mot kamera, dobbelteksponering 0,3 s | «Never turns his head toward the camera». Kameraet «barely moves» til 6 s, «only now» inn mot skjermen |
| T4b (15) | Lampa doblet seg inn mot N5 | N5 **uten lampe og bøker i karmen**. Lampa i N4a står på pulten, og kameraet går over den |
| T4a (15) | Det løse tastaturet forsvant | N4a redigeres. N4b har det ikke |
| T5a (16) | Bilens innside byttet | **Rettes**, i samme redigering av N5: vegg med lapper, som i N5b. Prompten er uendret. N5 skal redigeres uansett, så det koster bare utkastet |

### 10.7 Tagningene i v6: ti tagninger, 98 sekunder

| # | Navn | Varighet | Rulling | Linjer | Start → slutt | Prompt | Søm ut |
|---|---|---|---|---|---|---|---|
| T1 | Piskpanoreringen | 5 s | 0,4 | 3 | N1 v6 → N2 v6 | `t1-*-v6` | Krysstoning |
| T2 | Gata | **10 s** | 1,2 | 4, 5, 6 | N2 v6 → N3 v6 | `t2-*-v6` | Krysstoning |
| T3a | Bakeriet, ute | 10 s | 0,8 | 7, 8 | N3 v6 → fri slutt | `t3a-*-v6` | Kutt |
| T3b | Bakeriet, inne | 10 s | 0,8 | 8, 9 | N3b v3 → N4 v5 | `t3b-*-v6` | Kutt |
| T4a | Kontoret, lappen | 10 s | 0,8 | 10 | N4a v6 → N4b v4 | `t4a-*-v5` | Krysstoning |
| T4b | Kontoret, kalenderen | 12 s | 0,9 | 11, 12 | N4b v4 → N5 v6 | `t4b-*-v5` | Krysstoning |
| T5a | Rørleggeren, lappen | 10 s | 0,8 | 13 | N5 v6 → N5b v4 | `t5a-*-v5` | Krysstoning |
| T5b-1 | Rørleggeren, telefonen | 8 s | 0,6 | 14, 15 | N5b v4 → fri slutt | `t5b1-*-v6` | Kutt |
| T5b-2 | Budet ut i gata | 8 s | 0,6 | 15 står | N5c v6 → N2 v6 | `t5b2-*-v6` | Krysstoning |
| T6 | Innrømmelsen | 15 s | 1,2 | 16, 17 | N2 v6 → N6 v6 | `t6-*-v6` | Krysstoning til `pult` |
| | **Sum film** | **98 s** | **8,1** | | | | |

Med stillbildene (0,9 og 2,3) blir filmen 11,3 skjermhøyder. Tre harde kutt: i døra, opp til kontoret og fra
bildøra til porten.

### 10.8 Kjøreplan A: neste runde i 16:9 (320,5 kreditter)

**Bilder, to kandidater av hvert.** Rekkefølgen følger referansene.

| Bilde | Promptfil | Referanser | Lagres som | Kreditter |
|---|---|---|---|---|
| N2 v6 | `t1-slutt-16x9-v6.txt` | N2 v4 | `n2-gata-16x9-v6.png` | 4 |
| N6 v6 (4k) | `t6-slutt-16x9-v6.txt` | N6 v5, N2 v6 | `n6-pult-16x9-v6.png` | 6,5 |
| N1 v6 | utsnitt av N6 v6 | | `n1-hero-16x9-v6.png` | 0 |
| N3 v6 | `t2-slutt-16x9-v6.txt` | N3 v5 | `n3-bakeri-ute-16x9-v6.png` | 4 |
| N4a v6 | `t4a-start-16x9-v6.txt` | N4a v4 | `n4a-kontor-16x9-v6.png` | 4 |
| N5 v6 | `t4b-slutt-16x9-v6.txt` | N5 v5 | `n5-bakgard-16x9-v6.png` | 4 |
| N5c v6 | `t5b2-start-16x9-v6.txt` | N5 v6, N2 v6 | `n5c-port-16x9-v6.png` | 4 |
| **Sum** | | | | **26,5** |

Kontroll med Read: i N2 er det to figurer, budet sitter på sykkelen, og ingenting står i forgrunnen. N6 viser
de samme to på modellen. I N3 er bare budet lagt til. Redigeringene i runde 4 målte 22–26 dB mot originalen,
så bildene lages på nytt og kopieres ikke. Se på dem, ikke bare på tallet.

**Utkast, alle ti:**

```bash
P=assets/higgsfield/regi/prompter; N=assets/higgsfield/regi/nokkel   # tagning() fra del 8
tagning t1   16x9  5 $N/n1-hero-16x9-v6.png            $N/n2-gata-16x9-v6.png            utkast v6
tagning t2   16x9 10 $N/n2-gata-16x9-v6.png            $N/n3-bakeri-ute-16x9-v6.png      utkast v6
tagning t3a  16x9 10 $N/n3-bakeri-ute-16x9-v6.png      -                                 utkast v6
tagning t3b  16x9 10 $N/n3b-bakeri-inne-16x9-v3.png    $N/n4-skjerm-16x9-v5.png          utkast v6
tagning t4a  16x9 10 $N/n4a-kontor-16x9-v6.png         $N/n4b-kontor-ovenfra-16x9-v4.png utkast v5
tagning t4b  16x9 12 $N/n4b-kontor-ovenfra-16x9-v4.png $N/n5-bakgard-16x9-v6.png         utkast v5
tagning t5a  16x9 10 $N/n5-bakgard-16x9-v6.png         $N/n5b-lapper-16x9-v4.png         utkast v5
tagning t5b1 16x9  8 $N/n5b-lapper-16x9-v4.png         -                                 utkast v6
tagning t5b2 16x9  8 $N/n5c-port-16x9-v6.png           $N/n2-gata-16x9-v6.png            utkast v6
tagning t6   16x9 15 $N/n2-gata-16x9-v6.png            $N/n6-pult-16x9-v6.png            utkast v6
```

| Utkast | Kreditter |
|---|---|
| T1 (5 s) | 15 |
| T2, T3a, T3b, T4a, T5a (10 s hver) | 150 |
| T4b (12 s) | 36 |
| T5b-1, T5b-2 (8 s hver) | 48 |
| T6 (15 s) | 45 |
| **Sum utkast** | **294** |
| **Sum runden med bilder** | **320,5** |

**Det viktigste å se på i sammenklippet:** de første 25 sekundene (T1, T2, T3a) uten stopp. Er det to figurer
hele veien, står kunden på samme sted, sykler budet rett, og er han i bildet til døra?

### 10.9 Kjøreplan B: 1080p i 16:9 (1568 kreditter)

Samme kommandoer med `1080p` i stedet for `utkast`, når utkastet er godkjent (13 av 18, minst 2 på start og
slutt). Ingen tagning kan lages i 1080p før kjøreplan A er kjørt.

| Tagning | Kreditter |
|---|---|
| T1 (5 s) | 80 |
| T2, T3a, T3b, T4a, T5a (10 s hver) | 800 |
| T4b (12 s) | 192 |
| T5b-1, T5b-2 (8 s hver) | 256 |
| T6 (15 s) | 240 |
| **Sum** | **1568** |

Begynn med T6 alene (240). Den viser hva 1080p gjør med sømmen mot N6 og med frysen. `--draft_job_id` kan
prøves her mot utkastets jobb-id. Det er ikke bekreftet at den gir samme bevegelse.

### 10.10 Kjøreplan C: 9:16 (1022,5 kreditter)

Kjøres etter at 16:9 er ferdig, så lærdommene er brukt opp.

| Bilde | Promptfil | Bilde | Promptfil |
|---|---|---|---|
| N2 | `t1-slutt-9x16-v6.txt` | N4b | `t4a-slutt-9x16-v4.txt` |
| N3 | `t2-slutt-9x16-v6.txt` | N5 | `t4b-slutt-9x16-v6.txt` |
| N3b | `t3b-start-9x16-v3.txt` | N5b | `t5a-slutt-9x16-v4.txt` |
| N4 | `t3b-slutt-9x16-v5.txt` | N5c | `t5b2-start-9x16-v6.txt` |
| N4a | `t4a-start-9x16-v4.txt` | N6 (4k) | `t6-slutt-9x16-v6.txt` |

Hvert bilde får 16:9-bildet av samme motiv som referanse. N1 klippes ut av N6 (øvre 55 %). Promptfilene for
tagningene er `-9x16-v6` for T1, T2, T3a, T3b, T5b-1, T5b-2 og T6, og `-9x16-v5` for T4a, T4b og T5a.

| Post | Kreditter |
|---|---|
| Nøkkelbilder, to kandidater | 42,5 |
| Utkast, 98 s | 294 |
| 720p, 98 s | 686 |
| **Sum** | **1022,5** |

### 10.11 Samlet

| Kjøreplan | Kreditter | Saldo etter |
|---|---|---|
| A: bilder og utkast i 16:9 | 320,5 | 4432,5 |
| B: 1080p i 16:9 | 1568 | 2864,5 |
| C: 9:16, bilder, utkast og 720p | 1022,5 | 1842 |

Ca. 1840 er rommet for nye forsøk. Det tilsvarer sju tagninger på 15 s i 1080p. Med 9:16 i 1080p koster det
882 mer, og rommet blir ca. 960.

### 10.12 Til `bevegelse`

- Ti segmenter, tre harde kutt (T3a → T3b, T3b → T4a, T5b-1 → T5b-2), krysstoning i resten.
- T2 er 10 s over 1,2 skjermhøyder. Linje 5 ved 0,35 og linje 6 ved 0,70.
- Linje 15 står over kuttet og gjennom T5b-2.
- Gråtonen hos rørleggeren går fra T5a (0,2) og slipper i T5b-1 ved 0,2.
- Hold på frysrammen i T6 (klippet hadde 1,8 s frys i runde 4).
- De to sekundene stille i slutten av hver tagning er forfattet stillhet. Ikke kutt dem bort uten å se at
  linja får tid.

### 10.13 Åpne spørsmål

21. **T1, T3a og T6 må ha nytt utkast** fordi N2, N3 og N6 endres. Det er følgen av færre figurer og syklende
    bud. Alternativet er å la N3 stå uten budet, men da står sykkelen alene igjen i sluttbildet av T2. Greit?
22. **Budet står ute ved sykkelen i T3a og inne ved disken i T3b.** Kuttet i døra bærer tidshoppet. Greit?
23. **Tre kutt.** Det nye er fra den lukkede bildøra til budet ved porten. Greit?
24. **9:16 i 720p** er lagt til grunn. Skal det være 1080p, går rommet for nye forsøk fra ca. 1840 til ca. 960.

### 10.14 Antakelser

- En syklende leirefigur bakfra er stødigere enn en som triller sykkelen med én hånd. Ikke testet.
- Redigering med tre endringer (N2) holder resten av bildet. De to redigeringene i runde 4 holdt innholdet,
  men hadde én endring hver.
- T5b-1, T5b-2 og nye T2 er aldri prøvd. N5c finnes ikke ennå.
- T2 v6 er 158 ord. De lengste promptene (T6 og T3b v6, ca. 167 ord) er litt over grensen på ca. 200 tokens.
  Gir de forvrengning, kuttes stilsetningen først, ikke koreografien.

