/** Totale byte over nett ved førstelast, uten scroll. Summerer content-length
 *  synkront i response-hendelsen – await response.body() er asynkront, og en
 *  tidligere agent fikk 18 kB på en side med 65 kB HTML fordi siden rakk å lukkes
 *  før halvparten av svarene var lest. Egen context per side, så HTTP-cachen ikke
 *  gjør måling nummer to til et andregangsbesøk. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const s of sider) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  let sum = 0, video = 0;
  p.on("response", (r) => {
    const n = Number(r.headers()["content-length"] || 0);
    sum += n;
    if (/\.mp4$/.test(r.url())) video += n;
  });
  await p.goto(base + s, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  console.log(`  ${s.padEnd(12)} ${(sum / 1024).toFixed(0).padStart(6)} kB  (video ${(video / 1024).toFixed(0)} kB)`);
  await ctx.close();
}
await b.close();
