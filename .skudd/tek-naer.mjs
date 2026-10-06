import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/lab/teknikker", { waitUntil: "networkidle" });
await p.waitForTimeout(800);

// text-wrap: balance — mål faktisk linjeantall og bredder
const tw = await p.evaluate(() => {
  const r = [...document.querySelectorAll(".prove")].map((h) => {
    const rng = document.createRange(); rng.selectNodeContents(h);
    const linjer = [...rng.getClientRects()].map((x) => Math.round(x.width));
    return { balansert: h.classList.contains("prove--balansert"), linjer };
  });
  return r;
});
console.log("text-wrap:");
tw.forEach((x) => console.log("  %-12s linjebredder: %s", x.balansert ? "balance" : "uten", x.linjer.join(", ")));

await p.locator(".to-spalter").screenshot({ path: ".skudd/tek-balance.png" });

// :has() — skriv ugyldig og gyldig, mål rammefargen
const felt = p.locator("#t-epost");
await felt.fill("ikke-en-epost");
await felt.blur();
await p.waitForTimeout(250);
const ugyldig = await p.evaluate(() => getComputedStyle(document.querySelector("#t-epost")).borderColor);
await felt.fill("post@kodekonsulentene.no");
await felt.blur();
await p.waitForTimeout(250);
const gyldig = await p.evaluate(() => getComputedStyle(document.querySelector("#t-epost")).borderColor);
console.log(":has():");
console.log("  ugyldig ->", ugyldig);
console.log("  gyldig  ->", gyldig);
await p.locator(".felt-demo").screenshot({ path: ".skudd/tek-has.png" });
await b.close();
