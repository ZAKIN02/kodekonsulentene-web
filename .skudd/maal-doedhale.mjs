/** Måler hvor i klippet bevegelsen faktisk skjer. Et klipp som står stille i
 *  andre halvdel gir ingenting tilbake for halve scrollstrekningen – det er
 *  nettopp det kunden kaller statisk. */
import { execFileSync } from "node:child_process";
const filer = process.argv.slice(2);
for (const f of filer) {
  const varighet = +execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0",f]).toString().trim();
  const kvartal = [];
  for (let i = 0; i < 4; i++) {
    const a = (varighet * i) / 4, b = (varighet * (i + 1)) / 4;
    const ut = execFileSync("ffmpeg", ["-v","error","-ss",String(a),"-t",String(b-a),"-i",f,
      "-vf","select='gt(scene\\,0)',metadata=print:file=-","-an","-f","null","-"], { encoding: "utf8" });
    const verdier = [...ut.matchAll(/scene_score=([\d.]+)/g)].map((m) => +m[1]);
    kvartal.push(verdier.length ? (verdier.reduce((s, v) => s + v, 0) / verdier.length * 1000).toFixed(1) : "0.0");
  }
  console.log(`  ${f.replace("public/","").padEnd(34)} ${varighet.toFixed(1)}s  endring per kvartal: ${kvartal.join("  ")}`);
}
