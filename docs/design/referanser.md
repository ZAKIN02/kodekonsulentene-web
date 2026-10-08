# Referansestudie

Kjørt 2026-10-08 med kommandoene i briefen del 15. Alt under beskriver bare det som står i bildene. Prinsipper, ikke oppskrifter: ingen farger, fonter, tekster eller oppsett skal kopieres.

## Avvik og begrensninger (les først)

- **heydays.no: skriptet feilet.** `skjermbilder.mjs` ga `page.goto: Timeout 45000ms exceeded` (venter på `networkidle`) for mobil og desktop (`.design/arbeid/kartlegger-ref/skjerm.log`, linje 4 og 58). Ingen bilder i `.design/referanser/`. Jeg tok to desktopbilder med et engangsskript som venter på `load` i stedet, lagret i `.design/arbeid/kartlegger-ref/heydays-00.png` og `heydays-01.png`. Mobil er ikke sett.
- **posthog.com:** bare 1 utsnitt per visning (siden er et «skrivebord» som ikke gir dokumenthøyde). Bare toppen er sett. Konsollen logget React-feil #418/#423/#425 under lasting (skjerm.log).
- **rauno.me mobil:** 1 utsnitt. Desktop 4 utsnitt.
- **linear.app og oxide.computer** er mørke selv med `TEMAER=light`. Lyst tema er ikke sett.
- **Cookiebannere** dekker nederste hjørne på oxide, posthog og epic i bildene.
- **Videoene (`opptak.webm`) er ikke avspilt.** Jeg har bare sett bildene fra filmstripene. Alt om bevegelse er utledet av forskjeller mellom bilder, ikke av tidtaking. Varighet er derfor oppgitt som grenser, eller «ikke målt». Mellom to bilder går omtrent 6 × 60 ms rulling pluss 700 ms ventetid pluss skjermbildetid (`scripts/filmstripe.mjs`), altså litt over 1 s.
- `scrollY=0` på alle bilder for lusion (desktop og mobil): siden har egen rullemotor. Bildene viser at innholdet likevel flytter seg. For epic er `scrollY` 0 til 5279 (desktop) og 0 til 4584 (mobil), så epic bruker vanlig rulling og står i bunn fra bilde 08 (begge visninger).
- Jeg har ikke sett alle bildene. Sett: lusion desktop 00–04, 06, 08, 11, 13, 15; lusion mobil 00, 03, 07, 11; epic desktop 00–08, 15; epic mobil 00, 03, 05, 07, 11; de fleste utsnitt 00 og 02–03 av stillbildene. Resten er ikke åpnet.
- Mapper: `.design/referanser/` for stillbilder, `.design/film/` for filmstriper.

---

## lusion.co (filmstripe)

Bilder: `.design/film/lusion/bilde-00..15.png`, `.design/film/lusion-mobil/bilde-00..11.png`.

**Observasjoner**
1. Etter 4 sekunders ventetid viser bilde 00 fortsatt en innlastingsskjerm: svart flate, et hvitt «L» av to rektangler og telleren «100» nede til venstre (`lusion/bilde-00.png`, `lusion-mobil/bilde-00.png`). Innholdet er skjult bak en teller.
2. Forsiden er en lang sekvens av store avrundede flater som skifter innhold og bakgrunn mens du ruller: en scene med 3D-kors og «SCROLL TO EXPLORE» (`bilde-01`), overskrift «Bold Ideas, Brought to Life» med et kort over en blå sirkelring (`bilde-02`), «PLAY ▶ REEL» på en avrundet videoflate (`bilde-03`, `bilde-04`), prosjektkort i to kolonner (`bilde-06`, `bilde-08`), en ny overskrift med turkis strek (`bilde-11`) og til slutt en svart flate med astronaut (`bilde-13`, `bilde-15`).
3. Prosjektkortene har små versaltagger over (f.eks. «WEB • DESIGN • DEVELOPMENT • 3D») og tittel under (`bilde-06`, `bilde-08`). De nederste kortene i `bilde-06` står litt skjevt, de øverste rett, så kortene retter seg opp. På mobil står en pil foran tittelen (`lusion-mobil/bilde-07.png`).

Andre synlige detaljer: små + og × langs underkanten av scenen (`bilde-01`, `bilde-04`), egen rullefelt-tommel til høyre (`bilde-02..15`), fast meny med «LET'S TALK» og «MENU» i toppen.

**Prinsipp å låne:** En enkelt stor, avrundet flate som er scenen. Den åpner seg i takt med rullingen og bærer én tydelig handling («Play reel»). Teksten rundt er stor og har få ord.

**Ikke kopier:** Sanntids-3D (kryssene i `bilde-01`, astronauten i `bilde-13`), en innlastingsteller som skjuler innholdet i minst 4 s, og egen rullemotor (scrollY=0 gjennom hele opptaket).

**Bevegelse**

| Hva beveger seg | Utløser | Varighet |
|---|---|---|
| Innlastingsskjerm: «L» av to rektangler og teller «100» (`bilde-00`) | Innlasting | Minst 4 s etter `load` (bilde 00 er tatt da). Slutt ikke målt. |
| Første scene: haug av 3D-kors i en avrundet flate nær full bredde, «SCROLL TO EXPLORE» under (`bilde-01`) | Innlasting, så rulling | Ikke målt. Står i bilde 01, ca. 1 s etter bilde 00. |
| Overskriften «Bold Ideas, Brought to Life»: to linjer som overlapper i `bilde-01`, ferdig oppsatt i `bilde-02` | Rulling | Mellom to bilder, ca. 1 s. Ikke tidtatt. |
| Videoflaten med «PLAY REEL»: ulikt innhold i `bilde-03` (VR-person) og `bilde-04` (leketogbane), og flaten har ulik størrelse | Rulling (rekkefølgen skyldes rulling). Om innholdet også bytter av seg selv, er ikke avgjort. | Ikke målt |
| Lys bakgrunn blir til svart astronautscene (`bilde-11` → `bilde-13`) | Rulling | Ikke målt |
| Prosjektkort retter seg opp (`bilde-06`) | Rulling | Ikke målt |
| Astronauten: ulik armstilling i `bilde-13` og `bilde-15` | Av seg selv eller rulling; bildene skiller ikke | Ikke målt |

Peker: musen står i midten av vinduet hele opptaket (skriptet flytter den ikke). Pekerutløste effekter er derfor **ikke observert**. Videoen er ikke sett, så kontinuerlige sløyfer er ikke bekreftet.

Mobil: samme rekkefølge (teller i `lusion-mobil/bilde-00`, «PLAY REEL»-flate med rød ramme og «Featured Work» i `bilde-03`, prosjekter i `bilde-07`, overskrift og astronaut i nettbrettramme i `bilde-11`). Bevegelsene er sett i stillbilder, ikke i video.

---

## epic.net (filmstripe)

Bilder: `.design/film/epic/bilde-00..15.png`, `.design/film/epic-mobil/bilde-00..11.png`. Siden lastet, og opptaket er ikke svart (filene er 3,7 MB og 1,6 MB).

**Observasjoner**
1. Første skjerm er ett utvalgt prosjekt: stor rød bil på lys grå bakgrunn, tittelen «AVD revival» i stor serif, to knapper «VISIT PROJECT» og «SEE ALL PROJECTS» (`epic/bilde-00.png`). Et journalinnlegg ligger som liten liste ved siden av. I `bilde-01` står en annen linje øverst, «Cuteness takes over our screens», så innholdet i utvalgt-feltet skifter.
2. «SHOWREEL» har en svart videoflate med sirkulær «PLAY VIDEO»-knapp og egne kontroller (`bilde-01`, `bilde-02`). Flaten viser teksten «We couldn't verify the security of your connection», så videoen spilte ikke. Showreelen er ikke sett.
3. «About»-avsnittet er en setning der «imagine», «build» og «tell» står i fet skrift og resten i lett skrift (`bilde-03`). De lette ordene spres og roterer (`bilde-04`), forsvinner så de tre fete står igjen (`bilde-05`), blir til «imagine, build, tell» med ballonger under (`bilde-06`), og en tegnet skisse av et slott på ballonger med en rund knapp «CUSTOMIZE THE CASTLE» (`bilde-07`, `bilde-08`).

Andre synlige detaljer: cookiebanner med «DENY ALL» ved siden av «ACCEPT ALL» (`bilde-00`). Sporing er ikke undersøkt her. Briefen nevner Google Tag Manager, og jeg har ikke sett det i bildene.

**Prinsipp å låne:** Ett leketøy midt i en ellers rolig side, som forklarer seg selv med én rund knapp med tekst («customize the castle»), og som er koblet til en setning i teksten (ordene «imagine, build, tell» blir tegningen).

**Ikke kopier:** Slottet og ballongene (deres uttrykk), og sporing via Google Tag Manager. Ikke en showreel som kan stå svart uten reserve (`bilde-01`, `bilde-02`).

**Bevegelse**

| Hva beveger seg | Utløser | Varighet |
|---|---|---|
| Utvalgt prosjekt øverst bytter innhold (bil → annen tekstlinje, `bilde-00` → `bilde-01`) | Usikkert: tid eller rulling. Bildene skiller ikke. | Ikke målt |
| Ordene i About-setningen løsner, roterer og flyter før de forsvinner, så står de tre fete ordene igjen (`bilde-03` → `bilde-05`) | Rulling (scrollY 2025 → 3375, 675 px per bilde) | To bildesteg, ca. 1350 px rullet, ca. 2 s. Ikke tidtatt. |
| Ordene blir «imagine, build, tell», og et slott på ballonger stiger fra bunnen av skjermen (`bilde-06` → `bilde-07` → `bilde-08`) | Rulling (scrollY 4050 → 4725 → 5279) | Så lenge rullingen pågår, tre bildesteg. |
| Teksten rundt «CUSTOMIZE THE CASTLE»-knappen står ulikt, og sløyfen over knappen har ulik vinkel (`bilde-08` mot `bilde-15`, scrollY 5279 begge steder) | Av seg selv (siden står stille i bunn) | Minst 7 bildesteg, ca. 8 s. Sløyfe; tid per omdreining ikke målt. |
| Spredd tekst på mobil (`epic-mobil/bilde-03`), slott/knapp (`bilde-07`) | Rulling | Samme mønster som desktop. |

Peker: musen står i midten. Hover og pekerfølging er **ikke observert**.

---

## bakkenbaeck.com

Bilder: `.design/referanser/bakkenbaeck-com--desktop--light--00..03.png` og `--mobil--light--00..03.png`.

**Observasjoner**
1. Hero er to setninger i stor skrift og ingenting annet over folden, rett etter en smal meny (`desktop--00`, `mobil--00`).
2. Under står fem kundelogoer på én linje, så arbeid i brede flater med bare kundenavn over («Sierra», «Phantom», «Google Deepmind») (`desktop--00`, `--02`).
3. Hver kundeblokk er en rad med tre flater i ulik bredde: film, produktskjerm og illustrasjon (`desktop--02`). På mobil er raden en sidelengs rullbar stripe med tre fargede tagger («Brand», «Web», «Product») (`mobil--00`). Nederst en kompetanseliste med de samme tre fargede overskriftene (`desktop--03`).

Flere flater er tomme grå/lilla felt i bildene (`desktop--02`, `--03`), antakelig ikke ferdig lastet ved bildetidspunktet.

**Prinsipp å låne:** La én setning bære forsiden, og la arbeidet fylle resten av skjermen i store flater med bare navn over.

**Ikke kopier:** De fargede kategoritaggene (rosa, grønn, blå) og logoraden i den formen.

---

## heydays.no (nå Kurppa Hosk)

Bilder: `.design/arbeid/kartlegger-ref/heydays-00.png`, `heydays-01.png` (engangsskript, se Avvik). Bare desktop.

**Observasjoner**
1. Øverst en svart stripe: «Heydays is now Kurppa Hosk» med «Contact us» (`heydays-00`). Selve siden under er den gamle.
2. Hero er én setning i vanlig størrelse på lys krem bakgrunn, med en kort tjenesteliste («Brand strategy», «Visual identity», …) (`heydays-00`). Klokkeslett i toppmenyen.
3. Arbeid er bildeledede kort i to kolonner i ulik størrelse, med kundenavn og én linje beskrivelse under («Nomono», «Plateful») (`heydays-01`). Et videofelt viser «We couldn't verify the security of your connection» i stedet for video (`heydays-00`, `heydays-01`).

Kunder som ren tekstliste, slik briefen forventer, er **ikke sett** i de to bildene. Siden er 4502 px høy og jeg har bare sett toppen.

**Prinsipp å låne:** Bilde først, så ett kundenavn og én linje om hva som er gjort. Ingen overskrift per kort.

**Ikke kopier:** Det forskjøvne rutenettet i ulike bredder, og videoflater uten reserve.

---

## oxide.computer

Bilder: `.design/referanser/oxide-computer--desktop--light--00..03.png`, `--mobil--light--00..03.png`. Mørk side.

**Observasjoner**
1. Hero har et stort foto av ekte serverskap til høyre, en terminal-boks med kommandoer til venstre og en tynn strek som kobler dem (`desktop--00`). Etiketten «FIG. 1 OXIDE CLOUD COMPUTER» over bildet.
2. Mono-etiketter i versaler («ELASTIC COMPUTE ▶», «ELASTIC NETWORKING ▶») over fire små skjermutsnitt med tre korte linjer under (`desktop--02`).
3. Overskriftene veksler mellom lys og dempet tekst i samme setning («One integrated platform. Compute, storage, …») (`desktop--01`). Foto av maskinrom ved siden av en inloggingsrute («Rack 6 INITIALIZED») (`desktop--01`).

**Prinsipp å låne:** Teknisk uttrykk blir troverdig når det står ved siden av et bevis: et ekte foto og et ekte grensesnitt.

**Ikke kopier:** Den mørke profilen med grønn aksent og mono-versaler som genre. Bruk dem bare hvis designlederen velger det selv.

---

## linear.app

Bilder: `.design/referanser/linear-app--desktop--light--00..03.png`, `--mobil--light--00..03.png`. Mørk side.

**Observasjoner**
1. Hero er en overskrift og én undertekst. Rett under, og delvis over folden, ligger et ekte produktskjermbilde i full bredde (`desktop--00`).
2. Neste seksjon har tre strektegnede figurer merket «FIG 0.1», «FIG 0.2», «FIG 0.3», hver med kort tittel og to linjer (`desktop--02`).
3. En seksjon viser en Slack-lignende tråd der noen skriver «@Linear create issues and assign to me», ved siden av en kanban-tavle (`desktop--03`).

**Prinsipp å låne:** Produktet er bildet. Hver seksjon viser det ekte, ikke en illustrasjon av det.

**Ikke kopier:** Det mørke temaet med utflytende paneler over hverandre. Uten et ekte produkt å vise blir det et skjermbilde som later som det er ekte.

---

## posthog.com

Bilder: `.design/referanser/posthog-com--desktop--light--00.png`, `--mobil--light--00.png`. Bare toppen er sett (1 utsnitt).

**Observasjoner**
1. Siden er bygd som et skrivebord: ikoner til venstre og høyre («Home», «Docs», «Trash», «Talk to a human») og innholdet i et vindu med lukkeknapper (`desktop--00`).
2. Teksten har selvironi: cookiebanneren heter «Legally-required cookie banner» og sier «No data is sent to a third party. (Ursula von der Leyen would be so proud.)», med et bilde av en person (`desktop--00`, `mobil--00`).
3. Eksempeldata er merket: «Sample data» står i hjørnet av eksempelboksen «PostHog AI» (`desktop--00`). Trygghetspunkter står som liste: «97% of users pay us $0», «No credit card required».

**Prinsipp å låne:** Humor og ærlighet i små, funksjonelle tekster (cookiebanner, merking av eksempeldata), ikke i store slagord.

**Ikke kopier:** Skrivebordsmetaforen og bildet av en navngitt politiker. Bruk aldri en virkelig persons bilde.

---

## rauno.me

Bilder: `.design/referanser/rauno-me--desktop--light--00..03.png`, `--mobil--light--00.png`.

**Observasjoner**
1. Få elementer: grå bakgrunn, en sidelengs stripe med hvite plansjer, en liten indikator med tynne streker øverst som viser posisjon (`desktop--00`, `--01`, `--02`).
2. Forsiden er én stor typografisk setning med en gul sirkel bak («Rauno Freiberg is an Estonian interaction designer…»). En plansje er bare ordet «Craft» i enorm størrelse, en annen viser en blå piksel-hånd (`desktop--00`, `--02`).
3. En tynn «+»-markør ligger midt på skjermen (`desktop--00`, `--01`, `--02`). I opptaket står pekeren i midten, så jeg har ikke bekreftet at den følger pekeren. Hver plansje har en liten etikett utenfor kortet («Devouring Details», «Craft»).

**Prinsipp å låne:** Tilbakeholdenhet. Ett element per skjerm, én detalj gjort perfekt (indikatoren, markøren), resten stille.

**Ikke kopier:** Horisontal rulling som hovedstruktur, og «+»-markøren. Den er hans signatur og en egen peker passer ikke på mobil.

---

## variant.no

Bilder: `.design/referanser/www-variant-no--desktop--light--00..03.png`, `--mobil--light--00..03.png`.

**Observasjoner**
1. Hero er en kort norsk overskrift og to linjer ingress over tre skjeve fargede kort med smilefjes (`desktop--00`).
2. Kontaktblokken er en mintgrønn flate med et spørsmål til leseren («Bruker dere mye tid på manuell dokumentbehandling?») og navn på en ekte person med lenke («Snakk med vår CTO …») (`desktop--02`). Oppdragene har pilleformede tagger («Avinor», «Ruter», «LO») (`desktop--02`).
3. Arrangementer står på hjemmesiden som en liste med dato, tid, sted og tags («13.10.2026 · 17:00-20:00 · Oslo») (`desktop--03`).

Håndbok, lønn og priser, som briefen nevner, er **ikke sett** i disse bildene. Bare forsiden er sett.

**Prinsipp å låne:** Vis hva som skjer og hvem som svarer: konkrete datoer, steder og en navngitt kontaktperson i stedet for «kontakt oss».

**Ikke kopier:** De fargede kortene med smilefjes og de tykke avrundede flatene (deres uttrykk). Merk at denne siden ikke nevner personer ved navn i brødtekst (CLAUDE.md), så navngitt kontakt må løses på annen måte.
