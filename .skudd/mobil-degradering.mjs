import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const [navn, opts] of [["normalt", {}], ["redusert", { reducedMotion: "reduce" }], ["uten JS", { javaScriptEnabled: false }]]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...opts });
  const p = await ctx.newPage();
  let usynlig = 0, klippet = 0;
  for (const s of sider) {
    await p.goto(base + s, { waitUntil: "networkidle" });
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(40); }
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      let u = 0, k = 0;
      const scr = (el) => { let c = el.parentElement; while (c && c !== document.documentElement) { const cs = getComputedStyle(c); if (/(auto|scroll)/.test(cs.overflowX) && c.scrollWidth > c.clientWidth + 1) return true; c = c.parentElement; } return false; };
      for (const el of document.querySelectorAll(".avslor, .avslor *")) {
        const q = el.getBoundingClientRect();
        if (q.top > innerHeight || q.bottom < 0 || q.height < 1) continue;
        if (+getComputedStyle(el).opacity < 0.05) u++;
      }
      for (const el of document.querySelectorAll("body *")) {
        if (el.children.length) continue;
        const q = el.getBoundingClientRect();
        if (q.width > 0 && q.right > 392 && !scr(el)) k++;
      }
      return { u, k };
    });
    usynlig += r.u; klippet += r.k;
  }
  console.log(`  ${navn.padEnd(9)} usynlige: ${usynlig}  klippet: ${klippet}`);
  await ctx.close();
}
await b.close();
