#!/bin/bash
# siste.sh video ut.png [antall-rammer-aa-beholde] -> siste (eller n-te) ramme
v=$1; n=${3:-$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $v)}
ffmpeg -v error -y -i $v -vf "select=eq(n\,$((n-1)))" -vframes 1 $2; echo "$v: $n rammer"
