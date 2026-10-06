# Visuelle ressurser: ikoner, mønstre, diagrammer og ikonsettet

Målt 6. oktober 2026. Alle tall er målt i dette repoet, ikke hentet fra README eller bundlephobia.

## 1. Ikoner: kopier inn, ikke installer

Brandboken har allerede valgt settet: «Bruk Lucide (MIT) som sett; ikke bland med andre sett.»
Lucide er i praksis **ISC**-lisensiert (`lucide-icons/lucide`), som tillater kommersiell bruk.
Spørsmålet var hvordan vi tar det i bruk.

| Vei | node_modules | HTML-utdata | Lisens |
|---|---|---|---|
| **Kopiert inn (valgt)** | **0 B** | identisk | ISC, kopiert med kreditering |
| `astro-icon` + `@iconify-json/lucide` | 643 261 B | identisk | MIT + ISC |
| `unplugin-icons` + `@iconify-json/lucide` | 686 694 B | identisk | MIT + ISC |

Alle tre inliner SVG ved bygg. **Kjøretidskostnaden er nøyaktig den samme.** Forskjellen er
bare hva som ligger i `node_modules` og hvor mye byggoppsett som må vedlikeholdes.

Målt i bygget HTML på `/lab/ikoner`:

- 16 ikoner, **332 B per ikon rått**, **843 B gzip for alle 16**
- Banedata alene, uten SVG-skallet: 1 737 tegn

Et bibliotek på 643 kB som produserer de samme 843 bytene er ikke verdt vedlikeholdet.
`src/components/Ikon.astro` har banene kopiert ordrett med kildehenvisning og dato.

### En regel som ikke ble fulgt

Brandboken sier **1,5 px strek**. Målt i dagens komponenter:

```
8 ikoner  stroke-width="2"
2 ikoner  stroke-width="2.5"
2 ikoner  stroke-width="1.5"
```

Lucide leverer 2 px som standard, og de håndkopierte ikonene arvet det. Resultatet er
at ikonene er tyngre enn hårlinjene rundt dem, som er hele poenget med «teknisk og presis».
`Ikon.astro` setter 1,5. `/lab/ikoner` viser de tre tykkelsene ved siden av hverandre.

**Gjenstår:** `StatusBadge.astro`, `PriceCard.astro` og `Topbar.astro` har fortsatt egne
inline-SVG-er med feil strektykkelse. De ligger utenfor dette mandatet.

## 2. Mønstre: ren CSS, null forespørsler

Fire mønstre bygget og vist på `/lab/ikoner`. Alle er `background-image` med gradienter —
ingen filer, ingen forespørsler, ingen kilobyte utover CSS-regelen selv.

| Mønster | Hva det er | Hvor det hører hjemme |
|---|---|---|
| Hårlinjerutenett | To lineære gradienter, 32 px rute | Bak seksjoner som trenger teknisk tyngde, f.eks. `/systemer` |
| Prikkrutenett | Radial gradient, 20 px | Rolige flater, f.eks. bak prisene |
| Diagonale hårlinjer | `repeating-linear-gradient` 45° | Små flater, kort, «ikke inkludert»-tilstander |
| Målestokk | To gjentatte gradienter i bunnlinjen | Under nøkkeltall — forsterker monospace-tallene |

Dette er den billigste måten å gi seksjoner karakter uten å bryte regelen om at
bilder skal være ekte skjermbilder.

## 3. Diagrammer: skriv dem for hånd

| Alternativ | Upakket | Lisens | Dom |
|---|---|---|---|
| `mermaid` | **122 268 705 B** | MIT | Nei. En halv megabyte gzip i nettleseren for tre noder |
| `d3` | 871 285 B | ISC | Nei. Vi tegner ikke datadrevet grafikk |
| `elkjs` | 8 046 232 B | **EPL-2.0 ELLER GPL-3.0** | Nei. Lisensen alene diskvalifiserer |
| **Håndskrevet SVG** | **0 B** | — | **Ja** |

Flyten `booking → Vipps → regnskap` er tre rektangler, to piler og en markør. Det er
30 linjer SVG med `currentColor` og tokens, og den følger temaet automatisk.
Eksempel ligger på `/lab/ikoner`.

Et layoutbibliotek er først forsvarlig den dagen diagrammene genereres fra data vi
ikke kjenner på forhånd. Det gjør vi ikke.

## 4. Ikonsettet for nettlesere og hjemskjerm

Dette var en reell mangel, ikke pynt.

**Før:** `favicon.svg`, og en `apple-touch-icon` som pekte på en **1024×1024** PNG.
Ingen manifest, ingen temafarge, ingen maskerbart ikon, ingen PNG-fallback.

**Nå generert fra `kk-mark.svg` med sharp** (`.skudd/lag-ikoner.mjs`, kjøres ved behov):

| Fil | Størrelse | Rolle |
|---|---|---|
| `public/favicon-32.png` | 0,6 kB | Fallback der SVG-favicon ikke støttes |
| `public/logo/apple-touch-icon.png` | 3,1 kB | 180×180, erstatter 1024-pikslersfeilen |
| `public/logo/icon-192.png` | 3,4 kB | Android, `purpose: any` |
| `public/logo/icon-512.png` | 20,5 kB | Android, `purpose: any` |
| `public/logo/icon-maskable-512.png` | 7,0 kB | `purpose: maskable` |
| `public/manifest.webmanifest` | — | Navn, farger, snarveier til `/sjekk` og `/priser` |

Det maskerbare ikonet er testet ved å klippe det til sirkel: KK-monogrammet ligger på
62 % av flaten og holder seg godt innenfor den trygge sonen på 80 %. Uten den
innrammingen ville Android kuttet K-ene.

Serveren kjenner allerede `.webmanifest` og svarer `application/manifest+json`.
CSP-en har `manifest-src 'self'` fra før. Alle filene ble verifisert med ekte
forespørsler mot serveren — 200 og riktig MIME-type på alle seks.

### Gjenstår, utenfor dette mandatet

`src/layouts/Base.astro` må få to linjer for at manifestet og ikonene skal tas i bruk:

```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#0b0d10" />
```

og `apple-touch-icon` bør peke på `/logo/apple-touch-icon.png` i stedet for
1024-pikslersfila. Uten disse ligger filene der ubrukt.

## Oppsummert

Ingen nye avhengigheter anbefales. Tre av fire områder løses best med null kilobyte:
ikonene kopieres inn, mønstrene er CSS-gradienter, diagrammene skrives for hånd.
Det fjerde — ikonsettet for hjemskjerm — krevde filer, og de er generert fra merket
vi allerede har.
