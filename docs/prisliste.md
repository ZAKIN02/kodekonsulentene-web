# Prisliste

**Sannheten står i `src/data/priser.ts`.** Dette dokumentet forklarer hvorfor prisene
er som de er. Endrer du en pris, endrer du den i koden – nettsiden, tilbudsmalen og
`kodekonsulentene-tilbud`-skillen leser derfra.

**Prisene er endelige.** Foretaket er ikke mva-registrert, så det kommer ingen mva på
toppen. Se «Mva» nederst – teksten på nettsiden styres av `firma.mva` og snur av seg
selv den dagen vi blir registrert.

## Pakker

| Pakke | Pris | For hvem |
|---|---|---|
| Start | 14 900 kr | Trenger å finnes, bli ringt og bestå lovkravene |
| Bedrift | 29 900 kr | Skal rangere lokalt og endre teksten selv |
| System | fra 60 000 kr | Trenger booking, betaling og regnskap som henger sammen |

## Løpende

| | Pris | Binding |
|---|---|---|
| Abonnement | 1 290–1 990 kr/mnd | 12 mnd |
| Drift og vedlikehold | 590–1 490 kr/mnd | Ingen |
| Lovsjekk-pakke | 7 900 kr | Engangs |
| Timepris | 950 kr/t | – |

## Hvorfor disse tallene

Markedet er priset i tre lag:

1. **Abonnement uten oppstartskostnad, 349–1 740 kr/mnd.** Malbasert, levert raskt, lite
   skreddersøm, og normalt eier du ikke koden. Laveste og høyeste er lest på
   leverandørenes egne sider 7. oktober 2026: WebPack 349 kr/mnd, Webagent 1 740 kr/mnd,
   med Acendia 990 kr/mnd mellom.
2. **Fastpris-frilansere og små byråer, 9 990–39 900 kr.** HjemmesideHelten publiserer
   9 990 / 24 990 / 34 990 kr, Webmestern 19 900 / 39 900 kr. Begge lest 7. oktober 2026.
3. **Byråer: 80 000–200 000 kr** for en standard bedriftsside med skreddersydd design,
   webapplikasjoner fra 250 000 kr. Kilden oppgir selv at tallene er veiledende anslag.

Hullet ligger mellom lag 1 og lag 3: **systemer og integrasjoner til SMB-pris.**
Det er der KodeKonsulentene ligger.

Timepriser i markedet: norske byråer tar typisk 900–1 800 kr/t, frilansere 600–1 200 kr/t.
950 kr/t er realistisk i starten og lar seg heve når casene finnes.

> **Forbehold om tallene.** Hvert tall over står i `src/data/markedspriser.ts` med
> kilde-URL og dato, og `test/kilder.test.ts` feiler hvis en kilde er borte. De er hentet
> fra leverandørenes egne nettsider: de har kommersielle interesser og bruker ulike
> definisjoner av «enkel nettside» – spennet går fra 9 990 kr til 80 000 kr for det samme
> ordet. Bruk dem som markedssignal, ikke som fasit.
>
> **Det finnes ingen uavhengig norsk statistikk på hva bedrifter faktisk betaler for en
> nettside.** Ikke hos SSB, Virke, Abelia, Mittanbud eller Tjenestetorget. Alt som
> sirkulerer er byråenes eget markedsmateriell. Her sto det tidligere «median 35 000 kr og
> snitt 42 800 kr på 50 prosjekter i 2025», oppgitt som en leverandørs eget utvalg. De tre
> tallene står ikke på den leverandørens side, og ingen av dem kunne bekreftes
> 7. oktober 2026. Påstanden er fjernet, ikke omskrevet. Skriv aldri inn et snitt eller en
> median for det norske markedet igjen uten å kunne peke på hvor det er regnet ut.

## Prinsipper

- **Prisene står åpent på nettsiden.** Norske konkurrenter på SMB-nivå gjør det. Uten priser blir du sammenlignet med dem som har dem, og taper sammenligningen uten å være til stede.
- **Ikke konkurrer på pris mot 349 kr/mnd.** Du taper, og du tiltrekker kunder som bytter neste år. Legg deg høyere og forsvar det med systemer og sikkerhet. (Tallet var «499 kr/mnd» til 7. oktober 2026. Det kom fra en kilde som ikke fins – se `src/data/markedspriser.ts`. 349 kr/mnd er WebPacks publiserte pris, lest samme dag.)
- **Abonnement krever binding.** Byggekostnaden ligger i de første månedene. Si det tydelig i stedet for å skjule det.
- **Hev aldri prisen for en kunde midt i et oppdrag.** Hev den for neste kunde.
- **For lav startpris er en felle.** Den tiltrekker feil kunder og gjør det vanskelig å heve senere.

## Mva

**Vi er ikke mva-registrert.** Verifisert 7. oktober 2026 mot Enhetsregisteret:
`registrertIMvaregisteret: false`
([data.brreg.no](https://data.brreg.no/enhetsregisteret/api/enheter/936374336)).
Som ENK må du registrere deg i Merverdiavgiftsregisteret når omsetningen passerer
**50 000 kr i løpet av 12 måneder**.

### Rådet som sto her før var feil

Det sto: «Vis priser "eks. mva" konsekvent fra dag én, så slipper du å endre alle tall
den dagen du passerer grensen.» Det ble fulgt, og «eks. mva» sto elleve ganger på
`/priser` mens vi ikke hadde lov til å fakturere mva. Konsekvensen er ikke kosmetisk:

- Et foretak utenfor Merverdiavgiftsregisteret **kan ikke** kreve inn mva. «Eks. mva» er
  da ikke et forbehold – det er et tillegg som aldri kommer, og leseren regner
  29 900 × 1,25 = 37 375. Vi framsto 25 % dyrere enn vi er.
- Det traff hardest i det dyreste segmentet. Merverdiavgiftsloven § 3-2 unntar
  helsetjenester fra avgift, og unntaket gir ingen fradragsrett for inngående avgift
  ([Skatteetatens Merverdiavgiftshåndbok M-3-2](https://www.skatteetaten.no/rettskilder/type/handboker/merverdiavgiftshandboken/2023/M-3/M-3-2/M-3-2.2/)).
  En klinikk kan altså ikke trekke fra mva i det hele tatt. For nøyaktig den målgruppen
  `/bransjer/klinikker` henvender seg til, leses «eks. mva» som 25 % reell merkostnad – på
  en pris der det ikke engang påløper.
- Ehandelsloven § 8 krever dessuten at mva-statusen **opplyses**. Å skrive «eks. mva» når
  vi ikke er registrert er ikke bare dyrt, det er feil opplysning.

### Slik gjøres det i stedet

Prisen skrives som den er, med én forklaring: «Prisene er endelige. Foretaket er ikke
mva-registrert, så det kommer ingen mva på toppen.» Det er sant, etterprøvbart i
Enhetsregisteret, og gjør oss 25 % billigere i kjøperens hode uten å senke prisen med
én krone.

Teksten er en **vakt, ikke en streng**: `mvaSetning` og `prisenhet` i
`src/data/priser.ts` leser `firma.mva` og snur begge formuleringene av seg selv. Når
omsetningen passerer grensen gjør du derfor én ting – sett `mva: true` i
`src/data/firma.ts`. Da blir «endelig pris» til «eks. mva» overalt,
`valueAddedTaxIncluded` i de strukturerte dataene snur, og «MVA» kommer etter org.nr. i
footeren. Ingen skal måtte lete opp elleve strenger den dagen.
