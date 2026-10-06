import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const [sti, sel] of [["/historie", ".hist__media"], ["/", ".hist__media"]]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: "dark" });
  await p.goto("http://127.0.0.1:8080" + sti, { waitUntil: "networkidle" }).catch(()=>{});
  await p.waitForTimeout(1500);
  const d = await p.evaluate((sel) => {
    const m = document.querySelector(sel);
    const ut = { scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth };
    if (m) { window.scrollTo(0, 1500); ut.posisjon = getComputedStyle(m).position; }
    return ut;
  }, sel);
  await p.waitForTimeout(400);
  const topp = await p.evaluate((sel) => { const m=document.querySelector(sel); return m ? Math.round(m.getBoundingClientRect().top) : null; }, sel);
  console.log(sti, JSON.stringify({ ...d, stickyTopp: topp }));
  await p.close();
}
await b.close();
