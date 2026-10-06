/** Stemmer plakaten med videoens foerste ramme? Et avvik gir et synlig hopp
 *  i det oeyeblikket videoen tar over. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os"; import { join } from "node:path";
for (const id of process.argv.slice(2)) {
  const tmp = mkdtempSync(join(tmpdir(),"pl-"));
  try {
    execFileSync("ffmpeg",["-v","error","-i",`public/scener/${id}-1920.mp4`,"-frames:v","1","-vf","scale=400:-2",join(tmp,"v.png"),"-y"]);
    execFileSync("ffmpeg",["-v","error","-i",`public/scener/${id}-poster.avif`,"-vf","scale=400:-2",join(tmp,"p.png"),"-y"]);
    const ut = execFileSync("ffmpeg",["-v","error","-i",join(tmp,"v.png"),"-i",join(tmp,"p.png"),
      "-filter_complex","blend=all_mode=difference,signalstats,metadata=print:file=-","-f","null","-"],
      {encoding:"utf8",stdio:["ignore","pipe","pipe"]});
    const v = +(ut.match(/YAVG=([\d.]+)/)?.[1] ?? 0);
    console.log(`  ${id.padEnd(20)} avvik ${v.toFixed(2)} av 255  ${v < 2 ? "stemmer" : "HOPPER"}`);
  } finally { rmSync(tmp,{recursive:true,force:true}); }
}
