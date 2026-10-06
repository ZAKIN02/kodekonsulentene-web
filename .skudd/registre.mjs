/**
 * Lager prøvebilder for de visuelle registrene.
 *
 * Hvorfor ikke scripts/stillbilde.mjs: den rørledningen REDIGERER alltid ett fast
 * basisbilde og legger stilkortet foran hver prompt. Det er nettopp mekanismen som
 * gjorde 19 av 21 bilder like. Registrene må genereres fra tekst, uten basisbilde og
 * uten det delte stilkortet, ellers arver de monotonien de skal bryte.
 *
 * Kjør: node .skudd/registre.mjs <id>
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const NOKKEL =
  process.env.HF_CREDENTIALS ??
  (process.env.HIGGSFIELD_API_KEY && process.env.HIGGSFIELD_API_SECRET
    ? `${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}`
    : null);
if (!NOKKEL) {
  console.error("Mangler nøkkel. Sett HF_CREDENTIALS, eller HIGGSFIELD_API_KEY og _SECRET.");
  process.exit(1);
}
// SDK-en har maxPollTime 300 000 ms (5 min) som standard. Det er for kort for tunge
// jobber: klienten gir opp mens leverandøren fortsatt arbeider, og det leser som at
// genereringen «feilet». Samme verdier som scripts/scene.mjs bruker.
config({ credentials: NOKKEL, maxPollTime: 30 * 60 * 1000, pollInterval: 5000 });

const DEF = JSON.parse(readFileSync("assets/prompter/registre.json", "utf8"));
const id = process.argv[2];
const reg = DEF.registre[id];
if (!reg) {
  console.error(`Ukjent register «${id}». Finnes: ${Object.keys(DEF.registre).join(", ")}`);
  process.exit(1);
}

const tmp = ".skudd/reg-tmp";
mkdirSync(tmp, { recursive: true });
const sh = (c, a) => execFileSync(c, a, { stdio: ["ignore", "pipe", "inherit"] });
const kB = (f) => (statSync(f).size / 1024).toFixed(0);

const hurtig = join(tmp, `${id}.url`);
let url;
if (existsSync(hurtig)) {
  url = readFileSync(hurtig, "utf8").trim();
  console.log(`«${id}» … gjenbrukt URL`);
} else {
  process.stdout.write(`«${id}» (${reg.navn}, endrer ${reg.endrer}) … `);
  const r = await higgsfield.subscribe("alibaba/qwen-image-3/text-to-image", {
    input: {
      // INGEN stilkort foran. Registeret bærer sin egen stil.
      prompt: reg.stil,
      aspect_ratio: reg.forhold ?? "16:9",
      // 2k. Standard er 1280x720, som er synlig mykt i en full seksjonsbredde.
      resolution: "2k",
      negative_prompt: DEF._negativt,
    },
    withPolling: true,
  });
  if (r.status !== "completed") throw new Error(`feilet: ${r.error ?? r.status}`);
  url = r.images?.[0]?.url;
  if (!url) throw new Error(`tomt svar: ${JSON.stringify(r).slice(0, 200)}`);
  writeFileSync(hurtig, url);
  console.log("ok");
}

const raa = join(tmp, `reg-${id}-raa.png`);
sh("curl", ["-sS", "--max-time", "300", "-o", raa, url]);
mkdirSync("public/bilder", { recursive: true });
for (const b of [1600, 800]) {
  const ut = `public/bilder/reg-${id}-${b}.avif`;
  sh("npx", ["sharp-cli", "-i", raa, "-o", ut, "--format", "avif", "--quality", "62", "resize", String(b)]);
  console.log(`  ${ut}  ${kB(ut)} kB`);
}
console.log(`  råfil: ${raa}  ${kB(raa)} kB`);
