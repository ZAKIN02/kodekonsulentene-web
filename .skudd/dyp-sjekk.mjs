import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const merke of ["normal", "redusert", "utenJS"]) {
  for (const s of sider) {
    const ctx = await b.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: merke === "redusert" ? "reduce" : "no-preference",
      javaScriptEnabled: merke !== "utenJS",
    });
    const p = await ctx.newPage();
    await p.goto(base + s, { waitUntil: merke === "utenJS" ? "load" : "networkidle" });
    const r = await p.evaluate(() => {
      const usynlig = [...document.querySelectorAll("h1,h2,h3,p,li,figure")]
        .filter((e) => e.textContent.trim() && getComputedStyle(e).opacity === "0").length;
      return { tekst: document.body.innerText.trim().length, usynlig };
    });
    console.log(`  ${merke.padEnd(9)} ${s.padEnd(10)} tegn ${String(r.tekst).padStart(5)}  usynlige ${r.usynlig}`);
    await ctx.close();
  }
}
await b.close();
