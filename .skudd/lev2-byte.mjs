import { chromium } from "playwright";
const b = await chromium.launch();
for (const side of process.argv.slice(3)) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  let sum = 0;
  p.on("response", (r) => { const c = r.headers()["content-length"]; if (c) sum += +c; });
  await p.goto(process.argv[2] + side, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  console.log(`  ${side.padEnd(24)} ${Math.round(sum / 1024)} kB`);
  await ctx.close();
}
await b.close();
