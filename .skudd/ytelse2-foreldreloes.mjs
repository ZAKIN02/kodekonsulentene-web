/** Mediefiler i public/ som ingen bygget side refererer. Sletting er irreversibel
 *  der masteren mangler, saa master-status staar i kolonnen. */
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const filer = [];
(function gaa(d) { for (const n of readdirSync(d)) { const p = join(d, n);
  statSync(p).isDirectory() ? gaa(p) : filer.push(p); } })("public");
const html = [];
(function gaa(d) { for (const n of readdirSync(d)) { const p = join(d, n);
  if (statSync(p).isDirectory()) gaa(p); else if (/\.(html|js|json)$/.test(n)) html.push(p); } })("dist");
const alt = html.map((f) => readFileSync(f, "utf8")).join("\n") +
            readdirSync("src/data").map((f) => readFileSync(join("src/data", f), "utf8")).join("\n");
const mastere = existsSync("assets/mastere") ? readdirSync("assets/mastere") : [];
let sum = 0;
for (const f of filer) {
  if (!/\.(mp4|webm|avif|webp|png|jpg|woff2)$/.test(f)) continue;
  const navn = f.split("/").pop();
  if (alt.includes(navn)) continue;
  const kb = Math.round(statSync(f).size / 1024);
  sum += kb;
  const stamme = navn.replace(/-(\d+|poster)\.\w+$/, "");
  const m = mastere.find((x) => x.startsWith(stamme));
  console.log(`  ${String(kb).padStart(6)}kB  ${f}   ${m ? "master: " + m : "INGEN MASTER – ikke slett"}`);
}
console.log(`  ------\n  ${sum} kB foreldreloest totalt`);
