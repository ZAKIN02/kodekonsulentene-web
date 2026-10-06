import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const r = await p.evaluate(() => {
  const m = document.querySelector(".mega");
  // Ingressen er ikke alltid neste søsken – Mega ligger i en .mega-blokk.
  const blokk = m?.closest(".mega-blokk") ?? m;
  let n = blokk?.nextElementSibling;
  while (n && !n.textContent?.trim()) n = n.nextElementSibling;
  n = n?.querySelector("p") ?? n;
  if (!m || !n) return null;
  // Faktisk blekk på siste linje, ikke elementboksen.
  const omr = document.createRange();
  omr.selectNodeContents(m);
  const linjer = [...omr.getClientRects()];
  const siste = linjer[linjer.length - 1];
  const i = n.getBoundingClientRect();
  return { glyfBunn: +siste.bottom.toFixed(1), ingressTopp: +i.top.toFixed(1),
           overlapp: +(siste.bottom - i.top).toFixed(1) };
});
console.log(JSON.stringify(r));
await b.close();
