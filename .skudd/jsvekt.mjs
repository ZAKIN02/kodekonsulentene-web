import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
const fil = process.argv[2] ?? "dist/client/index.html";
const html = readFileSync(fil, "utf8");
let tot = 0;
for (const m of html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)) {
  const p = "dist/client" + m[1];
  if (existsSync(p)) {
    const g = gzipSync(readFileSync(p), { level: 9 }).length;
    tot += g;
    console.log("  %s %s kB", m[1].padEnd(44), (g / 1024).toFixed(1));
  } else console.log("  %s (ekstern/mangler)", m[1]);
}
let inline = 0;
for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (/application\/ld\+json/.test(m[1])) continue;
  inline += gzipSync(Buffer.from(m[2]), { level: 9 }).length;
}
console.log("  %s %s kB", "inline".padEnd(44), (inline / 1024).toFixed(1));
console.log("  SUM %s kB gzip -> %s", ((tot + inline) / 1024).toFixed(1), tot + inline <= 15360 ? "OK" : "OVER 15 kB");
