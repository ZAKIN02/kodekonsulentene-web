import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const usynlig = await p.evaluate(() => {
    let n = 0;
    for (const e of document.querySelectorAll(".avslor, .avslor *")) {
      const r = e.getBoundingClientRect();
      if (r.top < 900 && r.bottom > 0 && +getComputedStyle(e).opacity < 0.05) n++;
    }
    return n;
  });
  console.log(`  ${s.padEnd(12)} ${usynlig} usynlige elementer over folden`);
}
await b.close();
