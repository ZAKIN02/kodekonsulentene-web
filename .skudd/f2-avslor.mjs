import { chromium } from "playwright";
const b = await chromium.launch();
for (const side of ["priskalkulator","dmarc","uu-sjekk","cookie-sjekk"]) {
  const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage();
  await p.goto(`http://127.0.0.1:4464/verktoy/${side}`, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const a = [...document.querySelectorAll(".scene:first-of-type .avslor")];
    return a.map(e => +getComputedStyle(e).opacity.slice(0,4));
  });
  const skjult = r.filter(o => o < 0.9).length;
  console.log(`${side.padEnd(16)} avdekkinger i scene 1: [${r.join(", ")}]  usynlige ved last: ${skjult}`);
  await p.close();
}
await b.close();
