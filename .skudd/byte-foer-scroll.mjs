import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const s of sider) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  let byte = 0;
  p.on("response", (r) => { const l = +(r.headers()["content-length"] || 0); byte += l; });
  await p.goto(base + s, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  console.log(`  ${s.padEnd(12)} ${Math.round(byte / 1024)} kB foer scroll`);
  await c.close();
}
await b.close();
