/** Hvor i tidslinjen ligger bevegelsen i et klipp? Finner klipp der alt er over
 *  foer man rekker aa se det, og klipp som staar stille mesteparten av tiden. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os"; import { join } from "node:path";
const filer = process.argv.slice(2);
for (const fil of filer) {
  const tmp = mkdtempSync(join(tmpdir(), "kp-"));
  try {
    const varighet = +execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0",fil]).toString().trim();
    execFileSync("ffmpeg", ["-v","error","-i",fil,"-vf","fps=4,scale=320:-2",join(tmp,"f%04d.png"),"-y"]);
    const r = readdirSync(tmp).filter(f=>f.endsWith(".png")).sort();
    const v = [];
    for (let i=1;i<r.length;i++){
      const ut = execFileSync("ffmpeg",["-v","error","-i",join(tmp,r[i-1]),"-i",join(tmp,r[i]),"-filter_complex","blend=all_mode=difference,signalstats,metadata=print:file=-","-f","null","-"],{encoding:"utf8",stdio:["ignore","pipe","pipe"]});
      const m = ut.match(/YAVG=([\d.]+)/); v.push(m?+m[1]:0);
    }
    const sum = v.reduce((a,b)=>a+b,0);
    let akk=0, p50=null, p90=null;
    v.forEach((x,i)=>{akk+=x; const andel=(i+1)/v.length;
      if(p50===null&&akk>=sum*0.5)p50=andel; if(p90===null&&akk>=sum*0.9)p90=andel;});
    const frosne = v.filter(x=>x<0.01).length;
    const kb = Math.round(execFileSync("stat",["-f%z",fil]).toString().trim()/1024);
    console.log(`${fil.split("/").slice(-1)[0].padEnd(26)} ${varighet.toFixed(1)}s ${String(kb).padStart(5)}kB  halv bevegelse foer ${(p50*100).toFixed(0)}%  90% foer ${(p90*100).toFixed(0)}%  frosne ${frosne}/${v.length}  snitt ${(sum/v.length).toFixed(3)}`);
  } catch(e){ console.log(fil, "FEIL", String(e).slice(0,80)); }
  finally { rmSync(tmp,{recursive:true,force:true}); }
}
