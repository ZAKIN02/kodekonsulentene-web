/**
 * Måler VÅR EGEN side med nøyaktig samme motor som skanningen av andre.
 *
 * Poenget med en sammenligning er at begge sidene er målt likt. Skriver man inn
 * sine egne tall for hånd, sammenligner man en måling med en påstand – og da er
 * tallet verdiløst uansett hvor pent det ser ut.
 *
 * Skriver resultatet inn i src/data/maalinger.json under `oss`, sammen med
 * datoen det ble målt. Verdien skal aldri redigeres for hånd.
 *
 * Kjør:  node .skudd/maaling-egen.mjs [https://kodekonsulentene.no]
 */
import { readFileSync, writeFileSync } from "node:fs";
import {
  analyserHeadere, analyserCookies, analyserUu, analyserLovpaalagt,
  analyserYtelseLokalt, byggRapport, formaterDato,
} from "../src/lib/sjekk.ts";

const MAAL = process.argv[2] ?? "https://kodekonsulentene.no";
const FIL = "src/data/maalinger.json";
const UA = "KodeKonsulentene-Nettsidesjekk/1.0 (+https://kodekonsulentene.no/sjekk)";

const t0 = Date.now();
const svar = await fetch(MAAL, {
  headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
  signal: AbortSignal.timeout(15_000),
  redirect: "follow",
});
if (!svar.ok) throw new Error(`${MAAL} svarte ${svar.status}`);
const html = await svar.text();
const ttfb = Date.now() - t0;

const headere = analyserHeadere(svar.headers);
const cookies = analyserCookies(svar.headers, html);
const uu = analyserUu(html);
const lov = analyserLovpaalagt(html);

const rapport = byggRapport({
  url: new URL(MAAL).host,
  dato: formaterDato(new Date()),
  ytelse: analyserYtelseLokalt(html, html.length, ttfb),
  headere, cookies, uu, lov,
});

/**
 * Motoren vår leser statisk HTML og kan IKKE se kontrast. «0 feil» derfra er
 * altså ikke et bevis på at siden består – og vår egen forside strøk nylig på
 * ni kontrastbrudd mens den statiske sjekken sa null.
 *
 * Derfor kjøres axe i tillegg, i begge temaer, før vi viser fram vårt eget tall.
 * Finner axe noe, settes `bestaar` til false og komponenten skal ikke påstå at
 * vi er rene. Et tall vi ikke tør etterprøve, har vi ikke lov til å vise.
 */
async function kontrastbrudd(url) {
  const { chromium } = await import("playwright");
  const AxeBuilder = (await import("@axe-core/playwright")).default;
  const b = await chromium.launch();
  const funn = [];
  for (const tema of ["dark", "light"]) {
    // reducedMotion: axe måler gjerne MIDT i en inntoning og rapporterer en
    // mellomfarge som brudd. Med redusert bevegelse hopper alt til sluttverdien.
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa"]).analyze();
    for (const v of r.violations) for (const n of v.nodes) funn.push({ tema, regel: v.id, maal: n.target.join(" ").slice(0, 60) });
    await ctx.close();
  }
  await b.close();
  return funn;
}

const axeFunn = await kontrastbrudd(MAAL);

const oss = {
  maalt: new Date().toISOString().slice(0, 10),
  url: new URL(MAAL).host,
  headereAv6: headere.tilstede.length,
  cookiesForSamtykke: cookies.egne + cookies.sporere.length,
  uuFeil: uu.feil,
  /** Fra axe i ekte nettleser, begge temaer. Statisk HTML kan ikke se kontrast. */
  axeBrudd: axeFunn.length,
  /** Komponenten viser oss bare som rene når BEGGE målingene er enige. */
  bestaar: uu.feil === 0 && axeFunn.length === 0,
  ttfbMs: ttfb,
  sumAv100: rapport.totalt,
  orgnr: Boolean(lov.orgnr),
};

const d = JSON.parse(readFileSync(FIL, "utf8"));
d.oss = oss;
writeFileSync(FIL, JSON.stringify(d, null, 2) + "\n");

console.log(JSON.stringify(oss, null, 2));
if (headere.mangler.length) console.log("\nMangler headere:", headere.mangler.join(", "));
if (cookies.sporere.length) console.log("Sporere:", cookies.sporere.join(", "));
if (axeFunn.length) {
  console.log(`\nAXE FANT ${axeFunn.length} BRUDD – vi kan ikke vise oss som rene:`);
  for (const f of axeFunn) console.log(`  ${f.tema.padEnd(6)} ${f.regel.padEnd(16)} ${f.maal}`);
}
console.log(`\nSkrevet til ${FIL} under «oss».`);
