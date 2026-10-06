/** Teller elementer som FAKTISK har en animasjon.
 *  getComputedStyle().animationTimeline leser «auto» selv når view() er satt –
 *  den fellen ga en agent «0 bevegelse» på en side som beveget seg. Les animationName. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const n = await p.evaluate(() =>
    [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).animationName !== "none").length);
  console.log(`  ${s.padEnd(12)} ${n} elementer med animasjon`);
}
await b.close();
