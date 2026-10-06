/** Hvor mye av bevegelsen ligger i den SYNLIGE delen? Maskens kant leses fra
 *  --maske, og vi sammenligner to rammer tegnet til canvas. */
import { chromium } from "playwright";
const [url, idx] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const r = await p.evaluate(async ([i]) => {
  const el = document.querySelectorAll("[data-scenefilm]")[+i];
  el.scrollIntoView({ block: "center" });
  const v = el.querySelector("video");
  await new Promise((r) => (v.readyState >= 2 ? r() : v.addEventListener("loadeddata", r, { once: true })));
  const W = 200, H = 112, c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  const ta = async (t) => { v.currentTime = t; await new Promise((r) => setTimeout(r, 420));
    g.drawImage(v, 0, 0, W, H); return g.getImageData(0, 0, W, H).data; };
  const a = await ta(v.duration * 0.15), d2 = await ta(v.duration * 0.75);
  const maske = parseFloat(getComputedStyle(el).getPropertyValue("--maske")) || 46;
  const vendt = el.hasAttribute("data-vend");
  let synlig = 0, skjult = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = (y * W + x) * 4;
    const e = Math.abs(a[k] - d2[k]) + Math.abs(a[k+1] - d2[k+1]) + Math.abs(a[k+2] - d2[k+2]);
    const pst = vendt ? 100 - (x / W) * 100 : (x / W) * 100;
    (pst < maske ? (skjult += e) : (synlig += e));
  }
  return { maske, vendt, andelSynlig: Math.round((synlig / (synlig + skjult || 1)) * 100) };
}, [idx]);
console.log(`  maske ${r.maske}%  vendt:${r.vendt}  ->  ${r.andelSynlig}% av bevegelsen er SYNLIG`);
await b.close();
