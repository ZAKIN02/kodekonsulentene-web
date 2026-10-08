# f5-r01-revisor-opptak

Oppdragstype: opptak. Ingen bilder er vurdert. Server: http://localhost:4337/ (Astro dev, ikke startet eller stoppet av meg; svarte 200 før og etter).

## Tatt

| Variant | Skript | Mappe | Antall |
|---|---|---|---|
| Mobil 390x844 @2x, lyst | skjermbilder.mjs | .design/runde-01/ | 8 |
| Mobil, mørkt | skjermbilder.mjs | .design/runde-01/ | 8 |
| Desktop 1440x900, lyst | skjermbilder.mjs | .design/runde-01/ | 8 |
| Desktop, mørkt | skjermbilder.mjs | .design/runde-01/ | 8 |
| Filmstripe desktop | filmstripe.mjs | .design/runde-01/film/forside/ | 16 bilder + opptak.webm (3,0 MB) |
| Filmstripe mobil | filmstripe.mjs (VISNING=mobil) | .design/runde-01/film/forside-mobil/ | 14 bilder + opptak.webm (2,3 MB) |

Filnavn skjermbilder: `localhost--<mobil|desktop>--<light|dark>--00..07.png`. Skjermbilder er tatt med redusert bevegelse (skriptets standard). Filmstripene er tatt med bevegelse på.

## Feil og konsollmeldinger

- skjermbilder.mjs: 0 feil, 0 konsollfeil, 0 sidefeil, alle fire varianter OK.
- filmstripe.mjs: skriptet logger ikke konsoll eller sidefeil, og meldte ingen «Siden lastet ikke ferdig». Konsollen er derfor ikke målt for filmstripene.

## Observasjoner om dekning (fakta, ikke vurdering)

- Skjermbildene er begrenset av skriptet til 8 utsnitt. Ved 8 x 900 px dekker desktop de første ca. 7200 px. Filmstripa viser scrollY opp til 10125 på desktop, så siden er minst ca. 11 000 px høy. Bunnen av siden er ikke i skjermbildene, men er med i filmstripa.
- Mobil filmstripe: scrollY 0 til 8229 over 14 bilder (steg 633). Desktop: 0 til 10125 over 16 bilder (steg 675). scrollY endret seg for hvert bilde, så siden bruker vanlig rulling, ikke egen rullemotor.
- Filmstripene bruker programvare-GL. Hvis scenen bruker video, er avspilling i Playwrights Chromium uten H.264 (KANAL=chrome ikke satt). Hva scenen faktisk viste i opptaket er ikke vurdert.
- Prisvelgeren er med bare så langt rullingen passerer den. Filmstripeskriptet klikker eller drar ikke i den. Interaksjon med prisvelgeren er ikke tatt opp.

## Endret

Opprettet: .design/runde-01/ (32 PNG), .design/runde-01/film/forside/ og .design/runde-01/film/forside-mobil/, og denne rapporten.
