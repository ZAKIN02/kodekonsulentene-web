import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 90)));
p.on("pageerror", (e) => feil.push("pageerror: " + e.message.slice(0, 90)));
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const slep = p.locator("[data-slep], .slep").first();
await slep.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
const spak = p.locator('input[type="range"]').first();
const les = () => p.evaluate(() => {
  const el = document.querySelector("[data-slep], .slep");
  const inp = document.querySelector('input[type="range"]');
  const cs = getComputedStyle(el);
  return { andel: cs.getPropertyValue("--andel").trim() || cs.getPropertyValue("--slep").trim(),
           verdi: inp?.value, accent: getComputedStyle(inp).accentColor,
           hoyde: Math.round(inp.getBoundingClientRect().height) };
});
console.log("  før:   ", JSON.stringify(await les()));
await spak.focus();
for (let i = 0; i < 8; i++) await p.keyboard.press("ArrowRight");
await p.waitForTimeout(350);
console.log("  piltast:", JSON.stringify(await les()));
const r = await spak.boundingBox();
await p.mouse.move(r.x + r.width * 0.5, r.y + r.height / 2);
await p.mouse.down(); await p.mouse.move(r.x + r.width * 0.15, r.y + r.height / 2, { steps: 12 }); await p.mouse.up();
await p.waitForTimeout(350);
console.log("  dratt: ", JSON.stringify(await les()));
console.log("  konsollfeil:", feil.length ? feil.join(" | ") : "ingen");
await b.close();
