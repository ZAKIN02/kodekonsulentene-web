# Kanaler – de første kundene

Rangert etter hva som gir lavest tid per signert kunde for en solo-utvikler i Oslo.

## 1. Eget nettverk

Familie, studiemiljø, tidligere arbeidsgivere, treningsmiljø. Direkte melding med et
konkret tilbud, ikke «si fra hvis noen trenger nettside». Raskeste vei til de første
2–3 casene, og de casene er det som gjør resten mulig.

## 2. Partnerskap med regnskapsførere

**Høyest potensial.** En regnskapsfører har 50–200 SMB-kunder som alle trenger
integrasjoner mot Tripletex, Fiken eller PowerOffice. Tilby 10 % henvisningsprovisjon.
Dette er den eneste kanalen som kan gi jevn tilførsel uten at du selv selger.

## 3. Utgående kontakt – og e-post er ikke en av kanalene

Her sto det tidligere «Varm, personlig utgående e-post» med rapporten fra
nettsidesjekken vedlagt, begrunnet med at «B2B-e-post til foretaksadresser er normalt
tillatt etter markedsføringsloven når mottakeren er en juridisk person».

**Premisset holder ikke for vår målgruppe, og kanalen er strøket.**

Forbrukertilsynets veiledning om markedsføring via e-post og SMS, lest 7. oktober 2026
([forbrukertilsynet.no](https://www.forbrukertilsynet.no/lov-og-rett/veiledninger-og-retningslinjer/forbrukertilsynets-veiledning-markedsforing-via-e-post-sms-o-l)):
forbudet i markedsføringsloven § 15 gjelder **alle fysiske personer**, inkludert en
fysisk persons individuelle jobbadresse, **og også når adressen er registrert som
kontaktadresse til et foretak i Brønnøysundregistrene.**

Et enkeltpersonforetak **er** en fysisk person. Primærsegmentet vårt er ENK-er og de
aller minste foretakene, og at vi har funnet adressen i Enhetsregisteret er nettopp det
veiledningen sier ikke hjelper. At funnet er nyttig og e-posten personlig endrer
ingenting – det er innholdet som er markedsføring, ikke tonen. Kald e-post er i praksis
stengt mot primærsegmentet, og «B2B» er ikke et unntak i norsk rett.

**De lovlige utadrettede kanalene:**

1. **Telefon til foretakets publiserte bedriftsnummer.** § 15 regulerer elektronisk
   markedsføring, ikke oppringning til et foretak. Reservasjonsregisteret gjelder for
   fysiske personer, så sjekk det før du ringer et ENK-nummer.
2. **Fysisk post til foretaksadressen.** Treffer ikke § 15.
3. **Alt inngående:** søk, Google Bedriftsprofil, omtaler, henvisninger og innhold –
   altså kanal 2, 4, 5 og 6 i denne listen.

**Gratis-skanningen er riktig produkt, men bare slik den er bygget nå:** brukeren ber
selv om rapporten og oppgir selv adressen sin. Da er det en tjeneste han har bedt om, og
den er ikke uoppfordret markedsføring. Betingelsene for at den skal forbli det står i
`docs/epost.md`. **Bygg aldri en versjon som sender rapporter til adresser vi har
skrapet** – vi har allerede en liste over småbedriftsnettsider med påviste avvik
(`src/data/maalinger.json`), og kombinasjonen av den listen og en utsending er presis det
§ 15 forbyr. Masseskanningen er grunnlag for aggregert statistikk, aldri en
adresseliste.

## 4. Google – lokal SEO

Langsiktig, 3–6 måneder før effekt. Start dag én: Bedriftsprofil, samme navn, adresse
og telefon overalt, egne landingssider per tjeneste og bransje, strukturert data, og
systematisk innhenting av anmeldelser etter hvert prosjekt.

Skriv innhold om pris og regelverk. «Hva koster en nettside» er hovedspørsmålet i
bransjen, og alle konkurrentene skriver om det – det betyr at det er søkevolum der.

## 5. LinkedIn – bygg i det åpne

Én kort post i uka fra et ekte prosjekt, med kundens samtykke. Bygger merkevare over
tid og dokumenterer caser samtidig. Middels tempo.

## 6. Lokale Facebook-grupper

Bydelsgrupper, næringsforeninger, bransjegrupper. Hjelpsomme svar, ikke reklame.
Lav kostnad, varierende kvalitet.

## 7. Mittanbud

Abonnement med «klipp». Mange jobber, men nesten alt er håndverksfag, og fokuset er
pris. **Test i én måned før du binder deg.** En rørlegger sitert i fagpressen sier det
rett ut: du må ha volum for at det skal lønne seg. Prisen er ikke offentlig.

## 8. Finn.no

Lav prioritet – kanalen trekker priskunder, og det er den kundetypen posisjoneringen er
bygget for å unngå. Her sto det tidligere «Konkurrenter annonserer nettside fra
399 kr/mnd» på Finn.no. Vi har ikke kontrollert noen Finn-annonse, så påstanden er
fjernet. Det vi faktisk kan vise til er publiserte abonnementspriser fra 349 kr/mnd, med
kilde og dato i `src/data/markedspriser.ts`.

## Måling

Før logg over tid brukt per kanal og antall signerte kunder. Etter 60 dager:
behold de to med lavest tid per signert kunde, kutt resten. Ikke behold en kanal fordi
den føles produktiv.
