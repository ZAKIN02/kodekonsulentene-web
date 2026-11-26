#!/bin/bash
# sem.sh i fmt : PSNR (a) dykk i siste -> overgang i foerste, (b) overgang i siste -> dykk i+1 foerste
S=assets/higgsfield/scroll-world; K=$S/kjede; i=$1; f=$2; j=$((i+1)); T=/tmp/sem_$f; mkdir -p $T
ps(){ ffmpeg -i "$1" -i "$2" -lavfi psnr -f null - 2>&1 | grep -o "average:[0-9.a-z]*" | cut -d: -f2; }
ffmpeg -v error -y -i $K/conn-$i-$f.mp4 -vframes 1 $T/c$i-first.png
$S/siste.sh $K/conn-$i-$f.mp4 $T/c$i-last.png >/dev/null
echo "$f sem $i: dykk$i-siste->conn$i-foerste $(ps $K/fr/d$i-$f-last.png $T/c$i-first.png) dB | conn$i-siste->dykk$j-foerste $(ps $T/c$i-last.png $K/fr/d$j-$f-first.png) dB"
