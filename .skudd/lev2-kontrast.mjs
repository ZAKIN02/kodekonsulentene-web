/**
 * Kontrast mellom tekst og det som FAKTISK males bak den.
 *
 * Hvorfor ikke lese background-color: en SceneFilm ligger bak seksjonen, ikke i
 * den. Går man opp i DOM-en etter en bakgrunnsfarge, finner man seksjonens egen
 * og får nøyaktig samme tall med og uten film. Målingen ser da riktig ut mens
 * teksten i virkeligheten står på et lyst bilde.
 *
 * Her tas et skjermbilde, og pikslene i tekstens egen boks brukes som bakgrunn.
 * Glyffene selv males over, så de lyseste pikslene i boksen er teksten og ikke
 * flaten – derfor brukes 60-prosentilen, som ligger i flaten mellom bokstavene.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const [url, ut, breddeArg] = process.argv.slice(2);
const bredde = Number(breddeArg ?? 1440);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });

const film = await p.$("[data-scenefilm]");
if (film) {
  await film.scrollIntoViewIfNeeded();
  await p.evaluate(() => {
    const v = document.querySelector("[data-scenefilm] video");
    if (v?.duration) v.currentTime = v.duration * 0.9;
  });
  await p.waitForTimeout(1200);
}

const bokser = await p.evaluate(() => {
  const ut = [];
  const sek = document.querySelector("[data-scenefilm]")?.parentElement;
  if (!sek) return ut;
  for (const el of sek.querySelectorAll("p, h1, h2, h3, li, a, dt, dd, span")) {
    const t = el.textContent?.trim();
    if (!t || el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || r.top < 0 || r.bottom > innerHeight) continue;
    const fg = getComputedStyle(el).color.match(/[\d.]+/g).map(Number);
    ut.push({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), fg, t: t.slice(0, 40) });
  }
  return ut;
});

await p.screenshot({ path: ut });
await b.close();

const png = PNG.sync.read(readFileSync(ut));
const lum = (r, g, bl) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
};

let verst = { forhold: 99, t: "", bak: null };
for (const bx of bokser) {
  const L = [];
  for (let y = bx.y; y < Math.min(bx.y + bx.h, png.height); y += 2)
    for (let x = bx.x; x < Math.min(bx.x + bx.w, png.width); x += 2) {
      const i = (png.width * y + x) << 2;
      L.push({ l: lum(png.data[i], png.data[i + 1], png.data[i + 2]), r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] });
    }
  if (!L.length) continue;
  L.sort((a, z) => a.l - z.l);
  const bak = L[Math.floor(L.length * 0.6)];
  const lt = lum(...bx.fg.slice(0, 3));
  const forhold = (Math.max(lt, bak.l) + 0.05) / (Math.min(lt, bak.l) + 0.05);
  if (forhold < verst.forhold) verst = { forhold: +forhold.toFixed(2), t: bx.t, bak: [bak.r, bak.g, bak.b] };
}
console.log(`  svakeste tekst mot FAKTISKE piksler: ${verst.forhold}:1  «${verst.t}»  bak=rgb(${verst.bak})`);
console.log(`  skjermbilde: ${ut}`);
