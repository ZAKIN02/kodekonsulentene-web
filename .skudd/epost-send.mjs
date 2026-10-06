/**
 * Sender begge malene gjennom Resend og henter dem tilbake via API-et, så vi
 * vet hva som FAKTISK ble levert – ikke bare hva vi genererte lokalt.
 *
 * Avsender er firmainnsikt.com fordi kodekonsulentene.no ikke er verifisert i
 * Resend ennå (403). Mottaker er delivered@resend.dev, Resends egen testadresse.
 */
import { readFileSync } from "node:fs";

const nøkkel = process.env.RESEND_API_KEY;
if (!nøkkel) { console.error("  RESEND_API_KEY mangler"); process.exit(1); }

const FRA = "KodeKonsulentene <test@firmainnsikt.com>";
const TIL = "delivered@resend.dev";

async function send(emne, html, tekst) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${nøkkel}`, "content-type": "application/json" },
    body: JSON.stringify({ from: FRA, to: [TIL], subject: emne, html, text: tekst }),
  });
  const d = await r.json();
  return { ok: r.ok, status: r.status, id: d.id, feil: d.message };
}

const jobber = [
  ["Nettsidesjekk: kodekonsulentene.no – 90/100", "/tmp/epost-rapport.html", "/tmp/epost-rapport.txt"],
  ["Henvendelse fra Kari \"Pytt\" Nordmann & Sønn", "/tmp/epost-henvendelse.html", "/tmp/epost-henvendelse.txt"],
];

const ider = [];
for (const [emne, h, t] of jobber) {
  const res = await send(emne, readFileSync(h, "utf8"), readFileSync(t, "utf8"));
  console.log(`  ${res.ok ? "sendt" : "FEIL " + res.status}  ${emne.slice(0, 44)}  ${res.id ?? res.feil}`);
  if (res.id) ider.push(res.id);
}

// Hent tilbake og bekreft at både html og text kom med.
await new Promise((r) => setTimeout(r, 2500));
for (const id of ider) {
  const r = await fetch(`https://api.resend.com/emails/${id}`, {
    headers: { authorization: `Bearer ${nøkkel}` },
  });
  const d = await r.json();
  console.log(`  hentet ${id.slice(0, 8)}: status=${d.last_event} html=${d.html ? d.html.length + " B" : "MANGLER"} text=${d.text ? d.text.length + " B" : "MANGLER"}`);
}
