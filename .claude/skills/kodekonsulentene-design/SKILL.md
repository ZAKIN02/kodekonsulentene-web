---
name: kodekonsulentene-design
description: Bruk når du bygger eller endrer UI for KodeKonsulentene – nettside, landingsside, komponent, e-postmal eller grafikk. Henter tokens, komponenter og regler fra designsystemet før noe tegnes eller kodes.
---

# Designsystemet

**Les `docs/brandbok.md` før du rører UI.** Den er fasiten; dette er veien inn i den.
Sidestrukturen står i `docs/sidemonstre.md` og er ikke til forhandling.

## Rekkefølgen av kilder

1. `src/styles/tokens.css` – alle farger, avstander, radier, typestiler. Ingen verdier utenfor denne.
2. `src/styles/components.css` – komponentstilene, kopiert fra designsystemet.
3. `src/components/*.astro` – de elleve komponentene. Props er dokumentert i filhodet.
4. `docs/sidemonstre.md` – hvilken blokk som kommer hvor, og hvilke komponenter den bruker.

## Harde regler

- **Aldri en hardkodet farge, avstand eller radius.** Alt gjennom `var(--token)`. Trenger du en verdi som ikke finnes, mangler det en token – ikke skriv `#1a1a1a`.
- **Dybde kommer fra kanter, ikke skygger.** `hairline` i `line`. `shadow-none` er standard; `shadow-menu` finnes bare til overlegg.
- **Én aksent per visningsområde.** `accent` på primærknappen, et tall eller en markør – velg én. Blir det to, fjern den ene.
- **Radier:** `radius-md` på kort og terminalblokker, `radius-sm` på knapper og felt, `radius-pill` bare på `StatusBadge` og «Anbefalt»-etiketten. Ingen andre.
- **Fokusringen fjernes aldri.** 2px `focus` med 2px offset.
- **Mørkt tema er standard.** Alt skal se riktig ut i begge. `Terminal` er den ene flaten som ikke bytter tema – det er med vilje.
- **Ingen ny komponent** som ikke kan plasseres i en blokk i `docs/sidemonstre.md`.

## Forbudt

Dette er det som får en side til å se AI-generert ut i 2026, og det er nøyaktig det
KodeKonsulentene ikke skal se ut som:

- Bento-rutenett med ulike kortstørrelser. Bento er standarden nå, og derfor generisk.
- Mesh-gradienter, særlig lilla og blå. Glassmorphism. Fargede venstrekanter på kort.
- AI-genererte bilder og illustrasjoner. Stockfoto. Abstrakte 3D-figurer.
- 3D og WebGL. Ytelsesbudsjettet går foran all bevegelse.
- Scroll-jacking, parallax, tekst som skriver seg selv. Unntaket er `Terminal`, der markøren kan blinke fordi terminalen *er* innholdet.
- Inter og Roboto. Fontene er Schibsted Grotesk (display) og JetBrains Mono (tall, kode, system). Brødteksten er systemfont – null nedlasting.

## Bevegelse

Bare mikrointeraksjoner: hover på knapper og kort (kantfarge `line` → `line-strong`,
120 ms), «kopiert»-bekreftelse, tall som teller opp én gang når de kommer i syne.
`prefers-reduced-motion` setter alt til 0 ms – det ligger allerede i `src/styles/site.css`.

## Budsjettet du ikke får bryte

Står i `docs/sidemonstre.md` og på `/status`: Lighthouse ≥ 95 på alle fire kategorier
på mobil, LCP ≤ 2,5 s, CLS < 0,1, INP < 200 ms, maks to webfonter, null tredjepartsskript
før samtykke, WCAG 2.2 AA. Går en endring over budsjettet, er den ikke ferdig – uansett
hvor fin den er.

## Ikoner og bilder

Lucide (MIT), strektegnet, 1,5px strek, 20px standard, `currentColor`. Ikke bland sett.
Ikoner står alltid ved et ord. Statusikonene er faste: `ok` = hake, `warn` = trekant,
`fail` = kryss i sirkel.

Bilder er ekte skjermbilder av ting som er bygget, eller ett portrettfoto under «Om».
Skjermbilder får `hairline` kant og `radius-md`.
