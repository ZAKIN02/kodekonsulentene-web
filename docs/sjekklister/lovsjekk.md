# Sjekkliste: lovsjekk

Full forklaring med paragrafhenvisninger i
`.claude/skills/kodekonsulentene-lovsjekk/SKILL.md`.

**Dette er ikke juridisk rådgivning.** Rapporten til kunden skal si det samme.

## Foretaksinformasjon

- [ ] Registrert foretaksnavn står på siden
- [ ] Organisasjonsnummer står på siden
- [ ] «MVA» etter org.nr. hvis foretaket er mva-registrert
- [ ] Org.nr. består mod 11-kontroll

## Kontaktinformasjon (ehandelsloven § 8)

- [ ] Geografisk adresse (ikke bare postboks)
- [ ] E-postadresse
- [ ] Telefonnummer eller annen direkte kanal
- [ ] Opplysningene er lett tilgjengelige fra hver side, ikke gjemt

## Cookies (ekomloven § 3-15, fra 1. januar 2025)

- [ ] Ingenting settes før samtykke
- [ ] Ingen forhåndsavkryssede valg
- [ ] «Avvis» like lett tilgjengelig som «godta»
- [ ] Samtykke kan trekkes tilbake like enkelt
- [ ] Cookie-erklæring som faktisk stemmer med det siden setter
- [ ] Vurdert: kan cookies fjernes helt? Da forsvinner hele kravet.

## Personvern

- [ ] Personvernerklæring finnes og er lenket fra footeren
- [ ] Den beskriver faktisk behandling, ikke en generisk mal
- [ ] Behandlingsgrunnlag oppgitt per formål
- [ ] Lagringstid oppgitt
- [ ] Databehandlere listet
- [ ] Rettigheter og klageadgang til Datatilsynet nevnt

## Universell utforming

Maskinelt testbart:

- [ ] `lang` på `<html>`
- [ ] `<title>` på hver side
- [ ] Alt-tekst på alle bilder
- [ ] Ledetekst på alle skjemafelt
- [ ] Nøyaktig én `h1` per side, logisk overskriftsrekkefølge
- [ ] Alle lenker har tekst
- [ ] Zoom ikke blokkert

Må testes manuelt:

- [ ] Kontrast ≥ 4,5:1 for tekst, ≥ 3:1 for kontroller
- [ ] Alt kan nås med tastatur, synlig fokus
- [ ] Logisk fokusrekkefølge
- [ ] Testet med skjermleser
- [ ] Interaktive mål ≥ 24×24 px

Nivå: 35 krav i WCAG 2.0 A og AA for private virksomheter.
Leveranser bygges etter WCAG 2.2 AA.

## Salgsvilkår (for nettbutikk eller abonnement)

- [ ] Betaling, levering, endringer, eierskap
- [ ] Ansvarsbegrensning
- [ ] Oppsigelse og bindingstid i klartekst
