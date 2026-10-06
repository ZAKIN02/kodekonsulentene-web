import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
const tunge = [];
p.on("response", (r) => { const l = +(r.headers()["content-length"] || 0);
  if (l > 60000) tunge.push([Math.round(l/1024), r.url().replace(/^https?:\/\/[^/]+/, "")]); });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
tunge.sort((a,b2)=>b2[0]-a[0]);
for (const [kb, u] of tunge.slice(0, 6)) console.log(`  ${String(kb).padStart(5)} kB  ${u}`);
// Hvor ligger mediene i forhold til folden?
const pos = await p.evaluate(() => [...document.querySelectorAll("video")].map((v) => {
  const r = v.getBoundingClientRect();
  return { topp: Math.round(r.top + scrollY), kilde: (v.querySelector("source")?.getAttribute("data-smal") || v.currentSrc || "").split("/").pop() };
}));
for (const x of pos) console.log(`  video «${x.kilde}» topp ${x.topp}px  ${x.topp < 844 ? "OVER folden" : "under folden"}`);
await b.close();
