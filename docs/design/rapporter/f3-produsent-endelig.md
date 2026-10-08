# f3-produsent-endelig: DELVIS. C feilet etter seks forsøk. Heroen forblir A (kaos til oppstilt).

Dato: 8. oktober 2026. Brukt i dette oppdraget: 8,8 kreditter (estimat, POST /estimate). Sum i loggen: 76,2 av rammen. Saldo kan ikke leses via API; `higgsfield`-kommandolinjen finnes ikke på maskinen, alt går via `scripts/produksjon.mjs`. Eier må lese saldo i console.higgsfield.ai.

## Bilde C som redigering av A (Grok Imagine Image 2.0, 2816x1584)

| Forsøk | Prompt | Resultat |
|---|---|---|
| C-fraA-1 | bilde-C-v3 | Fem plater (to keramikk), ingen kabler, frontvinkel i stedet for tre kvart, doble prikker |
| C-fraA-2 | bilde-C-v4 | Seks kabler, ingen keramikk, annen vinkel, kabler ut av bildet |
| C-fraA-3 | bilde-C-v5 | Nærmest: riktig vinkel, fire lag, fem kabler. Men seks porter og seks prikker, glass med luft over kretskortet, utsnittet større enn A |
| C-fraA-4 | bilde-C-v6 | Seks kabler, plater svever |
| C-fraA-5 | bilde-C-v7 (retting av -3) | Fortsatt seks porter, en port uten kabel |
| C-fraA-6 | bilde-C-v8, A + B-justert som referanser | Eksplodert tilstand igjen, prikker utenfor portene |

Et Qwen-redigeringskall (som forsøk 3) feilet: «temporarily unavailable», ikke belastet og ikke regnet som forsøk. Hvert forsøk er sett med Read. Ingen fylte kravet om fire plater, fem porter, fem kabler og lik kamera/utsnitt som A. Overleggstest ble ikke gjort på noen, siden antall og vinkel allerede feilet.

## Stoppet, som kortet bestemte

Ikke laget: C 9:16, klipp B (16:9 og 9:16), sløyfe, fire nærbilder. Nærbildene kunne teknisk vært laget fra A, men prompten viser til den sammensatte plata, og kortet sa stopp etter seks forsøk. Ikke laget derfor, ingen kreditter brukt på dem.

## Hero

Uendret fra f1: `public/scener/hero/` har klipp A (kaos til oppstilt), 6 s.

| Fil | Størrelse | Mål |
|---|---|---|
| hero-1080.mp4 | 1 885 kB | under 2,5 MB, ok |
| hero-mobil.mp4 | 1 670 kB | under 2,5 MB, ok |
| poster.avif / poster-mobil.avif | 19 / 17 kB | under 120 kB, ok |

Ikke kjørt `lag-scene.sh` på nytt, siden ingen nye klipp finnes. Bakgrunn målt `#080809` (se f1).

## Filer

`scripts/produksjon.mjs` støtter nå flere referansebilder (`--ref a.png,b.png`, Grok). Nye prompter: bilde-C-v3 til v8. Lisenslogg og logg oppdatert.

## Åpne punkter

1. C mangler. Forsiden går videre med A alene (eller A uten C-avslutning).
2. Forslag til ny runde, eier må godkjenne kreditter: (a) vent på at Qwen edit kommer tilbake og prøv C fra A der (Qwen var best på å holde vinkelen, svakest på antall); (b) bygg C manuelt med ffmpeg/compositing av A-3 og B-justert (plater flyttet ned), som ikke er KI-generering; (c) lag C som første forsøk i Nano Banana Pro (`nano_banana_2`) hvis kontoen har den, som briefen forutsatte. Dette er ikke prøvd.
3. C-fraA-3 er beste kandidat, men feiler på porttall.
