import { chromium } from "playwright";
const lum = (r,g,b)=>{const f=c=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1512,height:900}, colorScheme:"dark" });
await p.goto(process.argv[2], { waitUntil:"networkidle" });
const r = await p.evaluate(() => {
  const el = [...document.querySelectorAll("p.small.faint")].find(e=>e.textContent.includes("Konseptarbeid"));
  const cs = getComputedStyle(el);
  const bg = getComputedStyle(document.body).backgroundColor;
  const rect = el.getBoundingClientRect();
  const film = document.querySelector("[data-scenefilm]");
  const fr = film?.getBoundingClientRect();
  return { farge: cs.color, bg, x: Math.round(rect.x), bredde: Math.round(rect.width),
           filmBredde: fr ? Math.round(fr.width) : null, maske: film ? getComputedStyle(film).getPropertyValue("--maske") : null };
});
const c = r.farge.match(/\d+/g).map(Number), g = r.bg.match(/\d+/g).map(Number);
const Lt = lum(c[0],c[1],c[2]), Lb = lum(g[0],g[1],g[2]);
const k = (Math.max(Lt,Lb)+0.05)/(Math.min(Lt,Lb)+0.05);
console.log(`  .faint ${r.farge} mot bakgrunn ${r.bg} = ${k.toFixed(2)}:1`);
console.log(`  tekstboks x=${r.x} bredde=${r.bredde}, film bredde=${r.filmBredde}, --maske=${r.maske}`);
await b.close();
