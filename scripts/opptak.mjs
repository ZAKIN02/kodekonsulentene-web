/**
 * Opptak av VÅRE EGNE verktøy mens de kjører.
 *
 * Hvorfor dette finnes: en visuell gjennomgang fant at 19 av 21 medieelementer
 * på nettstedet viser det samme genererte objektet – en stabel aluminiumsplater.
 * Hvert bilde er godt for seg, men gjentatt 19 ganger slutter det å si noe.
 * Brandboken rangerer dessuten ekte skjermbilder over alt vi kan generere
 * («Vis, ikke påstå»), og det eneste materialet på siden som faktisk overbeviser
 * er opptaket av sjekken som kjører mot nkom.no.
 *
 * Hvorfor BILDESEKVENS og ikke Playwrights recordVideo:
 *  - klippene spoles av scroll, så brukeren stopper på enkeltrammer og leser dem
 *    som stillbilder. Da gjelder stillbildekrav, og recordVideo gir variabel
 *    bildefrekvens med ujevn tidsakse.
 *  - pekerposisjon og dragning settes PER RAMME, så opptaket blir determenistisk
 *    og kan kjøres om igjen med identisk resultat.
 *  - vi tar opp på dobbel pikseltetthet og skalerer ned, noe som gir skarpere
 *    tekst enn en direkte 1:1-innspilling.
 *
 * ÆRLIGHET: opptakene viser ekte kjøringer mot ekte adresser. Degraderer et
 * verktøy – «Skanneren er ikke satt opp ennå» – er det den teksten som skal stå.
 * Et iscenesatt resultat på en side som selger ærlighet er verre enn ingen video.
 *
 * Bruk:
 *   node scripts/opptak.mjs <id> [--base http://127.0.0.1:4493] [--behold]
 *   node scripts/opptak.mjs --liste
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAMMER_PER_SEK = 30;
const BREDDE = 1600;
const HOYDE = 900; // 16:9, så nedskalering til 1920x1080 er eksakt
const TETTHET = 2; // tar opp på 3200x1800 og skalerer ned – skarpere tekst
const UT = "public/opptak";
const TMP = ".skudd/opptak-tmp";
const TRINN = [1920, 1280, 960];

/** Jevn inn/ut, så pekeren ikke starter og stopper brått. */
const mykt = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Hvert opptak sier hva det viser, hvor det hører hjemme, og hvordan det kjøres.
 * `rammer` kalles én gang per ramme med (side, andel 0–1).
 */
const OPPTAK = {
  rontgen: {
    url: "/lab/rontgen",
    sek: 8,
    // Presist: headerne er ekte svar, WCAG-punktene er KRAVENE – ikke funn på
    // denne siden. Første formulering slo dem sammen og overdrev.
    tekst: "Røntgenlinsen på vår egen forside. Sikkerhetsheaderne som kommer fram er de serveren faktisk sender; WCAG-punktene er kravene siden måles mot.",
    plass: "/sikkerhet, som sidens bevis – og den er sidens signaturinteraksjon",
    // Klipp til selve flaten. Uten dette fyller linsen en firedel av bildet, og
    // resten er tom side – effekten drukner i marger.
    klipp: "[data-rontgen-flate]",
    /** Klargjør: scroll flaten til midten og vent til laget er malt. */
    async klar(p) {
      await p.locator("[data-rontgen-flate]").scrollIntoViewIfNeeded();
      await p.waitForTimeout(900);
    },
    /** Pekeren sveiper over flaten og skjærer hull i designet der den peker. */
    async ramme(p, a) {
      const b = await p.locator("[data-rontgen-flate]").boundingBox();
      if (!b) return;
      // Fram og tilbake, så klippet ender der det startet uten ping-pong i fila.
      const f = mykt(a < 0.5 ? a * 2 : (1 - a) * 2);
      await p.mouse.move(b.x + b.width * (0.12 + 0.76 * f), b.y + b.height * (0.34 + 0.3 * f));
    },
  },

  priskalkulator: {
    url: "/verktoy/priskalkulator",
    sek: 9,
    // IKKE klipp: #kalk er 1466 CSS px høyt, altså høyere enn vinduet, så et
    // klipp ga 1920x2932 – stående format i en liggende ramme, og 5,4 MB.
    // Vinduet rammer den i stedet, og 16:9 beholdes.
    // Siden sier selv «Et estimat er et spenn. Et tilbud er et tall». Første
    // bildetekst påsto det motsatte.
    tekst: "Priskalkulatoren regner mens du velger. Den gir et spenn med gulv, ikke et tilbud – postene er de samme vi bruker når vi regner.",
    plass: "/priser, over prislisten – den viser at prisen er en utregning, ikke et forhandlingsutspill",
    async klar(p) {
      // Legg summen og de første valgene i bildet samtidig – det er sammenhengen
      // mellom dem som er poenget.
      await p.locator("#kalk").scrollIntoViewIfNeeded();
      await p.evaluate(() => window.scrollBy(0, 120));
      await p.waitForTimeout(700);
    },
    /** Krysser av valgene ett og ett, så summen teller opp mellom hvert. */
    async ramme(p, a, st) {
      const bokser = await p.locator('#kalk input[type="checkbox"]').all();
      if (!bokser.length) return;
      // Fordel avkryssingene utover de første to tredelene av klippet.
      const antall = Math.min(bokser.length, Math.floor((a / 0.66) * bokser.length));
      st.gjort ??= 0;
      while (st.gjort < antall) {
        await bokser[st.gjort].check({ timeout: 4000 }).catch(() => {});
        st.gjort++;
        await p.waitForTimeout(60);
      }
    },
  },

  dmarc: {
    url: "/verktoy/dmarc",
    sek: 9,
    tekst: "DMARC-sjekken gjør ekte DNS-oppslag. Her mot nkom.no, og statusene er det DNS faktisk svarte.",
    plass: "/sikkerhet eller /verktoy/dmarc – den beviser at verktøyet gjør et reelt oppslag",
    async klar(p) {
      const felt = p.locator('input[type="text"], input[type="url"], input[type="search"]').first();
      await felt.scrollIntoViewIfNeeded();
      await p.waitForTimeout(500);
    },
    /**
     * Skriver domenet tegn for tegn, kjører, og ruller ned til svaret.
     *
     * Første versjon skrev `n = floor((a/0.45) * lengde)` og sendte ved a >= 0,45.
     * Siste tegn ble derfor ALDRI skrevet: oppslaget gikk mot «nkom.n», et domene
     * som ikke finnes, og rapporten viste «SPF: BRUDD, mangler». Bildeteksten ville
     * påstått et ekte oppslag mot nkom.no. Et iscenesatt resultat på en side som
     * selger ærlighet er verre enn ingen video – derfor skrives hele strengen
     * ferdig, og det verifiseres før Enter.
     */
    async ramme(p, a, st) {
      const felt = p.locator('input[type="text"], input[type="url"], input[type="search"]').first();
      const ord = "nkom.no";
      if (a < 0.34) {
        const n = Math.min(ord.length, Math.ceil((a / 0.33) * ord.length));
        st.skrevet ??= 0;
        while (st.skrevet < n) {
          await felt.press(ord[st.skrevet], { timeout: 3000 }).catch(() => {});
          st.skrevet++;
        }
      } else if (!st.sendt) {
        st.sendt = true;
        // Fyll resten direkte hvis tidsaksen ikke rakk alle tegn.
        const na = await felt.inputValue().catch(() => "");
        if (na !== ord) await felt.fill(ord).catch(() => {});
        await felt.press("Enter").catch(() => {});
      } else if (a > 0.5 && !st.rullet) {
        // Rapporten ligger under folden. Uten dette filmer vi tom plass.
        st.rullet = true;
        await p.locator(".kk-report, table").first().scrollIntoViewIfNeeded().catch(() => {});
      }
    },
  },
};

// ---- argumenter -------------------------------------------------------------
const args = process.argv.slice(2);
if (args.includes("--liste") || !args.length) {
  for (const [id, o] of Object.entries(OPPTAK)) console.log(`  ${id.padEnd(16)} ${o.url}  (${o.sek}s)`);
  process.exit(0);
}
const id = args[0];
const scene = OPPTAK[id];
if (!scene) {
  console.error(`Ukjent opptak «${id}». Kjør --liste for å se hvilke som finnes.`);
  process.exit(1);
}
const b = args.indexOf("--base");
const BASE = b > -1 ? args[b + 1] : "http://127.0.0.1:4493";
const behold = args.includes("--behold");

// ---- ta opp -----------------------------------------------------------------
const rammer = scene.sek * RAMMER_PER_SEK;
const tmp = join(TMP, id);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(UT, { recursive: true });

console.log(`Tar opp «${id}» – ${rammer} rammer à ${BREDDE * TETTHET}x${HOYDE * TETTHET}`);
const nettleser = await chromium.launch();
const ctx = await nettleser.newContext({
  viewport: { width: BREDDE, height: HOYDE },
  deviceScaleFactor: TETTHET,
  colorScheme: "dark",
  // Opptaket skal vise bevegelsen i verktøyet, ikke sidens egen inntoning.
  reducedMotion: "reduce",
});
const p = await ctx.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(BASE + scene.url, { waitUntil: "networkidle", timeout: 45000 });
await scene.klar?.(p);

// Klippeflaten måles ÉN gang. Måles den per ramme, vandrer utsnittet med
// layouten og klippet rister. Partall på begge mål, ellers klager h264.
let klipp;
if (scene.klipp) {
  const b = await p.locator(scene.klipp).boundingBox();
  if (b) klipp = {
    x: Math.round(b.x), y: Math.round(b.y),
    width: Math.round(b.width / 2) * 2, height: Math.round(b.height / 2) * 2,
  };
}

const st = {};
for (let i = 0; i < rammer; i++) {
  await scene.ramme(p, i / (rammer - 1), st);
  await p.screenshot({ path: join(tmp, `r${String(i).padStart(4, "0")}.png`), animations: "allow", clip: klipp });
}
await ctx.close();
await nettleser.close();
if (feil.length) console.log(`  ADVARSEL – konsollfeil under opptak: ${feil.slice(0, 3).join(" | ")}`);

// ---- enkod ------------------------------------------------------------------
/**
 * CRF 19 og -g 8, som de andre scenene. Tette nøkkelbilder er det eneste som
 * gjør scroll-spoling jevn; uten dem står videoen stille mellom nøkkelbildene.
 * CRF under 19 kjøper ingenting – kilden her er allerede tapsfri PNG, men
 * lavere CRF gir bare større fil uten synlig gevinst på skjermtekst.
 */
const linjer = [];
for (const bredde of TRINN) {
  const fil = `${UT}/${id}-${bredde}.mp4`;
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y",
    "-framerate", String(RAMMER_PER_SEK),
    "-i", join(tmp, "r%04d.png"),
    "-vf", `scale=${bredde}:-2:flags=lanczos`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "19",
    "-g", "8", "-keyint_min", "8", "-sc_threshold", "0",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-an", fil,
  ]);
  const bits = JSON.parse(execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=bit_rate,duration", "-of", "json", fil,
  ]).toString()).format;
  linjer.push({
    fil,
    mb: +(statSync(fil).size / 1048576).toFixed(2),
    mbit: +(bits.bit_rate / 1e6).toFixed(2),
    sek: +(+bits.duration).toFixed(1),
  });
}

// Plakat fra en ramme midt i, der noe faktisk har skjedd – ikke første ramme.
const plakatRamme = join(tmp, `r${String(Math.floor(rammer * 0.62)).padStart(4, "0")}.png`);
const plakat = `${UT}/${id}-poster.avif`;
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", plakatRamme,
  "-vf", "scale=1280:-2:flags=lanczos", "-c:v", "libaom-av1", "-crf", "34", "-still-picture", "1", plakat]);

// Målte dimensjoner, aldri skrevet for hånd: en håndskrevet dimensjon på logoen
// ga CLS 0,145 i produksjon og brøt ytelsesløftet vi selger på.
const mal = JSON.parse(execFileSync("ffprobe", [
  "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", `${UT}/${id}-1920.mp4`,
]).toString()).streams[0];

const manifestSti = "src/data/opptak.json";
const manifest = existsSync(manifestSti) ? JSON.parse(readFileSync(manifestSti, "utf8")) : {};
manifest[id] = {
  smal: `/opptak/${id}-960.mp4`,
  bred: `/opptak/${id}-1280.mp4`,
  stor: `/opptak/${id}-1920.mp4`,
  plakat: `/opptak/${id}-poster.avif`,
  bredde: mal.width,
  hoyde: mal.height,
  tekst: scene.tekst,
  kilde: new Date().toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" }),
};
writeFileSync(manifestSti, JSON.stringify(manifest, null, 2) + "\n");

if (!behold) rmSync(tmp, { recursive: true, force: true });

console.log(`\n«${id}» ferdig – ${mal.width}x${mal.height}`);
for (const l of linjer) console.log(`  ${l.fil.padEnd(34)} ${String(l.mb).padStart(6)} MB  ${String(l.mbit).padStart(5)} Mbit/s  ${l.sek}s`);
console.log(`  ${plakat.padEnd(34)} ${(statSync(plakat).size / 1024).toFixed(1)} kB`);
console.log(`  foreslått plassering: ${scene.plass}`);
