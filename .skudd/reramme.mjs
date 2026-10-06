/** Omrammer en scene fra masteren: flytter motivet inn i baandet masken viser.
 *
 * Scenene sikkerhet/nettsider/priser er definert i assets/prompter/under.json,
 * som hoerer til scripts/scene-under.mjs. Denne gjoer bare omenkodingen fra
 * masteren vi allerede har, med samme CRF og -g 8, saa ingenting genereres paa nytt.
 *
 *   node .skudd/reramme.mjs <id> <mappe> <forskyv%> [skala] [bredder...]
 */
import { execFileSync } from "node:child_process";
const [id, mappe, forskyvRaa, skalaRaa, ...bredderRaa] = process.argv.slice(2);
const forskyv = Number(forskyvRaa), skala = Number(skalaRaa || 1);
const bredder = bredderRaa.length ? bredderRaa.map(Number) : [2560, 1920, 1280];
const CRF = { 2560: "20", 1920: "19", 1280: "19", 960: "19" };
const master = `assets/mastere/${id}-master.mp4`;
const ledd = [];
if (skala !== 1) ledd.push(`scale=iw*${skala}:ih*${skala}`,
  `pad=w=iw/${skala}:h=ih/${skala}:x=(ow-iw)/2:y=(oh-ih)/2:color=0x0b0d10`);
if (forskyv) ledd.push(`pad=w=iw+iw*${forskyv}/100:h=ih:x=iw*${forskyv}/100:y=0:color=0x0b0d10`,
  `crop=w=iw/(1+${forskyv}/100):h=ih:x=0:y=0`);
for (const b of bredder) {
  const fil = `public/${mappe}/${id}-${b}.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-i", master, "-vf",
    `${ledd.join(",")}${ledd.length ? "," : ""}scale=${b}:-2:flags=lanczos,fps=24`,
    "-c:v", "libx264", "-preset", "slow", "-crf", CRF[b] ?? "19",
    "-g", "8", "-keyint_min", "8", "-sc_threshold", "0",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-y", fil]);
  const bytes = Number(execFileSync("stat", ["-f%z", fil]).toString().trim());
  const sek = Number(execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",fil]).toString().trim());
  console.log(`  ${fil}  ${(bytes/1024).toFixed(0)} kB  ${((bytes*8)/sek/1e6).toFixed(2)} Mbit/s`);
}
