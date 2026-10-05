---
name: kodekonsulentene-tekst
description: Bruk når du skriver tekst i KodeKonsulentenes stemme – nettsidetekst, overskrifter, knappetekst, LinkedIn-poster, kald e-post, FAQ-svar eller rapportsetninger. Også når du skal vurdere om et utkast høres riktig ut.
---

# Stemmen til KodeKonsulentene

Kilden er `docs/brandbok.md`, avsnittet «Innhold og tone». Les den ved tvil – reglene
under er den praktiske versjonen.

## Grunnregelen

Tall og tid før adjektiver. «Levert på 3 uker. Last-tid 0,8 s.» slår «lynrask og moderne»
hver eneste gang. Har du ikke et tall, har du som regel ikke et poeng ennå.

## Faste regler

- **Bokmål, du-form.** Du skriver til én person som driver en bedrift, ikke til et marked.
- **Ingen emoji. Ingen utropstegn.** Teknisk humor er tillatt i `Terminal`-komponenten, ikke i tilbud, priser eller vilkår.
- **Ingen anglisismer der det finnes et norsk ord.** «nettside», ikke «website». «kundeportal», ikke «dashboard». Unntak: etablerte navn (Vipps, Fiken, Lighthouse, WCAG, Astro).
- **Ingen floskler.** «Vi skaper digitale opplevelser», «skreddersydde løsninger», «ta bedriften din til neste nivå» – alt dette er forbudt.
- **Resultater, ikke teknologi.** «færre telefoner, betalt med Vipps» foran «React og Supabase». Teknologi hører hjemme i case-detaljer og i terminalblokker.
- **Overskrifter i setningsform**, stor forbokstav bare først, uten punktum: «Prototype på 72 timer». Ingresser har punktum.
- **Knapper er verb i imperativ, under fire ord:** «Book 20 minutter», «Sjekk nettsiden din». Aldri «Klikk her». Aldri «Be om tilbud» som eneste valg.
- **Eyebrows** er versaler i `mono-label` med nummer: `// 02 TJENESTER`. Nummeret følger rekkefølgen på siden.
- **Priser** skrives med mellomrom som tusenskiller, «kr» etter, og «eks. mva» synlig i samme visning: `29 900 kr eks. mva`. Aldri gjemt i en fotnote.
- **Maks 70 tegn per linje** i brødtekst, 60 i ingresser.

## Tall og påstander

Alt som ser ut som et faktum skal enten være sant og etterprøvbart, eller merket.
Står det «5 apper publisert», skal det ligge fem apper i App Store. Er tallet ikke klart
ennå, skriv `TODO` i stedet for et anslag. Rapporten som ligger bak siden har et eget
«Caveats»-prinsipp: kilder med egeninteresse (konkurrenters prislister, byråenes
trendartikler) skal merkes som markedssignal, ikke fasit.

## Kald e-post

Verdi først, aldri «trenger dere ny nettside?». Mønsteret som virker:

1. Én setning om hva du faktisk fant på siden deres, konkret og uten skryt.
2. Hva det betyr for dem, i kroner eller kunder – ikke i WCAG-paragrafer.
3. Ett tilbud som er lett å si ja til, og like lett å si nei til.
4. Avmelding, alltid. B2B-e-post til foretaksadresser er normalt tillatt etter
   markedsføringsloven når mottakeren er juridisk person, men avmeldingen skal stå der uansett.

Hold den under 120 ord. Bruk `kodekonsulentene-nettsidesjekk` for selve funnene.

## Sjekk før du leverer

- Finnes det et tall i de tre første setningene?
- Kan en håndverker lese dette uten å slå opp noe?
- Står det noe her jeg ikke kan bevise?
- Ville jeg sagt dette høyt på telefon?
