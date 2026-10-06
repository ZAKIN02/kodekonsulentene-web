/** Leser faktisk beregnet stil med og uten redusert bevegelse. En media-spørring
 *  gir ingen ekstra spesifisitet, så rekkefølge avgjør – og det er ikke synlig
 *  noe sted uten å måle. */
import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const b = await chromium.launch();
for (const motion of ["no-preference", "reduce"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: motion === "reduce" ? "reduce" : "no-preference" });
  await p.goto(url, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const m = document.querySelector(".hist__media"), sc = document.querySelector(".hist__scener");
    return { media: m && getComputedStyle(m).position, scenerMarginTop: sc && getComputedStyle(sc).marginTop };
  });
  console.log(` ${motion.padEnd(14)}`, JSON.stringify(r));
  await p.close();
}
await b.close();
