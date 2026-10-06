"""Måler bevegelsen i et FERDIG klipp, ikke i rammeparet.

Hvorfor dette finnes (_felle4 i assets/prompter/stor.json): et verifisert
rammepar garanterer ikke bevegelse. «stor-sveip» hadde identisk geometri og
lime 7,1 % -> 11,6 %, og Kling leverte likevel nær stillbilde. Rammeparet kan
altså ikke brukes som bevis. Det ferdige klippet må måles.

Metoden: N rammer med jevnt mellomrom, gråtone, snitt av absolutt differanse
mellom nabo-rammer, skalert 0-255. «sum» er summen av leddene og brukes som
ett tall for hvor mye som skjer i klippet. Kurven viser NÅR det skjer -
prosjektets regel er at poenget skal ligge rundt 50 % av tidslinjen, så et
frontlastet klipp er feil selv når summen er høy.

  python3 .skudd/klipp-maal.py <klipp.mp4> [flere.mp4 ...] [--rammer 5]

Terskler, kalibrert på våre egne klipp (se docs/stor.md):
  sum < 10        nær stillbilde      - forkast
  sum 10-18       svak bevegelse
  sum >= 18       tydelig bevegelse
  topp i 35-65 %  poenget ligger i midten - godkjent dramaturgi
"""
import subprocess
import sys
import tempfile
import os
import glob
import numpy as np
from PIL import Image

RAMMER = 5
if "--rammer" in sys.argv:
    i = sys.argv.index("--rammer")
    RAMMER = int(sys.argv[i + 1])
    del sys.argv[i:i + 2]

stier = [a for a in sys.argv[1:] if not a.startswith("--")]
if not stier:
    print(__doc__)
    sys.exit(1)


def varighet(sti):
    ut = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                         "format=duration", "-of", "default=nw=1:nk=1", sti],
                        capture_output=True, text=True, check=True)
    return float(ut.stdout.strip())


def hent_rammer(sti, n, mappe):
    """Rammer med jevnt mellomrom, inklusive første og siste.

    -ss før -i gir søk på nøkkelbilde-nivå; filene er enkodet med -g 8, så
    det er tett nok. Siste ramme hentes litt innenfor slutten, ellers kan
    ffmpeg levere tom fil.
    """
    d = varighet(sti)
    ut = []
    for k in range(n):
        t = (d - 0.05) * k / (n - 1)
        f = os.path.join(mappe, f"r{k:02d}.png")
        subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", sti,
                        "-frames:v", "1", "-y", f], check=True)
        ut.append(f)
    return ut, d


def forskyvning(a, b):
    """Global forskyvning mellom to rammer, i piksler, via fasekorrelasjon.

    Hvorfor: «nettsider» maalte 48 av 255 og saa ut som mye bevegelse, men
    docs/videofeil.md kaller den «nesten ingen bevegelse». Begge har rett -
    motivet staar stille, det er KAMERAET som driver. _bevegelse forbyr
    kamerabevegelse eksplisitt, saa drift er en feil og maa skilles fra
    bevegelse i motivet. Uten dette belonner maalingen nettopp den feilen.
    """
    A = np.fft.rfft2(a - a.mean())
    B = np.fft.rfft2(b - b.mean())
    R = A * np.conj(B)
    n = np.abs(R)
    R = np.where(n > 1e-9, R / n, 0)
    c = np.fft.irfft2(R, s=a.shape)
    dy, dx = np.unravel_index(np.argmax(c), c.shape)
    if dy > a.shape[0] / 2: dy -= a.shape[0]
    if dx > a.shape[1] / 2: dx -= a.shape[1]
    return float(np.hypot(dy, dx))


print(f"\n  {'klipp':28} {'sek':>5} {'sum':>6}  {'topp':>6} {'drift':>6}  ledd (nabo-differanse, 0-255)")
for sti in stier:
    with tempfile.TemporaryDirectory() as m:
        filer, d = hent_rammer(sti, RAMMER, m)
        bilder = [np.asarray(Image.open(f).convert("L"), dtype=float) for f in filer]
        ledd = [float(np.abs(bilder[k + 1] - bilder[k]).mean())
                for k in range(len(bilder) - 1)]
        # Drift maales mot FOERSTE ramme, ikke mellom naboer: en langsom,
        # jevn panorering gir smaa nabosteg og ville ellers forsvinne.
        drift = max(forskyvning(bilder[0], b) for b in bilder[1:])
        # Skaler til 1920 bred, slik at tallet er sammenlignbart paa tvers
        # av opploesninger.
        drift *= 1920 / bilder[0].shape[1]
    sum_ = sum(ledd)
    # Midtpunktet til leddet med mest endring, i prosent av tidslinjen.
    topp = (np.argmax(ledd) + 0.5) / len(ledd) * 100
    if sum_ < 10:
        dom = "NÆR STILLBILDE"
    elif sum_ < 18:
        dom = "svak"
    else:
        dom = "tydelig"
    midt = "midtstilt" if 35 <= topp <= 65 else "frontlastet" if topp < 35 else "baklastet"
    if drift > 8:
        dom += ", KAMERADRIFT"
    s = "  ".join(f"{v:5.2f}" for v in ledd)
    print(f"  {os.path.basename(sti):28} {d:5.1f} {sum_:6.2f}  {topp:5.0f}% {drift:5.1f}px  {s}   {dom}, {midt}")
print()
