import { chromium } from "@playwright/test";
const ut = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".teaser").scrollIntoView({ block: "end" }));
await p.waitForFunction(() => document.querySelector(".teaser")?.dataset.film === "klar", { timeout: 15000 });

const tider = [];
for (const [i, andel] of [0.15, 0.4, 0.65, 0.9].entries()) {
  await p.evaluate((a) => {
    const el = document.querySelector(".teaser");
    const topp = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, topp - window.innerHeight + (window.innerHeight + el.offsetHeight) * a);
  }, andel);
  await p.waitForTimeout(500);
  tider.push(await p.evaluate(() => +document.querySelector(".teaser video").currentTime.toFixed(2)));
  await p.screenshot({ path: `${ut}/scrub-${i}.png`, clip: await p.locator(".teaser").boundingBox().then(bb => ({...bb, y: Math.max(0, bb.y)})) }).catch(() => {});
}
console.log("video currentTime ved 15/40/65/90 % scroll:", tider.join(" → "));
console.log("konsollfeil:", feil.length ? feil : "ingen");
await b.close();
