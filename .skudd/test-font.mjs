import { readFileSync } from "node:fs";
import * as wawoff from "wawoff2";
const w = readFileSync("public/fonts/schibsted-grotesk-700_800-latin.woff2");
const ttf = Buffer.from(await wawoff.decompress(w));
console.log("woff2:", w.length, "→ ttf:", ttf.length, "| magic:", ttf.subarray(0,4).toString("hex"));
