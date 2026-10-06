/**
 * Måler totale byte over nett per side, slik en mobil faktisk henter dem.
 * Scroller hele siden så lat-lastet media rekker å starte.
 */
import { chromium, devices } from "playwright";

const base = process.argv[2];
const ruter = process.argv.slice(3);
const nettleser = await chromium.launch();
const ctx = await nettleser.newContext({ ...devices["Pixel 7"] });

for (const rute of ruter) {
  const side = await ctx.newPage();
  const sett = new Map();
  side.on("response", async (r) => {
    try {
      const b = await r.body();
      const t = (r.headers()["content-type"] ?? "").split(";")[0];
      sett.set(r.url(), { bytes: b.length, type: t });
    } catch {}
  });
  await side.goto(base + rute, { waitUntil: "load" });
  // Scroll gjennom hele siden, så IntersectionObserver rekker å utløse.
  await side.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
  });
  await side.waitForTimeout(2500);
  let total = 0; const perType = {};
  for (const { bytes, type } of sett.values()) {
    total += bytes;
    perType[type] = (perType[type] ?? 0) + bytes;
  }
  const video = perType["video/mp4"] ?? 0;
  const topp = Object.entries(perType).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([t, b]) => `${t} ${(b / 1024).toFixed(0)}k`).join("  ");
  console.log(`${rute.padEnd(28)} ${(total / 1024).toFixed(0).padStart(6)} kB   video ${(video / 1024).toFixed(0).padStart(5)} kB   ${topp}`);
  await side.close();
}
await nettleser.close();
