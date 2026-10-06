/** Ekte navigasjon, ikke setContent. Fyrer @starting-style ved FØRSTE maling av et
 *  element som allerede står i HTML-en? */
import { chromium, firefox } from "@playwright/test";
const SIDE = "data:text/html," + encodeURIComponent(`<!doctype html><meta charset=utf-8>
<style>.boks{opacity:1;transition:opacity 5s linear;background:#333;height:40px}
@starting-style{.boks{opacity:0}}</style><div class="boks" id=a></div>`);

for (const [navn, motor] of [["Chromium", chromium], ["Firefox", firefox]]) {
  const b = await motor.launch();
  const s = await b.newPage();
  await s.goto(SIDE, { waitUntil: "commit" });
  const ut = await s.evaluate(async () => {
    const r = []; let el = null, n = 0;
    while (n++ < 30) { el ??= document.querySelector("#a"); if (el) r.push(+(+getComputedStyle(el).opacity).toFixed(3)); await new Promise(requestAnimationFrame); }
    return r;
  });
  console.log(`${navn}: ${ut.slice(0, 8).join(" ")}  | min ${Math.min(...ut)}`);
  await b.close();
}
