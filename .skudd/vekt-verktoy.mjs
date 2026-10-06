/** Summerer content-length synkront per side. Et tidligere forsøk brukte
 *  await response.body() og lukket siden før halvparten var lest – «18 kB»
 *  på en side med 65 kB HTML. */
import { chromium } from "@playwright/test";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const s of sider) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  let byte = 0;
  const typer = {};
  p.on("response", (r) => {
    const n = +(r.headers()["content-length"] ?? 0);
    byte += n;
    const t = r.request().resourceType();
    typer[t] = (typer[t] ?? 0) + n;
  });
  await p.goto(base + s, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const topp = Object.entries(typer).sort((a, c) => c[1] - a[1]).slice(0, 3)
    .map(([t, n]) => `${t} ${Math.round(n / 1024)}`).join(", ");
  console.log(`  ${s.padEnd(28)} ${String(Math.round(byte / 1024)).padStart(5)} kB   (${topp})`);
  await ctx.close();
}
await b.close();
