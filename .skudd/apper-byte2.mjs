// Summerer content-length SYNKRONT i hendelsen. `await response.body()` er
// asynkront, og siden rakk å lukkes før halvparten av svarene var lest – det ga
// 18 kB for en side med 65 kB HTML. Et tall som er umulig, er en målefeil.
import { chromium, devices } from "@playwright/test";
for (const blokker of [false, true]) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices["Pixel 7"] });
  const p = await ctx.newPage();
  if (blokker) await p.route("**/{scener,bilder}/**", (r) => r.abort());
  let sum = 0; const poster = [];
  p.on("response", (r) => {
    const n = Number(r.headers()["content-length"] ?? 0);
    sum += n;
    if (n > 50000) poster.push(`${(n / 1024).toFixed(0)} kB ${new URL(r.url()).pathname}`);
  });
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  console.log(`  mobil ${blokker ? "uten medier" : "med medier "}  ${(sum / 1024).toFixed(0)} kB`);
  for (const s of poster) console.log(`      ${s}`);
  await b.close();
}
