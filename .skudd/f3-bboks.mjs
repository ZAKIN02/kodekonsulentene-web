/** Finner motivets ytterpunkter gjennom HELE klippet, ikke i én ramme.
 *  Rerammingen skjøv sikkerhet-platen ut av bildet fordi utstrekningen ble
 *  målt i en stilling der platen ennå ikke var kjørt ut. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [fil, terskel = "42"] = process.argv.slice(2);
const tmp = mkdtempSync(join(tmpdir(), "bboks-"));
try {
  execFileSync("ffmpeg", ["-v","error","-i",fil,"-vf","fps=4,scale=320:-2","-pix_fmt","gray",join(tmp,"f%03d.pgm"),"-y"]);
  const filer = readdirSync(tmp).filter(f=>f.endsWith(".pgm")).sort();
  let V=320, H=0, O=180, N=0, W=0, Hgt=0;
  for (const f of filer) {
    const buf = readFileSync(join(tmp,f));
    // PGM P5: magic, bredde hoyde, maks, data
    const hode = buf.subarray(0,64).toString("latin1");
    const m = hode.match(/^P5\s+(\d+)\s+(\d+)\s+(\d+)\s/);
    if (!m) continue;
    W = +m[1]; Hgt = +m[2];
    const start = m[0].length;
    for (let y=0;y<Hgt;y++) for (let x=0;x<W;x++) {
      if (buf[start + y*W + x] >= +terskel) {
        if (x<V) V=x; if (x>H) H=x; if (y<O) O=y; if (y>N) N=y;
      }
    }
  }
  const p = (v,t)=> ((v/t)*100).toFixed(1);
  console.log(`  ${fil}`);
  console.log(`    vannrett: ${p(V,W)}% – ${p(H,W)}%   (bredde ${p(H-V,W)}%)`);
  console.log(`    loddrett: ${p(O,Hgt)}% – ${p(N,Hgt)}%`);
} finally { rmSync(tmp,{recursive:true,force:true}); }
