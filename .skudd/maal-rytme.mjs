/**
 * Måler dramaturgi som tall, ikke som følelse.
 *
 * «Statisk» er en følelse til man teller: hvor mange skalaskift finnes, hvor
 * mange seksjoner bryter ut av innholdsbredden, hvor mange bevegelsesøyeblikk
 * er det, og – det viktigste – hvor lang strekning kan du scrolle uten at noe
 * skjer. Den siste er den som faktisk kjennes som «flat».
 */
import { chromium } from "playwright";

const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const rader = [];

for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const m = await p.evaluate(() => {
    const H = document.documentElement.scrollHeight;
    const VH = window.innerHeight;

    // Skalaskift: distinkte malte skriftstørrelser over 20px. Brødtekst og
    // etiketter teller ikke som skift – det er de STORE spranget som gir rytme.
    const stor = new Set();
    for (const el of document.querySelectorAll("h1,h2,h3,p,span,li,div,strong")) {
      if (!el.textContent?.trim()) continue;
      const f = parseFloat(getComputedStyle(el).fontSize);
      if (f >= 20) stor.add(Math.round(f));
    }

    // Utbrudd: elementer bredere enn innholdskolonnen (1120 px).
    let utbrudd = 0;
    for (const el of document.querySelectorAll("section,div,figure,video,img,ol,ul")) {
      const r = el.getBoundingClientRect();
      if (r.width > 1180 && r.height > 80) utbrudd++;
    }

    // Bevegelsesøyeblikk: noe som faktisk endrer seg når man scroller forbi.
    const beveger = [];
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      // animationTimeline leser "auto" i CSSOM selv når view() er satt – den er
      // ubrukelig som detektor. animationName er sannheten: er den "none", er
      // avdekkingen slått av, uansett hva tidslinjen sier.
      const harTidslinje = cs.animationName !== "none";
      const erFestet = cs.position === "sticky";
      const erFilm = el.tagName === "VIDEO";
      if (harTidslinje || erFestet || erFilm) {
        const r = el.getBoundingClientRect();
        beveger.push(Math.round(r.top + window.scrollY));
      }
    }
    beveger.sort((a, c) => a - c);

    // Lengste strekning uten et eneste bevegelsesøyeblikk, i skjermhøyder.
    let doed = 0, forrige = 0;
    for (const y of beveger) { doed = Math.max(doed, y - forrige); forrige = Math.max(forrige, y); }
    doed = Math.max(doed, H - forrige);

    return {
      hoyde: +(H / VH).toFixed(1),
      skalaskift: stor.size,
      storste: Math.max(...stor, 0),
      minste: Math.min(...stor, 999),
      utbrudd,
      bevegelser: beveger.length,
      doedSone: +(doed / VH).toFixed(1),
    };
  });
  rader.push({ side: s, ...m });
}

console.log(
  "side".padEnd(28) + "høyde  skala  størst  utbrudd  beveg  død-sone",
);
for (const r of rader) {
  console.log(
    r.side.padEnd(28) +
      String(r.hoyde).padStart(5) +
      String(r.skalaskift).padStart(7) +
      String(r.storste).padStart(8) +
      String(r.utbrudd).padStart(9) +
      String(r.bevegelser).padStart(7) +
      String(r.doedSone).padStart(10),
  );
}
const snitt = (k) => (rader.reduce((a, r) => a + r[k], 0) / rader.length).toFixed(1);
console.log("\nsnitt: skala " + snitt("skalaskift") + " | utbrudd " + snitt("utbrudd") +
            " | bevegelser " + snitt("bevegelser") + " | død-sone " + snitt("doedSone") + " skjermhøyder");
await b.close();
