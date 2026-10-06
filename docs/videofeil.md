# Gjennomgang av alle klipp, 6. oktober 2026

Metode: tre rammer per klipp (8 %, 50 %, 92 % av varigheten), satt side om side og
sett på. Kontaktkopier i `.skudd/ark-*.png`.

## Ødelagt

| Klipp | Hvor | Feilen |
|---|---|---|
| `steg` / `hist2-steg` | **forsiden** | Boksen BYTTER FORM mellom rammene: ramme 1 er en bred, flat boks med et lite firkantet hull, ramme 2 en høyere kube med stor åpning, ramme 3 bred igjen med spalter. Perspektiv og proporsjoner endrer seg – det er en morf, og den ligger på vår viktigste side. |
| `lev2-klinikk` | `/bransjer/klinikker` | De fylte feltene BYTTER PLASS mellom rammene i stedet for å fylles opp. Skinnen er dessuten kuttet av høyre bildekant, med stor tom flate over. |

## Nesten ingen bevegelse

| Klipp | Hvor | Observert |
|---|---|---|
| `nettsider` | `/nettsider` | Alle tre rammene er praktisk talt identiske. Bare en svak grønn linje mot slutten. |
| `sikkerhet` | `/sikkerhet` | Én plate glir så vidt ut helt til slutt. Resten står. |
| `bransje-sortering` | `/bransjer/handverkere` | Blokkene står spredt og endrer seg knapt; én lyser grønt til slutt. Leser som tilfeldige esker. |

## Virker

`hist2-apne` (blokk forsegles, kjerneprøve skyves ut, indre blottlegges), `apper`
(lys vandrer langs kabel), `priser` (stabel deler seg i 2/3/4), `lev-om`,
`lev-status`, og alle skjermopptakene. `priskalkulator` er sterkest: ekte tall
teller fra 29 900 til 288 000–373 500.

## Årsaken til morfene

`_bevar` holder materiale og tykkelse, men ikke FORM og ikke ANTALL. Når
sluttbildet redigeres med en instruksjon som åpner for ny geometri, tegner
modellen et nytt objekt. Kjedingen (sluttbilde fra startbilde) hjelper, men
holder ikke alene – formen må låses eksplisitt i prompten.
