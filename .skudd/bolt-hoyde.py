"""Måler at det BEVEGELIGE OBJEKTET har samme størrelse i begge nøkkelrammene.

Hvorfor dette finnes: `bolt` runde 1 passerte rammekontrollen og ga likevel et
klipp der slåen vokste 16 % i høyde mens den gikk i inngrep. Kontrollen som
sviktet målte det LYSE BÅNDET - slå pluss kanalramme - og båndet var identisk i
alle tre rammene, så alt så grønt ut. Slåen selv var 187 px i startbildet og
214 px i sluttbildet. Kling interpolerte trofast mellom to rammer som ikke var
enige om størrelsen.

Lærdommen, som gjelder enhver scene: **mål objektet som skal bevege seg, ikke
sonen det ligger i.** Og mål på en fast kolonne inne i objektet, ikke på hele
bildet, ellers drukner objektet i rammen rundt.

To fallgruver denne målingen er bygget for å unngå:

  1. Limegrønne glødlinjer blåser opp tallet. Linja ligger rett over og under
     objektet, så en ren luminansterskel tar den med. Lime maskeres derfor bort
     før målingen.
  2. «Største sammenhengende løp» kutter ved objektets fas, og måler da bare den
     flate forsiden. Det ga 184 px i BEGGE runder og ville ha godkjent runde 1.
     Vi måler derfor ytterpunktene (max - min) av det lyse, ikke løpet.

Kalibrering: metoden skal gi avvik 27 px på runde 1 (den kjente feilen) og
3 px på runde 2 (rettet). Endrer du den, sjekk mot de to tallene.

  python3 .skudd/bolt-hoyde.py <bilde:kolonne%> [<bilde:kolonne%> ...]

Kolonnen må ligge INNE i objektet i nettopp det bildet. For `bolt`:
startbildet 48 %, sluttbildet 76 %.

Terskel: avvik over 4 px = ikke bestill video.
"""
import sys
import numpy as np
from PIL import Image


def silhuett(sti, colpct):
    a = np.asarray(Image.open(sti).convert("RGB"), dtype=float)
    h, w, _ = a.shape
    c = int(w * colpct / 100)
    sl = a[int(h * 0.30):int(h * 0.70), max(0, c - 6):c + 6, :]
    R, G, B = sl[..., 0], sl[..., 1], sl[..., 2]
    lime = (G > 90) & (G > R * 1.25) & (G > B * 1.6)
    L = sl.mean(2)
    L[lime] = 0
    kol = L.mean(1)
    lys = np.where(kol > 120)[0]
    if not len(lys):
        return 0, h
    return int(lys.max() - lys.min()), h


par = [a for a in sys.argv[1:] if ":" in a]
if not par:
    print(__doc__)
    sys.exit(1)

print(f"\n  {'fil':34} {'kol':>5} {'høyde':>7} {'% av bildet':>12}")
hoyder = []
for a in par:
    sti, col = a.rsplit(":", 1)
    px, h = silhuett(sti, float(col.rstrip("%")))
    hoyder.append(px)
    print(f"  {sti.split('/')[-1]:34} {col:>5} {px:5d} px {100*px/h:11.2f} %")

avvik = max(hoyder) - min(hoyder)
dom = "GODKJENT – objektet holder størrelsen" if avvik <= 4 else "FORKASTET – objektet endrer størrelse, IKKE bestill video"
print(f"\n  avvik: {avvik} px  ->  {dom}\n")
sys.exit(0 if avvik <= 4 else 1)
