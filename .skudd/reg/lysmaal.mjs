/** Måler bakgrunnslysstyrke i venstre/midt/høyre tredel, og verste kontrast mot
 *  hvit tekst. Avgjør hvor typografi kan ligge på hvert register. */
import sharp from "sharp";
const rel = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * rel(r) + 0.7152 * rel(g) + 0.0722 * rel(b);
for (const f of process.argv.slice(2)) {
  const im = sharp(f);
  const { width: w, height: h } = await im.metadata();
  const ut = [];
  for (let i = 0; i < 3; i++) {
    const { data } = await sharp(f)
      .extract({ left: Math.floor((w / 3) * i), top: 0, width: Math.floor(w / 3), height: h })
      .raw().toBuffer({ resolveWithObject: true });
    let sum = 0, verst = 0, n = 0;
    for (let p = 0; p < data.length; p += 3) {
      const L = lum(data[p], data[p + 1], data[p + 2]);
      sum += L; n++;
      if (L > verst) verst = L;
    }
    const snitt = sum / n;
    // Kontrast hvit tekst (L=1) mot snitt og mot lyseste piksel.
    ut.push(`${(1.05 / (snitt + 0.05)).toFixed(1)}:1 snitt, ${(1.05 / (verst + 0.05)).toFixed(1)}:1 verst`);
  }
  console.log(`${f.split("/").pop().padEnd(28)} venstre ${ut[0]} | midt ${ut[1]} | høyre ${ut[2]}`);
}
