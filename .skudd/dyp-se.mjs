/**
 * Fullsides-skudd sydd av EKTE visningsbilder.
 *
 * fullPage duger ikke her: scroll-avdekkingen bruker animation-timeline: view(),
 * som er scroll-KOBLET og ikke en engangsanimasjon. Scroller man tilbake til
 * toppen, settes elementene tilbake til opacity 0, og fullPage fotograferer da
 * en side full av tomrom som ser ut som ødelagte seksjoner. Det er en målefeil,
 * ikke en sidefeil – den har blitt meldt som ekte funn her før.
 */
import { chromium } from "playwright";
import sharp from "sharp";
const [base, merke, ...sider] = process.argv.slice(2);
const B = 1440, H = 900;
const b = await chromium.launch();
for (const s of sider) {
  const p = await b.newPage({ viewport: { width: B, height: H } });
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  await p.goto(base + s, { waitUntil: "networkidle" });
  const total = await p.evaluate(() => document.body.scrollHeight);
  const biter = [];
  for (let y = 0; y < total; y += H) {
    await p.evaluate((yy) => scrollTo(0, yy), y);
    await p.waitForTimeout(260);
    biter.push({ input: await p.screenshot(), top: Math.min(y, total - H), left: 0 });
  }
  const navn = (merke + (s.replace(/\//g, "-") || "-forside")) + ".png";
  await sharp({ create: { width: B, height: total, channels: 3, background: "#fff" } })
    .composite(biter).png().toFile(`.skudd/dyp/${navn}`);
  console.log(`  ${s}: ${total}px, ${biter.length} biter, konsollfeil ${feil.length || "ingen"}`);
  await p.close();
}
await b.close();
