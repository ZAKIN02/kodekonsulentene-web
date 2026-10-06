/** Samme maaling med og uten aapningen, ellers identiske forhold.
 *  Aapningen slaas av ved aa sette sessionStorage FOER siden lastes. */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch();
for (const medApning of [false, true]) {
  let sum = [];
  for (let run = 0; run < 3; run++) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    if (!medApning) await p.addInitScript(() => { try { sessionStorage.setItem("kk-apning", "1"); } catch (e) {} });
    await p.goto("http://127.0.0.1:4861/", { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa"]).analyze();
    sum.push(r.violations.filter(v => v.id === "color-contrast").reduce((n, v) => n + v.nodes.length, 0));
    await c.close();
  }
  console.log(`  ${medApning ? "MED aapning " : "UTEN aapning"}  kontrastnoder per kjoering: ${sum.join(", ")}`);
}
await b.close();
