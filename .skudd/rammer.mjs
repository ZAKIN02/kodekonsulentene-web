import { chromium } from "playwright";
const [url, fil, ut] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 600) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(140); }
await p.waitForTimeout(1200);
const v = (await p.$$("video")).find(async () => true);
const h = await p.$$("video");
let mål = null;
for (const el of h) { const s = await el.evaluate(e => e.currentSrc || ""); if (s.includes(fil)) mål = el; }
if (!mål) { console.log("fant ikke", fil); await b.close(); process.exit(0); }
await mål.scrollIntoViewIfNeeded();
await mål.evaluate(e => new Promise(ok => {
  if (e.readyState >= 1 && isFinite(e.duration)) return ok();
  e.addEventListener("loadedmetadata", ok, { once: true });
  setTimeout(ok, 6000);
}));
await p.waitForTimeout(600);
const png = await mål.evaluate(async (el) => {
  const c = document.createElement("canvas"); c.width = 1200; c.height = 169;
  const g = c.getContext("2d");
  const d = el.duration;
  for (let i = 0; i < 5; i++) {
    el.currentTime = Math.min(d - 0.05, (i / 4) * d);
    await new Promise(ok => el.addEventListener("seeked", ok, { once: true }));
    g.drawImage(el, i * 240, 0, 240, 169);
  }
  return c.toDataURL("image/png");
});
const { writeFileSync } = await import("node:fs");
writeFileSync(ut, Buffer.from(png.split(",")[1], "base64"));
console.log("lagret", ut);
await b.close();
