/**
 * Enkoder web-filene på nytt fra masterne i assets/mastere/, uten ping-pong.
 *
 *   node .skudd/reenkod.mjs sikkerhet priser
 *
 * Hvorfor ping-pong er feil for scroll-spolt video: spolingen knytter
 * scrollposisjon til tid, så ruller man oppover spilles bevegelsen baklengs
 * HELT AV SEG SELV. Ping-pong legger reversen inn i selve fila i tillegg, og
 * da får man bevegelsen fram og tilbake på én nedoverrulling – til dobbel
 * filstørrelse. Målt: sikkerhet-1920 gikk fra 8,49 MB (16,1 s) til under
 * halvparten uten at noe gikk tapt.
 *
 * Dette er mulig bare fordi masteren er tatt vare på. Uten den hadde eneste
 * vei vært å betale Higgsfield for ny generering.
 */
import { execFileSync } from "node:child_process";
import { statSync, existsSync } from "node:fs";

const kB = (f) => (statSync(f).size / 1024).toFixed(0);
const varighet = (f) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

for (const id of process.argv.slice(2)) {
  const master = `assets/mastere/${id}-master.mp4`;
  if (!existsSync(master)) { console.error(`mangler ${master}`); continue; }
  console.log(`${id}  (master ${kB(master)} kB, ${varighet(master).toFixed(1)} s)`);
  for (const bredde of [2560, 1920, 1280]) {
    const crf = bredde >= 2560 ? "18" : "16";
    const fil = `public/scener/${id}-${bredde}.mp4`;
    execFileSync("ffmpeg", ["-v", "error", "-i", master,
      "-vf", `scale=${bredde}:-2:flags=lanczos,fps=24`,
      "-c:v", "libx264", "-preset", "slow", "-crf", crf,
      "-g", "8", "-keyint_min", "8", "-sc_threshold", "0",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-y", fil],
      { stdio: ["ignore", "pipe", "inherit"] });
    const d = varighet(fil);
    const mbit = (statSync(fil).size * 8) / d / 1e6;
    console.log(`  ${bredde.toString().padStart(4)}  ${(kB(fil) / 1024).toFixed(2)} MB  ${mbit.toFixed(2)} Mbit/s  ${d.toFixed(1)} s  crf ${crf}`);
  }
}
