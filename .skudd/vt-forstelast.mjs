/** Byte ved FØRSTE last, uten scroll. Filmen har preload="none" og lastes av en
 *  IntersectionObserver, så den skal ikke telle med her. */
import { chromium, devices } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["Pixel 7"] });
for (const rute of process.argv.slice(3)) {
  const p = await ctx.newPage();
  let total = 0, video = 0;
  p.on("response", async (r) => { try { const x = await r.body(); total += x.length; if ((r.headers()["content-type"] ?? "").includes("video")) video += x.length; } catch {} });
  await p.goto(base + rute, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  console.log(`${rute.padEnd(26)} førstelast ${(total / 1024).toFixed(0).padStart(5)} kB   video ${(video / 1024).toFixed(0)} kB`);
  await p.close();
}
await b.close();
