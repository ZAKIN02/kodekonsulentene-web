# Hva kreative nettsteder faktisk gjør, målt på bevegelse og komposisjon

Kunden peker på jeton.com, epic.net, bdsn.club, brand.dropbox.com og osmo.supply, og sier
rett ut: «det er bevegelse jeg ønsker». Dette dokumentet måler hva de faktisk gjør.

## Metoden jeg forkastet, og hvorfor

Første måling talte `animationName !== "none"` i ett øyeblikk, og konkluderte med at
referansene har 1–3 animasjoner mens vi har 8–9.

**Den målingen er ubrukelig.** Den fanger verken JS-drevet bevegelse, scroll-drevet
transform, canvas eller video. osmo.supply har **36 videoer** som spiller kontinuerlig —
all den bevegelsen var usynlig for tellingen.

Verktøyene her måler i stedet faktiske matriser per element over scroll-steg
(`.skudd/ref-bevegelse.mjs`), ekte visningsbilder gjennom scrollen
(`.skudd/opptak-ref.mjs`), og elementtyper (`.skudd/ref-elementer.mjs`).

## Det overraskende: scroll-bevegelse er IKKE forskjellen

Endringer per scroll-steg, 8 steg, 1440×900:

| | flytt | skala | rotasjon | opasitet | farge |
|---|---|---|---|---|---|
| **oss** | **2** | 0 | 0 | **2** | 0 |
| jeton.com | 0 | 0 | 0 | 1 | 1 |
| osmo.supply | 1 | 0 | 1 | 2 | 3 |

**Vi har like mye eller mer scroll-drevet bevegelse enn begge referansene.** jeton flytter
ingenting i det hele tatt når du scroller.

Så når kunden sier siden føles statisk, er det ikke scroll-animasjon han savner.

## Det som faktisk skiller

| | oss | jeton | osmo |
|---|---|---|---|
| **Elementer som blør ut av skjermkanten** | **8** | 388 | **1966** |
| Videoer | 2 | 3 | **36** |
| Bilder | 2 | 40 | **90** |
| Store SVG | 1 | 9 | 23 |
| Visuelle objekter til sammen | **5** | 52 | **149** |
| Bevegelse i ro (pikselavvik uten scroll) | 153 | **485** | 222 |
| Største flate (skjermer) | 9,5 | 13,9 | **25** |
| Skrifter | 2 gratis Google | Sequel Sans | 4 lisensierte |

### 1. Blødning: 8 mot 1966

Alt vårt sitter på rutenett, oppreist, innenfor marger. Hos osmo ligger nesten to tusen
elementer delvis utenfor skjermkanten. Det er den enkeltfaktoren som skiller «satt opp i
et oppsett» fra «komponert».

### 2. Mengde visuelle objekter: 5 mot 149

osmo har 36 videoer, 90 bilder og 23 SVG-er. Vi har to videoer, to bilder og én SVG på
forsiden. Tettheten er det som leser som rikdom.

### 3. Bevegelse i ro, ikke under scroll

jeton har tre ganger vårt pikselavvik når siden står helt stille — fra videoløkker og
canvas som går uavhengig av scroll. Vår side beveger seg **bare når du scroller**. Står du
stille, står den stille.

Det er antakelig dette kunden mener. Han ser en side som ikke lever før han gjør noe.

### 4. Skriften

epic bruker `sang-bleu`, jeton `Sequel Sans`, osmo `Haffer VF`, `Haffer Mono`, `Haffer XH`
og `Brisa Pro`, dropbox `Atlasgrotesk` og en egen variabel grotesk. **Alle fem referansene
bruker lisensierte eller egne skrifter.** Vi bruker `Schibsted Grotesk` og `JetBrains
Mono` — to gratis Google-skrifter som tusenvis av tekniske nettsteder bruker.

## Kontaktark, sett med øynene

`.skudd/ark-jeton.png` mot `.skudd/ark-oss.png`, seks rammer hver gjennom hele scrollen.

**jeton** skifter flate fem ganger på seks rammer: myk gradient → hvit → mettet oransjerød
som fyller rammen → hvit med 3D-render → livsstilsfoto av mennesker → mørkegrønne
fotokort. Hver ramme ser ut som en ny side.

**Vi** har én mørk hero, og deretter fem rammer lys grå med tekstblokker, kort, pristabell
og FAQ-liste. Samme flate, samme elementstørrelse, samme avstand til margen hele veien.

## Hva en solo-utvikler kan bygge, og hva som krever budsjett

**Gratis, ren CSS:**
- Blødning ut av kantene. Fra 8 til 300+ er et oppsett-valg, ikke et innkjøp.
- Rotasjon og forskyvning av kort. osmo roterer kort i ulike vinkler; vi har alt oppreist.
- Egen bakgrunnsfarge per seksjon.
- Skala-variasjon: ett element som fyller 25 skjermer slår ti som fyller én.

**Gratis, og vi har det allerede:**
- **Ni videoklipp vi maskerer bort.** Vi viser dem på 42 % opasitet bak tekst, så de
  registreres knapt som flate. Referansene viser materialet sitt i full styrke. Vi betaler
  megabyte uten å få effekten.
- **Bevegelse i ro.** Klippene våre spoles av scroll. Lar man ett av dem gå i løkke, lever
  siden når brukeren står stille.
- Diagrammene (`Flyt`, `Snitt`) er SVG til 0 kB og kan mangedobles billig.

**Krever budsjett:**
- 90 produktfotografier (osmo) eller 40 bildeelementer (jeton).
- En lisensiert skrift. Dette er et innkjøp, ikke et utviklingstiltak — og det er den
  enkeltposten som alene endrer førsteinntrykket mest.

## De fem endringene som ville gjort størst forskjell, rangert

1. **La minst ett klipp gå i løkke i full styrke.** Siden må bevege seg når brukeren står
   stille. Vi har materialet; vi skjuler det. Dette er det eneste tiltaket som direkte
   svarer på «det er bevegelse jeg ønsker».
2. **Blødning fra 8 til 300+.** La bilder, kort og diagrammer gå ut av margen og utenfor
   skjermkanten. Rent CSS, null kilobyte.
3. **Egen bakgrunnsfarge per seksjon.** Fra 2 til 5–6 flater. dropbox-brand gjør hele
   jobben med 7 farger, 0 bilder og 3 skjermhøyder.
4. **Bytt display-skriften til en lisensiert.** Behold monospace til terminalen — den er
   vår. Overskriftene bør ikke være en gratis Google-grotesk.
5. **Roter og forskyv.** Alt vårt er oppreist på rutenett. Kort i ulike vinkler og
   størrelser er gratis og er halve forskjellen mellom «oppsett» og «komposisjon».

## Er koordinatorens diagnose riktig?

**Nei, ikke helt — og min første var også feil.**

«Problemet er farge og bilder» stemmer delvis: vi har 5 visuelle objekter mot osmos 149.
Men epic.net har **null bilder og 0,5 % farget flate**, og kunden kaller den kreativ.

Den presise diagnosen er at vi mangler **tre ting samtidig**: bevegelse som går uten
scroll, komposisjon som bryter margen, og enten en usedvanlig skrift eller en mengde
visuelle objekter. Vi har valgt den asketiske veien uten virkemidlene som bærer den.
