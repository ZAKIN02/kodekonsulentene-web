#!/bin/bash
# konn.sh <i> <fmt 16x9|9x16> [suffix] : overgang i fra siste ramme av dykk i til foerste ramme av dykk i+1
S=assets/higgsfield/scroll-world; K=$S/kjede; i=$1; f=$2; sfx=$3; j=$((i+1))
node $S/video-sw.mjs $K/conn-$i-$f$sfx.mp4 --slug ${SLUG:-kling-video/v4.0/image-to-video} --start $K/fr/d$i-$f-last.png --slutt $K/fr/d$j-$f-first.png --slutt-felt ${FELT:-end_image_url} --prompt $S/prompter/${PROMPT:-konn.txt} --extra '{"duration":5,"sound":"off","resolution":"1080p"}' --ramme 690 --merknad "sw 2b overgang $i $f$sfx ${MERK}" > $K/conn-$i-$f$sfx.log 2>&1
