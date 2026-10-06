#!/bin/bash
# Filmstripe for scenen «bolt»: N rammer med jevnt mellomrom, lagt etter hverandre.
# Taller alene er ikke nok (docs/akt.md ledd 6) - stripen skal SES paa.
set -e
fil="${1:-public/scener/bolt-1920.mp4}"
n="${2:-9}"
ut="${3:-.skudd/bolt/bolt-stripe.png}"
d=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$fil")
mkdir -p .skudd/bolt/rammer
rm -f .skudd/bolt/rammer/*.png
for k in $(seq 0 $((n-1))); do
  t=$(python3 -c "print(f'{($d-0.05)*$k/($n-1):.3f}')")
  ffmpeg -v error -ss "$t" -i "$fil" -frames:v 1 -y ".skudd/bolt/rammer/r$(printf %02d $k).png"
done
ffmpeg -v error $(for f in .skudd/bolt/rammer/r*.png; do echo -n "-i $f "; done) \
  -filter_complex "$(for k in $(seq 0 $((n-1))); do echo -n "[$k:v]scale=640:-2[s$k];"; done)$(for k in $(seq 0 $((n-1))); do echo -n "[s$k]"; done)tile=3x$(( (n+2)/3 ))" \
  -y "$ut"
echo "$ut"
