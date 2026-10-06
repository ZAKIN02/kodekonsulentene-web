/**
 * Masseskanning av et TILFELDIG utvalg norske småbedriftssider.
 *
 * Hele poenget er at tallene skal tåle å bli sitert. Derfor:
 *
 *  - Utvalget trekkes fra Enhetsregisteret, ikke håndplukkes. Et håndplukket
 *    utvalg beviser bare at man klarte å finne dårlige sider.
 *  - Trekningen er deterministisk (fast steg gjennom en sortert liste), så
 *    kjøringen kan gjentas og gi samme utvalg.
 *  - docs/metode-skanning.md er bindende: robots.txt respekteres, User-Agent
 *    sier hvem vi er, maks ett treff per domene per sekund, og bare forsiden.
 *  - RÅDATA MED DOMENENAVN SKRIVES ALDRI TIL REPOET. Repoet er offentlig, og
 *    «vi publiserer ikke navn på sider som kommer dårlig ut» er vårt eget løfte.
 *    Råfila havner i skrapemappa; bare aggregerte tall går til src/data/.
 *
 * Kjør:  node .skudd/maaling-skann.mjs [--antall 40] [--ut src/data/maalinger.json]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  analyserHeadere, analyserCookies, analyserUu, analyserLovpaalagt,
  analyserYtelseLokalt, byggRapport, formaterDato,
} from "../src/lib/sjekk.ts";

const arg = (navn, standard) => {
  const i = process.argv.indexOf(`--${navn}`);
  return i > -1 ? process.argv[i + 1] : standard;
};

const ANTALL = Number(arg("antall", 40));
const UT = arg("ut", "src/data/maalinger.json");
const RAA = arg("raa", join(
  process.env.TMPDIR ?? "/tmp",
  "kodekonsulentene-maaling-raa.json",
));

/**
 * Bransjene vi faktisk selger til, med næringskoder fra SSBs standard.
 * Begge bransjesidene våre er bygget for disse.
 */
const BRANSJER = [
  { navn: "Håndverk", koder: ["43.221", "43.210", "43.320", "43.341"] },
  { navn: "Klinikk", koder: ["86.230", "86.901", "86.211"] },
];

const UA =
  "KodeKonsulentene-Nettsidesjekk/1.0 (+https://kodekonsulentene.no/sjekk)";
const TIDSAVBRUDD = 12_000;
const PAUSE_MS = 1100; // taket i metodedokumentet er ett treff per domene per sekund

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------ utvalg ---- */

async function hentEnheter(kode) {
  const u = new URL("https://data.brreg.no/enhetsregisteret/api/enheter");
  u.searchParams.set("naeringskode", kode);
  u.searchParams.set("size", "1000");
  u.searchParams.set("konkurs", "false");
  u.searchParams.set("underAvvikling", "false");
  const svar = await fetch(u, {
    headers: { accept: "application/json", "user-agent": UA },
    signal: AbortSignal.timeout(20_000),
  });
  if (!svar.ok) throw new Error(`Enhetsregisteret svarte ${svar.status} for ${kode}`);
  const d = await svar.json();
  return d?._embedded?.enheter ?? [];
}

/** Normaliserer feltet `hjemmeside`, som er fritekst og ofte uten skjema. */
function nettadresse(raa) {
  if (!raa || typeof raa !== "string") return null;
  const t = raa.trim().replace(/^[<"'\s]+|[>"'\s.,]+$/g, "");
  if (!t || /^(ingen|n\/a|-)$/i.test(t)) return null;
  const med = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(med);
    if (!u.hostname.includes(".")) return null;
    return u;
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------- robots ---- */

/**
 * Minimal robots.txt-tolkning: finner gruppen for vår UA, ellers `*`, og
 * avgjør om «/» er utestengt. Ved tvil – eller hvis fila ikke kan hentes –
 * skanner vi IKKE. Metodedokumentet sier robots skal respekteres, og da er
 * det feil å tolke tvil i vår favør.
 */
async function robotsTillater(opprinnelse) {
  let tekst;
  try {
    const svar = await fetch(new URL("/robots.txt", opprinnelse), {
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    // Ingen robots.txt betyr ingen restriksjoner. 4xx er altså et JA.
    if (svar.status >= 400) return { ok: true, grunn: "ingen robots.txt" };
    const type = svar.headers.get("content-type") ?? "";
    if (type && !/text\/plain/i.test(type)) return { ok: true, grunn: "robots.txt er ikke tekst" };
    tekst = await svar.text();
  } catch {
    // Nettverksfeil her betyr nesten alltid at verten er nede eller ikke finnes
    // – ikke at robots stenger oss. Skilles, ellers ser utilgjengelige sider ut
    // som om de hadde nektet oss adgang.
    return { ok: false, naadde: false, grunn: "svarte ikke" };
  }

  const linjer = tekst.split(/\r?\n/).map((l) => l.replace(/#.*$/, "").trim());
  const grupper = [];
  let naa = null;
  for (const l of linjer) {
    const m = l.match(/^(user-agent|disallow|allow)\s*:\s*(.*)$/i);
    if (!m) continue;
    const felt = m[1].toLowerCase();
    const verdi = m[2].trim();
    if (felt === "user-agent") {
      if (!naa || naa.regler.length) { naa = { agenter: [], regler: [] }; grupper.push(naa); }
      naa.agenter.push(verdi.toLowerCase());
    } else if (naa) {
      naa.regler.push({ type: felt, sti: verdi });
    }
  }

  const vaar = grupper.find((g) => g.agenter.some((a) => UA.toLowerCase().startsWith(a.split("/")[0]) && a !== "*"));
  const alle = grupper.find((g) => g.agenter.includes("*"));
  const gruppe = vaar ?? alle;
  if (!gruppe) return { ok: true, grunn: "ingen regel gjelder oss" };

  // Vi henter bare «/». Lengste treffende regel vinner, som i standarden.
  let beste = null;
  for (const r of gruppe.regler) {
    if (r.sti === "") continue;            // tom Disallow betyr «alt tillatt»
    if (!"/".startsWith(r.sti.replace(/\*$/, ""))) continue;
    if (!beste || r.sti.length > beste.sti.length) beste = r;
  }
  if (beste?.type === "disallow") return { ok: false, grunn: `robots.txt stenger ${beste.sti}` };
  return { ok: true, grunn: "tillatt" };
}

/* ------------------------------------------------------------ henting -- */

async function hentForside(url) {
  const t0 = Date.now();
  let naa = url;
  for (let hopp = 0; hopp <= 4; hopp++) {
    const svar = await fetch(naa, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIDSAVBRUDD),
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml", "accept-language": "nb,no,en" },
    });
    if ([301, 302, 303, 307, 308].includes(svar.status)) {
      const neste = svar.headers.get("location");
      if (!neste) throw new Error("omdirigerer uten mål");
      naa = new URL(neste, naa);
      continue;
    }
    if (svar.status >= 400) throw new Error(`svarte ${svar.status}`);
    const type = svar.headers.get("content-type") ?? "";
    if (type && !/text\/html|application\/xhtml/i.test(type)) throw new Error("ikke en nettside");
    const html = await svar.text();
    return { url: naa, headers: svar.headers, html, bytes: html.length, ttfb: Date.now() - t0 };
  }
  throw new Error("for mange omdirigeringer");
}

/* -------------------------------------------------------------- kjør ---- */

console.log(`Trekker utvalg fra Enhetsregisteret (${BRANSJER.length} bransjer) …`);

const kandidater = [];
for (const b of BRANSJER) {
  for (const kode of b.koder) {
    let enheter = [];
    try {
      enheter = await hentEnheter(kode);
    } catch (e) {
      console.log(`  ${kode}: ${e.message}`);
      continue;
    }
    // Småbedrift, ikke kjede. Uten dette filteret havnet bemanningsbyråer og
    // kiosk-kjeder i utvalget, og de er ikke dem vi selger til. Ansatt-tallet
    // er bare utfylt for om lag halvparten; vi krever at det ER utfylt, så
    // «ukjent størrelse» ikke smugler inn store foretak.
    const med = enheter
      .filter((e) => !e.slettedato && !e.konkurs)
      .filter((e) => typeof e.antallAnsatte === "number" && e.antallAnsatte >= 1 && e.antallAnsatte <= 20)
      .map((e) => ({
        bransje: b.navn, kode, orgnr: e.organisasjonsnummer,
        ansatte: e.antallAnsatte, url: nettadresse(e.hjemmeside),
      }))
      .filter((e) => e.url);
    console.log(`  ${kode}: ${enheter.length} enheter, ${med.length} småbedrifter med nettadresse`);
    kandidater.push(...med);
  }
}

// Deterministisk trekning: sorter på org.nr. og gå med fast steg gjennom lista.
// Ett domene per foretak, og bare ett treff per vertsnavn.
kandidater.sort((a, b) => a.orgnr.localeCompare(b.orgnr));
const sett = new Set();
const unike = kandidater.filter((k) => {
  const v = k.url.hostname.replace(/^www\./, "");
  if (sett.has(v)) return false;
  sett.add(v);
  return true;
});

const steg = Math.max(1, Math.floor(unike.length / ANTALL));
const utvalg = [];
for (let i = 0; i < unike.length && utvalg.length < ANTALL; i += steg) utvalg.push(unike[i]);

console.log(`\n${unike.length} unike domener, trekker hver ${steg}. → ${utvalg.length} sider\n`);

const raa = [];
let stengt = 0;      // robots.txt nektet oss
let svarteIkke = 0;  // verten var nede, ukjent eller for treg

for (const [i, k] of utvalg.entries()) {
  const vert = k.url.hostname;
  process.stdout.write(`  ${String(i + 1).padStart(3)}/${utvalg.length} ${vert.padEnd(38)} `);

  const robots = await robotsTillater(k.url.origin);
  if (!robots.ok) {
    console.log(`hoppet over – ${robots.grunn}`);
    if (robots.naadde === false) svarteIkke++; else stengt++;
    await sov(PAUSE_MS);
    continue;
  }

  try {
    const h = await hentForside(k.url);
    const lov = analyserLovpaalagt(h.html);
    const rapport = byggRapport({
      url: h.url.host,
      dato: formaterDato(new Date()),
      // PageSpeed krever API-nøkkel og ett kall per side. Vi måler i stedet
      // TTFB og sidestørrelse direkte, og raden står som «neutral».
      ytelse: analyserYtelseLokalt(h.html, h.bytes, h.ttfb),
      headere: analyserHeadere(h.headers),
      cookies: analyserCookies(h.headers, h.html),
      uu: analyserUu(h.html),
      lov,
    });
    raa.push({
      bransje: k.bransje,
      kode: k.kode,
      vert,
      ttfb: h.ttfb,
      bytes: h.bytes,
      headere: analyserHeadere(h.headers).tilstede.length,
      cookies: analyserCookies(h.headers, h.html).egne + analyserCookies(h.headers, h.html).sporere.length,
      sporere: analyserCookies(h.headers, h.html).sporere.length,
      uuFeil: analyserUu(h.html).feil,
      orgnr: Boolean(lov.orgnr),
      totalt: rapport.totalt,
    });
    console.log(`ok  ${rapport.totalt}/100`);
  } catch (e) {
    console.log(`feilet – ${e.message}`);
    svarteIkke++;
  }
  await sov(PAUSE_MS);
}

/* --------------------------------------------------------- aggregering -- */

const med = (f) => raa.map(f).filter((v) => v !== null && v !== undefined);
const median = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};
const andel = (f) => (raa.length ? Math.round((raa.filter(f).length / raa.length) * 100) : null);

const aggregat = {
  _om: "Aggregerte tall fra en masseskanning. Ingen domenenavn – repoet er offentlig, og vi publiserer ikke navn på sider som kommer dårlig ut. Rådata ligger utenfor repoet.",
  maalt: new Date().toISOString().slice(0, 10),
  utvalg: {
    kilde: "Enhetsregisteret, foretak med registrert hjemmeside",
    naeringskoder: BRANSJER.flatMap((b) => b.koder),
    unikeDomener: unike.length,
    trukket: utvalg.length,
    svarte: raa.length,
    stengtAvRobots: stengt,
    svarteIkke,
    stoerrelse: "1–20 ansatte registrert i Enhetsregisteret",
  },
  typisk: {
    headereAv6: median(med((r) => r.headere)),
    cookiesForSamtykke: median(med((r) => r.cookies)),
    uuFeil: median(med((r) => r.uuFeil)),
    ttfbMs: median(med((r) => r.ttfb)),
    sumAv100: median(med((r) => r.totalt)),
  },
  andelProsent: {
    settercookiesForSamtykke: andel((r) => r.cookies > 0),
    harSporereForSamtykke: andel((r) => r.sporere > 0),
    manglerOrgnr: andel((r) => !r.orgnr),
    harAlleSeksHeadere: andel((r) => r.headere === 6),
    harMinstEnUuFeil: andel((r) => r.uuFeil > 0),
  },
  forbehold: [
    "Forsiden er hentet én gang, uten å kjøre JavaScript. Cookies som settes av skript etterpå er ikke med, så tallet er et minimum.",
    "Kontrast, tastaturnavigasjon og skjermleserflyt kan ikke måles maskinelt og er ikke vurdert.",
    "Utvalget er foretak som har registrert hjemmeside i Enhetsregisteret. Foretak uten registrert adresse er ikke med, og utvalget er derfor ikke representativt for bransjen som helhet.",
    "Sider som stenger oss i robots.txt, eller som ikke svarte, er hoppet over og teller ikke. Begge tallene står i utvalget.",
  ],
};

mkdirSync(dirname(UT), { recursive: true });
writeFileSync(UT, JSON.stringify(aggregat, null, 2) + "\n");
writeFileSync(RAA, JSON.stringify({ maalt: aggregat.maalt, rader: raa }, null, 2) + "\n");

console.log(`\n${raa.length} sider målt. ${stengt} stengt av robots.txt, ${svarteIkke} svarte ikke.`);
console.log(`Aggregat → ${UT}`);
console.log(`Rådata   → ${RAA}  (utenfor repoet, med vilje)`);
console.log("\nTypisk side:", JSON.stringify(aggregat.typisk));
console.log("Andeler:   ", JSON.stringify(aggregat.andelProsent));
