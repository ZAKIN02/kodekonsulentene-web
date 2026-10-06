/** Kvitteringen måles fra FØRSTE bilde: goto stopper ved «commit», ikke ved load. */
import { chromium, firefox } from "@playwright/test";
const BASE = "http://127.0.0.1:4425";
for (const [navn, motor] of [["Chromium", chromium], ["Firefox", firefox]]) {
  for (const redusert of [false, true]) {
    const b = await motor.launch();
    const s = await b.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: redusert ? "reduce" : "no-preference" });
    await s.goto(`${BASE}/kontakt?sendt=1`, { waitUntil: "commit" });
    const spor = await s.evaluate(async () => {
      const ut = [];
      let el = null;
      for (let i = 0; i < 40; i++) {
        el ??= document.querySelector(".kvittering");
        if (el) ut.push(+(+getComputedStyle(el).opacity).toFixed(2));
        await new Promise(requestAnimationFrame);
      }
      return ut;
    });
    const slutt = await s.evaluate(() => getComputedStyle(document.querySelector(".kvittering")).opacity);
    console.log(`${navn}${redusert ? " (redusert)" : "          "}: ${spor.slice(0, 10).join(" ")} … slutt ${slutt}`);
    await b.close();
  }
}
