/**
 * Sjekker at hver UTGAAENDE lenke faktisk foerer et sted.
 *
 * Dette finnes fordi «Book 20 minutter» – den viktigste knappen paa nettstedet, paa
 * 39 sider – pekte paa cal.com/kodekonsulentene/20min, som ga 404. Hendelsen fantes
 * aldri. Vi testet at lenken var der, aldri at den virket.
 *
 * Kjoeres mot dist/client, ikke mot nettet, saa den finner lenker paa sider som
 * ikke er deployet ennaa.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const rot = "dist/client";
const filer = [];
(function gaa(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? gaa(p) : p.endsWith(".html") && filer.push(p);
  }
})(rot);

const lenker = new Map(); // url -> sider
for (const f of filer) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const u = m[1].replace(/&amp;/g, "&");
    // 404-sida lenker til seg selv via canonical. Det SKAL gi 404.
    if (u.endsWith("/404/") || u.endsWith("/404")) continue;
    if (!lenker.has(u)) lenker.set(u, []);
    lenker.get(u).push(f.replace(rot, "").replace("/index.html", "") || "/");
  }
}

const doede = [];
const koe = [...lenker.keys()];
async function sjekk(u) {
  for (const metode of ["HEAD", "GET"]) {
    try {
      const r = await fetch(u, { method: metode, redirect: "follow",
        headers: { "user-agent": "KodeKonsulentene-lenkesjekk" },
        signal: AbortSignal.timeout(15000) });
      // Noen tjenere avviser HEAD, derfor andre runde med GET.
      if (r.status === 405 && metode === "HEAD") continue;
      return r.status;
    } catch (e) { if (metode === "GET") return `feil: ${String(e.message).slice(0, 40)}`; }
  }
}
// Fire om gangen – vi skal ikke hamre paa andres tjenere.
for (let i = 0; i < koe.length; i += 4) {
  const bolk = koe.slice(i, i + 4);
  const svar = await Promise.all(bolk.map(sjekk));
  bolk.forEach((u, j) => {
    const s = svar[j];
    if (typeof s !== "number" || s >= 400) doede.push({ u, s, sider: lenker.get(u) });
  });
}

console.log(`  ${lenker.size} unike utgaaende lenker paa ${filer.length} sider`);
if (!doede.length) console.log("  alle svarer");
for (const d of doede)
  console.log(`  DOED ${d.s}  ${d.u}\n        paa ${d.sider.length} side(r): ${[...new Set(d.sider)].slice(0, 4).join(", ")}`);
process.exit(doede.length ? 1 : 0);
