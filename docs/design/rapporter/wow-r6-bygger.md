# wow-r6 bygger: segmentene etter filmen

Gren `redesign/wow`, dev 4700, ikke bygget, ikke committet. Skills lastet: impeccable (critique, bolder, layout, craft-floor), taste-skill, emil-design-eng, kodekonsulentene-tekst. Impeccable-kritikken er kjørt i én kontekst (ingen subagent-verktøy): `DEGRADED: single-context`. Bilder: før `.skudd/wow/r6/for/`, etter `.skudd/wow/r6/etter/`, overgangen `.skudd/wow/r6/stripe/`.

## Kritikk før → etter (mobil først)

| Segment | Før (impeccable) | Etter |
|---|---|---|
| Overgang film → rapport | P1: panelet dekket «Start befaringen» (mobil 350×114 px, helt; desktop 295×37 px). Tittel og felt rullet under det festede panelet. | Radene står øverst i `#rapport`, spørsmålet og feltet etter dem. Målt overlapp 0 (1440, 1280, 390). Panelet glir rett inn i radene mens verkstedet ennå synes. |
| Arbeid | P1: gammel skjermdump med kuttet setning øverst; resten er en tekstliste (r4 #12). | Stort vindu der siden ruller inni (`data-parallax="-0.2"` på laget rundt bildet, `data-reveal="clip"`), beskåret så den kuttede setningen aldri vises. «Se flere»-rad med tre ekte skjermbilder (booking, driftsstatus, sjekken på telefon), dra-rad på mobil, tre spalter på desktop. |
| Garanti | P2: det lange løftet i plakatstørrelse, det korte i liten tekst. | Ordrett samme to setninger; «Sier du nei til prototypen, koster det ingenting.» i plakatstørrelse (ny token `--wow-tekst-garanti`), første setning som inngang. |
| Priser | P1: på mobil sto «Dette er med» under alle tre pakkene; «KR»/«FRA» i grå versaler (r4 #18); Å traff linja over (r4 #14). | Valgt pakke folder ut lista rett under seg (mobil) og ved siden av (desktop), samme markup, bare CSS. «fra»/«kr» i vanlig skrift og samme farge. `.wow-stor` linjeavstand 0,95. Løpende priser som prisliste: navn, tekst, tall til høyre. |
| Slik går det | P2: datoene brøt over to linjer på desktop. | Ukedagen står liten over «21. november»; alle fire datoene på én linje. Linja tegnes med rullingen (`data-draw`, uendret). |
| Spørsmål | Rolig og lesbar; ingen funn. | Uendret. |
| Kontakt | P1: Tab-hopp 553–584 px opp (e-post/booking nederst til venstre → skjema øverst til høyre). | Overskrift og ingress til venstre (festet på desktop), booking og skjema i høyre spalte ovenfra og ned, e-post og svartid på egen rad under. Største hopp oppover fra rapportfeltet til siste footerlenke: 0 px (desktop og mobil). Gjenbrukbar med props `id`, `tittel`, `ingress`, `book`, `skjema`. |
| Bunn | Ingen funn. | Uendret innhold; dokumentert som gjenbrukbar (MalWow setter den inn på alle sider). |

## Målt

- Lengde etter filmen: mobil 9 095 → 8 954 px (−141), desktop 7 016 → 7 407 px (+391; «se flere»-raden med bilder er +≈450).
- Overgangen: største flytt for én rad per 10 px rulling 75 px desktop, 52 px mobil (ingen sprang; jevn glidning over 0,4 skjermhøyder).
- axe (WCAG 2.2 AA, redusert bevegelse, alle segmentene): 0 brudd ved 1440 og 390. Ufullstendige er overlegg fra lenke-`::after` og strekgradienten på `.wow-lenke` (tekst på bunn, tokens ≥ 7:1).
- Uten JS: 0 skjulte tekstelementer i segmentene. impeccable detect: 0 funn. Ingen hex/rgb/ms i mine filer, ingen «MANGLER».
- `npm run test` 342/342. `npm run check` 0 feil. Playwright `tests/wow/*` mot 4700: 77 bestått, 5 hoppet over.

## Rettet etter selvkontrollen

Mobilvinduet 4:3 kuttet kalkulatorkortet i kanten → 3:2. Telefonen i sjekk-kortet viste «6/6» (står i rapporten) → bredere og lenger ned, nå bare ytelsesraden. Booking lå i venstre spalte og ga nytt Tab-hopp (−584) → flyttet til høyre spalte. Desktop ble 887 px lengre → strammet garanti, prisliste, kontakt (navn og e-post side om side) og vindu 12:5. «7 900 KR» i fastprisen → «kr» i vanlig skrift.

## AI-preg (del 12)

Merkelappene over casetitlene («Verktøy», «Drift», «Ikke et levert oppdrag») gir ny informasjon og står. Tre kort i «se flere»: ulike flater (mørk nettleser, lys nettleser, telefon), begrunnet som rad. Monospace finnes bare inni ekte skjermbilder (åpent punkt 2). Ingen inntoning på kort eller avsnitt, ingen nummerering, ingen «→».

## Åpne punkter

1. **Garantien, trenger avgjørelse.** `/vilkar` punkt 3: oppstartsfakturaen krediteres hvis kunden sier nei. «Koster det ingenting» holder. «Før du har betalt noe» holder bare hvis fakturaen forfaller etter at prototypen er vist. Forsiden sier også 72 t «etter samtalen», vilkårene «etter oppstartsmøtet».
2. Skjermbildene i `public/media/wow/ekte/` er i v1-drakt (mono, «// BEDRIFT-PAKKEN»), og kalkulatorbildet viser 29 900 kr og 590–1 490 kr/mnd, som også står i prislista. Nye bilder må tas av den som eier `public/`.
3. `docs/design/bevegelse.md` (bevegelse sin) sier at panelet venter mens spørsmålet og feltet ruller forbi. Nå står radene først; koden i `overgang.ts` er uendret og virker, men teksten bør oppdateres.
4. Midt i overgangen står haken et øyeblikk over etiketten («Uni✓ersell», `stripe/desktop-04.png`). Det ligger i `overgang.ts`, ikke i mine filer.
5. Toppluften i `#rapport` er `clamp(seksjon-tett, 12vh, rom-10)`, fordi overgangen trenger at radene når panelet minst 0,4 skjermhøyder etter at filmen slipper. Kortes den, kan delene hoppe på plass.

## Filer

Endret: `src/components/wow/seksjoner/{Arbeid,Garanti,Priser,Prosess,Kontakt,Bunn,Befaring}.astro`, `src/styles/wow.css`, `src/styles/tokens-wow.css`. Uendret: `Sporsmal.astro`, `index.astro`. Måleskript: `.skudd/wow/r6/{skudd,overlapp,stripe,tab,axe,utenjs}.mjs`.
