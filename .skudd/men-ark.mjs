/** MEN-ARK: limer N viewport-skudd til ett kontaktark som kan leses med Read.
 *
 *  To moduser:
 *    last <url> <navn> last            – 8 skudd over 2,1 s etter last, ingen scroll
 *    scroll <url> <navn> scroll [y0] [y1] – 8 skudd mellom to scroll-posisjoner
 *    el <url> <navn> el <selector>     – 8 skudd mens ETT element passerer vinduet
 *
 *  Aldri fullPage: fullPage fotograferer scroll-drevne elementer på opasitet 0.
 *  Bruk: node .skudd/men-ark.mjs <url> <navn> <modus> [a] [b]
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [url, navn, modus = "last", a, c] = process.argv.slice(2);
const N = 8;
const DIR = ".skudd/mening";
mkdirSync(DIR, { recursive: true });

const tema = process.env.TEMA === "lys" ? "light" : "dark";
const b = await chromium.launch();
const p = await b.newPage({
  viewport: { width: Number(process.env.VB || 1280), height: Number(process.env.VH || 800) },
  colorScheme: tema,
  reducedMotion: process.env.ROLIG ? "reduce" : "no-preference",
  javaScriptEnabled: process.env.UTENJS ? false : true,
});
const filer = [];

if (modus === "last") {
  await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  if (a) await p.evaluate((v) => scrollTo({ top: +v, behavior: "instant" }), a);
  if (process.env.START) await p.waitForTimeout(Number(process.env.START));
  for (let i = 0; i < N; i++) {
    const f = join(DIR, `${navn}-r${i}.png`);
    await p.screenshot({ path: f });
    filer.push(f);
    await p.waitForTimeout(Number(process.env.STEG || 300));
  }
} else if (modus === "el") {
  await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  await p.waitForTimeout(400);
  const g = await p.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + scrollY, h: r.height };
  }, a);
  if (!g) { console.log(`  fant ikke ${a}`); await b.close(); process.exit(1); }
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    // Fra elementet så vidt under vinduet til det er helt over toppen
    await p.evaluate((y) => scrollTo({ top: Math.max(0, Math.round(y)), behavior: "instant" }),
      g.top - (Number(process.env.VH || 800)) + (g.h + Number(process.env.VH || 800)) * t);
    await p.waitForTimeout(260);
    const f = join(DIR, `${navn}-r${i}.png`);
    await p.screenshot({ path: f });
    filer.push(f);
  }
} else {
  await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  await p.waitForTimeout(500);
  const y0 = Number(a || 0);
  const y1 = Number(c || (await p.evaluate(() => document.documentElement.scrollHeight - 800)));
  for (let i = 0; i < N; i++) {
    await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), Math.round(y0 + (y1 - y0) * (i / (N - 1))));
    await p.waitForTimeout(260);
    const f = join(DIR, `${navn}-r${i}.png`);
    await p.screenshot({ path: f });
    filer.push(f);
  }
}
await b.close();

const ark = join(DIR, `${navn}-ark.png`);
execFileSync("ffmpeg", ["-v", "error", "-y",
  ...filer.flatMap((f) => ["-i", f]),
  "-filter_complex",
  `${filer.map((_, i) => `[${i}:v]scale=440:-1,drawtext=text='${i}':x=8:y=8:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.7[v${i}]`).join(";")};${filer.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${N}:layout=0_0|w0_0|w0+w1_0|w0+w1+w2_0|0_h0|w0_h0|w0+w1_h0|w0+w1+w2_h0[ut]`,
  "-map", "[ut]", ark]);
console.log(`  ark: ${ark}`);
