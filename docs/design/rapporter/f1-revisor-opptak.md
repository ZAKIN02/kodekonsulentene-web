# f1-revisor-opptak

Oppdragstype: opptak. Bildene er ikke vurdert. Server: http://localhost:4337 (Astro dev, ikke startet eller stoppet av revisor). Alle tre sider svarte 200.

## Stillbilder (scripts/skjermbilder.mjs, bevegelse av, til .design/retninger/)

Mobil 390x844 @2x, desktop 1440x900 @1x, lyst og mørkt tema. Alle 12 varianter OK.

| Side | mobil lyst | mobil mørkt | desktop lyst | desktop mørkt | Sum |
|---|---|---|---|---|---|
| /retning/a | 4 | 4 | 5 | 5 | 18 |
| /retning/b | 4 | 4 | 3 | 3 | 14 |
| /retning/c | 5 | 5 | 6 | 6 | 22 |

Totalt 54 bilder. Filnavn: `localhost-4337-retning-<a|b|c>--<mobil|desktop>--<light|dark>--NN.png`.

## Filmstriper (scripts/filmstripe.mjs, bevegelse på, musehjul)

Hver mappe har bilde-00.png og framover samt opptak.webm.

| Mappe | Bilder | Video | scrollY ved siste nye bilde |
|---|---|---|---|
| film-a | 14 | ja | 4745 (nådd bunn fra bilde 08) |
| film-a-mobil | 12 | ja | 4364 (bunn fra bilde 07) |
| film-b | 14 | ja | 3690 (bunn fra bilde 06) |
| film-b-mobil | 12 | ja | 3753 (bunn fra bilde 06) |
| film-c | 14 | ja | 5598 (bunn fra bilde 09) |
| film-c-mobil | 12 | ja | 5606 (bunn fra bilde 09) |

scrollY økte jevnt i alle seks, så rulling virker og ingen side bruker egen rullemotor. Siden er kortere enn antall bilder, så de siste bildene i hver mappe er gjentakelser av bunnen: A 6 (desktop) og 5 (mobil), B 8 og 6, C 4 og 3.

## Feil

- Ingen sider som ikke lastet.
- Ingen konsollfeil eller sidefeil fra skriptene (skjermbilder.mjs rapporterte 0, exit 0; filmstripe.mjs skrev ingen «Siden lastet ikke ferdig»).
- Filmstripene bruker Playwrights Chromium uten KANAL=chrome, så H.264 spilles ikke i opptak.webm; webm er uberørt av det.

## Filer opprettet

- .design/retninger/ (54 stillbilder og seks filmstripemapper)
- .design/arbeid/revisor/ (loggene stille.log og film-*.log)
- docs/design/rapporter/f1-revisor-opptak.md
