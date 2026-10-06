/**
 * Bygger begge malene og skriver dem til /tmp for visuell kontroll.
 *
 * Rapportdataen hentes fra det EKTE API-et i produksjon, ikke fra oppdiktede
 * tall. Da ser vi malen slik en kunde faktisk får den – inkludert rader som
 * ender på «Ikke sjekket», som er de vanskeligste å få til å se riktige ut.
 *
 * Analysemotoren importeres med vilje IKKE her: src/lib/hent.ts bruker
 * endelsesløse importer som Vite løser opp, men ikke bare node.
 */
import { writeFileSync } from "node:fs";
import { rapportHtml, rapportTekst, henvendelseHtml, henvendelseTekst } from "../src/lib/epostmal.ts";

const mål = process.argv[2] ?? "kodekonsulentene.no";
const svar = await fetch(`https://kodekonsulentene.no/api/sjekk?url=${encodeURIComponent(mål)}`, {
  signal: AbortSignal.timeout(30_000),
});
const rapport = await svar.json();
if (rapport.feil) { console.error("  API-et svarte med feil:", rapport.feil); process.exit(1); }

// Melding med tegn som MÅ escapes – beviser at brukerinnhold ikke bryter markup.
const henvendelse = {
  navn: 'Kari "Pytt" Nordmann & Sønn',
  epost: "kari@eksempel.no",
  nettside: "https://eksempel.no/?q=1&r=2",
  melding:
    "Hei!\n\nVi har en gammel side på WordPress som er treg på mobil.\n\nStemmer det at <script>alert(1)</script> og & kan stå her uten å ødelegge noe?\n\nMvh Kari",
};

const rHtml = rapportHtml(rapport);
const hHtml = henvendelseHtml(henvendelse);
writeFileSync("/tmp/epost-rapport.html", rHtml);
writeFileSync("/tmp/epost-rapport.txt", rapportTekst(rapport));
writeFileSync("/tmp/epost-henvendelse.html", hHtml);
writeFileSync("/tmp/epost-henvendelse.txt", henvendelseTekst(henvendelse));

console.log(`  ${rapport.url}: ${rapport.totalt}/100`);
for (const r of rapport.rader) console.log(`    ${r.status.padEnd(8)} ${r.name.padEnd(22)} ${r.value}`);
console.log(`  rapport  html ${rHtml.length} B · tekst ${rapportTekst(rapport).length} B`);
console.log(`  henvend. html ${hHtml.length} B`);
console.log(`  script-tagg lekket ut: ${/<script/i.test(hHtml) ? "JA – FEIL" : "nei"}`);
