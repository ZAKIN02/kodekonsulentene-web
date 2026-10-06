import { chromium } from "@playwright/test";
const URL = "http://127.0.0.1:4399/lab/interaksjon";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 950 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 140)));
p.on("pageerror", (e) => feil.push("PAGEERROR " + e.message.slice(0, 140)));
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForTimeout(600);

const les = (sel, v) => p.evaluate(([s, n]) => {
  const e = document.querySelector(s);
  return e ? getComputedStyle(e).getPropertyValue(n).trim() : null;
}, [sel, v]);
const status = (sel) => p.evaluate((s) => document.querySelector(s)?.textContent?.trim() ?? null, sel);

/* ---------- 1. LAGSTABEL: ekte draing ---------- */
const scene = await p.locator("[data-stabel] [data-stabel-scene]").first();
await scene.scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
const box = await scene.boundingBox();
const aFor = await les("[data-stabel]", "--a");
await p.screenshot({ path: ".skudd/i1-stabel-samlet.png", clip: box });

await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await p.mouse.down();
for (let i = 1; i <= 8; i++) {
  await p.mouse.move(box.x + box.width / 2 + i * 30, box.y + box.height / 2 - i * 14);
  await p.waitForTimeout(25);
}
const aUnder = await les("[data-stabel]", "--a");
await p.screenshot({ path: ".skudd/i2-stabel-dratt.png", clip: box });
await p.mouse.up();
const aEtter = await les("[data-stabel]", "--a");
const stabelStatus = await status("[data-stabel-status]");

/* ---------- 2. LAGSTABEL: tastatur ---------- */
await p.locator("[data-stabel] .spak").first().focus();
for (let i = 0; i < 10; i++) await p.keyboard.press("ArrowLeft");
const aTast = await les("[data-stabel]", "--a");
const stabelTastStatus = await status("[data-stabel-status]");

/* ---------- 3. LAGSTABEL: knapp ---------- */
await p.locator("[data-stabel-knapp]").first().click();
await p.waitForTimeout(700);
const aKnapp = await les("[data-stabel]", "--a");
const knappTrykt = await p.getAttribute("[data-stabel-knapp]", "aria-pressed");
await p.screenshot({ path: ".skudd/i3-stabel-knapp.png", clip: box });

/* ---------- 4. SLEPESAMMENLIGNING: ekte draing ---------- */
const flate = p.locator("[data-slep] [data-slep-flate]").first();
await flate.scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
const fb = await flate.boundingBox();
const pFor = await les("[data-slep]", "--p");
await p.mouse.move(fb.x + fb.width * 0.5, fb.y + fb.height / 2);
await p.mouse.down();
await p.mouse.move(fb.x + fb.width * 0.82, fb.y + fb.height / 2, { steps: 10 });
const pUnder = await les("[data-slep]", "--p");
await p.screenshot({ path: ".skudd/i4-slep-dratt.png", clip: fb });
await p.mouse.up();
const slepStatus = await status("[data-slep-status]");

/* ---------- 5. SLEPESAMMENLIGNING: tastatur ---------- */
await p.locator("[data-slep] .spak").first().focus();
for (let i = 0; i < 25; i++) await p.keyboard.press("ArrowLeft");
const pTast = await les("[data-slep]", "--p");
await p.screenshot({ path: ".skudd/i5-slep-tastatur.png", clip: fb });

/* ---------- 6. PEKERKORT: peker og fokus ---------- */
const kort = p.locator("[data-pekerkort]").first();
await kort.scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
const kb = await kort.boundingBox();
await p.mouse.move(kb.x + kb.width * 0.15, kb.y + kb.height * 0.3);
await p.waitForTimeout(150);
const kortVenstre = await p.evaluate(() => {
  const e = document.querySelector("[data-pekerkort]");
  return { p: e.style.getPropertyValue("--p"), t: e.style.transform };
});
await p.mouse.move(kb.x + kb.width * 0.85, kb.y + kb.height * 0.7);
await p.waitForTimeout(150);
const kortHoyre = await p.evaluate(() => {
  const e = document.querySelector("[data-pekerkort]");
  return { p: e.style.getPropertyValue("--p"), t: e.style.transform };
});
await p.screenshot({ path: ".skudd/i6-pekerkort.png", clip: { x: kb.x - 10, y: kb.y - 20, width: kb.width + 20, height: kb.height + 30 } });

await p.evaluate(() => document.querySelector("[data-pekerkort]").focus());
await p.waitForTimeout(150);
const kortFokus = await p.evaluate(() => document.querySelector("[data-pekerkort]").style.getPropertyValue("--p"));

console.log(JSON.stringify({
  stabel: { foer: aFor, underDra: aUnder, etterSlipp: aEtter, etterTastatur: aTast, etterKnapp: aKnapp, knappTrykt, status: stabelStatus, tastStatus: stabelTastStatus },
  slep: { foer: pFor, underDra: pUnder, etterTastatur: pTast, status: slepStatus },
  pekerkort: { venstre: kortVenstre, hoyre: kortHoyre, vedFokus: kortFokus },
  feil: feil.length ? feil : "ingen",
}, null, 1));
await b.close();
