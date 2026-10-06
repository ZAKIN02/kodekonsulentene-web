#!/bin/bash
# Laster ned start- og sluttbilde for en scene og setter dem side om side,
# slik at morf kan oppdages FOER 4K-klippet bestilles. Fire agenter har
# stoppet morfer paa denne maaten.
set -e
id="$1"
mkdir -p .skudd/stor
for m in startbilde sluttbilde; do
  u=".skudd/scene-tmp/${id}-${m}.url"
  [ -f "$u" ] || { echo "  mangler $u"; exit 1; }
  curl -sS --max-time 180 -o ".skudd/stor/${id}-${m}.png" "$(cat "$u")"
done
ffmpeg -v error -i ".skudd/stor/${id}-startbilde.png" -i ".skudd/stor/${id}-sluttbilde.png" \
  -filter_complex "[0:v]scale=900:-2[a];[1:v]scale=900:-2[b];[a][b]hstack=inputs=2" \
  ".skudd/stor/${id}-par.png" -y
echo "  .skudd/stor/${id}-par.png"
