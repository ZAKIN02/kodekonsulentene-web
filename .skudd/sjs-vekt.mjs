import { chromium } from "playwright";
const b = await chromium.launch();
const s = await b.newPage({ viewport: { width: 1440, height: 900 } });
let bytes = 0; const per = {};
s.on("response", async (r) => {
  try { const h = r.headers()["content-length"]; const n = h ? Number(h) : (await r.body()).length;
    bytes += n; const t = new URL(r.url()).pathname.split(".").pop(); per[t] = (per[t] ?? 0) + n; } catch {}
});
await s.goto("http://127.0.0.1:4411/sjekk", { waitUntil: "networkidle" });
await s.waitForTimeout(1200);
console.log(`  /sjekk ved innlasting: ${(bytes / 1024).toFixed(0)} kB totalt`);
for (const [t, n] of Object.entries(per).sort((a, c) => c[1] - a[1])) console.log(`    ${t.padEnd(16)} ${(n / 1024).toFixed(0)} kB`);
await b.close();
