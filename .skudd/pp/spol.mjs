import { chromium } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
for (const [side, velger] of [["/", "[data-scenefilm-video]"], ["/systemer", "[data-scenefilm-video]"], ["/historie", "[data-story-video]"]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const feil = []; p.on("console", m => m.type() === "error" && feil.push(m.text()));
  await p.goto(base + side, { waitUntil: "networkidle" });
  // Scroll gjennom hele siden saa IntersectionObserver rekker aa laste.
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } });
  await p.waitForTimeout(2500);
  const r = await p.evaluate((v) => {
    const el = document.querySelector(v); if (!el) return { feil: "fant ikke video" };
    return { src: (el.currentSrc || "").split("/").pop(), readyState: el.readyState,
             seekable: el.seekable.length ? +el.seekable.end(0).toFixed(2) : 0,
             varighet: +(el.duration || 0).toFixed(2), tid: +el.currentTime.toFixed(2) };
  }, velger);
  console.log(`  ${side.padEnd(11)} ${JSON.stringify(r)}  konsollfeil: ${feil.length}`);
  await p.close();
}
await b.close();
