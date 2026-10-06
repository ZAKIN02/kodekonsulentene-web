/** Omrammer fra master ut fra MÅLTE ytterpunkter, ikke en gjettet forskyvning.
 *
 * Den forrige rerammingen skjøv motivet til 99,7 % av bildebredden, så platen
 * som glir ut på /sikkerhet ble kuttet av bildekanten nettopp når den var ute.
 * Her oppgis ønsket venstre- og høyrekant, og skala og forskyvning REGNES ut.
 *
 *   node .skudd/f3-reramme.mjs <id> <mappe> <maalVenstre%> <maalHoyre%> <naaVenstre%> <naaHoyre%> [bredder...]
 */
import { execFileSync } from "node:child_process";
const [id, mappe, mV, mH, nV, nH, ...bredderRaa] = process.argv.slice(2);
const maalV = +mV, maalH = +mH, naaV = +nV, naaH = +nH;
const bredder = bredderRaa.length ? bredderRaa.map(Number) : [2560, 1920, 1280];
const CRF = { 2560: "20", 1920: "19", 1280: "19", 960: "19" };

// Skala som gjoer motivets bredde lik maalbredden, og forskyvning som legger
// venstrekanten der den skal. Begge i andel av bildebredden.
const skala = (maalH - maalV) / (naaH - naaV);
// Skaleringen skjer om SENTER, ikke om venstrekanten. Glemmer man det, blir
// forskyvningen for stor: maalet 40 % ga 50 % i faktisk maaling.
const etterSkala = 50 + (naaV - 50) * skala;
const forskyv = maalV - etterSkala;   // i prosent av UTBILDETS bredde
console.log(`  skala ${skala.toFixed(3)}  forskyv ${forskyv.toFixed(2)}%`);

const master = `assets/mastere/${id}-master.mp4`;
for (const b of bredder) {
  const fil = `public/${mappe}/${id}-${b}.mp4`;
  // Krymp om senter, fyll med bakgrunnsfargen, og flytt deretter sideveis.
  const ledd = [];
  // Krymp bare naar det faktisk trengs: pad kan ikke vaere mindre enn inndata,
  // og skala 1 gir 1.0000000000000002 i flyttall.
  if (Math.abs(skala - 1) > 1e-6) {
    ledd.push(`scale=iw*${skala}:ih*${skala}`,
      `pad=w=iw/${skala}:h=ih/${skala}:x=(ow-iw)/2:y=(oh-ih)/2:color=0x0b0d10`);
  }
  // Forskyvning: fyll paa den ene siden, beskjaer fra den andre. Negativ
  // forskyvning flytter motivet mot venstre.
  if (Math.abs(forskyv) > 1e-6) {
    const p = Math.abs(forskyv);
    if (forskyv > 0) {
      ledd.push(`pad=w=iw*(1+${p}/100):h=ih:x=iw*${p}/100:y=0:color=0x0b0d10`,
        `crop=w=iw/(1+${p}/100):h=ih:x=0:y=0`);
    } else {
      ledd.push(`pad=w=iw*(1+${p}/100):h=ih:x=0:y=0:color=0x0b0d10`,
        `crop=w=iw/(1+${p}/100):h=ih:x=iw-iw/(1+${p}/100):y=0`);
    }
  }
  ledd.push(`scale=${b}:-2:flags=lanczos`, `fps=24`);
  const vf = ledd.join(",");
  execFileSync("ffmpeg", ["-v","error","-i",master,"-vf",vf,
    "-c:v","libx264","-preset","slow","-crf",CRF[b] ?? "19",
    "-g","8","-keyint_min","8","-sc_threshold","0","-pix_fmt","yuv420p",
    "-movflags","+faststart","-an","-colorspace","bt709","-color_primaries","bt709","-color_trc","bt709","-y",fil]);
  const bytes = +execFileSync("stat",["-f%z",fil]).toString().trim();
  const sek = +execFileSync("ffprobe",["-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",fil]).toString().trim();
  console.log(`  ${fil}  ${(bytes/1024).toFixed(0)} kB  ${((bytes*8)/sek/1e6).toFixed(2)} Mbit/s`);
}
