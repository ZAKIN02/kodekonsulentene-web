/** Ruller hver video inn i synsfeltet og ser om den FAKTISK spiller.
 *  Maaler ogsaa effektiv opasitet og hvor mange byte som ble lastet.
 *  Bruk: node .skudd/syn-video.mjs <url> <navn> [bredde] [hoyde]
 */
import { chromium } from "playwright";
const [url, navn, bRaa = "1440", hRaa = "900"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +bRaa, height: +hRaa } });
const bytes = new Map();
p.on("response", async (r) => {
  const u = r.url();
  if (/\.(mp4|webm|mov)/.test(u)) {
    const l = +(r.headers()["content-length"] || 0);
    bytes.set(u.split("/").slice(-1)[0], (bytes.get(u.split("/").slice(-1)[0]) || 0) + l);
  }
});
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(2000);
const n = await p.evaluate(() => document.querySelectorAll("video").length);
const ut = [];
for (let i = 0; i < n; i++) {
  await p.evaluate((k) => {
    const v = document.querySelectorAll("video")[k];
    v.scrollIntoView({ block: "center", behavior: "instant" });
  }, i);
  await p.waitForTimeout(2200);
  const t1 = await p.evaluate((k) => document.querySelectorAll("video")[k].currentTime, i);
  await p.waitForTimeout(2500);
  const d = await p.evaluate((k) => {
    const v = document.querySelectorAll("video")[k];
    let op = 1; for (let x = v; x; x = x.parentElement) op *= +getComputedStyle(x).opacity;
    const r = v.getBoundingClientRect();
    const st = getComputedStyle(v);
    return {
      fil: (v.currentSrc || "").split("/").slice(-1)[0],
      stort: `${Math.round(r.width)}x${Math.round(r.height)}`,
      opasitet: +op.toFixed(3), blend: st.mixBlendMode, filter: st.filter,
      paused: v.paused, tid: +v.currentTime.toFixed(2), varighet: v.duration ? +v.duration.toFixed(1) : null,
      ended: v.ended, muted: v.muted, loop: v.loop, autoplay: v.autoplay, preload: v.preload,
      readyState: v.readyState, nettverk: v.networkState,
      // Ligger det tekst OPPAA videoen?
      tekstOver: (() => {
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return el && el !== v ? `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}`.slice(0, 40) : null;
      })(),
    };
  }, i);
  ut.push({ ...d, tidFoer: +t1.toFixed(2), spilteIlopetAv2_5s: +(d.tid - t1).toFixed(2) });
}
console.log(JSON.stringify({ navn, bredde: bRaa, videoer: ut, lastetKB: [...bytes].map(([f, b]) => `${f}:${Math.round(b / 1024)}`) }));
await b.close();
