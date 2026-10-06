import { chromium, devices } from "playwright";
const b = await chromium.launch();
for (const [navn, opt] of [["mobil (touch)", { ...devices["Pixel 7"] }], ["skrivebord", { viewport: { width: 1440, height: 900 } }]]) {
  const c = await b.newContext(opt);
  const p = await c.newPage();
  const feil = [];
  p.on("pageerror", (e) => feil.push(e.message.slice(0, 70)));
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  const f = p.locator("[data-slep-flate]").first();
  await f.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  const les = () => p.evaluate(() => getComputedStyle(document.querySelector("[data-slep-flate]")).getPropertyValue("--p").trim());
  const r = await f.boundingBox();
  const a = await les();
  if (opt.hasTouch) {
    await p.touchscreen.tap(r.x + r.width * 0.3, r.y + r.height / 2);
    await p.waitForTimeout(400);
  } else {
    await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await p.mouse.down(); await p.mouse.move(r.x + r.width * 0.3, r.y + r.height / 2, { steps: 10 }); await p.mouse.up();
    await p.waitForTimeout(400);
  }
  const bb = await les();
  console.log(`  ${navn.padEnd(14)} --p ${a} -> ${bb}  ${a !== bb ? "VIRKER" : "INGEN EFFEKT"}${feil.length ? "  feil: " + feil[0] : ""}`);
  await c.close();
}
await b.close();
