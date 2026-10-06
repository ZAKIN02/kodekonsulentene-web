import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
const px = async (merke) => {
  const png = await p.locator(".teaser").screenshot();
  const im = PNG.sync.read(png);
  const i = (im.width * 264 + 513) << 2;
  console.log("%-18s rgb(%d,%d,%d)", merke, im.data[i], im.data[i+1], im.data[i+2]);
};
await p.evaluate(() => { document.querySelector(".teaser__tekst").style.visibility = "hidden"; });
await px("med slør");
await p.evaluate(() => { document.querySelector(".teaser__slor").style.display = "none"; });
await px("uten slør");
await p.evaluate(() => {
  const s = document.querySelector(".teaser__slor");
  s.style.display = ""; s.style.background = "rgb(255 0 0 / 1)";
});
await px("slør = rødt");
await b.close();
