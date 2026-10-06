/** Hvor stort er utslaget fra foerste til siste ramme?
 *  Pikselendring per intervall sier at noe skjer; dette sier om det
 *  SAMLEDE utslaget er stort nok til aa leses bak tekst. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
for (const fil of process.argv.slice(2)) {
  const tmp = mkdtempSync(join(tmpdir(), "utslag-"));
  try {
    const d = +execFileSync("ffprobe",["-v","error","-show_entries","format=duration","-of","csv=p=0",fil]).toString().trim();
    execFileSync("ffmpeg",["-v","error","-ss",String(d*0.05),"-i",fil,"-frames:v","1","-vf","scale=480:-2",join(tmp,"a.png"),"-y"]);
    execFileSync("ffmpeg",["-v","error","-ss",String(d*0.93),"-i",fil,"-frames:v","1","-vf","scale=480:-2",join(tmp,"b.png"),"-y"]);
    const ut = execFileSync("ffmpeg",["-v","error","-i",join(tmp,"a.png"),"-i",join(tmp,"b.png"),
      "-filter_complex","blend=all_mode=difference,signalstats,metadata=print:file=-","-f","null","-"],
      {encoding:"utf8",stdio:["ignore","pipe","pipe"]});
    const snitt = +(ut.match(/YAVG=([\d.]+)/)?.[1] ?? 0);
    const topp  = +(ut.match(/YMAX=([\d.]+)/)?.[1] ?? 0);
    const dom = snitt >= 6 ? "tydelig" : snitt >= 3 ? "svakt" : "nesten ingenting";
    console.log(`  ${fil.replace("public/","").padEnd(38)} snitt ${snitt.toFixed(2).padStart(6)}  topp ${String(topp).padStart(3)}   ${dom}`);
  } finally { rmSync(tmp,{recursive:true,force:true}); }
}
