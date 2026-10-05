# Integrasjoner å selge

Dette er der marginene ligger. En nettside er en vare mange kan levere; booking koblet
til Vipps og Tripletex er det få «nettsidebyråer» i dette prissjiktet gjør.

| Tjeneste | Hvorfor den selger | Teknisk notat |
|---|---|---|
| **Online booking** | Direkte inntekt og færre telefoner. Frisør, klinikk, trening, befaring. | Cal.com, eller eget system i Supabase |
| **Vipps** | Norske kunder forventer det | Ca. 2,99 % + 1 kr integrert, 2,49 % + 1 kr på betalingslenke |
| **Regnskapsintegrasjon** | Tilbud → ordre → faktura. Sparer timer hver uke. Høy verdi, lite konkurranse. | Tripletex krever Smart-pakke eller høyere, pluss tillegget «Integrasjoner» (API 2.0). PowerOffice har eget API-team. Fiken har REST-API. |
| **Skjema → CRM → oppfølging** | Ingen leads tapt | HubSpot eller Pipedrive + e-post |
| **BankID-innlogging og signering** | Tillit, og juridisk bindende signatur på minutter | Criipto/Idura eller Signicat. Bruk ferdig tjeneste til du har volum – ikke bygg dette selv. |
| **AI-assistent** | SSB melder at 48 % av foretak med minst ti ansatte brukte KI i 2026, mot tre av ti i 2025 | Claude- eller OpenAI-API. **Databehandleravtale før produksjon.** |
| **Cookie-, GDPR- og UU-opprydding** | Konkret lovkrav, lett å forklare, lett å prise | Lovsjekk-pakken. Se `.claude/skills/kodekonsulentene-lovsjekk` |
| **Intern app eller iOS-app** | Få frilansere leverer både nettside og app | Den unike kombinasjonen |

> **Forbehold.** Prosentsatser, pakkekrav og priser hos tredjepart er hentet fra
> leverandørenes egne sider høsten 2026 og endrer seg. Verifiser hos leverandøren før
> du oppgir et tall i et tilbud.

## Hvorfor regnskapsintegrasjon er den beste

1. Kunden har allerede systemet og betaler for det.
2. Smerten er konkret og målbar: «en halv dag i måneden på å avstemme Vipps».
3. Konkurrentene i prissjiktet leverer ikke dette.
4. Det er vanskelig å bytte leverandør etterpå – uten innlåsing, men med reell verdi.

## Rekkefølge for egen side

**MVP:** booking (Cal.com), skjema → e-post og CRM, cookieløs analyse, enkel priskalkulator.
**Fase 2:** nettsidesjekken – den viktigste differensiatoren.
**Fase 3:** statusside, kundeportal, Stripe eller Vipps, BankID.

AI-chatbot og BankID kan vente. Send heller faktura fra regnskapsprogrammet i starten.

## Når du selger AI

Fem regler, de samme som står på `/apper-og-ai`:

1. Alltid merket som AI
2. Aldri pris eller avtale uten et menneske
3. Ingen personopplysninger i loggen
4. Databehandleravtale før produksjon
5. Feiler den, sier den det – og sender brukeren videre til et menneske
