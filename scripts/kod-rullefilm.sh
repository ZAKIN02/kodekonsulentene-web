#!/usr/bin/env bash
# Gjør et råklipp (Seedance, Higgsfield) om til nettfilene for rullefilmen på forsiden (ScrollWorld).
# Formatet er valgt etter målingene i docs/design/rapporter/wow-r7-flyt.md.
#
# Bruk:
#   scripts/kod-rullefilm.sh <inn-16x9.mp4> <navn> [<inn-9x16.mp4>]
#
#   <inn-16x9.mp4>   liggende råklipp, minst 1080 piksler på korteste side
#   <navn>           filnavnet uten endelse, det samme som `kilde` i src/data/historie.ts (f.eks. dive-5)
#   <inn-9x16.mp4>   stående råklipp. Utelates det, beskjæres det liggende til 9:16 fra midten
#                    (nødløsning: motivet må da stå midt i bildet).
#
# Ut (i $UT, standard public/media/wow/scroll-world):
#   <navn>.mp4        16:9, 1920 × 1080      <navn>-m.mp4        9:16, 720 × 1280
#   <navn>-start.webp|avif og <navn>-slutt.webp|avif (og -start-m, -slutt-m): første og siste rame
#   som stillbilde, til poster (`poster: "<navn>-start"`) og til stillbildesegmentene som skal møte
#   klippet i en søm.
#
# Hva formatet er, og hvorfor:
#   H.264 High, yuv420p, uten lyd, uten B-ramer (-bf 0), nøkkelrame hver 8. rame (lukket GOP, ingen
#   sceneklipp), moov først (+faststart), fast bildefrekvens lik kilden.
#   - Nettleseren dekoder ramene selv (WebCodecs) i et vindu rundt rulleposisjonen. GOP 8 betyr at
#     høyst 8 ramer må dekodes for å nå en vilkårlig rame, og fila er under halvparten så stor som
#     med bare nøkkelramer.
#   - Uten B-ramer er dekoderekkefølgen lik visningsrekkefølgen, så en GOP kan dekodes bare så langt
#     som trengs, og reserven (<video> og currentTime) søker raskere.
#   - moov først gjør at tabellen over ramer kommer med første henting (Range), så første bilde ikke
#     venter på hele fila. Det er dette som gjør at klipp på 10–30 s tåles.
#   - Mobil får 720 × 1280: 2,25 ganger færre piksler å dekode og holde i minnet enn 1080 × 1920.
#
# Lengden spiller ingen rolle: motoren leser antall ramer og bildefrekvens fra fila.
#
# CRF 27 (16:9) og 24 (9:16) er valgt slik at bildet er minst like likt kilden (SSIM) som nettfilene
# før runde 7 var, se rapporten.
#
# Miljøvariabler:  UT=<mappe>  GOP=8  CRF=27  CRF_M=24  SIDE=1080  SIDE_M=720  FPS=<kildens>
#                  STILL=0 hopper over stillbildene (når klippet erstatter et som alt har sine).
set -euo pipefail

if [ "$#" -lt 2 ]; then
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
  exit 64
fi

inn="$1"
navn="$2"
innM="${3:-}"
UT="${UT:-public/media/wow/scroll-world}"
GOP="${GOP:-8}"
CRF="${CRF:-27}"
CRF_M="${CRF_M:-24}"
SIDE="${SIDE:-1080}"
SIDE_M="${SIDE_M:-720}"
STILL="${STILL:-1}"

for v in ffmpeg ffprobe; do
  command -v "$v" >/dev/null || { echo "Mangler $v." >&2; exit 69; }
done
[ -f "$inn" ] || { echo "Finner ikke $inn" >&2; exit 66; }
[ -z "$innM" ] || [ -f "$innM" ] || { echo "Finner ikke $innM" >&2; exit 66; }
case "$navn" in
  */* | *.mp4 | *-m) echo "Navnet skal være uten mappe og endelse, og ikke slutte på -m: $navn" >&2; exit 64 ;;
esac

maal() { ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$1"; }
takt() { ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$1"; }

# krev <fil> <liggende|staaende> <minste korteste side>
krev() {
  local m b h kort
  m="$(maal "$1")" || { echo "Kunne ikke lese $1" >&2; exit 65; }
  b="${m%%x*}"
  h="${m##*x}"
  kort=$((b < h ? b : h))
  if [ "$2" = liggende ] && [ "$b" -le "$h" ]; then echo "Feil retning: $1 er ${b}x${h}, skal være liggende (16:9)." >&2; exit 65; fi
  if [ "$2" = staaende ] && [ "$h" -le "$b" ]; then echo "Feil retning: $1 er ${b}x${h}, skal være stående (9:16)." >&2; exit 65; fi
  if [ "$kort" -lt "$3" ]; then echo "For lav oppløsning: $1 er ${b}x${h}, korteste side må være minst $3." >&2; exit 65; fi
}

krev "$inn" liggende "$SIDE"
FPS="${FPS:-$(takt "$inn")}"
if [ -n "$innM" ]; then
  krev "$innM" staaende "$SIDE_M"
  kildeM="$innM"
  filterM="scale=${SIDE_M}:-2:flags=lanczos"
else
  echo "Advarsel: ingen stående kilde. Beskjærer $inn til 9:16 fra midten." >&2
  kildeM="$inn"
  filterM="crop=trunc(ih*9/16/2)*2:ih,scale=${SIDE_M}:-2:flags=lanczos"
fi

mkdir -p "$UT"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# kod <kilde> <filter> <crf> <ut.mp4>
kod() {
  ffmpeg -v error -y -i "$1" -an -sn -dn -map_metadata -1 -map 0:v:0 \
    -vf "fps=${FPS},$2,setsar=1,setpts=PTS-STARTPTS" -fps_mode cfr \
    -c:v libx264 -preset slow -crf "$3" -profile:v high -pix_fmt yuv420p \
    -bf 0 -g "$GOP" -keyint_min "$GOP" -sc_threshold 0 -x264-params "open-gop=0" \
    -movflags +faststart "$tmp/ut.mp4"
  mv "$tmp/ut.mp4" "$4"
}

# stillbilder <klipp.mp4> <ut uten endelse> <endelse, "" eller "-m">: første og siste rame som webp og avif
stillbilder() {
  local n siste m="$3"
  n="$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$1")"
  siste=$((n - 1))
  ffmpeg -v error -y -i "$1" -vf "select=eq(n\,0)" -frames:v 1 "$tmp/start.png"
  ffmpeg -v error -y -i "$1" -vf "select=eq(n\,$siste)" -frames:v 1 "$tmp/slutt.png"
  local hva
  for hva in start slutt; do
    ffmpeg -v error -y -i "$tmp/$hva.png" -c:v libwebp -quality 80 -compression_level 6 "$2-$hva$m.webp"
    ffmpeg -v error -y -i "$tmp/$hva.png" -c:v libsvtav1 -crf 30 -preset 4 -still-picture 1 "$2-$hva$m.avif" 2>/dev/null ||
      ffmpeg -v error -y -i "$tmp/$hva.png" -c:v libaom-av1 -crf 30 -still-picture 1 "$2-$hva$m.avif" 2>/dev/null ||
      echo "Advarsel: fikk ikke laget $2-$hva$m.avif (ingen AV1-koder i ffmpeg). WebP finnes." >&2
  done
}

# kontroll <klipp.mp4>: det motoren forutsetter. Stopper hvis noe ikke stemmer.
kontroll() {
  local fil="$1" moov mdat bf n nokler bytes sek
  moov="$(LC_ALL=C grep -abo 'moov' "$fil" | head -1 | cut -d: -f1)"
  mdat="$(LC_ALL=C grep -abo 'mdat' "$fil" | head -1 | cut -d: -f1)"
  if [ -z "$moov" ] || [ -z "$mdat" ] || [ "$moov" -gt "$mdat" ]; then echo "FEIL: moov ligger ikke først i $fil." >&2; exit 70; fi
  bf="$(ffprobe -v error -select_streams v:0 -show_entries stream=has_b_frames -of csv=p=0 "$fil")"
  if [ "$bf" != 0 ]; then echo "FEIL: $fil har B-ramer." >&2; exit 70; fi
  n="$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$fil")"
  nokler="$(ffprobe -v error -select_streams v:0 -show_entries packet=flags -of csv=p=0 "$fil" | grep -c K)"
  if [ "$nokler" -ne $(((n + GOP - 1) / GOP)) ]; then echo "FEIL: $fil har $nokler nøkkelramer på $n ramer, ventet én per $GOP." >&2; exit 70; fi
  bytes="$(wc -c <"$fil" | tr -d ' ')"
  sek="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$fil")"
  awk -v f="$fil" -v n="$n" -v k="$nokler" -v b="$bytes" -v s="$sek" -v m="$(maal "$fil")" -v t="$FPS" \
    'BEGIN { printf "  %-52s %s  %d ramer (%s b/s, %.1f s)  %d nøkkelramer  %.2f MB  %.1f Mbit/s\n", f, m, n, t, s, k, b / 1048576, b * 8 / s / 1e6 }'
}

echo "Koder $navn (GOP $GOP, CRF $CRF / $CRF_M, $FPS b/s) til $UT"
kod "$inn" "scale=-2:${SIDE}:flags=lanczos" "$CRF" "$UT/$navn.mp4"
kod "$kildeM" "$filterM" "$CRF_M" "$UT/$navn-m.mp4"
if [ "$STILL" != 0 ]; then
  stillbilder "$UT/$navn.mp4" "$UT/$navn" ""
  stillbilder "$UT/$navn-m.mp4" "$UT/$navn" "-m"
fi
kontroll "$UT/$navn.mp4"
kontroll "$UT/$navn-m.mp4"
echo "Ferdig. Legg segmentet i src/data/historie.ts med kilde: \"$navn\"."
