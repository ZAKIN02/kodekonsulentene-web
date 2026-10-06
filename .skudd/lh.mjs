/**
 * Lighthouse-måling: mobil, tre kjøringer per side, median.
 *
 * Median og ikke snitt, fordi en enkelt treg kjøring (kald cache, bakgrunnsstøy)
 * ellers drar tallet ned og gir et inntrykk som ikke stemmer med hva brukere ser.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, rmSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:4399";
const sider = process.argv.slice(3);
if (!sider.length) sider.push("/", "/historie", "/sjekk", "/priser", "/verktoy");
const N = Number(process.env.KJORINGER ?? 3);

const ut = ".skudd/lh-ut";
rmSync(ut, { recursive: true, force: true });
mkdirSync(ut, { recursive: true });

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const rader = [];
for (const sti of sider) {
  const url = base + sti;
  const kjor = [];
  for (let i = 0; i < N; i++) {
    const fil = `${ut}/${sti.replace(/\W/g, "_")}-${i}.json`;
    try {
      execFileSync("npx", ["--yes", "lighthouse", url,
        "--quiet", "--chrome-flags=--headless=new --no-sandbox",
        "--preset=desktop" === "x" ? "" : "--form-factor=mobile",
        "--screenEmulation.mobile", "--throttling-method=simulate",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--output=json", `--output-path=${fil}`],
        { stdio: ["ignore", "ignore", "pipe"], timeout: 180000 });
      const r = JSON.parse(readFileSync(fil, "utf8"));
      kjor.push({
        ytelse: Math.round(r.categories.performance.score * 100),
        uu: Math.round(r.categories.accessibility.score * 100),
        praksis: Math.round(r.categories["best-practices"].score * 100),
        seo: Math.round(r.categories.seo.score * 100),
        lcp: r.audits["largest-contentful-paint"].numericValue,
        cls: r.audits["cumulative-layout-shift"].numericValue,
        tbt: r.audits["total-blocking-time"].numericValue,
        lcpEl: r.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 70) ?? "",
      });
    } catch (e) {
      console.error(`FEIL ${url} kjøring ${i}:`, String(e.stderr ?? e).slice(0, 300));
    }
  }
  if (!kjor.length) { rader.push({ sti, feil: true }); continue; }
  rader.push({
    sti,
    ytelse: median(kjor.map((k) => k.ytelse)),
    uu: median(kjor.map((k) => k.uu)),
    praksis: median(kjor.map((k) => k.praksis)),
    seo: median(kjor.map((k) => k.seo)),
    lcp: Math.round(median(kjor.map((k) => k.lcp))),
    cls: +median(kjor.map((k) => k.cls)).toFixed(3),
    tbt: Math.round(median(kjor.map((k) => k.tbt))),
    lcpEl: kjor[0].lcpEl,
    n: kjor.length,
  });
}

console.log(`\nLighthouse mobil, median av ${N} kjøringer — ${base}\n`);
console.log("side          ytel  uu  prak  seo |    LCP    CLS    TBT");
console.log("-".repeat(66));
for (const r of rader) {
  if (r.feil) { console.log(`${r.sti.padEnd(13)} FEILET`); continue; }
  const m = (v, krav) => String(v).padStart(4) + (v >= krav ? " " : "!");
  console.log(
    `${r.sti.padEnd(13)}${m(r.ytelse,95)}${m(r.uu,95)}${m(r.praksis,95)}${m(r.seo,95)} |` +
    `${String(r.lcp + " ms").padStart(8)}${String(r.cls).padStart(7)}${String(r.tbt + " ms").padStart(8)}`
  );
}
console.log("\n! = under kravet på 95. LCP-krav 2500 ms, CLS 0,1, TBT 200 ms.\n");
for (const r of rader) if (!r.feil && r.lcpEl) console.log(`LCP på ${r.sti}: ${r.lcpEl}`);
