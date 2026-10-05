# KodeKonsulentene – arbeidsregler for dette repoet

Nettsiden til et enkeltpersonforetak i Oslo som bygger nettsider, systemer og apper
for norske småbedrifter. Siden er samtidig det første caset: den skal bevise at den
som bygde den kan mer enn nettsider, at det går fort, og at det er trygt.

## Les dette først

| Spørsmål | Fil |
|---|---|
| Hvordan ser det ut? | `docs/brandbok.md` |
| Hva kommer hvor på siden? | `docs/sidemonstre.md` |
| Hva koster det? | `src/data/priser.ts` |
| Hva heter foretaket, hva er org.nr.? | `src/data/firma.ts` |
| Hvordan deployes det? | `docs/domene-og-drift.md` |

Skal du skrive tekst, bygge UI, lage et tilbud eller lansere: bruk skillene i
`.claude/skills/`. De er skrevet for dette repoet og peker videre til riktige filer.

## Harde regler

**UI**
- Les `docs/brandbok.md` før du rører noe visuelt. Ikke gjett på farger eller avstander.
- Alle verdier gjennom tokens i `src/styles/tokens.css`. Aldri en hardkodet farge, avstand eller radius.
- Rekkefølgen på forsiden er fast og står i `docs/sidemonstre.md`. Eyebrow-nummeret følger rekkefølgen.
- **Legg aldri til en komponent som ikke kan plasseres i en blokk i `docs/sidemonstre.md`.**
- Forbudt: bento-rutenett, mesh-gradienter, glassmorphism, AI-genererte bilder, stockfoto, 3D, WebGL, scroll-jacking.

**Innhold**
- Alle priser fra `src/data/priser.ts`. Skriv aldri av en pris.
- Alle fakta om foretaket fra `src/data/firma.ts`.
- Bokmål, du-form, tall før adjektiver. Ingen emoji, ingen utropstegn, ingen floskler.
- **Dikt aldri opp et tall.** Org.nr., telefon, app-navn og case-resultater står som `TODO` eller `PLASSHOLDER` til de er fylt inn. Et oppdiktet tall velter hele posisjoneringen.

**Kode**
- `npm run verify` før commit: tester, typesjekk og bygg.
- Endrer du analysemotoren i `src/lib/sjekk.ts`, legg til en test i samme omgang.
- Nye sikkerhetsheadere hører hjemme i `sikkerhet.mjs` – ett sted, delt av `server.mjs`, `src/middleware.ts`, `Base.astro` og testene.

## Arkitektur, kort

- **Astro 7**, static av default. Bare `/api/sjekk`, `/api/kontakt` og `/kontakt` har `prerender = false`.
- **`server.mjs`** er HTTP-serveren i drift. Den finnes fordi `@astrojs/node` i standalone-modus serverer prerendret HTML utenom middlewaren – da hadde forsiden kommet ut uten sikkerhetsheadere, og siden selger nettopp den sjekken. `server.mjs` serverer de statiske filene selv, med brotli/gzip, og setter headerne på alt.
- **`src/lib/sjekk.ts`** er rene funksjoner uten nettverk, så de kan testes. Henting ligger i `src/lib/hent.ts`, som har SSRF-vern og tak på størrelse og tid.
- **Fly.io**, Amsterdam. Domenet hos GoDaddy, DNS via `scripts/dns-godaddy.mjs`.

## Æresregelen for nettsidesjekken

Verktøyet skal aldri påstå mer enn det har målt. Det som ikke er sjekket, får status
«Ikke sjekket» og en setning om hvorfor. En falsk «Bestått» er verre enn ingen sjekk.
Dette er dekket av tester i `test/sjekk.test.ts`, og de testene skal ikke mykes opp.

Av samme grunn er `test/lansering.test.ts` **rød så lenge org.nr. er plassholder**.
Siden rapporterer brudd hos andre når org.nr. mangler, og kan ikke lanseres uten sitt eget.

## Kommandoer

```bash
npm run dev        # utviklingsserver
npm run verify     # test + astro check + build
npm run test       # bare testene
npm run build      # bygg
npm start          # kjør det bygde (server.mjs)
npm run deploy     # fly deploy
npm run dns:plan   # se DNS-endringer uten å skrive
```
