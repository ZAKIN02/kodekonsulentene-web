import { chromium, firefox } from "playwright";
const url = process.argv[2];
async function maal(navn, lagCtx) {
  const { b, ctx } = await lagCtx();
  const p = await ctx.newPage();
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelector(".flyt__ramme")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const off = (s) => [...document.querySelectorAll(s)].map((e) => +(+getComputedStyle(e).strokeDashoffset.replace("px", "")).toFixed(2));
    const op = (s) => [...document.querySelectorAll(s)].map((e) => +(+getComputedStyle(e).opacity).toFixed(2));
    const liste = document.querySelector(".flyt__liste");
    return {
      boksMax: Math.max(...off(".flyt__boks")),
      linjeMax: Math.max(...off(".flyt__linje")),
      navnMin: Math.min(...op(".flyt__navn")),
      detaljMin: Math.min(...op(".flyt__detalj")),
      stotter: CSS.supports("animation-timeline: view()"),
      listeIDom: !!liste,
      listeTekst: liste ? liste.textContent.replace(/\s+/g, " ").trim().slice(0, 58) : "",
    };
  });
  console.log(`  ${navn.padEnd(26)} view()=${String(r.stotter).padEnd(5)} boks-rest ${r.boksMax}  linje-rest ${r.linjeMax}  navn ${r.navnMin}  detalj ${r.detaljMin}  liste:${r.listeIDom}`);
  if (navn.startsWith("uten JS")) console.log(`     lista sier: "${r.listeTekst}…"`);
  if (feil.length) console.log("     konsollfeil:", feil.join(" | "));
  await b.close();
}
await maal("Chromium, normalt", async () => { const b = await chromium.launch(); return { b, ctx: await b.newContext({ viewport: { width: 1440, height: 900 } }) }; });
await maal("Chromium, redusert bev.", async () => { const b = await chromium.launch(); return { b, ctx: await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }) }; });
await maal("uten JS", async () => { const b = await chromium.launch(); return { b, ctx: await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }) }; });
try {
  await maal("Firefox (mangler view())", async () => { const b = await firefox.launch(); return { b, ctx: await b.newContext({ viewport: { width: 1440, height: 900 } }) }; });
} catch (e) { console.log("  Firefox:", String(e).split("\n")[0]); }
