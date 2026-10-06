import { chromium } from "playwright";
const [url, idx, ut] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const el = p.locator(".demo").nth(+idx);
await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
const v = el.locator("video");
const bilder = [];
for (const f of [0.1, 0.4, 0.7, 0.95]) {
  await p.evaluate(([fr]) => { const vid = document.querySelectorAll(".demo video")[0]; if (vid?.duration) vid.currentTime = vid.duration * fr; }, [f]);
  await p.waitForTimeout(500);
  const s = `/tmp/d-${f}.png`; await el.screenshot({ path: s }); bilder.push(s);
}
console.log("  rammer:", bilder.join(" "));
await b.close();
