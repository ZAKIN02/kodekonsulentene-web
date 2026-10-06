#!/usr/bin/env node
/**
 * Bytter stillbildet mot klippet på /om, /caser og /status.
 *
 * Demo og ikke SceneFilm: SceneFilm er `position: absolute; inset: 0` – en
 * bakgrunn bak en seksjon, med maske og tekst oppå. De tre bildene her står
 * INLINE i tekstflyten, inne i en <Avslor>. Å gjøre dem til bakgrunner ville
 * krevd at seksjonene bygges om, og ville innført nøyaktig den kontrastrisikoen
 * som har brutt fire sider i dag – én så lavt som 1,31:1. Demo rammer filmen i
 * sin egen flate med hårlinje og radius, og ingen tekst ligger over den. Da kan
 * kontrasten ikke svikte.
 *
 * `kilde` settes IKKE. Demo er skrevet for ekte skjermopptak, og datoen der leser
 * som belegg for en måling. Dette er generert materiale, og bildeteksten sier hva
 * man ser uten å påstå at noe er målt.
 */
import { readFileSync, writeFileSync } from "node:fs";

const ENDRINGER = [
  {
    fil: "src/pages/om.astro",
    id: "lev-om",
    gammel: /\s*\{\/\* Materiale, ikke mennesker\.[\s\S]*?\*\/\}\n\s*<Stillbilde id="nart"[^/]*\/>/,
    tekst: "Kantene på hvert lag i den samme stabelen. Den grønne linjen vandrer innover gjennom lagene, ett om gangen.",
  },
  {
    fil: "src/pages/caser.astro",
    id: "lev-caser",
    gammel: /\s*\{\/\* Leser som en portefølje[\s\S]*?\*\/\}\n\s*<Stillbilde id="rekke"[^/]*\/>/,
    tekst: "Fire stabler, én tent. Linjen tegner seg bare på den nærmeste – de tre bak finnes, men er ikke noe vi kan vise fram ennå.",
  },
  {
    fil: "src/pages/status.astro",
    id: "lev-status",
    gammel: /\s*\{\/\* Linjen er ubrutt bare fordi[\s\S]*?\*\/\}\n\s*<Stillbilde id="side-status"[^/]*\/>/,
    tekst: "Linjen tegner seg nedover kantene. Den blir ubrutt bare fordi hvert lag ligger der det skal.",
  },
];

for (const e of ENDRINGER) {
  let s = readFileSync(e.fil, "utf8");
  if (!e.gammel.test(s)) { console.error(`  ${e.fil}: fant ikke stillbildet – ingen endring`); continue; }

  const innrykk = e.fil.includes("status") ? "      " : "      ";
  const ny = `
${innrykk}{/* Ekte bevegelse, ikke et stillbilde. Bare LYSET endrer seg mellom første og
${innrykk}    siste ramme – geometrien står bom stille, så Kling har ingenting å morfe.
${innrykk}    Det er den tekniske grunnen til at klippet ikke ser ut som billig AI-video. */}
${innrykk}<Demo
${innrykk}  smal="/scener/${e.id}-960.mp4"
${innrykk}  bred="/scener/${e.id}-1280.mp4"
${innrykk}  stor="/scener/${e.id}-1920.mp4"
${innrykk}  plakat="/scener/${e.id}-poster.avif"
${innrykk}  tekst="${e.tekst}"
${innrykk}/>`;

  s = s.replace(e.gammel, ny);

  // Demo inn, Stillbilde ut hvis den ikke lenger brukes.
  if (!s.includes("import Demo ")) {
    const dyp = e.fil.includes("/pages/") && e.fil.split("/").length > 3 ? "../" : "../";
    s = s.replace(/^(import Stillbilde from "[^"]+";)$/m, `$1\nimport Demo from "${dyp}components/Demo.astro";`);
  }
  if (!/<Stillbilde\b/.test(s)) {
    s = s.replace(/^import Stillbilde from "[^"]+";\n/m, "");
  }
  writeFileSync(e.fil, s);
  console.log(`  ${e.fil}: ${e.id} koblet inn`);
}
