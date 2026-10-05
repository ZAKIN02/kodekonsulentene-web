#!/usr/bin/env node
/**
 * DNS for kodekonsulentene.no hos GoDaddy.
 *
 *   node scripts/dns-godaddy.mjs list    – vis alle oppføringer slik de er i dag
 *   node scripts/dns-godaddy.mjs plan    – vis hva «apply» ville endret. Skriver ingenting.
 *   node scripts/dns-godaddy.mjs apply   – skriv endringene
 *
 * Krever GODADDY_API_KEY og GODADDY_API_SECRET i miljøet, og Fly-IP-ene:
 *
 *   fly ips list -a kodekonsulentene
 *   export FLY_IPV4=66.241.xxx.xxx FLY_IPV6=2a09:8280:...
 *   node scripts/dns-godaddy.mjs plan
 *
 * To ting skriptet aldri gjør, med vilje:
 *   – det rører ikke MX-oppføringer. E-post som slutter å virke er verre enn en
 *     nettside som peker feil, og det er lett å ødelegge uten å merke det.
 *   – det skriver ingenting uten at du skrev «apply». «plan» er alltid trygt.
 *
 * NB: GoDaddy strammet inn API-tilgangen i 2024. Les forbeholdet i
 * docs/domene-og-drift.md før du regner med at dette virker – svarer API-et 403,
 * står de manuelle verdiene i samme dokument.
 */

const DOMENE = process.env.GODADDY_DOMENE ?? "kodekonsulentene.no";
const BASE = "https://api.godaddy.com/v1";

const NOKKEL = process.env.GODADDY_API_KEY;
const HEMMELIGHET = process.env.GODADDY_API_SECRET;

const FLY_IPV4 = process.env.FLY_IPV4;
const FLY_IPV6 = process.env.FLY_IPV6;

const kommando = process.argv[2];

/* ----------------------------------------------------------------- utskrift ---- */
const farge = process.stdout.isTTY;
const dim = (s) => (farge ? `\x1b[2m${s}\x1b[0m` : s);
const grønn = (s) => (farge ? `\x1b[32m${s}\x1b[0m` : s);
const gul = (s) => (farge ? `\x1b[33m${s}\x1b[0m` : s);
const rød = (s) => (farge ? `\x1b[31m${s}\x1b[0m` : s);

function stopp(melding, kode = 1) {
  console.error(rød(melding));
  process.exit(kode);
}

/* ------------------------------------------------------------------- api ---- */
async function api(sti, init = {}) {
  const svar = await fetch(`${BASE}${sti}`, {
    ...init,
    headers: {
      authorization: `sso-key ${NOKKEL}:${HEMMELIGHET}`,
      "content-type": "application/json",
      accept: "application/json",
      ...init.headers,
    },
  });

  if (svar.status === 401) {
    stopp("401 fra GoDaddy. Nøkkelen eller hemmeligheten er feil, eller de er laget i OTE-miljøet i stedet for produksjon.");
  }
  if (svar.status === 403) {
    stopp(
      [
        "403 fra GoDaddy.",
        "",
        "GoDaddy begrenset API-tilgangen i 2024. Den krever nå enten minst ti domener",
        "på kontoen, eller medlemskap i Discount Domain Club («Domeneklubb med rabatt»).",
        "Sjekk docs/domene-og-drift.md – der står oppføringene du kan sette manuelt",
        "i GoDaddy-panelet i stedet. Det tar fem minutter og gjør akkurat det samme.",
      ].join("\n"),
    );
  }
  if (!svar.ok) {
    const tekst = await svar.text().catch(() => "");
    stopp(`${svar.status} fra GoDaddy: ${tekst.slice(0, 400)}`);
  }
  return svar.status === 204 ? null : svar.json();
}

const hentOppforinger = () => api(`/domains/${DOMENE}/records`);

/* ------------------------------------------------------------- ønsket mål ---- */
/** Oppføringene siden skal ha. Alt annet lar vi stå. */
function onsket() {
  const mål = [];
  if (FLY_IPV4) mål.push({ type: "A", name: "@", data: FLY_IPV4, ttl: 600 });
  if (FLY_IPV6) mål.push({ type: "AAAA", name: "@", data: FLY_IPV6, ttl: 600 });
  mål.push({ type: "CNAME", name: "www", data: `${DOMENE}.`, ttl: 3600 });
  return mål;
}

const lik = (a, b) =>
  a.type === b.type &&
  a.name === b.name &&
  a.data.replace(/\.$/, "") === b.data.replace(/\.$/, "");

function lagPlan(dagens) {
  const mål = onsket();
  const endringer = [];

  for (const m of mål) {
    const treff = dagens.filter((d) => d.type === m.type && d.name === m.name);
    if (treff.length === 0) {
      endringer.push({ slag: "ny", mål: m });
    } else if (treff.length === 1 && lik(treff[0], m)) {
      endringer.push({ slag: "uendret", mål: m, fra: treff[0] });
    } else {
      endringer.push({ slag: "endre", mål: m, fra: treff[0], antall: treff.length });
    }
  }
  return endringer;
}

function skrivPlan(endringer) {
  for (const e of endringer) {
    const navn = `${e.mål.type.padEnd(5)} ${e.mål.name.padEnd(12)}`;
    if (e.slag === "uendret") {
      console.log(`  ${dim("=")} ${dim(navn)} ${dim(e.mål.data)}`);
    } else if (e.slag === "ny") {
      console.log(`  ${grønn("+")} ${navn} ${grønn(e.mål.data)}`);
    } else {
      const fra = e.fra?.data ?? "?";
      console.log(`  ${gul("~")} ${navn} ${gul(`${fra} → ${e.mål.data}`)}`);
      if (e.antall > 1) console.log(`      ${dim(`${e.antall} oppføringer av denne typen blir erstattet av én`)}`);
    }
  }
}

/* ------------------------------------------------------------------ kjør ---- */
async function main() {
  if (!NOKKEL || !HEMMELIGHET) {
    stopp(
      [
        "Mangler GODADDY_API_KEY og/eller GODADDY_API_SECRET.",
        "",
        "Lag et nøkkelpar på https://developer.godaddy.com/keys (velg Production, ikke OTE), og:",
        "  export GODADDY_API_KEY=...",
        "  export GODADDY_API_SECRET=...",
      ].join("\n"),
    );
  }

  if (kommando === "list") {
    const oppforinger = await hentOppforinger();
    console.log(`\n${DOMENE} – ${oppforinger.length} oppføringer\n`);
    for (const o of oppforinger) {
      const ekstra = o.priority !== undefined ? dim(`  prio ${o.priority}`) : "";
      console.log(`  ${o.type.padEnd(6)} ${String(o.name).padEnd(16)} ${o.data}${ekstra}`);
    }
    console.log();
    return;
  }

  if (kommando !== "plan" && kommando !== "apply") {
    console.log("Bruk: node scripts/dns-godaddy.mjs <list|plan|apply>");
    process.exit(kommando ? 1 : 0);
  }

  if (!FLY_IPV4 && !FLY_IPV6) {
    stopp(
      [
        "Mangler FLY_IPV4 og/eller FLY_IPV6.",
        "",
        "  fly ips list -a kodekonsulentene",
        "  export FLY_IPV4=<v4-adressen> FLY_IPV6=<v6-adressen>",
      ].join("\n"),
    );
  }

  const dagens = await hentOppforinger();
  const endringer = lagPlan(dagens);

  console.log(`\n${DOMENE} – planlagte endringer\n`);
  skrivPlan(endringer);

  const mx = dagens.filter((d) => d.type === "MX");
  if (mx.length > 0) console.log(`\n  ${dim(`${mx.length} MX-oppføringer røres ikke.`)}`);

  const skalEndres = endringer.filter((e) => e.slag !== "uendret");
  if (skalEndres.length === 0) {
    console.log(`\n${grønn("Ingenting å gjøre – DNS peker allerede riktig.")}\n`);
    return;
  }

  if (kommando === "plan") {
    console.log(`\n${dim("Dette var bare en plan. Kjør «apply» for å skrive.")}\n`);
    return;
  }

  // GoDaddy har PUT per type+navn: den erstatter alle oppføringer med den
  // kombinasjonen. Derfor kan vi skrive A, AAAA og CNAME hver for seg uten å
  // røre MX, TXT eller NS i det hele tatt.
  for (const e of skalEndres) {
    const { type, name, data, ttl } = e.mål;
    await api(`/domains/${DOMENE}/records/${type}/${encodeURIComponent(name)}`, {
      method: "PUT",
      body: JSON.stringify([{ data, ttl }]),
    });
    console.log(`  ${grønn("✓")} ${type} ${name} → ${data}`);
  }

  console.log(
    [
      "",
      grønn(`Ferdig. ${skalEndres.length} oppføringer skrevet.`),
      "",
      dim("Neste steg:"),
      dim("  fly certs add kodekonsulentene.no -a kodekonsulentene"),
      dim("  fly certs add www.kodekonsulentene.no -a kodekonsulentene"),
      dim("  dig +short kodekonsulentene.no      # vent til den viser Fly-IP-en"),
      "",
    ].join("\n"),
  );
}

main().catch((e) => stopp(e instanceof Error ? e.message : String(e)));
