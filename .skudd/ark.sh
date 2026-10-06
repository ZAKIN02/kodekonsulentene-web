#!/bin/zsh
# ark.sh <navn> [kolonner]
cd /Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web
n=$1; k=${2:-4}
ffmpeg -v error -y -pattern_type glob -i ".skudd/syn/$n/r*.png" \
  -vf "scale=520:-2,drawtext=fontfile=/System/Library/Fonts/Supplemental/Courier New Bold.ttf:text='%{n}':x=8:y=8:fontsize=34:fontcolor=magenta:box=1:boxcolor=black@0.7:boxborderw=5,tile=${k}x4:margin=6:padding=6:color=0x222222" \
  ".skudd/syn/$n-ark.png"
ls -la ".skudd/syn/$n-ark.png"
