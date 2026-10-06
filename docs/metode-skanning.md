# Metode for skanning av nettsider

Verktøyene våre henter fremmede nettsider. Det er vanlig praksis og i utgangspunktet
uproblematisk — men vi selger sikkerhet og etterlevelse, så vi kan ikke være slurvete
med hvordan vi selv opptrer. **Les dette før en masseskanning settes i gang.**

## To ulike situasjoner

| | Enkeltsjekk | Masseskanning |
|---|---|---|
| Hva | En bruker ber selv om sjekk av en URL | Vi skanner mange sider på eget initiativ |
| Risiko | Lav | Krever at alt under følges |
| Robots.txt | Trenger ikke sjekkes — brukeren ber om det | **Skal respekteres** |

## Regler for masseskanning

- **Respekter `robots.txt`.** Er en side utestengt, skannes den ikke.
- **Tydelig User-Agent** med navn og en URL som forklarer hva vi gjør og hvordan
  man ber oss slutte. Den som ser oss i loggen skal kunne finne ut hvem vi er.
- **Lav frekvens.** Ett treff per domene per sekund som tak, og hent bare forsiden
  med mindre noe annet er avtalt.
- **Hent én gang.** Resultatet lagres, slik at vi ikke skanner på nytt for hver analyse.
- **Ingen innlogging, ingen skjemaer, ingen omgåelse** av noe som helst. Vi henter
  forsiden slik en besøkende får den første gang.

## Publisering

- **Bare aggregerte tall.** «X av Y sider i bransjen setter cookies før samtykke.»
- **Aldri navngi en bedrift med dårlig resultat.** Ikke i rapporter, ikke på
  LinkedIn, ikke i en e-post til noen andre. En bedrift som blir hengt ut fordi
  nettsiden deres har en feil, er en bedrift vi aldri får som kunde — og det er
  uansett ikke greit.
- **Navngi bare bedrifter som selv har meldt seg på** (opt-in), for eksempel i en
  ledertavle de har bedt om å være med i.
- **Publiser metoden sammen med tallene.** Hvilket utvalg, hvor mange, når, og hva
  som ikke er målt. Et tall uten metode er det samme som konkurrentenes tall vi
  selv nekter å sitere.
- **Rådata med domenenavn deles aldri.** De blir i repoet, eller de slettes.

## Personvern

En forside er ikke personopplysninger. Men:

- Lagrer vi en rapport sammen med en e-postadresse, er det personopplysninger.
  Minimal lagring, automatisk sletting, og det skal stå i personvernerklæringen.
- Et enkeltpersonforetak har ofte innehaverens navn i foretaksnavnet og
  hjemmeadressen som forretningsadresse. Behandle slike treff deretter.

## Kald e-post

Markedsføringsloven § 15 krever forhåndssamtykke for e-postmarkedsføring til
**fysiske personer**. Generiske foretaksadresser som `post@` og `firmapost@` er tillatt.

**Et enkeltpersonforetak er en fysisk person.** En stor del av målgruppen vår er
ENK-er, så `navn@bedrift.no` og ENK-eiere er utenfor — uansett hvor nyttig funnet er.

Den trygge veien: la dem hente rapporten selv via skjemaet på `/sjekk`. Da er det
de som tar kontakt, og vi slipper hele spørsmålet.
