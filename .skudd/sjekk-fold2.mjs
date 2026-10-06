/** Opasitet ved innlasting på ALLE sider, uten scroll. Min forrige kontroll
 *  målte bare fem sider og gikk glipp av et skjema på 0,56. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
let verst = [];
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const d = await p.evaluate(() => {
    let min = 1, hva = "";
    for (const e of document.querySelectorAll(".avslor")) {
      const r = e.getBoundingClientRect();
      if (r.top > 900 || r.bottom < 0) continue;
      const o = +getComputedStyle(e).opacity;
      if (o < min) { min = o; hva = (e.textContent || "").trim().slice(0, 40); }
    }
    return { min, hva };
  });
  if (d.min < 0.95) { console.log(`  ${s.padEnd(26)} opasitet ${d.min}  «${d.hva}»`); verst.push(s); }
}
console.log(verst.length ? `  ${verst.length} sider med usynlig innhold over folden` : "  ingen");
await b.close();
