/**
 * Ytelsesmåling med Lighthouse, mobil OG skrivebord, median av N kjøringer.
 *
 * Median og ikke snitt: én treg kjøring (kald cache, bakgrunnsstøy fra andre
 * agenter) drar snittet ned og gir et tall ingen bruker opplever.
 *
 * Lighthouse ligger IKKE i repoets package.json – sju agenter skriver i den
 * samtidig, og en ekstra avhengighet der ville kollidert. Den hentes fra en
 * egen mappe, overstyrbar med LH=<sti til node_modules>.
 *
 *   node .skudd/ytelse.mjs <base-url> [sti ...]
 *   FORM=desktop node .skudd/ytelse.mjs http://127.0.0.1:4427 /
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";

const LH_ROT = process.env.LH
  ?? "/private/tmp/claude-501/-Users-zakaria-Zakaria-02-Prosjekter-Kodekonsulentene/ef8a63ea-4246-4539-b798-359e3a859634/scratchpad/lh/node_modules";
const krev = createRequire(`${LH_ROT}/`);
const lighthouse = (await import(`${LH_ROT}/lighthouse/core/index.js`)).default;
const chromeLauncher = krev("chrome-launcher");

const base = process.argv[2] ?? "http://127.0.0.1:4427";
const sider = process.argv.slice(3);
if (!sider.length) sider.push("/");
const N = Number(process.env.KJORINGER ?? 3);
const FORM = process.env.FORM === "desktop" ? "desktop" : "mobile";
const UT = process.env.UT ?? ".skudd/ytelse-ut";

// Pixel 7: 390x844 CSS-piksler med devicePixelRatio 2,625. Tallet er FYSISKE
// piksler delt på CSS-piksler – skriver man 1080 her måler man en skjerm som
// ikke finnes. Det har lurt oss før.
const MOBIL = { mobile: true, width: 390, height: 844, deviceScaleFactor: 2.625, disabled: false };
const SKRIVEBORD = { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false };

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[(s.length - 1) >> 1]; };

mkdirSync(UT, { recursive: true });

const chrome = await chromeLauncher.launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  chromePath: process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

const innstillinger = {
  port: chrome.port,
  output: "json",
  logLevel: "error",
  onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  formFactor: FORM,
  screenEmulation: FORM === "desktop" ? SKRIVEBORD : MOBIL,
  throttlingMethod: "simulate",
  ...(FORM === "desktop"
    ? { throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } }
    : {}),
};

const rader = [];
for (const sti of sider) {
  const url = base.replace(/\/$/, "") + sti;
  const kjor = [];
  let feil = null;
  for (let i = 0; i < N; i++) {
    try {
      const { lhr } = await lighthouse(url, innstillinger);
      if (lhr.runtimeError?.code) throw new Error(lhr.runtimeError.message);
      kjor.push({
        ytelse: Math.round(lhr.categories.performance.score * 100),
        uu: Math.round(lhr.categories.accessibility.score * 100),
        praksis: Math.round(lhr.categories["best-practices"].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        lcp: lhr.audits["largest-contentful-paint"].numericValue,
        cls: lhr.audits["cumulative-layout-shift"].numericValue,
        tbt: lhr.audits["total-blocking-time"].numericValue,
        fcp: lhr.audits["first-contentful-paint"].numericValue,
        byte: lhr.audits["total-byte-weight"]?.numericValue ?? 0,
        lcpEl: lhr.audits["largest-contentful-paint-element"]?.details?.items?.[0]
          ?.items?.[0]?.node?.snippet?.slice(0, 90) ?? "",
        // Alt som trekker ned, så årsaken står svart på hvitt i stedet for å gjettes.
        trekk: Object.values(lhr.audits)
          .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative")
          .map((a) => `${a.id}=${a.score.toFixed(2)}`),
        cache: lhr.audits["uses-long-cache-ttl"]?.details?.items?.map(
          (i) => `${String(i.url).replace(base, "")} ${Math.round((i.cacheLifetimeMs ?? 0) / 1000)}s ${i.totalBytes}B`) ?? [],
      });
      if (i === 0) writeFileSync(`${UT}/${FORM}${sti.replace(/\W/g, "_")}.json`, JSON.stringify(lhr));
    } catch (e) {
      feil = String(e.message ?? e).slice(0, 200);
    }
  }
  if (!kjor.length) { rader.push({ sti, feil }); continue; }
  const m = (k) => median(kjor.map((x) => x[k]));
  rader.push({
    sti, form: FORM, n: kjor.length,
    ytelse: m("ytelse"), uu: m("uu"), praksis: m("praksis"), seo: m("seo"),
    lcp: Math.round(m("lcp")), cls: +m("cls").toFixed(3), tbt: Math.round(m("tbt")),
    fcp: Math.round(m("fcp")), byte: Math.round(m("byte")),
    lcpEl: kjor[0].lcpEl,
    // Spredning mellom kjøringer. Er den stor, er tallet ustabilt og skal ikke
    // rapporteres som en sannhet.
    spredning: Math.max(...kjor.map((x) => x.ytelse)) - Math.min(...kjor.map((x) => x.ytelse)),
    trekk: [...new Set(kjor.flatMap((x) => x.trekk))].sort(),
    cache: kjor[0].cache,
  });
  const r = rader.at(-1);
  console.log(`${FORM.padEnd(9)} ${sti.padEnd(26)} y${String(r.ytelse).padStart(3)} u${String(r.uu).padStart(3)} p${String(r.praksis).padStart(3)} s${String(r.seo).padStart(3)}  lcp ${String(r.lcp).padStart(5)}ms cls ${String(r.cls).padEnd(5)} tbt ${String(r.tbt).padStart(4)}ms  ${(r.byte/1024).toFixed(0)}kB  ±${r.spredning}`);
}

await chrome.kill();
writeFileSync(`${UT}/${FORM}-${base.replace(/\W/g, "_")}.json`, JSON.stringify(rader, null, 2));
console.log(`\nSkrevet ${UT}/${FORM}-${base.replace(/\W/g, "_")}.json`);
