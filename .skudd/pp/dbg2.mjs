import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const r = await p.evaluate(async () => {
  const el = document.querySelector("[data-scenefilm]");
  el.scrollIntoView({ block: "center" });
  const v = el.querySelector("video");
  await new Promise((r) => (v.readyState >= 2 ? r() : v.addEventListener("loadeddata", r, { once: true })));
  v.currentTime = v.duration * 0.6;
  await new Promise((r) => setTimeout(r, 400));
  const c = document.createElement("canvas"); c.width = 160; c.height = 90;
  c.getContext("2d").drawImage(v, 0, 0, 160, 90);
  const d = c.getContext("2d").getImageData(0, 0, 160, 90).data;
  const kol = new Array(160).fill(0);
  let total = 0;
  for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) {
    const i = (y*160+x)*4; const lys = (d[i]+d[i+1]+d[i+2])/3;
    if (lys >= 45) { kol[x]++; total++; }
  }
  return { tid: v.currentTime, varighet: v.duration, readyState: v.readyState, total,
           png: c.toDataURL("image/png"), kol };
});
console.log(`  tid ${r.tid.toFixed(2)}/${r.varighet.toFixed(2)}  readyState ${r.readyState}  lyse piksler ${r.total}`);
const tung = r.kol.map((v,i)=>[i,v]).filter(([,v])=>v>0);
console.log(`  blekk fra ${(tung[0][0]/160*100).toFixed(1)}% til ${(tung[tung.length-1][0]/160*100).toFixed(1)}%`);
writeFileSync(".skudd/pp/dbg-canvas.png", Buffer.from(r.png.split(",")[1], "base64"));
await b.close();
