#!/bin/zsh
cd /Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web
until [ -f public/scener/lev-status-poster.avif ]; do sleep 20; done
echo "=== MÅLT PER FIL ==="
for id in lev-om lev-caser lev-status; do
  for w in 1920 1280 960; do
    f=public/scener/$id-$w.mp4
    [ -f "$f" ] || continue
    b=$(stat -f%z "$f")
    s=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")
    printf '  %-22s %7s kB  %5s Mbit/s\n' "$id-$w" "$((b/1024))" "$(echo "scale=2; $b*8/$s/1000000" | bc)"
  done
  m=assets/mastere/$id-master.mp4
  [ -f "$m" ] && printf '  %-22s %7s kB  (master)\n' "$id-master" "$(( $(stat -f%z $m) /1024))"
  p=public/scener/$id-poster.avif
  [ -f "$p" ] && printf '  %-22s %7s kB  (plakat)\n' "$id-poster" "$(( $(stat -f%z $p) /1024))"
done
