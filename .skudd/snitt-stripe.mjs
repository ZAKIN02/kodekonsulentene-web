/** Ekte visningsbilder gjennom tegningen, sydd sammen. IKKE fullPage – det
 *  fotograferer scroll-drevne elementer ved scroll 0, altsaa med opacity 0. */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
const [url, velger, ut, ...rest] = process.argv.slice(2);
const n = Number(rest[0] || 5);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const top = await p.evaluate((v) => document.querySelector(v).getBoundingClientRect().top + scrollY, velger);
const filer = [];
for (let i = 0; i < n; i++) {
  // Fra like foer figuren kommer inn, til den er ferdig tegnet.
  const y = Math.round(top - 820 + (i / (n - 1)) * 760);
  await p.evaluate((v) => scrollTo(0, v), Math.max(0, y));
  await p.waitForTimeout(220);
  const r = await p.evaluate((v) => { const q = document.querySelector(v).getBoundingClientRect();
    return { x: 0, y: Math.max(0, q.top - 8), width: 1400, height: Math.min(900 - Math.max(0, q.top - 8), q.height + 16) }; }, velger);
  if (r.height < 40) continue;
  const f = `/tmp/snitt-f${i}.png`;
  await p.screenshot({ path: f, clip: r });
  filer.push(f);
}
execFileSync("ffmpeg", ["-v", "error", ...filer.flatMap((f) => ["-i", f]),
  "-filter_complex", `vstack=inputs=${filer.length}`, ut, "-y"]);
console.log(`  ${filer.length} rammer -> ${ut}`);
await b.close();
