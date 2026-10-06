/** Maaler tomrom INNE i en navngitt seksjon, ved faktisk blekk. */
import { chromium } from "playwright";
const [base, side, velger, breddeArg] = process.argv.slice(2);
const bredde = +(breddeArg ?? 1512);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
await p.goto(base + side, { waitUntil: "networkidle" });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(120); }
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
const r = await p.evaluate((vel) => {
  const sek = document.querySelector(vel);
  if (!sek) return { feil: "fant ikke seksjonen" };
  const sr = sek.getBoundingClientRect();
  const topp = sr.top + scrollY, bunn = sr.bottom + scrollY;
  const n = Math.ceil((bunn - topp) / 4);
  const rader = new Array(n).fill(false);
  const merk = (a0, z0) => {
    const a = Math.max(0, Math.floor((a0 - topp) / 4)), z = Math.min(n, Math.ceil((z0 - topp) / 4));
    for (let i = a; i < z; i++) rader[i] = true;
  };
  const synlig = (el) => { const c = getComputedStyle(el); return c.visibility !== "hidden" && c.display !== "none" && +c.opacity > 0.03; };
  const gaa = document.createTreeWalker(sek, NodeFilter.SHOW_TEXT);
  for (let t = gaa.nextNode(); t; t = gaa.nextNode()) {
    if (!t.nodeValue?.trim()) continue;
    const far = t.parentElement; if (!far || !synlig(far)) continue;
    const rg = document.createRange(); rg.selectNodeContents(t);
    for (const k of rg.getClientRects()) if (k.height > 1) merk(k.top + scrollY, k.bottom + scrollY);
  }
  for (const el of sek.querySelectorAll("img,video,svg,canvas,hr,input,button,select,textarea,[data-scenefilm]")) {
    if (!synlig(el)) continue;
    const k = el.getBoundingClientRect();
    if (k.height > 1 && k.width > 1) merk(k.top + scrollY, k.bottom + scrollY);
  }
  for (const el of sek.querySelectorAll("*")) {
    if (!synlig(el)) continue;
    const c = getComputedStyle(el), k = el.getBoundingClientRect();
    if (k.width < 40) continue;
    if (parseFloat(c.borderTopWidth) > 0) merk(k.top + scrollY, k.top + scrollY + 2);
    if (parseFloat(c.borderBottomWidth) > 0) merk(k.bottom + scrollY - 2, k.bottom + scrollY);
  }
  const band = []; let s0 = null;
  for (let i = 0; i <= n; i++) {
    const f = i < n ? rader[i] : true;
    if (!f && s0 === null) s0 = i;
    if (f && s0 !== null) { const px = (i - s0) * 4; if (px >= 60) band.push({ fra: s0 * 4, px }); s0 = null; }
  }
  const fylt = rader.filter(Boolean).length;
  return { hoyde: Math.round(bunn - topp), blekkPst: Math.round((fylt / n) * 100),
           band: band.sort((a, z) => z.px - a.px).slice(0, 4) };
}, velger);
console.log(`  ${side} ${velger} @${bredde}px:`, JSON.stringify(r));
await b.close();
