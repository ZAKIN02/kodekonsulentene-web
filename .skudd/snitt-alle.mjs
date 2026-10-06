import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1400, height: 950 }, colorScheme: "dark", reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4711/lab/svg", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
const filer = [];
for (let i = 0; i < 3; i++) {
  const r = await p.evaluate((idx) => {
    const f = document.querySelectorAll(".snitt")[idx];
    f.scrollIntoView({ block: "center" });
    const q = f.getBoundingClientRect();
    return { x: 0, y: Math.max(0, q.top - 10), width: 1400, height: Math.min(950 - Math.max(0, q.top - 10), q.height + 20) };
  }, i);
  await p.waitForTimeout(250);
  const f = `/tmp/snitt-v${i}.png`;
  await p.screenshot({ path: f, clip: r });
  filer.push(f);
}
execFileSync("ffmpeg", ["-v","error", ...filer.flatMap((f) => ["-i", f]),
  "-filter_complex", `vstack=inputs=${filer.length}`, ".skudd/snitt-morkt.png", "-y"]);
console.log(`  ${filer.length} varianter -> .skudd/snitt-morkt.png`);
await b.close();
