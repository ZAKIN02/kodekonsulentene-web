import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 }, colorScheme: "dark" });
for (const s of ["/verktoy/dmarc", "/verktoy/priskalkulator", "/verktoy/uu-sjekk"]) {
  await p.goto("http://127.0.0.1:4525" + s, { waitUntil: "networkidle" });
  const v = await p.$("video");
  if (!v) { console.log(`  ${s.padEnd(26)} ingen videoelement`); continue; }
  await v.scrollIntoViewIfNeeded();
  await p.waitForTimeout(2500);
  console.log(`  ${s.padEnd(26)}`, JSON.stringify(await v.evaluate((e) => ({
    src: (e.currentSrc || "(ingen)").split("/").pop(),
    rs: e.readyState,
    seek: e.seekable.length ? +e.seekable.end(0).toFixed(1) : 0,
  }))));
}
await b.close();
