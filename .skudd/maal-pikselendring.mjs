/**
 * Måler FAKTISK pikselendring gjennom et klipp, ikke scene_score.
 *
 * scene_score oppdager sceneskift, ikke tekst som skrives fram. På terminal-
 * opptaket rapporterte den 0,0000 for hvert eneste sekund – i et klipp der både
 * kommandoer og svar kom til syne. Den skjulte også en halvannet sekund lang
 * dødsone mellom to kommandoer.
 *
 * Bruk: node .skudd/maal-pikselendring.mjs <fil> [rammer-per-sekund]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [fil, fps = "2"] = process.argv.slice(2);
if (!fil) { console.error("Bruk: node .skudd/maal-pikselendring.mjs <fil> [fps]"); process.exit(1); }

const tmp = mkdtempSync(join(tmpdir(), "pikselendring-"));
try {
  execFileSync("ffmpeg", ["-v", "error", "-i", fil, "-vf", `fps=${fps},scale=480:-2`, join(tmp, "f%03d.png"), "-y"]);
  const rammer = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  const varighet = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", fil]).toString().trim();
  let doede = 0;
  for (let i = 1; i < rammer.length; i++) {
    const ut = execFileSync("ffmpeg", ["-v", "error", "-i", join(tmp, rammer[i - 1]), "-i", join(tmp, rammer[i]),
      "-filter_complex", "blend=all_mode=difference,signalstats,metadata=print:file=-", "-f", "null", "-"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const m = ut.match(/YAVG=([\d.]+)/);
    const v = m ? +m[1] : 0;
    const t = (i / +fps).toFixed(1);
    const pst = Math.round((i / +fps / varighet) * 100);
    // Under 0,01 er praktisk talt frosset: et stillbilde med komprimeringsstøy.
    const merke = v < 0.01 ? "  ← frosset" : v > 1 ? "  ← beat" : "";
    if (v < 0.01) doede++;
    console.log(`  ${String(t).padStart(5)}s (${String(pst).padStart(3)}%)  ${v.toFixed(4).padStart(9)}${merke}`);
  }
  console.log(`\n  ${doede} av ${rammer.length - 1} intervaller er frosset.`);
} finally { rmSync(tmp, { recursive: true, force: true }); }
