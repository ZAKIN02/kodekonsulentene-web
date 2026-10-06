# Redaksjonell gjennomgang av bildematerialet

*6. oktober 2026. Mål: `node .skudd/redaksjon.mjs`. Vurderingen er redaksjonell, tallene er målt.*

## Dommen

Kunden sier bildene ikke gir historie eller mening. Det stemmer, og årsaken er ikke
håndverket — hvert enkelt motiv er teknisk godt. Årsaken er at **alle de genererte
bildene besvarer samme spørsmål: «hva slags materiale er dette?»** Ingen av dem
besvarer spørsmålet kunden har: «hva får jeg kjøpt?»

Prøven jeg har brukt: *dekk til teksten ved siden av. Skjønner en rørlegger eller
klinikkeier hva bildet handler om?*

For 14 av 16 genererte motiver er svaret nei. De viser aluminiumsplater som henger i
snorer. For de fire ekte skjermopptakene er svaret ja uten forbehold — de viser et DNS-
oppslag med SPF, DKIM og DMARC og en score på 83 av 100, og en priskalkulator som
produserer 288 000–373 500 kr med spesifisert grunnlag.

---

## Tredelingen

### Forklarer noe — behold

| Element | Side | Hvorfor |
|---|---|---|
| `dmarc`-opptaket | `/verktoy/dmarc` | Viser et ekte DNS-oppslag med resultat; kunden ser nøyaktig hva verktøyet gjør for ham. |
| `priskalkulator`-opptaket | `/verktoy/priskalkulator` | Tallet bygges opp post for post, så prisen framstår som regnestykke og ikke som påstand. |
| `uu-sjekk`-opptaket | `/verktoy/uu-sjekk` | En ekte kjøring mot et navngitt domene som består — beviset er selve kjøringen. |
| `cookie-sjekk`-opptaket | `/verktoy/cookie-sjekk` | Samme, og den eneste flaten som viser hva «cookies før samtykke» betyr i praksis. |
| `verktoy`-opptaket | `/verktoy` | Rapporttabellen mot nkom.no med 3/6 og 50 av 100 — vårt mest overbevisende materiale. |
| `bransje-klinikk` | `/bransjer/klinikker` | Eneste genererte motiv med lesbar metafor: en skinne delt i felt der de fleste står tomme leses som en timebok med hull. |

### Pynter uten å skade — kan bli, men bør vike for noe bedre

| Element | Side | Hvorfor |
|---|---|---|
| `nart` | `/om` | Lagkantene på nært hold har en viss slektskap med «du får se hva som ligger inne», men krever at du har lest setningen først. |
| `side-status` | `/status` | Den ubrutte limelinjen nedover kantene antyder «alt ligger der det skal» — svakt, men ikke feil. |
| `apper-lag` | `/apper-og-ai` | Én perforert plate blant solide er en tilstandspåstand som faktisk svarer til «ett lag som siler». |
| `side-handbok` | `/handbok` | Stabelen viftet opp viser «arbeidsmåten ligger åpen». Nærmest en illustrasjon, men uten ord. |

### Står i veien — bør ut

| Element | Side | Hvorfor |
|---|---|---|
| `hist2-apne`, `hist2-steg` | `/` | 10,79 MB på vår viktigste side for et motiv som ikke nevner nettsider, priser eller systemer med ett bilde. |
| `nettsider-*` | `/nettsider` | 9,24 MB. Siden heter «Fire krav vi setter selv» — platene viser ingen av de fire. |
| `priser-*` | `/priser` | 8,77 MB bak en prisliste. Tre stabler av ulik høyde er en rebus, ikke en pris. |
| `sikkerhet-*` | `/sikkerhet` | 6,70 MB — og seksjonen over heter «Verktøyet tok oss selv» om et ekte funn på vår egen side. Her finnes en sann historie som bildet ikke forteller. |
| `systemer-*` | `/systemer` | 4,56 MB mens teksten ved siden av beskriver booking → Vipps → Fiken → SMS i en terminalblokk. Diagrammet finnes allerede og brukes ikke. |
| `bransje-sortering` | `/bransjer/handverkere` | Usorterte blokker skal bety «forespørsler før noen har sortert dem». Ingen leser det uten fasiten. |
| `apper-*` | `/apper-og-ai` | Motivet er dessuten komponert slik at masken skjulte 80 % av det; kunden klaget nettopp på dette bildet. |
| `rekke` | `/caser` | Fire stabler som trekker seg bakover på en side som viser én case — bildet lover en portefølje vi ikke har. |
| `tre` | ubrukt | Ligger i manifestet uten å være plassert noe sted. |
| `verktoy-uu`, `-cookie`, `-dmarc`, `-pris` | verktøysidene | Står nå under et ekte opptak av samme verktøy. Platene tilfører ingenting etter at beviset er vist. |

---

## Hva det koster

```
SUM generert  63,53 MB      SUM ekte opptak  26,53 MB      71 % generert
```

Generert materiale er **2,4 ganger så tungt som alt det ekte opptaksmaterialet til
sammen**, og ligger tyngst på sidene som betyr mest:

| Side | Generert | Ekte |
|---|---|---|
| `/` | **10,79 MB** | 0 |
| `/nettsider` | 9,24 MB | 0 |
| `/priser` | 8,77 MB | 0 |
| `/sikkerhet` | 6,70 MB | 0 |

Elleve sider er 100 % generert materiale. De fire verktøysidene er de eneste der ekte
opptak dominerer — og de er de eneste sidene der et bilde beviser noe.

Omtrent **55 MB** ligger i materiale som verken forklarer eller er nødvendig. Det er
ikke bare vekt: hver megabyte er et valg om at kunden skal se en aluminiumsplate
framfor produktet.

---

## Brandboken bør strammes inn

Endringen fra i dag var for raus. Den stiller riktig spørsmål — «lyver bildet om
historikken vår?» — men glemmer det viktigere: **«sier bildet noe i det hele tatt?»**
Et generert motiv kan være fullstendig sannferdig og likevel verdiløst.

Formuleringen «typografiens tredimensjonale fetter» er dessuten et forsvar for
dekorasjon, skrevet inn i et dokument som ellers krever at alt skal gjøre en jobb.

### Forslag til ny ordlyd

> - Bilder er ekte skjermbilder eller opptak av ting som er bygget, eller ett
>   portrettfoto under «Om». Skjermbilder får `hairline` kant i `line` og
>   `radius-md`. Ingen stockfoto.
> - Et bilde skal forklare noe en kunde lurer på. Prøven er enkel: dekk til teksten
>   ved siden av. Skjønner en rørlegger hva bildet handler om, kan det stå. Hvis ikke,
>   er det dekorasjon, og dekorasjon koster båndbredde uten å gjøre en jobb.
> - Rekkefølgen når en flate trenger et bilde: **1)** opptak av verktøyet eller
>   leveransen i drift, **2)** diagram som navngir de ekte delene («Booking», «Vipps»,
>   «Fiken»), **3)** ingenting. Generert materiale er ikke på listen.
> - Generert materiale er tillatt som bakgrunnstekstur under tekst, aldri som sidens
>   bilde. Det skal aldri forestille mennesker, kunder, kontorer, skjermbilder eller
>   arbeid vi ikke har gjort — og aldri bære en påstand alene.
>
>   Regelen het før «ingen AI-genererte bilder». Den ble myket opp 6. oktober 2026 og
>   strammet inn igjen samme dag, etter at kunden påpekte at bildene ikke ga mening.
>   Det vernet regelen om var at et bilde ikke skal lyve. Det den manglet var kravet
>   om at et bilde skal si noe. Begge gjelder nå.

---

## De fem endringene som gjør størst forskjell

1. **Løft flytdiagrammet ut av `/lab/svg` og inn på `/systemer`.** Siden beskriver
   allerede booking → Vipps → Fiken → SMS i en terminalblokk. Diagrammet viser det
   samme med ekte navn, tegner seg mens man scroller, og koster 0 kB. Erstatter
   4,56 MB som ikke forklarer noe.

2. **Ta opp «Verktøyet tok oss selv» på `/sikkerhet`.** Seksjonen forteller at vår
   egen cookie-skanning tok oss selv 6. oktober. Det er den beste historien på hele
   nettstedet, og den illustreres i dag av en aluminiumsplate. Et opptak av den
   kjøringen ville vært bevis, ikke pynt. Frigjør 6,70 MB.

3. **Bytt forsidens to klipp mot ett opptak av `/sjekk` i bruk.** 10,79 MB er den
   dyreste flaten vi har, og den viser et motiv som ikke nevner noe vi selger.
   Leadmagneten i drift gjør begge deler: forklarer og konverterer.

4. **Fjern de fire `verktoy-*`-stillbildene.** De står under et ekte opptak av nøyaktig
   samme verktøy. Når beviset er vist, er platen under ren støy.

5. **Bygg ett diagram per bransjeside** med ekte noder — «Forespørsel → Tilbud → Ordre
   → Faktura» for håndverkere, «Timebestilling → Betaling → Kalender → Påminnelse» for
   klinikker. Da forstår en kunde tilbudet på fem sekunder uten å lese en setning.

### Det jeg ikke ville rørt

`bransje-klinikk` er det eneste genererte motivet som bærer en lesbar metafor, og
`apper-lag` gjør en ærlig tilstandspåstand. Begge kan stå til noe bedre finnes.

### En observasjon utenfor mandatet

Masterne i `assets/mastere/` er 81 MB. De er riktige å beholde — de gjør omkoding
gratis — men hvis det meste av det genererte materialet skal ut, bør det ryddes der
også, ikke bare i `public/`.
