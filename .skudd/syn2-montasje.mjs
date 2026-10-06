/** Setter start/midt/slutt side om side per scene, så morph blir synlig i ett blikk. */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";
const scener = process.argv.slice(2);
const B = 640, H = 360, pad = 6;
const ark = new PNG({ width: 3 * B + 4 * pad, height: scener.length * (H + pad) + pad });
ark.data.fill(20);
scener.forEach((n, row) => {
  ["0", "50", "99"].forEach((pct, col) => {
    let im;
    try { im = PNG.sync.read(readFileSync(`.skudd/syn2/${n}-${pct}.png`)); } catch { return; }
    const ox = pad + col * (B + pad), oy = pad + row * (H + pad);
    for (let y = 0; y < Math.min(H, im.height); y++)
      for (let x = 0; x < Math.min(B, im.width); x++) {
        const s = (im.width * y + x) << 2, d = (ark.width * (oy + y) + ox + x) << 2;
        ark.data[d] = im.data[s]; ark.data[d+1] = im.data[s+1]; ark.data[d+2] = im.data[s+2]; ark.data[d+3] = 255;
      }
  });
});
writeFileSync(".skudd/syn2/montasje.png", PNG.sync.write(ark));
console.log("rader (topp->bunn):", scener.join(", "));
