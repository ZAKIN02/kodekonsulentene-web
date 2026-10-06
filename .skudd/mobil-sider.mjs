import { chromium } from "playwright";
const b = await chromium.launch();
for (const sti of ["/status", "/handbok", "/personvern", "/vilkar", "/kontakt", "/finnes-ikke"]) {
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: "reduce" })).newPage();
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  p.on("requestfailed", (r) => feil.push(`FEILET ${r.url().split("/").pop()}`));
  await p.goto("http://127.0.0.1:4441" + sti, { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    drag: document.documentElement.scrollWidth > document.documentElement.clientWidth
      ? `${document.documentElement.scrollWidth} > ${document.documentElement.clientWidth}` : "nei",
    h1: document.querySelectorAll("h1").length,
    bilder: [...document.querySelectorAll("img")].filter(i => !i.src.includes("logo") && !i.currentSrc.includes("kk-")).map(i => ({
      f: i.currentSrc.split("/").pop(), lastet: i.naturalWidth > 0, altLengde: i.alt.length })),
  }));
  console.log(`${sti.padEnd(14)} drag:${String(r.drag).padEnd(6)} h1:${r.h1}  bilder:${JSON.stringify(r.bilder)}  feil:${feil.length||"ingen"}`);
  await p.close();
}
await b.close();
