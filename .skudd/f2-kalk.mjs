import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const feil = [];
p.on("console", m => m.type() === "error" && feil.push(m.text()));
p.on("pageerror", e => feil.push(String(e)));
await p.goto("http://127.0.0.1:4464/verktoy/priskalkulator", { waitUntil: "networkidle" });

const start = await p.textContent("[data-sum]");

// Hak av en integrasjon og prøvetak summen mens den endrer seg.
const proever = [];
const les = setInterval(async () => {}, 0); clearInterval(les);
await p.click('input[name="integrasjon"]');
for (let i = 0; i < 14; i++) {
  proever.push(await p.textContent("[data-sum]"));
  await p.waitForTimeout(30);
}
await p.waitForTimeout(500);
const slutt = await p.textContent("[data-sum]");

const unike = [...new Set(proever)];

// Tilstanden på den avkryssede raden
const rad = await p.evaluate(() => {
  const inp = document.querySelector('#kalk input[name="integrasjon"]');
  const lab = inp.closest("label.row");
  const cs = getComputedStyle(lab);
  return { borderInlineStartColor: cs.borderInlineStartColor, color: cs.color };
});

console.log(JSON.stringify({ start, slutt, mellomsteg: unike.length, prove: unike.slice(0,5), rad, feil }, null, 2));
await b.close();
