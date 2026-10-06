import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".teaser").scrollIntoView({ block: "center" }));
await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(async () => {
  const v = document.querySelector(".teaser video");
  const ut = { seekableLengde: v.seekable.length, slutt: v.seekable.length ? v.seekable.end(0) : null };
  v.currentTime = 5;                       // sett direkte
  await new Promise((r) => setTimeout(r, 400));
  ut.etterDirekte = v.currentTime;
  window.scrollBy(0, 120);                 // utløs scroll-lytteren
  await new Promise((r) => setTimeout(r, 500));
  ut.etterScroll = v.currentTime;
  return ut;
}), null, 1));
await b.close();
