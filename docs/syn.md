# Synrapport — 6. oktober 2026

23 sider sett på 390, 1280, 1440, 1680 og 2000 px med ekte Chromium. Verktøyet er
`.skudd/syn.mjs`. Skjermbildene ligger i `.skudd/syn/`.

Rapporten skiller mellom **ødelagt** (noe er faktisk galt) og **stygt** (det virker,
men ser ikke bra ut), og lister til slutt de fem funnene jeg forkastet som mine egne
målefeil. Den listen er like viktig som funnlisten.

---

## ØDELAGT

### 1. Megaoverskriftene er klipt av mot høyre kant på 11 side/bredde-kombinasjoner

Det største typografiske grepet på siden – det som skal imponere – er skåret tvers av
på høyre kant. Målt som tekstens egen maleboks via `Range`, ikke elementboksen.

| Bredde | Side | Over kanten |
|---|---|---|
| 1680 | `/verktoy/dmarc` | **+130 px** |
| 1680 | `/nettsider` | **+129 px** |
| 1680 | `/systemer` | +56 px |
| 1680 | `/sikkerhet` | +34 px |
| 1680 | `/om` | +20 px |
| 1680 | `/caser` | +4 px |
| 1440 | `/verktoy/dmarc` | +36 px |
| 1440 | `/nettsider` | +35 px |
| 1280 | `/bransjer/handverkere` | +37 px |
| 1280 | `/apper-og-ai` | +23 px |
| 2000 | `/systemer` | +13 px |

**1680 px er verst** – seks sider. Det er en svært vanlig skjermbredde.

Det ser slik ut:

- `.skudd/syn/klipp-nettsider-1680.png` — «En nettside som faktisk blir **funne**».
  Aksentordet «funnet» er kuttet midt i bokstaven. Siden handler om å bli *funnet*.
- `.skudd/syn/dmarc-linje2.png` — «i ditt navn**?**». Spørsmålstegnet er delt vertikalt
  i to. En overskrift som stiller et spørsmål, uten spørsmålstegn.
- `.skudd/syn/klipp-systemer-1680.png` — «Få systemene **du**» er avskåret.

**Rotårsaken,** fra `src/styles/typo.css`:

```css
.mega { font-size: clamp(44px, 11vw, 200px); }           /* vokser med VINDUET */
@media (min-width: 721px) {
  .mega { width: min(100vw - 2 * var(--space-6), 1600px); }  /* men boksen stopper på 1600 */
}
```

Skriftstørrelsen følger `11vw` helt opp til 1818 px vindusbredde (der 200 px-taket
slår inn), mens boksen slutter å vokse ved 1600 px. I spennet mellom ca. 1455 px og
1818 px vokser altså teksten ut av beholderen sin. 1680 px ligger midt i det spennet
— derfor er det verst der.

**Hvorfor ingen test har fanget det:** `html, body { overflow-x: clip }` ble lagt inn
for å hindre at siden kan dras sidelengs på mobil. `clip` gjør at `scrollWidth`
forblir lik `clientWidth` selv når innhold stikker utenfor. Hver vanlig overflytstest
måler nettopp `scrollWidth`, og melder grønt. Teksten blir stille klipt bort i stedet
for å skape rullefelt.

Den som skal rette det bør vurdere å knytte skriftstørrelsen til beholderen
(`container-type: inline-size` og `cqw`) i stedet for til vinduet. Da kan teksten per
definisjon ikke vokse ut av boksen sin, uansett vindusbredde.

### 2. `/priser` viser et 720 px høyt, helt svart rektangel

`.skudd/syn/priser-video.png`

Tre filer gir 404:

```
404  /scener/priser-1280.mp4
404  /scener/priser-1920.mp4
404  /scener/priser-poster.avif
```

Videoelementet rendres med full høyde, uten plakat og uten innhold. Rett over
overskriften «Vet du ikke hva du trenger?» ligger en halv skjerm ren svart.

Markupen er koblet inn før filene er generert. En agent arbeider med dette nå, så
det kan være løst når du leser dette — men slik treet står, er det en synlig død
flate på prissiden.

`/nettsider` hadde samme feil kl. 11:03 og var rettet kl. 11:17, så mønsteret
gjentar seg.

---

## STYGT

### 3. `/status` er den tynneste siden vi har

Blekktetthet 7,9 % på skrivebord og 8,3 % på mobil, mot 15–30 % på de andre
innholdssidene. `.skudd/syn/status-1440.png`. Den har fått et bilde, men under
nøkkeltallene er det mye svart og lite å se på. Ikke ødelagt, men den bærer ikke
vekten av å være en egen side ennå.

Til sammenligning: `/caser` 29,7 %, `/systemer` 22,4 %, `/om` 20,2 %.

De juridiske sidene `/personvern` (4,8 %) og `/vilkar` (5,0 %) ligger lavere, men
det er riktig for lesesider og ikke noe å rette.

---

## SER BRA UT — verifisert, ikke antatt

- **Kontrast er i orden.** 15 sider, hver eneste bladnode med tekst, målt mot
  nærmeste ugjennomsiktige bakgrunn: **ingen tekst under WCAG AA**. Verken 4,5:1 for
  brødtekst eller 3:1 for stor tekst.
- **Tekst over video er lesbar.** Sett på direkte i `.skudd/syn/video-tekst-forside.png`
  og `video-tekst-sikkerhet.png`. Kortene har ugjennomsiktig bakgrunn, og
  overskriftene står på rolige partier av filmen.
- **Ingen vannrett overflyt** på 390, 1440 eller 2000 px.
- **Ingen døde flater** når sidene måles slik en besøkende faktisk ser dem.
- **Ingen konsollfeil** utenom `/priser` sine 404-er.
- **Kortene flukter.** Eneste rutenett med ulik høyde er `hero__grid`, som er to
  ulike ting ved siden av hverandre med vilje.
- **`Avslor` degraderer riktig.** CSS først, IntersectionObserver som reserve for
  Firefox, og uten JavaScript står innholdet ferdig. Standardtilstanden skjuler
  ingenting.

---

## Fem funn jeg forkastet som mine egne målefeil

Dette verktøyet finnes fordi siden ble bygget i to dager der alt målte grønt mens den
var visuelt død. Da er min egen målemetode den farligste feilkilden i rommet.

**1. «6–7 døde flater på hver side.»** Første versjon brukte `screenshot({fullPage:true})`.
Scroll-drevne animasjoner evalueres da ved scroll 0, så alt under første skjermhøyde
fotograferes i starttilstanden sin — som for `Avslor` er `opacity: 0`. Jeg målte
opasiteten før jeg rapporterte: 0 ved scroll 0, 1 når man faktisk scroller dit.
`fullPage` gjengir heller ikke `position: sticky` mer enn én gang. Verktøyet scroller
nå i skjermhøyder og syr sammen ekte visningsbilder.

**2. «Ingen klipt tekst noe sted.»** Sveipet ga null treff — mot en død server. En
parallell agents `pkill` hadde drept min, og jeg hadde `.catch(()=>{})` på `goto`,
så 92 mislykkede navigasjoner så ut som 92 rene sider. Serveren kjører nå under
navnet `synsrv.mjs`, som ikke treffes av mønsteret `server.mjs`, og feilen svelges ikke.

**3. «`/kontakt` svarer HTTP 500.»** Reproduserbart tre ganger, så jeg trodde det var
ekte. Produksjon svarte 200. Årsaken sto i serverloggen: `Cannot find module
dist/server/chunks/kontakt_hyIDos4R.mjs`. En annen agent bygget `dist` om mens serveren
min kjørte, og chunken fikk nytt hashnavn. `/kontakt` er den eneste serverrendrede
siden, så bare den rammes.

**4. «Tekst over video har 2,0–2,5:1 kontrast.»** Jeg tok femte persentil av de
lyseste pikslene i tekstens *avgrensningsboks* — ikke bak selve bokstavene. Boksen til
et `<span>` er stort sett bakgrunn. Jeg så på bildene, og teksten er fullt lesbar.

**5. «En overskrift er klipt på `/verktoy` mobil.»** Sømartefakt i min egen stitching:
hvert delbilde inneholder den faste toppbaren, så den males inn ved hver 900. piksel.
Målt direkte: overskriften ligger på y=200 når man stopper der, toppbaren er ikke
over den.

---

## Metode

```
node .skudd/syn.mjs skann <base> [bredde]   # alle sider, syr sammen ekte visningsbilder
node .skudd/syn.mjs ark <base> <bredde>     # kontaktark
node .skudd/syn.mjs side <base> <sti> <br>  # én side
```

Blekktettheten er andelen piksler per bildelinje som skiller seg fra sidens hyppigste
farge. Den er en kikkert for å finne ut hvor man skal se, aldri en konklusjon i seg
selv. Hvert tall i denne rapporten er fulgt opp med å se på bildet.
