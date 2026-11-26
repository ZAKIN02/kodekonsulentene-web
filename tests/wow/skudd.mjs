// Enkeltbilder av en side ved gitte rulleposisjoner (runde wow-r5), for å se på et øyeblikk.
// Bruk: [VISNING=mobil] [RM=1] [INFO='return …'] node tests/wow/skudd.mjs <url> <filprefiks> <y|rapport> …
// Lager <filprefiks>-<y>.png. INFO er et funksjonslegeme som kjøres i siden og skrives ut per bilde.
import { chromium } from "@playwright/test";
const [url, ut, ...ys] = process.argv.slice(2);
const mobil = process.env.VISNING === "mobil";
const b = await chromium.launch({ channel: "chrome" });
const ctx = await b.newContext({ viewport: mobil ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobil, hasTouch: mobil, reducedMotion: process.env.RM ? "reduce" : "no-preference" });
await ctx.addInitScript(() => sessionStorage.setItem("wow-inngang", "1"));
const p = await ctx.newPage();
p.on("pageerror", (e) => console.log("FEIL", e.message));
p.on("console", (m) => m.type() === "error" && console.log("KONSOLL", m.text()));
await p.goto(url, { waitUntil: "load" });
await p.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
await p.mouse.move(10, 10);
await new Promise((r) => setTimeout(r, 600));
for (const y of ys) {
  const yy = y === "rapport" ? await p.evaluate(() => document.querySelector("#rapport").getBoundingClientRect().top + scrollY) : Number(y);
  await p.evaluate((y) => scrollTo(0, y), yy);
  await new Promise((r) => setTimeout(r, 900));
  await p.screenshot({ path: `${ut}-${y}.png` });
  if (process.env.INFO) console.log(y, await p.evaluate(new Function(process.env.INFO)));
}
console.log("hoyde", await p.evaluate(() => [document.documentElement.scrollHeight, document.querySelector("[data-scroll-world]").offsetHeight, document.querySelector("#rapport")?.getBoundingClientRect().top + scrollY]));
await b.close();
