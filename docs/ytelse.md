# Ytelse – målt 6. oktober 2026

Målt med Lighthouse 12.8.2, median av to kjøringer per side, simulert struping.
Mobil er Pixel 7: 390×844 CSS-piksler med `deviceScaleFactor` 2,625 – tallet er
fysiske piksler delt på CSS-piksler, ikke en bredde på 1080.

Produksjon er målt kl. 10:36–10:48. Sju agenter skrev i repoet samtidig, så
lokale tall er et øyeblikksbilde av et tre med ucommittet arbeid fra alle sju.
Produksjonstallene er de pålitelige.

Kjøres med:

    node .skudd/ytelse.mjs https://kodekonsulentene.no / /priser/
    FORM=desktop node .skudd/ytelse.mjs https://kodekonsulentene.no /

Lighthouse ligger ikke i `package.json`. Den hentes fra en egen mappe, overstyrbar
med `LH=<sti til node_modules>`, nettopp fordi flere agenter skriver i package.json.

## Alle sider, produksjon

Y/UU/P/S = ytelse / tilgjengelighet / beste praksis / SEO.

| Side | Mobil Y/UU/P/S | Mobil CLS | Skrivebord Y/UU/P/S | Skrivebord CLS | kB mobil |
|---|---|---|---|---|---|
| / | 100/100/100/100 | 0.002 | 100/97/100/100 | 0.002 | 594 |
| /nettsider/ | 92/97/100/100 | 0.174 | 100/97/100/100 | 0.018 | 105 |
| /systemer/ | 100/97/100/100 | 0.005 | 100/100/100/100 | 0.022 | 588 |
| /sikkerhet/ | 100/100/100/100 | 0.001 | 100/100/100/100 | 0.01 | 106 |
| /priser/ | 100/98/100/100 | 0.001 | 100/98/100/100 | 0.008 | 105 |
| /caser/ | 100/100/100/100 | 0.01 | 100/100/100/100 | 0.007 | 103 |
| /om/ | 100/100/100/100 | 0.013 | 100/100/100/100 | 0.01 | 104 |
| /sjekk/ | 100/100/100/100 | 0 | 100/100/100/100 | 0 | 104 |
| /verktoy/ | 100/98/100/100 | 0.002 | 100/98/100/100 | 0.015 | 1552 |
| /historie/ | 95/100/100/100 | 0.139 | 88/96/100/100 | 0.235 | 767 |
| /status/ | 100/100/100/100 | 0 | 100/100/100/100 | 0 | 104 |
| /kontakt/ | 100/97/100/100 | 0.001 | 100/97/100/100 | 0.007 | 107 |
| /apper-og-ai/ | 100/97/100/100 | 0.004 | 100/100/100/100 | 0.014 | 104 |
| /handbok/ | 100/100/100/100 | 0.002 | 100/100/100/100 | 0.011 | 105 |
| /personvern/ | 100/100/100/100 | 0 | 100/100/100/100 | 0 | 102 |
| /vilkar/ | 100/100/100/100 | 0 | 100/100/100/100 | 0 | 103 |
| /terminal/ | 100/100/100/100 | 0.025 | 100/100/100/100 | 0 | 102 |
| /bransjer/handverkere/ | 100/97/100/100 | 0.004 | 100/100/100/100 | 0.018 | 105 |
| /bransjer/klinikker/ | 100/97/100/100 | 0.004 | 100/100/100/100 | 0.018 | 105 |
| /verktoy/cookie-sjekk/ | 100/97/100/100 | 0.002 | 82/100/100/100 | 0.374 | 106 |
| /verktoy/dmarc/ | 100/97/100/100 | 0.001 | 100/100/100/100 | 0.008 | 105 |
| /verktoy/priskalkulator/ | 100/100/100/100 | 0.001 | 100/100/100/100 | 0.006 | 108 |
| /verktoy/uu-sjekk/ | 100/97/100/100 | 0.001 | 100/97/100/100 | 0.006 | 106 |

Alle 23 sider ligger på 100 i beste praksis og SEO. TBT er 0 ms overalt –
det er ingen JavaScript-kostnad å snakke om noe sted.

## Tre sider bryter løftet om 95

| Side | Hvor | Score | CLS | Årsak |
|---|---|---|---|---|
| `/verktoy/cookie-sjekk/` | skrivebord | **82** | 0,374 | nettfont laster og flytter `<h1 class="mega">` |
| `/nettsider/` | mobil | **92** | 0,174 | nettfont laster og flytter `section.scene` |
| `/historie/` | skrivebord | **88** | 0,235 | scroll-historien bygger om DOM-en etter maling |

Terskelen i `lighthouserc.json` er CLS ≤ 0,1. Alle tre ligger over.

### 1. Fontene er den største enkeltfeilen

`src/styles/fonter.css:11` har `font-display: swap`, og **ingen av fontene
forhåndslastes** – det finnes ingen `rel="preload"` i `src/layouts/Base.astro`.
Reservefonten males først, den ekte fonten kommer etterpå, og alt flytter seg.

Isolert ved å blokkere fontfilene og måle skiftet på nytt:

| Side | Fonter tillatt | Fonter blokkert |
|---|---|---|
| `/nettsider/` | CLS 0,1742 | **CLS 0,0000** |
| `/historie/` | CLS 0,1392 | CLS 0,1392 |

Fontene forklarer `/nettsider` fullstendig og `/historie` overhodet ikke.

Det treffer hardest der `Mega`-overskriften er størst, altså på skrivebord:
`/verktoy/cookie-sjekk/` får CLS 0,374 på skrivebord mot 0,002 på mobil. Jo større
typografi, desto flere piksler flytter seg når fontmetrikken endrer seg.

Mulige grep, i rekkefølge etter hvor godt de fjerner skiftet:
`font-display: optional` fjerner det helt, men dropper fonten på trege
førstebesøk. `rel="preload"` på de to latinske woff2-filene pluss en
`@font-face`-reserve med `size-adjust`/`ascent-override` beholder fonten og
fjerner nesten alt skiftet. Det siste er mest arbeid og best resultat.

### 2. `/historie`: scroll-historien bygger om siden etter at den er malt

Skiftet kommer presis 486 ms etter navigasjonsstart, og geometrien viser hva
som skjer:

    OL.hist__scener   626×218  ->  433×411     (vokser og flyttes opp)
    DIV.hist__kort    674×132  ->  0×0         (kollapser)

Listen nesten dobler høyden mens et kort forsvinner. Det er JavaScript som
endrer oppsettet etter første maling. Riktig grep er å reservere sluttilstandens
høyde i markupen, slik at skriptet ikke endrer geometri.

**Lighthouse pekte på feil årsak tre ganger her.** Den oppga etter tur logoen i
toppfeltet, «Media element lacking an explicit size», og ikonene i temabryteren.
Jeg målte alle tre: logoen er 170 px oppgitt mot 169,9 px malt, header-høyden står
stabilt på 65 px gjennom hele lastingen, og å blokkere fontene endret ingenting.
Attribusjonen i rapporten er et hint, ikke en årsak.

Målingen er dessuten ustabil: ytelse på `/historie` svinger ±12 poeng mellom
kjøringer på skrivebord, fordi skiftet avhenger av om skriptet rekker å kjøre før
eller etter maling.

### 3. `/verktoy` laster 1,4 MB video på mobil

| Fil | Størrelse |
|---|---|
| `/historie/verktoy-1280.mp4` | **1401 kB** |
| `/historie/verktoy-1920.mp4` | 2847 kB |
| `/historie/hero-1280.mp4` | 1473 kB |
| `/scener/systemer-1280.mp4` | 469 kB |

`/verktoy/` veier 1552 kB på mobil. Nest tyngste side er `/historie/` på 767 kB,
og medianen er 105 kB. Alle videoelementene har riktig `preload="none"`, så det er
skriptet som starter nedlastingen – ikke nettleseren.

`verktoy-1280.mp4` er tre ganger så stor som `systemer-1280.mp4` i samme
oppløsning. Enten er klippet mye lengre, eller så er bitraten satt mye høyere.

I tillegg: `verktoy-poster.avif` er 44 kB der 1,4 kB ville holdt for den størrelsen
den vises i – 43 kB kastet bort på et bilde som bare vises til videoen starter.

## Tilgjengelighet: tre mønstre

**`color-contrast` på åtte sider** gir 97 i stedet for 100: `/nettsider`,
`/systemer`, `/apper-og-ai`, begge `/bransjer/*`, og tre verktøysider. axe måler
ordene i `Mega`-overskriften midt i inntoningen, der de ligger på delvis
gjennomsiktighet – målt 2,36:1 og 2,18:1.

**Dette er ikke en lesbarhetsfeil.** Jeg verifiserte sluttilstanden: med
`prefers-reduced-motion: reduce` står alle 27 ord på `opacity: 1` uten animasjon,
og i Firefox – som mangler `animation-timeline` – er ingen ord usynlige, fordi
animasjonen da fullføres umiddelbart til synlig slutttilstand. Degraderingen
fungerer. Men scoren blir stående på 97, og den vil variere mellom kjøringer
avhengig av hvor i animasjonen axe måler.

**`heading-order` på `/priser` og `/verktoy`** gir 98. Begge går `h1` → `h3` og
hopper over `h2`; kortkomponentene har `<h3>` hardkodet.

**`link-name` på `/kontakt`** gir 97, og dette er en ekte feil i produksjon:

    <a class="kk-link" href="tel:">

`firma.telefon` er tom streng. `LegalFooter.astro:31` har vakten
`{phone && ...}`. `ContactBlock.astro:35` har den ikke, og sender derfor en tom
lenke uten tilgjengelig navn.

To grunner til at ingen test fanget det: `/kontakt` har `prerender = false` og
havner aldri i `dist/client`, som testene over bygget HTML går gjennom. Samme
blindsone ga CSP-feilen på `/kontakt` tidligere.

## Buffer

`/_astro/`-filene har innholdshash og bufres et år. Alt annet lå på én time.
Lighthouse målte 604 kB med for kort buffer på forsiden alene.

Fontene er flyttet til et år med `immutable` i `server.mjs`. Filnavnet koder
familie, vektintervall og subsett, så endret innhold betyr ny skrift og dermed
nytt navn uansett.

Video og bilder står med vilje igjen på én time. De regenereres nå, og en lang
buffer ville låst gamle klipp hos alle som har vært innom. Riktig løsning der er
innholdshash i filnavnet – ikke lengre buffer på et navn som kan peke på nytt
innhold i morgen.

Revalidering er verifisert: alle filer svarer 304 på `If-None-Match`.

## Porten i CI

`lighthouserc.json` dekket fem sider. Den dekker nå elleve, valgt etter hvor
risikoen ligger: alt med film, stor typografi og scroll-avdekking, pluss
`/kontakt`, som ingen test over bygget HTML kan se.

**Porten vil være rød med en gang.** `/nettsider` og `/historie` ligger over
CLS-terskelen på 0,1. Det er meningen – løftet er brutt i produksjon nå.

`lighthouserc.desktop.json` er lagt til med samme terskler. Uten den ville
`/verktoy/cookie-sjekk/` på 82 og `/historie` på 88 aldri blitt oppdaget; begge
måler 100 og 95 på mobil.
