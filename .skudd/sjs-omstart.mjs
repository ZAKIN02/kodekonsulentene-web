/** Virker den ene omstarten? Panelet skal kjøre på nytt for den som kommer
 *  scrollende etter at sekvensen er ferdig – men bare hvis den IKKE var synlig
 *  ved innlasting. */
import { chromium, devices } from "playwright";
const b = await chromium.launch();
for (const [navn, ctx] of [
  ["mobil (panelet under folden)", { ...devices["Pixel 7"] }],
  ["desktop (panelet synlig ved last)", { viewport: { width: 1440, height: 900 } }],
  ["lav skjerm (panelet under folden)", { viewport: { width: 1440, height: 560 } }],
]) {
  const s = await b.newPage({ ...ctx, colorScheme: "dark" });
  await s.goto("http://127.0.0.1:4411/sjekk", { waitUntil: "networkidle" });
  const start = await s.evaluate(() => {
    const p = document.querySelector("[data-sjekk-sekvens] .sjs__panel");
    return { topp: Math.round(p.getBoundingClientRect().top), vindu: innerHeight };
  });
  await s.waitForTimeout(13000); // sekvensen er ferdig
  const foer = await s.evaluate(() => Math.max(...[...document.querySelector("[data-sjekk-sekvens] .sjs__panel").getAnimations({ subtree: true })].map((a) => Number(a.currentTime) || 0)));
  await s.evaluate(() => document.querySelector("[data-sjekk-sekvens] .sjs__panel").scrollIntoView({ block: "center" }));
  await s.waitForTimeout(900);
  const etter = await s.evaluate(() => Math.max(...[...document.querySelector("[data-sjekk-sekvens] .sjs__panel").getAnimations({ subtree: true })].map((a) => Number(a.currentTime) || 0)));
  console.log(`  ${navn}: topp ${start.topp}px av ${start.vindu}px vindu · klokke før scroll ${Math.round(foer)} ms, etter ${Math.round(etter)} ms  → ${etter < foer - 2000 ? "OMSTART" : "ingen omstart"}`);
  await s.close();
}
await b.close();
