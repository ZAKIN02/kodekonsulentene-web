import { chromium } from "playwright";
const b = await chromium.launch();
for (const [navn, w, h] of [["mobil",390,844],["skrivebord",1512,850]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1 });
  const p = await ctx.newPage();
  let sum = 0;
  p.on("response", async (r) => { const l = +(r.headers()["content-length"] || 0); sum += l; });
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  console.log(`  ${navn.padEnd(11)} ${Math.round(sum/1024)} kB uten scroll`);
  await ctx.close();
}
await b.close();
