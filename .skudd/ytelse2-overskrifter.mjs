/** Overskriftsrekkefoelge lest rett ut av bygget HTML. Deterministisk – ingen
 *  nettleser, ingen animasjon som kan forstyrre. Et hopp fra h2 til h4 er et
 *  brudd paa WCAG 1.3.1 og koster poeng i Lighthouse. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const rot = "dist/client";
const filer = [];
(function gaa(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) gaa(p);
    else if (n === "index.html") filer.push(p);
  }
})(rot);

for (const f of filer.sort()) {
  const side = "/" + f.slice(rot.length + 1).replace(/\/?index\.html$/, "");
  if (side.includes("/lab")) continue;
  const html = readFileSync(f, "utf8");
  const niv = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  const hopp = [];
  for (let i = 1; i < niv.length; i++) if (niv[i] > niv[i - 1] + 1) hopp.push(`h${niv[i - 1]}->h${niv[i]} (nr ${i + 1})`);
  const h1 = niv.filter((n) => n === 1).length;
  if (hopp.length || h1 !== 1)
    console.log(`  ${side.padEnd(32)} h1:${h1}  ${hopp.join("  ")}`);
}
console.log("  (bare sider med avvik er listet)");
