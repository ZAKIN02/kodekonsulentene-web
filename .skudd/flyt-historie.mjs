/** Ser PÅ historien i flytfiguren, i stedet for å telle CSS-egenskaper.
 *
 *  To målinger, fordi de svarer på to forskjellige spørsmål:
 *
 *   1. ROLIG (`sanntid`): figuren står i ro i skjermbildet, ingen scroller,
 *      ingen klikker. Vi tar bilder i sanntid og måler hvor mange piksler som
 *      faktisk endrer seg. Det er det eneste beviset på at den beveger seg av
 *      seg selv.
 *   2. STEGET (`steg`): alle animasjonene pauses og currentTime settes manuelt,
 *      så hver ramme er reproduserbar og hele løkken kan legges på ett ark.
 *      Uten dette blir rammene tilfeldige og arket umulig å lese.
 *
 *  Bruk: node .skudd/flyt-historie.mjs <url> <utkatalog> [figurindeks] [tema]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const [url, utDir, idxRaa, tema] = process.argv.slice(2);
const IDX = Number(idxRaa ?? 0);
mkdirSync(utDir, { recursive: true });

const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: tema === "light" ? "light" : "dark",
});
const p = await ctx.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(url, { waitUntil: "networkidle" });

// Figuren inn i skjermbildet og LA SKJELETTET BLI FERDIG TEGNET. Skjelettet går
// på scroll-tidslinjen; historien gjør ikke det, men et ark der boksene mangler
// forteller ingenting om historien.
await p.evaluate((i) => {
  document.querySelectorAll(".flyt__ramme")[i].scrollIntoView({ block: "center", behavior: "instant" });
}, IDX);
await p.waitForTimeout(1200);

const ramme = p.locator(".flyt__ramme").nth(IDX);

/* ---------------------------------------------------------------- 1. ROLIG --- */
const a = await ramme.screenshot();
await p.waitForTimeout(520);
const c = await ramme.screenshot();
await p.waitForTimeout(520);
const d = await ramme.screenshot();
// DEKODEDE piksler, ikke PNG-bytes: en komprimert strøm endrer seg i hele sin
// lengde av én piksel, så byte-sammenligning svarer «ja» på alt og måler ingen
// størrelse. Det var målefellen i gårsdagens runde.
const ulik = (x, y) => {
  const px = PNG.sync.read(x), py = PNG.sync.read(y);
  let n = 0, verst = 0;
  for (let i = 0; i < Math.min(px.data.length, py.data.length); i += 4) {
    const d = Math.abs(px.data[i] - py.data[i]) + Math.abs(px.data[i + 1] - py.data[i + 1]) + Math.abs(px.data[i + 2] - py.data[i + 2]);
    if (d > 24) n++;
    if (d > verst) verst = d;
  }
  return { n, verst, av: px.data.length / 4 };
};
const n1 = ulik(a, c);
const n2 = ulik(c, d);
console.log(`  ROLIG (ingen scroll, ingen klikk): ${n1.n > 200 && n2.n > 200 ? "BEVEGER SEG" : "STÅR STILLE"}  endrede piksler ${n1.n} og ${n2.n} av ${n1.av} (${((n1.n / n1.av) * 100).toFixed(2)} % / ${((n2.n / n2.av) * 100).toFixed(2)} %), største utslag ${n1.verst} av 765`);

/* --------------------------------------------------------------- 2. STEGET --- */
const info = await p.evaluate((i) => {
  const r = document.querySelectorAll(".flyt__ramme")[i];
  const mine = document.getAnimations().filter((an) => {
    const nav = an.animationName ?? "";
    return nav.startsWith("flyt-") && !["flyt-tegnes", "flyt-tones-inn"].includes(nav.replace(/_.*$/, "")) &&
      an.effect?.target && r.contains(an.effect.target instanceof Element ? an.effect.target : an.effect.target.element);
  });
  window.__mine = mine;
  mine.forEach((an) => an.pause());
  const navn = {};
  for (const an of mine) navn[an.animationName] = (navn[an.animationName] ?? 0) + 1;
  return { antall: mine.length, navn, loop: mine[0]?.effect?.getTiming?.().duration ?? null };
}, IDX);
console.log(`  animasjoner på dokumentets tidslinje i figuren: ${info.antall}`, info.navn, `loop ${info.loop}ms`);

const N = 12;
const LOOP = info.loop ?? 7200;
const filer = [];
for (let k = 0; k < N; k++) {
  const t = (LOOP * k) / N;
  const tilstand = await p.evaluate(([tid, i]) => {
    window.__mine.forEach((an) => { an.currentTime = tid; });
    const r = document.querySelectorAll(".flyt__ramme")[i];
    const les = (sel, egen) => [...r.querySelectorAll(sel)].map((e) => {
      const v = getComputedStyle(e)[egen];
      return egen === "opacity" ? (+v).toFixed(1) : String(v).replace("px", "").slice(0, 7);
    });
    return {
      glod: les(".flyt__glod", "opacity"),
      kvitt: les(".flyt__kvitt", "opacity"),
      pakke: les(".flyt__pakke", "opacity"),
      pakkeX: [...r.querySelectorAll(".flyt__pakke")].map((e) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(e).transform);
        return Math.round(m.m41);
      }),
    };
  }, [t, IDX]);
  const f = `${utDir}/steg-${String(k).padStart(2, "0")}.png`;
  writeFileSync(f, await ramme.screenshot());
  filer.push(f);
  console.log(
    `  t=${(t / 1000).toFixed(2)}s  glød[${tilstand.glod.join(" ")}]  kvitt[${tilstand.kvitt.join(" ")}]  pakke[${tilstand.pakke.join(" ")}] x[${tilstand.pakkeX.join(" ")}]`,
  );
}
console.log("  konsollfeil:", feil.length ? feil.join(" | ") : "ingen");
await b.close();
