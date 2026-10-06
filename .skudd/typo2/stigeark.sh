#!/bin/zsh
cd /Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web
n=$1; k=${2:-2}; w=${3:-820}; h=${4:-340}
d=".skudd/typo2/stige/$n"; t=$(mktemp -d); i=0
for p in $d/lh-*.png; do
  nav=$(basename $p .png)
  ffmpeg -v error -y -i "$p" -vf "scale=$((w-20)):$((h-50)):force_original_aspect_ratio=decrease,pad=$w:$h:(ow-iw)/2:44:color=0x1a1a1a,drawtext=fontfile=/System/Library/Fonts/Supplemental/Courier New Bold.ttf:text='$nav':x=10:y=8:fontsize=30:fontcolor=0xff40ff" "$t/$(printf %03d $i).png"
  i=$((i+1))
done
ffmpeg -v error -y -i "$t/%03d.png" -vf "tile=${k}x4:margin=6:padding=6:color=0x888888" ".skudd/typo2/stige-$n.png"
rm -rf $t; ls -la ".skudd/typo2/stige-$n.png"
