/**
 * Kontrast paa FAKTISKE GLYFFER mot det som faktisk ligger bak dem.
 *
 * To skudd: ett normalt, ett der tekstfargen settes transparent. Differansen er
 * noeyaktig glyffpikslene; skudd nr. 2 gir bakgrunnen PAA samme sted. Derfor maales
 * ikke tom boksflate ved siden av en kort linje - den fellen ga 3,16:1 paa noe som
 * egentlig var 4,84:1. Og `visibility: hidden` brukes IKKE, fordi den ogsaa fjerner
 * kortflaten under og ga en gang 1,00:1 paa fullt lesbar tekst.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const [base, side, breddeArg, ...velgere] = process.argv.slice(2);
const bredde = +(breddeArg ?? 1512);
const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const kontrast = (a, b) => { const [h, l] = a > b ? [a, b] : [b, a]; return (h + 0.05) / (l + 0.05); };

const tema = process.env.TEMA === "dark" ? "dark" : "light";
const br = await chromium.launch();
const ctx = await br.newContext({ viewport: { width: bredde, height: 900 }, colorScheme: tema });
const p = await ctx.newPage();
console.log(`  [tema: ${tema}]`);
await p.goto(base + side, { waitUntil: "networkidle" });
// Med UTENFILM=1 skjules scenefilmen, saa vi ser hva tekstfargen gir HELT UTEN
// film bak. Da kan en maaling under 4,5:1 tilskrives riktig aarsak.
if (process.env.UTENFILM) await p.addStyleTag({ content: "[data-scenefilm]{display:none !important}" });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 500) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(140); }

for (const vel of velgere) {
  const boks = await p.evaluate((v) => {
    const el = document.querySelector(v); if (!el) return null;
    el.scrollIntoView({ block: "center" }); return null;
  }, vel);
  await p.waitForTimeout(900);
  const r = await p.evaluate((v) => {
    const el = document.querySelector(v); if (!el) return null;
    const k = el.getBoundingClientRect();
    return { x: Math.round(k.x), y: Math.round(k.y), width: Math.round(k.width), height: Math.round(k.height) };
  }, vel);
  if (!r || r.width < 2 || r.height < 2) { console.log(`  ${vel}: fant ikke / tom`); continue; }
  await p.screenshot({ path: "/tmp/k-a.png", clip: r });
  await p.evaluate((v) => {
    const el = document.querySelector(v);
    el.dataset.kOrig = el.style.color || "";
    el.style.setProperty("color", "transparent", "important");
    for (const k of el.querySelectorAll("*")) k.style.setProperty("color", "transparent", "important");
  }, vel);
  await p.waitForTimeout(260);
  await p.screenshot({ path: "/tmp/k-b.png", clip: r });
  await p.evaluate((v) => {
    const el = document.querySelector(v);
    el.style.removeProperty("color");
    for (const k of el.querySelectorAll("*")) k.style.removeProperty("color");
  }, vel);
  const A = PNG.sync.read(readFileSync("/tmp/k-a.png"));
  const B = PNG.sync.read(readFileSync("/tmp/k-b.png"));
  // Antialiaserte KANTpiksler ligger alltid naer bakgrunnen, saa den verste
  // enkeltpikselen i en glyf er alltid ~1:1 uansett hvor lesbar teksten er.
  // Foerste versjon av dette verktoeyet maalte nettopp det og meldte 1,20:1 paa
  // tekst som er fullt lesbar. Her brukes bare glyffens KJERNE: pikslene der
  // forskjellen mot bakgrunnen er minst 70 % av den stoerste forskjellen.
  const diff = [];
  for (let i = 0; i < A.data.length; i += 4) {
    const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
    if (d >= 60) diff.push([i, d]);
  }
  const maksDiff = diff.reduce((m, [, d]) => Math.max(m, d), 0);
  const kjerne = diff.filter(([, d]) => d >= maksDiff * 0.9);
  let verst = Infinity, n = kjerne.length, fg = null, bg = null;
  for (const [i] of kjerne) {
    const c = kontrast(lum(A.data[i], A.data[i + 1], A.data[i + 2]), lum(B.data[i], B.data[i + 1], B.data[i + 2]));
    if (c < verst) { verst = c; fg = [A.data[i], A.data[i + 1], A.data[i + 2]]; bg = [B.data[i], B.data[i + 1], B.data[i + 2]]; }
  }
  if (!n) { console.log(`  ${vel}: fant ingen glyffpiksler`); continue; }
  console.log(`  ${vel.padEnd(26)} verst ${verst.toFixed(2)}:1  (${n} glyffpiksler, fg rgb(${fg}) paa bg rgb(${bg}))`);
}
await br.close();
