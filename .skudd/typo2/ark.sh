#!/bin/zsh
# ark.sh <fase> <navn> [kolonner]
# Hver ramme normaliseres FØR tile. ffmpeg sin glob-demukser leser bare den
# første ramma når bildene har ulik størrelse – da blir arket tomt og man tror
# siden er tom. Derfor pad per fil, så tile.
cd /Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web
f=$1; n=$2; k=${3:-3}
d=".skudd/typo2/$f/$n"; t=$(mktemp -d)
i=0
for p in $d/r-*.png; do
  nav=$(basename $p .png | sed 's/^r-//')
  ffmpeg -v error -y -i "$p" -vf "scale=620:420:force_original_aspect_ratio=decrease,pad=640:460:(ow-iw)/2:40:color=0x2a2a2a,drawtext=fontfile=/System/Library/Fonts/Supplemental/Courier New Bold.ttf:text='$nav':x=10:y=8:fontsize=26:fontcolor=0xff40ff" "$t/$(printf %03d $i).png"
  i=$((i+1))
done
ffmpeg -v error -y -i "$t/%03d.png" -vf "tile=${k}x4:margin=6:padding=6:color=0x6a6a6a" ".skudd/typo2/$f-$n-ark.png"
rm -rf $t
ls -la ".skudd/typo2/$f-$n-ark.png"
