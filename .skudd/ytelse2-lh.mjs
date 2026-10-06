/**
 * Lighthouse paa alle sider, begge profiler. Ett loep per side – vi leter etter
 * sider under 95, ikke etter tredesimalers presisjon. Ustabile maalinger kjoeres
 * om med --omigjen.
 *
 *   node .skudd/ytelse2-lh.mjs <base> <profil> [sider...]
 */
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, existsSync } from "node:fs";

const [base, profil, ...sider] = process.argv.slice(2);
mkdirSync("/tmp/lh2", { recursive: true });

const flagg =
  profil === "desktop"
    ? ["--preset=desktop"]
    : ["--form-factor=mobile", "--screenEmulation.mobile", "--screenEmulation.width=390",
       "--screenEmulation.height=844", "--screenEmulation.deviceScaleFactor=2.625"];

const rad = [];
for (const s of sider) {
  const navn = (profil + s).replace(/[^a-z0-9]/gi, "_");
  const ut = `/tmp/lh2/${navn}.json`;
  try {
    execFileSync("npx", ["lighthouse", base + s,
      "--quiet", "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
      "--only-categories=performance,accessibility,best-practices,seo",
      ...flagg, "--output=json", `--output-path=${ut}`],
      { stdio: ["ignore", "ignore", "pipe"], timeout: 120000 });
  } catch (e) {
    console.log(`  ${s.padEnd(30)} FEILET: ${String(e.message).slice(0, 60)}`);
    continue;
  }
  if (!existsSync(ut)) { console.log(`  ${s.padEnd(30)} ingen rapport`); continue; }
  const d = JSON.parse(readFileSync(ut, "utf8"));
  const k = (n) => Math.round((d.categories[n]?.score ?? 0) * 100);
  const a = (n) => d.audits[n]?.numericValue ?? 0;
  const r = {
    side: s, ytelse: k("performance"), uu: k("accessibility"),
    bp: k("best-practices"), seo: k("seo"),
    lcp: Math.round(a("largest-contentful-paint")),
    cls: +a("cumulative-layout-shift").toFixed(3),
    tbt: Math.round(a("total-blocking-time")),
    kb: Math.round(a("total-byte-weight") / 1024),
  };
  rad.push(r);
  const merk = [r.ytelse, r.uu, r.bp, r.seo].some((v) => v < 95) ? "  <-- UNDER 95" : "";
  console.log(
    `  ${s.padEnd(30)} y${String(r.ytelse).padStart(3)} u${String(r.uu).padStart(3)} ` +
    `b${String(r.bp).padStart(3)} s${String(r.seo).padStart(3)} | ` +
    `LCP ${String(r.lcp).padStart(5)}ms CLS ${String(r.cls).padStart(5)} TBT ${String(r.tbt).padStart(4)}ms ` +
    `${String(r.kb).padStart(5)}kB${merk}`);
}
console.log("\nJSON " + JSON.stringify(rad));
