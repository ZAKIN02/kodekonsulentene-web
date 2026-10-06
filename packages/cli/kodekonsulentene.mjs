#!/usr/bin/env node
/**
 * kodekonsulentene – nettsidesjekk fra terminalen.
 *
 *   npx kodekonsulentene sjekk dinbedrift.no
 *   npx kodekonsulentene epost dinbedrift.no --dkim google
 *
 * Null avhengigheter. Node 22 har fetch innebygd, og farger er ni escape-koder.
 *
 * Hvorfor den kaller API-et i stedet for å pakke med motoren: se README.md.
 */

const API = process.env.KODEKONSULENTENE_API ?? "https://kodekonsulentene.no";

/* ------------------------------------------------------------ farger ---- */

// Respekter NO_COLOR og rør som ikke er en terminal (f.eks. | tee, CI-logger).
const farger = process.env.NO_COLOR === undefined && process.stdout.isTTY;
const f = (kode, s) => (farger ? `\u001b[${kode}m${s}\u001b[0m` : s);
const grå = (s) => f("90", s);
const fet = (s) => f("1", s);
const grønn = (s) => f("32", s);
const gul = (s) => f("33", s);
const rød = (s) => f("31", s);

const MERKE = {
  ok: () => grønn("BESTÅTT  "),
  warn: () => gul("BØR FIKSES"),
  fail: () => rød("BRUDD    "),
  neutral: () => grå("IKKE SJEKKET"),
};

/* ------------------------------------------------------------- hjelp ---- */

const HJELP = `
${fet("kodekonsulentene")} – sjekk en nettside fra terminalen

${fet("BRUK")}
  npx kodekonsulentene sjekk <url> [valg]
  npx kodekonsulentene epost <domene> [valg]

${fet("KOMMANDOER")}
  sjekk    ytelse, sikkerhetsheadere, cookies før samtykke, WCAG og org.nr.
  epost    SPF, DKIM og DMARC

${fet("VALG")}
  --json              skriv ut rå JSON i stedet for tabell
  --dkim <selektor>   DKIM-selektor, bare for «epost»
  --terskel <0-100>   laveste godtatte score før exit-kode 1 (standard 70)
  --lokal             kjør mot http://localhost:4321 i stedet for produksjon
  --hjelp             denne teksten

${fet("EXIT-KODE")}
  0   score er lik eller over terskelen
  1   score er under terskelen, eller en rad er «BRUDD»
  2   sjekken kunne ikke kjøres (ugyldig adresse, nettverksfeil)

${fet("EKSEMPEL")}
  npx kodekonsulentene sjekk dinbedrift.no --terskel 90
  npx kodekonsulentene epost dinbedrift.no --dkim google --json

${grå("Verktøyet er gratis og krever ingen innlogging.")}
${grå("Kildekode: https://github.com/kodekonsulentene/norsk-lovsjekk")}
`;

/* ------------------------------------------------------- argumenter ---- */

function lesArgumenter(argv) {
  const a = { kommando: null, mål: null, json: false, dkim: null, terskel: 70, lokal: false, hjelp: false };
  const rest = [];

  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === "--json") a.json = true;
    else if (x === "--lokal") a.lokal = true;
    else if (x === "--hjelp" || x === "-h" || x === "--help") a.hjelp = true;
    else if (x === "--dkim") a.dkim = argv[++i] ?? null;
    else if (x === "--terskel") a.terskel = Number(argv[++i]);
    else if (x.startsWith("-")) throw new Error(`Ukjent valg: ${x}`);
    else rest.push(x);
  }

  a.kommando = rest[0] ?? null;
  a.mål = rest[1] ?? null;
  if (!Number.isFinite(a.terskel) || a.terskel < 0 || a.terskel > 100) {
    throw new Error("--terskel må være et tall mellom 0 og 100.");
  }
  return a;
}

/* -------------------------------------------------------- utskriften ---- */

function skrivRapport(tittel, undertittel, rader, totalt, forbehold) {
  const bredde = Math.max(...rader.map((r) => r.name.length));
  console.log();
  console.log(`  ${fet(tittel)}  ${grå(undertittel)}`);
  console.log(`  ${grå("─".repeat(Math.min(72, process.stdout.columns ? process.stdout.columns - 4 : 72)))}`);

  for (const r of rader) {
    const merke = (MERKE[r.status] ?? MERKE.neutral)();
    console.log(`  ${r.name.padEnd(bredde)}  ${merke}  ${fet(r.value)}`);
    console.log(`  ${" ".repeat(bredde)}  ${grå(r.note)}`);
  }

  console.log(`  ${grå("─".repeat(Math.min(72, process.stdout.columns ? process.stdout.columns - 4 : 72)))}`);
  const farge = totalt >= 90 ? grønn : totalt >= 70 ? gul : rød;
  console.log(`  Samlet  ${farge(`${totalt} av 100`)}`);
  if (forbehold?.length) {
    console.log();
    for (const fb of forbehold) console.log(`  ${grå("·")} ${grå(fb)}`);
  }
  console.log();
}

/** Exit-kode: brudd er alltid 1, uansett hva totalen er. */
function exitKode(rader, totalt, terskel) {
  if (rader.some((r) => r.status === "fail")) return 1;
  return totalt >= terskel ? 0 : 1;
}

/* ------------------------------------------------------------- kjør ---- */

async function hent(sti, kropp, base) {
  let svar;
  try {
    svar = await fetch(`${base}${sti}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(kropp),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (e) {
    throw new Error(`Fikk ikke kontakt med ${base}. ${e instanceof Error ? e.message : ""}`.trim());
  }
  const data = await svar.json().catch(() => ({ feil: "Uventet svar fra tjenesten." }));
  if (!svar.ok || data.feil) throw new Error(data.feil ?? `Tjenesten svarte ${svar.status}.`);
  return data;
}

async function main() {
  let a;
  try {
    a = lesArgumenter(process.argv.slice(2));
  } catch (e) {
    console.error(rød(e.message));
    process.exit(2);
  }

  if (a.hjelp || !a.kommando) {
    console.log(HJELP);
    process.exit(a.kommando ? 0 : a.hjelp ? 0 : 2);
  }

  const base = a.lokal ? "http://localhost:4321" : API;

  if (!a.mål) {
    console.error(rød(`Mangler ${a.kommando === "epost" ? "domene" : "adresse"}.`));
    console.error(grå(`  npx kodekonsulentene ${a.kommando} dinbedrift.no`));
    process.exit(2);
  }

  try {
    if (a.kommando === "sjekk") {
      const r = await hent("/api/sjekk", { url: a.mål }, base);
      if (a.json) { console.log(JSON.stringify(r, null, 2)); process.exit(exitKode(r.rader, r.totalt, a.terskel)); }
      skrivRapport(r.url, r.dato, r.rader, r.totalt, r.forbehold);
      process.exit(exitKode(r.rader, r.totalt, a.terskel));
    }

    if (a.kommando === "epost") {
      const r = await hent("/api/dmarc", { domene: a.mål, dkim: a.dkim ?? undefined }, base);
      if (a.json) { console.log(JSON.stringify(r, null, 2)); process.exit(exitKode(r.rader, r.totalt, a.terskel)); }
      skrivRapport(r.domene, r.dato, r.rader, r.totalt, r.forbehold);
      process.exit(exitKode(r.rader, r.totalt, a.terskel));
    }

    console.error(rød(`Ukjent kommando: ${a.kommando}`));
    console.log(HJELP);
    process.exit(2);
  } catch (e) {
    console.error();
    console.error(`  ${rød("Sjekken stoppet.")} ${e instanceof Error ? e.message : ""}`);
    console.error();
    process.exit(2);
  }
}

main();
