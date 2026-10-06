import { chromium } from "playwright";
const b = await chromium.launch();
for (const rm of ["no-preference", "reduce"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: rm });
  await p.goto("http://127.0.0.1:4463/systemer", { waitUntil: "networkidle" });
  const ut = [];
  for (const y of [0, 900, 1400, 1900, 2600]) {
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(220);
    const v = await p.evaluate(() => {
      const sc = [...document.querySelectorAll(".scene")];
      return sc.map((s) => {
        const t = getComputedStyle(s, "::before").transform;
        if (t === "none") return 1;
        const m = t.match(/matrix\(([-\d.]+)/);
        return m ? +(+m[1]).toFixed(2) : 1;
      });
    });
    ut.push(`y${y}:[${v.join(" ")}]`);
  }
  console.log(rm.padEnd(14), ut.join("  "));
  await p.close();
}
await b.close();
