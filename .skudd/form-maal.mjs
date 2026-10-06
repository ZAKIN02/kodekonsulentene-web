import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const s of sider) {
  for (const tema of ["dark", "light"]) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema });
    const p = await c.newPage();
    await p.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
        .observe({ type: "layout-shift", buffered: true });
    });
    await p.goto(base + s, { waitUntil: "networkidle" });
    if (tema === "light") await p.evaluate(() => (document.documentElement.dataset.theme = "light"));
    // scroll gjennom, saa sticky-menyen og alle kort faar vist seg
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(80); }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const smaa = [];
      for (const el of document.querySelectorAll("a,button,input,summary,select,[role=button]")) {
        const q = el.getBoundingClientRect();
        if (q.width < 1 || q.height < 1) continue;
        const forelder = el.parentElement?.textContent?.trim() ?? "";
        const egen = el.textContent?.trim() ?? "";
        const iSetning = forelder.length > egen.length + 12; // unntatt etter WCAG 2.5.8
        if ((q.height < 24 || q.width < 24) && !iSetning) smaa.push(`${el.tagName} ${Math.round(q.width)}x${Math.round(q.height)} «${egen.slice(0,18)}»`);
      }
      return { cls: +(window.__cls ?? 0).toFixed(4), smaa: [...new Set(smaa)].slice(0, 4) };
    });
    console.log(`  ${s.padEnd(12)} ${tema.padEnd(5)} CLS ${r.cls}  ${r.smaa.length ? "SMÅ: " + r.smaa.join(" | ") : "trykkmål ok"}`);
    await c.close();
  }
}
await b.close();
