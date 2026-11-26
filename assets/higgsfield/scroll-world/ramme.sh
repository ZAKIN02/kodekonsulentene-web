#!/bin/bash
# ramme.sh video n ut.png  -> ramme nummer n (0-indeksert)
ffmpeg -v error -y -i "$1" -vf "select=eq(n\,$2)" -vframes 1 "$3"
