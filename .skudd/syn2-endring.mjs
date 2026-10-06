/** Hvor mye endrer bildet seg gjennom klippet? Et scroll-spolt klipp som står
 *  stille i deler av løpet gir en scroll-strekning der ingenting skjer. */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const navn = process.argv[2];
const pcts = [0,15,30,45,60,75,90,99];
let forrige = null, forste = null;
for (const p of pcts) {
  const im = PNG.sync.read(readFileSync(`/tmp/fr-${navn}-${p}.png`));
  if (!forste) forste = im;
  if (forrige) {
    let d = 0;
    for (let i = 0; i < im.data.length; i += 4)
      d += Math.abs(im.data[i]-forrige.data[i]) + Math.abs(im.data[i+1]-forrige.data[i+1]) + Math.abs(im.data[i+2]-forrige.data[i+2]);
    console.log(`  ${String(p).padStart(2)}%  endring fra forrige: ${(d/(im.width*im.height*3)).toFixed(1)}`);
  }
  forrige = im;
}
let d0 = 0;
for (let i = 0; i < forste.data.length; i += 4)
  d0 += Math.abs(forrige.data[i]-forste.data[i]) + Math.abs(forrige.data[i+1]-forste.data[i+1]) + Math.abs(forrige.data[i+2]-forste.data[i+2]);
console.log(`  slutt vs start: ${(d0/(forste.width*forste.height*3)).toFixed(1)}`);
