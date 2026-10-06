/** Finner panelets ytre boks i to rammer og sammenligner. Morfing oppstaar naar
 *  geometrien er ULIK mellom start og slutt - maal det foer 4K bestilles. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const tmp = mkdtempSync(join(tmpdir(), "geo-"));
const boks = (fil) => {
  const ppm = join(tmp, "x.ppm");
  execFileSync("ffmpeg", ["-v", "error", "-i", fil, "-vf", "scale=512:-1,format=gray", "-f", "rawvideo", "-pix_fmt", "gray", ppm, "-y"]);
  const d = readFileSync(ppm);
  const W = 512, H = Math.round(d.length / W);
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (d[y * W + x] < 40) continue;              // naer-svart bakgrunn
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { W, H, x0, x1, y0, y1 };
};
const [a, b] = process.argv.slice(2).map(boks);
const d = (k) => Math.abs(a[k] - b[k]);
console.log(`  start: x ${a.x0}-${a.x1}  y ${a.y0}-${a.y1}   (${a.W}x${a.H})`);
console.log(`  slutt: x ${b.x0}-${b.x1}  y ${b.y0}-${b.y1}`);
console.log(`  avvik: venstre ${d("x0")}  hoyre ${d("x1")}  topp ${d("y0")}  bunn ${d("y1")}  (av ${a.W} px bredde)`);
console.log(`  panelet dekker ${Math.round((a.x0 / a.W) * 100)}%-${Math.round((a.x1 / a.W) * 100)}% av bredden`);
rmSync(tmp, { recursive: true, force: true });
