import { readFileSync } from "node:fs";
import * as wawoff from "wawoff2";
for (const f of ["schibsted-grotesk-700_800-latin", "jetbrains-mono-400_600-latin"]) {
  const ttf = Buffer.from(await wawoff.decompress(readFileSync(`public/fonts/${f}.woff2`)));
  const antall = ttf.readUInt16BE(4);
  const tabeller = [];
  for (let i = 0; i < antall; i++) tabeller.push(ttf.subarray(12 + i*16, 12 + i*16 + 4).toString("latin1"));
  console.log(f);
  console.log("  tabeller:", tabeller.join(" "));
  console.log("  variabel (fvar):", tabeller.includes("fvar") ? "JA" : "nei", "| name-tabell:", tabeller.includes("name") ? "ja" : "MANGLER");
}
