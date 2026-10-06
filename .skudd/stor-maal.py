"""Kontrast mot hvit tekst per tredel, pluss hvor mettet lime-feltet faktisk er.

Forrige fargeforsøk («gjennomlyst») strøk med 2,0:1 i midtre tredel og 3,5:1 i
høyre – ikke en lys detalj å styre unna, men to tredeler som ikke tålte tekst.
Derfor måles både SNITT (tåler tredelen tekst?) og VERSTE piksel (finnes det en
lys flekk teksten må unngå?), og i tillegg hvor stor andel av bildet som faktisk
er mettet grønt – det er jo poenget med øvelsen.
"""
import sys
from PIL import Image
import numpy as np

def lum(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]

for sti in sys.argv[1:]:
    im = Image.open(sti).convert("RGB")
    a = np.asarray(im, dtype=float)
    L = lum(a)
    kontrast = 1.05 / (L + 0.05)          # hvit tekst mot bakgrunnen
    h, w = L.shape
    # Mettet lime: grønn klart dominant og ikke mørk
    g, r, b = a[..., 1], a[..., 0], a[..., 2]
    lime = (g > 90) & (g > r * 1.25) & (g > b * 1.6)
    print(f"\n  {sti.split('/')[-1]}")
    print(f"  {'tredel':8} {'snitt':>7} {'verst':>7}   lime-andel")
    for i, navn in enumerate(["venstre", "midt", "høyre"]):
        k = kontrast[:, i * w // 3:(i + 1) * w // 3]
        lm = lime[:, i * w // 3:(i + 1) * w // 3]
        flagg = "" if k.mean() >= 4.5 else "  <- for lyst for tekst"
        print(f"  {navn:8} {k.mean():7.1f} {k.min():7.1f}   {100*lm.mean():5.1f} %{flagg}")
    print(f"  hele bildet: lime {100*lime.mean():.1f} %")
