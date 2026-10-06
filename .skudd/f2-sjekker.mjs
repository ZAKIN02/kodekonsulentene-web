import { chromium } from "playwright";
const b = await chromium.launch();
for (const [side, felt] of [["uu-sjekk","#url-uu"],["cookie-sjekk","#url-cookie"]]) {
  const p = await (await b.newContext({ viewport:{width:1440,height:1000} })).newPage();
  const feil = [];
  p.on("pageerror", e => feil.push(String(e).slice(0,80)));
  await p.goto(`http://127.0.0.1:4464/verktoy/${side}`, { waitUntil: "networkidle" });
  const inp = p.locator(`${felt} input, input[type=url], input[name=url]`).first();
  await inp.fill("https://nkom.no");
  const opac = await p.evaluate(async () => {
    const sett = [];
    const t = setInterval(() => { const el=document.querySelector("#resultat > *"); if (el) sett.push(getComputedStyle(el).opacity); }, 16);
    document.querySelector("#resultat")?.closest("div")?.parentElement
      ?.querySelector("button")?.click()
      ?? document.querySelector("form button")?.click();
    await new Promise(r => setTimeout(r, 3000)); clearInterval(t);
    return [...new Set(sett)];
  });
  const tekst = (await p.textContent("#resultat"))?.replace(/\s+/g," ").trim().slice(0,110) || "(tomt)";
  console.log(`${side}: opasitetstrinn=${opac.length} | ${tekst}`);
  if (feil.length) console.log("   sidefeil:", feil);
}
await b.close();
