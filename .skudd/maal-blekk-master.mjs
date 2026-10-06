/** Hvor ligger motivets lyse blekk vannrett i masteren?
 *  Brukes til aa regne ut et beskjaeringsvindu som flytter motivet inn i
 *  BAANDET masken viser, i stedet for aa la det staa midt i en 16:9-ramme. */
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
const [fil] = process.argv.slice(2);
mkdirSync(".skudd/pp", { recursive: true });
const dur = Number(execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",fil]).toString().trim());
const kolonner = new Array(160).fill(0);
for (const frac of [0.2, 0.5, 0.8]) {
  const png = `.skudd/pp/blekk-${Math.round(frac*100)}.png`;
  execFileSync("ffmpeg", ["-v","error","-ss",String(dur*frac),"-i",fil,"-frames:v","1","-vf","scale=160:90","-y",png]);
  const raw = execFileSync("python3", ["-c", `
from PIL import Image
import numpy as np, sys
a = np.asarray(Image.open(${JSON.stringify(png)}).convert('L'), dtype=float)
col = (a > 45).sum(axis=0)
print(' '.join(str(int(v)) for v in col))
`]).toString().trim().split(/\s+/).map(Number);
  raw.forEach((v, i) => (kolonner[i] += v));
}
const total = kolonner.reduce((a, b) => a + b, 0);
let kum = 0, p10 = 0, p50 = 0, p90 = 0;
kolonner.forEach((v, i) => {
  const foer = kum; kum += v;
  const f = (x) => foer / total < x && kum / total >= x;
  if (f(0.10)) p10 = i; if (f(0.50)) p50 = i; if (f(0.90)) p90 = i;
});
console.log(JSON.stringify({ fil: fil.split("/").pop(),
  venstreKant: +(p10/160*100).toFixed(1), tyngdepunkt: +(p50/160*100).toFixed(1), hoyreKant: +(p90/160*100).toFixed(1) }));
