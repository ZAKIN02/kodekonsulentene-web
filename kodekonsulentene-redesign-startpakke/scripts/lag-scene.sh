#!/usr/bin/env bash
# Gjør råklipp fra Higgsfield om til nettfiler for <Scene>: klippene settes sammen i rekkefølge,
# kodes med tette nøkkelrammer (jevn spoling begge veier) som mp4 og webm, og første ramme blir posterbilde.
# Klipp under 1080p blir avvist.
#
# Bruk:   scripts/lag-scene.sh <navn>
# Inn:    assets/higgsfield/raa/<navn>-A.mp4, <navn>-B.mp4 ...              (16:9, minst 1920x1080)
#         assets/higgsfield/raa/<navn>-mobil-A.mp4, <navn>-mobil-B.mp4 ...  (9:16, minst 1080x1920)
# Ut:     public/scener/<navn>/<navn>-1080.mp4|webm, <navn>-mobil.mp4|webm, poster.avif, poster-mobil.avif
set -euo pipefail

navn="${1:?Bruk: scripts/lag-scene.sh <navn>}"
inn="assets/higgsfield/raa"
ut="public/scener/$navn"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
shopt -s nullglob

# krev_1080p <liggende|staaende> <klipp>...
# Stopper hvis korteste side er under 1080 piksler, eller hvis klippet har feil retning.
krev_1080p() {
  local retning="$1" klipp maal b h kort
  shift
  for klipp in "$@"; do
    maal="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$klipp")" || {
      echo "Kunne ikke lese $klipp" >&2
      exit 1
    }
    b="${maal%%x*}"
    h="${maal##*x}"
    kort=$((b < h ? b : h))
    if [ "$kort" -lt 1080 ]; then
      echo "For lav oppløsning: $klipp er ${b}x${h}. Kravet er minst 1080 piksler på korteste side." >&2
      exit 1
    fi
    if [ "$retning" = "liggende" ] && [ "$b" -le "$h" ]; then
      echo "Feil retning: $klipp er ${b}x${h}, men skal være liggende (16:9)." >&2
      exit 1
    fi
    if [ "$retning" = "staaende" ] && [ "$h" -le "$b" ]; then
      echo "Feil retning: $klipp er ${b}x${h}, men skal være stående (9:16)." >&2
      exit 1
    fi
  done
}

# lag <filnavn uten endelse> <posternavn> <bredde> <høyde> <klipp>...
lag() {
  local fil="$1" poster="$2" bredde="$3" hoyde="$4"
  shift 4
  local antall="$#" innganger=() filter="" kjede="" i=0
  for klipp in "$@"; do
    innganger+=(-i "$klipp")
    # Første ramme i klipp B, C ... er lik siste ramme i klippet før, og droppes.
    local kutt=""
    if [ "$i" -gt 0 ]; then kutt="trim=start_frame=1,"; fi
    filter+="[$i:v]fps=24,scale=$bredde:$hoyde:flags=lanczos,setsar=1,${kutt}setpts=PTS-STARTPTS[v$i];"
    kjede+="[v$i]"
    i=$((i + 1))
  done
  filter+="${kjede}concat=n=$antall:v=1:a=0[v]"

  ffmpeg -v error -y "${innganger[@]}" -filter_complex "$filter" -map "[v]" -an \
    -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p "$tmp/$fil.mp4"
  ffmpeg -v error -y -i "$tmp/$fil.mp4" -an -c:v libx264 -preset slow -crf 23 \
    -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart "$ut/$fil.mp4"
  ffmpeg -v error -y -i "$tmp/$fil.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 34 \
    -g 8 -keyint_min 8 -row-mt 1 -cpu-used 3 "$ut/$fil.webm"
  ffmpeg -v error -y -i "$tmp/$fil.mp4" -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 30 "$ut/$poster.avif"
}

brede=("$inn/$navn"-[A-Z].mp4)
hoye=("$inn/$navn"-mobil-[A-Z].mp4)

if [ "${#brede[@]}" -eq 0 ]; then
  echo "Fant ingen klipp: $inn/$navn-A.mp4" >&2
  exit 1
fi
krev_1080p liggende "${brede[@]}"
if [ "${#hoye[@]}" -gt 0 ]; then krev_1080p staaende "${hoye[@]}"; fi

mkdir -p "$ut"
lag "$navn-1080" "poster" 1920 1080 "${brede[@]}"
if [ "${#hoye[@]}" -gt 0 ]; then
  lag "$navn-mobil" "poster-mobil" 1080 1920 "${hoye[@]}"
else
  echo "Ingen 9:16-klipp funnet ($inn/$navn-mobil-A.mp4). Mobil mangler egen video." >&2
fi

echo "Ferdig: $ut"
for f in "$ut"/*; do
  printf '%8s kB  %s\n' "$(($(wc -c < "$f") / 1024))" "$f"
done
