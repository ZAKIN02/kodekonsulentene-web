# Store, fargesterke motiver

## Hvorfor dette finnes

Kunden sammenlignet med [jeton.com](https://www.jeton.com/) og sa at ingenting
imponerende hadde kommet ut av Higgsfield. Målt på begge sider:

| | jeton.com | kodekonsulentene.no |
|---|---|---|
| Dominerende farge, antall forekomster | `rgb(247,59,32)` × **254** | `rgb(20,23,27)` × 312 |
| Merkevarefargen brukt | 254 ganger | **7 ganger** |
| Store bilder | 12 | **1** |
| Unike skriftstørrelser | 10 | 16 |

Legg merke til siste rad: vi har **flere** skriftstørrelser enn referansen. Det er
altså ikke typografien som gjør forskjellen. Det er at jeton bader flaten i sin egen
merkevarefarge, mens vi bruker vår sju ganger.

## Svaret er ikke en ny farge

Det nærliggende – og feile – grepet er å finne en ny, varm farge. Da slutter siden å
være vår. Det riktige er å la **vår egen farge være feltet i stedet for en hårlinje.**

Grunnen er fortsatt nær-svart `#0b0d10`, så hvit tekst er lesbar. Det som endres er én
setning i `stilkort.txt`:

> *Før:* one accent only: lime green `#c8f24a`, **used exclusively as hair-thin
> emissive lines covering less than 3% of the image.**
>
> *Nå:* … Unless the scene below explicitly says otherwise, the accent is used only as
> hair-thin emissive lines covering less than 3%; **a scene may instead call for the
> accent to act as a large, saturated light source.**

Det er formulert som en standard en scene kan overstyre, ikke som en ny regel. De
tretten eksisterende promptfilene gjentar bakgrunn og materiale i sin egen `_bevar`,
så de oppfører seg som før – verifisert før endringen.

## Kravet som ikke kan vikes

Venstre tredel skal være **tom og nær-svart**. Det første fargeforsøket
(«gjennomlyst», `docs/registre.md`) strøk med 2,0:1 i midtre tredel og 3,5:1 i høyre –
ikke en lys detalj å styre unna, men to tredeler som ikke tålte hvit tekst.

Derfor står kravet ordrett i `_bevar`, og måles med `.skudd/stor-maal.py`, som
rapporterer både snitt, verste piksel og hvor stor andel av tredelen som faktisk er
mettet lime.

## Resultat

| Scene | Lime i bildet | Venstre tredel | Status |
|---|---|---|---|
| `stor-sveip` | 7,1 % → **11,6 %** | 19,7:1 · 0 % lime | **levert** |
| `stor-kjerne` | 0,2 % → 0,3 % | 19,9:1 · 0 % lime | forkastet |
| `stor-gjennom` | – | – | feilet hos leverandøren |

### `stor-sveip` – levert

En bred, mettet vegg av limelys som sveiper over en matt mørk flate og avdekker et
presist maskinert rutenett bak seg, flommet i grønt. Grunnbildet måler **41,7 % mettet
lime i midtre tredel**, mot den gamle regelen på under 3 % i hele bildet.

Det er bokstavelig talt det verktøyet vårt gjør: en flate som ser grei ut utenfra, og
et lys som går over den og viser strukturen under.

Rammeparet er verifisert før 4K ble bestilt: panelet har identisk størrelse, posisjon
og hjørner i begge rammer, og rutenettet ligger på samme sted. Bare lysfeltet vokser.

**Hører hjemme på `/sjekk` eller forsidens verktøyseksjon.**

### `stor-kjerne` – forkastet, og hvorfor

Grunnbildet er godt: en matt gunmetal-blokk med et stort, intenst limegrønt hulrom,
19,5 % mettet lime i høyre tredel.

Men start- og sluttbildet ble **praktisk talt identiske** – 0,2 % mot 0,3 % lime. Den
lysende kjernen gled aldri ut. Et klipp mellom dem ville stått helt stille.

Årsaken er verdt å skrive ned, og den er nå `_felle3` i `stor.json`:

> **Objektet som skal bevege seg må være synlig som et eget objekt i grunnbildet.**
> Prompten ba om at en lysende kjerneplate skulle gli ut av en kanal, men grunnbildet
> viste bare et lysende *hulrom*. Det fantes ingen plate å flytte, så modellen
> reproduserte grunnbildet to ganger.

Dette er samme klasse som `_felle` i `under.json` (to ulike objekter gir morf) og
`_felle2` (uoppgitt antall gir oppfunne objekter). Forskjellen er at her blir
resultatet ikke en morf, men **ingen bevegelse** – like ubrukelig, og vanskeligere å
oppdage uten å måle.

Grunnbildet ligger i `.skudd/stor/kjerne-basis.png` og kan gjenbrukes hvis motivet gis
en adskilt, flyttbar del.

### `stor-gjennom` – feilet hos leverandøren

`Generation took too long to complete` på selve grunnbildet. Det er leverandørens egen
tidsgrense, ikke vår polling – den står på 30 minutter. Prompten er urørt og kan kjøres
på nytt.

## Ærlig vurdering

`stor-sveip` er til å få øye på, og den er det første genererte motivet på nettstedet
som ikke er en aluminiumsstabel på svart. Men **én scene er ikke en omlegging.** Skal
siden lese som jeton gjør, må flere flater bære farge – og det er like mye et spørsmål
om CSS-flatene som om filmene. Aksenten brukes sju ganger på forsiden; det tallet
flyttes ikke av ett klipp.

## Slik kjører du

```bash
set -a; . ~/.config/kodekonsulentene/higgsfield.env; set +a
node scripts/scene.mjs stor-sveip --fil assets/prompter/stor.json --kun-bilder   # rammer først
./.skudd/stor-ark.sh stor-sveip                                                  # se på paret
python3 .skudd/stor-maal.py .skudd/stor/stor-sveip-*.png                         # mål
node scripts/scene.mjs stor-sveip --fil assets/prompter/stor.json                # så 4K
```

Rekkefølgen er ikke valgfri. Fire agenter har stoppet en morf ved å se på rammeparet
før klippet ble bestilt, og denne runden stoppet en femte – en scene uten bevegelse i
det hele tatt.
