import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport:{width:1600,height:900}, colorScheme:"dark", reducedMotion:"no-preference" })).newPage();
await p.goto("http://127.0.0.1:4710/systemer", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => {
  const r = [...document.querySelectorAll(".flyt__ramme")];
  return { antall: r.length, geo: r.map(e => { const q = e.getBoundingClientRect();
    return { topp: Math.round(q.top+scrollY), h: Math.round(q.height), w: Math.round(q.width) }; }) };
}));
await b.close();
