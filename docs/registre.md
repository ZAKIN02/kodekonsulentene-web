# Visuelle registre

## Problemet, og hvorfor det ikke var et smaksspørsmål

En synrunde (`docs/syn2.md`) fant at **19 av 21 medieelementer var det samme objektet**:
en hengende stabel aluminiumsplater på nesten svart. Bytter du underside, skifter
teksten – bildet ser likt ut.

Årsaken er mekanisk, ikke estetisk, og den står i to linjer kode.

**Ett basisbilde.** Hvert eneste stillbilde lages som en *redigering* av én fast fil:

```js
const basisUrl = `${CDN}/${DEF.basis}.png`;   // 6f5a4bd2-4820-4797-a67c-1ae32fb8444b
prompt: `${STIL}\n\nEdit the supplied image. ${DEF._bevar} ${bilde.endring}`
```

Alle sju promptfilene som har en `basis`, peker på samme UUID.

**Og en `_bevar`-setning som fryser alt annet.** Ordrett fra `verktoy.json`:

> Keep exactly identical: camera position, focal length, perspective, framing, the
> near-black background, the thin suspension wires, and the material, surface finish,
> colour and thickness of every plate. Do not restyle, do not change the lens.
> **Only the one arrangement described below changes.**

Det var altså fysisk umulig for to bilder å bli forskjellige i annet enn hvordan platene
lå. Monotonien var ikke en glipp – den var en spesifikasjon.

### `_bevar` er riktig verktøy på feil nivå

Inne i **ett klipp** er den nødvendig. Skifter objektet mellom start- og sluttbilde, blir
mellomrommet en morph, og det er nettopp det som får AI-video til å se billig ut. To slike
feller ble fanget før de gikk live (`under.json`).

På tvers av **sider** er den det som gjør nettstedet ensformig.

Regelen er derfor: `_bevar` gjelder innenfor et klipp, aldri mellom sider.

---

## Merkevare mot vane

Det avgjørende skillet. Venstre kolonne gjør et bilde til vårt; høyre kolonne er bare noe
vi gjorde første gang og så gjentok nitten ganger.

| Merkevare – endres aldri | Vane – fritt å endre |
|---|---|
| Nesten svart grunn `#0b0d10`, jevn | Den hengende platestabelen |
| Én aksent, lime `#c8f24a`, under 3 % | Opphengstrådene |
| Hårlinjen som tegneredskap | 85 mm trekvartvisning, 25° ovenfra |
| Presisjon, kjølig nøytralt lys | Ett mykt hovedlys fra øvre venstre |
| Ingen tekst, logo, mennesker, hender | Halvtotal som eneste skala |
| Rolig negativ plass til typografi | Objektet i høyre 60 % |
| | Aluminium som eneste materiale |

Den siste linjen er verdt å merke seg: stilkortet **listet fem materialer** – børstet stål,
frostet borosilikatglass, mørkt kretskort med kobberbaner, matt teknisk keramikk – og fire
av dem er aldri brukt én eneste gang, fordi `_bevar` forbød å endre materiale.

### Hva som ble gjort med stilkortet

`stilkort.txt` fastsetter ikke lenger motiv, kamera eller lyssetting. Det beskriver bare
grunn, palett, finish, temperatur, negativ plass og forbud. Kamera, lys, materiale og
motiv hører nå til **registeret**.

Dette er trygt for de eksisterende promptfilene: de har sin egen `_bevar` som uansett
gjentar kamera og materiale, så de virker som før.

> Merk for den som redigerer `stilkort.txt`: filen leses rått og settes foran hver eneste
> prompt. Alt som står i den, går til modellen. Legg aldri forfatternotater der – de blir
> lest som instruksjoner. (Jeg gjorde nettopp den feilen og måtte rette den.)

---

## Registrene

Fire måter å se på det samme. Alle bærer merkevaren; ingen deler kamera, skala eller lys.

### 1. Nært – endrer skala

Makro, 100 mm, f/2.8. Én fas fyller bildet diagonalt; blåsesandingen leses som korn. Lime
som en tråd som er skarp der fokusplanet krysser den og mykner mot begge ender.

Det billigste bruddet som finnes: samme materiale, samme merkevare, men i en skala der
objektet ikke lenger er gjenkjennelig. **Passer der teksten handler om detaljer og håndverk.**

`public/bilder/reg-naer-*.avif` · 77 kB i 1600 px

### 2. Plan – endrer kamera

Ortografisk oppriss, null perspektiv, ingen skyggelegging, ingen materialgjengivelse. Sju
hårlinjer i blek stål, én av dem lime. Leser som en teknisk tegning.

Det mest merkevaretro registeret av alle, fordi hårlinjen og presisjonen *er* merkevaren –
her er de hele motivet i stedet for en detalj på et objekt.

`public/bilder/reg-plan-*.avif` · **13 kB** i 1600 px. Den lave vekten er riktig, ikke en
feil: flate flater og rene former komprimerer nesten gratis i AVIF.

### 3. Gjennomlyst – endrer materiale og lys

Frostet borosilikatglass, lys bakfra som går *gjennom* i stedet for å reflekteres av.
Tonestrukturen snus: lysende mellomtoner i stedet for høylys som striper på svart.
Materialet sto allerede i stilkortet og hadde aldri vært brukt.

**Dette registeret er ikke ferdig.** Se målingen under.

`public/bilder/reg-gjennomlyst-*.avif` · 11 kB i 1600 px

### 4. Ekte opptak – ikke generert i det hele tatt

`public/historie/verktoy-1920.mp4` er et skjermopptak av vårt eget verktøy som kjører mot
nkom.no, med ekte status: `307 ms TTFB`, `Sikkerhetsheadere 3/6`, `Cookies før samtykke 0`,
`Universell utforming 1 feil`, `Lovpålagt informasjon: Org.nr. mangler`, `Samlet 50 av 100`.

Det er det sterkeste materialet på nettstedet, og grunnen er ikke estetisk:

- det **beviser** at produktet finnes og virker, i stedet for å antyde det
- det viser nøyaktig det kunden kjøper
- en konkurrent kan ikke kopiere det uten å bygge verktøyet
- det bærer merkevaren av seg selv, fordi det *er* designsystemet i bevegelse

Brandboken rangerer allerede ekte skjermbilder over alt vi kan generere.

---

## Målt: hvor kan typografi ligge?

Kontrast mot hvit tekst, per tredel av bildet. `snitt` er gjennomsnittlig bakgrunn,
`verst` er lyseste piksel i tredelen.

| Register | Venstre | Midt | Høyre |
|---|---|---|---|
| Nært | 11,0:1 snitt · 1,1 verst | 9,7 · 1,0 | 11,3 · 1,1 |
| Plan | 9,0:1 snitt · 1,3 verst | 8,8 · 1,4 | 9,0 · 1,3 |
| **Gjennomlyst** | 12,1:1 snitt · 1,1 verst | **2,0** · 1,0 | **3,5** · 1,0 |
| *nart (gammelt, til referanse)* | *19,4 · 19,0* | *12,6 · 1,2* | *14,7 · 1,8* |

Verktøy: `.skudd/reg/lysmaal.mjs`.

**Les tabellen slik:** et snitt over 4,5 betyr at tredelen tåler tekst som hovedregel; en
lav `verst` betyr at det finnes lyse detaljer teksten må styre unna.

- **Nært og Plan** tåler tekst i alle tre tredeler på snittet. Teksten må holde seg unna
  henholdsvis den opplyste diagonalen og selve stolpene.
- **Gjennomlyst stryker.** Midtre tredel ligger på 2,0:1 og høyre på 3,5:1 *i snitt* – det
  er ikke en lys detalj å unngå, det er to tredeler av bildet som ikke tåler hvit tekst i
  det hele tatt. Baklyset er blåst ut.
- Den gamle `nart` viser hva stilkortets «rolig venstre tredel» faktisk ga: 19,0:1 også på
  lyseste piksel, altså helt tom. Det er verdt å beholde som krav.

**Gjennomlyst må gjøres om før bruk:** baklyset ned flere trinn, panelene lenger ned i
bildet, og gulvrefleksen bort – den innfører en horisontlinje som stilkortet forbyr.

---

## Anbefalt fordeling

| Side | Register | Hvorfor |
|---|---|---|
| `/` | Ekte opptak | Forsiden skal vise at produktet virker, ikke antyde det |
| `/verktoy`, `/sjekk` | Ekte opptak | Har det allerede; det sterkeste vi har |
| `/om`, `/handbok` | Nært | Håndverk og detaljer |
| `/systemer`, `/sikkerhet` | Plan | Struktur og lag, lest som diagram |
| `/priser`, `/status` | Plan | Måling og orden |
| `/caser` | Ekte opptak | En case uten bevis er en påstand |
| `/nettsider`, bransjesider | Stabel (dagens) | Fortsatt god – bare ikke overalt |

Poenget er ikke å pensjonere platestabelen. Den er god. Poenget er at den er **ett** av
fire registre i stedet for det eneste.

**Og den tydeligste anbefalingen:** flere sider bør få ekte opptak i stedet for flere
genererte bilder. Vi har fem verktøy som kjører mot ekte data. Hvert opptak av dem er mer
overbevisende enn noe vi kan be en modell om, og koster ingen API-kreditt.

---

## Slik kjører du

```bash
node .skudd/registre.mjs naer          # eller plan, gjennomlyst
```

Skriptet ligger i `.skudd/` og ikke i `scripts/` fordi `scripts/stillbilde.mjs` alltid
redigerer basisbildet og alltid setter stilkortet foran. Registrene må genereres fra tekst,
uten basisbilde, ellers arver de monotonien de skal bryte. Vil man gjøre dette permanent,
hører en `--register`-modus hjemme i `scripts/stillbilde.mjs`.

## Regler for den som lager FILM i et register

Prøvene over er stillbilder, laget i ett tekstkall hver. Skal et register bli til et klipp,
gjelder tre ting som andre agenter har betalt for å lære:

**Lås kameraet mellom start- og sluttbilde.** Et klipp mellom to ulike utsnitt leser som
en zoom, og det er nøyaktig den billige AI-effekten kunden klager på. En hel scene ble
forkastet fordi sluttbildet hadde re-framet kameraet.

**Rediger sluttbildet FRA startbildet, ikke fra basisbildet.** Redigeres de to uavhengig,
arver de ikke hverandres arrangement. Det ga et sluttbilde med elleve blokker der
startbildet hadde ti, og den ekstra var lagt til i stedet for løftet opp – i klippet
materialiserer den seg av ingenting.

**Her gjelder `_bevar` fullt ut.** Inne i ett klipp er den nødvendig, og det er det eneste
stedet den hører hjemme. Mellom sider er den årsaken til problemet dette dokumentet løser.

**Sett pollingen.** `@higgsfield/client` har `maxPollTime: 300000` (5 minutter) som
standard, og Kling 3.0 i 4K bruker lengre tid. Klienten gir opp mens jobben fullfører hos
leverandøren, og det leser som at genereringen feilet. Bruk `maxPollTime: 30 * 60 * 1000`
og `pollInterval: 5000`, som `scripts/scene.mjs` og `.skudd/registre.mjs` nå gjør.

---

## Utenfor mandatet, men verdt å vite

`lagBasis()` i `scripts/scene.mjs` sender **ikke** `resolution: "2k"`. Alle basisbilder til
video lages derfor i 1280×720 – leverandørens standard, og nøyaktig den oppløsningen det
har vært klaget på. `scripts/stillbilde.mjs` setter den riktig; `scene.mjs` gjør det ikke.
