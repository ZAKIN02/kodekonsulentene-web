#!/usr/bin/env node
/**
 * Genererer delingsbilder (Open Graph) fra designsystemet.
 *
 *   node scripts/og.mjs            # alle sider
 *   node scripts/og.mjs --en /priser
 *
 * Hvorfor dette finnes: siden hadde `og:title` og `og:description`, men ingen
 * `og:image`. Deler noen en lenke på LinkedIn eller Slack, kommer den naken –
 * og for et byrå som selger nettsider er det en dårlig førsteinngang.
 *
 * Hvorfor satori og ikke en skjermbildetjeneste: bildene bygges fra de SAMME
 * tokenene og de SAMME fontfilene som siden serverer. Endrer aksentfargen seg i
 * tokens.css, endrer delingsbildene seg med den. Et skjermbilde ville drevet fra
 * designet første gang noen justerte en farge.
 *
 * Alt her er byggetid. satori, resvg og wawoff2 er utviklingsavhengigheter og
 * havner aldri i noe nettleseren laster.
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

/* ---------------------------------------------------------------- fonter ---- */

/**
 * Fontene ligger som statiske TTF i assets/fonts-og/, og de er ikke valgt fritt:
 * de er instansiert ut av NØYAKTIG de woff2-filene siden serverer, med fontTools.
 * Oppskriften står i docs/research-astro.md.
 *
 * Hvorfor ikke lese woff2 direkte: satori leser ikke woff2, og – viktigere – den
 * krasjer på variable fonter uansett format. `@shuding/opentype.js` feiler i
 * parseFvarAxis fordi den slår opp aksenavn i en name-tabell den ikke har lest
 * ennå. Testet med både Google Fonts' subsettede fil og den komplette fonten fra
 * google/fonts: samme krasj. Statisk instans er derfor eneste vei.
 */
const FONTER = {
  display: "assets/fonts-og/schibsted-grotesk-800.ttf",
  // Tekstvekt til ingressen. Uten den arver den 800, og ingressen slåss med
  // tittelen i stedet for å ligge under den.
  tekst: "assets/fonts-og/schibsted-grotesk-400.ttf",
  mono: "assets/fonts-og/jetbrains-mono-400.ttf",
};

/* ---------------------------------------------------------------- tokens ---- */

/** Leses fra tokens.css, ikke skrevet av på nytt. Ett sted å endre farge. */
function tokens() {
  const css = readFileSync("src/styles/tokens.css", "utf8");
  const blokk = css.slice(css.indexOf(":root"), css.indexOf('[data-theme="light"]'));
  const ut = {};
  for (const m of blokk.matchAll(/--([a-z-]+):\s*([^;]+);/g)) ut[m[1]] = m[2].trim();
  return ut;
}

/* ------------------------------------------------------------------ kort ---- */

const t = tokens();

/**
 * Kortet, som ren objektstruktur. Satori forventer React-elementer, men et
 * element ER bare { type, props } – så vi slipper React helt. Prosjektet har
 * ingen React-øyer, og skal ikke få det for et byggeskripts skyld.
 */
function kort({ eyebrow, tittel, beskrivelse, domene }) {
  const el = (type, style, children) => ({ type, props: { style, children } });

  return el("div", {
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    width: "1200px", height: "630px", padding: "72px",
    backgroundColor: t.bg, color: t.ink,
    fontFamily: "Schibsted Grotesk",
  }, [
    // Hårlinje øverst, med aksentmerke – samme språk som eyebrow-ene på siden.
    el("div", { display: "flex", alignItems: "center", gap: "14px",
      fontFamily: "JetBrains Mono", fontSize: "22px", letterSpacing: "0.08em" }, [
      el("span", { color: t.accent }, "//"),
      el("span", { color: t["ink-muted"] }, eyebrow.toUpperCase()),
    ]),

    el("div", { display: "flex", flexDirection: "column", gap: "24px" }, [
      el("div", {
        fontSize: tittel.length > 34 ? "76px" : "94px",
        fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.03em",
        color: t.ink, maxWidth: "1000px",
      }, tittel),
      beskrivelse
        ? el("div", { fontSize: "30px", fontWeight: 400, lineHeight: 1.45, color: t["ink-muted"], maxWidth: "860px" }, beskrivelse)
        : el("div", { display: "flex" }, []),
    ]),

    el("div", { display: "flex", alignItems: "center", justifyContent: "space-between",
      borderTop: `1px solid ${t.line}`, paddingTop: "28px",
      fontFamily: "JetBrains Mono", fontSize: "24px" }, [
      el("span", { color: t.ink }, domene),
      // Den ene aksentdetaljen per visning, slik brandboken krever.
      el("div", { display: "flex", width: "120px", height: "6px", backgroundColor: t.accent }, []),
    ]),
  ]);
}

/* ----------------------------------------------------------------- sider ---- */

const SIDER = [
  { sti: "/", fil: "forside", eyebrow: "KodeKonsulentene", tittel: "Nettsider og systemer som jobber for bedriften din", beskrivelse: "Fast pris, levert raskt, og du snakker med utvikleren underveis." },
  { sti: "/sjekk", fil: "sjekk", eyebrow: "Verktøy", tittel: "Sjekk nettsiden din gratis", beskrivelse: "Ytelse, sikkerhetsheadere, cookies før samtykke, WCAG og org.nr." },
  { sti: "/priser", fil: "priser", eyebrow: "Priser", tittel: "Prisene står her", beskrivelse: "Fordi du skal kunne regne på det før du ringer. Alle priser eks. mva." },
  { sti: "/sikkerhet", fil: "sikkerhet", eyebrow: "Sikkerhet", tittel: "Siden vår består sin egen sjekk", beskrivelse: "Sikkerhetsheadere, cookies, universell utforming og lovpålagt informasjon." },
  { sti: "/systemer", fil: "systemer", eyebrow: "Systemer", tittel: "Få systemene du betaler for til å snakke sammen", beskrivelse: "Booking, Vipps, Tripletex, Fiken og BankID – koblet til ett system." },
];

/* ------------------------------------------------------------------- kjør ---- */

const fonter = [
  { name: "Schibsted Grotesk", data: readFileSync(FONTER.display), weight: 800, style: "normal" },
  { name: "Schibsted Grotesk", data: readFileSync(FONTER.tekst), weight: 400, style: "normal" },
  { name: "JetBrains Mono", data: readFileSync(FONTER.mono), weight: 400, style: "normal" },
];

const bare = process.argv.includes("--en") ? process.argv[process.argv.indexOf("--en") + 1] : null;
const valgte = bare ? SIDER.filter((s) => s.sti === bare) : SIDER;
if (valgte.length === 0) { console.error(`Fant ingen side «${bare}».`); process.exit(1); }

mkdirSync("public/og", { recursive: true });
let sum = 0;
for (const side of valgte) {
  const svg = await satori(kort({ ...side, domene: "kodekonsulentene.no" }), {
    width: 1200, height: 630, fonts: fonter,
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  const fil = `public/og/${side.fil}.png`;
  writeFileSync(fil, png);
  sum += png.length;
  console.log(`  ${fil.padEnd(28)} ${(png.length / 1024).toFixed(0)} kB   ${side.sti}`);
}
console.log(`\n${valgte.length} bilder, ${(sum / 1024).toFixed(0)} kB til sammen.`);
