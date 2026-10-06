import { chromium } from "playwright";
const b = await chromium.launch();
const bilder = [];
for (const s of ["/om","/sikkerhet","/apper-og-ai"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4800" + s, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const f = `/tmp/fold${s.replace(/\//g,"_")}.png`;
  await p.screenshot({ path: f });
  bilder.push(f);
  await ctx.close();
}
console.log(bilder.join(" "));
await b.close();
