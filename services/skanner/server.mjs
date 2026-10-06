/**
 * Skannertjenesten – HTTP-grensesnittet.
 *
 * Egen Fly-app, med vilje: en skanning starter en ekte Chromium og kan bruke
 * flere hundre megabyte. Ligger den i samme maskin som nettsiden, kan en tung
 * skanning ta ned forsiden. Her kan den bare ta ned seg selv.
 *
 * Tjenesten er ikke åpen for verden. Alt utenom /helse krever den delte
 * hemmeligheten i `x-skanner-nokkel`. Er hemmeligheten ikke satt, nekter
 * tjenesten alt – den skal ikke kunne stå åpen ved et uhell.
 */

import { createServer } from "node:http";
import { normaliserUrl, erTillattVert } from "./ssrf.mjs";
import { skannCookies, skannUu, lukkNettleser } from "./skann.mjs";

const PORT = Number(process.env.PORT ?? 8080);
const VERT = process.env.HOST ?? "0.0.0.0";
const NOKKEL = process.env.SKANNER_NOKKEL ?? "";
const MAKS_KROPP = 4_000;

if (!NOKKEL) {
  console.warn(
    "[skanner] SKANNER_NOKKEL er ikke satt. Tjenesten svarer 503 på alt " +
      "utenom /helse til den er på plass. Sett den med: fly secrets set SKANNER_NOKKEL=… -a kodekonsulentene-skanner",
  );
}

/**
 * Én skanning om gangen.
 *
 * Chromium er tung, og maskinen har 1 GB. To samtidige skanninger er den
 * raskeste veien til at begge dør av minnemangel. Den som kommer nummer to får
 * et ærlig «opptatt» i stedet for en halv rapport.
 */
let opptatt = false;

const json = (svar, status, data) => {
  const kropp = JSON.stringify(data);
  svar.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(kropp),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  svar.end(kropp);
};

async function lesKropp(forespørsel) {
  const biter = [];
  let total = 0;
  for await (const bit of forespørsel) {
    total += bit.length;
    if (total > MAKS_KROPP) throw new Error("For stor forespørsel.");
    biter.push(bit);
  }
  if (!biter.length) return {};
  try {
    return JSON.parse(Buffer.concat(biter).toString("utf8"));
  } catch {
    throw new Error("Forventet JSON.");
  }
}

/** Tidskonstant sammenligning, så nøkkelen ikke kan gjettes byte for byte. */
function nokkelStemmer(gitt) {
  const a = Buffer.from(String(gitt ?? ""));
  const b = Buffer.from(NOKKEL);
  if (a.length !== b.length) return false;
  let avvik = 0;
  for (let i = 0; i < a.length; i++) avvik |= a[i] ^ b[i];
  return avvik === 0;
}

const tjener = createServer(async (forespørsel, svar) => {
  const sti = (forespørsel.url ?? "/").split("?")[0];

  if (sti === "/helse") {
    return json(svar, 200, { ok: true, opptatt, nokkelSatt: Boolean(NOKKEL) });
  }

  if (!NOKKEL) {
    return json(svar, 503, { feil: "Skanneren er ikke konfigurert." });
  }
  if (!nokkelStemmer(forespørsel.headers["x-skanner-nokkel"])) {
    return json(svar, 401, { feil: "Ugyldig nøkkel." });
  }
  if (forespørsel.method !== "POST") {
    return json(svar, 405, { feil: "Bruk POST." });
  }
  if (sti !== "/cookie" && sti !== "/uu") {
    return json(svar, 404, { feil: "Ukjent endepunkt." });
  }

  let kropp;
  try {
    kropp = await lesKropp(forespørsel);
  } catch (e) {
    return json(svar, 400, { feil: e.message });
  }

  let url;
  try {
    url = normaliserUrl(kropp.url);
  } catch (e) {
    return json(svar, 400, { feil: e.message });
  }
  if (!erTillattVert(url)) {
    return json(svar, 400, { feil: "Den adressen kan ikke skannes." });
  }

  if (opptatt) {
    svar.setHeader("retry-after", "20");
    return json(svar, 503, { feil: "Skanneren er opptatt. Prøv igjen om et halvt minutt." });
  }

  opptatt = true;
  const start = Date.now();
  try {
    const resultat = sti === "/cookie" ? await skannCookies(url.href) : await skannUu(url.href);
    return json(svar, 200, { ...resultat, millisekunder: Date.now() - start });
  } catch (e) {
    const melding = String(e?.message ?? e);
    const tidsavbrudd = /timeout|timed out/i.test(melding);
    console.error("[skanner] feilet:", melding);
    return json(svar, tidsavbrudd ? 504 : 502, {
      feil: tidsavbrudd
        ? "Siden svarte ikke innen 30 sekunder."
        : "Klarte ikke å laste siden i nettleseren.",
    });
  } finally {
    opptatt = false;
  }
});

tjener.listen(PORT, VERT, () => {
  console.log(`[skanner] lytter på ${VERT}:${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    tjener.close();
    await lukkNettleser();
    process.exit(0);
  });
}
