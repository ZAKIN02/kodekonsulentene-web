import { readFileSync, writeFileSync } from "node:fs";
import * as wawoff from "wawoff2";
for (const [woff2, ut] of [["schibsted-grotesk-700_800-latin","sg-var"],["jetbrains-mono-400_600-latin","jm-var"]]) {
  writeFileSync(`.skudd/${ut}.ttf`, Buffer.from(await wawoff.decompress(readFileSync(`public/fonts/${woff2}.woff2`))));
}
console.log("variable TTF skrevet");
