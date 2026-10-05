---
name: kodekonsulentene-tilbud
description: Bruk når du skriver tilbud, pristilbud, avtaleutkast eller sluttrapport fra KodeKonsulentene til en kunde. Gir fast struktur, prisliste, vilkår og tone, slik at hvert tilbud blir likt og tar ti minutter i stedet for to timer.
---

# Tilbud fra KodeKonsulentene

## Hent tallene fra koden, ikke fra hukommelsen

- **Priser:** `src/data/priser.ts` (`pakker`, `loepende`, `prisvilkaar`). Skriv aldri av en pris – les den.
- **Fakta om foretaket:** `src/data/firma.ts`. Org.nr., adresse, timepris, svartid.
- **Vilkår:** `src/pages/vilkar.astro` er den gjeldende teksten. Tilbudet viser til den, og gjentar bare de punktene kunden må se nå.
- **Full mal:** `docs/tilbud-mal.md`. **Avtalemal:** `docs/avtale-b2b.md`.

Endres en pris, endres den ett sted: `src/data/priser.ts`. Alt annet følger etter.

## Struktur – åtte deler, i denne rekkefølgen

1. **Hva du har fortalt meg.** Kundens situasjon med kundens egne ord, 3–5 setninger. Dette viser at du har hørt etter, og det er der kunden avgjør om resten er relevant.
2. **Hva jeg foreslår.** Løsningen i klartekst, uten teknologinavn. «Timer bestilles og betales døgnet rundt» – ikke «Astro med Supabase».
3. **Hva som er inkludert.** Punktliste. Konkret nok til at dere er enige om hva som er levert.
4. **Hva som ikke er inkludert.** Like viktig. Foto, tekstforfatter, annonsebudsjett, oversettelse, innhold kunden ikke har. Her unngås halvparten av alle konflikter.
5. **Pris.** Fast pris, eks. mva, med 40/60-fordelingen. Løpende drift som egen linje.
6. **Tid.** Oppstart, prototype på 72 timer, lansering. Datoer, ikke «ca. tre uker».
7. **Vilkår i kortform.** To revisjonsrunder, eierskap til kode og domene, bindingstid hvis abonnement, og lenke til de fullstendige vilkårene.
8. **Neste steg.** Én handling: «Svar på denne e-posten med «ja», så sender jeg avtalen og oppstartsfakturaen.»

## Tone

Følg `kodekonsulentene-tekst`. I tillegg, for tilbud spesielt:

- Ingen teknisk humor. Terminalspråk hører hjemme på nettsiden, ikke i et dokument kunden skal signere.
- Ingen forbehold som egentlig betyr «jeg vet ikke». Vet du ikke, spør før du sender.
- Ingen prisrabatt uten en grunn som står skrevet. «Pilotpris mot å få bruke tallene som case» er en grunn. «Introduksjonspris» er ikke.
- Skriv prisen én gang, tydelig. Ikke tre varianter som kunden skal velge mellom med mindre de har bedt om det.

## Faste formuleringer

- «Alle priser er eks. mva.»
- «40 % faktureres ved oppstart, resten ved lansering.»
- «To revisjonsrunder er inkludert. En runde er samlede tilbakemeldinger, ikke enkeltmeldinger over fjorten dager.»
- «Du eier koden, innholdet og domenet – også hvis du sier opp.»
- «Er du ikke fornøyd med prototypen, betaler du ingenting.»
- «Tilbudet er bindende i 30 dager.»

## Før du sender

- Står det et tall kunden ikke har sett før? Da har omfanget endret seg – ring først.
- Er «ikke inkludert»-listen tom? Da er den ikke ferdig skrevet.
- Er det noe her du ikke kan levere alene innen fristen?
- Har kunden fått prisen muntlig allerede? Den skriftlige skal være den samme.

## Format

Skal tilbudet ut som fil, bruk `docx`-skillen med malen i `docs/tilbud-mal.md`.
Skal det i en e-post, hold det under én skjermhøyde og legg detaljene i vedlegget.
