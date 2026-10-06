import { chromium } from "playwright";
const b = await chromium.launch();

// 1. Redusert bevegelse: tallet skal hoppe rett fram.
const c1 = await b.newContext({ viewport:{width:1440,height:1000}, reducedMotion: "reduce" });
const p1 = await c1.newPage();
await p1.goto("http://127.0.0.1:4464/verktoy/priskalkulator", { waitUntil: "networkidle" });
const red = await p1.evaluate(async () => {
  const sett = [];
  const t = setInterval(() => sett.push(document.querySelector("[data-sum]")?.textContent), 16);
  document.querySelector('#kalk input[name="integrasjon"]').click();
  await new Promise(r => setTimeout(r, 600)); clearInterval(t);
  return [...new Set(sett)].length;
});
console.log("redusert bevegelse – unike verdier (1 = hopper rett fram):", red);

// 2. Kontrast på avkrysset rad
const kon = await p1.evaluate(() => {
  const lab = document.querySelector('#kalk input[name="integrasjon"]').closest("label.row");
  const L = (c) => { const [r,g,bb]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}); return 0.2126*r+0.7152*g+0.0722*bb; };
  let el = lab, bg = "rgb(255,255,255)";
  while (el) { const c = getComputedStyle(el).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { bg = c; break; } el = el.parentElement; }
  const a = L(getComputedStyle(lab).color), bl = L(bg);
  return { tekst: getComputedStyle(lab).color, bak: bg, kontrast: +(((Math.max(a,bl)+0.05)/(Math.min(a,bl)+0.05)).toFixed(2)) };
});
console.log("avkrysset rad kontrast:", JSON.stringify(kon));

// 3. Ekte DMARC-oppslag + inn-animasjon
const c2 = await b.newContext({ viewport:{width:1440,height:1000} });
const p2 = await c2.newPage();
const feil = [];
p2.on("console", m => m.type()==="error" && feil.push(m.text()));
p2.on("pageerror", e => feil.push(String(e)));
await p2.goto("http://127.0.0.1:4464/verktoy/dmarc", { waitUntil: "networkidle" });
await p2.fill("#domene", "nkom.no");
const opac = await p2.evaluate(async () => {
  const sett = [];
  const t = setInterval(() => { const el = document.querySelector("#resultat > *"); if (el) sett.push(getComputedStyle(el).opacity); }, 16);
  document.querySelector("#dmarc-skjema button[type=submit], #dmarc-skjema button").click();
  await new Promise(r => setTimeout(r, 2500)); clearInterval(t);
  return [...new Set(sett)];
});
const tekst = (await p2.textContent("#resultat"))?.replace(/\s+/g," ").trim().slice(0,170);
console.log("dmarc opasitetsverdier (>1 = glir inn):", opac.length, opac.slice(0,4));
console.log("dmarc resultat:", tekst);
console.log("konsollfeil:", feil);
await b.close();
