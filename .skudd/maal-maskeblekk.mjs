/** Hvor mye av motivets lyse blekk faller i den SKJULTE halvdelen?
 *  Masken skjuler siden teksten står på. Er motivet komponert dit, ser kunden
 *  bare en avkappet rest – det skjedde på /apper-og-ai. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const r = await p.evaluate(async () => {
    const el = document.querySelector("[data-scenefilm]");
    if (!el) return null;
    el.scrollIntoView({ block: "center" });
    const v = el.querySelector("video");
    if (!v) return null;
    await new Promise((r) => (v.readyState >= 2 ? r() : v.addEventListener("loadeddata", r, { once: true })));
    v.currentTime = v.duration * 0.6;
    await new Promise((r) => setTimeout(r, 400));
    const c = document.createElement("canvas");
    c.width = 160; c.height = 90;
    c.getContext("2d").drawImage(v, 0, 0, 160, 90);
    const d = c.getContext("2d").getImageData(0, 0, 160, 90).data;
    const maske = parseFloat(getComputedStyle(el).getPropertyValue("--maske")) || 46;
    const vendtFlagg = el.hasAttribute("data-vend");
    let skjult = 0, synlig = 0, skjultVendt = 0, total = 0;
    for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) {
      const i = (y * 160 + x) * 4;
      const lys = (d[i] + d[i + 1] + d[i + 2]) / 3;
      if (lys < 45) continue;            // nesten svart bakgrunn teller ikke
      total++;
      // Verktøyet leser videorammen, ikke det malte resultatet. Er flaten
      // speilvendt, må x speiles før den sammenlignes med masken – ellers meldes
      // en rettet side fortsatt som feil.
      const pst = vendtFlagg ? 100 - (x / 160) * 100 : (x / 160) * 100;
      if (pst < maske) skjult++; else synlig++;
      // Speilvending avbilder x -> 100 - x.
      if (100 - pst < maske) skjultVendt++;
    }
    const vendt = vendtFlagg;
    return {
      maske, vendt,
      naa: Math.round((skjult / (total || 1)) * 100),
      vendtPst: Math.round((skjultVendt / (total || 1)) * 100),
    };
  });
  console.log(`  ${s.padEnd(22)} maske ${String(r?.maske ?? "-").padStart(3)}%  skjult nå: ${String(r?.naa ?? "-").padStart(3)}%  skjult vendt: ${String(r?.vendtPst ?? "-").padStart(3)}%`);
}
await b.close();
